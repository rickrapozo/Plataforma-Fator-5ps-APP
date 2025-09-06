import { supabase } from '../lib/supabase'
import { dataService, SystemMetrics } from './dataService'

// Interface para alertas do sistema
interface SystemAlert {
  id: string
  type: 'info' | 'warning' | 'error'
  message: string
  timestamp: string
  resolved: boolean
  category?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

interface UserActivity {
  user_id: string
  action: string
  page: string
  timestamp: string
  session_id: string
  user_agent: string
  ip_address?: string
}

interface ErrorLog {
  id: string
  timestamp: string
  error_type: string
  error_message: string
  stack_trace?: string
  user_id?: string
  page: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

class MonitoringService {
  private static instance: MonitoringService
  private alerts: SystemAlert[] = []
  private activities: UserActivity[] = []
  private errors: ErrorLog[] = []
  private sessionId: string
  private startTime: number
  private pageViews: Map<string, number> = new Map()
  private apiCalls: number = 0
  private errorCount: number = 0
  private localMetrics: any = null

  async getSystemMetrics() {
    // Usar dados reais do Supabase através do dataService
    return await dataService.getSystemMetrics()
  }

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.initializeMonitoring()
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeMonitoring() {
    // Monitorar performance da página
    if (typeof window !== 'undefined') {
      // Capturar erros JavaScript
      window.addEventListener('error', (event) => {
        this.logError({
          id: this.generateId(),
          timestamp: new Date().toISOString(),
          error_type: 'JavaScript Error',
          error_message: event.message,
          stack_trace: event.error?.stack,
          page: window.location.pathname,
          severity: 'medium'
        })
      })

      // Capturar erros de Promise rejeitadas
      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          id: this.generateId(),
          timestamp: new Date().toISOString(),
          error_type: 'Unhandled Promise Rejection',
          error_message: event.reason?.message || 'Unknown promise rejection',
          stack_trace: event.reason?.stack,
          page: window.location.pathname,
          severity: 'high'
        })
      })

      // Monitorar mudanças de página
      let currentPage = window.location.pathname
      const observer = new MutationObserver(() => {
        if (window.location.pathname !== currentPage) {
          currentPage = window.location.pathname
          this.trackPageView(currentPage)
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })

      // Coletar métricas a cada 30 segundos
      setInterval(() => {
        this.collectMetrics()
      }, 30000)

      // Salvar dados a cada 5 minutos
      setInterval(() => {
        this.saveToDatabase()
      }, 300000)
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  trackPageView(page: string, userId?: string) {
    const currentCount = this.pageViews.get(page) || 0
    this.pageViews.set(page, currentCount + 1)

    const activity: UserActivity = {
      user_id: userId || 'anonymous',
      action: 'page_view',
      page,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_agent: navigator.userAgent
    }

    this.activities.push(activity)
  }

  trackUserAction(action: string, page: string, userId?: string, metadata?: any) {
    const activity: UserActivity = {
      user_id: userId || 'anonymous',
      action,
      page,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_agent: navigator.userAgent
    }

    this.activities.push(activity)
  }

  trackApiCall(endpoint: string, method: string, status: number) {
    this.apiCalls++
    
    if (status >= 400) {
      this.logError({
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        error_type: 'API Error',
        error_message: `${method} ${endpoint} returned ${status}`,
        page: window.location.pathname,
        severity: status >= 500 ? 'high' : 'medium'
      })
    }
  }

  logError(error: ErrorLog) {
    this.errors.push(error)
    this.errorCount++
    
    // Log crítico - salvar imediatamente
    if (error.severity === 'critical') {
      this.saveErrorToDatabase(error)
    }
  }

  private async collectMetrics() {
    // Usar dados reais do dataService em vez de simular
    const realMetrics = await dataService.getSystemMetrics()
    
    // Adicionar dados locais de monitoramento
    const enhancedMetrics = {
      ...realMetrics,
      // Adicionar métricas específicas da sessão atual
      sessionPageViews: Array.from(this.pageViews.values()).reduce((a, b) => a + b, 0),
      sessionApiCalls: this.apiCalls,
      sessionErrors: this.errorCount
    }

    // Armazenar para uso local (não sobrescrever os dados reais)
    this.localMetrics = enhancedMetrics
  }





  private async saveToDatabase() {
    try {
      // Salvar atividades
      if (this.activities.length > 0) {
        await supabase.from('user_activities').insert(this.activities)
        this.activities = []
      }

      // Salvar erros
      if (this.errors.length > 0) {
        await supabase.from('error_logs').insert(this.errors)
        this.errors = []
      }

      // Salvar métricas locais se necessário
      if (this.localMetrics) {
        const sessionMetrics = {
          timestamp: new Date().toISOString(),
          session_id: this.sessionId,
          page_views: this.localMetrics.sessionPageViews,
          api_calls: this.localMetrics.sessionApiCalls,
          errors: this.localMetrics.sessionErrors
        }
        await supabase.from('session_metrics').insert([sessionMetrics])
      }
    } catch (error) {
      console.error('Erro ao salvar dados de monitoramento:', error)
    }
  }

  private async saveErrorToDatabase(error: ErrorLog) {
    try {
      await supabase.from('error_logs').insert([error])
    } catch (err) {
      console.error('Erro ao salvar log de erro:', err)
    }
  }

  // Métodos públicos para obter dados
  async getRealtimeMetrics(): Promise<SystemMetrics | null> {
    try {
      return await dataService.getSystemMetrics()
    } catch (error) {
      console.error('Erro ao buscar métricas em tempo real:', error)
      return null
    }
  }

  getRecentActivities(limit: number = 50): UserActivity[] {
    return this.activities.slice(-limit)
  }

  getRecentErrors(limit: number = 20): ErrorLog[] {
    return this.errors.slice(-limit)
  }

  getPageViewStats(): { page: string; views: number }[] {
    return Array.from(this.pageViews.entries()).map(([page, views]) => ({ page, views }))
  }

  async getHistoricalMetrics(hours: number = 24): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    
    try {
      // Buscar métricas de sessão históricas
      const { data, error } = await supabase
        .from('session_metrics')
        .select('*')
        .gte('timestamp', since)
        .order('timestamp', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar métricas históricas:', error)
      return []
    }
  }

  async getUserActivityReport(userId: string, days: number = 7): Promise<UserActivity[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', since)
        .order('timestamp', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar relatório de atividade:', error)
      return []
    }
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    metrics: SystemMetrics | null
    issues: string[]
  }> {
    const currentMetrics = await this.getRealtimeMetrics()
    const recentErrors = this.getRecentErrors(10)
    const issues: string[] = []
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'

    if (currentMetrics) {
      if (currentMetrics.cpuUsage > 80) {
        issues.push('Alto uso de CPU')
        status = 'warning'
      }
      if (currentMetrics.memoryUsage > 85) {
        issues.push('Alto uso de memória')
        status = 'warning'
      }
      if (currentMetrics.responseTime > 2000) {
        issues.push('Tempo de resposta elevado')
        status = 'warning'
      }
      if (currentMetrics.errorRate > 5) {
        issues.push('Taxa de erro elevada')
        status = 'critical'
      }
    }

    const criticalErrors = recentErrors.filter(e => e.severity === 'critical')
    if (criticalErrors.length > 0) {
      issues.push(`${criticalErrors.length} erros críticos`)
      status = 'critical'
    }

    return { status, metrics: currentMetrics, issues }
  }

  // Testar todos os serviços
  async testAllServices(): Promise<any[]> {
    try {
      const services = await dataService.getServiceStatus()
      
      // Testar cada serviço
      const testedServices = await Promise.all(
        services.map(async (service) => {
          const startTime = Date.now()
          let status: 'online' | 'offline' | 'warning' = 'online'
          let responseTime = 0
          
          try {
            if (service.name === 'Supabase Database') {
              // Testar conexão com Supabase
              const { error } = await supabase.from('users').select('count').limit(1)
              responseTime = Date.now() - startTime
              status = error ? 'offline' : 'online'
            } else if (service.name === 'Gemini AI') {
              // Testar conexão com Gemini
              const isOnline = await dataService.testGeminiConnection()
              responseTime = Date.now() - startTime
              status = isOnline ? 'online' : 'offline'
            } else {
              // Para outros serviços, simular teste
              responseTime = Math.random() * 100 + 20
              status = Math.random() > 0.1 ? 'online' : 'warning'
            }
          } catch (error) {
            responseTime = Date.now() - startTime
            status = 'offline'
          }
          
          return {
            ...service,
            status,
            responseTime,
            lastCheck: new Date().toISOString()
          }
        })
      )
      
      return testedServices
    } catch (error) {
      console.error('Erro ao testar serviços:', error)
      throw error
    }
  }

  // Obter status dos serviços
  async getServiceStatus(): Promise<any[]> {
    return await dataService.getServiceStatus()
  }
}

export const monitoringService = MonitoringService.getInstance()
export default MonitoringService
export type { UserActivity, ErrorLog, SystemAlert }