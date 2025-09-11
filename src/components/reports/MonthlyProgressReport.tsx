import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, TrendingUp, Award, Target, Brain, Heart, Zap, Eye, BarChart3, Download, Share2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { geminiService } from '../../services/geminiService'
import { getCapitalizedFirstName } from '../../utils/nameUtils'

interface MonthlyReport {
  month: string
  year: number
  overallProgress: {
    alignmentLevel: number
    previousLevel: number
    improvement: number
  }
  pillarProgress: {
    pensamento: { score: number; improvement: number; insights: string[] }
    sentimento: { score: number; improvement: number; insights: string[] }
    emocao: { score: number; improvement: number; insights: string[] }
    acao: { score: number; improvement: number; insights: string[] }
    resultado: { score: number; improvement: number; insights: string[] }
  }
  achievements: {
    title: string
    description: string
    date: string
    impact: 'high' | 'medium' | 'low'
  }[]
  newPatterns: {
    pattern: string
    strength: number
    description: string
  }[]
  challenges: {
    challenge: string
    resolution: string
    learnings: string[]
  }[]
  recommendations: {
    focus: string
    actions: string[]
    expectedOutcome: string
  }[]
  stats: {
    totalDays: number
    activeDays: number
    streakRecord: number
    xpGained: number
    protocolsCompleted: number
  }
}

const MonthlyProgressReport: React.FC = () => {
  const { user, streak, xp, level } = useAppStore()
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'pillars' | 'achievements' | 'patterns'>('overview')

  const firstName = getCapitalizedFirstName(user?.name || 'Transformador')
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  useEffect(() => {
    generateMonthlyReport()
  }, [currentMonth, currentYear])

  const generateMonthlyReport = async () => {
    setIsLoading(true)
    setIsGenerating(true)
    
    try {
      // Simular dados do usuário para o mês
      const mockUserData = {
        userId: user?.id || 'user-1',
        month: currentMonth,
        year: currentYear,
        dailyProtocols: generateMockDailyData(),
        achievements: generateMockAchievements(),
        streakData: { current: streak, longest: streak + 10 },
        xpData: { current: xp, gained: 1500 },
        level: level
      }

      // Em produção, isso viria do Gemini.ai
      const aiAnalysis = await generateAIAnalysis(mockUserData)
      
      const monthlyReport: MonthlyReport = {
        month: monthNames[currentMonth],
        year: currentYear,
        overallProgress: {
          alignmentLevel: 78,
          previousLevel: 65,
          improvement: 13
        },
        pillarProgress: {
          pensamento: {
            score: 82,
            improvement: 15,
            insights: [
              'Desenvolveu maior clareza mental através da meditação diária',
              'Reduziu pensamentos limitantes em 40%',
              'Implementou técnicas de visualização com sucesso'
            ]
          },
          sentimento: {
            score: 75,
            improvement: 8,
            insights: [
              'Melhorou a expressão emocional em relacionamentos',
              'Desenvolveu maior empatia e compaixão',
              'Criou rituais de gratidão consistentes'
            ]
          },
          emocao: {
            score: 70,
            improvement: 12,
            insights: [
              'Aprendeu a regular emoções intensas',
              'Desenvolveu inteligência emocional',
              'Transformou raiva em energia produtiva'
            ]
          },
          acao: {
            score: 85,
            improvement: 20,
            insights: [
              'Implementou sistema de produtividade eficaz',
              'Criou hábitos de ação consistente',
              'Superou procrastinação em projetos importantes'
            ]
          },
          resultado: {
            score: 73,
            improvement: 10,
            insights: [
              'Alcançou 3 objetivos principais do mês',
              'Melhorou qualidade dos resultados obtidos',
              'Desenvolveu mentalidade de crescimento'
            ]
          }
        },
        achievements: [
          {
            title: 'Streak de 30 Dias',
            description: 'Manteve consistência por um mês completo',
            date: '2024-01-30',
            impact: 'high'
          },
          {
            title: 'Mestre da Ação',
            description: 'Completou todos os protocolos de ação',
            date: '2024-01-25',
            impact: 'high'
          },
          {
            title: 'Transformação Mental',
            description: 'Atingiu nível avançado em pensamento',
            date: '2024-01-20',
            impact: 'medium'
          }
        ],
        newPatterns: [
          {
            pattern: 'Meditação Matinal',
            strength: 90,
            description: 'Estabeleceu rotina sólida de meditação às 6h'
          },
          {
            pattern: 'Exercício Regular',
            strength: 75,
            description: 'Criou hábito de exercitar-se 5x por semana'
          },
          {
            pattern: 'Journaling Noturno',
            strength: 85,
            description: 'Desenvolveu prática de reflexão diária'
          }
        ],
        challenges: [
          {
            challenge: 'Gerenciamento de Estresse',
            resolution: 'Implementou técnicas de respiração e pausas regulares',
            learnings: [
              'Estresse é sinal para pausar e recalibrar',
              'Respiração consciente transforma o estado interno',
              'Pequenas pausas previnem grandes colapsos'
            ]
          }
        ],
        recommendations: [
          {
            focus: 'Inteligência Emocional',
            actions: [
              'Praticar reconhecimento emocional 3x ao dia',
              'Implementar técnica de pausa antes de reagir',
              'Desenvolver vocabulário emocional mais rico'
            ],
            expectedOutcome: 'Maior equilíbrio emocional e relacionamentos mais profundos'
          },
          {
            focus: 'Resultados Tangíveis',
            actions: [
              'Definir métricas claras para objetivos',
              'Criar sistema de acompanhamento semanal',
              'Celebrar pequenas vitórias diariamente'
            ],
            expectedOutcome: 'Aceleração na conquista de objetivos importantes'
          }
        ],
        stats: {
          totalDays: 31,
          activeDays: 28,
          streakRecord: 30,
          xpGained: 1500,
          protocolsCompleted: 84
        }
      }

      setReport(monthlyReport)
    } catch (error) {
      console.error('Erro ao gerar relatório mensal:', error)
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
    }
  }

  const generateMockDailyData = () => {
    // Simular dados diários do mês
    return Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      completed: Math.random() > 0.1, // 90% de dias ativos
      protocols: {
        pensamento: Math.random() > 0.2,
        sentimento: Math.random() > 0.3,
        emocao: Math.random() > 0.25,
        acao: Math.random() > 0.15,
        resultado: Math.random() > 0.35
      }
    }))
  }

  const generateMockAchievements = () => {
    return [
      { type: 'streak', value: 30, date: '2024-01-30' },
      { type: 'level_up', value: level, date: '2024-01-25' },
      { type: 'protocol_master', pillar: 'acao', date: '2024-01-20' }
    ]
  }

  const generateAIAnalysis = async (userData: any) => {
    // Em produção, chamaria o Gemini.ai para análise profunda
    return {
      insights: 'Análise gerada por IA',
      patterns: 'Padrões identificados',
      recommendations: 'Recomendações personalizadas'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'pensamento': return Brain
      case 'sentimento': return Heart
      case 'emocao': return Zap
      case 'acao': return Target
      case 'resultado': return Eye
      default: return BarChart3
    }
  }

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'pensamento': return 'from-blue-500 to-indigo-600'
      case 'sentimento': return 'from-pink-500 to-rose-600'
      case 'emocao': return 'from-yellow-500 to-orange-600'
      case 'acao': return 'from-green-500 to-emerald-600'
      case 'resultado': return 'from-purple-500 to-violet-600'
      default: return 'from-royal-gold to-amber-500'
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Nível de Alinhamento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-royal-gold" />
          Nível de Alinhamento
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-4xl font-bold text-royal-gold mb-1">
              {report?.overallProgress.alignmentLevel}%
            </div>
            <div className="flex items-center text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-semibold">
                +{report?.overallProgress.improvement}% este mês
              </span>
            </div>
          </div>
          
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-r from-royal-gold to-amber-500 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <Sparkles className="w-8 h-8 text-deep-forest" />
          </motion.div>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-3">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-royal-gold to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${report?.overallProgress.alignmentLevel}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Estatísticas do Mês */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Dias Ativos', value: report?.stats.activeDays, total: report?.stats.totalDays, icon: Calendar },
          { label: 'Streak Recorde', value: report?.stats.streakRecord, icon: TrendingUp },
          { label: 'XP Ganho', value: report?.stats.xpGained, icon: Sparkles },
          { label: 'Protocolos', value: report?.stats.protocolsCompleted, icon: Target },
          { label: 'Conquistas', value: report?.achievements.length, icon: Award }
        ].map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center"
            >
              <IconComponent className="w-6 h-6 text-royal-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}{stat.total && `/${stat.total}`}
              </div>
              <div className="text-xs text-pearl-white/70">{stat.label}</div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )

  const renderPillars = () => (
    <div className="space-y-4">
      {report && Object.entries(report.pillarProgress).map(([pillar, data], index) => {
        const PillarIcon = getPillarIcon(pillar)
        const pillarColor = getPillarColor(pillar)
        
        return (
          <motion.div
            key={pillar}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${pillarColor} mr-4`}>
                  <PillarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white capitalize">{pillar}</h4>
                  <div className="flex items-center text-green-400">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+{data.improvement}% este mês</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-royal-gold">{data.score}%</div>
              </div>
            </div>
            
            <div className="w-full bg-white/10 rounded-full h-2 mb-4">
              <motion.div
                className={`h-2 rounded-full bg-gradient-to-r ${pillarColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${data.score}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            </div>
            
            <div className="space-y-2">
              <h5 className="font-semibold text-pearl-white mb-2">Principais Insights:</h5>
              {data.insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index * 0.1) + (i * 0.1) }}
                  className="flex items-start"
                >
                  <div className="w-2 h-2 bg-royal-gold rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p className="text-pearl-white/80 text-sm">{insight}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )

  const renderAchievements = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {report?.achievements.map((achievement, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`p-6 rounded-2xl border-2 ${
            achievement.impact === 'high' ? 'bg-gradient-to-br from-royal-gold/20 to-amber-500/20 border-royal-gold/50' :
            achievement.impact === 'medium' ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/50' :
            'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50'
          }`}
        >
          <div className="flex items-center mb-3">
            <Award className={`w-6 h-6 mr-3 ${
              achievement.impact === 'high' ? 'text-royal-gold' :
              achievement.impact === 'medium' ? 'text-blue-400' :
              'text-green-400'
            }`} />
            <h4 className="font-bold text-white">{achievement.title}</h4>
          </div>
          <p className="text-pearl-white/80 text-sm mb-2">{achievement.description}</p>
          <p className="text-pearl-white/60 text-xs">{achievement.date}</p>
        </motion.div>
      ))}
    </div>
  )

  const renderPatterns = () => (
    <div className="space-y-6">
      {/* Novos Padrões */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Novos Padrões Formados</h3>
        <div className="space-y-4">
          {report?.newPatterns.map((pattern, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{pattern.pattern}</h4>
                <span className="text-royal-gold font-bold">{pattern.strength}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-royal-gold to-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${pattern.strength}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              </div>
              <p className="text-pearl-white/70 text-sm">{pattern.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recomendações */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Recomendações para o Próximo Mês</h3>
        <div className="space-y-4">
          {report?.recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
            >
              <h4 className="font-bold text-royal-gold mb-3">{rec.focus}</h4>
              <div className="mb-4">
                <h5 className="font-semibold text-white mb-2">Ações Recomendadas:</h5>
                <ul className="space-y-1">
                  {rec.actions.map((action, i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-2 h-2 bg-royal-gold rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-pearl-white/80 text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-royal-gold/10 rounded-lg p-3">
                <h5 className="font-semibold text-royal-gold mb-1">Resultado Esperado:</h5>
                <p className="text-pearl-white/80 text-sm">{rec.expectedOutcome}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-royal-gold border-t-transparent rounded-full"
        />
        {isGenerating && (
          <p className="ml-4 text-pearl-white/80">Gerando relatório com IA...</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Sua Transformação em 30 Dias
          </h2>
          <p className="text-pearl-white/80">
            Relatório detalhado do seu progresso em {report?.month} {report?.year}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white/10 rounded-lg">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-pearl-white hover:text-royal-gold transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-white font-semibold">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-pearl-white hover:text-royal-gold transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button className="p-2 bg-white/10 border border-white/20 rounded-lg text-pearl-white hover:text-royal-gold transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white/10 border border-white/20 rounded-lg text-pearl-white hover:text-royal-gold transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
          {[
            { key: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { key: 'pillars', label: '5Ps', icon: Target },
            { key: 'achievements', label: 'Conquistas', icon: Award },
            { key: 'patterns', label: 'Padrões', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab(key as any)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                selectedTab === key
                  ? 'bg-gradient-to-r from-royal-gold to-amber-500 text-deep-forest'
                  : 'text-pearl-white hover:text-royal-gold'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'pillars' && renderPillars()}
          {selectedTab === 'achievements' && renderAchievements()}
          {selectedTab === 'patterns' && renderPatterns()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default MonthlyProgressReport