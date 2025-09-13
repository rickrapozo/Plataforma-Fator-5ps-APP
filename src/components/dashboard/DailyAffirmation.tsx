import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Quote, Sparkles, Loader2, RefreshCw } from 'lucide-react'

interface DailyAffirmationProps {
  className?: string
}

interface Affirmation {
  id: number
  text: string
  category: string
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
}

// Banco de afirmações diárias organizadas por período do dia
const DAILY_AFFIRMATIONS: Affirmation[] = [
  // Manhã (5h-12h)
  { id: 1, text: "Hoje é um novo dia cheio de possibilidades infinitas para meu crescimento.", category: "Crescimento", timeOfDay: "morning" },
  { id: 2, text: "Minha mente está clara e focada para alcançar meus objetivos hoje.", category: "Foco", timeOfDay: "morning" },
  { id: 3, text: "Eu tenho o poder de criar uma realidade extraordinária para mim mesmo.", category: "Empoderamento", timeOfDay: "morning" },
  { id: 4, text: "Cada respiração me conecta com minha força interior e determinação.", category: "Força Interior", timeOfDay: "morning" },
  
  // Tarde (12h-18h)
  { id: 5, text: "Mantenho minha energia positiva e produtiva durante todo este período.", category: "Energia", timeOfDay: "afternoon" },
  { id: 6, text: "Cada desafio que encontro é uma oportunidade de demonstrar minha capacidade.", category: "Resiliência", timeOfDay: "afternoon" },
  { id: 7, text: "Estou no caminho certo e cada passo me aproxima dos meus sonhos.", category: "Propósito", timeOfDay: "afternoon" },
  { id: 8, text: "Minha confiança cresce a cada decisão positiva que tomo hoje.", category: "Confiança", timeOfDay: "afternoon" },
  
  // Noite (18h-22h)
  { id: 9, text: "Celebro todas as conquistas que alcancei durante este dia.", category: "Gratidão", timeOfDay: "evening" },
  { id: 10, text: "Minha mente se prepara para um descanso reparador e transformador.", category: "Paz Interior", timeOfDay: "evening" },
  { id: 11, text: "Libero todas as tensões do dia e abraço a serenidade da noite.", category: "Relaxamento", timeOfDay: "evening" },
  { id: 12, text: "Amanhã será ainda melhor porque hoje eu cresci e evoluí.", category: "Esperança", timeOfDay: "evening" },
  
  // Madrugada (22h-5h)
  { id: 13, text: "Meu subconsciente trabalha em meu favor enquanto descanso profundamente.", category: "Renovação", timeOfDay: "night" },
  { id: 14, text: "Cada momento de quietude fortalece minha conexão comigo mesmo.", category: "Autoconhecimento", timeOfDay: "night" },
  { id: 15, text: "Durmo em paz sabendo que estou no caminho da minha melhor versão.", category: "Tranquilidade", timeOfDay: "night" }
]

const DailyAffirmation: React.FC<DailyAffirmationProps> = ({ className = '' }) => {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rotationIndex, setRotationIndex] = useState(0)

  // Determina o período do dia atual
  const getCurrentTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'
    if (hour >= 18 && hour < 22) return 'evening'
    return 'night'
  }

  // Filtra afirmações por período do dia
  const getAffirmationsForTimeOfDay = (timeOfDay: string): Affirmation[] => {
    return DAILY_AFFIRMATIONS.filter(affirmation => affirmation.timeOfDay === timeOfDay)
  }

  // Gera índice baseado no dia e hora para rotação consistente
  const getDailyRotationIndex = (): number => {
    const now = new Date()
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const hourOfDay = now.getHours()
    const minuteOfHour = now.getMinutes()
    
    // Cria um índice único baseado no dia + hora + minuto para rotação suave
    return (dayOfYear * 24 * 60) + (hourOfDay * 60) + minuteOfHour
  }

  // Seleciona afirmação baseada no período e rotação
  const selectCurrentAffirmation = (): Affirmation => {
    const timeOfDay = getCurrentTimeOfDay()
    const availableAffirmations = getAffirmationsForTimeOfDay(timeOfDay)
    
    if (availableAffirmations.length === 0) {
      // Fallback para todas as afirmações se não houver para o período
      const rotationIndex = getDailyRotationIndex()
      return DAILY_AFFIRMATIONS[rotationIndex % DAILY_AFFIRMATIONS.length]
    }
    
    const rotationIndex = getDailyRotationIndex()
    return availableAffirmations[rotationIndex % availableAffirmations.length]
  }



  // Carrega afirmação inicial
  useEffect(() => {
    const loadAffirmation = () => {
      setIsLoading(true)
      
      // Simula um pequeno delay para suavidade
      setTimeout(() => {
        const selectedAffirmation = selectCurrentAffirmation()
        setCurrentAffirmation(selectedAffirmation)
        setIsLoading(false)
      }, 500)
    }

    loadAffirmation()
  }, [])

  // Rotação automática a cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      const selectedAffirmation = selectCurrentAffirmation()
      setCurrentAffirmation(selectedAffirmation)
      setRotationIndex(prev => prev + 1)
    }, 120000) // 2 minutos

    return () => clearInterval(interval)
  }, [])

  // Função para forçar nova afirmação
  const refreshAffirmation = () => {
    setIsLoading(true)
    setTimeout(() => {
      const selectedAffirmation = selectCurrentAffirmation()
      setCurrentAffirmation(selectedAffirmation)
      setRotationIndex(prev => prev + 1)
      setIsLoading(false)
    }, 300)
  }

  return (
    <motion.div
      className={`p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-6">
          <Loader2 className="w-5 h-5 text-royal-gold animate-spin" />
          <p className="text-pearl-white/70 text-sm">Carregando sua afirmação diária...</p>
        </div>
      ) : currentAffirmation ? (
        <motion.div
          key={`${currentAffirmation.id}-${rotationIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center relative"
        >
          {/* Botão de refresh */}
          <button
            onClick={refreshAffirmation}
            className="absolute top-0 right-0 p-2 text-royal-gold/60 hover:text-royal-gold transition-colors rounded-full hover:bg-white/5"
            title="Nova afirmação"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Ícone de citação */}
          <Quote className="w-6 h-6 text-royal-gold mx-auto mb-3 opacity-60" />
          
          {/* Texto da afirmação */}
          <motion.p 
            className="text-pearl-white/90 text-lg font-medium italic mb-4 leading-relaxed px-2"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            "{currentAffirmation.text}"
          </motion.p>
          
          {/* Categoria e período */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px bg-royal-gold/30 flex-1 max-w-12"></div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-royal-gold" />
              <p className="text-royal-gold text-sm font-semibold">
                {currentAffirmation.category}
              </p>
              <Sparkles className="w-3 h-3 text-royal-gold" />
            </div>
            <div className="h-px bg-royal-gold/30 flex-1 max-w-12"></div>
          </div>
          
          {/* Indicador de período do dia */}
          <p className="text-pearl-white/60 text-xs">
            Afirmação para {getCurrentTimeOfDay() === 'morning' ? 'manhã' : 
                           getCurrentTimeOfDay() === 'afternoon' ? 'tarde' : 
                           getCurrentTimeOfDay() === 'evening' ? 'noite' : 'madrugada'}
          </p>
          
          {/* Indicador de rotação */}
          <div className="flex justify-center mt-3 space-x-1">
            {Array.from({ length: Math.min(getAffirmationsForTimeOfDay(getCurrentTimeOfDay()).length, 5) }).map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === (rotationIndex % getAffirmationsForTimeOfDay(getCurrentTimeOfDay()).length)
                    ? 'bg-royal-gold'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="flex items-center justify-center gap-2 py-6"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-5 h-5 text-royal-gold" />
          <p className="text-pearl-white/90 text-lg font-medium">
            Sua jornada de transformação continua
          </p>
          <Sparkles className="w-5 h-5 text-royal-gold" />
        </motion.div>
      )}
    </motion.div>
  )
}

export default DailyAffirmation