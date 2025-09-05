import React from 'react'
import { motion } from 'framer-motion'
import { Star, MessageCircle, Heart } from 'lucide-react'

interface NightlyReflectionProps {
  data: {
    victory: string
    feedback: string
    gratitude: string
  }
  onUpdate: (field: 'victory' | 'feedback' | 'gratitude', value: string) => void
}

const NightlyReflection: React.FC<NightlyReflectionProps> = ({
  data,
  onUpdate
}) => {
  const fields = [
    {
      key: 'victory' as const,
      label: 'Qual foi sua maior vitória hoje?',
      placeholder: 'Celebre suas conquistas, por menores que sejam...',
      icon: Star,
      color: 'text-royal-gold'
    },
    {
      key: 'feedback' as const,
      label: 'O que você aprendeu hoje?',
      placeholder: 'Que lição ou insight você teve hoje?',
      icon: MessageCircle,
      color: 'text-info-blue'
    },
    {
      key: 'gratitude' as const,
      label: 'Pelo que você é grato hoje?',
      placeholder: 'Liste 3 coisas pelas quais você é grato...',
      icon: Heart,
      color: 'text-success-green'
    }
  ]

  return (
    <div className="space-y-6">
      {fields.map((field, index) => {
        const IconComponent = field.icon
        
        return (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <IconComponent className={`w-5 h-5 ${field.color}`} />
              <label className="block text-white text-sm font-medium">
                {field.label}
              </label>
            </div>
            
            <textarea
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-pearl-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-royal-gold resize-none"
              rows={3}
              placeholder={field.placeholder}
              value={data[field.key]}
              onChange={(e) => onUpdate(field.key, e.target.value)}
            />
          </motion.div>
        )
      })}

      <div className="p-4 bg-gradient-to-r from-deep-forest/50 to-sage-green/50 rounded-lg border border-royal-gold/30">
        <p className="text-royal-gold text-sm text-center">
          🌙 A reflexão noturna é o momento de honrar sua jornada e preparar-se para um novo dia de transformação.
        </p>
      </div>
    </div>
  )
}

export default NightlyReflection