import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Sun, Moon, Sunset, Stars } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { getCapitalizedFirstName } from '../../utils/nameUtils'

const WelcomeHeader: React.FC = () => {
  const { user } = useAppStore()
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    
    // Boa madrugada: 00:01h até 4:59h
    if (hour >= 0 && hour <= 4) {
      return { text: 'Boa madrugada', icon: Stars, gradient: 'from-indigo-600 to-purple-600' }
    }
    // Bom dia: 5h até 12h
    if (hour >= 5 && hour <= 12) {
      return { text: 'Bom dia', icon: Sun, gradient: 'from-amber-400 to-orange-500' }
    }
    // Boa tarde: 12:01h até 18h
    if (hour >= 13 && hour <= 18) {
      return { text: 'Boa tarde', icon: Sunset, gradient: 'from-orange-400 to-red-500' }
    }
    // Boa noite: 18:01h até 00h
    return { text: 'Boa noite', icon: Moon, gradient: 'from-indigo-400 to-purple-500' }
  }

  const firstName = getCapitalizedFirstName(user?.name || '')
  const greeting = getGreeting()
  const GreetingIcon = greeting.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative text-center py-8 overflow-hidden"
    >
      {/* Background animated gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${greeting.gradient} opacity-10 rounded-3xl`}
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
          <div className={`p-3 rounded-full bg-gradient-to-r ${greeting.gradient} shadow-lg`}>
            <GreetingIcon className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        <motion.h1 
          className="text-white text-4xl font-heading font-bold mb-3 bg-gradient-to-r from-white to-pearl-white bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          {greeting.text}, {firstName}!
        </motion.h1>
        
        <motion.div
          className="flex items-center justify-center gap-2 mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Sparkles className="w-5 h-5 text-royal-gold" />
          <motion.p 
            className="text-pearl-white/90 text-lg font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Pronto para transformar seu dia?
          </motion.p>
          <Sparkles className="w-5 h-5 text-royal-gold" />
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          className="w-24 h-1 bg-gradient-to-r from-royal-gold to-bright-gold rounded-full mx-auto"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ delay: 0.5, duration: 1 }}
        />
      </div>
    </motion.div>
  )
}

export default WelcomeHeader