import React from 'react'
import { motion } from 'framer-motion'
import { User, Settings, Crown, Trophy, Flame, Star } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'

const ProfilePage: React.FC = () => {
  const { user, streak, longestStreak, level, xp, badges, totalDays } = useAppStore()

  const stats = [
    { label: 'Dias consecutivos', value: streak, icon: Flame, color: 'text-royal-gold' },
    { label: 'Recorde de streak', value: longestStreak, icon: Trophy, color: 'text-success-green' },
    { label: 'Nível atual', value: level, icon: Star, color: 'text-info-blue' },
    { label: 'Total de dias', value: totalDays, icon: User, color: 'text-pearl-white' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-white text-3xl font-heading font-bold mb-4">
          Meu Perfil
        </h1>
        <p className="text-pearl-white/80 text-body-lg">
          Acompanhe sua jornada de transformação
        </p>
      </motion.div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-royal-gold to-bright-gold rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-heading font-bold text-xl">
              {user?.name || 'Usuário'}
            </h2>
            <p className="text-pearl-white/70 text-sm">
              {user?.email}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              {user?.subscription === 'prosperous' && (
                <div className="flex items-center space-x-1 bg-royal-gold/20 px-2 py-1 rounded-full">
                  <Crown className="w-4 h-4 text-royal-gold" />
                  <span className="text-royal-gold text-xs font-medium">Premium</span>
                </div>
              )}
              <div className="bg-sage-green/20 px-2 py-1 rounded-full">
                <span className="text-sage-green text-xs font-medium">Nível {level}</span>
              </div>
            </div>
          </div>
          <motion.button
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="glass-card p-4 text-center"
            >
              <IconComponent className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-pearl-white/70 text-sm">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* XP Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-heading font-semibold">Experiência</h3>
          <span className="text-royal-gold font-bold">{xp} XP</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-royal-gold to-bright-gold h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(xp % 1000) / 10}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="text-pearl-white/70 text-sm mt-2">
          {1000 - (xp % 1000)} XP para o próximo nível
        </p>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-6"
      >
        <h3 className="text-white font-heading font-semibold mb-4">
          Conquistas ({badges.length})
        </h3>
        
        {badges.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge, index) => (
              <motion.div
                key={badge}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-gradient-to-br from-royal-gold to-bright-gold p-3 rounded-lg text-center"
              >
                <div className="text-2xl mb-1">🏆</div>
                <p className="text-white text-xs font-medium">{badge}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-pearl-white/40 mx-auto mb-3" />
            <p className="text-pearl-white/60">
              Continue sua jornada para desbloquear conquistas!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ProfilePage