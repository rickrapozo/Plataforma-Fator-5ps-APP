import { apmService } from './apmService'

/**
 * Níveis de log disponíveis
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

/**
 * Interface para entrada de log
 */
export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  metadata?: Record<string, any>
  error?: Error
  userId?: string
  sessionId?: string
  requestId?: string
  component?: string
  action?: string
  duration?: number
  tags?: string[]
}

/**
 * Interface para configuração do logger
 */
export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableAPM: boolean
  enableStorage: boolean
  enableRemote: boolean
  maxStorageEntries: number
  flushInterval: number
  remoteEndpoint?: string
  contextualInfo: {
    includeUserAgent: boolean
    includeUrl: boolean
    includeTimestamp: boolean
    includeSessionId: boolean
  }
  filters: {
    excludePatterns: string[]
    includeOnlyPatterns: string[]
    sensitiveFields: string[]
  }
}

/**
 * Configuração padrão do logger
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableAPM: true,
  enableStorage: true,
  enableRemote: process.env.NODE_ENV === 'production',
  maxStorageEntries: 1000,
  flushInterval: 30000,
  remoteEndpoint: process.env.VITE_LOGGING_ENDPOINT,
  contextualInfo: {
    includeUserAgent: true,
    includeUrl: true,
    includeTimestamp: true,
    includeSessionId: true
  },
  filters: {
    excludePatterns: ['password', 'token', 'secret', 'key'],
    includeOnlyPatterns: [],
    sensitiveFields: ['password', 'token', 'authorization', 'cookie', 'session']
  }
}

/**
 * Classe principal do sistema de logging
 */
class LoggerService {
  private config: LoggerConfig
  private logBuffer: LogEntry[] = []
  private sessionId: string
  private flushTimer: NodeJS.Timeout | null = null
  private isInitialized = false

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
    this.initialize()
  }

  /**
   * Inicializa o serviço de logging
   */
  private initialize() {
    if (this.isInitialized) return

    // Configura flush automático
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush()
      }, this.config.flushInterval)
    }

    // Captura erros não tratados
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.error('Uncaught error', {
          context: 'window.error',
          error: event.error,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled promise rejection', {
          context: 'window.unhandledrejection',
          reason: event.reason
        })
      })
    }

    this.isInitialized = true
    this.info('Logger service initialized', {
      context: 'logger.init',
      config: this.sanitizeConfig(this.config)
    })
  }

  /**
   * Gera um ID único para a sessão
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Sanitiza a configuração removendo informações sensíveis
   */
  private sanitizeConfig(config: Partial<LoggerConfig>): Partial<LoggerConfig> {
    const { remoteEndpoint, ...safeConfig } = config
    return {
      ...safeConfig,
      remoteEndpoint: remoteEndpoint ? '[REDACTED]' : undefined
    }
  }

  /**
   * Verifica se o nível de log deve ser processado
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level
  }

  /**
   * Sanitiza metadados removendo campos sensíveis
   */
  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    if (!metadata) return {}

    const sanitized = { ...metadata }
    const sensitiveFields = this.config.filters.sensitiveFields

    const sanitizeObject = (obj: any, path = ''): any => {
      if (typeof obj !== 'object' || obj === null) return obj

      if (Array.isArray(obj)) {
        return obj.map((item, index) => sanitizeObject(item, `${path}[${index}]`))
      }

      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key
        const isKeySensitive = sensitiveFields.some(field => 
          key.toLowerCase().includes(field.toLowerCase()) ||
          fullPath.toLowerCase().includes(field.toLowerCase())
        )

        if (isKeySensitive) {
          result[key] = '[REDACTED]'
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value, fullPath)
        } else {
          result[key] = value
        }
      }
      return result
    }

    return sanitizeObject(sanitized)
  }

  /**
   * Adiciona informações contextuais ao log
   */
  private addContextualInfo(entry: Partial<LogEntry>): LogEntry {
    const contextualInfo: Record<string, any> = {}

    if (this.config.contextualInfo.includeTimestamp) {
      entry.timestamp = new Date().toISOString()
    }

    if (this.config.contextualInfo.includeSessionId) {
      entry.sessionId = this.sessionId
    }

    if (typeof window !== 'undefined') {
      if (this.config.contextualInfo.includeUrl) {
        contextualInfo.url = window.location.href
        contextualInfo.pathname = window.location.pathname
      }

      if (this.config.contextualInfo.includeUserAgent) {
        contextualInfo.userAgent = navigator.userAgent
      }

      contextualInfo.viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }

    return {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message: '',
      sessionId: this.sessionId,
      ...entry,
      metadata: {
        ...contextualInfo,
        ...this.sanitizeMetadata(entry.metadata || {})
      }
    } as LogEntry
  }

  /**
   * Processa uma entrada de log
   */
  private processLogEntry(entry: Partial<LogEntry>) {
    const fullEntry = this.addContextualInfo(entry)

    // Verifica filtros
    if (this.shouldFilterOut(fullEntry)) {
      return
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(fullEntry)
    }

    // APM integration
    if (this.config.enableAPM) {
      this.logToAPM(fullEntry)
    }

    // Storage
    if (this.config.enableStorage) {
      this.addToBuffer(fullEntry)
    }

    // Remote logging
    if (this.config.enableRemote && fullEntry.level >= LogLevel.WARN) {
      this.sendToRemote(fullEntry)
    }
  }

  /**
   * Verifica se o log deve ser filtrado
   */
  private shouldFilterOut(entry: LogEntry): boolean {
    const { excludePatterns, includeOnlyPatterns } = this.config.filters
    const message = entry.message.toLowerCase()
    const context = entry.context?.toLowerCase() || ''

    // Verifica padrões de exclusão
    if (excludePatterns.some(pattern => 
      message.includes(pattern.toLowerCase()) || 
      context.includes(pattern.toLowerCase())
    )) {
      return true
    }

    // Verifica padrões de inclusão (se especificados)
    if (includeOnlyPatterns.length > 0) {
      return !includeOnlyPatterns.some(pattern => 
        message.includes(pattern.toLowerCase()) || 
        context.includes(pattern.toLowerCase())
      )
    }

    return false
  }

  /**
   * Log para console com formatação
   */
  private logToConsole(entry: LogEntry) {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL']
    const levelColors = {
      [LogLevel.DEBUG]: 'color: #6b7280',
      [LogLevel.INFO]: 'color: #3b82f6',
      [LogLevel.WARN]: 'color: #f59e0b',
      [LogLevel.ERROR]: 'color: #ef4444',
      [LogLevel.CRITICAL]: 'color: #dc2626; font-weight: bold'
    }

    const prefix = `[${entry.timestamp}] [${levelNames[entry.level]}]`
    const style = levelColors[entry.level]

    if (entry.level >= LogLevel.ERROR && entry.error) {
      console.group(`%c${prefix} ${entry.message}`, style)
      console.error(entry.error)
      if (entry.metadata) console.table(entry.metadata)
      console.groupEnd()
    } else {
      const logMethod = entry.level >= LogLevel.ERROR ? 'error' : 
                       entry.level >= LogLevel.WARN ? 'warn' : 'log'
      
      console[logMethod](`%c${prefix} ${entry.message}`, style, entry.metadata || '')
    }
  }

  /**
   * Envia log para APM
   */
  private logToAPM(entry: LogEntry) {
    try {
      if (entry.level >= LogLevel.ERROR) {
        const error = entry.error || new Error(entry.message)
        apmService.recordError(error, entry.level === LogLevel.CRITICAL ? 'critical' : 'error', {
          context: entry.context,
          component: entry.component,
          action: entry.action,
          userId: entry.userId,
          sessionId: entry.sessionId,
          requestId: entry.requestId,
          ...entry.metadata
        })
      }

      // Registra métrica de log
      apmService.recordMetric(
        'logging.entry',
        1,
        'count',
        {
          level: LogLevel[entry.level],
          context: entry.context || 'unknown',
          component: entry.component || 'unknown'
        }
      )

      // Registra duração se disponível
      if (entry.duration) {
        apmService.recordMetric(
          'logging.operation_duration',
          entry.duration,
          'ms',
          {
            context: entry.context || 'unknown',
            action: entry.action || 'unknown'
          }
        )
      }
    } catch (error) {
      console.error('Failed to send log to APM:', error)
    }
  }

  /**
   * Adiciona entrada ao buffer
   */
  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry)

    // Limita o tamanho do buffer
    if (this.logBuffer.length > this.config.maxStorageEntries) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxStorageEntries)
    }
  }

  /**
   * Envia log para endpoint remoto
   */
  private async sendToRemote(entry: LogEntry) {
    if (!this.config.remoteEndpoint) return

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      })
    } catch (error) {
      console.error('Failed to send log to remote endpoint:', error)
    }
  }

  /**
   * Métodos públicos de logging
   */
  debug(message: string, metadata?: Record<string, any>, context?: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    this.processLogEntry({ level: LogLevel.DEBUG, message, metadata, context })
  }

  info(message: string, metadata?: Record<string, any>, context?: string) {
    if (!this.shouldLog(LogLevel.INFO)) return
    this.processLogEntry({ level: LogLevel.INFO, message, metadata, context })
  }

  warn(message: string, metadata?: Record<string, any>, context?: string) {
    if (!this.shouldLog(LogLevel.WARN)) return
    this.processLogEntry({ level: LogLevel.WARN, message, metadata, context })
  }

  error(message: string, metadata?: Record<string, any>, context?: string, error?: Error) {
    if (!this.shouldLog(LogLevel.ERROR)) return
    this.processLogEntry({ level: LogLevel.ERROR, message, metadata, context, error })
  }

  critical(message: string, metadata?: Record<string, any>, context?: string, error?: Error) {
    if (!this.shouldLog(LogLevel.CRITICAL)) return
    this.processLogEntry({ level: LogLevel.CRITICAL, message, metadata, context, error })
  }

  /**
   * Métodos especializados
   */
  logUserAction(action: string, userId: string, metadata?: Record<string, any>) {
    this.info(`User action: ${action}`, {
      ...metadata,
      userId,
      category: 'user_action'
    }, 'user.action')
  }

  logAPICall(method: string, url: string, duration: number, status: number, metadata?: Record<string, any>) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
    this.processLogEntry({
      level,
      message: `API ${method} ${url} - ${status}`,
      duration,
      metadata: {
        ...metadata,
        method,
        url,
        status,
        category: 'api_call'
      },
      context: 'api.call'
    })
  }

  logPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
    this.info(`Performance: ${operation}`, {
      ...metadata,
      duration,
      category: 'performance'
    }, 'performance')
  }

  logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', metadata?: Record<string, any>) {
    const levelMap = {
      low: LogLevel.INFO,
      medium: LogLevel.WARN,
      high: LogLevel.ERROR,
      critical: LogLevel.CRITICAL
    }

    this.processLogEntry({
      level: levelMap[severity],
      message: `Security event: ${event}`,
      metadata: {
        ...metadata,
        severity,
        category: 'security'
      },
      context: 'security'
    })
  }

  /**
   * Utilitários
   */
  flush() {
    if (this.logBuffer.length === 0) return

    // Aqui você pode implementar envio em lote para storage persistente
    this.debug(`Flushing ${this.logBuffer.length} log entries`, {
      bufferSize: this.logBuffer.length
    }, 'logger.flush')

    // Limpa o buffer após flush
    this.logBuffer = []
  }

  getBuffer(): LogEntry[] {
    return [...this.logBuffer]
  }

  clearBuffer() {
    this.logBuffer = []
  }

  configure(newConfig: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...newConfig }
    this.info('Logger configuration updated', {
      newConfig: this.sanitizeConfig(newConfig)
    }, 'logger.config')
  }

  updateConfig(newConfig: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...newConfig }
    this.info('Logger configuration updated', {
      newConfig: this.sanitizeConfig(newConfig)
    }, 'logger.config')
  }

  getStats() {
    return {
      bufferSize: this.logBuffer.length,
      maxBufferSize: this.config.maxStorageEntries,
      sessionId: this.sessionId,
      isInitialized: this.isInitialized,
      config: this.sanitizeConfig(this.config)
    }
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }

    this.flush()
    this.isInitialized = false
    
    this.info('Logger service destroyed', {}, 'logger.destroy')
  }
}

/**
 * Instância singleton do logger
 */
export const logger = new LoggerService()
export const loggerService = logger

/**
 * Decorator para logging automático de métodos
 */
export function LogMethod(context?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = function (...args: any[]) {
      const startTime = Date.now()
      const methodContext = context || `${target.constructor.name}.${propertyName}`

      logger.debug(`Method ${propertyName} called`, {
        args: args.length,
        className: target.constructor.name
      }, methodContext)

      try {
        const result = method.apply(this, args)

        if (result instanceof Promise) {
          return result
            .then((res) => {
              const duration = Date.now() - startTime
              logger.debug(`Method ${propertyName} completed`, {
                duration,
                className: target.constructor.name
              }, methodContext)
              return res
            })
            .catch((error) => {
              const duration = Date.now() - startTime
              logger.error(`Method ${propertyName} failed`, {
                duration,
                className: target.constructor.name,
                error: error.message
              }, methodContext, error)
              throw error
            })
        } else {
          const duration = Date.now() - startTime
          logger.debug(`Method ${propertyName} completed`, {
            duration,
            className: target.constructor.name
          }, methodContext)
          return result
        }
      } catch (error) {
        const duration = Date.now() - startTime
        logger.error(`Method ${propertyName} failed`, {
          duration,
          className: target.constructor.name,
          error: (error as Error).message
        }, methodContext, error as Error)
        throw error
      }
    }
  }
}

/**
 * Hook para usar logger em componentes React
 */
export function useLogger(context?: string) {
  const contextualLogger = {
    debug: (message: string, metadata?: Record<string, any>) => 
      logger.debug(message, metadata, context),
    info: (message: string, metadata?: Record<string, any>) => 
      logger.info(message, metadata, context),
    warn: (message: string, metadata?: Record<string, any>) => 
      logger.warn(message, metadata, context),
    error: (message: string, metadata?: Record<string, any>, error?: Error) => 
      logger.error(message, metadata, context, error),
    critical: (message: string, metadata?: Record<string, any>, error?: Error) => 
      logger.critical(message, metadata, context, error)
  }

  return contextualLogger
}

export default logger