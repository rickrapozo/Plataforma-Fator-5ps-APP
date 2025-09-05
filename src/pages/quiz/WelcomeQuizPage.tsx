import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Brain, Zap, Target, Eye } from 'lucide-react'
import Logo from '../../components/shared/Logo'
import { useState, useEffect } from 'react'
import { getCapitalizedFirstName } from '../../utils/nameUtils'

function WelcomeQuizPage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Recupera o nome do usuário do localStorage
    const storedName = localStorage.getItem('userName')
    if (storedName) {
      setUserName(storedName)
    }
  }, [])

  const firstName = getCapitalizedFirstName(userName)

  // Matrix-like animation for background
  const matrixChars = '01'.split('')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-deep-forest relative overflow-hidden">
      {/* Matrix Background Effect */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-royal-gold font-mono text-xs"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {matrixChars[Math.floor(Math.random() * matrixChars.length)]}
          </motion.div>
        ))}
      </div>

      {/* Neural Network Lines */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#neuralGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 3, delay: i * 0.2, repeat: Infinity, repeatType: "reverse" }}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full text-center space-y-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-12"
          >
            <Logo />
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-pearl-white leading-tight">
              Raio-X da
              <span className="block text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-royal-gold via-bright-gold to-royal-gold animate-pulse">
                Mente
              </span>
            </h1>
            
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-2xl md:text-3xl font-heading font-semibold text-royal-gold mb-8"
            >
              Descubra o Que Realmente Te Impede de Prosperar
            </motion.h2>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <p className="text-xl text-pearl-white/90 leading-relaxed">
              {firstName ? `${firstName}, você` : 'Você'} sente que está andando em círculos? Que uma força invisível te sabota bem na hora de alcançar seus maiores sonhos? 
              <span className="text-royal-gold font-semibold"> A resposta não está fora{firstName ? `, ${firstName}` : ''}. Está na sua programação.</span>
            </p>
            
            <div className="bg-forest-green/20 backdrop-blur-sm rounded-2xl p-8 border border-royal-gold/30">
              <p className="text-lg text-pearl-white/80 leading-relaxed">
                As <span className="text-royal-gold font-bold">10 perguntas</span> a seguir não são um teste de personalidade. 
                São engrenagens cruciais para um <span className="text-bright-gold font-semibold">diagnóstico preciso</span>, um mapa que revela as fissuras no seu sistema operacional interno.
              </p>
            </div>
            
            {/* Social Proof */}
            <div className="bg-gradient-to-r from-sage-green/20 to-forest-green/20 backdrop-blur-sm rounded-2xl p-6 border border-bright-gold/30">
              <p className="text-lg text-bright-gold font-semibold mb-2">✨ Mais de 10.000 pessoas já descobriram seus padrões limitantes</p>
              <p className="text-pearl-white/80 text-sm">"Finalmente entendi por que sempre sabotava meu sucesso. Este diagnóstico mudou minha vida!" - Maria S.</p>
            </div>
          </motion.div>

          {/* Method Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="bg-gradient-to-r from-royal-gold/10 to-bright-gold/10 backdrop-blur-sm rounded-2xl p-8 border border-royal-gold/40"
          >
            <div className="flex items-center justify-center mb-6">
              <Brain className="w-8 h-8 text-royal-gold mr-3" />
              <h3 className="text-2xl font-heading font-bold text-pearl-white">Método 5Ps</h3>
            </div>
            <p className="text-lg text-pearl-white/90 leading-relaxed">
              Baseado em neurociência o <span className="text-royal-gold font-semibold">Método 5Ps</span> (Pensamento, Sentimento, Emoção, Ação e Resultado), este raio-x irá identificar com <span className="text-bright-gold font-semibold">precisão cirúrgica</span> qual dos seus 5 pilares está desalinhado, mantendo você preso na escassez e na frustração de tentar tanto e nunca chegar a sua vez de ter sucesso na vida.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="grid md:grid-cols-3 gap-6 my-12"
          >
            {[
              {
                icon: Eye,
                title: 'Diagnóstico Preciso',
                description: 'Identificação exata do seu padrão limitante'
              },
              {
                icon: Target,
                title: 'Análise dos 5Ps',
                description: 'Mapeamento completo dos seus pilares internos'
              },
              {
                icon: Zap,
                title: 'Solução Personalizada',
                description: 'Plano específico para sua reprogramação'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + index * 0.1 }}
                className="bg-forest-green/20 backdrop-blur-sm rounded-xl p-6 border border-royal-gold/20 hover:border-royal-gold/40 transition-all duration-300 group"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <feature.icon className="w-10 h-10 text-royal-gold mx-auto mb-4 group-hover:text-bright-gold transition-colors" />
                <h4 className="text-pearl-white font-semibold mb-2 text-lg">{feature.title}</h4>
                <p className="text-pearl-white/70 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-lg text-pearl-white/80 max-w-2xl mx-auto leading-relaxed">
              Para começar sua jornada de libertação{firstName ? `, ${firstName}` : ''}, a <span className="text-royal-gold font-semibold">honestidade é a única chave</span>. 
              Não existem respostas certas ou erradas, apenas a sua verdade.
            </p>
            
            {/* Urgency Element */}
            <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/40 max-w-md mx-auto">
              <p className="text-orange-300 font-semibold text-sm">⚡ DIAGNÓSTICO GRATUITO POR TEMPO LIMITADO</p>
              <p className="text-pearl-white/80 text-xs mt-1">Normalmente R$ 97 - Hoje 100% GRÁTIS</p>
            </div>
            
            <p className="text-xl font-semibold text-bright-gold">
              {firstName ? `${firstName}, está` : 'Está'} pronto(a) para olhar no espelho e descobrir o código que rege a sua vida até hoje?
            </p>

            <motion.button
              onClick={() => navigate('/quiz/questions')}
              className="group relative overflow-hidden bg-gradient-to-r from-royal-gold to-bright-gold text-white py-6 px-12 rounded-2xl font-bold text-xl flex items-center justify-center space-x-4 hover:shadow-2xl transition-all duration-300 mx-auto"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(212, 175, 55, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-bright-gold to-royal-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">INICIAR MEU DIAGNÓSTICO</span>
              <ArrowRight className="w-7 h-7 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.6 }}
            className="text-pearl-white/60 text-sm mt-8 italic"
          >
            Este processo levará apenas 5 minutos e mudará sua vida para sempre.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default WelcomeQuizPage