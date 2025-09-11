import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Heart, Wind, Brain, Shield, Play, Pause, RotateCcw, Volume2 } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { getCapitalizedFirstName } from '../../utils/nameUtils'

// Declarações globais para Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new(): SpeechRecognition
}

interface CrisisProtocol {
  id: string
  name: string
  description: string
  duration: number // em segundos
  steps: {
    instruction: string
    duration: number
    breathingPattern?: {
      inhale: number
      hold: number
      exhale: number
    }
    audioGuide?: string
  }[]
}

interface VoiceCommand {
  phrases: string[]
  action: () => void
  description: string
}

const VoiceCrisisMode: React.FC = () => {
  const { user } = useAppStore()
  const [isListening, setIsListening] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [currentProtocol, setCurrentProtocol] = useState<CrisisProtocol | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [breathingCount, setBreathingCount] = useState(0)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const firstName = getCapitalizedFirstName(user?.name || 'Transformador')

  // Protocolos de emergência
  const crisisProtocols: CrisisProtocol[] = [
    {
      id: 'breathing-reset',
      name: 'Reset Respiratório',
      description: 'Técnica de respiração 4-7-8 para acalmar o sistema nervoso',
      duration: 300, // 5 minutos
      steps: [
        {
          instruction: `${firstName}, vamos começar com uma respiração profunda. Inspire pelo nariz contando até 4.`,
          duration: 60,
          breathingPattern: { inhale: 4, hold: 7, exhale: 8 }
        },
        {
          instruction: 'Agora segure o ar por 7 segundos. Sinta seu corpo relaxando.',
          duration: 60,
          breathingPattern: { inhale: 4, hold: 7, exhale: 8 }
        },
        {
          instruction: 'Expire lentamente pela boca contando até 8. Libere toda a tensão.',
          duration: 60,
          breathingPattern: { inhale: 4, hold: 7, exhale: 8 }
        },
        {
          instruction: 'Continue esse ritmo. Você está seguro e no controle.',
          duration: 120,
          breathingPattern: { inhale: 4, hold: 7, exhale: 8 }
        }
      ]
    },
    {
      id: 'grounding-5-4-3-2-1',
      name: 'Ancoragem 5-4-3-2-1',
      description: 'Técnica de grounding para reconectar com o presente',
      duration: 240,
      steps: [
        {
          instruction: `${firstName}, vamos nos ancorar no presente. Olhe ao redor e identifique 5 coisas que você pode ver.`,
          duration: 60
        },
        {
          instruction: 'Agora, identifique 4 coisas que você pode tocar. Sinta a textura, a temperatura.',
          duration: 60
        },
        {
          instruction: 'Identifique 3 sons que você pode ouvir ao seu redor. Foque em cada um deles.',
          duration: 60
        },
        {
          instruction: 'Agora 2 cheiros que você pode perceber. Respire profundamente.',
          duration: 60
        }
      ]
    },
    {
      id: 'mental-reset',
      name: 'Reset Mental Completo',
      description: 'Protocolo completo para reorganizar pensamentos e emoções',
      duration: 420, // 7 minutos
      steps: [
        {
          instruction: `${firstName}, vamos fazer um reset completo. Primeiro, reconheça que você está passando por um momento difícil, e isso é normal.`,
          duration: 60
        },
        {
          instruction: 'Agora vamos respirar juntos. Inspire força, expire tensão.',
          duration: 120,
          breathingPattern: { inhale: 6, hold: 2, exhale: 8 }
        },
        {
          instruction: 'Visualize uma luz dourada envolvendo você, trazendo calma e proteção.',
          duration: 90
        },
        {
          instruction: 'Repita comigo: "Eu sou forte, eu sou capaz, eu vou superar isso."',
          duration: 90
        },
        {
          instruction: 'Agora, pense em uma pessoa que te ama. Sinta esse amor te fortalecendo.',
          duration: 60
        }
      ]
    }
  ]

  // Comandos de voz
  const voiceCommands: VoiceCommand[] = [
    {
      phrases: ['preciso de ajuda', 'help me', 'ajuda', 'socorro', 'estou mal'],
      action: () => activateCrisisMode('breathing-reset'),
      description: 'Ativa o protocolo de respiração'
    },
    {
      phrases: ['ansiedade', 'anxiety', 'pânico', 'panic', 'medo'],
      action: () => activateCrisisMode('grounding-5-4-3-2-1'),
      description: 'Ativa o protocolo de ancoragem'
    },
    {
      phrases: ['reset mental', 'reset', 'recomeçar', 'restart'],
      action: () => activateCrisisMode('mental-reset'),
      description: 'Ativa o reset mental completo'
    },
    {
      phrases: ['parar', 'stop', 'cancelar', 'cancel'],
      action: () => stopCrisisMode(),
      description: 'Para o protocolo atual'
    },
    {
      phrases: ['pausar', 'pause'],
      action: () => togglePlayPause(),
      description: 'Pausa/retoma o protocolo'
    }
  ]

  // Inicializar reconhecimento de voz
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'pt-BR'
        
        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex
          const transcript = event.results[current][0].transcript.toLowerCase()
          setTranscript(transcript)
          
          // Verificar comandos de voz
          voiceCommands.forEach(command => {
            command.phrases.forEach(phrase => {
              if (transcript.includes(phrase)) {
                command.action()
              }
            })
          })
        }
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false)
      recognitionRef.current.stop()
    }
  }

  const activateCrisisMode = (protocolId: string) => {
    const protocol = crisisProtocols.find(p => p.id === protocolId)
    if (protocol) {
      setCurrentProtocol(protocol)
      setCurrentStep(0)
      setIsActive(true)
      setIsPlaying(true)
      startProtocolStep(protocol.steps[0])
      
      // Falar a instrução inicial
      speakText(`Protocolo ${protocol.name} ativado. ${protocol.steps[0].instruction}`)
    }
  }

  const startProtocolStep = (step: CrisisProtocol['steps'][0]) => {
    setTimeRemaining(step.duration)
    
    if (step.breathingPattern) {
      startBreathingGuide(step.breathingPattern)
    }
    
    // Timer para o passo atual
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          nextStep()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startBreathingGuide = (pattern: { inhale: number; hold: number; exhale: number }) => {
    let phase: 'inhale' | 'hold' | 'exhale' = 'inhale'
    let count = 0
    
    const breathingCycle = () => {
      setBreathingPhase(phase)
      setBreathingCount(count)
      
      let duration = 0
      switch (phase) {
        case 'inhale':
          duration = pattern.inhale * 1000
          break
        case 'hold':
          duration = pattern.hold * 1000
          break
        case 'exhale':
          duration = pattern.exhale * 1000
          break
      }
      
      breathingTimerRef.current = setTimeout(() => {
        if (phase === 'inhale') {
          phase = 'hold'
        } else if (phase === 'hold') {
          phase = 'exhale'
        } else {
          phase = 'inhale'
          count++
        }
        
        if (isPlaying && isActive) {
          breathingCycle()
        }
      }, duration)
    }
    
    breathingCycle()
  }

  const nextStep = () => {
    if (!currentProtocol) return
    
    const nextStepIndex = currentStep + 1
    if (nextStepIndex < currentProtocol.steps.length) {
      setCurrentStep(nextStepIndex)
      const nextStep = currentProtocol.steps[nextStepIndex]
      startProtocolStep(nextStep)
      speakText(nextStep.instruction)
    } else {
      // Protocolo concluído
      stopCrisisMode()
      speakText(`${firstName}, você completou o protocolo ${currentProtocol.name}. Você está forte e capaz.`)
    }
  }

  const stopCrisisMode = () => {
    setIsActive(false)
    setIsPlaying(false)
    setCurrentProtocol(null)
    setCurrentStep(0)
    setTimeRemaining(0)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (breathingTimerRef.current) {
      clearTimeout(breathingTimerRef.current)
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying && timerRef.current) {
      // Retomar timer
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Inspire...'
      case 'hold':
        return 'Segure...'
      case 'exhale':
        return 'Expire...'
    }
  }

  const getBreathingColor = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'from-blue-400 to-cyan-500'
      case 'hold':
        return 'from-purple-400 to-indigo-500'
      case 'exhale':
        return 'from-green-400 to-emerald-500'
    }
  }

  return (
    <>
      <AnimatePresence>
        {!isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={isListening ? stopListening : startListening}
              className={`p-4 rounded-full shadow-2xl transition-all duration-300 ${
                isListening 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' 
                  : 'bg-gradient-to-r from-royal-gold to-amber-500'
              }`}
              title={isListening ? 'Parar escuta' : 'Ativar modo crise por voz'}
            >
              {isListening ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-deep-forest" />
              )}
            </motion.button>
            
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full right-0 mb-2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
              >
                Escutando... Diga "preciso de ajuda"
              </motion.div>
            )}
          </motion.div>
        )}
        
        {isActive && currentProtocol && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-deep-forest via-forest-green to-deep-forest min-h-screen flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full">
              {/* Header */}
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8"
              >
                <div className="flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-royal-gold mr-3" />
                  <h1 className="text-3xl font-bold text-white">
                    {currentProtocol.name}
                  </h1>
                </div>
                <p className="text-pearl-white/80">{currentProtocol.description}</p>
              </motion.div>

              {/* Breathing Guide */}
              {currentProtocol.steps[currentStep]?.breathingPattern && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center mb-8"
                >
                  <motion.div
                    animate={{
                      scale: breathingPhase === 'inhale' ? 1.2 : breathingPhase === 'hold' ? 1.1 : 0.8
                    }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className={`w-32 h-32 rounded-full bg-gradient-to-r ${getBreathingColor()} flex items-center justify-center shadow-2xl`}
                  >
                    <div className="text-center">
                      <Wind className="w-8 h-8 text-white mx-auto mb-2" />
                      <p className="text-white font-semibold">{getBreathingInstruction()}</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Current Instruction */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6 text-center"
              >
                <p className="text-xl text-white leading-relaxed">
                  {currentProtocol.steps[currentStep]?.instruction}
                </p>
              </motion.div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-pearl-white/80">Progresso</span>
                  <span className="text-royal-gold font-semibold">
                    {currentStep + 1}/{currentProtocol.steps.length}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-royal-gold to-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / currentProtocol.steps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-royal-gold mb-2">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-pearl-white/70">Tempo restante neste passo</p>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlayPause}
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => activateCrisisMode(currentProtocol.id)}
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300"
                >
                  <RotateCcw className="w-6 h-6" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopCrisisMode}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Finalizar
                </motion.button>
              </div>

              {/* Voice Commands Help */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-center"
              >
                <p className="text-pearl-white/60 text-sm mb-2">
                  Comandos de voz disponíveis:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['"Pausar"', '"Parar"', '"Recomeçar"'].map((command, index) => (
                    <span key={index} className="px-2 py-1 bg-white/10 rounded text-xs text-pearl-white/70">
                      {command}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default VoiceCrisisMode