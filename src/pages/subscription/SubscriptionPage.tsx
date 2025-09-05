import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Gift, Star, Quote, Crown, Sparkles, Shield, Zap } from 'lucide-react'

const SubscriptionPage: React.FC = () => {
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('yearly')

  const plans = [
    {
      id: 'basic',
      name: 'Plano Básico',
      price: { monthly: 9.99, yearly: 99.90 },
      features: [
        'Protocolo Diário 5P completo',
        'Uma Jornada Guiada',
        'Biblioteca básica de áudios',
        'Progresso e estatísticas',
        'Suporte por email'
      ],
      color: 'from-sage-green to-forest-green',
      popular: false
    },
    {
      id: 'complete',
      name: 'Plano Completo',
      price: { monthly: 19.97, yearly: 199.70 },
      features: [
        'Tudo do Plano Básico',
        '🌟 Terapeuta Essencial AI ilimitado',
        'Todas as Jornadas Guiadas',
        'Biblioteca completa de áudios',
        'Análises avançadas de progresso',
        'Relatórios personalizados',
        'Suporte prioritário'
      ],
      color: 'from-royal-gold to-bright-gold',
      popular: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-sage-green p-4 pb-24 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sage-green/20 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-mint-accent/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-royal-gold/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-bright-gold/5 rounded-full blur-2xl animate-bounce"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
           className="inline-flex items-center space-x-2 bg-gradient-to-r from-sage-green/30 to-mint-accent/30 backdrop-blur-sm border border-royal-gold/30 rounded-full px-6 py-2 mb-6"
         >
           <Crown className="w-5 h-5 text-royal-gold" />
           <span className="text-royal-gold font-semibold text-sm">PLANOS PREMIUM</span>
           <Sparkles className="w-4 h-4 text-bright-gold" />
         </motion.div>
        
        <h1 className="text-white text-4xl md:text-5xl font-heading font-bold mb-6 bg-gradient-to-r from-pearl-white via-gold-shimmer to-bright-gold bg-clip-text text-transparent">
           Transforme Sua Vida
         </h1>
         <p className="text-pearl-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
           Invista em você mesmo e desbloqueie seu potencial máximo com nossa plataforma premium de desenvolvimento pessoal
         </p>
      </motion.div>

      {/* Premium Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center mb-12"
      >
        <div className="bg-gradient-to-r from-forest-green/80 to-sage-green/80 backdrop-blur-xl p-1.5 rounded-2xl border border-royal-gold/20 shadow-2xl">
          <button
            className={`px-8 py-3 rounded-xl transition-all duration-300 font-semibold relative ${
               selectedBilling === 'monthly'
                 ? 'bg-gradient-to-r from-royal-gold to-bright-gold text-white shadow-lg transform scale-105'
                 : 'text-pearl-white/80 hover:text-white hover:bg-white/5'
             }`}
            onClick={() => setSelectedBilling('monthly')}
          >
            {selectedBilling === 'monthly' && (
               <motion.div
                 layoutId="billing-bg"
                 className="absolute inset-0 bg-gradient-to-r from-royal-gold to-bright-gold rounded-xl"
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
               />
             )}
            <span className="relative z-10">Mensal</span>
          </button>
          <button
            className={`px-8 py-3 rounded-xl transition-all duration-300 font-semibold relative ${
               selectedBilling === 'yearly'
                 ? 'bg-gradient-to-r from-royal-gold to-bright-gold text-white shadow-lg transform scale-105'
                 : 'text-pearl-white/80 hover:text-white hover:bg-white/5'
             }`}
            onClick={() => setSelectedBilling('yearly')}
          >
            {selectedBilling === 'yearly' && (
               <motion.div
                 layoutId="billing-bg"
                 className="absolute inset-0 bg-gradient-to-r from-royal-gold to-bright-gold rounded-xl"
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
               />
             )}
            <span className="relative z-10">Anual</span>
            <motion.span 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="absolute -top-3 -right-3 bg-gradient-to-r from-bright-gold to-royal-gold text-deep-forest text-xs font-bold px-3 py-1 rounded-full shadow-lg z-30"
             >
               <Sparkles className="w-3 h-3 inline mr-1" />
               -17%
             </motion.span>
          </button>
        </div>
      </motion.div>

      {/* Premium Plans Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.2, type: "spring", stiffness: 100 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className={`relative h-fit group ${
              plan.popular 
                ? 'bg-gradient-to-br from-forest-green/40 via-sage-green/40 to-deep-forest/40 backdrop-blur-xl border-2 border-royal-gold/50 shadow-2xl shadow-royal-gold/25' 
                : 'bg-gradient-to-br from-deep-forest/60 via-forest-green/60 to-sage-green/60 backdrop-blur-xl border border-mint-accent/30 shadow-xl'
            } rounded-3xl p-8 transition-all duration-500`}
          >
            {/* Premium Glow Effect */}
            {plan.popular && (
              <div className="absolute inset-0 bg-gradient-to-r from-royal-gold/10 via-bright-gold/10 to-royal-gold/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            )}
            
            {plan.popular && (
              <motion.div 
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-royal-gold via-bright-gold to-gold-shimmer text-deep-forest px-6 py-2 text-sm font-bold rounded-2xl shadow-lg transform rotate-3 z-30"
              >
                <div className="flex items-center space-x-1">
                  <Crown className="w-4 h-4" />
                  <span>MAIS POPULAR</span>
                  <Sparkles className="w-3 h-3" />
                </div>
              </motion.div>
            )}

            <div className="relative z-10 space-y-8">
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-royal-gold/30 to-bright-gold/30 border border-royal-gold/30' 
                      : 'bg-forest-green/50 border border-sage-green/30'
                  }`}
                >
                  {plan.popular ? (
                    <><Crown className="w-4 h-4 text-royal-gold" /><span className="text-royal-gold font-semibold text-sm">PREMIUM</span></>
                  ) : (
                    <><Shield className="w-4 h-4 text-mint-accent" /><span className="text-mint-accent font-semibold text-sm">ESSENCIAL</span></>
                  )}
                </motion.div>
                
                <h3 className={`font-heading font-bold text-2xl mb-4 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-pearl-white via-gold-shimmer to-bright-gold bg-clip-text text-transparent' 
                    : 'text-white'
                }`}>
                  {plan.name}
                </h3>
                
                <div className="mb-6">
                  <div className="flex items-baseline justify-center space-x-2 mb-2">
                    <span className={`text-5xl font-bold ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-pearl-white to-gold-shimmer bg-clip-text text-transparent' 
                        : 'text-white'
                    }`}>
                      R$ {plan.price[selectedBilling].toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-lg text-gray-400">
                      /{selectedBilling === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  {selectedBilling === 'yearly' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-gray-400 bg-slate-800/50 rounded-full px-3 py-1 inline-block"
                    >
                      R$ {(plan.price.yearly / 12).toFixed(2).replace('.', ',')} por mês
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + featureIndex * 0.1 }}
                    className="flex items-start space-x-3 group"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-royal-gold to-bright-gold' 
                        : 'bg-gradient-to-r from-sage-green to-forest-green'
                    }`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-200 text-sm leading-relaxed group-hover:text-white transition-colors duration-200">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden group ${
                  plan.popular
                    ? 'bg-gradient-to-r from-royal-gold via-bright-gold to-royal-gold text-white shadow-2xl shadow-royal-gold/25 hover:shadow-royal-gold/40'
                    : 'bg-gradient-to-r from-forest-green to-sage-green text-white hover:from-sage-green hover:to-mint-accent shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-r from-royal-gold/20 via-bright-gold/20 to-royal-gold/20 group-hover:from-royal-gold/30 group-hover:via-bright-gold/30 group-hover:to-royal-gold/30 transition-all duration-300"></div>
                )}
                <div className="relative z-10 flex items-center justify-center space-x-2">
                  {plan.popular ? (
                    <><Zap className="w-5 h-5" /><span>Começar Agora</span><Sparkles className="w-4 h-4" /></>
                  ) : (
                    <><Shield className="w-5 h-5" /><span>Escolher Plano</span></>
                  )}
                </div>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Benefits Breakdown Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 mb-8 max-w-5xl mx-auto px-4"
      >
        <h3 className="text-white font-heading font-bold text-2xl text-center mb-8">
          Compare os Benefícios
        </h3>
        
        <div className="space-y-8">
          {/* Basic Plan Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-sage-green to-forest-green rounded-full"></div>
              <h4 className="text-white font-heading font-bold text-xl">Plano Básico - Ideal para Iniciantes</h4>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-pearl-white font-semibold text-sm mb-1">Protocolo Diário 5P Completo</h5>
                    <p className="text-pearl-white/70 text-xs">Transforme seus dias com nossa metodologia comprovada de 5 pilares para bem-estar mental e físico</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-pearl-white font-semibold text-sm mb-1">Uma Jornada Guiada</h5>
                    <p className="text-pearl-white/70 text-xs">Acesso a uma jornada completa de autoconhecimento com exercícios práticos e reflexões profundas</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-pearl-white font-semibold text-sm mb-1">Biblioteca Básica de Áudios</h5>
                    <p className="text-pearl-white/70 text-xs">Meditações guiadas, relaxamentos e áudios motivacionais para diferentes momentos do seu dia</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-pearl-white font-semibold text-sm mb-1">Progresso e Estatísticas</h5>
                    <p className="text-pearl-white/70 text-xs">Acompanhe sua evolução com gráficos detalhados, streaks e conquistas que motivam sua jornada</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-pearl-white font-semibold text-sm mb-1">Suporte por Email</h5>
                    <p className="text-pearl-white/70 text-xs">Nossa equipe está sempre pronta para ajudar você em sua jornada de transformação pessoal</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Complete Plan Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6 ring-2 ring-royal-gold/50"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-royal-gold to-bright-gold rounded-full"></div>
              <h4 className="text-white font-heading font-bold text-xl">Plano Completo - Transformação Total</h4>
              <div className="bg-royal-gold text-white px-3 py-1 text-xs font-bold rounded-full">RECOMENDADO</div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-pearl-white font-semibold text-sm mb-1">Tudo do Plano Básico +</h5>
                    <p className="text-pearl-white/70 text-xs">Todos os recursos fundamentais para começar sua jornada de transformação</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-royal-gold text-lg">🌟</span>
                  </div>
                  <div>
                    <h5 className="text-pearl-white font-semibold text-sm mb-1">Terapeuta Essencial AI Ilimitado</h5>
                    <p className="text-pearl-white/70 text-xs">Conversas ilimitadas com nossa IA especializada em bem-estar, disponível 24/7 para te apoiar</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-pearl-white font-semibold text-sm mb-1">Todas as Jornadas Guiadas</h5>
                    <p className="text-pearl-white/70 text-xs">Acesso completo a todas as jornadas: ansiedade, autoestima, relacionamentos, propósito e mais</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-pearl-white font-semibold text-sm mb-1">Biblioteca Completa de Áudios</h5>
                    <p className="text-pearl-white/70 text-xs">Mais de 100 áudios premium: meditações avançadas, hipnose, sons da natureza e muito mais</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-pearl-white font-semibold text-sm mb-1">Análises Avançadas de Progresso</h5>
                    <p className="text-pearl-white/70 text-xs">Insights profundos sobre seus padrões, tendências e áreas de crescimento com IA</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-pearl-white font-semibold text-sm mb-1">Relatórios Personalizados</h5>
                    <p className="text-pearl-white/70 text-xs">Relatórios semanais e mensais personalizados com recomendações específicas para você</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-pearl-white font-semibold text-sm mb-1">Suporte Prioritário</h5>
                    <p className="text-pearl-white/70 text-xs">Atendimento prioritário com resposta em até 2 horas e acesso direto aos especialistas</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-royal-gold/10 rounded-lg border border-royal-gold/20">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-royal-gold text-lg">💎</span>
                <h6 className="text-royal-gold font-semibold text-sm">Exclusivo do Plano Completo</h6>
              </div>
              <p className="text-pearl-white/80 text-xs">
                Acesso antecipado a novos recursos, workshops exclusivos mensais e comunidade VIP de membros premium
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 mb-8 max-w-4xl mx-auto px-4"
      >
        <h3 className="text-white font-heading font-bold text-2xl text-center mb-8">
          O que nossos usuários dizem
        </h3>
        
        <div className="space-y-6">
          {/* Testimonial 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-royal-gold to-bright-gold rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-royal-gold fill-current" />
                    ))}
                  </div>
                </div>
                <Quote className="w-6 h-6 text-royal-gold/60 mb-2" />
                <p className="text-pearl-white/90 text-sm mb-3 italic">
                  "Em apenas 3 semanas usando o Protocolo 5P, consegui quebrar um ciclo de ansiedade que me acompanhava há anos. O Terapeuta AI me ajudou a entender padrões que eu nem percebia. Hoje me sinto mais equilibrada e confiante."
                </p>
                <div className="text-pearl-white/70 text-xs">
                  <span className="font-semibold">Maria Silva</span> • Empresária • São Paulo
                </div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial 2 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-sage-green to-forest-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-royal-gold fill-current" />
                    ))}
                  </div>
                </div>
                <Quote className="w-6 h-6 text-royal-gold/60 mb-2" />
                <p className="text-pearl-white/90 text-sm mb-3 italic">
                  "A plataforma transformou minha rotina matinal. O protocolo diário me deu estrutura e propósito. Minha produtividade aumentou 300% e finalmente consegui equilibrar trabalho e vida pessoal. Recomendo para todos!"
                </p>
                <div className="text-pearl-white/70 text-xs">
                  <span className="font-semibold">Roberto Santos</span> • Desenvolvedor • Rio de Janeiro
                </div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial 3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="glass-card p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-royal-gold to-bright-gold rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-royal-gold fill-current" />
                    ))}
                  </div>
                </div>
                <Quote className="w-6 h-6 text-royal-gold/60 mb-2" />
                <p className="text-pearl-white/90 text-sm mb-3 italic">
                  "Depois de meses tentando diferentes abordagens para melhorar meu bem-estar, encontrei na plataforma a solução completa. As jornadas guiadas me ajudaram a superar traumas antigos e hoje vivo com mais leveza e gratidão."
                </p>
                <div className="text-pearl-white/70 text-xs">
                  <span className="font-semibold">Ana Costa</span> • Psicóloga • Belo Horizonte
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Premium Trial Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-gradient-to-r from-sage-green/40 via-forest-green/40 to-sage-green/40 backdrop-blur-xl border border-royal-gold/30 rounded-3xl p-8 text-center mt-12 shadow-2xl shadow-royal-gold/10 max-w-4xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-gradient-to-r from-royal-gold to-bright-gold rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <Gift className="w-8 h-8 text-white" />
        </motion.div>
        
        <h4 className="text-white font-heading font-bold text-2xl mb-4 bg-gradient-to-r from-gold-shimmer to-bright-gold bg-clip-text text-transparent">
          🎁 7 Dias Completamente Grátis
        </h4>
        
        <p className="text-pearl-white/80 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
          Experimente todos os recursos premium sem compromisso. Acesso total à plataforma, 
          Terapeuta AI ilimitado e todas as jornadas guiadas.
        </p>
        
        <div className="flex items-center justify-center space-x-6 text-sm text-pearl-white/60">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-royal-gold" />
            <span>Sem cartão de crédito</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-bright-gold" />
            <span>Cancele quando quiser</span>
          </div>
        </div>
      </motion.div>
      
      </div> {/* Close relative z-10 container */}
    </div>
  )
}

export default SubscriptionPage