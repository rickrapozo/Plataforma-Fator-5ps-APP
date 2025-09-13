import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ErrorBoundary, CriticalErrorBoundary, RouteErrorBoundary, FormErrorBoundary } from './ErrorBoundary'
import { apmService } from '../services/apmService'
import { loggerService } from '../services/loggerService'
import { alertService } from '../services/alertService'

/**
 * Interface para configuração de error boundary
 */
interface ErrorBoundaryConfig {
  level: 'critical' | 'route' | 'form' | 'component'
  fallbackComponent?: React.ComponentType<any>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  enableRetry?: boolean
  maxRetries?: number
  enableReporting?: boolean
  context?: string
}

/**
 * Interface para contexto de error boundaries
 */
interface ErrorBoundaryContextType {
  reportError: (error: Error, context?: string, metadata?: Record<string, any>) => void
  clearErrors: () => void
  getErrorCount: () => number
  isErrorReportingEnabled: () => boolean
  setErrorReportingEnabled: (enabled: boolean) => void
}

/**
 * Contexto para gerenciamento global de erros
 */
const ErrorBoundaryContext = createContext<ErrorBoundaryContextType | null>(null)

/**
 * Hook para usar o contexto de error boundary
 */
export const useErrorBoundary = (): ErrorBoundaryContextType => {
  const context = useContext(ErrorBoundaryContext)
  if (!context) {
    throw new Error('useErrorBoundary must be used within an ErrorBoundaryProvider')
  }
  return context
}

/**
 * Provider para gerenciamento global de error boundaries
 */
interface ErrorBoundaryProviderProps {
  children: ReactNode
  enableGlobalReporting?: boolean
  maxGlobalErrors?: number
  onGlobalError?: (error: Error, context?: string) => void
}

export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  children,
  enableGlobalReporting = true,
  maxGlobalErrors = 50,
  onGlobalError
}) => {
  const [errorCount, setErrorCount] = useState(0)
  const [errorReportingEnabled, setErrorReportingEnabled] = useState(enableGlobalReporting)
  const [globalErrors, setGlobalErrors] = useState<Array<{ error: Error; context?: string; timestamp: number }>>([])

  /**
   * Reporta erro globalmente
   */
  const reportError = useCallback((error: Error, context?: string, metadata?: Record<string, any>) => {
    if (!errorReportingEnabled) return

    const timestamp = Date.now()
    const errorEntry = { error, context, timestamp }

    // Adiciona à lista de erros globais
    setGlobalErrors(prev => {
      const newErrors = [...prev, errorEntry]
      // Mantém apenas os últimos erros
      return newErrors.slice(-maxGlobalErrors)
    })

    setErrorCount(prev => prev + 1)

    // Log estruturado
    loggerService.error('Global error reported', {
      message: error.message,
      stack: error.stack,
      context,
      metadata,
      timestamp,
      errorCount: errorCount + 1
    })

    // Métricas APM
    apmService.recordError(error, 'error', {
      context: context || 'global',
      component: 'ErrorBoundaryProvider',
      ...metadata
    })

    // Log para erros críticos
    if (context === 'critical' || error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      loggerService.error('Critical error detected', {
        type: 'error',
        severity: 'critical',
        title: 'Erro Crítico na Aplicação',
        message: `Erro crítico detectado: ${error.message}`,
        metadata: {
          context,
          stack: error.stack,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp
        }
      })
    }

    // Callback personalizado
    if (onGlobalError) {
      try {
        onGlobalError(error, context)
      } catch (callbackError) {
        loggerService.error('Error in global error callback', {
          originalError: error.message,
          callbackError: (callbackError as Error).message
        })
      }
    }

    // Verifica se atingiu limite de erros
    if (errorCount + 1 >= maxGlobalErrors * 0.8) {
      loggerService.warn('High error count detected', {
        type: 'warning',
        severity: 'high',
        title: 'Alto Número de Erros',
        message: `Detectados ${errorCount + 1} erros. Possível instabilidade da aplicação.`,
        metadata: {
          errorCount: errorCount + 1,
          maxErrors: maxGlobalErrors,
          recentErrors: globalErrors.slice(-5).map(e => ({
            message: e.error.message,
            context: e.context,
            timestamp: e.timestamp
          }))
        }
      })
    }
  }, [errorReportingEnabled, errorCount, maxGlobalErrors, onGlobalError, globalErrors])

  /**
   * Limpa contadores de erro
   */
  const clearErrors = useCallback(() => {
    setErrorCount(0)
    setGlobalErrors([])
    loggerService.info('Error counters cleared', { context: 'error_boundary_provider.clear' })
  }, [])

  /**
   * Obtém contagem de erros
   */
  const getErrorCount = useCallback(() => errorCount, [errorCount])

  /**
   * Verifica se reporting está habilitado
   */
  const isErrorReportingEnabled = useCallback(() => errorReportingEnabled, [errorReportingEnabled])

  const contextValue: ErrorBoundaryContextType = {
    reportError,
    clearErrors,
    getErrorCount,
    isErrorReportingEnabled,
    setErrorReportingEnabled
  }

  return (
    <ErrorBoundaryContext.Provider value={contextValue}>
      <CriticalErrorBoundary componentName="App">
        {children}
      </CriticalErrorBoundary>
    </ErrorBoundaryContext.Provider>
  )
}

/**
 * HOC para envolver componentes com error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  config: ErrorBoundaryConfig = { level: 'component' }
) {
  const WrappedComponent: React.FC<P> = (props) => {
    const { reportError } = useErrorBoundary()

    const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
      // Reporta erro no contexto global
      reportError(error, config.context || config.level, {
        componentName: Component.displayName || Component.name,
        props: Object.keys(props || {}),
        errorInfo
      })

      // Callback personalizado
      if (config.onError) {
        config.onError(error, errorInfo)
      }
    }, [reportError, props])

    // Seleciona o tipo de error boundary baseado no nível
    const ErrorBoundaryComponent = React.useMemo(() => {
      switch (config.level) {
        case 'critical':
          return CriticalErrorBoundary
        case 'route':
          return RouteErrorBoundary
        case 'form':
          return FormErrorBoundary
        default:
          return ErrorBoundary
      }
    }, [config.level])

    const fallbackElement = config.fallbackComponent ? React.createElement(config.fallbackComponent) : <div>Erro no componente</div>

    // Renderiza baseado no tipo de ErrorBoundary
    if (config.level === 'critical') {
      return (
        <CriticalErrorBoundary componentName={Component.displayName || Component.name}>
          <Component {...props} />
        </CriticalErrorBoundary>
      )
    }
    
    if (config.level === 'form') {
      return (
        <FormErrorBoundary formName={config.context || 'form'}>
          <Component {...props} />
        </FormErrorBoundary>
      )
    }
    
    if (config.level === 'route') {
      return (
        <RouteErrorBoundary>
          <Component {...props} />
        </RouteErrorBoundary>
      )
    }
    
    // ErrorBoundary padrão
    return (
      <ErrorBoundary
        level="component"
        name={Component.displayName || Component.name}
        onError={handleError}
        fallback={fallbackElement}
        allowRetry={config.enableRetry}
      >
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * HOC específico para componentes críticos
 */
export function withCriticalErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  context?: string
) {
  return withErrorBoundary(Component, {
    level: 'critical',
    context: context || 'critical-component',
    enableRetry: true,
    maxRetries: 2,
    enableReporting: true
  })
}

/**
 * HOC específico para rotas
 */
export function withRouteErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  routeName?: string
) {
  return withErrorBoundary(Component, {
    level: 'route',
    context: routeName || 'route',
    enableRetry: true,
    maxRetries: 3,
    enableReporting: true
  })
}

/**
 * HOC específico para formulários
 */
export function withFormErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  formName?: string
) {
  return withErrorBoundary(Component, {
    level: 'form',
    context: formName || 'form',
    enableRetry: true,
    maxRetries: 1,
    enableReporting: true
  })
}

/**
 * Componente para monitoramento de erros em tempo real
 */
export const ErrorMonitor: React.FC = () => {
  const { getErrorCount, clearErrors, isErrorReportingEnabled, setErrorReportingEnabled } = useErrorBoundary()
  const [isVisible, setIsVisible] = useState(false)
  const errorCount = getErrorCount()

  // Mostra monitor se houver erros
  React.useEffect(() => {
    setIsVisible(errorCount > 0)
  }, [errorCount])

  if (!isVisible || !isErrorReportingEnabled()) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
          <span className="text-sm font-medium">
            {errorCount} erro{errorCount !== 1 ? 's' : ''} detectado{errorCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center ml-4">
          <button
            onClick={clearErrors}
            className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded mr-2"
          >
            Limpar
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Decorator para métodos que podem gerar erros
 */
export function errorBoundaryMethod(context?: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!

    descriptor.value = (async function (this: any, ...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args)
        return result
      } catch (error) {
        // Reporta erro se estiver em um contexto com ErrorBoundaryProvider
        if (typeof window !== 'undefined' && (window as any).__errorBoundaryContext) {
          (window as any).__errorBoundaryContext.reportError(
            error as Error,
            context || `${target.constructor.name}.${propertyKey}`,
            {
              className: target.constructor.name,
              methodName: propertyKey,
              arguments: args.map((arg, index) => ({ index, type: typeof arg }))
            }
          )
        }
        
        throw error
      }
    }) as T

    return descriptor
  }
}

/**
 * Utilitário para reportar erros manualmente
 */
export const reportError = (error: Error, context?: string, metadata?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).__errorBoundaryContext) {
    (window as any).__errorBoundaryContext.reportError(error, context, metadata)
  } else {
    // Fallback para logging direto
    loggerService.error('Manual error report', {
      message: error.message,
      stack: error.stack,
      context,
      metadata
    }, 'manual_error_report', error)
  }
}

/**
 * Configuração global para error boundaries
 */
export const configureErrorBoundaries = (config: {
  enableGlobalReporting?: boolean
  maxGlobalErrors?: number
  enableConsoleLogging?: boolean
  enableAPMIntegration?: boolean
  enableAlerts?: boolean
}) => {
  if (typeof window !== 'undefined') {
    (window as any).__errorBoundaryConfig = {
      enableGlobalReporting: config.enableGlobalReporting ?? true,
      maxGlobalErrors: config.maxGlobalErrors ?? 50,
      enableConsoleLogging: config.enableConsoleLogging ?? true,
      enableAPMIntegration: config.enableAPMIntegration ?? true,
      enableAlerts: config.enableAlerts ?? true
    }
  }
}

export default ErrorBoundaryProvider