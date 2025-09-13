import { loggerService } from './loggerService'
import { apmService } from './apmService'
import { dataService } from './dataService'
import { supabase } from '../lib/supabase'
import { CircuitBreaker, circuitBreakerManager, CircuitBreakerPresets } from './circuitBreakerService'

/**
 * Tipos de alerta
 */
export enum AlertType {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info',
  ERROR = 'error'
}

/**
 * Severidade do alerta
 */
export enum AlertSeverity {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
  EMERGENCY = 5
}

/**
 * Canais de notificação
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  PUSH = 'push',
  DATABASE = 'database'
}

/**
 * Interface para configuração de alerta
 */
export interface AlertRule {
  id: string
  name: string
  description: string
  type: AlertType
  severity: AlertSeverity
  condition: AlertCondition
  channels: NotificationChannel[]
  enabled: boolean
  cooldown: number // Tempo em segundos entre alertas
  maxOccurrences: number // Máximo de ocorrências por período
  timeWindow: number // Janela de tempo em segundos
  escalation?: AlertEscalation
  metadata?: Record<string, any>
}

/**
 * Interface para condição de alerta
 */
export interface AlertCondition {
  metric: string
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains' | 'regex'
  threshold: number | string
  aggregation?: 'avg' | 'sum' | 'count' | 'min' | 'max'
  timeRange?: number // Em segundos
}

/**
 * Interface para escalação de alerta
 */
export interface AlertEscalation {
  levels: {
    delay: number // Tempo em segundos para escalar
    channels: NotificationChannel[]
    severity: AlertSeverity
  }[]
}

/**
 * Interface para alerta ativo
 */
export interface Alert {
  id: string
  ruleId: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  timestamp: number
  resolved: boolean
  resolvedAt?: number
  metadata: Record<string, any>
  occurrences: number
  lastOccurrence: number
  channels: NotificationChannel[]
  escalationLevel: number
}

/**
 * Interface para configuração do serviço
 */
export interface AlertServiceConfig {
  enabled: boolean
  defaultChannels: NotificationChannel[]
  maxAlertsPerMinute: number
  retentionDays: number
  emailConfig?: {
    smtp: {
      host: string
      port: number
      secure: boolean
      auth: {
        user: string
        pass: string
      }
    }
    from: string
    templates: Record<string, string>
  }
  slackConfig?: {
    webhookUrl: string
    channel: string
    username: string
  }
  webhookConfig?: {
    url: string
    headers: Record<string, string>
    timeout: number
  }
  smsConfig?: {
    provider: 'twilio' | 'aws-sns'
    credentials: Record<string, string>
  }
}

/**
 * Configuração padrão
 */
const DEFAULT_CONFIG: AlertServiceConfig = {
  enabled: process.env.VITE_ALERTS_ENABLED === 'true',
  defaultChannels: [NotificationChannel.DATABASE, NotificationChannel.EMAIL],
  maxAlertsPerMinute: 10,
  retentionDays: 30,
  emailConfig: {
    smtp: {
      host: process.env.VITE_SMTP_HOST || 'localhost',
      port: parseInt(process.env.VITE_SMTP_PORT || '587'),
      secure: process.env.VITE_SMTP_SECURE === 'true',
      auth: {
        user: process.env.VITE_SMTP_USER || '',
        pass: process.env.VITE_SMTP_PASS || ''
      }
    },
    from: process.env.VITE_ALERT_FROM_EMAIL || 'alerts@example.com',
    templates: {
      critical: 'Critical Alert: {{title}}\n\n{{message}}\n\nTime: {{timestamp}}',
      warning: 'Warning: {{title}}\n\n{{message}}\n\nTime: {{timestamp}}',
      error: 'Error Alert: {{title}}\n\n{{message}}\n\nTime: {{timestamp}}'
    }
  },
  slackConfig: {
    webhookUrl: process.env.VITE_SLACK_WEBHOOK_URL || '',
    channel: process.env.VITE_SLACK_CHANNEL || '#alerts',
    username: 'AlertBot'
  },
  webhookConfig: {
    url: process.env.VITE_ALERT_WEBHOOK_URL || '',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_ALERT_WEBHOOK_TOKEN || ''}`
    },
    timeout: 5000
  }
}

/**
 * Regras de alerta pré-definidas
 */
export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'high-error-rate',
    name: 'High Error Rate',
    description: 'Error rate above 5% in the last 5 minutes',
    type: AlertType.CRITICAL,
    severity: AlertSeverity.HIGH,
    condition: {
      metric: 'error_rate',
      operator: 'gt',
      threshold: 5,
      aggregation: 'avg',
      timeRange: 300
    },
    channels: [NotificationChannel.EMAIL, NotificationChannel.SLACK],
    enabled: true,
    cooldown: 300,
    maxOccurrences: 3,
    timeWindow: 3600,
    escalation: {
      levels: [
        {
          delay: 600,
          channels: [NotificationChannel.SMS],
          severity: AlertSeverity.CRITICAL
        },
        {
          delay: 1800,
          channels: [NotificationChannel.SMS, NotificationChannel.WEBHOOK],
          severity: AlertSeverity.EMERGENCY
        }
      ]
    }
  },
  {
    id: 'high-response-time',
    name: 'High Response Time',
    description: 'Average response time above 2 seconds',
    type: AlertType.WARNING,
    severity: AlertSeverity.MEDIUM,
    condition: {
      metric: 'response_time',
      operator: 'gt',
      threshold: 2000,
      aggregation: 'avg',
      timeRange: 300
    },
    channels: [NotificationChannel.EMAIL],
    enabled: true,
    cooldown: 600,
    maxOccurrences: 5,
    timeWindow: 3600
  },
  {
    id: 'circuit-breaker-open',
    name: 'Circuit Breaker Open',
    description: 'Circuit breaker is in open state',
    type: AlertType.CRITICAL,
    severity: AlertSeverity.HIGH,
    condition: {
      metric: 'circuit_breaker_state',
      operator: 'eq',
      threshold: 'open'
    },
    channels: [NotificationChannel.EMAIL, NotificationChannel.SLACK],
    enabled: true,
    cooldown: 180,
    maxOccurrences: 1,
    timeWindow: 3600
  },
  {
    id: 'database-connection-failed',
    name: 'Database Connection Failed',
    description: 'Failed to connect to database',
    type: AlertType.CRITICAL,
    severity: AlertSeverity.CRITICAL,
    condition: {
      metric: 'database_connection',
      operator: 'eq',
      threshold: 'failed'
    },
    channels: [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.SLACK],
    enabled: true,
    cooldown: 60,
    maxOccurrences: 1,
    timeWindow: 300
  },
  {
    id: 'memory-usage-high',
    name: 'High Memory Usage',
    description: 'Memory usage above 85%',
    type: AlertType.WARNING,
    severity: AlertSeverity.MEDIUM,
    condition: {
      metric: 'memory_usage',
      operator: 'gt',
      threshold: 85,
      aggregation: 'avg',
      timeRange: 300
    },
    channels: [NotificationChannel.EMAIL],
    enabled: true,
    cooldown: 900,
    maxOccurrences: 3,
    timeWindow: 3600
  },
  {
    id: 'rate-limit-exceeded',
    name: 'Rate Limit Exceeded',
    description: 'Rate limit exceeded for critical endpoints',
    type: AlertType.WARNING,
    severity: AlertSeverity.MEDIUM,
    condition: {
      metric: 'rate_limit_exceeded',
      operator: 'gt',
      threshold: 10,
      aggregation: 'count',
      timeRange: 300
    },
    channels: [NotificationChannel.EMAIL, NotificationChannel.SLACK],
    enabled: true,
    cooldown: 300,
    maxOccurrences: 5,
    timeWindow: 1800
  }
]

/**
 * Serviço de alertas automáticos
 */
export class AlertService {
  private config: AlertServiceConfig
  private rules: Map<string, AlertRule> = new Map()
  private activeAlerts: Map<string, Alert> = new Map()
  private alertCounts: Map<string, { count: number; windowStart: number }> = new Map()
  private circuitBreaker: CircuitBreaker
  private monitoringTimer: NodeJS.Timeout | null = null
  private cleanupTimer: NodeJS.Timeout | null = null
  private isInitialized = false

  constructor(config?: Partial<AlertServiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.circuitBreaker = circuitBreakerManager.getOrCreate(
      'alert-service',
      {
        ...CircuitBreakerPresets.EXTERNAL_API,
        name: 'alert-service',
        timeout: 10000,
        failureThreshold: 3
      }
    )
    
    this.initialize()
  }

  /**
   * Inicializa o serviço
   */
  private async initialize() {
    try {
      // Carrega regras padrão
      DEFAULT_ALERT_RULES.forEach(rule => {
        this.rules.set(rule.id, rule)
      })

      // Carrega regras do banco de dados
      await this.loadRulesFromDatabase()

      // Inicia monitoramento
      if (this.config.enabled) {
        this.startMonitoring()
        this.startCleanup()
      }

      this.isInitialized = true
      
      loggerService.info('Alert service initialized', {
        rulesCount: this.rules.size,
        enabled: this.config.enabled
      })
    } catch (error) {
      loggerService.error('Failed to initialize alert service', {
        error: (error as Error).message
      })
    }
  }

  /**
   * Carrega regras do banco de dados
   */
  private async loadRulesFromDatabase() {
    try {
      const { data: rules, error } = await supabase
        .from('apm_alert_rules')
        .select('*')
        .eq('enabled', true)

      if (error) throw error

      rules?.forEach(rule => {
        this.rules.set(rule.id, {
          id: rule.id,
          name: rule.name,
          description: rule.description,
          type: rule.type,
          severity: rule.severity,
          condition: rule.condition,
          channels: rule.channels,
          enabled: rule.enabled,
          cooldown: rule.cooldown,
          maxOccurrences: rule.max_occurrences,
          timeWindow: rule.time_window,
          escalation: rule.escalation,
          metadata: rule.metadata
        })
      })

      loggerService.info('Loaded alert rules from database', {
        count: rules?.length || 0
      })
    } catch (error) {
      loggerService.warn('Failed to load rules from database', {
        error: (error as Error).message
      })
    }
  }

  /**
   * Inicia monitoramento
   */
  private startMonitoring() {
    this.monitoringTimer = setInterval(() => {
      this.checkAlertConditions()
    }, 30000) // Verifica a cada 30 segundos
  }

  /**
   * Inicia limpeza automática
   */
  private startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldAlerts()
    }, 3600000) // Limpa a cada hora
  }

  /**
   * Verifica condições de alerta
   */
  private async checkAlertConditions() {
    for (const rule of Array.from(this.rules.values())) {
      if (!rule.enabled) continue

      try {
        const shouldAlert = await this.evaluateCondition(rule.condition)
        
        if (shouldAlert) {
          await this.triggerAlert(rule)
        }
      } catch (error) {
        loggerService.error('Error checking alert condition', {
          ruleId: rule.id,
          error: (error as Error).message
        })
      }
    }
  }

  /**
   * Avalia condição de alerta
   */
  private async evaluateCondition(condition: AlertCondition): Promise<boolean> {
    try {
      // Obtém métricas do sistema
      const metrics = await dataService.getSystemMetrics()

      if (!metrics) return false

      // Obtém o valor da métrica específica
      let value: number = 0
      
      switch (condition.metric) {
        case 'error_rate':
          value = metrics.errorRate
          break
        case 'response_time':
          value = metrics.responseTime
          break
        case 'cpu_usage':
          value = metrics.cpuUsage
          break
        case 'memory_usage':
          value = metrics.memoryUsage
          break
        case 'disk_usage':
          value = metrics.diskUsage
          break
        case 'network_latency':
          value = metrics.networkLatency
          break
        case 'active_users':
          value = metrics.activeUsers
          break
        case 'total_users':
          value = metrics.totalUsers
          break
        case 'uptime':
          value = metrics.uptime
          break
        default:
          // Para métricas não mapeadas, retorna false
          return false
      }

      // Avalia condição
      const threshold = typeof condition.threshold === 'string' 
        ? parseFloat(condition.threshold) 
        : condition.threshold

      switch (condition.operator) {
        case 'gt': return value > threshold
        case 'gte': return value >= threshold
        case 'lt': return value < threshold
        case 'lte': return value <= threshold
        case 'eq': return value === threshold
        case 'contains': return String(value).includes(String(condition.threshold))
        case 'regex': return new RegExp(String(condition.threshold)).test(String(value))
        default: return false
      }
    } catch (error) {
      loggerService.error('Error evaluating alert condition', {
        condition,
        error: (error as Error).message
      })
      return false
    }
  }

  /**
   * Dispara alerta
   */
  private async triggerAlert(rule: AlertRule) {
    const now = Date.now()
    const alertId = `${rule.id}_${now}`
    
    // Verifica cooldown
    const existingAlert = Array.from(this.activeAlerts.values())
      .find(alert => alert.ruleId === rule.id && !alert.resolved)
    
    if (existingAlert && (now - existingAlert.lastOccurrence) < (rule.cooldown * 1000)) {
      return // Ainda em cooldown
    }

    // Verifica limite de ocorrências
    const countKey = `${rule.id}_${Math.floor(now / (rule.timeWindow * 1000))}`
    const alertCount = this.alertCounts.get(countKey) || { count: 0, windowStart: now }
    
    if (alertCount.count >= rule.maxOccurrences) {
      return // Limite de ocorrências atingido
    }

    // Atualiza contador
    alertCount.count++
    this.alertCounts.set(countKey, alertCount)

    // Cria alerta
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      message: rule.description,
      timestamp: now,
      resolved: false,
      metadata: rule.metadata || {},
      occurrences: existingAlert ? existingAlert.occurrences + 1 : 1,
      lastOccurrence: now,
      channels: rule.channels,
      escalationLevel: 0
    }

    // Atualiza ou adiciona alerta
    if (existingAlert) {
      existingAlert.occurrences++
      existingAlert.lastOccurrence = now
    } else {
      this.activeAlerts.set(alertId, alert)
    }

    // Envia notificações
    await this.sendNotifications(alert)

    // Salva no banco de dados
    await this.saveAlertToDatabase(alert)

    // Programa escalação se configurada
    if (rule.escalation) {
      this.scheduleEscalation(alert, rule.escalation)
    }

    loggerService.info('Alert triggered', {
      alertId,
      ruleId: rule.id,
      severity: rule.severity,
      occurrences: alert.occurrences
    })
  }

  /**
   * Envia notificações
   */
  private async sendNotifications(alert: Alert) {
    const promises = alert.channels.map(channel => 
      this.sendNotification(alert, channel)
    )

    await Promise.allSettled(promises)
  }

  /**
   * Envia notificação por canal específico
   */
  private async sendNotification(alert: Alert, channel: NotificationChannel) {
    try {
      await this.circuitBreaker.execute(async () => {
        switch (channel) {
          case NotificationChannel.EMAIL:
            await this.sendEmailNotification(alert)
            break
          case NotificationChannel.SLACK:
            await this.sendSlackNotification(alert)
            break
          case NotificationChannel.WEBHOOK:
            await this.sendWebhookNotification(alert)
            break
          case NotificationChannel.SMS:
            await this.sendSMSNotification(alert)
            break
          case NotificationChannel.DATABASE:
            // Já salvo no banco
            break
          default:
            loggerService.warn('Unknown notification channel', {
              channel,
              alertId: alert.id
            })
        }
      })

      loggerService.debug('Notification sent', {
        alertId: alert.id,
        channel
      })
    } catch (error) {
      loggerService.error('Failed to send notification', {
        alertId: alert.id,
        channel,
        error: (error as Error).message
      })
    }
  }

  /**
   * Envia notificação por email
   */
  private async sendEmailNotification(alert: Alert) {
    if (!this.config.emailConfig) return

    const template = this.config.emailConfig.templates[alert.type] || 
      this.config.emailConfig.templates.critical
    
    const message = template
      .replace('{{title}}', alert.title)
      .replace('{{message}}', alert.message)
      .replace('{{timestamp}}', new Date(alert.timestamp).toISOString())

    // Implementação de envio de email seria aqui
    // Por exemplo, usando nodemailer
    loggerService.info('Email notification would be sent', {
      alertId: alert.id,
      to: 'admin@example.com',
      subject: alert.title
    })
  }

  /**
   * Envia notificação para Slack
   */
  private async sendSlackNotification(alert: Alert) {
    if (!this.config.slackConfig?.webhookUrl) return

    const color = {
      [AlertType.CRITICAL]: 'danger',
      [AlertType.ERROR]: 'danger',
      [AlertType.WARNING]: 'warning',
      [AlertType.INFO]: 'good'
    }[alert.type] || 'danger'

    const payload = {
      channel: this.config.slackConfig.channel,
      username: this.config.slackConfig.username,
      attachments: [{
        color,
        title: alert.title,
        text: alert.message,
        fields: [
          {
            title: 'Severity',
            value: AlertSeverity[alert.severity],
            short: true
          },
          {
            title: 'Occurrences',
            value: alert.occurrences.toString(),
            short: true
          },
          {
            title: 'Time',
            value: new Date(alert.timestamp).toISOString(),
            short: false
          }
        ],
        ts: Math.floor(alert.timestamp / 1000)
      }]
    }

    // Implementação de envio para Slack seria aqui
    loggerService.info('Slack notification would be sent', {
      alertId: alert.id,
      webhook: this.config.slackConfig.webhookUrl
    })
  }

  /**
   * Envia notificação via webhook
   */
  private async sendWebhookNotification(alert: Alert) {
    if (!this.config.webhookConfig?.url) return

    const payload = {
      alert,
      timestamp: Date.now(),
      source: 'alert-service'
    }

    // Implementação de envio via webhook seria aqui
    loggerService.info('Webhook notification would be sent', {
      alertId: alert.id,
      url: this.config.webhookConfig.url
    })
  }

  /**
   * Envia notificação via SMS
   */
  private async sendSMSNotification(alert: Alert) {
    if (!this.config.smsConfig) return

    const message = `${alert.title}: ${alert.message}`

    // Implementação de envio de SMS seria aqui
    loggerService.info('SMS notification would be sent', {
      alertId: alert.id,
      provider: this.config.smsConfig.provider
    })
  }

  /**
   * Salva alerta no banco de dados
   */
  private async saveAlertToDatabase(alert: Alert) {
    try {
      const { error } = await supabase
        .from('apm_alerts')
        .insert({
          id: alert.id,
          rule_id: alert.ruleId,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          timestamp: new Date(alert.timestamp).toISOString(),
          resolved: alert.resolved,
          resolved_at: alert.resolvedAt ? new Date(alert.resolvedAt).toISOString() : null,
          metadata: alert.metadata,
          occurrences: alert.occurrences,
          last_occurrence: new Date(alert.lastOccurrence).toISOString(),
          channels: alert.channels,
          escalation_level: alert.escalationLevel
        })

      if (error) throw error
    } catch (error) {
      loggerService.error('Failed to save alert to database', {
        alertId: alert.id,
        error: (error as Error).message
      })
    }
  }

  /**
   * Programa escalação
   */
  private scheduleEscalation(alert: Alert, escalation: AlertEscalation) {
    escalation.levels.forEach((level, index) => {
      setTimeout(async () => {
        const currentAlert = this.activeAlerts.get(alert.id)
        if (!currentAlert || currentAlert.resolved) return

        currentAlert.escalationLevel = index + 1
        currentAlert.severity = level.severity
        currentAlert.channels = level.channels

        await this.sendNotifications(currentAlert)
        await this.saveAlertToDatabase(currentAlert)

        loggerService.info('Alert escalated', {
          alertId: alert.id,
          level: index + 1,
          severity: level.severity
        })
      }, level.delay * 1000)
    })
  }

  /**
   * Resolve alerta
   */
  async resolveAlert(alertId: string, reason?: string) {
    const alert = this.activeAlerts.get(alertId)
    if (!alert || alert.resolved) return false

    alert.resolved = true
    alert.resolvedAt = Date.now()
    if (reason) {
      alert.metadata.resolveReason = reason
    }

    // Atualiza no banco de dados
    try {
      const { error } = await supabase
        .from('apm_alerts')
        .update({
          resolved: true,
          resolved_at: new Date(alert.resolvedAt).toISOString(),
          metadata: alert.metadata
        })
        .eq('id', alertId)

      if (error) throw error

      loggerService.info('Alert resolved', {
        alertId,
        reason,
        duration: alert.resolvedAt - alert.timestamp
      })

      return true
    } catch (error) {
      loggerService.error('Failed to resolve alert', {
        alertId,
        error: (error as Error).message
      })
      return false
    }
  }

  /**
   * Limpa alertas antigos
   */
  private async cleanupOldAlerts() {
    const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000)

    // Remove alertas ativos antigos
    for (const [id, alert] of Array.from(this.activeAlerts.entries())) {
      if (alert.timestamp < cutoffTime) {
        this.activeAlerts.delete(id)
      }
    }

    // Remove contadores antigos
    for (const [key, count] of Array.from(this.alertCounts.entries())) {
      if (count.windowStart < cutoffTime) {
        this.alertCounts.delete(key)
      }
    }

    // Limpa banco de dados
    try {
      const { error } = await supabase
        .from('apm_alerts')
        .delete()
        .lt('timestamp', new Date(cutoffTime).toISOString())

      if (error) throw error

      loggerService.info('Old alerts cleaned up', {
        cutoffTime: new Date(cutoffTime).toISOString()
      })
    } catch (error) {
      loggerService.error('Failed to cleanup old alerts', {
        error: (error as Error).message
      })
    }
  }

  /**
   * Adiciona regra de alerta
   */
  addRule(rule: AlertRule) {
    this.rules.set(rule.id, rule)
    
    loggerService.info('Alert rule added', {
      ruleId: rule.id,
      name: rule.name
    })
  }

  /**
   * Remove regra de alerta
   */
  removeRule(ruleId: string) {
    const removed = this.rules.delete(ruleId)
    
    if (removed) {
      loggerService.info('Alert rule removed', { ruleId })
    }
    
    return removed
  }

  /**
   * Verifica se o serviço está inicializado
   */
  getInitializationStatus(): boolean {
    return this.isInitialized
  }

  /**
   * Obtém estatísticas
   */
  getStats() {
    const activeAlertsCount = Array.from(this.activeAlerts.values())
      .filter(alert => !alert.resolved).length
    
    const alertsByType = Array.from(this.activeAlerts.values())
      .reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const alertsBySeverity = Array.from(this.activeAlerts.values())
      .reduce((acc, alert) => {
        acc[AlertSeverity[alert.severity]] = (acc[AlertSeverity[alert.severity]] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return {
      enabled: this.config.enabled,
      rulesCount: this.rules.size,
      activeAlertsCount,
      totalAlertsCount: this.activeAlerts.size,
      alertsByType,
      alertsBySeverity,
      isInitialized: this.isInitialized
    }
  }

  /**
   * Obtém alertas ativos
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Obtém regras de alerta
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * Cria um alerta diretamente
   */
  async createAlert({
    type,
    severity,
    title,
    message,
    channels = [NotificationChannel.DATABASE],
    metadata = {}
  }: {
    type: AlertType
    severity: AlertSeverity
    title: string
    message: string
    channels?: NotificationChannel[]
    metadata?: Record<string, any>
  }) {
    const now = Date.now()
    const alertId = `manual_${now}_${Math.random().toString(36).substr(2, 9)}`

    const alert: Alert = {
      id: alertId,
      ruleId: 'manual-alert',
      type,
      severity,
      title,
      message,
      timestamp: now,
      resolved: false,
      metadata,
      occurrences: 1,
      lastOccurrence: now,
      channels,
      escalationLevel: 0
    }

    this.activeAlerts.set(alertId, alert)

    // Envia notificações
    await this.sendNotifications(alert)

    // Salva no banco de dados
    await this.saveAlertToDatabase(alert)

    loggerService.info('Manual alert created', {
      alertId,
      type,
      severity,
      title
    })

    return alert
  }

  /**
   * Destrói o serviço
   */
  async destroy() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer)
      this.monitoringTimer = null
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    this.circuitBreaker.destroy()
    this.rules.clear()
    this.activeAlerts.clear()
    this.alertCounts.clear()
    this.isInitialized = false
    
    loggerService.info('Alert service destroyed', {})
  }
}

/**
 * Instância singleton do serviço de alertas
 */
export const alertService = new AlertService()

/**
 * Decorator para alertas automáticos em métodos
 */
export function AlertOnError(
  alertType: AlertType = AlertType.ERROR,
  severity: AlertSeverity = AlertSeverity.MEDIUM
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args)
      } catch (error) {
        // Dispara alerta automático
        const alert: Alert = {
          id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ruleId: 'auto-error-alert',
          type: alertType,
          severity,
          title: `Error in ${target.constructor.name}.${propertyName}`,
          message: (error as Error).message,
          timestamp: Date.now(),
          resolved: false,
          metadata: {
            className: target.constructor.name,
            methodName: propertyName,
            args: JSON.stringify(args),
            stack: (error as Error).stack
          },
          occurrences: 1,
          lastOccurrence: Date.now(),
          channels: [NotificationChannel.DATABASE, NotificationChannel.EMAIL],
          escalationLevel: 0
        }

        alertService['activeAlerts'].set(alert.id, alert)
        alertService['saveAlertToDatabase'](alert)
        
        throw error
      }
    }
  }
}

export default alertService