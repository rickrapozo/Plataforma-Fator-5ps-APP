import React from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Heart, 
  Zap, 
  Target, 
  Moon, 
  CheckCircle,
  Circle,
  Sparkles,
  Star
} from 'lucide-react'

interface ProtocolSectionProps {
  title: string
  icon: string
  completed: boolean
  description: string
  children: React.ReactNode
  nightOnly?: boolean
}

const iconMap = {
  Brain,
  Heart,
  Zap,
  Target,
  Moon
}

const getIconGradient = (icon: string, completed: boolean) => {
  if (!completed) return 'from-white/20 to-white/10'
  
  switch (icon) {
    case 'Brain': return 'from-purple-500 to-indigo-600'
    case 'Heart': return 'from-pink-500 to-red-500'
    case 'Zap': return 'from-yellow-400 to-orange-500'
    case 'Target': return 'from-green-500 to-emerald-600'
    case 'Moon': return 'from-indigo-500 to-purple-600'
    default: return 'from-royal-gold to-bright-gold'
  }
}

const ProtocolSection: React.FC<ProtocolSectionProps> = ({
  title,
  icon,
  completed,
  description,
  children,
  nightOnly = false
}) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap]
  const iconGradient = getIconGradient(icon, completed)

  return (
    <motion.div
      className={`relative glass-card p-6 overflow-hidden group ${
        nightOnly ? 'bg-gradient-to-br from-deep-forest/60 to-sage-green/40' : ''
      } ${
        completed ? 'ring-2 ring-success-green/30' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Background effects */}
      {completed && (
        <>
          {/* Success glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-success-green/10 to-transparent rounded-xl"
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.01, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-success-green/40 rounded-full"
                animate={{
                  y: [20, -20],
                  x: [Math.random() * 200, Math.random() * 200],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
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
        </>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Enhanced icon with gradient background */}
          <motion.div
            className={`relative p-3 rounded-xl bg-gradient-to-br ${iconGradient} shadow-lg`}
            animate={{
              rotate: completed ? [0, 5, -5, 0] : 0,
              scale: completed ? [1, 1.05, 1] : 1
            }}
            transition={{
              duration: 2,
              repeat: completed ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <IconComponent className="w-7 h-7 text-white drop-shadow-sm" />
            
            {/* Icon glow effect */}
            {completed && (
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-xl blur-sm"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
          
          <div className="flex-1">
            <motion.h3 
              className="text-white font-heading font-bold text-xl mb-1"
              animate={{
                color: completed ? ['#ffffff', '#10b981', '#ffffff'] : '#ffffff'
              }}
              transition={{ duration: 2, repeat: completed ? Infinity : 0 }}
            >
              {title}
            </motion.h3>
            <p className="text-pearl-white/80 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        
        {/* Enhanced completion indicator */}
        <motion.div
          className="relative"
          animate={{ 
            scale: completed ? [1, 1.1, 1] : 1,
            rotate: completed ? [0, 360] : 0
          }}
          transition={{ 
            scale: { duration: 1, repeat: completed ? Infinity : 0 },
            rotate: { duration: 2, repeat: completed ? Infinity : 0 }
          }}
        >
          {completed ? (
            <div className="relative">
              <CheckCircle className="w-10 h-10 text-success-green drop-shadow-lg" />
              <motion.div
                className="absolute inset-0 bg-success-green/30 rounded-full blur-md"
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          ) : (
            <Circle className="w-10 h-10 text-pearl-white/40" />
          )}
        </motion.div>
      </div>

      {/* Content with enhanced spacing */}
      <div className="relative z-10 space-y-5">
        {children}
      </div>

      {/* Enhanced completion indicator */}
      {completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative z-10 mt-6 p-4 bg-gradient-to-r from-success-green/20 to-emerald-500/20 border border-success-green/40 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-success-green" />
            </motion.div>
            
            <p className="text-success-green text-sm font-semibold">
              Concluído! Parabéns pela dedicação.
            </p>
            
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Star className="w-5 h-5 text-royal-gold fill-current" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ProtocolSection