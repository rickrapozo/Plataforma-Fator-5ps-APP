import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import Logo from '../../components/shared/Logo'
import NamePopup from '../../components/shared/NamePopup'
import { getCapitalizedFirstName, capitalizeName } from '../../utils/nameUtils'

const WelcomePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [showNamePopup, setShowNamePopup] = useState(false)
  const [userName, setUserName] = useState('')
  const [pageLoaded, setPageLoaded] = useState(false)

  const firstName = getCapitalizedFirstName(userName || user?.name || '')

  useEffect(() => {
    // Verifica se já temos o nome do usuário
    const storedName = localStorage.getItem('userName')
    if (storedName) {
      setUserName(storedName)
      setPageLoaded(true)
    } else {
      // Mostra o popup após um pequeno delay
      setTimeout(() => {
        setShowNamePopup(true)
      }, 500)
    }
  }, [])

  const handleNameSubmit = (name: string) => {
    const capitalizedName = capitalizeName(name)
    setUserName(capitalizedName)
    localStorage.setItem('userName', capitalizedName)
    setShowNamePopup(false)
    setTimeout(() => {
      setPageLoaded(true)
    }, 300)
  }

  return (
    <>
      <NamePopup 
        isOpen={showNamePopup} 
        onSubmit={handleNameSubmit}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-sage-green flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: pageLoaded ? 1 : 0, y: pageLoaded ? 0 : 20 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-lg text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: pageLoaded ? 1 : 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="mb-8"
          >
            <Logo />
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: pageLoaded ? 1 : 0, y: pageLoaded ? 0 : 20 }}
            transition={{ delay: 0.4 }}
            className="space-y-6 mb-12"
          >
            <h1 className="text-white text-4xl font-heading font-bold">
              {firstName ? `Olá, ${firstName}!` : 'Descubra Seu Potencial'} ✨
            </h1>
            
            <p className="text-pearl-white/90 text-lg leading-relaxed">
              Você está prestes a descobrir exatamente o que está impedindo seu 
              <span className="text-royal-gold font-semibold"> crescimento pessoal </span>
              e como transformar sua vida com o método científico dos 5Ps.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            onClick={() => navigate('/quiz/welcome')}
            className="w-full bg-gradient-to-r from-royal-gold to-bright-gold text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-3 hover:shadow-2xl transition-all mb-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: pageLoaded ? 1 : 0, y: pageLoaded ? 0 : 20 }}
            transition={{ delay: 0.6 }}
          >
            <span>FAZER MEU DIAGNÓSTICO GRATUITO</span>
            <ArrowRight className="w-6 h-6" />
          </motion.button>

          {/* Diagnostic Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: pageLoaded ? 1 : 0, y: pageLoaded ? 0 : 20 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <div className="bg-royal-gold/20 border border-royal-gold/30 rounded-lg p-4">
              <p className="text-royal-gold font-semibold text-sm">
                🎯 DIAGNÓSTICO GRATUITO • Mais de 10.000 pessoas já transformaram suas vidas
              </p>
            </div>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: pageLoaded ? 1 : 0, y: pageLoaded ? 0 : 20 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-8 mb-8"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-royal-gold" />
                <h3 className="text-white font-heading font-semibold text-lg">
                  O que você vai descobrir:
                </h3>
              </div>
              
              <div className="grid gap-4 text-left">
                {[
                  'Descubra exatamente o que bloqueia seu crescimento',
                  'Identifique seus pontos fortes e fracos reais',
                  'Receba um plano de ação personalizado e científico',
                  'Acesse estratégias que realmente funcionam'
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: pageLoaded ? 1 : 0, x: pageLoaded ? 0 : -20 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-royal-gold rounded-full" />
                    <p className="text-pearl-white/90 text-body-md">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: pageLoaded ? 1 : 0 }}
            transition={{ delay: 1.4 }}
            className="text-center mt-6 space-y-2"
          >
            <p className="text-pearl-white/90 text-sm font-semibold">
              ⏱️ Apenas 5 minutos • 100% Gratuito • Resultados Imediatos
            </p>
            <p className="text-pearl-white/60 text-xs">
              Mais de 10.000 pessoas já descobriram seus bloqueios e transformaram suas vidas
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

export default WelcomePage