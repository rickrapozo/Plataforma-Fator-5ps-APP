import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

const JourneyDayPage: React.FC = () => {
  const navigate = useNavigate()
  const { journeyId, dayNumber } = useParams()

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/app/journeys')}
          className="flex items-center space-x-2 text-pearl-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar às jornadas</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 text-center"
      >
        <h1 className="text-white text-2xl font-heading font-bold mb-4">
          Jornada: {journeyId}
        </h1>
        <h2 className="text-royal-gold text-xl font-semibold mb-6">
          Dia {dayNumber}
        </h2>
        <p className="text-pearl-white/80 text-body-md">
          Conteúdo do dia será implementado em breve
        </p>
      </motion.div>
    </div>
  )
}

export default JourneyDayPage