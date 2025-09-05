import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Star, Flame, Target, Zap, Trophy, Crown, Sparkles, X } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress: number
  maxProgress: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xpReward: number
}

const AchievementSystem: React.FC = () => {
  const { streak, xp, dailyProtocol } = useAppStore()
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  
  // Calculate achievements based on user progress
  const achievements: Achievement[] = [
    {
      id: 'first_day',
      title: 'Primeiro Passo',
      description: 'Complete seu primeiro protocolo diário',
      icon: <Star className="w-6 h-6" />,
      unlocked: streak >= 1,
      progress: Math.min(streak, 1),
      maxProgress: 1,
      rarity: 'common',
      xpReward: 50
    },
    {
      id: 'week_warrior',
      title: 'Guerreiro da Semana',
      description: 'Mantenha uma sequência de 7 dias',
      icon: <Flame className="w-6 h-6" />,
      unlocked: streak >= 7,
      progress: Math.min(streak, 7),
      maxProgress: 7,
      rarity: 'rare',
      xpReward: 200
    },
    {
      id: 'month_master',
      title: 'Mestre do Mês',
      description: 'Complete 30 dias consecutivos',
      icon: <Crown className="w-6 h-6" />,
      unlocked: streak >= 30,
      progress: Math.min(streak, 30),
      maxProgress: 30,
      rarity: 'epic',
      xpReward: 1000
    },
    {
      id: 'xp_collector',
      title: 'Coletor de XP',
      description: 'Acumule 1000 pontos de experiência',
      icon: <Zap className="w-6 h-6" />,
      unlocked: xp >= 1000,
      progress: Math.min(xp, 1000),
      maxProgress: 1000,
      rarity: 'rare',
      xpReward: 300
    },
    {
      id: 'perfectionist',
      title: 'Perfeccionista',
      description: 'Complete todos os 5 protocolos em um dia',
      icon: <Target className="w-6 h-6" />,
      unlocked: dailyProtocol.p1_affirmations.length === 3 && 
                !!dailyProtocol.p2_feeling && 
                dailyProtocol.p3_peak_state_completed && 
                dailyProtocol.p4_completed && 
                !!(dailyProtocol.p5_victory && dailyProtocol.p5_gratitude),
      progress: [
        dailyProtocol.p1_affirmations.length === 3,
        !!dailyProtocol.p2_feeling,
        dailyProtocol.p3_peak_state_completed,
        dailyProtocol.p4_completed,
        !!(dailyProtocol.p5_victory && dailyProtocol.p5_gratitude)
      ].filter(Boolean).length,
      maxProgress: 5,
      rarity: 'epic',
      xpReward: 500
    },
    {
      id: 'legend',
      title: 'Lenda Viva',
      description: 'Alcance 100 dias de sequência',
      icon: <Trophy className="w-6 h-6" />,
      unlocked: streak >= 100,
      progress: Math.min(streak, 100),
      maxProgress: 100,
      rarity: 'legendary',
      xpReward: 5000
    }
  ]
  
  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)
  
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600'
      case 'rare': return 'from-blue-500 to-blue-600'
      case 'epic': return 'from-purple-500 to-purple-600'
      case 'legendary': return 'from-yellow-400 to-orange-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }
  
  const getRarityBorder = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-500/50'
      case 'rare': return 'border-blue-500/50'
      case 'epic': return 'border-purple-500/50'
      case 'legendary': return 'border-yellow-400/50'
      default: return 'border-gray-500/50'
    }
  }
  
  return (
    <motion.div
      className="glass-card p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white text-lg font-heading font-bold">
              Conquistas
            </h3>
            <p className="text-pearl-white/80 text-sm">
              {unlockedAchievements.length} de {achievements.length} desbloqueadas
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-400">
            {unlockedAchievements.reduce((sum, a) => sum + a.xpReward, 0)}
          </div>
          <p className="text-pearl-white/70 text-xs">XP Total</p>
        </div>
      </div>
      
      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Desbloqueadas
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {unlockedAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className={`relative p-4 bg-gradient-to-br ${getRarityColor(achievement.rarity)} border ${getRarityBorder(achievement.rarity)} rounded-xl cursor-pointer group`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAchievement(achievement)}
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                
                {/* Sparkle animation for legendary */}
                {achievement.rarity === 'legendary' && (
                  <motion.div
                    className="absolute -top-1 -right-1 text-yellow-300"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                )}
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-white">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-semibold text-sm">
                        {achievement.title}
                      </h5>
                      <p className="text-white/80 text-xs">
                        +{achievement.xpReward} XP
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-pearl-white/60" />
            Em Progresso
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {lockedAchievements.slice(0, 3).map((achievement, index) => {
              const progressPercentage = (achievement.progress / achievement.maxProgress) * 100
              
              return (
                <motion.div
                  key={achievement.id}
                  className="p-4 bg-white/10 border border-white/20 rounded-xl cursor-pointer group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedAchievement(achievement)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-pearl-white/60">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-semibold text-sm">
                        {achievement.title}
                      </h5>
                      <p className="text-pearl-white/70 text-xs">
                        {achievement.progress}/{achievement.maxProgress}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-pearl-white/80">
                        {Math.round(progressPercentage)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ delay: 1.2 + index * 0.1, duration: 1 }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              className={`glass-card p-6 max-w-sm w-full border ${getRarityBorder(selectedAchievement.rarity)}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${getRarityColor(selectedAchievement.rarity)} rounded-lg`}>
                  {selectedAchievement.icon}
                </div>
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="text-pearl-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-white text-xl font-bold mb-2">
                {selectedAchievement.title}
              </h3>
              
              <p className="text-pearl-white/80 text-sm mb-4">
                {selectedAchievement.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-pearl-white/70 text-sm">Progresso</span>
                <span className="text-white font-semibold">
                  {selectedAchievement.progress}/{selectedAchievement.maxProgress}
                </span>
              </div>
              
              <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                <div
                  className={`h-full bg-gradient-to-r ${getRarityColor(selectedAchievement.rarity)} rounded-full`}
                  style={{ width: `${(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-pearl-white/70 text-sm">Recompensa</span>
                <span className="text-yellow-400 font-bold">
                  +{selectedAchievement.xpReward} XP
                </span>
              </div>
              
              {selectedAchievement.unlocked && (
                <motion.div
                  className="mt-4 p-3 bg-success-green/20 border border-success-green/40 rounded-lg text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-success-green font-semibold text-sm">
                    ✅ Conquista Desbloqueada!
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AchievementSystem