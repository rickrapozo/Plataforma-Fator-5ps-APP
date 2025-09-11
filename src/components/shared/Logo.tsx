import React from 'react'
import { motion } from 'framer-motion'

const Logo: React.FC = () => {
  return (
    <motion.div 
      className="flex items-center justify-center w-full"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-center flex flex-col items-center justify-center w-full">
        <h1 className="text-white font-heading font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-center w-full">
          Fator Essencial
        </h1>
        <p className="text-gold-shimmer text-xs sm:text-sm lg:text-base font-medium text-center w-full">
          Método 5Ps Plataforma AI
        </p>
      </div>
    </motion.div>
  )
}

export default Logo