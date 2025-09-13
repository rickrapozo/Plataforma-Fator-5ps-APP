import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Brain,
  Eye,
  Zap,
  Server,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Shield,
  Cpu,
  MemoryStick
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { useAdminAuth } from '../../hooks/useSecureAuth'
import useRealtimeMetrics from '../../hooks/useRealtimeMetrics'
import { SystemMetrics } from '../../services/dataService'

const RealtimeMetricsPage: React.FC = () => {
  const { user } = useAppStore()
  const navigate = useNavigate()
  const { isLoading: authLoading, isAuthorized, error: authError, logAction } = useAdminAuth()
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const {
    metrics,
    analysisLoading,
    refreshMetrics,
    refreshAnalysis,
    getMetricsTrend,
    getTopPages,
    getActiveUsers,
    getErrorRate,
    getPerformanceScore,
    isHealthy,
    hasWarnings,
    isCritical,
    hasAnalysis
  } = useRealtimeMetrics({
    updateInterval: autoRefresh ? 30000 : 0,
    enableAnalysis: true,
    historicalHours: selectedTimeRange === '1h' ? 1 : selectedTimeRange === '6h' ? 6 : 24
  })

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-navy via-royal-purple to-midnight-blue flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-8 h-8 text-royal-gold animate-spin mx-auto mb-4" />
          <p className="text-white">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Access denied state
  if (!isAuthorized || authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-navy via-royal-purple to-midnight-blue flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-pearl-white/80 mb-6">
            Você não tem permissão para acessar as métricas em tempo real.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-royal-gold hover:bg-royal-gold/80 text-white rounded-lg transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-success-green" />
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-error-red" />
      default: return <Minus className="w-4 h-4 text-pearl-white/60" />
    }
  }

  const getHealthColor = () => {
    if (isCritical) return 'text-error-red'
    if (hasWarnings) return 'text-warning-yellow'
    return 'text-success-green'
  }

  // Register access action
  useEffect(() => {
    if (!isAuthorized) return
    
    const registerAccess = async () => {
      try {
        await logAction('access_realtime_metrics', { page: 'RealtimeMetricsPage' })
      } catch (error) {
        console.error('Erro ao registrar acesso às métricas:', error)
      }
    }
    
    registerAccess()
  }, [isAuthorized, logAction])

  const getHealthIcon = () => {
    if (isCritical) return <XCircle className="w-6 h-6" />
    if (hasWarnings) return <AlertTriangle className="w-6 h-6" />
    return <CheckCircle className="w-6 h-6" />
  }

  const MetricCard: React.FC<{
    title: string
    value: string | number
    icon: React.ReactNode
    trend?: string
    subtitle?: string
    color?: string
  }> = ({ title, value, icon, trend, subtitle, color = 'text-white' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-royal-gold/20 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-pearl-white/80 text-sm font-medium">{title}</h3>
            {subtitle && <p className="text-pearl-white/60 text-xs">{subtitle}</p>}
          </div>
        </div>
        {trend && getTrendIcon(trend)}
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
      </div>
    </motion.div>
  )

  const ChartCard: React.FC<{
    title: string
    children: React.ReactNode
    actions?: React.ReactNode
  }> = ({ title, children, actions }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        {actions}
      </div>
      {children}
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-navy via-royal-purple to-midnight-blue p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">Métricas em Tempo Real</h1>
            <p className="text-pearl-white/80">
              Monitoramento completo da plataforma com IA integrada
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-royal-gold"
            >
              <option value="1h">Última Hora</option>
              <option value="6h">Últimas 6 Horas</option>
              <option value="24h">Últimas 24 Horas</option>
            </select>
            
            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                autoRefresh
                  ? 'bg-success-green text-white'
                  : 'bg-white/10 text-pearl-white/80 hover:bg-white/20'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Manual Refresh */}
            <button
              onClick={refreshMetrics}
              className="neuro-button bg-royal-gold hover:bg-royal-gold/80 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Atualizar
            </button>
          </div>
        </motion.div>

        {/* System Health Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`${getHealthColor()}`}>
                {getHealthIcon()}
              </div>
              <div>
                <h2 className="text-white text-xl font-semibold">
                  Status do Sistema: {isCritical ? 'Crítico' : hasWarnings ? 'Atenção' : 'Saudável'}
                </h2>
                <p className="text-pearl-white/80">
                  Última atualização: {metrics.lastUpdated?.toLocaleTimeString() || 'Nunca'}
                </p>
              </div>
            </div>
            
            {metrics.health.issues.length > 0 && (
              <div className="text-right">
                <p className="text-pearl-white/80 text-sm mb-1">Problemas detectados:</p>
                <ul className="text-error-red text-sm space-y-1">
                  {metrics.health.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Usuários Ativos"
            value={getActiveUsers(30)}
            icon={<Users className="w-6 h-6 text-royal-gold" />}
            trend={getMetricsTrend('activeUsers')}
            subtitle="Últimos 30 minutos"
          />
          
          <MetricCard
            title="Visualizações"
            value={formatNumber(metrics.current?.totalSessions || 0)}
            icon={<Eye className="w-6 h-6 text-royal-gold" />}
            trend={getMetricsTrend('totalSessions')}
            subtitle="Total hoje"
          />
          
          <MetricCard
            title="Performance"
            value={`${getPerformanceScore()}%`}
            icon={<Zap className="w-6 h-6 text-royal-gold" />}
            color={getPerformanceScore() > 80 ? 'text-success-green' : getPerformanceScore() > 60 ? 'text-warning-yellow' : 'text-error-red'}
            subtitle="Score geral"
          />
          
          <MetricCard
            title="Taxa de Erro"
            value={formatPercentage(getErrorRate())}
            icon={<AlertTriangle className="w-6 h-6 text-royal-gold" />}
            color={getErrorRate() < 1 ? 'text-success-green' : getErrorRate() < 5 ? 'text-warning-yellow' : 'text-error-red'}
            subtitle="Última hora"
          />
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="CPU"
            value={formatPercentage(metrics.current?.cpuUsage || 0)}
            icon={<Cpu className="w-6 h-6 text-royal-gold" />}
            trend={getMetricsTrend('cpuUsage')}
            color={metrics.current && metrics.current.cpuUsage > 80 ? 'text-error-red' : metrics.current && metrics.current.cpuUsage > 60 ? 'text-warning-yellow' : 'text-success-green'}
          />
          
          <MetricCard
            title="Memória"
            value={formatPercentage(metrics.current?.memoryUsage || 0)}
            icon={<MemoryStick className="w-6 h-6 text-royal-gold" />}
            trend={getMetricsTrend('memoryUsage')}
            color={metrics.current && metrics.current.memoryUsage > 85 ? 'text-error-red' : metrics.current && metrics.current.memoryUsage > 70 ? 'text-warning-yellow' : 'text-success-green'}
          />
          
          <MetricCard
            title="Tempo de Resposta"
            value={`${metrics.current?.responseTime?.toFixed(0) || 0}ms`}
            icon={<Clock className="w-6 h-6 text-royal-gold" />}
            trend={getMetricsTrend('responseTime')}
            color={metrics.current && metrics.current.responseTime > 2000 ? 'text-error-red' : metrics.current && metrics.current.responseTime > 1000 ? 'text-warning-yellow' : 'text-success-green'}
          />
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Pages */}
          <ChartCard title="Páginas Mais Visitadas">
            <div className="space-y-3">
              {getTopPages().slice(0, 8).map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-royal-gold/20 rounded text-royal-gold text-xs flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-white text-sm">{page.page}</span>
                  </div>
                  <span className="text-pearl-white/80 text-sm">{page.views} views</span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Recent Activities */}
          <ChartCard title="Atividades Recentes">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {metrics.activities.slice(-10).reverse().map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                  <div>
                    <p className="text-white text-sm">{activity.action}</p>
                    <p className="text-pearl-white/60 text-xs">{activity.page}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-pearl-white/80 text-xs">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-pearl-white/60 text-xs">
                      {activity.user_id.substring(0, 8)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* AI Analysis */}
        {hasAnalysis && (
          <ChartCard
            title="Análise de IA"
            actions={
              <button
                onClick={refreshAnalysis}
                disabled={analysisLoading}
                className="neuro-button bg-royal-gold hover:bg-royal-gold/80 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>{analysisLoading ? 'Analisando...' : 'Atualizar Análise'}</span>
              </button>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Insights</h4>
                <ul className="space-y-2">
                  {metrics.analysis?.insights.map((insight, index) => (
                    <li key={index} className="text-pearl-white/80 text-sm flex items-start space-x-2">
                      <span className="text-royal-gold mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Recomendações</h4>
                <ul className="space-y-2">
                  {metrics.analysis?.recommendations.map((rec, index) => (
                    <li key={index} className="text-pearl-white/80 text-sm flex items-start space-x-2">
                      <span className="text-success-green mt-1">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-pearl-white/80">
                  <strong>Insights:</strong> {metrics.analysis?.insights?.join(', ')}
                </p>
                <div className="text-right">
                  <p className="text-pearl-white/60 text-sm">Confiança</p>
                  <p className="text-royal-gold font-semibold">
                    {formatPercentage((metrics.analysis?.confidence || 0) * 100)}
                  </p>
                </div>
              </div>
            </div>
          </ChartCard>
        )}

        {/* Error Logs */}
        {metrics.errors.length > 0 && (
          <ChartCard title="Logs de Erro Recentes">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {metrics.errors.slice(-10).reverse().map((error, index) => (
                <div key={error.id} className="p-3 bg-error-red/10 border border-error-red/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      error.severity === 'critical' ? 'bg-error-red text-white' :
                      error.severity === 'high' ? 'bg-warning-yellow text-black' :
                      error.severity === 'medium' ? 'bg-royal-gold text-white' :
                      'bg-pearl-white/20 text-pearl-white'
                    }`}>
                      {error.severity.toUpperCase()}
                    </span>
                    <span className="text-pearl-white/60 text-xs">
                      {new Date(error.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium mb-1">{error.error_type}</p>
                  <p className="text-pearl-white/80 text-sm">{error.error_message}</p>
                  <p className="text-pearl-white/60 text-xs mt-1">Página: {error.page}</p>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  )
}

export default RealtimeMetricsPage