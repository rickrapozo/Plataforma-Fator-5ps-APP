import { apmService } from '../services/apmService'

// Interfaces para spans e transações
interface APMSpan {
  end: () => void
  addLog: (message: string, level?: string) => void
}

interface APMTransaction {
  end: (status?: 'success' | 'error') => void
  addSpan: (name: string) => APMSpan
}

// Tipos básicos para Request/Response sem Express
interface Request {
  method: string
  originalUrl?: string
  url: string
  headers: Record<string, string | string[] | undefined>
  query: Record<string, any>
  params: Record<string, any>
  body?: any
  ip?: string
  connection?: { remoteAddress?: string }
  route?: { path?: string }
  get: (header: string) => string | undefined
  apm?: {
    transactionId: string
    startTime: number
    spans: Map<string, string>
    monitorQuery?: (queryName: string, query: string) => {
      end: () => void
      addLog: (message: string, level?: string) => void
    }
    monitorExternalApi?: (apiName: string, url: string, method?: string) => {
      end: (statusCode?: number, error?: Error) => void
    }
  }
}

interface Response {
  statusCode: number
  on: (event: string, callback: (error?: any) => void) => void
  send?: (body?: any) => any
  json?: (obj?: any) => any
  end?: (chunk?: any, encoding?: any) => any
}

type NextFunction = (error?: any) => void

/**
 * Middleware principal do APM para Express
 */
export function apmMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now()
    const method = req.method
    const url = req.originalUrl || req.url
    const userAgent = req.get('User-Agent') || 'unknown'
    const ip = req.ip || req.connection?.remoteAddress || 'unknown'

    // Inicia transação
    const transactionId = apmService.startTransaction(
      `${method} ${url}`,
      'http',
      {
        method,
        url,
        userAgent,
        ip,
        headers: req.headers,
        query: req.query,
        params: req.params
      }
    )

    // Adiciona dados do APM ao request
    req.apm = {
      transactionId,
      startTime,
      spans: new Map()
    }

    // Monitora o response
    const originalSend = res.send
    const originalJson = res.json
    const originalEnd = res.end

    let responseFinished = false

    const finishTransaction = () => {
      if (responseFinished) return
      responseFinished = true

      const duration = Date.now() - startTime
      const statusCode = res.statusCode
      const isSuccess = statusCode >= 200 && statusCode < 400

      // Finaliza transação
      apmService.endTransaction(transactionId, isSuccess ? 'success' : 'error')

      // Registra métricas
      apmService.recordMetric(
        'http.request.duration',
        duration,
        'ms',
        {
          method,
          status: statusCode.toString(),
          route: req.route?.path || url,
          success: isSuccess.toString()
        }
      )

      apmService.recordMetric(
        'http.request.count',
        1,
        'count',
        {
          method,
          status: statusCode.toString(),
          route: req.route?.path || url
        }
      )

      // Registra erro se status >= 400
      if (!isSuccess) {
        apmService.recordError(
          `HTTP ${statusCode}: ${method} ${url}`,
          statusCode >= 500 ? 'error' : 'warning',
          {
            method,
            url,
            statusCode,
            duration,
            userAgent,
            ip,
            headers: req.headers,
            query: req.query,
            params: req.params
          }
        )
      }
    }

    // Override dos métodos de resposta
    res.send = function(body) {
      finishTransaction()
      return originalSend?.call(this, body)
    }

    res.json = function(obj) {
      finishTransaction()
      return originalJson?.call(this, obj)
    }

    res.end = function(chunk, encoding) {
      finishTransaction()
      return originalEnd?.call(this, chunk, encoding)
    }

    // Monitora eventos de erro
    res.on('error', (error) => {
      apmService.recordError(error, 'error', {
        context: 'response_error',
        method,
        url,
        transactionId
      })
    })

    next()
  }
}

/**
 * Middleware para capturar erros não tratados
 */
export function apmErrorHandler() {
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    const transactionId = req.apm?.transactionId

    // Registra o erro
    apmService.recordError(error, 'error', {
      context: 'unhandled_error',
      method: req.method,
      url: req.originalUrl || req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection?.remoteAddress,
      headers: req.headers,
      query: req.query,
      params: req.params,
      body: req.body,
      transactionId
    })

    // Finaliza transação com erro se existir
    if (transactionId) {
      apmService.endTransaction(transactionId, 'error')
    }

    next(error)
  }
}

/**
 * Middleware para monitorar queries de banco de dados
 */
export function apmDatabaseMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.apm) {
      return next()
    }

    // Adiciona método helper para monitorar queries
    req.apm.monitorQuery = (queryName: string, query: string) => {
      const spanId = apmService.addSpan(
        req.apm!.transactionId,
        `db.${queryName}`,
        Date.now()
      )

      req.apm!.spans.set(queryName, spanId)

      return {
        end: () => {
          apmService.endSpan(req.apm!.transactionId, spanId)
          req.apm!.spans.delete(queryName)
        },
        addLog: (message: string, level: string = 'info') => {
          // Implementar logging no span se necessário
        }
      }
    }

    next()
  }
}

/**
 * Middleware para monitorar chamadas de API externa
 */
export function apmExternalApiMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.apm) {
      return next()
    }

    // Adiciona método helper para monitorar APIs externas
    req.apm.monitorExternalApi = (apiName: string, url: string, method: string = 'GET') => {
      const spanId = apmService.addSpan(
        req.apm!.transactionId,
        `external.${apiName}`,
        Date.now()
      )

      req.apm!.spans.set(`external_${apiName}`, spanId)

      return {
        end: (statusCode?: number, error?: Error) => {
          apmService.endSpan(req.apm!.transactionId, spanId)
          req.apm!.spans.delete(`external_${apiName}`)

          // Registra métrica da API externa
          if (statusCode) {
            apmService.recordMetric(
              `external.${apiName}.response_time`,
              Date.now() - (req.apm?.startTime || 0),
              'ms',
              {
                method,
                status: statusCode.toString(),
                url,
                success: (statusCode >= 200 && statusCode < 400).toString()
              }
            )
          }

          // Registra erro se houver
          if (error) {
            apmService.recordError(error, 'error', {
              context: 'external_api_error',
              apiName,
              url,
              method,
              statusCode
            })
          }
        }
      }
    }

    next()
  }
}

/**
 * Middleware para rate limiting com APM
 */
export function apmRateLimitMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now()
    const ip = req.ip || req.connection?.remoteAddress || 'unknown'
    const userAgent = req.get('User-Agent') || 'unknown'

    // Monitora tentativas de rate limiting
    const originalSend = res.send
    res.send = function(body) {
          const duration = Date.now() - startTime
          const statusCode = res.statusCode

          // Se foi bloqueado por rate limit (429)
          if (statusCode === 429) {
            apmService.recordMetric(
              'rate_limit.blocked',
              1,
              'count',
              {
                ip,
                userAgent,
                method: req.method,
                url: req.originalUrl || req.url
              }
            )

            apmService.recordError(
              `Rate limit exceeded: ${req.method} ${req.originalUrl || req.url}`,
              'warning',
              {
                context: 'rate_limit_exceeded',
                ip,
                userAgent,
                method: req.method,
                url: req.originalUrl || req.url,
                duration
              }
            )
          } else {
            // Requisição permitida
            apmService.recordMetric(
              'rate_limit.allowed',
              1,
              'count',
              {
                ip,
                userAgent,
                method: req.method,
                url: req.originalUrl || req.url
              }
            )
          }

          return originalSend?.call(this, body)
        }

    next()
  }
}

/**
 * Middleware para monitorar autenticação
 */
export function apmAuthMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now()
    const ip = req.ip || req.connection?.remoteAddress || 'unknown'
    const userAgent = req.get('User-Agent') || 'unknown'

    // Monitora tentativas de autenticação
    const originalSend = res.send
    res.send = function(body) {
      const duration = Date.now() - startTime
      const statusCode = res.statusCode

      if (statusCode === 401 || statusCode === 403) {
        // Falha de autenticação
        apmService.recordMetric(
          'auth.failed',
          1,
          'count',
          {
            ip,
            userAgent,
            method: req.method,
            url: req.originalUrl || req.url,
            status: statusCode.toString()
          }
        )

        apmService.recordError(
          `Authentication failed: ${statusCode} ${req.method} ${req.originalUrl || req.url}`,
          'warning',
          {
            context: 'auth_failed',
            ip,
            userAgent,
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode,
            duration
          }
        )
      } else if (statusCode >= 200 && statusCode < 300) {
        // Autenticação bem-sucedida
        apmService.recordMetric(
          'auth.success',
          1,
          'count',
          {
            ip,
            userAgent,
            method: req.method,
            url: req.originalUrl || req.url
          }
        )
      }

      return originalSend?.call(this, body)
    }

    next()
  }
}

/**
 * Função helper para criar spans customizados
 */
export function createCustomSpan(
  req: Request,
  name: string,
  callback: (span: APMSpan) => Promise<any> | any
) {
  if (!req.apm) {
    return callback({ end: () => {}, addLog: () => {} })
  }

  const spanId = apmService.addSpan(
    req.apm.transactionId,
    name,
    Date.now()
  )

  req.apm.spans.set(name, spanId)

  const span: APMSpan = {
    end: () => {
      apmService.endSpan(req.apm!.transactionId, spanId)
      req.apm!.spans.delete(name)
    },
    addLog: (message: string, level: string = 'info') => {
      // Implementar logging no span se necessário
      console.log(`[${level.toUpperCase()}] ${name}: ${message}`)
    }
  }

  try {
    const result = callback(span)
    
    // Se é uma Promise, aguarda e finaliza o span
    if (result && typeof result.then === 'function') {
      return result.finally(() => span.end())
    }

    // Função síncrona
    span.end()
    return result
  } catch (error) {
    span.addLog(`Erro: ${error}`, 'error')
    span.end()
    throw error
  }
}

// Tipos para TypeScript
export interface APMRequest extends Request {
  apm: {
    transactionId: string
    startTime: number
    spans: Map<string, string>
    monitorQuery?: (queryName: string, query: string) => {
      end: () => void
      addLog: (message: string, level?: string) => void
    }
    monitorExternalApi?: (apiName: string, url: string, method?: string) => {
      end: (statusCode?: number, error?: Error) => void
    }
  }
}