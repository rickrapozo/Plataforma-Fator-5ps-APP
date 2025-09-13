import { loggerService } from './loggerService'
import { alertService, AlertType, AlertSeverity } from './alertService'
import { apmService } from './apmService'
import { supabase } from '../lib/supabase'

// Tipos e interfaces
export interface TokenInfo {
  token: string
  expiresAt: Date
  type: 'access' | 'refresh' | 'api' | 'session'
  userId?: string
  metadata?: Record<string, any>
}

export interface TokenExpirationConfig {
  checkInterval: number // em milissegundos
  warningThreshold: number // minutos antes da expiração
  criticalThreshold: number // minutos antes da expiração
  enableAutoRefresh: boolean
  enableNotifications: boolean
  maxRetries: number
  retryDelay: number
}

export interface TokenStats {
  totalTokens: number
  expiringSoon: number
  expired: number
  refreshed: number
  failed: number
  lastCheck: Date
}

class TokenExpirationService {
  private tokens: Map<string, TokenInfo> = new Map()
  private config: TokenExpirationConfig
  private intervalId: NodeJS.Timeout | null = null
  private stats: TokenStats = {
    totalTokens: 0,
    expiringSoon: 0,
    expired: 0,
    refreshed: 0,
    failed: 0,
    lastCheck: new Date()
  }
  private listeners: Set<(stats: TokenStats) => void> = new Set()

  constructor(config?: Partial<TokenExpirationConfig>) {
    this.config = {
      checkInterval: 60000, // 1 minuto
      warningThreshold: 15, // 15 minutos
      criticalThreshold: 5, // 5 minutos
      enableAutoRefresh: true,
      enableNotifications: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    }

    this.initializeService()
  }

  private async initializeService(): Promise<void> {
    try {
      await this.loadPersistedTokens()
      this.startMonitoring()
      
      loggerService.info('Token expiration service initialized', {
        config: this.config,
        tokensLoaded: this.tokens.size
      })
    } catch (error) {
      loggerService.error('Failed to initialize token expiration service', { error })
      throw error
    }
  }

  // Registrar token para monitoramento
  public registerToken(id: string, tokenInfo: TokenInfo): void {
    const transactionId = apmService.startTransaction('register_token', 'custom')
    
    try {
      this.tokens.set(id, {
        ...tokenInfo,
        expiresAt: new Date(tokenInfo.expiresAt)
      })

      this.persistToken(id, tokenInfo)
      this.updateStats()

      loggerService.debug('Token registered for monitoring', {
        tokenId: id,
        type: tokenInfo.type,
        expiresAt: tokenInfo.expiresAt
      })

    } catch (error) {
      loggerService.error('Failed to register token', { tokenId: id, error })
      throw error
    } finally {
      if (transactionId) {
        apmService.endTransaction(transactionId)
      }
    }
  }

  // Remover token do monitoramento
  public unregisterToken(id: string): void {
    if (this.tokens.delete(id)) {
      this.removePersistedToken(id)
      this.updateStats()
      
      loggerService.debug('Token unregistered from monitoring', { tokenId: id })
    }
  }

  // Verificar status de um token específico
  public getTokenStatus(id: string): {
    exists: boolean
    expired: boolean
    expiringSoon: boolean
    timeUntilExpiration?: number
  } {
    const token = this.tokens.get(id)
    
    if (!token) {
      return { exists: false, expired: false, expiringSoon: false }
    }

    const now = new Date()
    const timeUntilExpiration = token.expiresAt.getTime() - now.getTime()
    const minutesUntilExpiration = timeUntilExpiration / (1000 * 60)

    return {
      exists: true,
      expired: timeUntilExpiration <= 0,
      expiringSoon: minutesUntilExpiration <= this.config.warningThreshold,
      timeUntilExpiration: Math.max(0, timeUntilExpiration)
    }
  }

  // Iniciar monitoramento automático
  public startMonitoring(): void {
    if (this.intervalId) {
      return // Já está rodando
    }

    this.intervalId = setInterval(() => {
      this.checkTokenExpirations()
    }, this.config.checkInterval)

    loggerService.info('Token expiration monitoring started', {
      interval: this.config.checkInterval
    })
  }

  // Parar monitoramento automático
  public stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      
      loggerService.info('Token expiration monitoring stopped')
    }
  }

  // Verificação manual de expirações
  public async checkTokenExpirations(): Promise<void> {
    const transactionId = apmService.startTransaction('check_token_expirations', 'custom')
    
    try {
      const now = new Date()
      const expiredTokens: string[] = []
      const expiringSoonTokens: string[] = []
      const criticalTokens: string[] = []

      for (const [id, token] of Array.from(this.tokens.entries())) {
        const timeUntilExpiration = token.expiresAt.getTime() - now.getTime()
        const minutesUntilExpiration = timeUntilExpiration / (1000 * 60)

        if (timeUntilExpiration <= 0) {
          expiredTokens.push(id)
        } else if (minutesUntilExpiration <= this.config.criticalThreshold) {
          criticalTokens.push(id)
        } else if (minutesUntilExpiration <= this.config.warningThreshold) {
          expiringSoonTokens.push(id)
        }
      }

      // Processar tokens expirados
      for (const tokenId of expiredTokens) {
        await this.handleExpiredToken(tokenId)
      }

      // Processar tokens críticos
      for (const tokenId of criticalTokens) {
        await this.handleCriticalToken(tokenId)
      }

      // Processar tokens expirando em breve
      for (const tokenId of expiringSoonTokens) {
        await this.handleExpiringSoonToken(tokenId)
      }

      this.stats.lastCheck = now
      this.stats.expired = expiredTokens.length
      this.stats.expiringSoon = expiringSoonTokens.length + criticalTokens.length
      
      this.notifyListeners()

      loggerService.debug('Token expiration check completed', {
        totalTokens: this.tokens.size,
        expired: expiredTokens.length,
        critical: criticalTokens.length,
        expiringSoon: expiringSoonTokens.length
      })

    } catch (error) {
      loggerService.error('Failed to check token expirations', { error })
      throw error
    } finally {
      if (transactionId) {
        apmService.endTransaction(transactionId)
      }
    }
  }

  // Lidar com token expirado
  private async handleExpiredToken(tokenId: string): Promise<void> {
    const token = this.tokens.get(tokenId)
    if (!token) return

    loggerService.warn('Token expired', {
      tokenId,
      type: token.type,
      expiresAt: token.expiresAt,
      userId: token.userId
    })

    if (this.config.enableNotifications) {
      await alertService.createAlert({
        type: AlertType.ERROR,
        severity: AlertSeverity.HIGH,
        title: 'Token Expirado',
        message: `Token ${tokenId} do tipo ${token.type} expirou`,
        metadata: {
          tokenId,
          tokenType: token.type,
          userId: token.userId,
          expiresAt: token.expiresAt.toISOString()
        }
      })
    }

    if (this.config.enableAutoRefresh && token.type === 'access') {
      await this.attemptTokenRefresh(tokenId, token)
    } else {
      this.unregisterToken(tokenId)
    }
  }

  // Lidar com token crítico (prestes a expirar)
  private async handleCriticalToken(tokenId: string): Promise<void> {
    const token = this.tokens.get(tokenId)
    if (!token) return

    const timeUntilExpiration = token.expiresAt.getTime() - new Date().getTime()
    const minutesUntilExpiration = Math.floor(timeUntilExpiration / (1000 * 60))

    loggerService.warn('Token expiring soon (critical)', {
      tokenId,
      type: token.type,
      minutesUntilExpiration,
      userId: token.userId
    })

    if (this.config.enableNotifications) {
      await alertService.createAlert({
        type: AlertType.WARNING,
        severity: AlertSeverity.HIGH,
        title: 'Token Expirando (Crítico)',
        message: `Token ${tokenId} expira em ${minutesUntilExpiration} minutos`,
        metadata: {
          tokenId,
          tokenType: token.type,
          minutesUntilExpiration,
          userId: token.userId
        }
      })
    }

    if (this.config.enableAutoRefresh && token.type === 'access') {
      await this.attemptTokenRefresh(tokenId, token)
    }
  }

  // Lidar com token expirando em breve
  private async handleExpiringSoonToken(tokenId: string): Promise<void> {
    const token = this.tokens.get(tokenId)
    if (!token) return

    const timeUntilExpiration = token.expiresAt.getTime() - new Date().getTime()
    const minutesUntilExpiration = Math.floor(timeUntilExpiration / (1000 * 60))

    loggerService.info('Token expiring soon', {
      tokenId,
      type: token.type,
      minutesUntilExpiration,
      userId: token.userId
    })

    if (this.config.enableNotifications) {
      await alertService.createAlert({
        type: AlertType.WARNING,
        severity: AlertSeverity.MEDIUM,
        title: 'Token Expirando',
        message: `Token ${tokenId} expira em ${minutesUntilExpiration} minutos`,
        metadata: {
          tokenId,
          tokenType: token.type,
          minutesUntilExpiration,
          userId: token.userId
        }
      })
    }
  }

  // Tentar renovar token
  private async attemptTokenRefresh(tokenId: string, token: TokenInfo): Promise<void> {
    const transactionId = apmService.startTransaction('refresh_token', 'custom')
    
    try {
      loggerService.info('Attempting token refresh', {
        tokenId,
        type: token.type,
        userId: token.userId
      })

      // Tentar renovar usando refresh token do Supabase
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        throw error
      }

      if (data.session?.access_token) {
        // Atualizar token registrado
        const newTokenInfo: TokenInfo = {
          ...token,
          token: data.session.access_token,
          expiresAt: new Date(data.session.expires_at! * 1000)
        }

        this.registerToken(tokenId, newTokenInfo)
        this.stats.refreshed++

        loggerService.info('Token refreshed successfully', {
          tokenId,
          newExpiresAt: newTokenInfo.expiresAt
        })

        if (this.config.enableNotifications) {
          await alertService.createAlert({
             type: AlertType.INFO,
             severity: AlertSeverity.LOW,
            title: 'Token Renovado',
            message: `Token ${tokenId} foi renovado com sucesso`,
            metadata: {
              tokenId,
              newExpiresAt: newTokenInfo.expiresAt.toISOString()
            }
          })
        }
      }

    } catch (error) {
      this.stats.failed++
      
      loggerService.error('Failed to refresh token', {
        tokenId,
        error,
        userId: token.userId
      })

      if (this.config.enableNotifications) {
        await alertService.createAlert({
           type: AlertType.ERROR,
           severity: AlertSeverity.HIGH,
          title: 'Falha na Renovação de Token',
          message: `Falha ao renovar token ${tokenId}`,
          metadata: {
            tokenId,
            error: (error as Error).message,
            userId: token.userId
          }
        })
      }
    } finally {
        if (transactionId) {
          apmService.endTransaction(transactionId)
        }
      }
  }

  // Persistir token no localStorage/sessionStorage
  private async persistToken(id: string, token: TokenInfo): Promise<void> {
    try {
      if (typeof localStorage === 'undefined') return
      
      const persistedTokens = this.getPersistedTokens()
      persistedTokens[id] = {
        ...token,
        token: '', // Não persistir o token real por segurança
        expiresAt: token.expiresAt.toISOString()
      }
      
      localStorage.setItem('token_expiration_monitoring', JSON.stringify(persistedTokens))
    } catch (error) {
      loggerService.error('Failed to persist token', { tokenId: id, error })
    }
  }

  // Remover token persistido
  private async removePersistedToken(id: string): Promise<void> {
    try {
      if (typeof localStorage === 'undefined') return
      
      const persistedTokens = this.getPersistedTokens()
      delete persistedTokens[id]
      
      localStorage.setItem('token_expiration_monitoring', JSON.stringify(persistedTokens))
    } catch (error) {
      loggerService.error('Failed to remove persisted token', { tokenId: id, error })
    }
  }

  // Carregar tokens persistidos
  private async loadPersistedTokens(): Promise<void> {
    try {
      const persistedTokens = this.getPersistedTokens()
      
      for (const [id, tokenData] of Object.entries(persistedTokens)) {
        this.tokens.set(id, {
          ...tokenData,
          expiresAt: new Date(tokenData.expiresAt)
        } as TokenInfo)
      }
      
      loggerService.info('Persisted tokens loaded', {
        count: Object.keys(persistedTokens).length
      })
    } catch (error) {
      loggerService.error('Failed to load persisted tokens', { error })
    }
  }

  // Obter tokens persistidos
  private getPersistedTokens(): Record<string, any> {
    try {
      if (typeof localStorage === 'undefined') return {}
      
      const stored = localStorage.getItem('token_expiration_monitoring')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  // Atualizar estatísticas
  private updateStats(): void {
    this.stats.totalTokens = this.tokens.size
    this.notifyListeners()
  }

  // Notificar listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.stats)
      } catch (error) {
        loggerService.error('Error notifying token stats listener', { error })
      }
    })
  }

  // Adicionar listener para estatísticas
  public addStatsListener(listener: (stats: TokenStats) => void): () => void {
    this.listeners.add(listener)
    
    // Retornar função para remover listener
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Obter estatísticas atuais
  public getStats(): TokenStats {
    return { ...this.stats }
  }

  // Obter todos os tokens monitorados
  public getAllTokens(): Array<{ id: string; info: TokenInfo }> {
    return Array.from(this.tokens.entries()).map(([id, info]) => ({ id, info }))
  }

  // Limpar todos os tokens
  public clearAllTokens(): void {
    this.tokens.clear()
    localStorage.removeItem('token_expiration_monitoring')
    this.updateStats()
    
    loggerService.info('All tokens cleared from monitoring')
  }

  // Destruir serviço
  public destroy(): void {
    this.stopMonitoring()
    this.tokens.clear()
    this.listeners.clear()
    
    loggerService.info('Token expiration service destroyed')
  }
}

// Instância singleton
export const tokenExpirationService = new TokenExpirationService({
  checkInterval: parseInt(import.meta.env.VITE_TOKEN_CHECK_INTERVAL || '60000'),
  warningThreshold: parseInt(import.meta.env.VITE_TOKEN_WARNING_THRESHOLD || '15'),
  criticalThreshold: parseInt(import.meta.env.VITE_TOKEN_CRITICAL_THRESHOLD || '5'),
  enableAutoRefresh: import.meta.env.VITE_TOKEN_AUTO_REFRESH === 'true',
  enableNotifications: import.meta.env.VITE_TOKEN_NOTIFICATIONS === 'true',
  maxRetries: parseInt(import.meta.env.VITE_TOKEN_MAX_RETRIES || '3'),
  retryDelay: parseInt(import.meta.env.VITE_TOKEN_RETRY_DELAY || '1000')
})

// Service instance export

export default tokenExpirationService