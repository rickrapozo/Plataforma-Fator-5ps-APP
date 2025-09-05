import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface AffirmationsChecklistProps {
  affirmations: string[]
  onUpdate: (affirmations: string[]) => void
}

const defaultAffirmations = [
  "Eu sou capaz de alcançar meus objetivos financeiros",
  "Cada ação que tomo me aproxima da prosperidade",
  "Eu mereço abundância em todas as áreas da minha vida"
]

const AffirmationsChecklist: React.FC<AffirmationsChecklistProps> = ({
  affirmations,
  onUpdate
}) => {
  const handleToggle = (affirmation: string) => {
    if (affirmations.includes(affirmation)) {
      onUpdate(affirmations.filter(a => a !== affirmation))
    } else {
      onUpdate([...affirmations, affirmation])
    }
  }

  return (
    <div className="space-y-3">
      {defaultAffirmations.map((affirmation, index) => {
        const isChecked = affirmations.includes(affirmation)
        
        return (
          <motion.div
            key={index}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              isChecked 
                ? 'bg-royal-gold/20 border-royal-gold' 
                : 'bg-white/5 border-white/20 hover:border-white/40'
            }`}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleToggle(affirmation)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isChecked 
                  ? 'bg-royal-gold border-royal-gold' 
                  : 'border-white/40'
              }`}>
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
              
              <p className={`text-body-md transition-colors ${
                isChecked ? 'text-white font-medium' : 'text-pearl-white/80'
              }`}>
                {affirmation}
              </p>
            </div>
          </motion.div>
        )
      })}
      
      <div className="mt-4 p-3 bg-info-blue/20 border border-info-blue/30 rounded-lg">
        <p className="text-info-blue text-sm">
          💡 Dica: Leia cada afirmação em voz alta com convicção para potencializar o efeito.
        </p>
      </div>
    </div>
  )
}

export default AffirmationsChecklist