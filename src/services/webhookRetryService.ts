import { loggerService } from './loggerService'
import { apmService } from './apmService'
import { CircuitBreaker, circuitBreakerManager, CircuitBreakerPresets } from './circuitBreakerService'
import { alertService, AlertType, AlertSeverity, NotificationChannel } from './alertService'

/**
 * Status do webhook
 */
export enum WebhookStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  DEAD_LETTER = 'dead_letter',
  CANCELLED = 'cancelled'
}

/**
 * Prioridade do webhook
 */
export enum WebhookPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
  EMERGENCY = 5
}

/**
 * Interface para webhook
 */
export interface WebhookPayload {
  id: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers: Record<string, string>
  body?: any
  priority: WebhookPriority
  maxRetries: number
  retryDelay: number // Delay inicial em ms
  timeout: number
  metadata: Record<string, any>
  createdAt: number
  scheduledAt?: number
  expiresAt?: number
}

/**
 * Interface para tentativa de webhook
 */
export interface WebhookAttempt {
  id: string
  webhookId: string
  attemptNumber: number
  status: WebhookStatus
  startedAt: number
  completedAt?: number
  duration?: number
  httpStatus?: number
  response?: any
  error?: string
  nextRetryAt?: number
}

/**
 * Interface para configuração do serviço
 */
export interface WebhookRetryConfig {
  enabled: boolean
  maxConcurrentWebhooks: number
  defaultMaxRetries: number
  defaultRetryDelay: number
  maxRetryDelay: number
  backoffMultiplier: number
  jitterEnabled: boolean
  jitterMaxMs: number
  defaultTimeout: number
  deadLetterThreshold: number
  cleanupInterval: number
  retentionDays: number
  batchSize: number
  processingInterval: number
  circuitBreakerEnabled: boolean
  rateLimitPerSecond: number
}

/**
 * Configuração padrão
 */
const DEFAULT_CONFIG: WebhookRetryConfig = {
  enabled: process.env.VITE_WEBHOOK_RETRY_ENABLED === 'true',
  maxConcurrentWebhooks: parseInt(process.env.VITE_WEBHOOK_MAX_CONCURRENT || '10'),
  defaultMaxRetries: parseInt(process.env.VITE_WEBHOOK_MAX_RETRIES || '5'),
  defaultRetryDelay: parseInt(process.env.VITE_WEBHOOK_RETRY_DELAY || '1000'),
  maxRetryDelay: parseInt(process.env.VITE_WEBHOOK_MAX_RETRY_DELAY || '300000'), // 5 minutos
  backoffMultiplier: parseFloat(process.env.VITE_WEBHOOK_BACKOFF_MULTIPLIER || '2.0'),
  jitterEnabled: process.env.VITE_WEBHOOK_JITTER_ENABLED !== 'false',
  jitterMaxMs: parseInt(process.env.VITE_WEBHOOK_JITTER_MAX || '1000'),
  defaultTimeout: parseInt(process.env.VITE_WEBHOOK_TIMEOUT || '30000'),
  deadLetterThreshold: parseInt(process.env.VITE_WEBHOOK_DEAD_LETTER_THRESHOLD || '10'),
  cleanupInterval: parseInt(process.env.VITE_WEBHOOK_CLEANUP_INTERVAL || '3600000'), // 1 hora
  retentionDays: parseInt(process.env.VITE_WEBHOOK_RETENTION_DAYS || '7'),
  batchSize: parseInt(process.env.VITE_WEBHOOK_BATCH_SIZE || '50'),
  processingInterval: parseInt(process.env.VITE_WEBHOOK_PROCESSING_INTERVAL || '5000'),
  circuitBreakerEnabled: process.env.VITE_WEBHOOK_CIRCUIT_BREAKER_ENABLED !== 'false',
  rateLimitPerSecond: parseInt(process.env.VITE_WEBHOOK_RATE_LIMIT || '100')
}

/**
 * Interface para estatísticas
 */
export interface WebhookStats {
  totalWebhooks: number
  pendingWebhooks: number
  processingWebhooks: number
  successfulWebhooks: number
  failedWebhooks: number
  deadLetterWebhooks: number
  averageRetries: number
  averageProcessingTime: number
  successRate: number
  circuitBreakerStats: Record<string, any>
  queueDepth: number
  throughputPerMinute: number
}

/**
 * Serviço de retry exponencial e dead letter queue para webhooks
 */
export class WebhookRetryService {
  private config: WebhookRetryConfig
  private webhookQueue: Map<string, WebhookPayload> = new Map()
  private processingWebhooks: Set<string> = new Set()
  private attempts: Map<string, WebhookAttempt[]> = new Map()
  private circuitBreakers: Map<string, CircuitBreaker> = new Map()
  private processingTimer: NodeJS.Timeout | null = null
  private cleanupTimer: NodeJS.Timeout | null = null
  private rateLimitTokens: number
  private lastTokenRefill: number
  private stats = {
    totalProcessed: 0,
    totalSuccess: 0,
    totalFailed: 0,
    totalRetries: 0,
    processingTimes: [] as number[],
    throughputCounter: 0,
    lastThroughputReset: Date.now()
  }
  private isInitialized = false

  constructor(config?: Partial<WebhookRetryConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.rateLimitTokens = this.config.rateLimitPerSecond
    this.lastTokenRefill = Date.now()
    
    this.initialize()
  }

  /**
   * Inicializa o serviço
   */
  private async initialize() {
    try {
      // Carrega webhooks pendentes do banco de dados
      await this.loadPendingWebhooks()

      // Inicia processamento
      if (this.config.enabled) {
        this.startProcessing()
        this.startCleanup()
      }

      this.isInitialized = true
      
      loggerService.info('Webhook retry service initialized', {
        enabled: this.config.enabled,
        maxConcurrent: this.config.maxConcurrentWebhooks,
        pendingWebhooks: this.webhookQueue.size
      })
    } catch (error) {
      loggerService.error('Failed to initialize webhook retry service', {
        error: (error as Error).message
      })
    }
  }

  /**
   * Carrega webhooks pendentes do banco de dados
   */
  private async loadPendingWebhooks() {
    try {
      // Database loading disabled - using in-memory storage only
      loggerService.debug('Pending webhooks would be loaded from database')

      loggerService.info('Loaded pending webhooks', {
        count: 0
      })
    } catch (error) {
      loggerService.error('Failed to load pending webhooks', {
        error: (error as Error).message
      })
    }
  }

  /**
   * Inicia processamento
   */
  private startProcessing() {
    this.processingTimer = setInterval(() => {
      this.processWebhooks()
    }, this.config.processingInterval)
  }

  /**
   * Inicia limpeza automática
   */
  private startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldWebhooks()
    }, this.config.cleanupInterval)
  }

  /**
   * Adiciona webhook à fila
   */
  async enqueue(webhook: Omit<WebhookPayload, 'id' | 'createdAt'>): Promise<string> {
    const id = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()
    
    const payload: WebhookPayload = {
      ...webhook,
      id,
      createdAt: now,
      maxRetries: webhook.maxRetries || this.config.defaultMaxRetries,
      retryDelay: webhook.retryDelay || this.config.defaultRetryDelay,
      timeout: webhook.timeout || this.config.defaultTimeout
    }

    // Valida payload
    if (!this.validateWebhook(payload)) {
      throw new Error('Invalid webhook payload')
    }

    // Adiciona à fila
    this.webhookQueue.set(id, payload)

    // Salva no banco de dados
    await this.saveWebhookToDatabase(payload, WebhookStatus.PENDING)

    loggerService.info('Webhook enqueued', {
      webhookId: id,
      url: payload.url,
      priority: payload.priority,
      queueSize: this.webhookQueue.size
    })

    // Registra métrica
    apmService.recordMetric('webhook.enqueued', 1, 'count')

    return id
  }

  /**
   * Valida webhook
   */
  private validateWebhook(webhook: WebhookPayload): boolean {
    if (!webhook.url || !webhook.method) return false
    if (webhook.expiresAt && webhook.expiresAt < Date.now()) return false
    if (webhook.maxRetries < 0 || webhook.retryDelay < 0) return false
    
    try {
      new URL(webhook.url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Processa webhooks na fila
   */
  private async processWebhooks() {
    if (!this.config.enabled) return

    // Verifica limite de processamento concorrente
    if (this.processingWebhooks.size >= this.config.maxConcurrentWebhooks) {
      return
    }

    // Atualiza tokens de rate limiting
    this.refillRateLimitTokens()

    // Obtém webhooks prontos para processamento
    const readyWebhooks = this.getReadyWebhooks()
    
    for (const webhook of readyWebhooks) {
      if (this.processingWebhooks.size >= this.config.maxConcurrentWebhooks) {
        break
      }

      if (this.rateLimitTokens <= 0) {
        break
      }

      this.rateLimitTokens--
      this.processWebhook(webhook)
    }
  }

  /**
   * Atualiza tokens de rate limiting
   */
  private refillRateLimitTokens() {
    const now = Date.now()
    const timePassed = now - this.lastTokenRefill
    const tokensToAdd = Math.floor((timePassed / 1000) * this.config.rateLimitPerSecond)
    
    if (tokensToAdd > 0) {
      this.rateLimitTokens = Math.min(
        this.config.rateLimitPerSecond,
        this.rateLimitTokens + tokensToAdd
      )
      this.lastTokenRefill = now
    }
  }

  /**
   * Obtém webhooks prontos para processamento
   */
  private getReadyWebhooks(): WebhookPayload[] {
    const now = Date.now()
    const ready: WebhookPayload[] = []

    for (const webhook of Array.from(this.webhookQueue.values())) {
      // Verifica se já está sendo processado
      if (this.processingWebhooks.has(webhook.id)) continue

      // Verifica se expirou
      if (webhook.expiresAt && webhook.expiresAt < now) {
        this.moveToDeadLetter(webhook, 'Expired')
        continue
      }

      // Verifica se está agendado para o futuro
      if (webhook.scheduledAt && webhook.scheduledAt > now) continue

      // Verifica se está em cooldown de retry
      const attempts = this.attempts.get(webhook.id) || []
      const lastAttempt = attempts[attempts.length - 1]
      
      if (lastAttempt && lastAttempt.nextRetryAt && lastAttempt.nextRetryAt > now) {
        continue
      }

      ready.push(webhook)
    }

    // Ordena por prioridade e data de criação
    return ready.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority // Prioridade maior primeiro
      }
      return a.createdAt - b.createdAt // Mais antigo primeiro
    })
  }

  /**
   * Processa webhook individual
   */
  private async processWebhook(webhook: WebhookPayload) {
    const startTime = Date.now()
    this.processingWebhooks.add(webhook.id)

    // Cria tentativa
    const attempts = this.attempts.get(webhook.id) || []
    const attemptNumber = attempts.length + 1
    
    const attempt: WebhookAttempt = {
      id: `${webhook.id}_attempt_${attemptNumber}`,
      webhookId: webhook.id,
      attemptNumber,
      status: WebhookStatus.PROCESSING,
      startedAt: startTime
    }

    attempts.push(attempt)
    this.attempts.set(webhook.id, attempts)

    // Atualiza status no banco
    await this.saveWebhookToDatabase(webhook, WebhookStatus.PROCESSING)
    await this.saveAttemptToDatabase(attempt)

    try {
      // Obtém circuit breaker para o domínio
      const domain = new URL(webhook.url).hostname
      const circuitBreaker = this.getCircuitBreaker(domain)

      // Executa webhook
      const result = await circuitBreaker.execute(async () => {
        return await this.executeWebhook(webhook)
      })

      if (result.success) {
        await this.handleSuccess(webhook, attempt, result.data)
      } else {
        await this.handleFailure(webhook, attempt, result.error || new Error('Unknown webhook execution error'))
      }
    } catch (error) {
      await this.handleFailure(webhook, attempt, error as Error)
    } finally {
      this.processingWebhooks.delete(webhook.id)
      
      const duration = Date.now() - startTime
      this.stats.processingTimes.push(duration)
      
      if (this.stats.processingTimes.length > 1000) {
        this.stats.processingTimes = this.stats.processingTimes.slice(-1000)
      }
    }
  }

  /**
   * Obtém circuit breaker para domínio
   */
  private getCircuitBreaker(domain: string): CircuitBreaker {
    if (!this.config.circuitBreakerEnabled) {
      // Retorna um circuit breaker sempre fechado
      return {
        execute: async (fn: () => Promise<any>) => {
          try {
            const result = await fn()
            return { success: true, data: result }
          } catch (error) {
            return { success: false, error: error as Error }
          }
        }
      } as any
    }

    let circuitBreaker = this.circuitBreakers.get(domain)
    
    if (!circuitBreaker) {
      circuitBreaker = circuitBreakerManager.getOrCreate(
        `webhook-${domain}`,
        {
          ...CircuitBreakerPresets.EXTERNAL_API,
          name: `webhook-${domain}`,
          timeout: this.config.defaultTimeout,
          failureThreshold: 5
        }
      )
      
      this.circuitBreakers.set(domain, circuitBreaker)
    }

    return circuitBreaker
  }

  /**
   * Executa webhook
   */
  private async executeWebhook(webhook: WebhookPayload): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), webhook.timeout)

    try {
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WebhookRetryService/1.0',
          ...webhook.headers
        },
        body: webhook.body ? JSON.stringify(webhook.body) : undefined,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const responseText = await response.text()
      let responseData
      
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = responseText
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      
      throw error
    }
  }

  /**
   * Trata sucesso
   */
  private async handleSuccess(webhook: WebhookPayload, attempt: WebhookAttempt, response: any) {
    const now = Date.now()
    
    attempt.status = WebhookStatus.SUCCESS
    attempt.completedAt = now
    attempt.duration = now - attempt.startedAt
    attempt.httpStatus = response.status
    attempt.response = response

    // Remove da fila
    this.webhookQueue.delete(webhook.id)

    // Atualiza estatísticas
    this.stats.totalProcessed++
    this.stats.totalSuccess++
    this.stats.throughputCounter++

    // Salva no banco
    await this.saveWebhookToDatabase(webhook, WebhookStatus.SUCCESS)
    await this.saveAttemptToDatabase(attempt)

    loggerService.info('Webhook executed successfully', {
      webhookId: webhook.id,
      url: webhook.url,
      attempts: attempt.attemptNumber,
      duration: attempt.duration,
      httpStatus: response.status
    })

    // Registra métricas
    apmService.recordMetric('webhook.success', 1, 'count')
    apmService.recordMetric('webhook.duration', attempt.duration!, 'ms')
    apmService.recordMetric('webhook.attempts', attempt.attemptNumber, 'count')
  }

  /**
   * Trata falha
   */
  private async handleFailure(webhook: WebhookPayload, attempt: WebhookAttempt, error: Error) {
    const now = Date.now()
    
    attempt.status = WebhookStatus.FAILED
    attempt.completedAt = now
    attempt.duration = now - attempt.startedAt
    attempt.error = error.message

    // Atualiza estatísticas
    this.stats.totalProcessed++
    this.stats.totalFailed++
    this.stats.totalRetries++

    // Verifica se deve tentar novamente
    if (attempt.attemptNumber < webhook.maxRetries) {
      // Calcula próximo retry com backoff exponencial
      const baseDelay = webhook.retryDelay * Math.pow(this.config.backoffMultiplier, attempt.attemptNumber - 1)
      const cappedDelay = Math.min(baseDelay, this.config.maxRetryDelay)
      
      // Adiciona jitter se habilitado
      const jitter = this.config.jitterEnabled 
        ? Math.random() * this.config.jitterMaxMs 
        : 0
      
      const nextRetryDelay = cappedDelay + jitter
      attempt.nextRetryAt = now + nextRetryDelay

      loggerService.warn('Webhook failed, will retry', {
        webhookId: webhook.id,
        url: webhook.url,
        attempt: attempt.attemptNumber,
        maxRetries: webhook.maxRetries,
        nextRetryAt: new Date(attempt.nextRetryAt).toISOString(),
        error: error.message
      })

      // Registra métrica de retry
      apmService.recordMetric('webhook.retry', 1, 'count')
    } else {
      // Esgotou tentativas, move para dead letter
      await this.moveToDeadLetter(webhook, `Max retries exceeded: ${error.message}`)
      
      loggerService.error('Webhook moved to dead letter queue', {
        webhookId: webhook.id,
        url: webhook.url,
        attempts: attempt.attemptNumber,
        error: error.message
      })

      // Dispara alerta
      await this.triggerDeadLetterAlert(webhook, error)
    }

    // Salva no banco
    await this.saveAttemptToDatabase(attempt)

    // Registra métricas
    apmService.recordMetric('webhook.failure', 1, 'count')
  }

  /**
   * Move webhook para dead letter queue
   */
  private async moveToDeadLetter(webhook: WebhookPayload, reason: string) {
    this.webhookQueue.delete(webhook.id)
    
    await this.saveWebhookToDatabase(webhook, WebhookStatus.DEAD_LETTER, {
      deadLetterReason: reason,
      deadLetterAt: new Date().toISOString()
    })

    // Registra métrica
    apmService.recordMetric('webhook.dead_letter', 1, 'count')
  }

  /**
   * Dispara alerta de dead letter
   */
  private async triggerDeadLetterAlert(webhook: WebhookPayload, error: Error) {
    try {
      await alertService['triggerAlert']({
        id: 'webhook-dead-letter',
        name: 'Webhook Dead Letter',
        description: 'Webhook moved to dead letter queue after exhausting retries',
        type: AlertType.ERROR,
        severity: AlertSeverity.HIGH,
        condition: {
          metric: 'webhook_dead_letter',
          operator: 'gt' as const,
          threshold: 0
        },
        channels: [NotificationChannel.EMAIL, NotificationChannel.SLACK],
        enabled: true,
        cooldown: 300,
        maxOccurrences: 1,
        timeWindow: 3600,
        metadata: {
          webhookId: webhook.id,
          url: webhook.url,
          error: error.message,
          priority: webhook.priority
        }
      })
    } catch (alertError) {
      loggerService.error('Failed to trigger dead letter alert', {
        webhookId: webhook.id,
        error: (alertError as Error).message
      })
    }
  }

  /**
   * Salva webhook no banco de dados
   */
  private async saveWebhookToDatabase(
    webhook: WebhookPayload, 
    status: WebhookStatus, 
    additionalData?: Record<string, any>
  ) {
    try {
      const data = {
        id: webhook.id,
        url: webhook.url,
        method: webhook.method,
        headers: webhook.headers,
        body: webhook.body,
        priority: webhook.priority,
        max_retries: webhook.maxRetries,
        retry_delay: webhook.retryDelay,
        timeout: webhook.timeout,
        metadata: { ...webhook.metadata, ...additionalData },
        status,
        created_at: new Date(webhook.createdAt).toISOString(),
        scheduled_at: webhook.scheduledAt ? new Date(webhook.scheduledAt).toISOString() : null,
        expires_at: webhook.expiresAt ? new Date(webhook.expiresAt).toISOString() : null,
        updated_at: new Date().toISOString()
      }

      // Database persistence disabled - using in-memory storage only
      loggerService.debug('Webhook data would be saved to database', { webhookId: webhook.id })
    } catch (error) {
      loggerService.error('Failed to save webhook to database', {
        webhookId: webhook.id,
        error: (error as Error).message
      })
    }
  }

  /**
   * Salva tentativa no banco de dados
   */
  private async saveAttemptToDatabase(attempt: WebhookAttempt) {
    try {
      // Database persistence disabled - using in-memory storage only
      loggerService.debug('Attempt data would be saved to database', { attemptId: attempt.id })
    } catch (error) {
      loggerService.error('Failed to save attempt to database', {
        attemptId: attempt.id,
        error: (error as Error).message
      })
    }
  }

  /**
   * Limpa webhooks antigos
   */
  private async cleanupOldWebhooks() {
    const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000)

    try {
      // Database cleanup disabled - using in-memory storage only
      loggerService.debug('Old webhooks would be cleaned from database', { cutoffTime: new Date(cutoffTime).toISOString() })

      // Limpa memória
      for (const [id, webhook] of Array.from(this.webhookQueue.entries())) {
        if (webhook.createdAt < cutoffTime) {
          this.webhookQueue.delete(id)
          this.attempts.delete(id)
        }
      }

      loggerService.info('Old webhooks cleaned up', {
        cutoffTime: new Date(cutoffTime).toISOString()
      })
    } catch (error) {
      loggerService.error('Failed to cleanup old webhooks', {
        error: (error as Error).message
      })
    }
  }

  /**
   * Cancela webhook
   */
  async cancelWebhook(webhookId: string, reason?: string): Promise<boolean> {
    const webhook = this.webhookQueue.get(webhookId)
    if (!webhook) return false

    this.webhookQueue.delete(webhookId)
    this.processingWebhooks.delete(webhookId)

    await this.saveWebhookToDatabase(webhook, WebhookStatus.CANCELLED, {
      cancelReason: reason,
      cancelledAt: new Date().toISOString()
    })

    loggerService.info('Webhook cancelled', {
      webhookId,
      reason
    })

    return true
  }

  /**
   * Reprocessa webhook da dead letter queue
   */
  async reprocessWebhook(webhookId: string): Promise<boolean> {
    try {
      loggerService.debug('Reprocessamento de webhook desabilitado - persistência de banco de dados removida', { webhookId })
      // Database persistence disabled - webhook reprocessing not available
      return false
    } catch (error) {
      loggerService.error('Failed to reprocess webhook', {
        webhookId,
        error: (error as Error).message
      })
      return false
    }
  }

  /**
   * Obtém estatísticas
   */
  async getStats(): Promise<WebhookStats> {
    const now = Date.now()
    
    // Atualiza throughput
    if (now - this.stats.lastThroughputReset > 60000) {
      this.stats.throughputCounter = 0
      this.stats.lastThroughputReset = now
    }

    const pendingCount = Array.from(this.webhookQueue.values())
      .filter(w => !this.processingWebhooks.has(w.id)).length
    
    const averageRetries = this.stats.totalProcessed > 0 
      ? this.stats.totalRetries / this.stats.totalProcessed 
      : 0
    
    const averageProcessingTime = this.stats.processingTimes.length > 0 
      ? this.stats.processingTimes.reduce((a, b) => a + b, 0) / this.stats.processingTimes.length 
      : 0
    
    const successRate = this.stats.totalProcessed > 0 
      ? (this.stats.totalSuccess / this.stats.totalProcessed) * 100 
      : 0

    // Obtém estatísticas dos circuit breakers
    const circuitBreakerStats: Record<string, any> = {}
    for (const [domain, cb] of Array.from(this.circuitBreakers.entries())) {
      circuitBreakerStats[domain] = cb.getStats()
    }

    return {
      totalWebhooks: this.stats.totalProcessed,
      pendingWebhooks: pendingCount,
      processingWebhooks: this.processingWebhooks.size,
      successfulWebhooks: this.stats.totalSuccess,
      failedWebhooks: this.stats.totalFailed,
      deadLetterWebhooks: 0, // Seria obtido do banco de dados
      averageRetries,
      averageProcessingTime,
      successRate,
      circuitBreakerStats,
      queueDepth: this.webhookQueue.size,
      throughputPerMinute: this.stats.throughputCounter
    }
  }

  /**
   * Obtém webhooks na fila
   */
  getQueuedWebhooks(): WebhookPayload[] {
    return Array.from(this.webhookQueue.values())
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority
        }
        return a.createdAt - b.createdAt
      })
  }

  /**
   * Destrói o serviço
   */
  async destroy() {
    if (this.processingTimer) {
      clearInterval(this.processingTimer)
      this.processingTimer = null
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    // Destrói circuit breakers
    for (const cb of Array.from(this.circuitBreakers.values())) {
      cb.destroy()
    }
    this.circuitBreakers.clear()

    this.webhookQueue.clear()
    this.processingWebhooks.clear()
    this.attempts.clear()
    this.isInitialized = false
    
    loggerService.info('Webhook retry service destroyed', {})
  }

  /**
   * Verifica se o serviço está pronto
   */
  isReady(): boolean {
    return this.isInitialized
  }
}

/**
 * Instância singleton do serviço de retry de webhooks
 */
export const webhookRetryService = new WebhookRetryService()

/**
 * Utilitários para webhooks
 */
export const WebhookUtils = {
  /**
   * Cria webhook para notificação
   */
  createNotificationWebhook: (
    url: string,
    data: any,
    priority: WebhookPriority = WebhookPriority.NORMAL
  ): Omit<WebhookPayload, 'id' | 'createdAt'> => ({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data,
    priority,
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 10000,
    metadata: {
      type: 'notification',
      createdBy: 'system'
    }
  }),

  /**
   * Cria webhook para integração
   */
  createIntegrationWebhook: (
    url: string,
    data: any,
    apiKey?: string
  ): Omit<WebhookPayload, 'id' | 'createdAt'> => ({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
    },
    body: data,
    priority: WebhookPriority.HIGH,
    maxRetries: 5,
    retryDelay: 2000,
    timeout: 30000,
    metadata: {
      type: 'integration',
      createdBy: 'system'
    }
  })
}

export default webhookRetryService