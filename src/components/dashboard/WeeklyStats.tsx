import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, Award, Flame } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'

const WeeklyStats: React.FC = () => {
  const { streak, xp } = useAppStore()
  
  // Generate mock weekly data (in a real app, this would come from the store)
  const today = new Date().getDay()
  
  // Mock completion data for the week (you can replace this with real data)
  const weeklyCompletion = [
    { day: 'Dom', completed: true, percentage: 100 },
    { day: 'Seg', completed: true, percentage: 100 },
    { day: 'Ter', completed: true, percentage: 75 },
    { day: 'Qua', completed: false, percentage: 50 },
    { day: 'Qui', completed: today >= 4, percentage: today >= 4 ? 100 : 0 },
    { day: 'Sex', completed: today >= 5, percentage: today >= 5 ? 100 : 0 },
    { day: 'Sáb', completed: today >= 6, percentage: today >= 6 ? 100 : 0 }
  ]
  
  const completedDays = weeklyCompletion.filter(day => day.completed).length
  const weeklyCompletionRate = Math.round((completedDays / 7) * 100)
  
  return (
    <motion.div
      className="glass-card p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white text-lg font-heading font-bold">
              Estatísticas da Semana
            </h3>
            <p className="text-pearl-white/80 text-sm">
              {completedDays} de 7 dias concluídos
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <motion.div
            className="text-2xl font-bold text-white mb-1"
            animate={{ 
              scale: weeklyCompletionRate >= 80 ? [1, 1.05, 1] : 1,
              color: weeklyCompletionRate >= 80 ? ['#ffffff', '#10b981', '#ffffff'] : '#ffffff'
            }}
            transition={{ duration: 2, repeat: weeklyCompletionRate >= 80 ? Infinity : 0 }}
          >
            {weeklyCompletionRate}%
          </motion.div>
          <p className="text-pearl-white/70 text-xs">Taxa de conclusão</p>
        </div>
      </div>
      
      {/* Weekly Progress Bar Chart */}
      <div className="mb-6">
        <div className="flex items-end justify-between gap-2 h-24">
          {weeklyCompletion.map((dayData, index) => {
            const isToday = index === today
            const height = Math.max(dayData.percentage * 0.8, 10) // Min height of 10%
            
            return (
              <div key={dayData.day} className="flex-1 flex flex-col items-center">
                <motion.div
                  className="w-full relative"
                  style={{ height: '80px' }}
                >
                  <motion.div
                    className={`absolute bottom-0 w-full rounded-t-lg ${
                      dayData.completed 
                        ? 'bg-gradient-to-t from-success-green to-emerald-400'
                        : isToday
                        ? 'bg-gradient-to-t from-royal-gold to-bright-gold'
                        : 'bg-gradient-to-t from-white/20 to-white/10'
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                  >
                    {/* Glow effect for completed days */}
                    {dayData.completed && (
                      <motion.div
                        className="absolute inset-0 bg-white/20 rounded-t-lg blur-sm"
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    
                    {/* Today indicator */}
                    {isToday && (
                      <motion.div
                        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </motion.div>
                
                <motion.p
                  className={`text-xs font-medium mt-2 ${
                    isToday ? 'text-royal-gold' : dayData.completed ? 'text-white' : 'text-pearl-white/60'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  {dayData.day}
                </motion.p>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Streak */}
        <motion.div
          className="text-center p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{streak}</div>
          <p className="text-xs text-orange-300">Sequência</p>
        </motion.div>
        
        {/* XP This Week */}
        <motion.div
          className="text-center p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3 }}
        >
          <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{Math.round(xp * 0.3)}</div>
          <p className="text-xs text-purple-300">XP Semana</p>
        </motion.div>
        
        {/* Achievement */}
        <motion.div
          className="text-center p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4 }}
        >
          <Award className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{completedDays}</div>
          <p className="text-xs text-yellow-300">Dias Perfeitos</p>
        </motion.div>
      </div>
      
      {/* Motivational Message */}
      {weeklyCompletionRate >= 80 ? (
        <motion.div
          className="mt-4 p-3 bg-gradient-to-r from-success-green/20 to-emerald-500/20 border border-success-green/40 rounded-lg text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6 }}
        >
          <p className="text-success-green font-semibold text-sm">
            🎉 Excelente semana! Você está no caminho certo!
          </p>
        </motion.div>
      ) : weeklyCompletionRate >= 50 ? (
        <motion.div
          className="mt-4 p-3 bg-gradient-to-r from-royal-gold/20 to-bright-gold/20 border border-royal-gold/40 rounded-lg text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6 }}
        >
          <p className="text-royal-gold font-semibold text-sm">
            💪 Boa semana! Continue assim para alcançar seus objetivos!
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="mt-4 p-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/40 rounded-lg text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6 }}
        >
          <p className="text-blue-400 font-semibold text-sm">
            🚀 Vamos acelerar! Cada dia é uma nova oportunidade!
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default WeeklyStats