import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FeelingTrackerProps {
  currentFeeling: string | null
  trigger: string
  onUpdate: (feeling: string, trigger: string) => void
}

const feelings = [
  { value: 'anxious', label: 'Ansioso(a)', emoji: '😰', color: 'bg-warning-amber' },
  { value: 'grateful', label: 'Grato(a)', emoji: '🙏', color: 'bg-success-green' },
  { value: 'confident', label: 'Confiante', emoji: '💪', color: 'bg-royal-gold' },
  { value: 'overwhelmed', label: 'Sobrecarregado(a)', emoji: '😵', color: 'bg-error-red' },
  { value: 'peaceful', label: 'Em Paz', emoji: '🕊️', color: 'bg-sage-green' },
  { value: 'motivated', label: 'Motivado(a)', emoji: '🔥', color: 'bg-info-blue' }
]

const FeelingTracker: React.FC<FeelingTrackerProps> = ({
  currentFeeling,
  trigger,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {feelings.map((feeling) => {
          const isSelected = currentFeeling === feeling.value
          
          return (
            <motion.button
              key={feeling.value}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? `${feeling.color} border-white shadow-lg`
                  : 'bg-white/5 border-white/20 hover:border-white/40'
              }`}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdate(feeling.value, trigger)}
            >
              <div className="text-2xl mb-2">{feeling.emoji}</div>
              <div className={`text-sm font-medium ${
                isSelected ? 'text-white' : 'text-pearl-white/80'
              }`}>
                {feeling.label}
              </div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {currentFeeling && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <label className="block text-white text-sm font-medium">
              O que desencadeou este sentimento? (opcional)
            </label>
            <textarea
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-pearl-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-royal-gold resize-none"
              rows={3}
              placeholder="Descreva brevemente o que causou este sentimento..."
              value={trigger}
              onChange={(e) => onUpdate(currentFeeling, e.target.value)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FeelingTracker