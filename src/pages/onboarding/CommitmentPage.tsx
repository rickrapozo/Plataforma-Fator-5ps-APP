import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../stores/useAppStore'

const CommitmentPage: React.FC = () => {
  const navigate = useNavigate()
  const { completeOnboarding } = useAppStore()

  const handleCommitment = () => {
    // Mock onboarding results
    const mockResults = {
      thought: 75,
      feeling: 60,
      emotion: 80,
      action: 55,
      result: 70,
      completedAt: new Date().toISOString()
    }
    
    completeOnboarding(mockResults)
    navigate('/app/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 max-w-md text-center"
      >
        <h2 className="text-white text-2xl font-heading font-bold mb-4">
          Seu Compromisso
        </h2>
        <p className="text-pearl-white/80 text-body-md mb-6">
          Comprometa-se com sua transformação pessoal
        </p>
        <motion.button
          onClick={handleCommitment}
          className="w-full bg-gradient-to-r from-royal-gold to-bright-gold text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
          whileTap={{ scale: 0.98 }}
        >
          <span>Aceitar compromisso</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  )
}

export default CommitmentPage