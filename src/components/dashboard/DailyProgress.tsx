import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, Clock, Target } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'

const DailyProgress: React.FC = () => {
  const { dailyProtocol } = useAppStore()
  const isNightTime = new Date().getHours() >= 18

  // Calculate progress
  const protocols = [
    { 
      id: 'p1', 
      name: 'Pensamento', 
      completed: dailyProtocol.p1_affirmations.length === 3,
      icon: '🧠',
      color: 'from-purple-500 to-indigo-600'
    },
    { 
      id: 'p2', 
      name: 'Sentimento', 
      completed: !!dailyProtocol.p2_feeling,
      icon: '❤️',
      color: 'from-pink-500 to-red-500'
    },
    { 
      id: 'p3', 
      name: 'Emoção', 
      completed: dailyProtocol.p3_peak_state_completed,
      icon: '⚡',
      color: 'from-yellow-400 to-orange-500'
    },
    { 
      id: 'p4', 
      name: 'Ação', 
      completed: dailyProtocol.p4_completed,
      icon: '🎯',
      color: 'from-green-500 to-emerald-600'
    }
  ]

  if (isNightTime) {
    protocols.push({
      id: 'p5',
      name: 'Reflexão',
      completed: !!(dailyProtocol.p5_victory && dailyProtocol.p5_gratitude),
      icon: '🌙',
      color: 'from-indigo-500 to-purple-600'
    })
  }

  const completedCount = protocols.filter(p => p.completed).length
  const totalCount = protocols.length
  const progressPercentage = (completedCount / totalCount) * 100

  return (
    <motion.div
      className="glass-card p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-heading font-bold mb-1">
            Progresso Diário
          </h2>
          <p className="text-pearl-white/80 text-sm">
            {completedCount} de {totalCount} protocolos concluídos
          </p>
        </div>
        
        <div className="text-right">
          <motion.div
            className="text-3xl font-bold text-white mb-1"
            animate={{ 
              scale: progressPercentage === 100 ? [1, 1.1, 1] : 1,
              color: progressPercentage === 100 ? ['#ffffff', '#10b981', '#ffffff'] : '#ffffff'
            }}
            transition={{ duration: 2, repeat: progressPercentage === 100 ? Infinity : 0 }}
          >
            {Math.round(progressPercentage)}%
          </motion.div>
          <div className="flex items-center gap-1 text-xs text-pearl-white/70">
            <Clock className="w-3 h-3" />
            <span>{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="relative w-full bg-white/20 rounded-full h-4 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-royal-gold via-bright-gold to-royal-gold h-full rounded-full"
            initial={{ width: 0, x: "-100%" }}
            animate={{ 
              width: `${progressPercentage}%`,
              x: "0%"
            }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent h-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          
          {/* Progress markers */}
          {protocols.map((_, index) => {
            const markerPosition = ((index + 1) / totalCount) * 100
            return (
              <div
                key={index}
                className="absolute top-0 bottom-0 w-0.5 bg-white/30"
                style={{ left: `${markerPosition}%` }}
              />
            )
          })}
        </div>
      </div>

      {/* Protocol Icons */}
      <div className="grid grid-cols-4 gap-4">
        {protocols.slice(0, 4).map((protocol, index) => (
          <motion.div
            key={protocol.id}
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <motion.div
              className={`relative mx-auto w-12 h-12 rounded-xl bg-gradient-to-br ${
                protocol.completed ? protocol.color : 'from-white/20 to-white/10'
              } flex items-center justify-center mb-2 shadow-lg`}
              animate={{
                scale: protocol.completed ? [1, 1.05, 1] : 1,
                rotate: protocol.completed ? [0, 5, -5, 0] : 0
              }}
              transition={{
                duration: 2,
                repeat: protocol.completed ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <span className="text-lg">{protocol.icon}</span>
              
              {/* Completion indicator */}
              <motion.div
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                  protocol.completed ? 'bg-success-green' : 'bg-white/20'
                }`}
                animate={{
                  scale: protocol.completed ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 1, repeat: protocol.completed ? Infinity : 0 }}
              >
                {protocol.completed ? (
                  <CheckCircle className="w-3 h-3 text-white" />
                ) : (
                  <Circle className="w-3 h-3 text-white/60" />
                )}
              </motion.div>
              
              {/* Glow effect for completed */}
              {protocol.completed && (
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-xl blur-sm"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
            
            <p className={`text-xs font-medium ${
              protocol.completed ? 'text-white' : 'text-pearl-white/60'
            }`}>
              {protocol.name}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Night protocol (P5) if applicable */}
      {isNightTime && protocols.length === 5 && (
        <motion.div
          className="mt-6 pt-4 border-t border-white/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex items-center justify-center">
            <motion.div
              className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${
                protocols[4].completed ? protocols[4].color : 'from-white/20 to-white/10'
              } flex items-center justify-center shadow-lg`}
              animate={{
                scale: protocols[4].completed ? [1, 1.05, 1] : 1,
                rotate: protocols[4].completed ? [0, 5, -5, 0] : 0
              }}
              transition={{
                duration: 2,
                repeat: protocols[4].completed ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <span className="text-2xl">{protocols[4].icon}</span>
              
              {/* Completion indicator */}
              <motion.div
                className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                  protocols[4].completed ? 'bg-success-green' : 'bg-white/20'
                }`}
                animate={{
                  scale: protocols[4].completed ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 1, repeat: protocols[4].completed ? Infinity : 0 }}
              >
                {protocols[4].completed ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <Circle className="w-4 h-4 text-white/60" />
                )}
              </motion.div>
              
              {/* Glow effect for completed */}
              {protocols[4].completed && (
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-xl blur-sm"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
          </div>
          
          <p className={`text-center text-sm font-medium mt-2 ${
            protocols[4].completed ? 'text-white' : 'text-pearl-white/60'
          }`}>
            {protocols[4].name} Noturna
          </p>
        </motion.div>
      )}

      {/* Motivational message */}
      {progressPercentage === 100 ? (
        <motion.div
          className="mt-6 p-4 bg-gradient-to-r from-success-green/20 to-emerald-500/20 border border-success-green/40 rounded-xl text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-2"
          >
            🎉
          </motion.div>
          <p className="text-success-green font-semibold">
            Parabéns! Você completou todos os protocolos hoje!
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="mt-6 p-4 bg-gradient-to-r from-royal-gold/20 to-bright-gold/20 border border-royal-gold/40 rounded-xl text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
        >
          <Target className="w-5 h-5 text-royal-gold mx-auto mb-2" />
          <p className="text-royal-gold font-semibold">
            Continue assim! Faltam {totalCount - completedCount} protocolos.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default DailyProgress