import { supabase } from '../lib/supabase'
import { User } from '../stores/useAppStore'

interface SecurityConfig {
  jwtSecret: string
  sessionTimeout: number
  passwordMinLength: number
  twoFactorEnabled: boolean
  rateLimitPerMinute: number
  apiTimeout: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface SecurityEvent {
  id: string
  user_id: string
  event_type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access'
  ip_address: string
  user_agent: string
  details: Record<string, any>
  created_at: string
}

class SecurityService {
  private rateLimitMap = new Map<string, RateLimitEntry>()
  private securityConfig: SecurityConfig = {
    jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
    sessionTimeout: 86400,
    passwordMinLength: 8,
    twoFactorEnabled: false,
    rateLimitPerMinute: 100,
    apiTimeout: 30000
  }

  constructor() {
    this.initializeSecurityConfig()
  }

  // Inicializa configurações de segurança a partir de variáveis de ambiente
  private initializeSecurityConfig() {
    this.securityConfig = {
      jwtSecret: process.env.VITE_JWT_SECRET || this.generateFallbackSecret(),
      sessionTimeout: parseInt(process.env.VITE_SESSION_TIMEOUT || '86400'), // 24 horas padrão
      passwordMinLength: parseInt(process.env.VITE_PASSWORD_MIN_LENGTH || '8'),
      twoFactorEnabled: process.env.VITE_TWO_FACTOR_ENABLED === 'true',
      rateLimitPerMinute: parseInt(process.env.VITE_RATE_LIMIT_PER_MINUTE || '100'),
      apiTimeout: parseInt(process.env.VITE_API_TIMEOUT || '30000')
    }

    // Validar configurações críticas
    this.validateSecurityConfig()
  }

  // Gera uma chave secreta de fallback (não recomendado para produção)
  private generateFallbackSecret(): string {
    console.warn('⚠️ AVISO: Usando chave JWT de fallback. Configure VITE_JWT_SECRET para produção!')
    return `fallback_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  // Valida configurações de segurança
  private validateSecurityConfig() {
    const errors: string[] = []

    if (!this.securityConfig.jwtSecret || this.securityConfig.jwtSecret.length < 32) {
      errors.push('JWT Secret deve ter pelo menos 32 caracteres')
    }

    if (this.securityConfig.sessionTimeout < 300) { // 5 minutos mínimo
      errors.push('Session timeout deve ser pelo menos 300 segundos (5 minutos)')
    }

    if (this.securityConfig.passwordMinLength < 6) {
      errors.push('Password min length deve ser pelo menos 6 caracteres')
    }

    if (this.securityConfig.rateLimitPerMinute < 1) {
      errors.push('Rate limit deve ser pelo menos 1 por minuto')
    }

    if (errors.length > 0) {
      console.error('❌ Erros na configuração de segurança:', errors)
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Configuração de segurança inválida: ${errors.join(', ')}`)
      }
    }

    console.log('🔒 Configurações de segurança inicializadas:', {
      sessionTimeout: this.securityConfig.sessionTimeout,
      passwordMinLength: this.securityConfig.passwordMinLength,
      twoFactorEnabled: this.securityConfig.twoFactorEnabled,
      rateLimitPerMinute: this.securityConfig.rateLimitPerMinute,
      apiTimeout: this.securityConfig.apiTimeout
    })
  }

  // Obtém configurações de segurança (sem expor dados sensíveis)
  getSecurityConfig(): Omit<SecurityConfig, 'jwtSecret'> {
    const { jwtSecret, ...safeConfig } = this.securityConfig
    return safeConfig
  }

  // Configurar configurações de segurança
  updateSecurityConfig(config: Partial<SecurityConfig>) {
    this.securityConfig = { ...this.securityConfig, ...config }
  }

  // Validar força da senha
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < this.securityConfig.passwordMinLength) {
      errors.push(`Senha deve ter pelo menos ${this.securityConfig.passwordMinLength} caracteres`)
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Rate limiting por IP/usuário
  checkRateLimit(identifier: string): boolean {
    const now = Date.now()
    const entry = this.rateLimitMap.get(identifier)
    
    if (!entry) {
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + 60000 // 1 minuto
      })
      return true
    }
    
    if (now > entry.resetTime) {
      // Reset do contador
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + 60000
      })
      return true
    }
    
    if (entry.count >= this.securityConfig.rateLimitPerMinute) {
      return false
    }
    
    entry.count++
    return true
  }

  // Validar sessão do usuário
  async validateSession(userId: string): Promise<{ isValid: boolean; user?: User }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.log('Erro ao obter sessão:', error)
        return { isValid: false }
      }
      
      if (!session) {
        console.log('Nenhuma sessão ativa encontrada')
        return { isValid: false }
      }
      
      // Verificar se a sessão não expirou usando expires_at do Supabase
      const now = Math.floor(Date.now() / 1000)
      if (session.expires_at && session.expires_at < now) {
        console.log('Sessão expirou pelo Supabase')
        await supabase.auth.signOut()
        return { isValid: false }
      }
      
      // Verificar se o userId corresponde ao usuário da sessão
      if (session.user.id !== userId) {
        console.log('ID do usuário não corresponde à sessão')
        return { isValid: false }
      }
      
      // Buscar dados do usuário
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (profileError) {
        console.log('Erro ao buscar perfil do usuário:', profileError)
        // Se não conseguir buscar o perfil, mas a sessão é válida, 
        // usar dados básicos do usuário da sessão
        if (session.user) {
          return {
            isValid: true,
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
              role: session.user.user_metadata?.role || 'user',
              permissions: session.user.user_metadata?.permissions || [],
              hasCompletedOnboarding: session.user.user_metadata?.hasCompletedOnboarding || false
            } as User
          }
        }
        return { isValid: false }
      }
      
      return {
        isValid: true,
        user: profile
      }
    } catch (error) {
      console.error('Erro ao validar sessão:', error)
      return { isValid: false }
    }
  }

  // Verificar permissões de usuário
  hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false
    
    // Super admin tem todas as permissões
    if (user.role === 'super_admin') return true
    
    // Verificar permissões específicas
    return user.permissions?.includes(permission) || false
  }

  // Verificar se é admin
  isAdmin(user: User | null): boolean {
    return user?.role === 'admin' || user?.role === 'super_admin'
  }

  // Verificar acesso a rotas administrativas
  canAccessAdminRoute(user: User | null, route: string): boolean {
    if (!this.isAdmin(user)) return false
    
    const adminRoutes = {
      '/admin': ['admin', 'super_admin'],
      '/admin/users': ['super_admin'],
      '/admin/system-settings': ['super_admin'],
      '/admin/content': ['admin', 'super_admin'],
      '/admin/analytics': ['admin', 'super_admin']
    }
    
    const allowedRoles = adminRoutes[route as keyof typeof adminRoutes]
    if (!allowedRoles) return false
    
    return allowedRoles.includes(user?.role || '')
  }

  // Registrar evento de segurança
  async logSecurityEvent(
    userId: string,
    eventType: SecurityEvent['event_type'],
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Verificar se é usuário demo
      if (userId === 'demo-user-id') {
        console.log('Evento de segurança (modo demo):', {
          userId,
          eventType,
          details
        })
        return
      }

      const ipAddress = await this.getClientIP()
      const userAgent = navigator.userAgent
      
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: userId,
          event_type: eventType,
          ip_address: ipAddress,
          user_agent: userAgent,
          details,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        // Se a tabela não existir, apenas logar no console
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          console.warn('Tabela security_events não encontrada, evento registrado apenas no console:', {
            userId,
            eventType,
            ipAddress,
            userAgent,
            details,
            timestamp: new Date().toISOString()
          })
        } else {
          console.error('Erro ao registrar evento de segurança:', error)
        }
      }
    } catch (error) {
      console.error('Erro ao registrar evento de segurança:', error)
      // Registrar no console como fallback
      console.warn('Evento de segurança (fallback):', {
        userId,
        eventType,
        details,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Detectar atividade suspeita
  async detectSuspiciousActivity(userId: string): Promise<boolean> {
    try {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
      
      const { data: events, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false })
      
      if (error) {
        // Se a tabela não existir, retornar false (sem atividade suspeita detectada)
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          console.warn('Tabela security_events não encontrada, não é possível detectar atividade suspeita')
          return false
        }
        console.error('Erro ao buscar eventos de segurança:', error)
        return false
      }
      
      // Verificar múltiplas tentativas de login falhadas
      const failedLogins = events?.filter(e => e.event_type === 'failed_login') || []
      if (failedLogins.length >= 5) {
        await this.logSecurityEvent(userId, 'suspicious_activity', {
          reason: 'multiple_failed_logins',
          count: failedLogins.length
        })
        return true
      }
      
      // Verificar acessos de IPs diferentes
      const uniqueIPs = new Set(events?.map(e => e.ip_address) || [])
      if (uniqueIPs.size >= 3) {
        await this.logSecurityEvent(userId, 'suspicious_activity', {
          reason: 'multiple_ip_addresses',
          ips: Array.from(uniqueIPs)
        })
        return true
      }
      
      return false
    } catch (error) {
      console.error('Erro ao detectar atividade suspeita:', error)
      return false
    }
  }

  // Obter IP do cliente (simulado para frontend)
  private async getClientIP(): Promise<string> {
    try {
      // Em produção, isso seria obtido do servidor
      // Para desenvolvimento, retornamos um IP simulado
      return 'unknown'
    } catch {
      return 'unknown'
    }
  }

  // Sanitizar dados de entrada
  sanitizeInput(input: string): string {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  }

  // Validar formato de email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Gerar token CSRF (simulado)
  generateCSRFToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  // Validar token CSRF
  validateCSRFToken(token: string, expectedToken: string): boolean {
    return token === expectedToken
  }

  // Criptografar dados sensíveis (simulado)
  encryptSensitiveData(data: string): string {
    // Em produção, usar uma biblioteca de criptografia real
    return btoa(data)
  }

  // Descriptografar dados sensíveis (simulado)
  decryptSensitiveData(encryptedData: string): string {
    try {
      return atob(encryptedData)
    } catch {
      return ''
    }
  }

  // Verificar integridade de dados
  verifyDataIntegrity(data: any, expectedHash?: string): boolean {
    if (!expectedHash) return true
    
    // Simulação de verificação de hash
    const dataString = JSON.stringify(data)
    const hash = btoa(dataString)
    
    return hash === expectedHash
  }

  // Limpar dados de sessão expirada
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const expiredTime = new Date(Date.now() - this.securityConfig.sessionTimeout * 1000)
      
      // Em uma implementação real, isso seria feito no backend
      console.log('Limpeza de sessões expiradas simulada para:', expiredTime)
    } catch (error) {
      console.error('Erro ao limpar sessões expiradas:', error)
    }
  }



  // Verificar se 2FA está habilitado para o usuário
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('two_factor_enabled')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Erro ao verificar 2FA:', error)
        return false
      }
      
      return data?.two_factor_enabled || false
    } catch (error) {
      console.error('Erro ao verificar 2FA:', error)
      return false
    }
  }
}

export const securityService = new SecurityService()
export type { SecurityConfig, SecurityEvent }