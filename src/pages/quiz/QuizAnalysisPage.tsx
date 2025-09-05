import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Brain, Cpu, Zap, Target, Eye, Loader2, ArrowRight, Check } from 'lucide-react'
import Logo from '../../components/shared/Logo'
import { getCapitalizedFirstName } from '../../utils/nameUtils'

function QuizAnalysisPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Recupera o nome do usuário do localStorage
    const storedName = localStorage.getItem('userName')
    if (storedName) {
      setUserName(storedName)
    }
  }, [])

  const firstName = getCapitalizedFirstName(userName)

  const handleViewResults = () => {
    navigate('/quiz/results')
  }

  const analysisSteps = [
    {
      icon: Brain,
      title: "Analisando Padrões de Pensamento",
      description: "Identificando crenças limitantes e autoimagem",
      duration: 2000
    },
    {
      icon: Eye,
      title: "Mapeando Sentimentos Profundos",
      description: "Avaliando relação com dinheiro e merecimento",
      duration: 2000
    },
    {
      icon: Zap,
      title: "Processando Padrões Emocionais",
      description: "Analisando medos e gestão da frustração",
      duration: 2000
    },
    {
      icon: Target,
      title: "Decodificando Ações e Comportamentos",
      description: "Examinando procrastinação e consistência",
      duration: 2000
    },
    {
      icon: Cpu,
      title: "Compilando Diagnóstico Final",
      description: "Gerando seu perfil personalizado dos 5Ps",
      duration: 3000
    }
  ]

  useEffect(() => {
    let stepTimer: NodeJS.Timeout
    let progressTimer: NodeJS.Timeout

    const runAnalysis = () => {
      if (currentStep < analysisSteps.length) {
        const step = analysisSteps[currentStep]
        
        // Progress animation for current step
        const progressIncrement = 100 / (step.duration / 50)
        let currentProgress = 0
        
        progressTimer = setInterval(() => {
          currentProgress += progressIncrement
          if (currentProgress >= 100) {
            currentProgress = 100
            clearInterval(progressTimer)
          }
          setProgress(currentProgress)
        }, 50)

        // Move to next step
        stepTimer = setTimeout(() => {
          if (currentStep < analysisSteps.length - 1) {
            setCurrentStep(currentStep + 1)
            setProgress(0)
          } else {
            setIsComplete(true)
          }
        }, step.duration)
      }
    }

    runAnalysis()

    return () => {
      clearTimeout(stepTimer)
      clearInterval(progressTimer)
    }
  }, [currentStep, navigate])

  const CurrentIcon = analysisSteps[currentStep]?.icon || Cpu

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-deep-forest relative overflow-hidden">
      {/* Matrix Background Effect */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-royal-gold font-mono text-xs"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5 + Math.random() * 1,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </motion.div>
        ))}
      </div>

      {/* Neural Network Animation */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#neuralGradient)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatType: "reverse" }}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full text-center space-y-12"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Logo />
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-pearl-white leading-tight">
              Processando Seu
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-royal-gold via-bright-gold to-royal-gold animate-pulse">
                Diagnóstico, {firstName}
              </span>
            </h1>
            
            <p className="text-xl text-pearl-white/80 max-w-2xl mx-auto leading-relaxed">
              {firstName}, nossa IA está analisando suas respostas com precisão cirúrgica...
            </p>
          </motion.div>

          {/* Analysis Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="bg-gradient-to-r from-forest-green/20 to-royal-gold/10 backdrop-blur-sm rounded-3xl p-12 border border-royal-gold/30 space-y-8"
          >
            {/* Current Step Icon */}
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <motion.div
                  animate={isComplete ? { rotate: 0 } : { rotate: 360 }}
                  transition={isComplete ? { duration: 0.5 } : { duration: 2, repeat: Infinity, ease: "linear" }}
                  className={`absolute inset-0 rounded-full border-4 ${
                    isComplete 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-royal-gold/30 border-t-royal-gold'
                  }`}
                  style={{ width: '120px', height: '120px' }}
                />
                <div className={`w-28 h-28 bg-gradient-to-br rounded-full flex items-center justify-center border-2 ${
                  isComplete 
                    ? 'from-green-500/20 to-green-400/20 border-green-500/50' 
                    : 'from-royal-gold/20 to-bright-gold/20 border-royal-gold/50'
                }`}>
                  {isComplete ? (
                    <Check className="w-12 h-12 text-green-500" />
                  ) : (
                    <CurrentIcon className="w-12 h-12 text-royal-gold" />
                  )}
                </div>
              </div>
            </motion.div>

            {/* Current Step Info */}
            {!isComplete ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <h3 className="text-2xl font-heading font-bold text-pearl-white">
                  {analysisSteps[currentStep]?.title}
                </h3>
                <p className="text-lg text-pearl-white/70">
                  {analysisSteps[currentStep]?.description}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <h3 className="text-3xl font-heading font-bold text-bright-gold">
                  {firstName}, Diagnóstico Completo!
                </h3>
                <p className="text-lg text-pearl-white/80">
                  Preparando seus resultados personalizados, {firstName}...
                </p>
                
                {/* Video Player */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mt-6"
                >
                  <div className="relative w-full max-w-2xl mx-auto">
                    <div className="aspect-video bg-deep-navy/50 rounded-xl border border-royal-gold/20 overflow-hidden shadow-lg">
                      <video
                        className="w-full h-full object-cover"
                        controls
                        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23001122'/%3E%3Ctext x='200' y='112.5' text-anchor='middle' fill='%23D4AF37' font-size='16' font-family='Arial'%3EVídeo será carregado aqui%3C/text%3E%3C/svg%3E"
                      >
                        <source src="" type="video/mp4" />
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/20 to-transparent rounded-xl pointer-events-none" />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-pearl-white/60">
                  Etapa {currentStep + 1} de {analysisSteps.length}
                </span>
                <span className="text-royal-gold font-mono">
                  {Math.round(progress)}%
                </span>
              </div>
              
              <div className="w-full bg-forest-green/30 rounded-full h-4 overflow-hidden border border-royal-gold/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-royal-gold to-bright-gold rounded-full relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Steps Overview */}
            <div className="grid grid-cols-5 gap-4 mt-8">
              {analysisSteps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep || isComplete
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`text-center p-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-royal-gold/20 border-2 border-royal-gold scale-105'
                        : isCompleted
                        ? 'bg-bright-gold/10 border border-bright-gold/50'
                        : 'bg-forest-green/20 border border-royal-gold/20'
                    }`}
                  >
                    <StepIcon className={`w-6 h-6 mx-auto mb-2 ${
                      isActive
                        ? 'text-royal-gold'
                        : isCompleted
                        ? 'text-bright-gold'
                        : 'text-pearl-white/40'
                    }`} />
                    <div className={`text-xs font-medium ${
                      isActive
                        ? 'text-pearl-white'
                        : isCompleted
                        ? 'text-bright-gold/80'
                        : 'text-pearl-white/40'
                    }`}>
                      {step.title.split(' ')[0]}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex items-center justify-center space-x-3"
          >
            {isComplete ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-royal-gold animate-spin" />
            )}
            <span className="text-pearl-white/60 text-sm italic">
              {isComplete 
                ? 'Análise concluída! Clique no botão abaixo para ver seus resultados.' 
                : 'Aguarde enquanto processamos seus dados...'}
            </span>
          </motion.div>

          {/* Button to view results */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex justify-center mt-8"
            >
              <button
                onClick={handleViewResults}
                className="group relative px-8 py-4 bg-gradient-to-r from-royal-gold to-amber-500 text-deep-navy font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
              >
                <span>Ver Meus Resultados</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </motion.div>
          )}

          {/* Matrix-style data stream */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-center space-y-2"
          >
            <div className="font-mono text-xs text-royal-gold/60 space-y-1">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                [PENSAMENTO] Padrões identificados... ✓
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                [SENTIMENTO] Bloqueios mapeados... ✓
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                [EMOÇÃO] Triggers analisados... ✓
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              >
                [AÇÃO] Comportamentos decodificados... ✓
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default QuizAnalysisPage