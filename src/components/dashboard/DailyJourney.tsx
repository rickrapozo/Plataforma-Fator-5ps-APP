import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ArrowRight,
  Loader2,
  Brain,
  Heart,
  Zap,
  Target,
  Trophy,
  Play,
  Pause
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
// Removed geminiService import - using local analysis instead

interface JourneyStep {
  id: string
  pillar: 'pensamento' | 'sentimento' | 'emocao' | 'acao' | 'resultado'
  title: string
  description: string
  estimatedTime: number
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  action: string
  benefits: string[]
}

interface DailyJourneyProps {
  className?: string
}

const DailyJourney: React.FC<DailyJourneyProps> = ({ className = '' }) => {
  const { user, dailyProtocol, streak, xp, updateDailyProtocol } = useAppStore()
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const pillarConfig = {
    pensamento: {
      icon: Brain,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400'
    },
    sentimento: {
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-500/10',
      textColor: 'text-pink-400'
    },
    emocao: {
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400'
    },
    acao: {
      icon: Target,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400'
    },
    resultado: {
      icon: Trophy,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400'
    }
  }

  const getPriorityColor = (priority: JourneyStep['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
    }
  }

  const getPriorityLabel = (priority: JourneyStep['priority']) => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
    
    // Update the journey steps
    setJourneySteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ))
    
    // Award XP for completing step
    // This would typically update the store
  }

  const handleStepStart = (stepId: string) => {
    setActiveStep(activeStep === stepId ? null : stepId)
  }

  useEffect(() => {
    const generateJourney = async () => {
      setIsLoading(true)
      
      try {
        // Jornada diária pré-definida baseada nos 5 Pilares
        const predefinedSteps = [
          {
            title: 'Alinhamento Mental',
            description: 'Pratique afirmações positivas para alinhar seus pensamentos',
            estimatedTime: 5,
            priority: 'high' as const,
            action: 'Repita 3 afirmações positivas sobre seus objetivos',
            benefits: ['Clareza mental', 'Foco direcionado']
          },
          {
            title: 'Conexão Emocional',
            description: 'Identifique e acolha seus sentimentos do momento',
            estimatedTime: 5,
            priority: 'high' as const,
            action: 'Faça uma pausa para reconhecer como você se sente',
            benefits: ['Autoconhecimento', 'Equilíbrio emocional']
          },
          {
            title: 'Estado de Pico',
            description: 'Ative sua energia vital através de respiração consciente',
            estimatedTime: 10,
            priority: 'medium' as const,
            action: 'Pratique 5 respirações profundas e conscientes',
            benefits: ['Energia renovada', 'Presença no momento']
          },
          {
            title: 'Ação Direcionada',
            description: 'Execute uma ação concreta em direção aos seus objetivos',
            estimatedTime: 15,
            priority: 'high' as const,
            action: 'Complete uma tarefa importante do seu dia',
            benefits: ['Progresso tangível', 'Senso de realização']
          },
          {
            title: 'Celebração e Gratidão',
            description: 'Reconheça suas conquistas e pratique gratidão',
            estimatedTime: 5,
            priority: 'medium' as const,
            action: 'Liste 3 coisas pelas quais você é grato hoje',
            benefits: ['Positividade', 'Reconhecimento do progresso']
          }
        ]
        
        // Converter para o formato JourneyStep
        const convertedSteps: JourneyStep[] = predefinedSteps.map((step, index) => ({
          id: `step-${index}`,
          pillar: index % 5 === 0 ? 'pensamento' : index % 5 === 1 ? 'sentimento' : index % 5 === 2 ? 'emocao' : index % 5 === 3 ? 'acao' : 'resultado',
          title: step.title,
          description: step.description,
          estimatedTime: step.estimatedTime,
          priority: step.priority,
          completed: false,
          action: step.action,
          benefits: step.benefits
        }))
        
        setJourneySteps(convertedSteps)
      } catch (error) {
        console.error('Erro ao gerar jornada diária:', error)
        
        // Fallback journey based on current progress
        const fallbackSteps: JourneyStep[] = []
        
        if (dailyProtocol.p1_affirmations.length === 0) {
          fallbackSteps.push({
            id: 'affirmations',
            pillar: 'pensamento',
            title: 'Afirmações Matinais',
            description: 'Comece o dia reprogramando sua mente com afirmações poderosas que alinham seus pensamentos com seus objetivos.',
            estimatedTime: 5,
            priority: 'high',
            completed: false,
            action: 'Escolha 3 afirmações que ressoam com seus objetivos hoje',
            benefits: ['Melhora o foco mental', 'Aumenta a confiança', 'Programa a mente para o sucesso']
          })
        }
        
        if (!dailyProtocol.p2_feeling) {
          fallbackSteps.push({
            id: 'feeling-check',
            pillar: 'sentimento',
            title: 'Check-in Emocional',
            description: 'Conecte-se com seus sentimentos atuais para desenvolver inteligência emocional e autoconsciência.',
            estimatedTime: 3,
            priority: 'high',
            completed: false,
            action: 'Registre como você está se sentindo agora',
            benefits: ['Desenvolve autoconsciência', 'Melhora regulação emocional', 'Facilita tomada de decisões']
          })
        }
        
        if (!dailyProtocol.p3_peak_state_completed) {
          fallbackSteps.push({
            id: 'peak-state',
            pillar: 'emocao',
            title: 'Ativação do Estado Peak',
            description: 'Eleve sua energia e entre no estado de alta performance através de técnicas de respiração e movimento.',
            estimatedTime: 10,
            priority: 'medium',
            completed: false,
            action: 'Execute a sequência de ativação do estado peak',
            benefits: ['Aumenta energia e foco', 'Melhora performance', 'Reduz estresse']
          })
        }
        
        if (!dailyProtocol.p4_completed) {
          fallbackSteps.push({
            id: 'minimal-action',
            pillar: 'acao',
            title: 'Ação Mínima Viável',
            description: 'Defina e execute uma ação concreta que te aproxima dos seus objetivos, mesmo que seja pequena.',
            estimatedTime: 15,
            priority: 'high',
            completed: false,
            action: 'Identifique e execute uma ação específica hoje',
            benefits: ['Gera momentum', 'Constrói disciplina', 'Produz resultados tangíveis']
          })
        }
        
        if (!dailyProtocol.p5_victory || !dailyProtocol.p5_gratitude) {
          fallbackSteps.push({
            id: 'reflection',
            pillar: 'resultado',
            title: 'Reflexão e Gratidão',
            description: 'Celebre suas conquistas do dia e pratique gratidão para fortalecer padrões mentais positivos.',
            estimatedTime: 8,
            priority: 'medium',
            completed: false,
            action: 'Registre suas vitórias e pratique gratidão',
            benefits: ['Fortalece autoestima', 'Desenvolve mentalidade positiva', 'Melhora bem-estar']
          })
        }
        
        // Add motivational steps if all basics are done
        if (fallbackSteps.length === 0) {
          fallbackSteps.push({
            id: 'advanced-practice',
            pillar: 'acao',
            title: 'Prática Avançada',
            description: 'Você está indo muito bem! Que tal expandir sua prática com um desafio mais avançado?',
            estimatedTime: 20,
            priority: 'low',
            completed: false,
            action: 'Escolha uma área para aprofundar sua prática',
            benefits: ['Acelera crescimento', 'Desenvolve maestria', 'Mantém engajamento']
          })
        }
        
        setJourneySteps(fallbackSteps)
      } finally {
        setIsLoading(false)
      }
    }

    generateJourney()
  }, [dailyProtocol, streak, xp, user])

  const totalSteps = journeySteps.length
  const completedCount = journeySteps.filter(step => step.completed || completedSteps.has(step.id)).length
  const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0

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
            <MapPin className="w-6 h-6 text-royal-gold" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-white">Sua Jornada de Hoje</h2>
            <p className="text-pearl-white/70 text-sm">Curadoria inteligente personalizada</p>
          </div>
        </div>
        
        {/* Progress */}
        <div className="text-center">
          <div className="text-2xl font-bold text-royal-gold">{Math.round(progressPercentage)}%</div>
          <div className="text-xs text-pearl-white/70">{completedCount}/{totalSteps} passos</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full bg-white/10 rounded-full h-3">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-royal-gold to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-royal-gold animate-spin" />
          <span className="ml-3 text-pearl-white/80">Criando sua jornada personalizada...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {journeySteps.map((step, index) => {
            const config = pillarConfig[step.pillar] || pillarConfig.pensamento // fallback para pensamento
            const isCompleted = step.completed || completedSteps.has(step.id)
            const isActive = activeStep === step.id
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : isActive 
                    ? `${config.bgColor} border-white/20` 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Step indicator */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => !isCompleted && handleStepComplete(step.id)}
                          className={`p-2 rounded-xl transition-all ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : `bg-gradient-to-r ${config.color} text-white hover:scale-105`
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <config.icon className="w-5 h-5" />
                          )}
                        </button>
                        
                        {index < journeySteps.length - 1 && (
                          <div className={`w-0.5 h-8 mt-2 ${
                            isCompleted ? 'bg-green-500/50' : 'bg-white/20'
                          }`} />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${
                            isCompleted ? 'text-green-400 line-through' : 'text-white'
                          }`}>
                            {step.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            getPriorityColor(step.priority)
                          } bg-white/10`}>
                            {getPriorityLabel(step.priority)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-pearl-white/80 mb-2">
                          {step.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-pearl-white/60">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(step.estimatedTime)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className={`w-3 h-3 ${config.textColor}`} />
                            {step.pillar ? step.pillar.charAt(0).toUpperCase() + step.pillar.slice(1) : 'Pilar'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action button */}
                    {!isCompleted && (
                      <button
                        onClick={() => handleStepStart(step.id)}
                        className="ml-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                      >
                        {isActive ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white" />
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Expanded content */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-white/10"
                      >
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-white mb-1">Ação:</p>
                            <p className="text-sm text-pearl-white/80">{step.action}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-white mb-2">Benefícios:</p>
                            <div className="space-y-1">
                              {(step.benefits || []).map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Sparkles className="w-3 h-3 text-royal-gold flex-shrink-0" />
                                  <span className="text-xs text-pearl-white/80">{benefit}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleStepComplete(step.id)}
                            className="w-full mt-4 bg-gradient-to-r from-royal-gold to-yellow-400 text-dark-navy font-semibold py-2 px-4 rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                          >
                            Marcar como Concluído
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
      
      {/* Completion celebration */}
      {progressPercentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center p-4 bg-gradient-to-r from-royal-gold/20 to-yellow-400/20 rounded-2xl border border-royal-gold/30"
        >
          <Trophy className="w-8 h-8 text-royal-gold mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white mb-1">Jornada Completa!</h3>
          <p className="text-sm text-pearl-white/80">Parabéns! Você completou todos os passos da sua jornada hoje.</p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default DailyJourney