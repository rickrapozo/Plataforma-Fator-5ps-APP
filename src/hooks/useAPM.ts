import { useEffect, useCallback, useRef } from 'react'
import { apmService } from '../services/apmService'

/**
 * Hook personalizado para integração com APM em componentes React
 */
export function useAPM() {
  const transactionRef = useRef<string | null>(null)
  const spansRef = useRef<Map<string, string>>(new Map())

  // Inicia uma transação
  const startTransaction = useCallback((name: string, type: 'http' | 'database' | 'external' | 'custom' = 'custom') => {
    const transactionId = apmService.startTransaction(name, type, {
      component: true,
      framework: 'react'
    })
    transactionRef.current = transactionId
    return transactionId
  }, [])

  // Finaliza a transação atual
  const endTransaction = useCallback((status: 'success' | 'error' = 'success') => {
    if (transactionRef.current) {
      apmService.endTransaction(transactionRef.current, status)
      transactionRef.current = null
      spansRef.current.clear()
    }
  }, [])

  // Adiciona um span
  const addSpan = useCallback((name: string) => {
    if (!transactionRef.current) return null
    
    const spanId = apmService.addSpan(transactionRef.current, name)
    spansRef.current.set(name, spanId)
    return spanId
  }, [])

  // Finaliza um span
  const endSpan = useCallback((name: string) => {
    const spanId = spansRef.current.get(name)
    if (spanId && transactionRef.current) {
      apmService.endSpan(transactionRef.current, spanId)
      spansRef.current.delete(name)
    }
  }, [])

  // Registra uma métrica
  const recordMetric = useCallback((name: string, value: number, unit = 'ms', tags?: Record<string, string>) => {
    apmService.recordMetric(name, value, unit, tags)
  }, [])

  // Registra um erro
  const recordError = useCallback((error: Error | string, level: 'error' | 'warning' | 'critical' = 'error') => {
    apmService.recordError(error, level, {
      component: true,
      framework: 'react'
    })
  }, [])

  // Monitora uma função
  const monitorFunction = useCallback(<T extends (...args: any[]) => any>(fn: T, name?: string): T => {
    return apmService.monitorFunction(fn, name)
  }, [])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      endTransaction()
    }
  }, [])

  return {
    startTransaction,
    endTransaction,
    addSpan,
    endSpan,
    recordMetric,
    recordError,
    monitorFunction,
    currentTransaction: transactionRef.current
  }
}

/**
 * Hook para monitorar performance de componentes automaticamente
 */
export function useComponentPerformance(componentName: string) {
  const { startTransaction, endTransaction, recordMetric } = useAPM()
  const mountTimeRef = useRef<number>(Date.now())
  const renderCountRef = useRef<number>(0)

  useEffect(() => {
    // Inicia transação no mount
    const transactionId = startTransaction(`component.${componentName}.mount`)
    
    return () => {
      // Finaliza transação no unmount
      endTransaction('success')
      
      // Registra tempo de vida do componente
      const lifetime = Date.now() - mountTimeRef.current
      recordMetric(`component.${componentName}.lifetime`, lifetime, 'ms')
      
      // Registra número de renders
      recordMetric(`component.${componentName}.renders`, renderCountRef.current, 'count')
    }
  }, [componentName, startTransaction, endTransaction, recordMetric])

  // Conta renders
  useEffect(() => {
    renderCountRef.current++
    recordMetric(`component.${componentName}.render`, 1, 'count')
  })

  return {
    recordRenderMetric: (metricName: string, value: number) => {
      recordMetric(`component.${componentName}.${metricName}`, value)
    }
  }
}

/**
 * Hook para monitorar requisições HTTP
 */
export function useHttpMonitoring() {
  const recordMetric = useCallback((url: string, method: string, duration: number, status: number) => {
    apmService.recordMetric(
      'http.request.duration',
      duration,
      'ms',
      {
        method,
        status: status.toString(),
        url,
        success: (status >= 200 && status < 400).toString()
      }
    )

    apmService.recordMetric(
      'http.request.count',
      1,
      'count',
      {
        method,
        status: status.toString(),
        url
      }
    )
  }, [])

  const recordError = useCallback((url: string, method: string, error: Error, status?: number) => {
    apmService.recordError(error, 'error', {
      context: 'http_request',
      url,
      method,
      status: status?.toString()
    })
  }, [])

  const monitorRequest = useCallback((url: string, method: string = 'GET') => {
    const startTime = Date.now()
    
    return {
      success: (status: number) => {
        const duration = Date.now() - startTime
        recordMetric(url, method, duration, status)
      },
      error: (error: Error, status?: number) => {
        const duration = Date.now() - startTime
        if (status) {
          recordMetric(url, method, duration, status)
        }
        recordError(url, method, error, status)
      }
    }
  }, [recordMetric, recordError])

  return { monitorRequest }
}

/**
 * Hook para monitorar operações assíncronas
 */
export function useAsyncMonitoring() {
  const { recordMetric, recordError } = useAPM()

  const monitorAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    tags?: Record<string, string>
  ): Promise<T> => {
    const startTime = Date.now()
    
    try {
      const result = await operation()
      const duration = Date.now() - startTime
      
      recordMetric(
        `async.${operationName}.duration`,
        duration,
        'ms',
        { ...tags, status: 'success' }
      )
      
      recordMetric(
        `async.${operationName}.count`,
        1,
        'count',
        { ...tags, status: 'success' }
      )
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      recordMetric(
        `async.${operationName}.duration`,
        duration,
        'ms',
        { ...tags, status: 'error' }
      )
      
      recordMetric(
        `async.${operationName}.count`,
        1,
        'count',
        { ...tags, status: 'error' }
      )
      
      recordError(error as Error, 'error')
      throw error
    }
  }, [recordMetric, recordError])

  return { monitorAsync }
}

/**
 * Hook para monitorar estado de loading
 */
export function useLoadingMonitoring(operationName: string) {
  const { recordMetric } = useAPM()
  const startTimeRef = useRef<number | null>(null)

  const startLoading = useCallback(() => {
    startTimeRef.current = Date.now()
    recordMetric(`loading.${operationName}.start`, 1, 'count')
  }, [operationName, recordMetric])

  const endLoading = useCallback((success: boolean = true) => {
    if (startTimeRef.current) {
      const duration = Date.now() - startTimeRef.current
      
      recordMetric(
        `loading.${operationName}.duration`,
        duration,
        'ms',
        { success: success.toString() }
      )
      
      recordMetric(
        `loading.${operationName}.end`,
        1,
        'count',
        { success: success.toString() }
      )
      
      startTimeRef.current = null
    }
  }, [operationName, recordMetric])

  return { startLoading, endLoading }
}

/**
 * Hook para monitorar erros de componente
 */
export function useErrorMonitoring(componentName: string) {
  const { recordError } = useAPM()

  const handleError = useCallback((error: Error, errorInfo?: any) => {
    recordError(error, 'error')
    
    // Registra informações adicionais do erro
    apmService.recordMetric(
      `component.${componentName}.error`,
      1,
      'count',
      {
        errorType: error.name,
        hasErrorInfo: (!!errorInfo).toString()
      }
    )
  }, [componentName, recordError])

  return { handleError }
}

/**
 * Hook para monitorar interações do usuário
 */
export function useUserInteractionMonitoring() {
  const { recordMetric } = useAPM()

  const trackClick = useCallback((elementName: string, metadata?: Record<string, string>) => {
    recordMetric(
      'user.interaction.click',
      1,
      'count',
      {
        element: elementName,
        ...metadata
      }
    )
  }, [recordMetric])

  const trackFormSubmit = useCallback((formName: string, success: boolean, duration?: number) => {
    recordMetric(
      'user.interaction.form_submit',
      1,
      'count',
      {
        form: formName,
        success: success.toString()
      }
    )

    if (duration) {
      recordMetric(
        'user.interaction.form_duration',
        duration,
        'ms',
        {
          form: formName,
          success: success.toString()
        }
      )
    }
  }, [recordMetric])

  const trackPageView = useCallback((pageName: string, loadTime?: number) => {
    recordMetric(
      'user.navigation.page_view',
      1,
      'count',
      { page: pageName }
    )

    if (loadTime) {
      recordMetric(
        'user.navigation.page_load_time',
        loadTime,
        'ms',
        { page: pageName }
      )
    }
  }, [recordMetric])

  return {
    trackClick,
    trackFormSubmit,
    trackPageView
  }
}