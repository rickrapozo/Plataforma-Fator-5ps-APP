import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Coffee, Sunset } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { getCapitalizedFirstName } from '../../utils/nameUtils'
import DailyAffirmation from './DailyAffirmation'
import GoldenParticles from './GoldenParticles'

interface DynamicGreetingProps {
  className?: string
}

const DynamicGreeting: React.FC<DynamicGreetingProps> = ({ className = '' }) => {
  const { user, streak } = useAppStore()

  // Determina o período do dia e ícone correspondente
  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'
    if (hour >= 18 && hour < 22) return 'evening'
    return 'night'
  }

  const getGreetingData = () => {
    const timeOfDay = getTimeOfDay()
    const firstName = getCapitalizedFirstName(user?.name || 'Transformador')
    
    switch (timeOfDay) {
      case 'morning':
        return {
          icon: Sun,
          gradient: 'from-amber-400 to-orange-500',
          message: `Bom dia, ${firstName}! Pronto para um dia de transformação?`
        }
      case 'afternoon':
        return {
          icon: Coffee,
          gradient: 'from-orange-400 to-red-500',
          message: `Boa tarde, ${firstName}! Continue mantendo o foco em seus objetivos.`
        }
      case 'evening':
        return {
          icon: Sunset,
          gradient: 'from-orange-500 to-purple-500',
          message: `Boa noite, ${firstName}! Hora de refletir sobre as conquistas do dia.`
        }
      case 'night':
        return {
          icon: Moon,
          gradient: 'from-indigo-400 to-purple-500',
          message: `Boa madrugada, ${firstName}! Um novo dia está nascendo cheio de possibilidades.`
        }
    }
  }

  const greetingData = getGreetingData()
  const GreetingIcon = greetingData.icon

  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-deep-navy via-royal-purple to-deep-navy p-8 shadow-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-royal-gold/5 via-transparent to-royal-purple/10">
        <GoldenParticles particleCount={25} />
      </div>
      <motion.div
        className="absolute top-0 right-0 w-32 h-32 bg-royal-gold/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-24 h-24 bg-royal-purple/20 rounded-full blur-2xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

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
          </div>
        </motion.div>

        {/* Dynamic Greeting */}
        <motion.div
          className="min-h-[120px] flex flex-col justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <h1 className="text-white text-3xl md:text-4xl font-heading font-bold mb-6 bg-gradient-to-r from-white to-pearl-white bg-clip-text text-transparent leading-tight text-center">
            {greetingData.message}
          </h1>
          
          {/* Seção de Afirmação Diária */}
          <DailyAffirmation className="mb-6" />

          {/* Streak indicator */}
          {streak > 0 && (
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-royal-gold rounded-full animate-pulse" />
                <span className="text-pearl-white/90 text-sm font-medium">
                  {streak} {streak === 1 ? 'dia' : 'dias'} de consistência
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default DynamicGreeting