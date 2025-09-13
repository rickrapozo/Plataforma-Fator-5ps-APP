import React, { Component, ErrorInfo, ReactNode } from 'react'
import { apmService } from '../services/apmService'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'section' | 'component'
  name?: string
  showDetails?: boolean
  allowRetry?: boolean
  allowNavigation?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
  retryCount: number
}

/**
 * Error Boundary abrangente com integração APM
 */
export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component', name } = this.props
    const errorId = this.generateErrorId()

    // Registra erro no APM
    apmService.recordError(error, 'error', {
      context: 'error_boundary',
      level,
      component: name || 'unknown',
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      retryCount: this.state.retryCount
    })

    // Registra métrica de erro
    apmService.recordMetric(
      'error_boundary.error_caught',
      1,
      'count',
      {
        level,
        component: name || 'unknown',
        errorType: error.name,
        retryCount: this.state.retryCount.toString()
      }
    )

    this.setState({
      errorInfo,
      errorId
    })

    // Callback personalizado
    if (onError) {
      onError(error, errorInfo)
    }

    // Log detalhado no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary: ${name || 'Unknown Component'}`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Error ID:', errorId)
      console.groupEnd()
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private handleRetry = () => {
    const { retryCount } = this.state
    const maxRetries = 3

    if (retryCount >= maxRetries) {
      apmService.recordMetric(
        'error_boundary.max_retries_reached',
        1,
        'count',
        {
          component: this.props.name || 'unknown',
          maxRetries: maxRetries.toString()
        }
      )
      return
    }

    // Registra tentativa de retry
    apmService.recordMetric(
      'error_boundary.retry_attempt',
      1,
      'count',
      {
        component: this.props.name || 'unknown',
        retryCount: (retryCount + 1).toString()
      }
    )

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: retryCount + 1
    })

    // Delay para evitar loops infinitos
    this.retryTimeoutId = setTimeout(() => {
      // Reset retry count após sucesso
      if (!this.state.hasError) {
        this.setState({ retryCount: 0 })
      }
    }, 5000)
  }

  private handleGoHome = () => {
    apmService.recordMetric(
      'error_boundary.navigation_home',
      1,
      'count',
      {
        component: this.props.name || 'unknown'
      }
    )
    
    window.location.href = '/'
  }

  private handleReload = () => {
    apmService.recordMetric(
      'error_boundary.page_reload',
      1,
      'count',
      {
        component: this.props.name || 'unknown'
      }
    )
    
    window.location.reload()
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render() {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state
    const { 
      children, 
      fallback, 
      level = 'component', 
      name, 
      showDetails = false,
      allowRetry = true,
      allowNavigation = true
    } = this.props

    if (hasError) {
      // Fallback customizado
      if (fallback) {
        return fallback
      }

      // UI de erro baseada no nível
      return this.renderErrorUI(level, error, errorInfo, errorId, retryCount, allowRetry, allowNavigation, showDetails)
    }

    return children
  }

  private renderErrorUI(
    level: string,
    error: Error | null,
    errorInfo: ErrorInfo | null,
    errorId: string | null,
    retryCount: number,
    allowRetry: boolean,
    allowNavigation: boolean,
    showDetails: boolean
  ) {
    const maxRetries = 3
    const canRetry = allowRetry && retryCount < maxRetries

    // Error UI para nível de página
    if (level === 'page') {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-lg font-medium text-gray-900">
                  Oops! Algo deu errado
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Encontramos um erro inesperado. Nossa equipe foi notificada.
                </p>
                {errorId && (
                  <p className="mt-2 text-xs text-gray-500">
                    ID do erro: {errorId}
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar novamente ({maxRetries - retryCount} tentativas restantes)
                  </button>
                )}
                
                {allowNavigation && (
                  <>
                    <button
                      onClick={this.handleGoHome}
                      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Ir para página inicial
                    </button>
                    
                    <button
                      onClick={this.handleReload}
                      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Recarregar página
                    </button>
                  </>
                )}
              </div>

              {showDetails && error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    <Bug className="inline w-4 h-4 mr-1" />
                    Detalhes técnicos
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Erro:</strong> {error.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                    {errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    // Error UI para nível de seção
    if (level === 'section') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Erro na seção {this.props.name || 'desconhecida'}
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Esta seção encontrou um problema e não pode ser exibida.
              </p>
              {errorId && (
                <p className="mt-1 text-xs text-red-600">
                  ID: {errorId}
                </p>
              )}
              
              {canRetry && (
                <div className="mt-3">
                  <button
                    onClick={this.handleRetry}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    // Error UI para nível de componente (padrão)
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <span className="ml-2 text-sm text-yellow-800">
            Erro no componente {this.props.name || 'desconhecido'}
          </span>
          {canRetry && (
            <button
              onClick={this.handleRetry}
              className="ml-auto inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </button>
          )}
        </div>
        {errorId && (
          <p className="mt-1 text-xs text-yellow-600">
            ID: {errorId}
          </p>
        )}
      </div>
    )
  }
}

/**
 * HOC para envolver componentes com Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * Hook para usar Error Boundary programaticamente
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    // Simula um erro que será capturado pelo Error Boundary mais próximo
    throw error
  }
}

/**
 * Componente Error Boundary específico para rotas
 */
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="page"
      name="Route"
      showDetails={process.env.NODE_ENV === 'development'}
      allowRetry={true}
      allowNavigation={true}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Componente Error Boundary específico para formulários
 */
export function FormErrorBoundary({ children, formName }: { children: ReactNode; formName: string }) {
  return (
    <ErrorBoundary
      level="section"
      name={`Form: ${formName}`}
      allowRetry={true}
      allowNavigation={false}
      onError={(error, errorInfo) => {
        // Log específico para erros de formulário
        apmService.recordMetric(
          'form.error',
          1,
          'count',
          {
            formName,
            errorType: error.name
          }
        )
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Componente Error Boundary específico para componentes críticos
 */
export function CriticalErrorBoundary({ children, componentName }: { children: ReactNode; componentName: string }) {
  return (
    <ErrorBoundary
      level="section"
      name={`Critical: ${componentName}`}
      allowRetry={true}
      allowNavigation={false}
      showDetails={true}
      onError={(error, errorInfo) => {
        // Alerta crítico
        apmService.recordError(error, 'critical', {
          context: 'critical_component',
          component: componentName,
          componentStack: errorInfo.componentStack
        })
        
        // Métrica crítica
        apmService.recordMetric(
          'critical_component.error',
          1,
          'count',
          {
            component: componentName,
            errorType: error.name
          }
        )
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary