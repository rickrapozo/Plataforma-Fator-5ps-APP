import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
}

interface GoldenParticlesProps {
  className?: string
  particleCount?: number
}

const GoldenParticles: React.FC<GoldenParticlesProps> = ({ 
  className = '', 
  particleCount = 20 
}) => {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generateParticles = (): Particle[] => {
      return Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // Posição X em porcentagem
        y: Math.random() * 100, // Posição Y em porcentagem
        size: Math.random() * 4 + 2, // Tamanho entre 2-6px
        opacity: Math.random() * 0.6 + 0.2, // Opacidade entre 0.2-0.8
        duration: Math.random() * 3 + 2, // Duração entre 2-5s
        delay: Math.random() * 2, // Delay entre 0-2s
      }))
    }

    setParticles(generateParticles())
  }, [particleCount])

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-royal-gold to-bright-gold shadow-lg"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          initial={{
            opacity: 0,
            scale: 0,
            y: 20,
          }}
          animate={{
            opacity: [0, particle.opacity, particle.opacity, 0],
            scale: [0, 1, 1.2, 0],
            y: [20, 0, -10, -30],
            x: [0, Math.random() * 20 - 10, Math.random() * 30 - 15],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Partículas de brilho adicional */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 bg-royal-gold rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      ))}
      
      {/* Efeito de ondas douradas */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-royal-gold/5 to-transparent"
        animate={{
          x: ['-100%', '100%'],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 3,
        }}
      />
    </div>
  )
}

export default GoldenParticles