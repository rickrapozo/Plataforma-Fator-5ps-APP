import React from 'react'
import { motion } from 'framer-motion'
import { Flame, Trophy, Star, Zap } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import CircularProgress from './CircularProgress'

const StreakCounter: React.FC = () => {
  const { streak, longestStreak, level, xp } = useAppStore()
  
  const xpToNextLevel = (level * 1000) - xp
  const xpProgress = (xp % 1000) / 1000 * 100

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Streak Card */}
      <motion.div
        className="relative glass-card p-5 text-center overflow-hidden group"
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Flame animation */}
        <motion.div
          className="flex items-center justify-center mb-3"
          animate={{
            rotate: [-2, 2, -2],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            <Flame className="w-8 h-8 text-orange-400 drop-shadow-lg" />
            {streak > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-royal-gold rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>
        
        <motion.span 
          className="text-3xl font-bold text-white block mb-2"
          animate={{ scale: streak > longestStreak ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5 }}
        >
          {streak}
        </motion.span>
        
        <p className="text-pearl-white/90 text-sm font-medium mb-2">Dias consecutivos</p>
        
        <div className="flex items-center justify-center gap-1">
          <Star className="w-3 h-3 text-royal-gold" />
          <p className="text-royal-gold text-xs font-semibold">
            Recorde: {longestStreak}
          </p>
          <Star className="w-3 h-3 text-royal-gold" />
        </div>
      </motion.div>

      {/* Level Card */}
      <motion.div
        className="relative glass-card p-5 text-center overflow-hidden group"
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-royal-gold/20 to-bright-gold/20 rounded-xl"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
        
        {/* Trophy animation */}
        <motion.div
          className="flex items-center justify-center mb-3"
          animate={{
            y: [-2, 2, -2]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            <Trophy className="w-8 h-8 text-royal-gold drop-shadow-lg" />
            <motion.div
              className="absolute inset-0 bg-royal-gold/30 rounded-full blur-md"
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
        
        <motion.span 
          className="text-3xl font-bold text-white block mb-2"
          animate={{ 
            textShadow: [
              "0 0 10px rgba(255, 215, 0, 0.5)",
              "0 0 20px rgba(255, 215, 0, 0.8)",
              "0 0 10px rgba(255, 215, 0, 0.5)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {level}
        </motion.span>
        
        <p className="text-pearl-white/90 text-sm font-medium mb-4">Nível atual</p>
        
        {/* Circular XP Progress */}
        <div className="flex flex-col items-center space-y-3">
          <CircularProgress
            percentage={xpProgress}
            size={80}
            strokeWidth={6}
            color="#F59E0B"
            backgroundColor="rgba(255, 255, 255, 0.2)"
            showPercentage={false}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-royal-gold">
                {Math.round(xp % 1000)}
              </div>
              <div className="text-xs text-pearl-white/70">
                / 1000 XP
              </div>
            </div>
          </CircularProgress>
          
          <div className="flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-bright-gold" />
            <p className="text-bright-gold text-xs font-semibold">
              {xpToNextLevel} XP para próximo nível
            </p>
          </div>
        </div>
       </motion.div>
     </div>
   )
 }

 export default StreakCounter