import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Heart, 
  Zap, 
  Target, 
  Trophy, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Lightbulb,
  ArrowRight
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { geminiService } from '../../services/geminiService'

interface PillarInsight {
  pillar: string
  status: 'excellent' | 'good' | 'needs_attention' | 'critical'
  score: number
  insight: string
  suggestion: string
  trend: 'up' | 'down' | 'stable'
}

interface FivePsPanelProps {
  className?: string
}

const FivePsPanel: React.FC<FivePsPanelProps> = ({ className = '' }) => {
  const { user, dailyProtocol, streak, xp } = useAppStore()
  const [insights, setInsights] = useState<PillarInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null)
  const [overallAlignment, setOverallAlignment] = useState(0)

  const pillarConfig = {
    pensamento: {
      icon: Brain,
      name: 'Pensamento',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    sentimento: {
      icon: Heart,
      name: 'Sentimento',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30'
    },
    emocao: {
      icon: Zap,
      name: 'Emoção',
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    },
    acao: {
      icon: Target,
      name: 'Ação',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    resultado: {
      icon: Trophy,
      name: 'Resultado',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    }
  }

  const getStatusIcon = (status: PillarInsight['status']) => {
    switch (status) {
      case 'excellent': return CheckCircle2
      case 'good': return CheckCircle2
      case 'needs_attention': return AlertCircle
      case 'critical': return AlertCircle
    }
  }

  const getStatusColor = (status: PillarInsight['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-400'
      case 'good': return 'text-blue-400'
      case 'needs_attention': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
    }
  }

  const getTrendIcon = (trend: PillarInsight['trend']) => {
    return TrendingUp
  }

  const getTrendColor = (trend: PillarInsight['trend']) => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      case 'stable': return 'text-yellow-400'
    }
  }

  useEffect(() => {
    const analyzeProgress = async () => {
      setIsLoading(true)
      
      try {
        const analysis = await geminiService.analyze5PsPillars({
          p1_thoughts: dailyProtocol.p1_affirmations || [],
          p2_feelings: dailyProtocol.p2_feeling ? [dailyProtocol.p2_feeling] : [],
          p3_emotions: dailyProtocol.p3_peak_state_completed ? ['peak_state_activated'] : [],
          p4_actions: dailyProtocol.p4_completed ? ['daily_action_completed'] : [],
          p5_results: [
            ...(dailyProtocol.p5_victory ? [dailyProtocol.p5_victory] : []),
            ...(dailyProtocol.p5_gratitude ? [dailyProtocol.p5_gratitude] : [])
          ],
          recentActivity: { streak, xp, lastUpdate: new Date().toISOString() }
        })
        
        // Converter insights de string[] para PillarInsight[]
        const convertedInsights: PillarInsight[] = analysis.insights.map((insight, index) => ({
          pillar: `P${index + 1}`,
          status: 'good' as const,
          score: 75,
          insight: insight,
          suggestion: 'Continue mantendo o foco neste pilar.',
          trend: 'stable' as const
        }))
        setInsights(convertedInsights)
        // Calcular média do alinhamento dos pilares
        const alignmentValues = Object.values(analysis.alignment)
        const averageAlignment = alignmentValues.length > 0 
          ? alignmentValues.reduce((sum, val) => sum + val, 0) / alignmentValues.length
          : 0
        setOverallAlignment(averageAlignment)
      } catch (error) {
        console.error('Erro ao analisar pilares:', error)
        // Fallback com análise básica
        const fallbackInsights: PillarInsight[] = [
          {
            pillar: 'pensamento',
            status: dailyProtocol.p1_affirmations.length > 0 ? 'good' : 'needs_attention',
            score: dailyProtocol.p1_affirmations.length * 20,
            insight: dailyProtocol.p1_affirmations.length > 0 
              ? 'Suas afirmações estão fortalecendo sua mentalidade positiva!' 
              : 'Que tal começar o dia com algumas afirmações poderosas?',
            suggestion: 'Continue praticando afirmações diárias para reprogramar sua mente.',
            trend: 'stable'
          },
          {
            pillar: 'sentimento',
            status: dailyProtocol.p2_feeling ? 'good' : 'needs_attention',
            score: dailyProtocol.p2_feeling ? 80 : 20,
            insight: dailyProtocol.p2_feeling 
              ? 'Você está conectado com seus sentimentos hoje.' 
              : 'A consciência emocional é o primeiro passo para o crescimento.',
            suggestion: 'Registre seus sentimentos para desenvolver inteligência emocional.',
            trend: 'stable'
          },
          {
            pillar: 'emocao',
            status: dailyProtocol.p3_peak_state_completed ? 'excellent' : 'needs_attention',
            score: dailyProtocol.p3_peak_state_completed ? 100 : 30,
            insight: dailyProtocol.p3_peak_state_completed 
              ? 'Seu estado peak está ativado! Continue assim.' 
              : 'Ative seu estado peak para maximizar sua energia.',
            suggestion: 'Use técnicas de respiração e movimento para elevar sua energia.',
            trend: 'stable'
          },
          {
            pillar: 'acao',
            status: dailyProtocol.p4_completed ? 'excellent' : 'critical',
            score: dailyProtocol.p4_completed ? 100 : 10,
            insight: dailyProtocol.p4_completed 
              ? 'Ação executada! Você está transformando intenção em realidade.' 
              : 'A ação é onde a magia acontece. Que tal dar o primeiro passo?',
            suggestion: 'Defina uma ação mínima viável e execute hoje mesmo.',
            trend: 'stable'
          },
          {
            pillar: 'resultado',
            status: (dailyProtocol.p5_victory && dailyProtocol.p5_gratitude) ? 'good' : 'needs_attention',
            score: (dailyProtocol.p5_victory && dailyProtocol.p5_gratitude) ? 90 : 40,
            insight: (dailyProtocol.p5_victory && dailyProtocol.p5_gratitude) 
              ? 'Você está celebrando suas conquistas e praticando gratidão!' 
              : 'Reconhecer suas vitórias fortalece sua confiança.',
            suggestion: 'Reflita sobre suas conquistas e pratique gratidão diariamente.',
            trend: 'stable'
          }
        ]
        
        setInsights(fallbackInsights)
        const avgScore = fallbackInsights.reduce((sum, insight) => sum + insight.score, 0) / fallbackInsights.length
        setOverallAlignment(Math.round(avgScore))
      } finally {
        setIsLoading(false)
      }
    }

    analyzeProgress()
  }, [dailyProtocol, streak, xp, user])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-royal-gold/20 rounded-xl">
            <Brain className="w-6 h-6 text-royal-gold" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-white">Painel 5Ps</h2>
            <p className="text-pearl-white/70 text-sm">Análise inteligente dos seus pilares</p>
          </div>
        </div>
        
        {/* Overall Alignment */}
        <div className="text-center">
          <div className="text-2xl font-bold text-royal-gold">{overallAlignment}%</div>
          <div className="text-xs text-pearl-white/70">Alinhamento</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-royal-gold animate-spin" />
          <span className="ml-3 text-pearl-white/80">Analisando seus pilares...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {(insights || []).map((insight, index) => {
            const config = pillarConfig[insight.pillar as keyof typeof pillarConfig] || pillarConfig.pensamento
            const StatusIcon = getStatusIcon(insight.status)
            const TrendIcon = getTrendIcon(insight.trend)
            const isSelected = selectedPillar === insight.pillar
            
            return (
              <motion.div
                key={insight.pillar}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? `${config.bgColor} ${config.borderColor} border-2` 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => setSelectedPillar(isSelected ? null : insight.pillar)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${config.color}`}>
                        <config.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{config.name}</h3>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(insight.status)}`} />
                          <span className="text-sm text-pearl-white/70">
                            {insight.score}% completo
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TrendIcon className={`w-4 h-4 ${getTrendColor(insight.trend)}`} />
                      <ArrowRight className={`w-4 h-4 text-pearl-white/50 transition-transform ${
                        isSelected ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full bg-gradient-to-r ${config.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${insight.score}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    />
                  </div>
                </div>
                
                {/* Expanded content */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-royal-gold mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-white mb-1">Insight</p>
                            <p className="text-sm text-pearl-white/80">{insight.insight}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-royal-gold mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-white mb-1">Sugestão</p>
                            <p className="text-sm text-pearl-white/80">{insight.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default FivePsPanel