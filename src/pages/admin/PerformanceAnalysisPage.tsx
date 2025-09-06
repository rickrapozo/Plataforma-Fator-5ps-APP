import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Activity, Zap, Clock, TrendingUp, BarChart3, PieChart, LineChart, Download, RefreshCw, Shield } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useAdminAuth } from '../../hooks/useSecureAuth'
import PerformanceOptimizer from '../../components/admin/PerformanceOptimizer'
import { metricsCache, systemCache } from '../../utils/cacheManager'

interface PerformanceData {
  timestamp: string
  renderTime: number
  memoryUsage: number
  cacheHitRate: number
  loadTime: number
  bundleSize: number
  componentCount: number
}

interface CacheStats {
  totalEntries: number
  hitRate: number
  missRate: number
  totalSize: number
  oldestEntry: string
  newestEntry: string
}

const PerformanceAnalysisPage: React.FC = () => {
  const navigate = useNavigate()
  const { isLoading: authLoading, isAuthorized, error: authError, logAction } = useAdminAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'optimizer' | 'cache' | 'history'>('overview')
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceData[]>([])
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalEntries: 0,
    hitRate: 0,
    missRate: 0,
    totalSize: 0,
    oldestEntry: '',
    newestEntry: ''
  })
  const [isLoading, setIsLoading] = useState(false)

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
            Você não tem permissão para acessar a análise de performance.
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

  // Check admin permissions (legacy check removed, now handled by useAdminAuth)
  if (false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <Link to="/app" className="text-blue-600 hover:text-blue-700">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Generate mock performance data
  const generatePerformanceData = (): PerformanceData[] => {
    const data: PerformanceData[] = []
    const now = new Date()
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.push({
        timestamp: timestamp.toISOString(),
        renderTime: Math.random() * 20 + 5,
        memoryUsage: Math.random() * 30 + 20,
        cacheHitRate: Math.random() * 40 + 60,
        loadTime: Math.random() * 1000 + 500,
        bundleSize: Math.random() * 500 + 1000,
        componentCount: Math.floor(Math.random() * 50 + 50)
      })
    }
    
    return data
  }

  // Load cache statistics
  const loadCacheStats = () => {
    const metricsStats = metricsCache.getStats()
    const systemStats = systemCache.getStats()
    
    setCacheStats({
      totalEntries: metricsStats.size + systemStats.size,
      hitRate: (metricsStats.hitRate + systemStats.hitRate) / 2,
      missRate: (100 - metricsStats.hitRate + 100 - systemStats.hitRate) / 2,
      totalSize: metricsStats.size + systemStats.size,
      oldestEntry: new Date().toISOString(),
      newestEntry: new Date().toISOString()
    })
  }

  // Refresh data
  const refreshData = async () => {
    setIsLoading(true)
    try {
      setPerformanceHistory(generatePerformanceData())
      loadCacheStats()
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Export performance data
  const exportData = () => {
    const data = {
      performanceHistory,
      cacheStats,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-analysis-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Calculate average metrics
  const averageMetrics = useMemo(() => {
    if (performanceHistory.length === 0) return null
    
    const totals = performanceHistory.reduce((acc, data) => ({
      renderTime: acc.renderTime + data.renderTime,
      memoryUsage: acc.memoryUsage + data.memoryUsage,
      cacheHitRate: acc.cacheHitRate + data.cacheHitRate,
      loadTime: acc.loadTime + data.loadTime
    }), { renderTime: 0, memoryUsage: 0, cacheHitRate: 0, loadTime: 0 })
    
    const count = performanceHistory.length
    return {
      renderTime: totals.renderTime / count,
      memoryUsage: totals.memoryUsage / count,
      cacheHitRate: totals.cacheHitRate / count,
      loadTime: totals.loadTime / count
    }
  }, [performanceHistory])

  useEffect(() => {
    if (!isAuthorized) return
    
    const initializeData = async () => {
      try {
        await logAction('access_performance_analysis', { page: 'PerformanceAnalysisPage' })
        refreshData()
      } catch (error) {
        console.error('Erro ao inicializar dados de performance:', error)
      }
    }
    
    initializeData()
  }, [isAuthorized, logAction])

  const tabs = [
    { id: 'overview' as const, label: 'Visão Geral', icon: BarChart3 },
    { id: 'optimizer' as const, label: 'Otimizador', icon: Zap },
    { id: 'cache' as const, label: 'Cache', icon: Activity },
    { id: 'history' as const, label: 'Histórico', icon: LineChart }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/app/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar ao Painel</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Análise de Performance</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Average Metrics Cards */}
            {averageMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Tempo Médio de Renderização</span>
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {averageMetrics.renderTime.toFixed(2)}ms
                  </div>
                  <div className={`text-sm ${
                    averageMetrics.renderTime > 16 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {averageMetrics.renderTime > 16 ? 'Acima do ideal' : 'Dentro do ideal'}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Uso Médio de Memória</span>
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {averageMetrics.memoryUsage.toFixed(1)}MB
                  </div>
                  <div className={`text-sm ${
                    averageMetrics.memoryUsage > 50 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {averageMetrics.memoryUsage > 50 ? 'Alto uso' : 'Uso normal'}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Taxa Média de Cache</span>
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {averageMetrics.cacheHitRate.toFixed(1)}%
                  </div>
                  <div className={`text-sm ${
                    averageMetrics.cacheHitRate < 70 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {averageMetrics.cacheHitRate < 70 ? 'Pode melhorar' : 'Boa performance'}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Tempo Médio de Carregamento</span>
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(averageMetrics.loadTime / 1000).toFixed(2)}s
                  </div>
                  <div className={`text-sm ${
                    averageMetrics.loadTime > 2000 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {averageMetrics.loadTime > 2000 ? 'Lento' : 'Rápido'}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Chart Placeholder */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendência de Performance (24h)</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Gráfico de performance seria renderizado aqui</p>
                  <p className="text-sm">Integração com biblioteca de gráficos necessária</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'optimizer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PerformanceOptimizer />
          </motion.div>
        )}

        {activeTab === 'cache' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Cache Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total de Entradas</span>
                  <PieChart className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{cacheStats.totalEntries}</div>
                <div className="text-sm text-gray-500">Itens em cache</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Taxa de Acerto</span>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{cacheStats.hitRate.toFixed(1)}%</div>
                <div className="text-sm text-green-600">Cache hits</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Taxa de Erro</span>
                  <Activity className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{cacheStats.missRate.toFixed(1)}%</div>
                <div className="text-sm text-red-600">Cache misses</div>
              </div>
            </div>

            {/* Cache Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gerenciamento de Cache</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    metricsCache.clear()
                    loadCacheStats()
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                >
                  <h4 className="font-medium text-gray-900 mb-1">Limpar Cache de Métricas</h4>
                  <p className="text-sm text-gray-600">Remove todas as métricas em cache</p>
                </button>
                
                <button
                  onClick={() => {
                    systemCache.clear()
                    loadCacheStats()
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                >
                  <h4 className="font-medium text-gray-900 mb-1">Limpar Cache do Sistema</h4>
                  <p className="text-sm text-gray-600">Remove todos os dados do sistema em cache</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Render Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Memory Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cache Hit Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Load Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performanceHistory.slice(-10).map((data, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(data.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.renderTime.toFixed(2)}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.memoryUsage.toFixed(1)}MB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.cacheHitRate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(data.loadTime / 1000).toFixed(2)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PerformanceAnalysisPage