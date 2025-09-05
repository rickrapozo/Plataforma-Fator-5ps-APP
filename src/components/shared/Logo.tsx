import React from 'react'
import { motion } from 'framer-motion'

const Logo: React.FC = () => {
  return (
    <motion.div 
      className="flex items-center justify-center space-x-3"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-royal-gold to-bright-gold rounded-lg flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg">5P</span>
      </div>
      <div className="text-left">
        <h1 className="text-white font-heading font-bold text-lg leading-tight">
          Fator Essencial
        </h1>
        <p className="text-gold-shimmer text-xs font-medium">
          Método 5Ps Plataforma
        </p>
      </div>
    </motion.div>
  )
}

export default Logo