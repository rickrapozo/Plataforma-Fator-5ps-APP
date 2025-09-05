import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface PeakStateActivatorProps {
  onComplete: () => void
  completed: boolean
}

const PeakStateActivator: React.FC<PeakStateActivatorProps> = ({
  onComplete,
  completed
}) => {
  const [isActive, setIsActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startSession = () => {
    if (completed) return
    
    setIsActive(true)
    setProgress(0)
    setTimeLeft(60)
    
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / 60) // 60 seconds
        
        if (newProgress >= 100) {
          setIsActive(false)
          setTimeLeft(0)
          onComplete()
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 100
        }
        
        setTimeLeft(Math.ceil(60 - (newProgress / 100) * 60))
        return newProgress
      })
    }, 1000)
  }

  const pauseSession = () => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const resetSession = () => {
    setIsActive(false)
    setProgress(0)
    setTimeLeft(60)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="text-center space-y-6">
      {/* Main Button */}
      <div className="relative">
        <motion.button
          className={`w-32 h-32 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden ${
            completed 
              ? 'bg-success-green' 
              : 'bg-gradient-to-r from-royal-gold to-bright-gold'
          }`}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={completed ? undefined : isActive ? pauseSession : startSession}
          disabled={completed}
        >
          {completed ? (
            <div className="text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                ✅
              </motion.div>
            </div>
          ) : isActive ? (
            <Pause className="w-12 h-12 text-white" />
          ) : (
            <Play className="w-12 h-12 text-white ml-2" />
          )}
        </motion.button>

        {/* Progress Ring */}
        {!completed && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="4"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="4"
              strokeDasharray="377"
              strokeDashoffset={377 - (377 * progress) / 100}
              strokeLinecap="round"
              transition={{ duration: 0.5 }}
            />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h3 className="text-white font-heading font-semibold text-lg">
          {completed ? 'Estado Peak Ativado!' : 'Ativação do Estado Peak'}
        </h3>
        <p className="text-pearl-white/80 text-sm">
          {completed 
            ? 'Você completou sua sessão de respiração guiada' 
            : isActive 
              ? `Respiração guiada em andamento... ${formatTime(timeLeft)}`
              : 'Clique para iniciar sua sessão de 60 segundos'
          }
        </p>
      </div>

      {/* Controls */}
      {!completed && progress > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center space-x-2 mx-auto px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          onClick={resetSession}
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">Reiniciar</span>
        </motion.button>
      )}

      {/* Instructions */}
      {!completed && !isActive && (
        <div className="p-4 bg-info-blue/20 border border-info-blue/30 rounded-lg">
          <p className="text-info-blue text-sm">
            🧘‍♂️ Durante a sessão, respire profundamente e visualize seus objetivos sendo alcançados.
          </p>
        </div>
      )}
    </div>
  )
}

export default PeakStateActivator