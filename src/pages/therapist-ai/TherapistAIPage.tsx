import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Send, Heart, User, Loader } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAppStore } from '../../stores/useAppStore'
import { TherapistService } from '../../services/therapistService'
import { getCapitalizedFirstName } from '../../utils/nameUtils'


interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  suggestions?: string[]
}

const TherapistAIPage: React.FC = () => {
  const { user, dailyProtocol, onboardingResults, streak, level, xp, hasFullAccess, isAdmin } = useAppStore()
  const [aiMessageCount, setAiMessageCount] = useState(1) // Contador de mensagens da IA (inicia com 1 pela mensagem inicial)

  
  // Função para gerar mensagem de apresentação personalizada
  const generateWelcomeMessage = () => {
    const userName = getCapitalizedFirstName(user?.name || 'amigo(a)')
    const userLevel = level || 1
    const userStreak = streak || 0
    
    if (isAdmin()) {
      return {
        content: `Olá ${userName}! 👋 Sou seu Terapeuta Essencial AI com acesso administrativo completo. Estou aqui para te apoiar tanto no seu bem-estar pessoal quanto na gestão da plataforma. Posso te ajudar com análises de dados, suporte aos usuários, ou simplesmente conversar sobre seu equilíbrio mental e físico. Como posso te apoiar hoje?`,
        suggestions: [
          'Como aplicar o método 5Ps na minha vida?',
          'Preciso de ajuda com meu bem-estar pessoal',
          'Quais são os 5 pilares do desenvolvimento pessoal?',
          'Como melhorar meu equilíbrio emocional?'
        ]
      }
    }
    
    let welcomeContent = `Olá ${userName}! 🌟 Sou seu Terapeuta Essencial AI, seu companheiro dedicado ao seu bem-estar mental e físico. `
    
    // Personalização baseada no nível e streak
    if (userStreak > 0) {
      welcomeContent += `Vejo que você está em uma sequência incrível de ${userStreak} dias! Isso mostra sua dedicação ao autocuidado. `
    }
    
    if (userLevel > 1) {
      welcomeContent += `Você já alcançou o nível ${userLevel} em sua jornada de transformação - que conquista! `
    }
    
    // Personalização baseada nos resultados do onboarding
    if (onboardingResults) {
      const avgScore = (onboardingResults.thought + onboardingResults.feeling + onboardingResults.emotion + onboardingResults.action + onboardingResults.result) / 5
      if (avgScore < 3) {
        welcomeContent += `Vejo que você tem enfrentado alguns desafios. `
      } else if (avgScore > 4) {
        welcomeContent += `Que bom ver que você está em um bom momento! `
      }
    }
    
    welcomeContent += `Estou aqui para te apoiar em cada passo, seja para fortalecer sua mente, cuidar do seu corpo, ou encontrar equilíbrio emocional. Vamos conversar sobre o que está em seu coração hoje?`
    
    // Sugestões focadas em ajuda pessoal e método 5Ps
    let personalizedSuggestions = [
      'Como aplicar o método 5Ps na minha vida?',
      'Preciso de ajuda com desenvolvimento pessoal',
      'Quais são os 5 pilares do bem-estar?',
      'Como melhorar meu crescimento pessoal?'
    ]
    
    if (onboardingResults) {
      if (onboardingResults.emotion < 3) {
        personalizedSuggestions[3] = 'Como trabalhar meu equilíbrio emocional com os 5Ps?'
      } else if (onboardingResults.thought < 3) {
        personalizedSuggestions[3] = 'Como fortalecer minha mentalidade com o método 5Ps?'
      } else if (onboardingResults.feeling < 3) {
        personalizedSuggestions[3] = 'Como usar os 5Ps para lidar com o estresse?'
      } else {
        personalizedSuggestions[3] = 'Como manter minha evolução pessoal com os 5Ps?'
      }
    }
    
    return {
      content: welcomeContent,
      suggestions: personalizedSuggestions
    }
  }
  
  const welcomeMessage = generateWelcomeMessage()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: welcomeMessage.content,
      timestamp: new Date(),
      suggestions: welcomeMessage.suggestions
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasAccess = hasFullAccess() || isAdmin()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])



  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim()
    if (!messageToSend || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Adiciona mensagem de "digitando" temporária
    const typingMessage: ChatMessage = {
      id: 'typing',
      type: 'ai',
      content: '🤔 Pensando...',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      console.log('📤 Enviando mensagem para terapeuta AI:', messageToSend)
      
      const response = await TherapistService.sendMessage({
        message: messageToSend,
        userId: user?.id || '',
        userName: user?.name || '',
        userEmail: user?.email || '',
        context: {
          dailyProtocol,
          userProgress: { streak, level, xp },
          onboardingResults
        }
      })

      // Remove mensagem de "digitando"
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'))

      // Incrementa contador de mensagens da IA
      const newAiMessageCount = aiMessageCount + 1
      setAiMessageCount(newAiMessageCount)

      // Adiciona a resposta da IA
      const aiMessage: ChatMessage = {
        id: `${Date.now()}_ai`,
        type: 'ai',
        content: response.response,
        timestamp: new Date()
        // Sugestões removidas - apenas na mensagem de boas-vindas
      }

      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      
      // Remove mensagem de "digitando"
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'))
      
      // Incrementa contador de mensagens da IA (mesmo em caso de erro)
      const newAiMessageCount = aiMessageCount + 1
      setAiMessageCount(newAiMessageCount)
      
      // Adiciona mensagem de erro amigável
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: 'Desculpe, estou enfrentando dificuldades técnicas no momento. Tente novamente em alguns instantes.',
        timestamp: new Date()
        // Sugestões removidas - apenas na mensagem de boas-vindas
      }
      
      setMessages(prev => [...prev, errorMessage])
      toast.error('Erro ao comunicar com o terapeuta AI')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-royal-gold rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-white text-2xl font-heading font-bold mb-4">
            Recurso Premium
          </h2>
          
          <p className="text-pearl-white/80 text-body-md mb-6">
            O Terapeuta Essencial AI está disponível apenas para assinantes do plano Prosperous.
          </p>
          
          <motion.button
            className="w-full bg-gradient-to-r from-royal-gold to-bright-gold text-white py-3 rounded-lg font-semibold"
            whileTap={{ scale: 0.98 }}
          >
            Fazer upgrade
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 px-4"
      >
        <h1 className="text-white text-2xl font-heading font-bold mb-2">
          Terapeuta Essencial AI
        </h1>
        <p className="text-pearl-white/80 text-sm">
          Seu assistente pessoal para transformação mental
        </p>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-royal-gold' 
                    : 'bg-gradient-to-br from-sage-green to-forest-green'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Heart className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-royal-gold text-white'
                    : 'glass-card text-white'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-pearl-white/80 font-medium">Sugestões:</p>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(suggestion)}
                          className="block w-full text-left text-xs bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
                          disabled={isLoading}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-green to-forest-green flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="glass-card px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 text-white animate-spin" />
                    <span className="text-white text-sm">Pensando...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-pearl-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent resize-none"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <motion.button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="w-12 h-12 bg-gradient-to-r from-royal-gold to-bright-gold rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TherapistAIPage