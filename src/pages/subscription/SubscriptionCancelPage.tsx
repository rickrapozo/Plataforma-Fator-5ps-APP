import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { XCircle, ArrowLeft, RefreshCw, MessageCircle, Heart } from 'lucide-react'

const SubscriptionCancelPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-sage-green p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sage-green/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="relative z-10 max-w-4xl mx-auto pt-20">
        {/* Cancel Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6 shadow-2xl"
          >
            <XCircle className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white text-4xl md:text-5xl font-heading font-bold mb-4"
          >
            Pagamento Cancelado
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-pearl-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Não se preocupe! Seu pagamento foi cancelado e nenhuma cobrança foi realizada.
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 mb-8 max-w-2xl mx-auto text-center"
        >
          <h2 className="text-white text-2xl font-heading font-bold mb-6">O que aconteceu?</h2>
          
          <div className="space-y-4 text-pearl-white/80 mb-8">
            <p>Você cancelou o processo de pagamento antes da conclusão.</p>
            <p>Nenhuma cobrança foi realizada em seu cartão ou conta.</p>
            <p>Você ainda pode acessar todos os recursos gratuitos da plataforma.</p>
          </div>

          <div className="bg-royal-gold/10 border border-royal-gold/30 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Heart className="w-5 h-5 text-royal-gold" />
              <h3 className="text-royal-gold font-semibold">Ainda interessado no Premium?</h3>
            </div>
            <p className="text-pearl-white/70 text-sm">
              Você pode tentar novamente a qualquer momento. Nossos planos premium oferecem acesso completo 
              a todas as funcionalidades, incluindo terapeuta AI ilimitado e análises avançadas.
            </p>
          </div>
        </motion.div>

        {/* Reasons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8 mb-8"
        >
          <h2 className="text-white text-2xl font-heading font-bold mb-6 text-center">Motivos Comuns para Cancelamento</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-royal-gold rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Precisa de mais tempo para decidir?</h3>
                  <p className="text-pearl-white/70 text-sm">Explore mais nossos recursos gratuitos primeiro.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-royal-gold rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Problemas técnicos?</h3>
                  <p className="text-pearl-white/70 text-sm">Nossa equipe pode ajudar a resolver qualquer dificuldade.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-royal-gold rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Dúvidas sobre o plano?</h3>
                  <p className="text-pearl-white/70 text-sm">Fale conosco para esclarecer qualquer questão.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-royal-gold rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Cancelou por engano?</h3>
                  <p className="text-pearl-white/70 text-sm">Você pode tentar novamente quando quiser.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/subscription')}
            className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-royal-gold to-bright-gold text-white font-bold rounded-2xl shadow-2xl shadow-royal-gold/25 hover:shadow-royal-gold/40 transition-all duration-300"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Tentar Novamente</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </motion.button>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-6 max-w-2xl mx-auto text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageCircle className="w-6 h-6 text-royal-gold" />
            <h3 className="text-white text-xl font-semibold">Precisa de Ajuda?</h3>
          </div>
          
          <p className="text-pearl-white/70 mb-6">
            Nossa equipe está aqui para ajudar! Se você teve algum problema durante o processo de pagamento 
            ou tem dúvidas sobre nossos planos, não hesite em entrar em contato.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-2 bg-royal-gold/20 text-royal-gold font-medium rounded-lg hover:bg-royal-gold/30 transition-colors">
              Chat de Suporte
            </button>
            <button className="px-6 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors">
              Enviar E-mail
            </button>
          </div>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 text-pearl-white/60"
        >
          <p>Obrigado por considerar o Essential Factor 5P Premium!</p>
          <p className="text-sm mt-2">Estamos aqui quando você estiver pronto para dar o próximo passo.</p>
        </motion.div>
      </div>
    </div>
  )
}

export default SubscriptionCancelPage