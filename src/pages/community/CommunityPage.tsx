import React from 'react'
import { motion } from 'framer-motion'
import { Users, Sparkles } from 'lucide-react'
import CommunityHub from '../../components/community/CommunityHub'
import { useAppStore } from '../../stores/useAppStore'

const CommunityPage: React.FC = () => {
  const { user } = useAppStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-deep-forest">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-royal-gold/30 rounded-full"
            animate={{
              y: [-20, -100],
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%'
            }}
          />
        ))}
        
        {/* Neural network lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[...Array(8)].map((_, i) => (
            <motion.line
              key={i}
              x1={Math.random() * 100 + '%'}
              y1={Math.random() * 100 + '%'}
              x2={Math.random() * 100 + '%'}
              y2={Math.random() * 100 + '%'}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 1
              }}
            />
          ))}
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 pb-6 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="p-4 bg-gradient-to-r from-royal-gold to-amber-500 rounded-2xl mr-4"
              >
                <Users className="w-8 h-8 text-deep-forest" />
              </motion.div>
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Comunidade
                  <span className="bg-gradient-to-r from-royal-gold to-amber-500 bg-clip-text text-transparent ml-3">
                    5Ps
                  </span>
                </h1>
                <p className="text-pearl-white/80 text-lg">
                  Onde Transformadores se conectam e evoluem juntos
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="text-3xl font-bold text-royal-gold"
                  >
                    1,247
                  </motion.div>
                  <p className="text-pearl-white/70 text-sm">Transformadores Ativos</p>
                </div>
                <div className="space-y-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="text-3xl font-bold text-royal-gold"
                  >
                    23
                  </motion.div>
                  <p className="text-pearl-white/70 text-sm">Desafios Ativos</p>
                </div>
                <div className="space-y-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                    className="text-3xl font-bold text-royal-gold"
                  >
                    89%
                  </motion.div>
                  <p className="text-pearl-white/70 text-sm">Taxa de Conclusão</p>
                </div>
                <div className="space-y-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="text-3xl font-bold text-royal-gold"
                  >
                    156k
                  </motion.div>
                  <p className="text-pearl-white/70 text-sm">XP Distribuído</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Community Hub */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="px-6 pb-12"
        >
          <div className="max-w-7xl mx-auto">
            <CommunityHub />
          </div>
        </motion.div>

        {/* Floating Action Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          className="fixed bottom-8 right-8 z-20"
        >
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className="p-4 bg-gradient-to-r from-royal-gold to-amber-500 rounded-full shadow-2xl hover:shadow-royal-gold/25 transition-all duration-300"
            title="Criar Novo Desafio"
          >
            <Sparkles className="w-6 h-6 text-deep-forest" />
          </motion.button>
        </motion.div>
      </div>

      {/* Glass morphism overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-deep-forest/50 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}

export default CommunityPage