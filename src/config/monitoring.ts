/**
 * Configuração centralizada para todos os serviços de monitoramento
 */

// Configurações do APM
export const apmConfig = {
  enabled: process.env.REACT_APP_APM_ENABLED === 'true',
  serviceName: process.env.REACT_APP_APM_SERVICE_NAME || 'essential-factor-frontend',
  environment: process.env.NODE_ENV || 'development',
  sampleRate: parseFloat(process.env.REACT_APP_APM_SAMPLE_RATE || '0.1'),
  captureBody: process.env.REACT_APP_APM_CAPTURE_BODY === 'true',
  captureHeaders: process.env.REACT_APP_APM_CAPTURE_HEADERS === 'true',
  distributedTracingOrigins: [
    process.env.REACT_APP_API_URL || 'http://localhost:3001',
    process.env.REACT_APP_SUPABASE_URL || ''
  ].filter(Boolean),
  transactionIgnoreUrls: [
    '/health',
    '/metrics',
    '/favicon.ico',
    /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/
  ]
}

// Configurações do Logger
export const loggerConfig = {
  level: (process.env.REACT_APP_LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
  enableConsole: process.env.REACT_APP_LOG_CONSOLE === 'true',
  enableRemote: process.env.REACT_APP_LOG_REMOTE === 'true',
  remoteEndpoint: process.env.REACT_APP_LOG_ENDPOINT,
  batchSize: parseInt(process.env.REACT_APP_LOG_BATCH_SIZE || '10'),
  flushInterval: parseInt(process.env.REACT_APP_LOG_FLUSH_INTERVAL || '5000'),
  maxRetries: parseInt(process.env.REACT_APP_LOG_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.REACT_APP_LOG_RETRY_DELAY || '1000'),
  enableStructuredLogging: process.env.REACT_APP_LOG_STRUCTURED === 'true',
  enablePerformanceLogging: process.env.REACT_APP_LOG_PERFORMANCE === 'true'
}

// Configurações do Circuit Breaker
export const circuitBreakerConfig = {
  enabled: process.env.REACT_APP_CIRCUIT_BREAKER_ENABLED === 'true',
  failureThreshold: parseInt(process.env.REACT_APP_CB_FAILURE_THRESHOLD || '5'),
  recoveryTimeout: parseInt(process.env.REACT_APP_CB_RECOVERY_TIMEOUT || '60000'),
  monitoringPeriod: parseInt(process.env.REACT_APP_CB_MONITORING_PERIOD || '10000'),
  expectedExceptionPredicate: (error: Error) => {
    // Não considerar erros de rede temporários como falhas
    return !error.message.includes('NetworkError') && 
           !error.message.includes('timeout')
  },
  onStateChange: (name: string, from: string, to: string) => {
    console.log(`Circuit Breaker ${name}: ${from} -> ${to}`)
  }
}

// Removido: Configurações do Cache Redis para Gemini

// Configurações do Sistema de Alertas
export const alertConfig = {
  enabled: process.env.REACT_APP_ALERTS_ENABLED === 'true',
  channels: {
    email: {
      enabled: process.env.REACT_APP_ALERTS_EMAIL_ENABLED === 'true',
      smtpHost: process.env.REACT_APP_ALERTS_SMTP_HOST,
      smtpPort: parseInt(process.env.REACT_APP_ALERTS_SMTP_PORT || '587'),
      smtpUser: process.env.REACT_APP_ALERTS_SMTP_USER,
      smtpPassword: process.env.REACT_APP_ALERTS_SMTP_PASSWORD,
      from: process.env.REACT_APP_ALERTS_EMAIL_FROM,
      to: process.env.REACT_APP_ALERTS_EMAIL_TO?.split(',') || []
    },
    slack: {
      enabled: process.env.REACT_APP_ALERTS_SLACK_ENABLED === 'true',
      webhookUrl: process.env.REACT_APP_ALERTS_SLACK_WEBHOOK,
      channel: process.env.REACT_APP_ALERTS_SLACK_CHANNEL || '#alerts',
      username: process.env.REACT_APP_ALERTS_SLACK_USERNAME || 'AlertBot'
    },
    webhook: {
      enabled: process.env.REACT_APP_ALERTS_WEBHOOK_ENABLED === 'true',
      url: process.env.REACT_APP_ALERTS_WEBHOOK_URL,
      timeout: parseInt(process.env.REACT_APP_ALERTS_WEBHOOK_TIMEOUT || '5000'),
      retries: parseInt(process.env.REACT_APP_ALERTS_WEBHOOK_RETRIES || '3')
    }
  },
  escalation: {
    enabled: process.env.REACT_APP_ALERTS_ESCALATION_ENABLED === 'true',
    levels: [
      {
        name: 'Level 1',
        delay: parseInt(process.env.REACT_APP_ALERTS_L1_DELAY || '300000'), // 5 min
        channels: ['email']
      },
      {
        name: 'Level 2',
        delay: parseInt(process.env.REACT_APP_ALERTS_L2_DELAY || '900000'), // 15 min
        channels: ['email', 'slack']
      },
      {
        name: 'Level 3',
        delay: parseInt(process.env.REACT_APP_ALERTS_L3_DELAY || '1800000'), // 30 min
        channels: ['email', 'slack', 'webhook']
      }
    ]
  },
  rateLimit: {
    enabled: process.env.REACT_APP_ALERTS_RATE_LIMIT_ENABLED === 'true',
    maxAlertsPerMinute: parseInt(process.env.REACT_APP_ALERTS_RATE_LIMIT_PER_MINUTE || '10'),
    maxAlertsPerHour: parseInt(process.env.REACT_APP_ALERTS_RATE_LIMIT_PER_HOUR || '100')
  }
}

// Configurações do Sistema de Webhooks com Retry
export const webhookRetryConfig = {
  enabled: process.env.REACT_APP_WEBHOOK_RETRY_ENABLED === 'true',
  concurrency: parseInt(process.env.REACT_APP_WEBHOOK_RETRY_CONCURRENCY || '5'),
  maxRetries: parseInt(process.env.REACT_APP_WEBHOOK_RETRY_MAX_ATTEMPTS || '5'),
  initialDelay: parseInt(process.env.REACT_APP_WEBHOOK_RETRY_INITIAL_DELAY || '1000'),
  maxDelay: parseInt(process.env.REACT_APP_WEBHOOK_RETRY_MAX_DELAY || '300000'),
  backoffMultiplier: parseFloat(process.env.REACT_APP_WEBHOOK_RETRY_BACKOFF_MULTIPLIER || '2'),
  jitterEnabled: process.env.REACT_APP_WEBHOOK_RETRY_JITTER_ENABLED === 'true',
  jitterMax: parseInt(process.env.REACT_APP_WEBHOOK_RETRY_JITTER_MAX || '1000'),
  timeout: parseInt(process.env.REACT_APP_WEBHOOK_RETRY_TIMEOUT || '30000'),
  deadLetterThreshold: parseInt(process.env.REACT_APP_WEBHOOK_RETRY_DLQ_THRESHOLD || '10'),
  cleanupInterval: parseInt(process.env.REACT_APP_WEBHOOK_RETRY_CLEANUP_INTERVAL || '3600000'),
  statsInterval: parseInt(process.env.REACT_APP_WEBHOOK_RETRY_STATS_INTERVAL || '60000'),
  rateLimit: {
    enabled: process.env.REACT_APP_WEBHOOK_RETRY_RATE_LIMIT_ENABLED === 'true',
    maxRequestsPerSecond: parseInt(process.env.REACT_APP_WEBHOOK_RETRY_RATE_LIMIT_RPS || '10')
  }
}

// Configurações do Monitoramento de Expiração de Tokens
export const tokenExpirationConfig = {
  enabled: process.env.REACT_APP_TOKEN_EXPIRATION_ENABLED === 'true',
  checkInterval: parseInt(process.env.REACT_APP_TOKEN_EXPIRATION_CHECK_INTERVAL || '300000'), // 5 min
  warningThreshold: parseInt(process.env.REACT_APP_TOKEN_EXPIRATION_WARNING_THRESHOLD || '1800000'), // 30 min
  criticalThreshold: parseInt(process.env.REACT_APP_TOKEN_EXPIRATION_CRITICAL_THRESHOLD || '600000'), // 10 min
  autoRefresh: process.env.REACT_APP_TOKEN_EXPIRATION_AUTO_REFRESH === 'true',
  notificationsEnabled: process.env.REACT_APP_TOKEN_EXPIRATION_NOTIFICATIONS === 'true',
  maxRetries: parseInt(process.env.REACT_APP_TOKEN_EXPIRATION_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.REACT_APP_TOKEN_EXPIRATION_RETRY_DELAY || '5000')
}

// Configurações do Dashboard de Monitoramento
export const monitoringDashboardConfig = {
  autoRefresh: process.env.REACT_APP_MONITORING_AUTO_REFRESH === 'true',
  refreshInterval: parseInt(process.env.REACT_APP_MONITORING_REFRESH_INTERVAL || '30000'),
  enableRealtime: process.env.REACT_APP_MONITORING_REALTIME === 'true',
  maxLogEntries: parseInt(process.env.REACT_APP_MONITORING_MAX_LOG_ENTRIES || '100'),
  enableExport: process.env.REACT_APP_MONITORING_ENABLE_EXPORT === 'true',
  thresholds: {
    errorRate: {
      warning: parseFloat(process.env.REACT_APP_MONITORING_ERROR_RATE_WARNING || '2'),
      critical: parseFloat(process.env.REACT_APP_MONITORING_ERROR_RATE_CRITICAL || '5')
    },
    responseTime: {
      warning: parseInt(process.env.REACT_APP_MONITORING_RESPONSE_TIME_WARNING || '1000'),
      critical: parseInt(process.env.REACT_APP_MONITORING_RESPONSE_TIME_CRITICAL || '3000')
    },
    cacheHitRate: {
      warning: parseFloat(process.env.REACT_APP_MONITORING_CACHE_HIT_RATE_WARNING || '80'),
      critical: parseFloat(process.env.REACT_APP_MONITORING_CACHE_HIT_RATE_CRITICAL || '60')
    },
    activeAlerts: {
      warning: parseInt(process.env.REACT_APP_MONITORING_ACTIVE_ALERTS_WARNING || '5'),
      critical: parseInt(process.env.REACT_APP_MONITORING_ACTIVE_ALERTS_CRITICAL || '10')
    }
  }
}

// Configuração geral de monitoramento
export const monitoringConfig = {
  enabled: process.env.REACT_APP_MONITORING_ENABLED === 'true',
  environment: process.env.NODE_ENV || 'development',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  apm: apmConfig,
  logger: loggerConfig,
  circuitBreaker: circuitBreakerConfig,
  // geminiCache: geminiCacheConfig, // Removido
  alerts: alertConfig,
  webhookRetry: webhookRetryConfig,
  tokenExpiration: tokenExpirationConfig,
  dashboard: monitoringDashboardConfig
}

// Função para validar configurações
export const validateMonitoringConfig = () => {
  const errors: string[] = []
  
  // Validar configurações críticas
  if (apmConfig.enabled && !apmConfig.serviceName) {
    errors.push('APM service name is required when APM is enabled')
  }
  
  if (loggerConfig.enableRemote && !loggerConfig.remoteEndpoint) {
    errors.push('Remote endpoint is required when remote logging is enabled')
  }
  
  if (alertConfig.enabled) {
    const emailEnabled = alertConfig.channels.email.enabled
    const slackEnabled = alertConfig.channels.slack.enabled
    const webhookEnabled = alertConfig.channels.webhook.enabled
    
    if (!emailEnabled && !slackEnabled && !webhookEnabled) {
      errors.push('At least one alert channel must be enabled when alerts are enabled')
    }
    
    if (emailEnabled && (!alertConfig.channels.email.smtpHost || !alertConfig.channels.email.from)) {
      errors.push('SMTP configuration is incomplete for email alerts')
    }
    
    if (slackEnabled && !alertConfig.channels.slack.webhookUrl) {
      errors.push('Slack webhook URL is required for Slack alerts')
    }
    
    if (webhookEnabled && !alertConfig.channels.webhook.url) {
      errors.push('Webhook URL is required for webhook alerts')
    }
  }
  
  if (errors.length > 0) {
    console.warn('Monitoring configuration validation errors:', errors)
    return false
  }
  
  return true
}

// Função para obter configuração por ambiente
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  
  const baseConfig = monitoringConfig
  
  // Ajustes específicos por ambiente
  switch (env) {
    case 'development':
      return {
        ...baseConfig,
        logger: {
          ...baseConfig.logger,
          level: 'debug' as const,
          enableConsole: true
        },
        apm: {
          ...baseConfig.apm,
          sampleRate: 1.0 // 100% em desenvolvimento
        }
      }
      
    case 'staging':
      return {
        ...baseConfig,
        logger: {
          ...baseConfig.logger,
          level: 'info' as const
        },
        apm: {
          ...baseConfig.apm,
          sampleRate: 0.5 // 50% em staging
        }
      }
      
    case 'production':
      return {
        ...baseConfig,
        logger: {
          ...baseConfig.logger,
          level: 'warn' as const,
          enableConsole: false
        },
        apm: {
          ...baseConfig.apm,
          sampleRate: 0.1 // 10% em produção
        }
      }
      
    default:
      return baseConfig
  }
}

export default monitoringConfig