import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Declaração global para YouTube API
declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Heart,
  Repeat,
  Shuffle,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Youtube,
  Music
} from 'lucide-react'
import { AudioTrack } from '../../services/audioIntegrationService'
import { externalAudioService } from '../../services/externalAudioService'

// Função utilitária para converter duração string para segundos
const parseDuration = (duration: string): number => {
  const parts = duration.split(':')
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  } else if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
  }
  return 0
}

interface AudioPlayerProps {
  currentTrack?: AudioTrack | null
  playlist?: AudioTrack[]
  onTrackChange?: (track: AudioTrack) => void
  onPlaylistEnd?: () => void
  autoPlay?: boolean
  showPlaylist?: boolean
  theme?: 'dark' | 'light'
}

interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isLoading: boolean
  isRepeat: boolean
  isShuffle: boolean
  currentTrackIndex: number
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTrack,
  playlist = [],
  onTrackChange,
  onPlaylistEnd,
  autoPlay = false,
  showPlaylist = true,
  theme = 'dark'
}) => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isLoading: false,
    isRepeat: false,
    isShuffle: false,
    currentTrackIndex: 0
  })

  const [isLiked, setIsLiked] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const youtubePlayerRef = useRef<any>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const volumeTimeoutRef = useRef<NodeJS.Timeout>()

  // Inicializar player do YouTube
  useEffect(() => {
    if (currentTrack?.source === 'youtube') {
      loadYouTubeAPI()
    }
  }, [currentTrack])

  // Controle de reprodução automática
  useEffect(() => {
    if (currentTrack && autoPlay) {
      handlePlay()
    }
    
    if (currentTrack) {
      setPlayerState(prev => ({
        ...prev,
        duration: parseDuration(currentTrack.duration),
        currentTime: 0
      }))
      
      // Configurar callbacks do serviço de áudio externo
      externalAudioService.setCallbacks(
        (currentTime: number, duration: number) => {
          setPlayerState(prev => ({
            ...prev,
            currentTime,
            duration
          }))
        },
        (isPlaying: boolean) => {
          setPlayerState(prev => ({
            ...prev,
            isPlaying
          }))
        }
      )
      
      // Iniciar reprodução do áudio externo
      externalAudioService.playExternalAudio(currentTrack)
    }
  }, [currentTrack, autoPlay])

  // Atualizar progresso
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerState.isPlaying) {
        if (currentTrack?.source === 'youtube' && youtubePlayerRef.current) {
          const currentTime = youtubePlayerRef.current.getCurrentTime()
          const duration = youtubePlayerRef.current.getDuration()
          setPlayerState(prev => ({ ...prev, currentTime, duration }))
        } else if (audioRef.current) {
          setPlayerState(prev => ({
            ...prev,
            currentTime: audioRef.current?.currentTime || 0,
            duration: audioRef.current?.duration || 0
          }))
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [playerState.isPlaying, currentTrack])

  const loadYouTubeAPI = () => {
    if (window.YT) {
      initializeYouTubePlayer()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.body.appendChild(script)

    window.onYouTubeIframeAPIReady = () => {
      initializeYouTubePlayer()
    }
  }

  const initializeYouTubePlayer = () => {
    if (!currentTrack || currentTrack.source !== 'youtube') return

    const videoId = extractYouTubeVideoId(currentTrack.url)
    if (!videoId) return

    youtubePlayerRef.current = new window.YT.Player('youtube-player', {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: autoPlay ? 1 : 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0
      },
      events: {
        onReady: (event: any) => {
          setPlayerState(prev => ({ ...prev, isLoading: false }))
          if (autoPlay) {
            event.target.playVideo()
          }
        },
        onStateChange: (event: any) => {
          const state = event.data
          setPlayerState(prev => ({
            ...prev,
            isPlaying: state === window.YT.PlayerState.PLAYING,
            isLoading: state === window.YT.PlayerState.BUFFERING
          }))

          if (state === window.YT.PlayerState.ENDED) {
            handleNext()
          }
        }
      }
    })
  }

  const extractYouTubeVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const handlePlay = () => {
    if (!currentTrack) return

    setPlayerState(prev => ({ ...prev, isLoading: true }))

    if (currentTrack.source === 'youtube') {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.playVideo()
      } else {
        loadYouTubeAPI()
      }
    } else if (currentTrack.source === 'spotify') {
      // Para Spotify, usamos preview_url ou redirecionamos
      if (audioRef.current) {
        audioRef.current.play()
      } else {
        // Abrir no Spotify se não houver preview
        window.open(currentTrack.url, '_blank')
        return
      }
    }

    setPlayerState(prev => ({ ...prev, isPlaying: true, isLoading: false }))
  }

  const handlePause = () => {
    if (currentTrack?.source === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.pauseVideo()
    } else if (audioRef.current) {
      audioRef.current.pause()
    }

    setPlayerState(prev => ({ ...prev, isPlaying: false }))
  }

  const handleNext = () => {
    if (playlist.length === 0) return

    let nextIndex = playerState.currentTrackIndex + 1
    
    if (playerState.isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length)
    } else if (nextIndex >= playlist.length) {
      if (playerState.isRepeat) {
        nextIndex = 0
      } else {
        onPlaylistEnd?.()
        return
      }
    }

    const nextTrack = playlist[nextIndex]
    setPlayerState(prev => ({ ...prev, currentTrackIndex: nextIndex }))
    onTrackChange?.(nextTrack)
  }

  const handlePrevious = () => {
    if (playlist.length === 0) return

    let prevIndex = playerState.currentTrackIndex - 1
    
    if (prevIndex < 0) {
      prevIndex = playlist.length - 1
    }

    const prevTrack = playlist[prevIndex]
    setPlayerState(prev => ({ ...prev, currentTrackIndex: prevIndex }))
    onTrackChange?.(prevTrack)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !currentTrack) return

    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const seekTime = percent * playerState.duration

    if (currentTrack.source === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(seekTime)
    } else if (audioRef.current) {
      audioRef.current.currentTime = seekTime
    }

    setPlayerState(prev => ({ ...prev, currentTime: seekTime }))
  }

  const handleVolumeChange = (volume: number) => {
    const newVolume = Math.max(0, Math.min(1, volume))
    
    if (currentTrack?.source === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(newVolume * 100)
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume
    }

    setPlayerState(prev => ({ 
      ...prev, 
      volume: newVolume, 
      isMuted: newVolume === 0 
    }))
  }

  const toggleMute = () => {
    const newVolume = playerState.volume === 0 ? 0.7 : 0
    
    if (currentTrack?.source === 'youtube' && youtubePlayerRef.current) {
      if (newVolume === 0) {
        youtubePlayerRef.current.mute()
      } else {
        youtubePlayerRef.current.unMute()
        youtubePlayerRef.current.setVolume(newVolume * 100)
      }
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume
      audioRef.current.muted = newVolume === 0
    }

    setPlayerState(prev => ({ 
      ...prev, 
      volume: newVolume,
      isMuted: newVolume === 0 
    }))
    externalAudioService.setVolume(newVolume * 100)
  }

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVolumeHover = () => {
    setShowVolumeSlider(true)
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current)
    }
  }

  const handleVolumeLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false)
    }, 2000)
  }

  if (!currentTrack) {
    return (
      <div className={`audio-player-empty ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-xl p-6 text-center`}>
        <div className="text-gray-500 mb-4">
          <Volume2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Selecione um áudio para começar</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`audio-player ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-2xl overflow-hidden`}>
      {/* Player oculto do YouTube */}
      <div id="youtube-player" style={{ display: 'none' }}></div>
      
      {/* Audio element para Spotify previews */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Header com informações da faixa */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img 
              src={currentTrack.thumbnail} 
              alt={currentTrack.title}
              className="w-16 h-16 rounded-lg object-cover shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzM3NDE1MSIvPgo8cGF0aCBkPSJNMjQgMjBWNDRMMzggMzJMMjQgMjBaIiBmaWxsPSIjNkI3Mjg0Ii8+Cjwvc3ZnPgo='
              }}
            />
            {playerState.isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              </div>
            )}
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{currentTrack.title}</h3>
            <p className="text-gray-500 text-sm truncate">{currentTrack.description}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs ${
                currentTrack.source === 'youtube' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {currentTrack.source === 'youtube' ? 'YouTube' : 'Spotify'}
              </span>
              <span className="text-xs text-gray-500">{currentTrack.category}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full transition-colors ${
                isLiked 
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
            
            <motion.a
              href={currentTrack.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Abrir fonte externa"
            >
              <ExternalLink className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </div>

      {/* Controles principais */}
      <div className="p-6">
        {/* Barra de progresso */}
        <div className="mb-6">
          <div 
            ref={progressRef}
            className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${(playerState.currentTime / playerState.duration) * 100 || 0}%` }}
            />
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ left: `${(playerState.currentTime / playerState.duration) * 100 || 0}%`, marginLeft: '-8px' }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{formatTime(playerState.currentTime)}</span>
            <span>{formatTime(playerState.duration)}</span>
          </div>
        </div>

        {/* Controles de reprodução */}
        <div className="flex items-center justify-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPlayerState(prev => ({ ...prev, isShuffle: !prev.isShuffle }))}
            className={`p-2 rounded-full transition-colors ${
              playerState.isShuffle 
                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            disabled={playlist.length === 0}
            className="p-3 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipBack className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playerState.isPlaying ? handlePause : handlePlay}
            disabled={playerState.isLoading}
            className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {playerState.isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : playerState.isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={playlist.length === 0}
            className="p-3 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPlayerState(prev => ({ ...prev, isRepeat: !prev.isRepeat }))}
            className={`p-2 rounded-full transition-colors ${
              playerState.isRepeat 
                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
          >
            <Repeat className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Controle de volume */}
        <div className="flex items-center justify-end mt-6 space-x-4">
          <div 
            className="relative flex items-center space-x-2"
            onMouseEnter={handleVolumeHover}
            onMouseLeave={handleVolumeLeave}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMute}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {playerState.isMuted || playerState.volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </motion.button>

            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 100 }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={playerState.volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Playlist (se habilitada) */}
      {showPlaylist && playlist.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
          <div className="p-4">
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">Playlist</h4>
            <div className="space-y-2">
              {playlist.map((track, index) => (
                <motion.div
                  key={track.id}
                  whileHover={{ backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)' }}
                  onClick={() => {
                    setPlayerState(prev => ({ ...prev, currentTrackIndex: index }))
                    onTrackChange?.(track)
                  }}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    index === playerState.currentTrackIndex 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                      : ''
                  }`}
                >
                  <img 
                    src={track.thumbnail} 
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0iIzM3NDE1MSIvPgo8cGF0aCBkPSJNMTUgMTJWMjhMMjQgMjBMMTUgMTJaIiBmaWxsPSIjNkI3Mjg0Ii8+Cjwvc3ZnPgo='
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{track.title}</p>
                    <p className="text-xs text-gray-500 truncate">{track.duration}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    track.source === 'youtube' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {track.source === 'youtube' ? 'YT' : 'SP'}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}

export default AudioPlayer