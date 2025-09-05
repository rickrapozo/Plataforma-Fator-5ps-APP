import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Sparkles } from 'lucide-react'

interface NamePopupProps {
  isOpen: boolean
  onSubmit: (name: string) => void
}

const NamePopup = ({ isOpen, onSubmit }: NamePopupProps) => {
  const [name, setName] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      setIsAnimating(true)
      setTimeout(() => {
        onSubmit(name.trim())
      }, 500)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
        >
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2 leading-tight">
              Diagnóstico da<br />Mente Bloqueada
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-royal-gold to-bright-gold mx-auto rounded-full"></div>
          </motion.div>

          <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
          className="relative bg-gradient-to-br from-deep-forest via-forest-green to-sage-green p-8 rounded-2xl shadow-2xl max-w-md w-full border border-royal-gold/20 overflow-hidden"
        >
          {/* Background Particle Animation */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 400,
                  y: Math.random() * 300,
                  opacity: 0
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0, 0.4, 0]
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 3
                }}
                className="absolute w-1 h-1 bg-royal-gold/40 rounded-full"
              />
            ))}
            
            {/* Larger Particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`large-${i}`}
                initial={{ 
                  x: Math.random() * 350,
                  y: Math.random() * 250,
                  opacity: 0
                }}
                animate={{
                  y: [0, -40, 0],
                  x: [0, Math.random() * 30 - 15, 0],
                  opacity: [0, 0.2, 0],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 5 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 4
                }}
                className="absolute w-2 h-2 bg-royal-gold/20 rounded-full"
              />
            ))}
          </div>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 text-center mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-royal-gold/20 rounded-full mb-4"
              >
                <Sparkles className="w-8 h-8 text-royal-gold" />
              </motion.div>
              
              <h2 className="text-2xl font-heading font-bold text-white mb-2">
                Olá! Seu teste está prestes a começar ✨
              </h2>
              
              <p className="text-pearl-white/80 text-sm leading-relaxed">
                Antes de iniciarmos sua jornada de transformação,
                <br />
                <span className="text-royal-gold font-medium">qual é o seu nome?</span>
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              className="relative z-10 space-y-6"
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-royal-gold/60" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome aqui..."
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-royal-gold/30 rounded-lg text-white placeholder-pearl-white/50 focus:outline-none focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 transition-all duration-300"
                  autoFocus
                  maxLength={50}
                />
              </div>

              <motion.button
                type="submit"
                disabled={!name.trim() || isAnimating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  name.trim() && !isAnimating
                    ? 'bg-royal-gold text-deep-forest hover:bg-royal-gold/90 shadow-lg hover:shadow-royal-gold/20'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isAnimating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-5 h-5 border-2 border-deep-forest/30 border-t-deep-forest rounded-full"
                  />
                ) : (
                  'Começar minha jornada'
                )}
              </motion.button>
            </motion.form>

            {/* Decorative elements */}
            <motion.div
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-4 h-4 bg-royal-gold/40 rounded-full"
            />
            <motion.div
              animate={{ 
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-royal-gold/30 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NamePopup