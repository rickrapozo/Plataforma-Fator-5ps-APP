import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { toast } from 'react-toastify'
import Logo from '../../components/shared/Logo'

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Por favor, insira um email válido')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Importar o AuthService dinamicamente para evitar problemas de importação circular
      const { AuthService } = await import('../../services/authService')
      
      await AuthService.resetPassword(email)
      setEmailSent(true)
      toast.success('Email de recuperação enviado!')
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error)
      
      let errorMessage = 'Erro ao enviar email. Tente novamente.'
      
      if (error.message?.includes('User not found')) {
        errorMessage = 'Email não encontrado em nossa base de dados.'
      } else if (error.message?.includes('Email rate limit exceeded')) {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-sage-green flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Logo />
          <motion.h1 
            className="text-white text-2xl font-heading font-bold mt-4 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {emailSent ? 'Email enviado!' : 'Recuperar senha'}
          </motion.h1>
          <motion.p 
            className="text-pearl-white/80 text-body-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {emailSent 
              ? 'Verifique sua caixa de entrada e siga as instruções'
              : 'Digite seu email para receber instruções de recuperação'
            }
          </motion.p>
        </div>

        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          {emailSent ? (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-16 h-16 mx-auto bg-success-green rounded-full flex items-center justify-center"
              >
                <Send className="w-8 h-8 text-white" />
              </motion.div>
              
              <div className="space-y-2">
                <p className="text-white font-medium">
                  Instruções enviadas para:
                </p>
                <p className="text-royal-gold font-semibold">
                  {email}
                </p>
              </div>
              
              <p className="text-pearl-white/80 text-sm">
                Não recebeu o email? Verifique sua pasta de spam ou tente novamente em alguns minutos.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pearl-white/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-pearl-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-royal-gold transition-all"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-royal-gold to-bright-gold text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar instruções</span>
                  </>
                )}
              </motion.button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-royal-gold hover:text-bright-gold font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao login</span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage