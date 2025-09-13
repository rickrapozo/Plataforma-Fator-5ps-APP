import { supabase } from '../lib/supabase'
import { loggerService } from './loggerService'

// Interfaces para o sistema de APM
interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  timestamp: number
  tags?: Record<string, string>
  metadata?: Record<string, any>
}

interface ErrorEvent {
  id: string
  message: string
  stack?: string
  level: 'error' | 'warning' | 'critical'
  timestamp: number
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  metadata?: Record<string, any>
}

interface TransactionTrace {
  id: string
  name: string
  type: 'http' | 'database' | 'external' | 'custom'
  startTime: number
  endTime?: number
  duration?: number
  status: 'pending' | 'success' | 'error'
  metadata?: Record<string, any>
  spans?: SpanTrace[]
}

interface SpanTrace {
  id: string
  parentId?: string
  name: string
  startTime: number
  endTime?: number
  duration?: number
  tags?: Record<string, string>
  logs?: Array<{ timestamp: number; message: string; level: string }>
}

interface SystemHealth {
  timestamp: number
  cpu: number
  memory: number
  disk: number
  network: {
    latency: number
    throughput: number
  }
  database: {
    connections: number
    queryTime: number
    status: 'healthy' | 'degraded' | 'down'
  }
  redis?: {
    connections: number
    memory: number
    status: 'healthy' | 'degraded' | 'down'
  }
}

interface AlertRule {
  id: string
  name: string
  metric: string
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  threshold: number
  duration: number // em segundos
  enabled: boolean
  channels: string[] // email, slack, webhook
}

// Classe principal do APM Service
export class APMService {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private transactions: Map<string, TransactionTrace> = new Map()
  private errors: ErrorEvent[] = []
  private alertRules: AlertRule[] = []
  private isEnabled: boolean = true
  private initialized: boolean = false
  private batchSize: number = 100
  private flushInterval: number = 30000 // 30 segundos
  private maxRetention: number = 7 * 24 * 60 * 60 * 1000 // 7 dias

  constructor() {
    this.isEnabled = process.env.VITE_APM_ENABLED !== 'false'
    
    if (this.isEnabled) {
      this.startPeriodicFlush()
      this.startHealthMonitoring()
      this.setupErrorHandlers()
    }
  }

  /**
   * Registra uma métrica de performance
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    tags?: Record<string, string>,
    metadata?: Record<string, any>
  ): void {
    if (!this.isEnabled) return

    const metric: PerformanceMetric = {
      id: this.generateId(),
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
      metadata
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metricArray = this.metrics.get(name)!
    metricArray.push(metric)

    // Limita o número de métricas em memória
    if (metricArray.length > 1000) {
      metricArray.splice(0, 500) // Remove as mais antigas
    }

    // Verifica alertas
    this.checkAlerts(name, value)
  }

  /**
   * Inicia uma transação
   */
  startTransaction(
    name: string,
    type: TransactionTrace['type'] = 'custom',
    metadata?: Record<string, any>
  ): string {
    if (!this.isEnabled) return ''

    const transaction: TransactionTrace = {
      id: this.generateId(),
      name,
      type,
      startTime: Date.now(),
      status: 'pending',
      metadata,
      spans: []
    }

    this.transactions.set(transaction.id, transaction)
    return transaction.id
  }

  /**
   * Finaliza uma transação
   */
  endTransaction(transactionId: string, status: 'success' | 'error' = 'success'): void {
    if (!this.isEnabled || !transactionId) return

    const transaction = this.transactions.get(transactionId)
    if (!transaction) return

    transaction.endTime = Date.now()
    transaction.duration = transaction.endTime - transaction.startTime
    transaction.status = status

    // Registra como métrica
    this.recordMetric(
      `transaction.${transaction.name}.duration`,
      transaction.duration,
      'ms',
      { type: transaction.type, status }
    )

    // Remove da memória após um tempo
    setTimeout(() => {
      this.transactions.delete(transactionId)
    }, 60000) // 1 minuto
  }

  /**
   * Adiciona um span a uma transação
   */
  addSpan(
    transactionId: string,
    name: string,
    startTime?: number,
    parentSpanId?: string
  ): string {
    if (!this.isEnabled || !transactionId) return ''

    const transaction = this.transactions.get(transactionId)
    if (!transaction) return ''

    const span: SpanTrace = {
      id: this.generateId(),
      parentId: parentSpanId,
      name,
      startTime: startTime || Date.now(),
      tags: {},
      logs: []
    }

    transaction.spans!.push(span)
    return span.id
  }

  /**
   * Finaliza um span
   */
  endSpan(transactionId: string, spanId: string): void {
    if (!this.isEnabled || !transactionId || !spanId) return

    const transaction = this.transactions.get(transactionId)
    if (!transaction) return

    const span = transaction.spans?.find(s => s.id === spanId)
    if (!span) return

    span.endTime = Date.now()
    span.duration = span.endTime - span.startTime
  }

  /**
   * Registra um erro
   */
  recordError(
    error: Error | string,
    level: ErrorEvent['level'] = 'error',
    metadata?: Record<string, any>
  ): void {
    if (!this.isEnabled) return

    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      level,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      metadata
    }

    this.errors.push(errorEvent)

    // Limita o número de erros em memória
    if (this.errors.length > 500) {
      this.errors.splice(0, 250)
    }

    // Envia erro crítico imediatamente
    if (level === 'critical') {
      this.flushErrors([errorEvent])
    }
  }

  /**
   * Monitora performance de uma função
   */
  monitorFunction<T extends (...args: any[]) => any>(
    fn: T,
    name?: string
  ): T {
    if (!this.isEnabled) return fn

    const functionName = name || fn.name || 'anonymous'

    return ((...args: Parameters<T>) => {
      const transactionId = this.startTransaction(`function.${functionName}`, 'custom')
      const startTime = Date.now()

      try {
        const result = fn(...args)

        // Se é uma Promise, monitora de forma assíncrona
        if (result && typeof result.then === 'function') {
          return result
            .then((value: any) => {
              this.endTransaction(transactionId, 'success')
              this.recordMetric(`function.${functionName}.duration`, Date.now() - startTime)
              return value
            })
            .catch((error: any) => {
              this.endTransaction(transactionId, 'error')
              this.recordError(error, 'error', { function: functionName })
              throw error
            })
        }

        // Função síncrona
        this.endTransaction(transactionId, 'success')
        this.recordMetric(`function.${functionName}.duration`, Date.now() - startTime)
        return result
      } catch (error) {
        this.endTransaction(transactionId, 'error')
        this.recordError(error as Error, 'error', { function: functionName })
        throw error
      }
    }) as T
  }

  /**
   * Monitora requisições HTTP
   */
  monitorHttpRequest(url: string, method: string = 'GET'): {
    transactionId: string
    recordResponse: (status: number, duration?: number) => void
  } {
    if (!this.isEnabled) {
      return {
        transactionId: '',
        recordResponse: () => {}
      }
    }

    const transactionId = this.startTransaction(`http.${method}.${url}`, 'http', {
      url,
      method
    })

    return {
      transactionId,
      recordResponse: (status: number, duration?: number) => {
        const isSuccess = status >= 200 && status < 400
        this.endTransaction(transactionId, isSuccess ? 'success' : 'error')
        
        this.recordMetric('http.request.duration', duration || 0, 'ms', {
          method,
          status: status.toString(),
          url
        })

        this.recordMetric('http.request.count', 1, 'count', {
          method,
          status: status.toString(),
          url
        })
      }
    }
  }

  /**
   * Coleta métricas do sistema
   */
  async collectSystemHealth(): Promise<SystemHealth> {
    const health: SystemHealth = {
      timestamp: Date.now(),
      cpu: await this.getCpuUsage(),
      memory: await this.getMemoryUsage(),
      disk: await this.getDiskUsage(),
      network: {
        latency: await this.getNetworkLatency(),
        throughput: await this.getNetworkThroughput()
      },
      database: await this.getDatabaseHealth()
    }

    // Registra como métricas
    this.recordMetric('system.cpu', health.cpu, '%')
    this.recordMetric('system.memory', health.memory, '%')
    this.recordMetric('system.disk', health.disk, '%')
    this.recordMetric('network.latency', health.network.latency, 'ms')
    this.recordMetric('database.query_time', health.database.queryTime, 'ms')

    return health
  }

  /**
   * Configura regras de alerta
   */
  addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const alertRule: AlertRule = {
      ...rule,
      id: this.generateId()
    }

    this.alertRules.push(alertRule)
    return alertRule.id
  }

  /**
   * Verifica alertas para uma métrica
   */
  private checkAlerts(metricName: string, value: number): void {
    const relevantRules = this.alertRules.filter(
      rule => rule.enabled && rule.metric === metricName
    )

    for (const rule of relevantRules) {
      let triggered = false

      switch (rule.condition) {
        case 'gt':
          triggered = value > rule.threshold
          break
        case 'gte':
          triggered = value >= rule.threshold
          break
        case 'lt':
          triggered = value < rule.threshold
          break
        case 'lte':
          triggered = value <= rule.threshold
          break
        case 'eq':
          triggered = value === rule.threshold
          break
      }

      if (triggered) {
        this.triggerAlert(rule, value)
      }
    }
  }

  /**
   * Dispara um alerta
   */
  private async triggerAlert(rule: AlertRule, value: number): Promise<void> {
    const alert = {
      id: this.generateId(),
      ruleId: rule.id,
      ruleName: rule.name,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      timestamp: Date.now(),
      channels: rule.channels
    }

    loggerService.warn(`🚨 ALERTA APM: ${rule.name}`, { service: 'APMService', alert })

    // Salva no banco de dados
    try {
      await supabase
        .from('apm_alerts')
        .insert({
          rule_id: rule.id,
          rule_name: rule.name,
          metric: rule.metric,
          value,
          threshold: rule.threshold,
          triggered_at: new Date().toISOString(),
          channels: rule.channels
        })
    } catch (error) {
      loggerService.error('Erro ao salvar alerta', { service: 'APMService', error })
    }
  }

  /**
   * Flush periódico dos dados
   */
  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushData()
    }, this.flushInterval)
  }

  /**
   * Envia dados para o banco
   */
  private async flushData(): Promise<void> {
    try {
      // Flush métricas
      const metricsToFlush: PerformanceMetric[] = []
      for (const [name, metrics] of Array.from(this.metrics.entries())) {
        metricsToFlush.push(...metrics.splice(0, this.batchSize))
      }

      if (metricsToFlush.length > 0) {
        await this.flushMetrics(metricsToFlush)
      }

      // Flush erros
      if (this.errors.length > 0) {
        const errorsToFlush = this.errors.splice(0, this.batchSize)
        await this.flushErrors(errorsToFlush)
      }
    } catch (error) {
      loggerService.error('Erro no flush APM', { service: 'APMService', error })
    }
  }

  /**
   * Envia métricas para o banco
   */
  private async flushMetrics(metrics: PerformanceMetric[]): Promise<void> {
    const data = metrics.map(metric => ({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      timestamp: new Date(metric.timestamp).toISOString(),
      tags: metric.tags || {},
      metadata: metric.metadata || {}
    }))

    await supabase
      .from('apm_metrics')
      .insert(data)
  }

  /**
   * Envia erros para o banco
   */
  private async flushErrors(errors: ErrorEvent[]): Promise<void> {
    const data = errors.map(error => ({
      id: error.id,
      message: error.message,
      stack: error.stack,
      level: error.level,
      timestamp: new Date(error.timestamp).toISOString(),
      user_id: error.userId,
      session_id: error.sessionId,
      url: error.url,
      user_agent: error.userAgent,
      metadata: error.metadata || {}
    }))

    await supabase
      .from('apm_errors')
      .insert(data)
  }

  /**
   * Monitora saúde do sistema
   */
  private startHealthMonitoring(): void {
    setInterval(async () => {
      try {
        await this.collectSystemHealth()
      } catch (error) {
        loggerService.error('Erro no monitoramento de saúde', { service: 'APMService', error })
      }
    }, 60000) // A cada minuto
  }

  /**
   * Configura handlers de erro globais
   */
  private setupErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Erros JavaScript não capturados
      window.addEventListener('error', (event) => {
        this.recordError(event.error || event.message, 'error', {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        })
      })

      // Promises rejeitadas não capturadas
      window.addEventListener('unhandledrejection', (event) => {
        this.recordError(event.reason, 'error', {
          type: 'unhandled_promise_rejection'
        })
      })
    }
  }

  // Métodos auxiliares para coleta de métricas do sistema
  private async getCpuUsage(): Promise<number> {
    // Implementação simplificada - em produção usar APIs específicas
    return Math.random() * 100
  }

  private async getMemoryUsage(): Promise<number> {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory
      return (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    }
    return 0
  }

  private async getDiskUsage(): Promise<number> {
    // Implementação simplificada
    return Math.random() * 100
  }

  private async getNetworkLatency(): Promise<number> {
    try {
      const start = Date.now()
      await fetch('/api/health', { method: 'HEAD' })
      return Date.now() - start
    } catch {
      return -1
    }
  }

  private async getNetworkThroughput(): Promise<number> {
    // Implementação simplificada
    return Math.random() * 1000
  }

  private async getDatabaseHealth(): Promise<SystemHealth['database']> {
    try {
      const start = Date.now()
      await supabase.from('apm_health_check').select('id').limit(1)
      const queryTime = Date.now() - start

      return {
        connections: 1, // Supabase gerencia isso
        queryTime,
        status: queryTime < 1000 ? 'healthy' : queryTime < 3000 ? 'degraded' : 'down'
      }
    } catch {
      return {
        connections: 0,
        queryTime: -1,
        status: 'down'
      }
    }
  }

  private getCurrentUserId(): string | undefined {
    // Implementar lógica para obter ID do usuário atual
    return undefined
  }

  private getSessionId(): string | undefined {
    // Implementar lógica para obter ID da sessão
    return undefined
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Obtém estatísticas resumidas
   */
  async getStats(): Promise<{
    metricsCount: number
    errorsCount: number
    activeTransactions: number
    alertRules: number
  }> {
    let metricsCount = 0
    for (const metrics of Array.from(this.metrics.values())) {
      metricsCount += metrics.length
    }

    return {
      metricsCount,
      errorsCount: this.errors.length,
      activeTransactions: this.transactions.size,
      alertRules: this.alertRules.length
    }
  }

  /**
   * Destrói o serviço
   */
  async initialize(config?: any): Promise<void> {
    if (this.initialized) return
    
    if (config) {
      this.isEnabled = config.enabled ?? true
      this.batchSize = config.batchSize ?? 100
      this.flushInterval = config.flushInterval ?? 30000
    }
    
    if (this.isEnabled) {
      this.startPeriodicFlush()
      this.startHealthMonitoring()
      this.setupErrorHandlers()
    }
    
    this.initialized = true
  }

  isInitialized(): boolean {
    return this.initialized
  }

  async cleanup(): Promise<void> {
    await this.destroy()
    this.initialized = false
  }

  async destroy(): Promise<void> {
    await this.flushData()
    this.metrics.clear()
    this.transactions.clear()
    this.errors.length = 0
    this.alertRules.length = 0
  }
}

// Instância singleton
export const apmService = new APMService()

// Decorador para monitoramento automático
export function Monitor(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const methodName = name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = apmService.monitorFunction(originalMethod, methodName)
    return descriptor
  }
}

// Hook para React
export function useAPM() {
  return {
    recordMetric: apmService.recordMetric.bind(apmService),
    recordError: apmService.recordError.bind(apmService),
    startTransaction: apmService.startTransaction.bind(apmService),
    endTransaction: apmService.endTransaction.bind(apmService),
    monitorFunction: apmService.monitorFunction.bind(apmService)
  }
}