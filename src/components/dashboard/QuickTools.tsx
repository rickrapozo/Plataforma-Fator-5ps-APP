import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  BookOpen, 
  Brain, 
  Heart, 
  Target, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Headphones, 
  MessageCircle,
  TrendingUp,
  Calendar,
  Play,
  Pause,
  Users
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { useNavigate } from 'react-router-dom'

interface QuickTool {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  action: () => void
  estimatedTime?: string
  category: 'mental' | 'emotional' | 'action' | 'reflection'
}

interface QuickToolsProps {
  className?: string
}

const QuickTools: React.FC<QuickToolsProps> = ({ className = '' }) => {
  const { updateDailyProtocol } = useAppStore()
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [isResetInProgress, setIsResetInProgress] = useState(false)

  const handleResetMental = async () => {
    setIsResetInProgress(true)
    setActiveModal('reset-mental')
    
    // Simulate reset process
    setTimeout(() => {
      setIsResetInProgress(false)
      setActiveModal(null)
      // Could trigger a state update or notification here
    }, 3000)
  }

  const handleOpenDiary = () => {
    setActiveModal('diary-5ps')
  }

  const handleQuickMeditation = () => {
    setActiveModal('quick-meditation')
  }

  const handleEmotionalCheck = () => {
    setActiveModal('emotional-check')
  }

  const handleGoalFocus = () => {
    setActiveModal('goal-focus')
  }

  const handleProgressReview = () => {
    setActiveModal('progress-review')
  }

  const handleCommunity = () => {
    navigate('/community')
  }

  const tools: QuickTool[] = [
    {
      id: 'reset-mental',
      title: 'Reset Mental',
      description: 'Limpe sua mente e redefina seu foco em 3 minutos',
      icon: RefreshCw,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      action: handleResetMental,
      estimatedTime: '3 min',
      category: 'mental'
    },
    {
      id: 'diary-5ps',
      title: 'Diário 5Ps',
      description: 'Registre rapidamente seus insights dos 5 pilares',
      icon: BookOpen,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      action: handleOpenDiary,
      estimatedTime: '5 min',
      category: 'reflection'
    },
    {
      id: 'quick-meditation',
      title: 'Meditação Express',
      description: 'Sessão guiada de 2 minutos para centrar-se',
      icon: Brain,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      action: handleQuickMeditation,
      estimatedTime: '2 min',
      category: 'mental'
    },
    {
      id: 'emotional-check',
      title: 'Check Emocional',
      description: 'Avaliação rápida do seu estado emocional atual',
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      action: handleEmotionalCheck,
      estimatedTime: '1 min',
      category: 'emotional'
    },
    {
      id: 'goal-focus',
      title: 'Foco no Objetivo',
      description: 'Relembre e visualize seus objetivos principais',
      icon: Target,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      action: handleGoalFocus,
      estimatedTime: '2 min',
      category: 'action'
    },
    {
      id: 'progress-review',
      title: 'Revisão Rápida',
      description: 'Veja seu progresso dos últimos 7 dias',
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      action: handleProgressReview,
      estimatedTime: '1 min',
      category: 'reflection'
    },
    {
      id: 'community',
      title: 'Comunidade',
      description: 'Participe de desafios em grupo e conecte-se',
      icon: Users,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      action: handleCommunity,
      estimatedTime: '5 min',
      category: 'action'
    }
  ]

  const categoryColors = {
    mental: 'border-blue-500/30',
    emotional: 'border-pink-500/30',
    action: 'border-green-500/30',
    reflection: 'border-purple-500/30'
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-royal-gold/20 rounded-xl">
            <Zap className="w-6 h-6 text-royal-gold" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-white">Ferramentas Rápidas</h2>
            <p className="text-pearl-white/70 text-sm">Acesso instantâneo às suas práticas essenciais</p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => {
            const ToolIcon = tool.icon
            
            return (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={tool.action}
                className={`relative p-4 rounded-2xl border transition-all duration-300 text-left group hover:shadow-lg ${
                  tool.bgColor
                } ${categoryColors[tool.category]} hover:border-white/20`}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  {/* Icon and time */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${tool.bgColor}`}>
                      <ToolIcon className={`w-5 h-5 ${tool.color}`} />
                    </div>
                    {tool.estimatedTime && (
                      <div className="flex items-center gap-1 text-xs text-pearl-white/60">
                        <Clock className="w-3 h-3" />
                        {tool.estimatedTime}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-semibold text-white mb-1 group-hover:text-royal-gold transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-pearl-white/80 leading-relaxed">
                    {tool.description}
                  </p>
                  
                  {/* Category indicator */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tool.color.replace('text-', 'bg-')}`} />
                    <span className="text-xs text-pearl-white/60 capitalize">
                      {tool.category === 'mental' ? 'Mental' : 
                       tool.category === 'emotional' ? 'Emocional' :
                       tool.category === 'action' ? 'Ação' : 'Reflexão'}
                    </span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isResetInProgress && setActiveModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-deep-navy to-royal-purple rounded-3xl border border-white/20 p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {activeModal === 'reset-mental' && (
                <div className="text-center">
                  <div className="mb-6">
                    <motion.div
                      animate={isResetInProgress ? { rotate: 360 } : {}}
                      transition={{ duration: 2, repeat: isResetInProgress ? Infinity : 0, ease: "linear" }}
                      className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center"
                    >
                      <RefreshCw className={`w-8 h-8 text-blue-400 ${isResetInProgress ? 'animate-spin' : ''}`} />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">Reset Mental</h3>
                    <p className="text-pearl-white/80">
                      {isResetInProgress 
                        ? 'Limpando sua mente e reorganizando seus pensamentos...'
                        : 'Prepare-se para limpar sua mente e recalibrar seu foco.'}
                    </p>
                  </div>
                  
                  {isResetInProgress ? (
                    <div className="space-y-4">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 3 }}
                        />
                      </div>
                      <p className="text-sm text-pearl-white/70">Respirando... Centralizando... Focalizando...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-pearl-white/70 mb-4">
                        • Respire profundamente 3 vezes<br/>
                        • Solte as tensões do corpo<br/>
                        • Foque no momento presente
                      </p>
                      <button
                        onClick={handleResetMental}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all"
                      >
                        Iniciar Reset
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {activeModal === 'diary-5ps' && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Diário 5Ps</h3>
                  <p className="text-pearl-white/80 mb-6">
                    Registre rapidamente seus insights sobre cada pilar.
                  </p>
                  
                  <div className="space-y-3 text-left mb-6">
                    {['Pensamento', 'Sentimento', 'Emoção', 'Ação', 'Resultado'].map((pilar, idx) => (
                      <div key={pilar} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-purple-400 font-bold text-sm">P{idx + 1}</span>
                        </div>
                        <span className="text-white font-medium">{pilar}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all"
                  >
                    Abrir Diário Completo
                  </button>
                </div>
              )}
              
              {activeModal === 'quick-meditation' && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-indigo-500/20 rounded-full flex items-center justify-center">
                    <Brain className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Meditação Express</h3>
                  <p className="text-pearl-white/80 mb-6">
                    2 minutos de meditação guiada para centrar sua mente.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <button className="p-3 bg-indigo-500/20 rounded-full hover:bg-indigo-500/30 transition-colors">
                        <Play className="w-6 h-6 text-indigo-400" />
                      </button>
                      <span className="text-white font-medium">Iniciar Sessão</span>
                    </div>
                    
                    <p className="text-sm text-pearl-white/70">
                      🎧 Use fones de ouvido para melhor experiência
                    </p>
                  </div>
                </div>
              )}
              
              {(activeModal === 'emotional-check' || activeModal === 'goal-focus' || activeModal === 'progress-review') && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-royal-gold/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-royal-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Em Breve</h3>
                  <p className="text-pearl-white/80 mb-6">
                    Esta ferramenta estará disponível em breve com funcionalidades avançadas.
                  </p>
                  
                  <button
                    onClick={() => setActiveModal(null)}
                    className="bg-royal-gold text-dark-navy font-semibold py-2 px-6 rounded-xl hover:scale-105 transition-all"
                  >
                    Entendi
                  </button>
                </div>
              )}
              
              {!isResetInProgress && (
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 p-2 text-pearl-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default QuickTools