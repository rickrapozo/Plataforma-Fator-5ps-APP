import React, { memo, useMemo, useCallback, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Zap, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { metricsCache, systemCache, withCache } from '../../utils/cacheManager'

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  cacheHitRate: number
  componentCount: number
  bundleSize: number
  loadTime: number
}

interface OptimizationSuggestion {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  action?: () => void
}

const PerformanceOptimizer: React.FC = memo(() => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    componentCount: 0,
    bundleSize: 0,
    loadTime: 0
  })
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Memoized performance calculations
  const performanceScore = useMemo(() => {
    const { renderTime, memoryUsage, cacheHitRate, loadTime } = metrics
    
    let score = 100
    
    // Penalize slow render times (> 16ms for 60fps)
    if (renderTime > 16) score -= Math.min(30, (renderTime - 16) * 2)
    
    // Penalize high memory usage (> 50MB)
    if (memoryUsage > 50) score -= Math.min(25, (memoryUsage - 50) * 0.5)
    
    // Reward high cache hit rate
    score += (cacheHitRate - 50) * 0.3
    
    // Penalize slow load times (> 2s)
    if (loadTime > 2000) score -= Math.min(20, (loadTime - 2000) * 0.01)
    
    return Math.max(0, Math.min(100, Math.round(score)))
  }, [metrics])

  const performanceGrade = useMemo(() => {
    if (performanceScore >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' }
    if (performanceScore >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' }
    if (performanceScore >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (performanceScore >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (performanceScore >= 50) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' }
  }, [performanceScore])

  // Collect performance metrics
  const collectMetrics = useCallback(async () => {
    const startTime = performance.now()
    
    // Simulate metrics collection
    const newMetrics: PerformanceMetrics = {
      renderTime: performance.now() - startTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0,
      cacheHitRate: metricsCache.getStats().hitRate,
      componentCount: document.querySelectorAll('[data-react-component]').length,
      bundleSize: 0, // Would need build-time data
      loadTime: performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0
    }
    
    setMetrics(newMetrics)
    
    // Generate optimization suggestions
    const newSuggestions: OptimizationSuggestion[] = []
    
    if (newMetrics.renderTime > 16) {
      newSuggestions.push({
        id: 'slow-render',
        type: 'warning',
        title: 'Renderização Lenta Detectada',
        description: `Tempo de renderização: ${newMetrics.renderTime.toFixed(2)}ms. Considere usar React.memo ou useMemo.`,
        impact: 'high'
      })
    }
    
    if (newMetrics.memoryUsage > 50) {
      newSuggestions.push({
        id: 'high-memory',
        type: 'critical',
        title: 'Alto Uso de Memória',
        description: `Uso de memória: ${newMetrics.memoryUsage.toFixed(1)}MB. Verifique vazamentos de memória.`,
        impact: 'high'
      })
    }
    
    if (newMetrics.cacheHitRate < 70) {
      newSuggestions.push({
        id: 'low-cache',
        type: 'info',
        title: 'Taxa de Cache Baixa',
        description: `Taxa de acerto do cache: ${newMetrics.cacheHitRate.toFixed(1)}%. Otimize estratégias de cache.`,
        impact: 'medium'
      })
    }
    
    if (newMetrics.componentCount > 100) {
      newSuggestions.push({
        id: 'many-components',
        type: 'warning',
        title: 'Muitos Componentes',
        description: `${newMetrics.componentCount} componentes renderizados. Considere virtualização.`,
        impact: 'medium'
      })
    }
    
    setSuggestions(newSuggestions)
  }, [])

  // Auto-optimization function
  const runAutoOptimization = useCallback(async () => {
    setIsOptimizing(true)
    
    try {
      // Clear old cache entries
      metricsCache.clear()
      systemCache.clear()
      
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc()
      }
      
      // Preload critical resources
      await Promise.all([
        withCache.apiCall(metricsCache, 'preload:metrics', () => Promise.resolve({}), 300000),
        withCache.apiCall(systemCache, 'preload:system', () => Promise.resolve({}), 300000)
      ])
      
      // Re-collect metrics after optimization
      setTimeout(collectMetrics, 1000)
      
    } catch (error) {
      console.error('Auto-optimization failed:', error)
    } finally {
      setIsOptimizing(false)
    }
  }, [collectMetrics])

  useEffect(() => {
    collectMetrics()
    const interval = setInterval(collectMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [collectMetrics])

  const getSuggestionIcon = (type: OptimizationSuggestion['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'info': return <TrendingUp className="w-4 h-4 text-blue-500" />
      default: return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Performance Score
          </h3>
          <button
            onClick={runAutoOptimization}
            disabled={isOptimizing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isOptimizing ? 'Otimizando...' : 'Auto-Otimizar'}
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${performanceGrade.bg} ${performanceGrade.color}`}>
                {performanceGrade.grade}
              </div>
              <span className="text-2xl font-bold text-gray-900">{performanceScore}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${performanceScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Tempo de Renderização</span>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.renderTime.toFixed(2)}ms</div>
          <div className={`text-xs ${metrics.renderTime > 16 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.renderTime > 16 ? 'Acima do ideal (16ms)' : 'Dentro do ideal'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Uso de Memória</span>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.memoryUsage.toFixed(1)}MB</div>
          <div className={`text-xs ${metrics.memoryUsage > 50 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.memoryUsage > 50 ? 'Alto uso' : 'Uso normal'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Taxa de Cache</span>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.cacheHitRate.toFixed(1)}%</div>
          <div className={`text-xs ${metrics.cacheHitRate < 70 ? 'text-yellow-600' : 'text-green-600'}`}>
            {metrics.cacheHitRate < 70 ? 'Pode melhorar' : 'Boa performance'}
          </div>
        </motion.div>
      </div>

      {/* Optimization Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sugestões de Otimização</h3>
        
        <AnimatePresence>
          {suggestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p>Nenhuma otimização necessária no momento!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  {getSuggestionIcon(suggestion.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        suggestion.impact === 'high' ? 'bg-red-100 text-red-700' :
                        suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {suggestion.impact === 'high' ? 'Alto Impacto' :
                         suggestion.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  </div>
                  {suggestion.action && (
                    <button
                      onClick={suggestion.action}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Aplicar
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
})

PerformanceOptimizer.displayName = 'PerformanceOptimizer'

export default PerformanceOptimizer