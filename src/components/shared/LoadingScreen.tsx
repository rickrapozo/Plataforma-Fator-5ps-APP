import React from 'react'
import { motion } from 'framer-motion'
import Logo from './Logo'

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Logo />
        
        <motion.div
          className="mt-8 flex justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-8 h-8 border-4 border-royal-gold border-t-transparent rounded-full" />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-pearl-white/80 text-body-md mt-4"
        >
          Carregando sua jornada...
        </motion.p>
      </motion.div>
    </div>
  )
}

export default LoadingScreen