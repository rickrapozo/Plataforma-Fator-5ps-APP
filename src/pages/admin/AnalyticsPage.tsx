import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  BarChart3, Users, Eye, TrendingUp, ArrowLeft,
  Activity, Target, Download, Trash2, Brain, Loader2, RefreshCw, Shield
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { useAdminAuth } from '../../hooks/useSecureAuth'
import { analyticsService } from '../../services/analyticsService'

import { geminiService, AnalysisResult } from '../../services/geminiService'

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAppStore()
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [pageViewMetrics, setPageViewMetrics] = useState<any>({})
  const [redirectAnalytics, setRedirectAnalytics] = useState<any>({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const { isLoading: authLoading, isAuthorized, error: authError, logAction } = useAdminAuth()

  useEffect(() => {
    if (!authLoading && isAuthorized) {
      loadAnalyticsData()
      logAction('analytics_access', { refreshKey })
    }
  }, [refreshKey, authLoading, isAuthorized, logAction])

  // Verificar se o usuário tem acesso
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-teal via-ocean-blue to-royal-purple flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-16 h-16 text-royal-gold mx-auto mb-4 animate-spin" />
          <h1 className="text-white text-2xl font-bold mb-2">Verificando Acesso</h1>
          <p className="text-pearl-white/80">
            Validando suas credenciais administrativas...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthorized || authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-teal via-ocean-blue to-royal-purple flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Shield className="w-16 h-16 text-error-red mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-pearl-white/80 mb-6">
            {authError || 'Você não tem permissão para acessar os analytics.'}
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="bg-royal-gold hover:bg-bright-gold text-deep-teal px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    )
  }

  const loadAnalyticsData = () => {
    const data = analyticsService.getAnalyticsData()
    const pageMetrics = analyticsService.getPageViewMetrics()
    const redirectData = analyticsService.getRedirectAnalytics()
    
    setAnalyticsData(data)
    setPageViewMetrics(pageMetrics)
    setRedirectAnalytics(redirectData)
  }

  const generateAIAnalysis = async () => {
    if (!analyticsData) return
    
    setIsLoadingAnalysis(true)
    try {
      // Preparar dados para análise (apenas dados não-sensíveis)
      const analysisData = {
        totalEvents: analyticsData.events.length,
        totalPageViews: analyticsData.pageViews.length,
        totalRedirects: analyticsData.redirects.length,
        topPages: Object.entries(pageViewMetrics.pageViews || {})
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5),
        userEngagement: {
          averageTimeOnPage: pageViewMetrics.averageTimeOnPage || 0,
          bounceRate: pageViewMetrics.bounceRate || 0
        },
        redirectPatterns: Object.entries(redirectAnalytics.sources || {})
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
      }

      const analysis = await geminiService.generateCustomAnalysis({
        type: 'user_behavior',
        data: analysisData,
        context: 'Análise de comportamento do usuário na plataforma Essential Factor'
      })

      setAiAnalysis(analysis)
    } catch (error) {
      console.error('Erro ao gerar análise AI:', error)
    } finally {
      setIsLoadingAnalysis(false)
    }
  }

  const handleExportData = () => {
    const exportData = analyticsService.exportAnalyticsData()
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados de analytics? Esta ação não pode ser desfeita.')) {
      analyticsService.clearAnalyticsData()
      setRefreshKey(prev => prev + 1)
    }
  }

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Verificar acesso de administrador
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-sage-green flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-sage-green/80 mb-6">Você não tem permissão para acessar esta página.</p>
          <Link to="/app/dashboard">
            <motion.button
              className="px-6 py-3 bg-royal-gold hover:bg-royal-gold/90 text-white rounded-lg font-semibold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Voltar ao Dashboard
            </motion.button>
          </Link>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-sage-green flex items-center justify-center">
        <div className="text-white text-lg">Carregando dados de analytics...</div>
      </div>
    )
  }

  // Mock data para demonstração
  const mockQuizFunnel = [
    { step: 'Quiz Início', users: 1000, dropoffRate: 0 },
    { step: 'Pergunta 1-3', users: 850, dropoffRate: 15 },
    { step: 'Pergunta 4-6', users: 720, dropoffRate: 15.3 },
    { step: 'Pergunta 7-9', users: 620, dropoffRate: 13.9 },
    { step: 'Quiz Completo', users: 580, dropoffRate: 6.5 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-sage-green">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/app/admin">
              <motion.button
                className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-sage-green/80">Análise completa de métricas e performance da plataforma</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={generateAIAnalysis}
              disabled={isLoadingAnalysis || !analyticsData}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isLoadingAnalysis ? 1 : 1.05 }}
              whileTap={{ scale: isLoadingAnalysis ? 1 : 0.95 }}
            >
              {isLoadingAnalysis ? (
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 text-purple-400" />
              )}
              <span className="text-purple-400 font-medium">
                {isLoadingAnalysis ? 'Analisando...' : 'Análise AI'}
              </span>
            </motion.button>
            <motion.button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-royal-gold/20 hover:bg-royal-gold/30 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4 text-royal-gold" />
              <span className="text-royal-gold font-medium">Exportar</span>
            </motion.button>
            <motion.button
              onClick={handleClearData}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-medium">Limpar</span>
            </motion.button>
            <motion.button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Activity className="w-4 h-4 text-white" />
              <span className="text-white font-medium">Atualizar</span>
            </motion.button>
          </div>
        </div>

        {/* Visão Geral */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-royal-gold" />
              <span className="text-2xl font-bold text-white">{analyticsData.events.length}</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Total de Eventos</h3>
            <p className="text-sage-green/70 text-sm">Interações registradas</p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-emerald-400" />
              <span className="text-2xl font-bold text-white">{analyticsData.pageViews.length}</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Visualizações</h3>
            <p className="text-sage-green/70 text-sm">Total de páginas vistas</p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{analyticsData.redirects.length}</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Redirecionamentos</h3>
            <p className="text-sage-green/70 text-sm">Total de redirects</p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {analyticsData.redirects.filter((r: any) => r.destination === '/onboarding/welcome').length}
              </span>
            </div>
            <h3 className="text-white font-semibold mb-1">Redirects Onboarding</h3>
            <p className="text-sage-green/70 text-sm">Para /onboarding/welcome</p>
          </motion.div>
        </div>

        {/* AI Analysis Section */}
        {aiAnalysis && (
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Análise Inteligente com Gemini AI</h2>
              <div className="flex items-center space-x-2 text-sm text-purple-400">
                <span>Confiança:</span>
                <span className="font-semibold">{Math.round(aiAnalysis.confidence * 100)}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Insights */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Insights Principais</span>
                </h3>
                <div className="space-y-2">
                  {aiAnalysis.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-pearl-white/80 text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recomendações */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Recomendações</span>
                </h3>
                <div className="space-y-2">
                  {aiAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-royal-gold rounded-full mt-2 flex-shrink-0" />
                      <p className="text-pearl-white/80 text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Métricas AI */}
            {Object.keys(aiAnalysis.metrics).length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white font-semibold mb-3">Métricas Calculadas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(aiAnalysis.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-lg font-bold text-white">
                        {typeof value === 'number' ? value.toFixed(2) : value}
                      </div>
                      <div className="text-xs text-pearl-white/60 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Resumo */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-white font-semibold mb-3">Resumo Executivo</h3>
              <p className="text-pearl-white/80 text-sm leading-relaxed">{aiAnalysis.summary}</p>
            </div>
          </motion.div>
        )}

        {/* Métricas de Visualização de Página */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <Eye className="w-6 h-6 text-royal-gold" />
            <h2 className="text-xl font-bold text-white">Visualizações de Página por Usuário</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(pageViewMetrics).length > 0 ? (
              Object.entries(pageViewMetrics).map(([page, metrics]: [string, any], index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{page}</h3>
                    <p className="text-sage-green/70 text-sm">{metrics.uniqueUsers} usuários únicos</p>
                  </div>
                  <div className="flex items-center space-x-6 text-right">
                    <div>
                      <p className="text-white font-semibold">{metrics.views}</p>
                      <p className="text-sage-green/70 text-xs">visualizações</p>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{formatTime(metrics.avgTimeOnPage)}</p>
                      <p className="text-sage-green/70 text-xs">tempo médio</p>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{metrics.bounceRate.toFixed(1)}%</p>
                      <p className="text-sage-green/70 text-xs">taxa de rejeição</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sage-green/70">Nenhum dado de visualização de página disponível ainda.</p>
                <p className="text-sage-green/50 text-sm mt-2">Os dados aparecerão conforme os usuários navegam pela plataforma.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Análise de Redirecionamentos */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-6 h-6 text-royal-gold" />
            <h2 className="text-xl font-bold text-white">Análise de Redirecionamentos</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(redirectAnalytics).length > 0 ? (
              Object.entries(redirectAnalytics).map(([redirect, data]: [string, any], index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{redirect}</span>
                    <span className="text-royal-gold font-semibold">{data.count} redirects</span>
                  </div>
                  <div className="text-sm text-sage-green/70">
                    <p>Usuários únicos: {data.uniqueUsers}</p>
                    <div className="mt-2">
                      <p className="font-medium text-sage-green/80">Motivos:</p>
                      {Object.entries(data.reasons).map(([reason, count]: [string, any]) => (
                        <span key={reason} className="inline-block bg-white/10 rounded px-2 py-1 text-xs mr-2 mt-1">
                          {reason}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sage-green/70">Nenhum redirecionamento registrado ainda.</p>
                <p className="text-sage-green/50 text-sm mt-2">Os dados aparecerão quando ocorrerem redirecionamentos.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Funil de Quiz */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-royal-gold" />
            <h2 className="text-xl font-bold text-white">Funil de Quiz - Taxa de Abandono</h2>
          </div>
          
          <div className="space-y-4">
            {mockQuizFunnel.map((step, index) => {
              const maxUsers = Math.max(...mockQuizFunnel.map(s => s.users))
              const widthPercentage = (step.users / maxUsers) * 100
              
              return (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{step.step}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-royal-gold font-semibold">{step.users.toLocaleString()}</span>
                      {step.dropoffRate > 0 && (
                        <span className="text-red-400 text-sm font-medium">-{step.dropoffRate}%</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-royal-gold to-royal-gold/80 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Métricas de Crescimento */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-royal-gold" />
            <h2 className="text-xl font-bold text-white">Métricas de Crescimento</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">2,450</div>
              <div className="text-sage-green/70">Total de Usuários</div>
              <div className="text-green-400 text-sm mt-1">+12% este mês</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">78.5%</div>
              <div className="text-sage-green/70">Taxa de Retenção</div>
              <div className="text-green-400 text-sm mt-1">+5.2% vs mês anterior</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">12:34</div>
              <div className="text-sage-green/70">Duração Média da Sessão</div>
              <div className="text-green-400 text-sm mt-1">+2:15 vs mês anterior</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AnalyticsPage