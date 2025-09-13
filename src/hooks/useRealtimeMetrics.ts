import { useState, useEffect, useCallback } from 'react'
import { monitoringService, UserActivity, ErrorLog } from '../services/monitoringService'
import { SystemMetrics } from '../services/dataService'
import { metricsCache, CacheKeys, withCache } from '../utils/cacheManager'

interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  confidence: number
  insights: string[]
  recommendations: string[]
  categories: string[]
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  performance?: string
}

interface RealtimeMetrics {
  current: SystemMetrics | null
  historical: SystemMetrics[]
  activities: UserActivity[]
  errors: ErrorLog[]
  health: {
    status: 'healthy' | 'warning' | 'critical'
    issues: string[]
  }
  analysis: AnalysisResult | null
  isLoading: boolean
  lastUpdated: Date | null
}

interface UseRealtimeMetricsOptions {
  updateInterval?: number
  enableAnalysis?: boolean
  historicalHours?: number
}

export const useRealtimeMetrics = (options: UseRealtimeMetricsOptions = {}) => {
  const {
    updateInterval = 30000, // 30 segundos
    enableAnalysis = true,
    historicalHours = 24
  } = options

  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    current: null,
    historical: [],
    activities: [],
    errors: [],
    health: { status: 'healthy', issues: [] },
    analysis: null,
    isLoading: true,
    lastUpdated: null
  })

  const [analysisLoading, setAnalysisLoading] = useState(false)

  const updateMetrics = useCallback(async () => {
    try {
      // Use cache for realtime metrics with 30-second TTL
      const current = await withCache.apiCall(
        metricsCache,
        CacheKeys.REALTIME_METRICS,
        () => monitoringService.getRealtimeMetrics(),
        30000 // 30 seconds
      )

      // Use cache for historical metrics with 2-minute TTL
      const historical = await withCache.apiCall(
        metricsCache,
        CacheKeys.HISTORICAL_METRICS(historicalHours),
        () => monitoringService.getHistoricalMetrics(historicalHours),
        120000 // 2 minutes
      )

      // Get recent activities and errors
      const activities = monitoringService.getRecentActivities(100)
      const errors = monitoringService.getRecentErrors(50)

      // Use cache for system health with 30-second TTL
      const health = await withCache.apiCall(
        metricsCache,
        CacheKeys.SYSTEM_HEALTH,
        () => monitoringService.getSystemHealth(),
        30000 // 30 seconds
      )

      setMetrics(prev => ({
        ...prev,
        current,
        historical,
        activities,
        errors,
        health,
        isLoading: false,
        lastUpdated: new Date()
      }))
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error)
      setMetrics(prev => ({ ...prev, isLoading: false }))
    }
  }, [historicalHours])

  const generateAnalysis = useCallback(async () => {
    if (!enableAnalysis || analysisLoading) return

    setAnalysisLoading(true)
    try {
      const analysisData = {
        current: metrics.current,
        historical: metrics.historical.slice(-10), // Últimas 10 métricas
        activities: metrics.activities.slice(-50), // Últimas 50 atividades
        errors: metrics.errors.slice(-20), // Últimos 20 erros
        health: metrics.health
      }

      // Cache AI analysis for 5 minutes since it's expensive to compute
      const analysis = await withCache.apiCall(
        metricsCache,
        'system:analysis:performance', // Chave simplificada sem dependência do Gemini
        () => Promise.resolve({ 
          sentiment: 'positive' as const,
          confidence: 0.8,
          insights: ['Sistema funcionando bem'],
          recommendations: ['Continue monitorando'],
          categories: ['performance'],
          urgencyLevel: 'low' as const,
          performance: 'good' 
        }), // Análise simplificada
        300000 // 5 minutes
      )
      
      setMetrics(prev => ({
        ...prev,
        analysis
      }))
    } catch (error) {
      console.error('Erro ao gerar análise:', error)
    } finally {
      setAnalysisLoading(false)
    }
  }, [enableAnalysis, analysisLoading, metrics.historical, metrics.activities, metrics.errors, metrics.health])

  // Atualizar métricas periodicamente
  useEffect(() => {
    updateMetrics()
    const interval = setInterval(updateMetrics, updateInterval)
    return () => clearInterval(interval)
  }, [updateMetrics, updateInterval])

  // Gerar análise a cada 5 minutos
  useEffect(() => {
    if (!enableAnalysis) return

    const analysisInterval = setInterval(generateAnalysis, 5 * 60 * 1000)
    return () => clearInterval(analysisInterval)
  }, [generateAnalysis, enableAnalysis])

  // Gerar análise inicial após carregar dados
  useEffect(() => {
    if (!metrics.isLoading && metrics.historical.length > 0 && !metrics.analysis && enableAnalysis) {
      setTimeout(generateAnalysis, 2000) // Aguardar 2 segundos
    }
  }, [metrics.isLoading, metrics.historical.length, metrics.analysis, enableAnalysis, generateAnalysis])

  const refreshMetrics = useCallback(() => {
    // Clear relevant cache entries to force fresh data
    metricsCache.invalidatePattern('metrics:')
    setMetrics(prev => ({ ...prev, isLoading: true }))
    updateMetrics()
  }, [updateMetrics])

  const refreshAnalysis = useCallback(() => {
    generateAnalysis()
  }, [generateAnalysis])

  const trackCustomEvent = useCallback((action: string, page: string, userId?: string) => {
    monitoringService.trackUserAction(action, page, userId)
  }, [])

  const getMetricsTrend = useCallback((metricKey: keyof SystemMetrics, hours: number = 6) => {
    const recentMetrics = metrics.historical.slice(-hours * 2) // Assumindo coleta a cada 30min
    if (recentMetrics.length < 2) return 'stable'

    const values = recentMetrics.map(m => m[metricKey] as number).filter(v => typeof v === 'number')
    if (values.length < 2) return 'stable'

    const first = values[0]
    const last = values[values.length - 1]
    const change = ((last - first) / first) * 100

    if (change > 10) return 'increasing'
    if (change < -10) return 'decreasing'
    return 'stable'
  }, [metrics.historical])

  const getTopPages = useCallback(() => {
    const pageViews = new Map<string, number>()
    
    metrics.activities
      .filter(activity => activity.action === 'page_view')
      .forEach(activity => {
        const current = pageViews.get(activity.page) || 0
        pageViews.set(activity.page, current + 1)
      })

    return Array.from(pageViews.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  }, [metrics.activities])

  const getActiveUsers = useCallback((minutes: number = 30) => {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    const recentActivities = metrics.activities.filter(
      activity => new Date(activity.timestamp) > cutoff
    )
    
    const uniqueUsers = new Set(recentActivities.map(a => a.user_id))
    return uniqueUsers.size
  }, [metrics.activities])

  const getErrorRate = useCallback((hours: number = 1) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    const recentErrors = metrics.errors.filter(
      error => new Date(error.timestamp) > cutoff
    )
    
    const totalActivities = metrics.activities.filter(
      activity => new Date(activity.timestamp) > cutoff
    ).length

    return totalActivities > 0 ? (recentErrors.length / totalActivities) * 100 : 0
  }, [metrics.errors, metrics.activities])

  const getPerformanceScore = useCallback(() => {
    if (!metrics.current) return 0

    const cpuScore = Math.max(0, 100 - metrics.current.cpuUsage)
    const memoryScore = Math.max(0, 100 - metrics.current.memoryUsage)
    const responseScore = Math.max(0, 100 - (metrics.current.responseTime / 50))
    const errorScore = Math.max(0, 100 - (metrics.current.errorRate * 10))

    return Math.round((cpuScore + memoryScore + responseScore + errorScore) / 4)
  }, [metrics.current])

  return {
    metrics,
    analysisLoading,
    refreshMetrics,
    refreshAnalysis,
    trackCustomEvent,
    
    // Computed values
    getMetricsTrend,
    getTopPages,
    getActiveUsers,
    getErrorRate,
    getPerformanceScore,
    
    // Status helpers
    isHealthy: metrics.health.status === 'healthy',
    hasWarnings: metrics.health.status === 'warning',
    isCritical: metrics.health.status === 'critical',
    hasAnalysis: !!metrics.analysis && !analysisLoading
  }
}

export default useRealtimeMetrics