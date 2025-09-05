import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Clock, Brain, Heart, Zap, Target, Trophy } from 'lucide-react'
import Logo from '../../components/shared/Logo'
import { getCapitalizedFirstName } from '../../utils/nameUtils'

interface Question {
  id: number
  category: string
  categoryIcon: any
  question: string
  options: string[]
}

const getQuestions = (firstName: string): Question[] => [
  {
    id: 1,
    category: "Pensamento / Crenças Limitantes",
    categoryIcon: Brain,
    question: `${firstName}, quando você pensa em alcançar um grande objetivo (como dobrar sua renda, encontrar o amor da sua vida ou transformar sua saúde), qual é o primeiro pensamento que vem à sua mente?`,
    options: [
      "'Isso é possível, eu só preciso descobrir como'",
      "'Seria incrível, mas provavelmente é muito difícil para mim'",
      "'Outras pessoas conseguem, mas eu não tenho sorte/talento/recursos'",
      "'Eu sempre saboto tudo quando estou quase chegando lá'"
    ]
  },
  {
    id: 2,
    category: "Pensamento / Autoimagem",
    categoryIcon: Brain,
    question: "Complete a frase: 'Eu sou o tipo de pessoa que...'",
    options: [
      "'...sempre encontra uma forma de vencer, mesmo quando tudo parece impossível'",
      "'...tem potencial, mas precisa de mais tempo/conhecimento/sorte'",
      "'...tenta muito, mas as coisas nunca saem como eu planejo'",
      "'...não nasceu para grandes coisas, mas faz o que pode'"
    ]
  },
  {
    id: 3,
    category: "Sentimento / Relação com o Dinheiro",
    categoryIcon: Heart,
    question: `${firstName}, quando você vê alguém muito bem-sucedido financeiramente, o que você sente?`,
    options: [
      "Inspiração e curiosidade: 'Que estratégias essa pessoa usou?'",
      "Admiração com um toque de inveja: 'Gostaria de ter essa sorte'",
      "Desconfiança: 'Deve ter feito algo errado ou nasceu em berço de ouro'",
      "Resignação: 'Algumas pessoas nasceram para isso, eu não'"
    ]
  },
  {
    id: 4,
    category: "Sentimento / Merecimento",
    categoryIcon: Heart,
    question: "Imagine que você acabou de receber uma proposta incrível (um trabalho dos sonhos, um relacionamento perfeito, uma oportunidade única). Qual é sua reação emocional imediata?",
    options: [
      "Gratidão e empolgação: 'Finalmente! Eu trabalhei para isso'",
      "Surpresa e um pouco de ansiedade: 'Será que eu mereço isso?'",
      "Desconfiança: 'Deve ter alguma pegadinha'",
      "Pânico: 'Eu vou estragar tudo, como sempre'"
    ]
  },
  {
    id: 5,
    category: "Emoção / Medo do Sucesso",
    categoryIcon: Zap,
    question: "Você está a um passo de alcançar algo que sempre quis. De repente, sente um frio na barriga. O que esse medo está tentando te dizer?",
    options: [
      "'É normal estar nervoso, mas eu vou em frente mesmo assim'",
      "'E se eu conseguir e não souber lidar com o sucesso?'",
      "'E se as pessoas descobrirem que eu sou uma fraude?'",
      "'Melhor não arriscar, pelo menos aqui eu estou seguro'"
    ]
  },
  {
    id: 6,
    category: "Emoção / Gestão da Frustração",
    categoryIcon: Zap,
    question: "Você tentou algo importante e não deu certo. Como você lida com essa frustração?",
    options: [
      "Analiso o que aprendi e ajusto a estratégia para a próxima tentativa",
      "Fico chateado por um tempo, mas eventualmente tento de novo",
      "Sinto que desperdicei tempo e energia, fico desmotivado por semanas",
      "Uso isso como prova de que eu estava certo: 'Eu sabia que não ia dar certo'"
    ]
  },
  {
    id: 7,
    category: "Ação / Procrastinação",
    categoryIcon: Target,
    question: "Você tem uma tarefa importante que pode mudar sua vida, mas continua adiando. Qual é a verdadeira razão?",
    options: [
      "Estou organizando tudo para fazer da melhor forma possível",
      "Tenho medo de não fazer perfeito e decepcionar as pessoas",
      "No fundo, não acredito que vai dar certo mesmo",
      "Se eu não tentar, não posso falhar"
    ]
  },
  {
    id: 8,
    category: "Ação / Consistência",
    categoryIcon: Target,
    question: "Você começou uma nova rotina/hábito/projeto que pode transformar sua vida. Depois de algumas semanas, o que acontece?",
    options: [
      "Mantenho a disciplina porque sei que os resultados vêm com o tempo",
      "Continuo, mas com menos intensidade quando não vejo resultados rápidos",
      "Desisto quando surge a primeira dificuldade ou imprevisto",
      "Saboto inconscientemente: 'esqueço', arranjo desculpas, perco o foco"
    ]
  },
  {
    id: 9,
    category: "Resultado / Relação com o Fracasso",
    categoryIcon: Trophy,
    question: "Para você, o fracasso é:",
    options: [
      "Informação valiosa que me aproxima do sucesso",
      "Algo ruim, mas que faz parte da vida",
      "A confirmação de que eu não sou bom o suficiente",
      "A prova de que eu nunca deveria ter tentado"
    ]
  },
  {
    id: 10,
    category: "Resultado / Cocriação da Realidade",
    categoryIcon: Trophy,
    question: `${firstName}, olhando para sua vida hoje, você acredita que:`,
    options: [
      "Eu sou o principal responsável pelos meus resultados e posso mudá-los",
      "Eu tenho algum controle, mas muita coisa depende de fatores externos",
      "Eu faço minha parte, mas parece que o universo conspira contra mim",
      "Minha vida é resultado do destino/sorte/circunstâncias que não posso controlar"
    ]
  }
]

function QuizQuestionPage() {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isAnimating, setIsAnimating] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Recupera o nome do usuário do localStorage
    const storedName = localStorage.getItem('userName')
    if (storedName) {
      setUserName(storedName)
    }
  }, [])

  const firstName = getCapitalizedFirstName(userName)
  const questions = getQuestions(firstName)

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  // Handle next question
  const handleNext = () => {
    if (selectedAnswer === null) return
    
    setIsAnimating(true)
    
    setTimeout(() => {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = selectedAnswer
      setAnswers(newAnswers)
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        // Store answers and navigate to analysis
        localStorage.setItem('quizAnswers', JSON.stringify(newAnswers))
        navigate('/quiz/analysis')
      }
      
      setIsAnimating(false)
    }, 300)
  }

  // Handle previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true)
      
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1)
        setSelectedAnswer(answers[currentQuestion - 1] ?? null)
        setIsAnimating(false)
      }, 300)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]
  const CategoryIcon = question.categoryIcon

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-deep-forest relative overflow-hidden">
      {/* Matrix Background Effect */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-royal-gold font-mono text-xs"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Logo />
            
            {/* Timer */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-forest-green/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-royal-gold/30">
                <Clock className="w-5 h-5 text-royal-gold" />
                <span className="text-pearl-white font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-pearl-white/80 text-sm font-medium">
                Pergunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-royal-gold text-sm font-medium">
                {Math.round(progress)}% completo
              </span>
            </div>
            
            <div className="w-full bg-forest-green/30 rounded-full h-3 overflow-hidden border border-royal-gold/20">
              <motion.div
                className="h-full bg-gradient-to-r from-royal-gold to-bright-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="max-w-4xl w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: isAnimating ? 50 : 0, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-8"
              >
                {/* Category */}
                <div className="text-center">
                  <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-royal-gold/20 to-bright-gold/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-royal-gold/40 mb-6">
                    <CategoryIcon className="w-6 h-6 text-royal-gold" />
                    <span className="text-royal-gold font-semibold text-lg">{question.category}</span>
                  </div>
                </div>

                {/* Question */}
                <div className="text-center mb-12">
                  <p className="text-lg text-pearl-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                    {firstName}, cada pergunta foi cuidadosamente elaborada para revelar os padrões ocultos que moldam sua realidade. 
                    <span className="text-royal-gold font-semibold">Seja honesto(a) consigo mesmo(a)</span> - sua transformação depende disso.
                  </p>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-pearl-white leading-relaxed max-w-3xl mx-auto">
                    {question.question}
                  </h2>
                </div>

                {/* Options */}
                <div className="space-y-4 max-w-3xl mx-auto">
                  {question.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 group ${
                        selectedAnswer === index
                          ? 'bg-gradient-to-r from-royal-gold/20 to-bright-gold/20 border-royal-gold text-pearl-white shadow-lg shadow-royal-gold/20'
                          : 'bg-forest-green/20 backdrop-blur-sm border-royal-gold/30 text-pearl-white/90 hover:border-royal-gold/60 hover:bg-royal-gold/10'
                      }`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all duration-300 ${
                          selectedAnswer === index
                            ? 'border-royal-gold bg-royal-gold'
                            : 'border-royal-gold/50 group-hover:border-royal-gold'
                        }`}>
                          {selectedAnswer === index && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                          )}
                        </div>
                        <span className="text-lg leading-relaxed flex-1">{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between max-w-3xl mx-auto pt-8">
                  <motion.button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      currentQuestion === 0
                        ? 'text-pearl-white/40 cursor-not-allowed'
                        : 'text-pearl-white hover:text-royal-gold bg-forest-green/30 hover:bg-royal-gold/20 border border-royal-gold/30 hover:border-royal-gold/60'
                    }`}
                    whileHover={currentQuestion > 0 ? { scale: 1.05 } : {}}
                    whileTap={currentQuestion > 0 ? { scale: 0.95 } : {}}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Anterior</span>
                  </motion.button>

                  <motion.button
                    onClick={handleNext}
                    disabled={selectedAnswer === null}
                    className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      selectedAnswer === null
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-royal-gold to-bright-gold text-white hover:shadow-lg hover:shadow-royal-gold/30'
                    }`}
                    whileHover={selectedAnswer !== null ? { scale: 1.05 } : {}}
                    whileTap={selectedAnswer !== null ? { scale: 0.95 } : {}}
                  >
                    <span>{currentQuestion === questions.length - 1 ? 'FINALIZAR' : 'PRÓXIMA'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizQuestionPage