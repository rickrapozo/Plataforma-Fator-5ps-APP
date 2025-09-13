import { loggerService } from './loggerService'
import { apmService } from './apmService'

/**
 * Estados do Circuit Breaker
 */
export enum CircuitState {
  CLOSED = 'closed',     // Funcionando normalmente
  OPEN = 'open',         // Falhas detectadas, bloqueando chamadas
  HALF_OPEN = 'half_open' // Testando se o serviço se recuperou
}

/**
 * Configuração do Circuit Breaker
 */
export interface CircuitBreakerConfig {
  name: string
  failureThreshold: number      // Número de falhas para abrir o circuito
  recoveryTimeout: number       // Tempo para tentar recuperação (ms)
  monitoringPeriod: number      // Período de monitoramento (ms)
  successThreshold: number      // Sucessos necessários para fechar o circuito
  timeout: number               // Timeout para operações (ms)
  maxRetries: number            // Máximo de tentativas
  retryDelay: number            // Delay entre tentativas (ms)
  exponentialBackoff: boolean   // Usar backoff exponencial
  healthCheckInterval: number   // Intervalo de health check (ms)
  enableMetrics: boolean        // Habilitar métricas
  fallbackEnabled: boolean      // Habilitar fallback
}

/**
 * Configuração padrão
 */
const DEFAULT_CONFIG: Omit<CircuitBreakerConfig, 'name'> = {
  failureThreshold: 5,
  recoveryTimeout: 60000,
  monitoringPeriod: 10000,
  successThreshold: 3,
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  healthCheckInterval: 30000,
  enableMetrics: true,
  fallbackEnabled: true
}

/**
 * Estatísticas do Circuit Breaker
 */
export interface CircuitBreakerStats {
  name: string
  state: CircuitState
  failureCount: number
  successCount: number
  totalRequests: number
  lastFailureTime: number | null
  lastSuccessTime: number | null
  uptime: number
  errorRate: number
  averageResponseTime: number
  isHealthy: boolean
}

/**
 * Resultado de operação
 */
export interface OperationResult<T> {
  success: boolean
  data?: T
  error?: Error
  fromFallback: boolean
  duration: number
  retryCount: number
}

/**
 * Classe principal do Circuit Breaker
 */
export class CircuitBreaker<T = any> {
  private config: CircuitBreakerConfig
  private state: CircuitState = CircuitState.CLOSED
  private failureCount = 0
  private successCount = 0
  private totalRequests = 0
  private lastFailureTime: number | null = null
  private lastSuccessTime: number | null = null
  private nextAttemptTime = 0
  private responseTimes: number[] = []
  private healthCheckTimer: NodeJS.Timeout | null = null
  private metricsTimer: NodeJS.Timeout | null = null
  private startTime = Date.now()

  constructor(
    config: Partial<CircuitBreakerConfig> & { name: string }
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initialize()
  }

  private initialize() {
    // Inicia health check periódico
    if (this.config.healthCheckInterval > 0) {
      this.healthCheckTimer = setInterval(() => {
        this.performHealthCheck()
      }, this.config.healthCheckInterval)
    }

    // Inicia coleta de métricas
    if (this.config.enableMetrics) {
      this.metricsTimer = setInterval(() => {
        this.recordMetrics()
      }, this.config.monitoringPeriod)
    }

    loggerService.info(`Circuit breaker initialized: ${this.config.name}`, {
      config: this.config
    })
  }

  /**
   * Executa uma operação com proteção do circuit breaker
   */
  async execute<R = T>(
    operation: () => Promise<R>,
    fallback?: () => Promise<R> | R
  ): Promise<OperationResult<R>> {
    const startTime = Date.now()
    let retryCount = 0
    this.totalRequests++

    // Verifica se o circuito está aberto
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        return this.handleFallback(fallback, startTime, retryCount, new Error('Circuit breaker is OPEN'))
      } else {
        // Transição para HALF_OPEN
        this.state = CircuitState.HALF_OPEN
        loggerService.info(`Circuit breaker transitioning to HALF_OPEN: ${this.config.name}`, {})
      }
    }

    // Executa a operação com retry
    while (retryCount <= this.config.maxRetries) {
      try {
        const result = await this.executeWithTimeout(operation)
        const duration = Date.now() - startTime
        
        this.onSuccess(duration)
        
        return {
          success: true,
          data: result,
          fromFallback: false,
          duration,
          retryCount
        }
      } catch (error) {
        retryCount++
        
        if (retryCount > this.config.maxRetries) {
          this.onFailure(error as Error)
          return this.handleFallback(fallback, startTime, retryCount, error as Error)
        }

        // Delay antes da próxima tentativa
        const delay = this.calculateRetryDelay(retryCount)
        await this.sleep(delay)
        
        loggerService.warn(`Circuit breaker retry ${retryCount}/${this.config.maxRetries}: ${this.config.name}`, {
          error: (error as Error).message,
          delay
        })
      }
    }

    // Não deveria chegar aqui, mas por segurança
    return this.handleFallback(fallback, startTime, retryCount, new Error('Max retries exceeded'))
  }

  /**
   * Executa operação com timeout
   */
  private async executeWithTimeout<R>(operation: () => Promise<R>): Promise<R> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timeout after ${this.config.timeout}ms`))
      }, this.config.timeout)

      operation()
        .then(result => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  /**
   * Calcula delay para retry com backoff exponencial
   */
  private calculateRetryDelay(retryCount: number): number {
    if (!this.config.exponentialBackoff) {
      return this.config.retryDelay
    }

    const exponentialDelay = this.config.retryDelay * Math.pow(2, retryCount - 1)
    const jitter = Math.random() * 1000 // Adiciona jitter para evitar thundering herd
    
    return Math.min(exponentialDelay + jitter, 30000) // Máximo de 30 segundos
  }

  /**
   * Manipula fallback quando a operação falha
   */
  private async handleFallback<R>(
    fallback: (() => Promise<R> | R) | undefined,
    startTime: number,
    retryCount: number,
    error: Error
  ): Promise<OperationResult<R>> {
    const duration = Date.now() - startTime

    if (fallback && this.config.fallbackEnabled) {
      try {
        const fallbackResult = await fallback()
        
        loggerService.info(`Circuit breaker fallback executed: ${this.config.name}`, {
          duration,
          retryCount
        })
        
        return {
          success: true,
          data: fallbackResult,
          fromFallback: true,
          duration,
          retryCount
        }
      } catch (fallbackError) {
        loggerService.error(`Circuit breaker fallback failed: ${this.config.name}`, {
          originalError: error.message,
          fallbackError: (fallbackError as Error).message,
          duration,
          retryCount
        })
        
        return {
          success: false,
          error: fallbackError as Error,
          fromFallback: true,
          duration,
          retryCount
        }
      }
    }

    return {
      success: false,
      error,
      fromFallback: false,
      duration,
      retryCount
    }
  }

  /**
   * Manipula sucesso da operação
   */
  private onSuccess(duration: number) {
    this.successCount++
    this.lastSuccessTime = Date.now()
    this.responseTimes.push(duration)
    
    // Limita o array de tempos de resposta
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100)
    }

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED
        this.failureCount = 0
        
        loggerService.info(`Circuit breaker closed: ${this.config.name}`, {
          successCount: this.successCount
        })
      }
    } else if (this.state === CircuitState.OPEN) {
      // Reset failure count on success
      this.failureCount = 0
    }

    if (this.config.enableMetrics) {
      apmService.recordMetric(
        'circuit_breaker.success',
        1,
        'count',
        {
          name: this.config.name,
          state: this.state,
          duration: duration.toString()
        }
      )
    }
  }

  /**
   * Manipula falha da operação
   */
  private onFailure(error: Error) {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.state === CircuitState.CLOSED || this.state === CircuitState.HALF_OPEN) {
      if (this.failureCount >= this.config.failureThreshold) {
        this.state = CircuitState.OPEN
        this.nextAttemptTime = Date.now() + this.config.recoveryTimeout
        this.successCount = 0
        
        loggerService.error(`Circuit breaker opened: ${this.config.name}`, {
          failureCount: this.failureCount,
          threshold: this.config.failureThreshold,
          nextAttemptTime: new Date(this.nextAttemptTime).toISOString()
        })
      }
    }

    if (this.config.enableMetrics) {
      apmService.recordError(error, 'error', {
        context: 'circuit_breaker',
        name: this.config.name,
        state: this.state,
        failureCount: this.failureCount.toString()
      })

      apmService.recordMetric(
        'circuit_breaker.failure',
        1,
        'count',
        {
          name: this.config.name,
          state: this.state,
          errorType: error.name
        }
      )
    }
  }

  /**
   * Realiza health check do serviço
   */
  private async performHealthCheck() {
    if (this.state !== CircuitState.OPEN) return

    try {
      // Implementação básica de health check
      // Pode ser customizada para cada serviço
      const isHealthy = await this.basicHealthCheck()
      
      if (isHealthy) {
        loggerService.info(`Health check passed: ${this.config.name}`, {})
        // Não muda o estado automaticamente, deixa para a próxima operação
      }
    } catch (error) {
      loggerService.warn(`Health check failed: ${this.config.name}`, {
        error: (error as Error).message
      })
    }
  }

  /**
   * Health check básico (pode ser sobrescrito)
   */
  protected async basicHealthCheck(): Promise<boolean> {
    // Implementação padrão - sempre retorna true
    // Deve ser sobrescrita para implementar verificação real
    return true
  }

  /**
   * Registra métricas periódicas
   */
  private recordMetrics() {
    if (!this.config.enableMetrics) return

    const stats = this.getStats()
    
    apmService.recordMetric(
      'circuit_breaker.state',
      this.state === CircuitState.CLOSED ? 0 : this.state === CircuitState.HALF_OPEN ? 1 : 2,
      'gauge',
      { name: this.config.name }
    )

    apmService.recordMetric(
      'circuit_breaker.failure_rate',
      stats.errorRate,
      'percentage',
      { name: this.config.name }
    )

    apmService.recordMetric(
      'circuit_breaker.avg_response_time',
      stats.averageResponseTime,
      'ms',
      { name: this.config.name }
    )

    apmService.recordMetric(
      'circuit_breaker.total_requests',
      this.totalRequests,
      'count',
      { name: this.config.name }
    )
  }

  /**
   * Utilitário para sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Obtém estatísticas do circuit breaker
   */
  getStats(): CircuitBreakerStats {
    const now = Date.now()
    const uptime = now - this.startTime
    const errorRate = this.totalRequests > 0 ? (this.failureCount / this.totalRequests) * 100 : 0
    const averageResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0

    return {
      name: this.config.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      uptime,
      errorRate,
      averageResponseTime,
      isHealthy: this.state === CircuitState.CLOSED
    }
  }

  /**
   * Força abertura do circuito
   */
  forceOpen() {
    this.state = CircuitState.OPEN
    this.nextAttemptTime = Date.now() + this.config.recoveryTimeout
    
    loggerService.warn(`Circuit breaker force opened: ${this.config.name}`, {})
  }

  /**
   * Força fechamento do circuito
   */
  forceClose() {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    
    loggerService.info(`Circuit breaker force closed: ${this.config.name}`, {})
  }

  /**
   * Reset das estatísticas
   */
  reset() {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.totalRequests = 0
    this.lastFailureTime = null
    this.lastSuccessTime = null
    this.responseTimes = []
    this.startTime = Date.now()
    
    loggerService.info(`Circuit breaker reset: ${this.config.name}`, {})
  }

  /**
   * Atualiza configuração
   */
  updateConfig(newConfig: Partial<CircuitBreakerConfig>) {
    this.config = { ...this.config, ...newConfig }
    
    loggerService.info(`Circuit breaker config updated: ${this.config.name}`, {
      newConfig
    })
  }

  /**
   * Destrói o circuit breaker
   */
  destroy() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
      this.healthCheckTimer = null
    }

    if (this.metricsTimer) {
      clearInterval(this.metricsTimer)
      this.metricsTimer = null
    }

    loggerService.info(`Circuit breaker destroyed: ${this.config.name}`, {})
  }
}

/**
 * Gerenciador de múltiplos circuit breakers
 */
export class CircuitBreakerManager {
  private breakers = new Map<string, CircuitBreaker>()

  /**
   * Cria ou obtém um circuit breaker
   */
  getOrCreate<T = any>(
    name: string, 
    config?: Partial<CircuitBreakerConfig>
  ): CircuitBreaker<T> {
    if (!this.breakers.has(name)) {
      const breaker = new CircuitBreaker<T>({ name, ...config })
      this.breakers.set(name, breaker)
    }
    
    return this.breakers.get(name) as CircuitBreaker<T>
  }

  /**
   * Remove um circuit breaker
   */
  remove(name: string): boolean {
    const breaker = this.breakers.get(name)
    if (breaker) {
      breaker.destroy()
      return this.breakers.delete(name)
    }
    return false
  }

  /**
   * Obtém estatísticas de todos os circuit breakers
   */
  getAllStats(): CircuitBreakerStats[] {
    return Array.from(this.breakers.values()).map(breaker => breaker.getStats())
  }

  /**
   * Obtém circuit breakers não saudáveis
   */
  getUnhealthyBreakers(): CircuitBreakerStats[] {
    return this.getAllStats().filter(stats => !stats.isHealthy)
  }

  /**
   * Reset de todos os circuit breakers
   */
  resetAll() {
    this.breakers.forEach(breaker => breaker.reset())
  }

  /**
   * Destrói todos os circuit breakers
   */
  destroyAll() {
    this.breakers.forEach(breaker => breaker.destroy())
    this.breakers.clear()
  }
}

/**
 * Instância singleton do gerenciador
 */
export const circuitBreakerManager = new CircuitBreakerManager()

/**
 * Decorator para aplicar circuit breaker em métodos
 */
export function WithCircuitBreaker(
  name: string,
  config?: Partial<CircuitBreakerConfig>
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const breaker = circuitBreakerManager.getOrCreate(name, config)

    descriptor.value = async function (...args: any[]) {
      const result = await breaker.execute(
        () => method.apply(this, args)
      )
      
      if (!result.success) {
        throw result.error
      }
      
      return result.data
    }
  }
}

/**
 * Configurações pré-definidas para diferentes tipos de serviços
 */
export const CircuitBreakerPresets = {
  // Para APIs externas críticas
  CRITICAL_API: {
    failureThreshold: 3,
    recoveryTimeout: 30000,
    timeout: 10000,
    maxRetries: 2,
    exponentialBackoff: true
  } as Partial<CircuitBreakerConfig>,

  // Para APIs externas não críticas
  EXTERNAL_API: {
    failureThreshold: 5,
    recoveryTimeout: 60000,
    timeout: 30000,
    maxRetries: 3,
    exponentialBackoff: true
  } as Partial<CircuitBreakerConfig>,

  // Para serviços internos
  INTERNAL_SERVICE: {
    failureThreshold: 10,
    recoveryTimeout: 15000,
    timeout: 5000,
    maxRetries: 1,
    exponentialBackoff: false
  } as Partial<CircuitBreakerConfig>,

  // Para operações de banco de dados
  DATABASE: {
    failureThreshold: 5,
    recoveryTimeout: 30000,
    timeout: 15000,
    maxRetries: 2,
    exponentialBackoff: true,
    healthCheckInterval: 10000
  } as Partial<CircuitBreakerConfig>
}

export default CircuitBreaker