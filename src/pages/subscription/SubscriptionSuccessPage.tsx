import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Crown, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAppStore } from '../../stores/useAppStore'
import { paymentService } from '../../services/paymentService'

const SubscriptionSuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loadUserData } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !user) {
        setLoading(false)
        return
      }

      try {
        // Aguarda um pouco para o webhook processar
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Atualiza dados do usuário
        await loadUserData()
        
        // Obtém status da assinatura
        const status = await paymentService.getSubscriptionStatus(user.id)
        setSubscriptionStatus(status)
        
        toast.success('🎉 Pagamento processado com sucesso!')
      } catch (error) {
        console.error('❌ Erro ao verificar pagamento:', error)
        toast.error('Erro ao verificar status do pagamento')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId, user, loadUserData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-sage-green flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center max-w-md mx-4"
        >
          <Loader2 className="w-12 h-12 text-royal-gold animate-spin mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Processando Pagamento</h2>
          <p className="text-pearl-white/70">Aguarde enquanto confirmamos sua assinatura...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-sage-green p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sage-green/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="relative z-10 max-w-4xl mx-auto pt-20">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-success-green to-mint-accent rounded-full mb-6 shadow-2xl"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white text-4xl md:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-pearl-white via-gold-shimmer to-bright-gold bg-clip-text text-transparent"
          >
            Bem-vindo ao Premium!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-pearl-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Sua assinatura foi ativada com sucesso. Agora você tem acesso completo a todos os recursos premium!
          </motion.p>
        </motion.div>

        {/* Subscription Details */}
        {subscriptionStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-8 mb-8 max-w-2xl mx-auto"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Crown className="w-8 h-8 text-royal-gold" />
              <h2 className="text-white text-2xl font-heading font-bold">Detalhes da Assinatura</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-pearl-white font-semibold mb-2">Plano Ativo</h3>
                <p className="text-royal-gold text-lg font-bold">{subscriptionStatus.plan}</p>
              </div>
              
              <div>
                <h3 className="text-pearl-white font-semibold mb-2">Status</h3>
                <span className="inline-flex items-center space-x-2 px-3 py-1 bg-success-green/20 text-success-green rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Ativo</span>
                </span>
              </div>
              
              <div>
                <h3 className="text-pearl-white font-semibold mb-2">Próxima Cobrança</h3>
                <p className="text-pearl-white/80">
                  {new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div>
                <h3 className="text-pearl-white font-semibold mb-2">Gerenciar</h3>
                <button
                  onClick={async () => {
                    const portalUrl = await paymentService.updatePaymentMethod(user?.id || '')
                    if (portalUrl) {
                      window.open(portalUrl, '_blank')
                    }
                  }}
                  className="text-bright-gold hover:text-royal-gold transition-colors text-sm font-medium"
                >
                  Portal do Cliente →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Premium Features Unlocked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8 mb-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-white text-2xl font-heading font-bold mb-4">Recursos Desbloqueados</h2>
            <p className="text-pearl-white/70">Agora você tem acesso a todos estes benefícios premium:</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🤖',
                title: 'Terapeuta AI Ilimitado',
                description: 'Conversas ilimitadas com nossa IA especializada'
              },
              {
                icon: '🎯',
                title: 'Todas as Jornadas',
                description: 'Acesso completo a todas as jornadas guiadas'
              },
              {
                icon: '🎵',
                title: 'Biblioteca Completa',
                description: 'Todos os áudios de meditação e relaxamento'
              },
              {
                icon: '📊',
                title: 'Análises Avançadas',
                description: 'Relatórios detalhados do seu progresso'
              },
              {
                icon: '🏆',
                title: 'Relatórios Personalizados',
                description: 'Insights personalizados baseados nos seus dados'
              },
              {
                icon: '⚡',
                title: 'Suporte Prioritário',
                description: 'Atendimento prioritário com nossa equipe'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center p-4 bg-royal-gold/10 rounded-lg border border-royal-gold/20"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-pearl-white/70 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-royal-gold to-bright-gold text-white font-bold rounded-2xl shadow-2xl shadow-royal-gold/25 hover:shadow-royal-gold/40 transition-all duration-300"
          >
            <Sparkles className="w-5 h-5" />
            <span>Começar Jornada Premium</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            <span>Ver Perfil</span>
          </motion.button>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 text-pearl-white/60"
        >
          <p>Obrigado por escolher o Essential Factor 5P Premium!</p>
          <p className="text-sm mt-2">Sua jornada de transformação pessoal começa agora.</p>
        </motion.div>
      </div>
    </div>
  )
}

export default SubscriptionSuccessPage