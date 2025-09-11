import { supabase } from '../lib/supabase'

// Interfaces para o sistema de rate limiting
interface RateLimitConfig {
  windowMs: number // Janela de tempo em millisegundos
  maxRequests: number // Máximo de requisições por janela
  skipSuccessfulRequests?: boolean // Pular requisições bem-sucedidas
  keyGenerator?: (identifier: string) => string // Gerador de chave personalizado
}

interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
}

// Cache em memória para performance
class MemoryCache {
  private cache = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Limpeza automática a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  get(key: string): RateLimitEntry | undefined {
    const entry = this.cache.get(key)
    if (entry && Date.now() > entry.resetTime) {
      this.cache.delete(key)
      return undefined
    }
    return entry
  }

  set(key: string, entry: RateLimitEntry): void {
    this.cache.set(key, entry)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now > entry.resetTime) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// Serviço principal de rate limiting
export class RateLimitService {
  private memoryCache: MemoryCache
  private defaultConfig: RateLimitConfig

  constructor() {
    this.memoryCache = new MemoryCache()
    this.defaultConfig = {
      windowMs: 900000, // 15 minutos
      maxRequests: 100,
      skipSuccessfulRequests: false
    }
  }

  /**
   * Verifica se uma requisição está dentro do limite
   */
  async checkLimit(
    identifier: string,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const key = finalConfig.keyGenerator ? finalConfig.keyGenerator(identifier) : `rate_limit:${identifier}`
    
    const now = Date.now()
    const windowStart = now - finalConfig.windowMs

    try {
      // Primeiro, tenta buscar do cache em memória
      let entry = this.memoryCache.get(key)

      if (!entry) {
        // Se não estiver no cache, busca do banco de dados
        entry = await this.getFromDatabase(key, windowStart)
      }

      // Se não existe entrada, cria uma nova
      if (!entry) {
        entry = {
          count: 1,
          resetTime: now + finalConfig.windowMs,
          firstRequest: now
        }
      } else {
        // Incrementa o contador
        entry.count += 1
      }

      // Atualiza cache e banco de dados
      this.memoryCache.set(key, entry)
      await this.saveToDatabase(key, entry)

      const allowed = entry.count <= finalConfig.maxRequests
      const remaining = Math.max(0, finalConfig.maxRequests - entry.count)

      return {
        allowed,
        remaining,
        resetTime: entry.resetTime,
        totalHits: entry.count
      }
    } catch (error) {
      console.error('Erro no rate limiting:', error)
      // Em caso de erro, permite a requisição para não bloquear o sistema
      return {
        allowed: true,
        remaining: finalConfig.maxRequests,
        resetTime: now + finalConfig.windowMs,
        totalHits: 1
      }
    }
  }

  /**
   * Reseta o limite para um identificador específico
   */
  async resetLimit(identifier: string): Promise<void> {
    const key = `rate_limit:${identifier}`
    
    try {
      this.memoryCache.delete(key)
      await this.deleteFromDatabase(key)
    } catch (error) {
      console.error('Erro ao resetar rate limit:', error)
    }
  }

  /**
   * Obtém estatísticas do rate limiting
   */
  async getStats(): Promise<{
    cacheSize: number
    activeKeys: string[]
    totalRequests: number
  }> {
    try {
      const { data: dbStats } = await supabase
        .from('rate_limits')
        .select('key, count')
        .gte('reset_time', Date.now())

      const totalRequests = dbStats?.reduce((sum, entry) => sum + entry.count, 0) || 0

      return {
        cacheSize: this.memoryCache.size(),
        activeKeys: this.memoryCache.keys(),
        totalRequests
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      return {
        cacheSize: this.memoryCache.size(),
        activeKeys: this.memoryCache.keys(),
        totalRequests: 0
      }
    }
  }

  /**
   * Limpa entradas expiradas do banco de dados
   */
  async cleanup(): Promise<void> {
    try {
      await supabase
        .from('rate_limits')
        .delete()
        .lt('reset_time', Date.now())
    } catch (error) {
      console.error('Erro na limpeza do rate limit:', error)
    }
  }

  /**
   * Middleware para Express/Fastify
   */
  middleware(config?: Partial<RateLimitConfig>) {
    return async (req: any, res: any, next: any) => {
      const identifier = req.ip || req.connection.remoteAddress || 'unknown'
      const result = await this.checkLimit(identifier, config)

      // Adiciona headers de rate limit
      res.setHeader('X-RateLimit-Limit', config?.maxRequests || this.defaultConfig.maxRequests)
      res.setHeader('X-RateLimit-Remaining', result.remaining)
      res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        })
      }

      next()
    }
  }

  /**
   * Hook para React/Vue
   */
  useRateLimit(identifier: string, config?: Partial<RateLimitConfig>) {
    return {
      checkLimit: () => this.checkLimit(identifier, config),
      resetLimit: () => this.resetLimit(identifier)
    }
  }

  // Métodos privados para interação com banco de dados
  private async getFromDatabase(key: string, windowStart: number): Promise<RateLimitEntry | undefined> {
    try {
      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('key', key)
        .gte('reset_time', Date.now())
        .single()

      if (error || !data) return undefined

      return {
        count: data.count,
        resetTime: data.reset_time,
        firstRequest: data.first_request
      }
    } catch (error) {
      console.error('Erro ao buscar do banco:', error)
      return undefined
    }
  }

  private async saveToDatabase(key: string, entry: RateLimitEntry): Promise<void> {
    try {
      await supabase
        .from('rate_limits')
        .upsert({
          key,
          count: entry.count,
          reset_time: entry.resetTime,
          first_request: entry.firstRequest,
          updated_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Erro ao salvar no banco:', error)
    }
  }

  private async deleteFromDatabase(key: string): Promise<void> {
    try {
      await supabase
        .from('rate_limits')
        .delete()
        .eq('key', key)
    } catch (error) {
      console.error('Erro ao deletar do banco:', error)
    }
  }

  /**
   * Destrói o serviço e limpa recursos
   */
  destroy(): void {
    this.memoryCache.destroy()
  }
}

// Instância singleton
export const rateLimitService = new RateLimitService()

// Configurações pré-definidas para diferentes tipos de endpoints
export const RateLimitConfigs = {
  // API geral
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100
  },
  
  // Login/autenticação
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
    skipSuccessfulRequests: false
  },
  
  // Upload de arquivos
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10
  },
  
  // Gemini AI
  ai: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 50
  },
  
  // Webhooks
  webhook: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 1000
  },
  
  // Strict para operações sensíveis
  strict: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3
  }
}

// Utilitários
export const RateLimitUtils = {
  /**
   * Gera chave baseada em usuário
   */
  userKey: (userId: string) => `user:${userId}`,
  
  /**
   * Gera chave baseada em IP
   */
  ipKey: (ip: string) => `ip:${ip}`,
  
  /**
   * Gera chave baseada em endpoint
   */
  endpointKey: (endpoint: string, identifier: string) => `${endpoint}:${identifier}`,
  
  /**
   * Converte segundos para millisegundos
   */
  seconds: (s: number) => s * 1000,
  
  /**
   * Converte minutos para millisegundos
   */
  minutes: (m: number) => m * 60 * 1000,
  
  /**
   * Converte horas para millisegundos
   */
  hours: (h: number) => h * 60 * 60 * 1000
}