// Mock do Advanced Rate Limit Service para evitar dependências do Redis no frontend

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: any) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
}

export class AdvancedRateLimitService {
  private configs: Map<string, RateLimitConfig> = new Map()
  private initialized: boolean = false

  async initialize(config?: any): Promise<void> {
    this.initialized = true
    console.log('[MOCK] AdvancedRateLimitService initialized')
  }

  isInitialized(): boolean {
    return this.initialized
  }

  async cleanup(): Promise<void> {
    this.configs.clear()
    this.initialized = false
    console.log('[MOCK] AdvancedRateLimitService cleaned up')
  }

  async healthCheck(): Promise<{ status: string; details?: any }> {
    return {
      status: 'healthy',
      details: {
        initialized: this.initialized,
        configsCount: this.configs.size
      }
    }
  }

  createRateLimit(name: string, config: RateLimitConfig): void {
    this.configs.set(name, config)
    console.log(`[MOCK] Rate limit '${name}' created`)
  }

  async checkRateLimit(name: string, key: string): Promise<RateLimitResult> {
    const config = this.configs.get(name)
    if (!config) {
      throw new Error(`Rate limit configuration '${name}' not found`)
    }

    // Mock sempre permite as requisições
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: Date.now() + config.windowMs,
      totalHits: 1
    }
  }

  async resetRateLimit(name: string, key: string): Promise<void> {
    console.log(`[MOCK] Rate limit reset for '${name}' with key '${key}'`)
  }

  async getRateLimitStatus(name: string, key: string): Promise<RateLimitResult | null> {
    const config = this.configs.get(name)
    if (!config) return null

    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
      totalHits: 0
    }
  }

  getConfigurations(): Map<string, RateLimitConfig> {
    return new Map(this.configs)
  }

  removeRateLimit(name: string): boolean {
    const removed = this.configs.delete(name)
    if (removed) {
      console.log(`[MOCK] Rate limit '${name}' removed`)
    }
    return removed
  }
}

// Instância singleton
export const advancedRateLimitService = new AdvancedRateLimitService()

// Export default
export default advancedRateLimitService