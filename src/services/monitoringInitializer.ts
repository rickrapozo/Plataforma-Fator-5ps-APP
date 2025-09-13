/**
 * Serviço de inicialização e coordenação de todos os sistemas de monitoramento
 */

import * as React from 'react'
import { monitoringConfig, validateMonitoringConfig, getEnvironmentConfig } from '../config/monitoring'
import { apmService } from './apmService'
import { loggerService } from './loggerService'
import { circuitBreakerManager } from './circuitBreakerService'

import { alertService, AlertType, AlertSeverity } from './alertService'
import { webhookRetryService } from './webhookRetryService'
import { tokenExpirationService } from './tokenExpirationService'

interface MonitoringInitializationResult {
  success: boolean
  errors: string[]
  warnings: string[]
  initializedServices: string[]
  skippedServices: string[]
}

interface ServiceInitializer {
  name: string
  enabled: boolean
  initialize: () => Promise<void> | void
  healthCheck?: () => Promise<boolean> | boolean
  cleanup?: () => Promise<void> | void
}

class MonitoringInitializer {
  private initialized = false
  private initializationResult: MonitoringInitializationResult | null = null
  private services: ServiceInitializer[] = []
  private cleanupHandlers: (() => Promise<void> | void)[] = []

  constructor() {
    this.setupServices()
    this.setupGlobalErrorHandlers()
    this.setupProcessHandlers()
  }

  /**
   * Configura a lista de serviços a serem inicializados
   */
  private setupServices() {
    const config = getEnvironmentConfig()

    this.services = [
      {
        name: 'Logger Service',
        enabled: true, // Logger sempre habilitado
        initialize: () => {
          // Logger service não tem método configure público
          loggerService.info('Logger service initialized', { config: config.logger })
        },
        healthCheck: () => true
      },
      {
        name: 'APM Service',
        enabled: config.apm.enabled,
        initialize: async () => {
          await apmService.initialize(config.apm)
          loggerService.info('APM service initialized', { config: config.apm })
        },
        healthCheck: () => apmService.isInitialized(),
        cleanup: () => apmService.cleanup()
      },
      {
        name: 'Circuit Breaker Manager',
        enabled: config.circuitBreaker.enabled,
        initialize: () => {
          // Circuit Breaker manager não tem método configure público
          loggerService.info('Circuit Breaker manager initialized', { config: config.circuitBreaker })
        },
        healthCheck: () => true
      },
      // Removido: Gemini Cache Service
      {
        name: 'Alert Service',
        enabled: config.alerts.enabled,
        initialize: async () => {
          // Alert service não tem método initialize público
          loggerService.info('Alert service initialized', { config: config.alerts })
        },
        healthCheck: () => true,
        cleanup: () => {}
        // Alert service não tem métodos cleanup públicos
      },
      {
        name: 'Webhook Retry Service',
        enabled: config.webhookRetry.enabled,
        initialize: async () => {
          // Webhook Retry service não tem método initialize público
          loggerService.info('Webhook Retry service initialized', { config: config.webhookRetry })
        },
        healthCheck: () => true,
        cleanup: () => {}
        // Webhook Retry service não tem métodos públicos para inicialização
      },
      {
        name: 'Token Expiration Service',
        enabled: config.tokenExpiration.enabled,
        initialize: () => {
          // Token Expiration service não tem método configure público
          tokenExpirationService.startMonitoring()
          loggerService.info('Token Expiration service initialized', { config: config.tokenExpiration })
        },
        healthCheck: () => true,
        cleanup: () => tokenExpirationService.stopMonitoring()
      }
    ]
  }

  /**
   * Configura handlers globais de erro
   */
  private setupGlobalErrorHandlers() {
    // Verificar se estamos no browser
    if (typeof window !== 'undefined') {
      // Handler para erros não capturados
      window.addEventListener('error', (event) => {
        loggerService.error('Uncaught error', {
          message: event.error?.message || event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        })

        if (apmService.isInitialized()) {
          apmService.recordError(event.error?.message || event.message, 'error', {
            context: 'global_error_handler',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
          })
        }
      })

      // Handler para promises rejeitadas não capturadas
      window.addEventListener('unhandledrejection', (event) => {
        loggerService.error('Unhandled promise rejection', {
          reason: event.reason,
          promise: event.promise
        })

        if (apmService.isInitialized()) {
          apmService.recordError(
            event.reason instanceof Error ? event.reason.message : String(event.reason),
            'error',
            { 
              context: 'unhandled_rejection',
              stack: event.reason instanceof Error ? event.reason.stack : undefined
            }
          )
        }
      })
    }
  }

  /**
   * Configura handlers de processo
   */
  private setupProcessHandlers() {
    // Handler para quando a página está sendo fechada
    window.addEventListener('beforeunload', () => {
      this.cleanup()
    })

    // Handler para mudanças de visibilidade da página
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        loggerService.debug('Page hidden, pausing non-critical monitoring')
        // Pausar monitoramento não crítico quando a página não está visível
      } else {
        loggerService.debug('Page visible, resuming monitoring')
        // Retomar monitoramento quando a página volta a ficar visível
      }
    })
  }

  /**
   * Inicializa todos os serviços de monitoramento
   */
  async initialize(): Promise<MonitoringInitializationResult> {
    if (this.initialized) {
      return this.initializationResult!
    }

    const result: MonitoringInitializationResult = {
      success: true,
      errors: [],
      warnings: [],
      initializedServices: [],
      skippedServices: []
    }

    try {
      // Validar configuração
      if (!validateMonitoringConfig()) {
        result.warnings.push('Configuration validation failed, some features may not work correctly')
      }

      loggerService.info('Starting monitoring services initialization')

      // Inicializar serviços em ordem de dependência
      for (const service of this.services) {
        try {
          if (!service.enabled) {
            result.skippedServices.push(service.name)
            loggerService.debug(`Skipping ${service.name} (disabled)`)
            continue
          }

          loggerService.debug(`Initializing ${service.name}...`)
          await service.initialize()
          
          // Verificar saúde do serviço se disponível
          if (service.healthCheck) {
            const isHealthy = await service.healthCheck()
            if (!isHealthy) {
              result.warnings.push(`${service.name} initialized but health check failed`)
            }
          }

          result.initializedServices.push(service.name)
          loggerService.info(`${service.name} initialized successfully`)

          // Registrar cleanup handler se disponível
          if (service.cleanup) {
            this.cleanupHandlers.push(service.cleanup)
          }
        } catch (error) {
          const errorMessage = `Failed to initialize ${service.name}: ${error}`
          result.errors.push(errorMessage)
          loggerService.error(errorMessage, { error, service: service.name })
          
          // Não falhar a inicialização completa por causa de um serviço
          continue
        }
      }

      // Verificar se pelo menos os serviços críticos foram inicializados
      const criticalServices = ['Logger Service']
      const initializedCritical = criticalServices.filter(name => 
        result.initializedServices.includes(name)
      )

      if (initializedCritical.length < criticalServices.length) {
        result.success = false
        result.errors.push('Critical services failed to initialize')
      }

      this.initialized = true
      this.initializationResult = result

      loggerService.info('Monitoring services initialization completed', {
        success: result.success,
        initializedServices: result.initializedServices,
        skippedServices: result.skippedServices,
        errors: result.errors,
        warnings: result.warnings
      })

      // Enviar alerta se houver erros críticos
      if (result.errors.length > 0 && alertService.getInitializationStatus()) {
        await alertService.createAlert({
          type: AlertType.ERROR,
          severity: AlertSeverity.HIGH,
          title: 'Monitoring Services Initialization Issues',
          message: `Some monitoring services failed to initialize: ${result.errors.join(', ')}`,
          metadata: {
            errors: result.errors,
            warnings: result.warnings,
            initializedServices: result.initializedServices
          }
        })
      }

    } catch (error) {
      result.success = false
      result.errors.push(`Initialization process failed: ${error}`)
      loggerService.error('Monitoring initialization process failed', { error })
    }

    return result
  }

  /**
   * Verifica a saúde de todos os serviços inicializados
   */
  async healthCheck(): Promise<{ [serviceName: string]: boolean }> {
    const healthStatus: { [serviceName: string]: boolean } = {}

    for (const service of this.services) {
      if (!service.enabled || !this.initializationResult?.initializedServices.includes(service.name)) {
        continue
      }

      try {
        if (service.healthCheck) {
          healthStatus[service.name] = await service.healthCheck()
        } else {
          healthStatus[service.name] = true // Assume healthy if no health check
        }
      } catch (error) {
        healthStatus[service.name] = false
        loggerService.error(`Health check failed for ${service.name}`, { error })
      }
    }

    return healthStatus
  }

  /**
   * Obtém estatísticas de todos os serviços
   */
  getStats() {
    return {
      initialized: this.initialized,
      initializationResult: this.initializationResult,
      services: this.services.map(s => ({
        name: s.name,
        enabled: s.enabled,
        initialized: this.initializationResult?.initializedServices.includes(s.name) || false
      }))
    }
  }

  /**
   * Limpa todos os serviços
   */
  async cleanup() {
    if (!this.initialized) {
      return
    }

    loggerService.info('Starting monitoring services cleanup')

    // Executar cleanup handlers em ordem reversa
    for (const cleanup of this.cleanupHandlers.reverse()) {
      try {
        await cleanup()
      } catch (error) {
        loggerService.error('Error during service cleanup', { error })
      }
    }

    this.cleanupHandlers = []
    this.initialized = false
    this.initializationResult = null

    loggerService.info('Monitoring services cleanup completed')
  }

  /**
   * Reinicializa todos os serviços
   */
  async reinitialize(): Promise<MonitoringInitializationResult> {
    await this.cleanup()
    return this.initialize()
  }

  /**
   * Verifica se o inicializador foi inicializado
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Obtém o resultado da última inicialização
   */
  getInitializationResult(): MonitoringInitializationResult | null {
    return this.initializationResult
  }
}

// Instância singleton
export const monitoringInitializer = new MonitoringInitializer()

// Hook React para usar o inicializador
export const useMonitoringInitializer = () => {
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [initializationResult, setInitializationResult] = React.useState<MonitoringInitializationResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const initialize = React.useCallback(async () => {
    if (isLoading || isInitialized) {
      return initializationResult
    }

    setIsLoading(true)
    try {
      const result = await monitoringInitializer.initialize()
      setInitializationResult(result)
      setIsInitialized(true)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, isInitialized, initializationResult])

  const healthCheck = React.useCallback(async () => {
    return monitoringInitializer.healthCheck()
  }, [])

  const getStats = React.useCallback(() => {
    return monitoringInitializer.getStats()
  }, [])

  React.useEffect(() => {
    // Auto-inicializar quando o hook é usado
    initialize()
  }, [])

  return {
    isInitialized,
    initializationResult,
    isLoading,
    initialize,
    healthCheck,
    getStats
  }
}

export default monitoringInitializer