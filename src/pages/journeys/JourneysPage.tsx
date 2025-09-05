import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Star, Lock } from 'lucide-react'

const JourneysPage: React.FC = () => {
  const journeys = [
    {
      id: 'abundance-21',
      title: 'Jornada da Abundância',
      subtitle: '21 dias para reprogramar sua mente para a prosperidade',
      description: 'Transforme sua relação com o dinheiro e abra-se para oportunidades infinitas',
      duration: '21 dias',
      difficulty: 'Intermediário',
      color: 'from-royal-gold to-bright-gold',
      progress: 0,
      isUnlocked: true,
      icon: '💰'
    },
    {
      id: 'confidence-21',
      title: 'Jornada da Confiança',
      subtitle: '21 dias para desenvolver autoestima inabalável',
      description: 'Elimine crenças limitantes e desenvolva uma confiança genuína em si mesmo',
      duration: '21 dias',
      difficulty: 'Iniciante',
      color: 'from-sage-green to-forest-green',
      progress: 0,
      isUnlocked: false,
      requiresPremium: true,
      icon: '💪'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-white text-3xl font-heading font-bold mb-4">
          Jornadas Guiadas
        </h1>
        <p className="text-pearl-white/80 text-body-lg">
          Transformação estruturada em 21 dias
        </p>
      </motion.div>

      <div className="space-y-6">
        {journeys.map((journey, index) => (
          <motion.div
            key={journey.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-6 relative overflow-hidden ${
              !journey.isUnlocked ? 'opacity-75' : ''
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${journey.color} opacity-10`} />
            
            {/* Lock Overlay */}
            {!journey.isUnlocked && (
              <div className="absolute top-4 right-4">
                <div className="bg-royal-gold rounded-full p-2">
                  <Lock className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            
            <div className="relative z-10">
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{journey.icon}</div>
                
                <div className="flex-1">
                  <h3 className="text-white font-heading font-bold text-xl mb-2">
                    {journey.title}
                  </h3>
                  <p className="text-royal-gold font-medium text-sm mb-2">
                    {journey.subtitle}
                  </p>
                  <p className="text-pearl-white/80 text-body-md mb-4">
                    {journey.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-pearl-white/60" />
                      <span className="text-pearl-white/80">{journey.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-pearl-white/60" />
                      <span className="text-pearl-white/80">{journey.difficulty}</span>
                    </div>
                  </div>
                  
                  {journey.progress > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-pearl-white/80">Progresso</span>
                        <span className="text-royal-gold">{journey.progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${journey.color} h-2 rounded-full`}
                          style={{ width: `${journey.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <motion.button
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    journey.isUnlocked
                      ? `bg-gradient-to-r ${journey.color} text-white hover:shadow-lg`
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                  whileTap={journey.isUnlocked ? { scale: 0.98 } : {}}
                  disabled={!journey.isUnlocked}
                >
                  {journey.isUnlocked 
                    ? journey.progress > 0 
                      ? 'Continuar jornada' 
                      : 'Iniciar jornada'
                    : journey.requiresPremium 
                      ? 'Requer plano Premium' 
                      : 'Bloqueado'
                  }
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default JourneysPage