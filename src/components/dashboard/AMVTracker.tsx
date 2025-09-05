import React from 'react'
import { motion } from 'framer-motion'
import { Check, Target } from 'lucide-react'

interface AMVTrackerProps {
  amv: string
  completed: boolean
  onUpdate: (amv: string, completed: boolean) => void
}

const AMVTracker: React.FC<AMVTrackerProps> = ({
  amv,
  completed,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-white text-sm font-medium">
          Qual é sua Ação Mínima Viável para hoje?
        </label>
        <textarea
          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-pearl-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-royal-gold resize-none"
          rows={3}
          placeholder="Ex: Enviar 3 currículos, fazer 30 min de exercício, ler 10 páginas..."
          value={amv}
          onChange={(e) => onUpdate(e.target.value, completed)}
        />
      </div>

      {amv && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/20"
        >
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-royal-gold" />
            <span className="text-white text-sm font-medium">
              Marcar como concluída
            </span>
          </div>
          
          <motion.button
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
              completed 
                ? 'bg-success-green border-success-green' 
                : 'border-white/40 hover:border-royal-gold'
            }`}
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdate(amv, !completed)}
          >
            {completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Check className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </motion.button>
        </motion.div>
      )}

      <div className="p-3 bg-warning-amber/20 border border-warning-amber/30 rounded-lg">
        <p className="text-warning-amber text-sm">
          ⚡ Lembre-se: pequenas ações consistentes geram grandes transformações!
        </p>
      </div>
    </div>
  )
}

export default AMVTracker