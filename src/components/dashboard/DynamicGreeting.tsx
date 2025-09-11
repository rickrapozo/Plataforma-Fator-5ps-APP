import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Sun, Moon, Sunset, Brain, Loader2, Quote } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { geminiService } from '../../services/geminiService'
import { getCapitalizedFirstName } from '../../utils/nameUtils'

interface DynamicGreetingProps {
  className?: string
}

const DynamicGreeting: React.FC<DynamicGreetingProps> = ({ className = '' }) => {
  const { user, streak, dailyProtocol } = useAppStore()
  const [greeting, setGreeting] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAIGenerated, setIsAIGenerated] = useState(false)
  const [currentQuote, setCurrentQuote] = useState<{
    quote: string
    author: string
    context: string
  } | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)

  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }

  const getGreetingIcon = () => {
    const timeOfDay = getTimeOfDay()
    switch (timeOfDay) {
      case 'morning': return { icon: Sun, gradient: 'from-amber-400 to-orange-500' }
      case 'afternoon': return { icon: Sunset, gradient: 'from-orange-400 to-red-500' }
      case 'evening': return { icon: Moon, gradient: 'from-indigo-400 to-purple-500' }
    }
  }

  const getLastActivity = () => {
    const activities = []
    if (dailyProtocol.p1_affirmations.length > 0) activities.push('afirmações')
    if (dailyProtocol.p2_feeling) activities.push('registro de sentimentos')
    if (dailyProtocol.p3_peak_state_completed) activities.push('estado peak')
    if (dailyProtocol.p4_completed) activities.push('ação mínima viável')
    if (dailyProtocol.p5_victory) activities.push('reflexão noturna')
    
    return activities.length > 0 ? activities[activities.length - 1] : 'nenhuma atividade hoje'
  }

  const getRecentProgress = () => {
    return {
      affirmationsCount: dailyProtocol.p1_affirmations.length,
      hasFeeling: !!dailyProtocol.p2_feeling,
      peakStateCompleted: dailyProtocol.p3_peak_state_completed,
      actionCompleted: dailyProtocol.p4_completed,
      reflectionCompleted: !!(dailyProtocol.p5_victory && dailyProtocol.p5_gratitude)
    }
  }

  const isFirstTime = () => {
    return streak === 0 && Object.values(dailyProtocol).every(value => 
      Array.isArray(value) ? value.length === 0 : !value
    )
  }

  const generateMotivationalQuote = async () => {
    setQuoteLoading(true)
    try {
      const quote = await geminiService.generateMotivationalQuote({
        timeOfDay: getTimeOfDay(),
        currentGoals: ['desenvolvimento pessoal', 'transformação mental'],
        recentAchievements: streak > 0 ? [`${streak} dias de consistência`] : []
      })
      setCurrentQuote(quote)
    } catch (error) {
      console.error('Erro ao gerar citação motivacional:', error)
    } finally {
      setQuoteLoading(false)
    }
  }

  useEffect(() => {
    const generateGreeting = async () => {
      setIsLoading(true)
      const firstName = getCapitalizedFirstName(user?.name || 'Usuário')
      
      try {
        const dynamicGreeting = await geminiService.generateDynamicGreeting({
          name: firstName,
          timeOfDay: getTimeOfDay(),
          streak,
          lastActivity: getLastActivity(),
          recentProgress: getRecentProgress(),
          isFirstTime: isFirstTime()
        })
        
        setGreeting(dynamicGreeting)
        setIsAIGenerated(true)
      } catch (error) {
        console.error('Erro ao gerar saudação dinâmica:', error)
        // Fallback para saudação padrão
        const timeOfDay = getTimeOfDay()
        const fallbackGreetings = {
          morning: `Bom dia, ${firstName}! Pronto para alinhar sua mente e criar um dia próspero?`,
          afternoon: `Olá, ${firstName}! Como está a energia dos seus 5Ps? Vamos recalibrar para uma tarde produtiva.`,
          evening: `Boa noite, ${firstName}! É hora de refletir sobre suas conquistas e preparar sua mente para um descanso poderoso.`
        }
        setGreeting(fallbackGreetings[timeOfDay])
        setIsAIGenerated(false)
      } finally {
        setIsLoading(false)
      }
    }

    generateGreeting()
    generateMotivationalQuote()
  }, [user, streak, dailyProtocol])

  // Rotação automática de citações a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      generateMotivationalQuote()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [])

  const greetingData = getGreetingIcon()
  const GreetingIcon = greetingData.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative text-center py-8 overflow-hidden ${className}`}
    >
      {/* Background animated gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${greetingData.gradient} opacity-10 rounded-3xl`}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-royal-gold/30 rounded-full"
            animate={{
              y: [-20, -100],
              x: [Math.random() * 300, Math.random() * 300],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%'
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Greeting icon with animation */}
        <motion.div
          className="flex justify-center mb-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <div className={`p-3 rounded-full bg-gradient-to-r ${greetingData.gradient} shadow-lg relative`}>
            <GreetingIcon className="w-6 h-6 text-white" />
            {isAIGenerated && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-royal-gold rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-2 h-2 text-white" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Dynamic Greeting */}
        <motion.div
          className="min-h-[120px] flex flex-col justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-royal-gold animate-spin" />
              <p className="text-pearl-white/80 text-lg">Personalizando sua saudação...</p>
            </div>
          ) : (
            <>
              <h1 className="text-white text-3xl md:text-4xl font-heading font-bold mb-3 bg-gradient-to-r from-white to-pearl-white bg-clip-text text-transparent leading-tight">
                {greeting}
              </h1>
              
              {/* Motivational Quote Section */}
              <motion.div
                className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {quoteLoading ? (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <Loader2 className="w-5 h-5 text-royal-gold animate-spin" />
                    <p className="text-pearl-white/70 text-sm">Buscando inspiração...</p>
                  </div>
                ) : currentQuote ? (
                  <motion.div
                    key={currentQuote.quote}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <Quote className="w-6 h-6 text-royal-gold mx-auto mb-3 opacity-60" />
                    <motion.p 
                      className="text-pearl-white/90 text-lg font-medium italic mb-3 leading-relaxed"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      "{currentQuote.quote}"
                    </motion.p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-px bg-royal-gold/30 flex-1 max-w-12"></div>
                      <p className="text-royal-gold text-sm font-semibold">
                        {currentQuote.author}
                      </p>
                      <div className="h-px bg-royal-gold/30 flex-1 max-w-12"></div>
                    </div>
                    <p className="text-pearl-white/60 text-xs mt-2">
                      {currentQuote.context}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex items-center justify-center gap-2 py-4"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-royal-gold" />
                    <p className="text-pearl-white/90 text-lg font-medium">
                      {isAIGenerated ? 'Mensagem personalizada por IA' : 'Sua jornada de transformação continua'}
                    </p>
                    <Sparkles className="w-5 h-5 text-royal-gold" />
                  </motion.div>
                )}
              </motion.div>

              {/* Streak indicator */}
              {streak > 0 && (
                <motion.div
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-2 h-2 bg-royal-gold rounded-full animate-pulse" />
                  <span className="text-pearl-white/90 text-sm font-medium text-center w-full block">
                    {streak} {streak === 1 ? 'dia' : 'dias'} de consistência
                  </span>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default DynamicGreeting