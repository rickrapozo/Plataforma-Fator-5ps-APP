import React from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'

const MiniPlayer: React.FC = () => {
  const { currentAudio, isPlaying, setIsPlaying, setCurrentAudio } = useAppStore()

  if (!currentAudio) return null

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-20 left-4 right-4 z-40 bg-gradient-to-r from-deep-forest to-forest-green backdrop-blur-lg rounded-2xl border border-white/20 p-4"
    >
      <div className="flex items-center space-x-4">
        {/* Audio Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm truncate">
            {currentAudio.title}
          </h4>
          <p className="text-pearl-white/70 text-xs truncate">
            {currentAudio.description}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <motion.button
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <SkipBack className="w-4 h-4 text-white" />
          </motion.button>

          <motion.button
            className="p-3 rounded-full bg-royal-gold hover:bg-bright-gold transition-colors"
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </motion.button>

          <motion.button
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <SkipForward className="w-4 h-4 text-white" />
          </motion.button>

          <motion.button
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentAudio(null)}
          >
            <X className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-white/20 rounded-full h-1">
          <motion.div
            className="bg-royal-gold h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '30%' }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default MiniPlayer