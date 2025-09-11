import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Play, Crown, Star, Loader, RefreshCw, Music, Headphones } from 'lucide-react'
import AudioPlayer from '../../components/audio/AudioPlayer'
import AudioCard from '../../components/audio/AudioCard'
import { AudioTrack } from '../../services/audioIntegrationService';
import { audioLibrary, categories, getAudiosByCategory, searchAudios, AudioTrack as LibraryAudioTrack } from '../../data/audioLibrary';

const MindVaultPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [filteredAudios, setFilteredAudios] = useState<AudioTrack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [playlist, setPlaylist] = useState<AudioTrack[]>([])
  const [showPlayer, setShowPlayer] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Converter LibraryAudioTrack para AudioTrack
  const convertToAudioTrack = (libraryTrack: LibraryAudioTrack): AudioTrack => ({
    id: libraryTrack.id,
    title: libraryTrack.title,
    description: libraryTrack.description,
    duration: libraryTrack.duration,
    thumbnail: libraryTrack.thumbnail,
    source: libraryTrack.youtubeUrl ? 'youtube' as const : 'spotify' as const,
    url: libraryTrack.youtubeUrl || libraryTrack.spotifyUrl || '',
    category: libraryTrack.category,
    tags: libraryTrack.tags
  })

  // Carregar áudios automaticamente por categoria
  useEffect(() => {
    loadAudiosByCategory(selectedCategory)
  }, [selectedCategory])

  // Aplicar filtro de busca quando searchTerm muda
  useEffect(() => {
    if (searchTerm.trim()) {
      const searchResults = searchAudios(searchTerm)
      const convertedResults = searchResults.map(convertToAudioTrack)
      setFilteredAudios(convertedResults)
    } else {
      loadAudiosByCategory(selectedCategory)
    }
  }, [searchTerm])

  const loadAudiosByCategory = (category: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const audios = getAudiosByCategory(category)
      const convertedAudios = audios.map(convertToAudioTrack)
      setFilteredAudios(convertedAudios)
    } catch (err) {
      console.error('Erro ao carregar áudios:', err)
      setError('Erro ao carregar áudios da biblioteca.')
      setFilteredAudios([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      loadAudiosByCategory(selectedCategory)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const searchResults = searchAudios(searchTerm)
      const convertedResults = searchResults.map(convertToAudioTrack)
      setFilteredAudios(convertedResults)
    } catch (err) {
      console.error('Erro na busca:', err)
      setError('Erro na busca.')
      setFilteredAudios([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayAudio = (audio: AudioTrack) => {
    setCurrentTrack(audio)
    setPlaylist(filteredAudios)
    setShowPlayer(true)
  }

  const handleTrackChange = (track: AudioTrack) => {
    setCurrentTrack(track)
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-white text-3xl font-heading font-bold mb-4">
          Cofre da Mente
        </h1>
        <p className="text-pearl-white/80 text-body-lg">
          Biblioteca de áudios para reprogramação mental
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-6"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pearl-white/60" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-pearl-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-royal-gold transition-all"
          placeholder="Buscar áudios na biblioteca..."
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
          disabled={isLoading}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full text-pearl-white/60 hover:text-royal-gold transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </motion.button>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex space-x-2 overflow-x-auto pb-2 mb-6"
      >
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            disabled={isLoading}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all disabled:opacity-50 ${
              selectedCategory === category
                ? 'bg-royal-gold text-white shadow-lg'
                : 'bg-white/10 text-pearl-white/80 hover:bg-white/20'
            }`}
          >
            {category}
            {isLoading && selectedCategory === category && (
              <Loader className="w-3 h-3 ml-2 animate-spin inline" />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Stats Bar */}
      {filteredAudios.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4 text-pearl-white/80">
            <div className="flex items-center space-x-2">
              <Music className="w-4 h-4" />
              <span className="text-sm">{filteredAudios.length} áudios encontrados</span>
            </div>
            <div className="flex items-center space-x-2">
              <Headphones className="w-4 h-4" />
              <span className="text-sm">
                Biblioteca Local
              </span>
            </div>
          </div>
          {currentTrack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPlayer(!showPlayer)}
              className="px-3 py-1 bg-royal-gold/20 text-royal-gold rounded-full text-sm font-medium hover:bg-royal-gold/30 transition-colors"
            >
              {showPlayer ? 'Ocultar Player' : 'Mostrar Player'}
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 mb-6 bg-red-500/10 border border-red-500/20"
        >
          <p className="text-red-300 text-center">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loadAudiosByCategory(selectedCategory)}
            className="mt-2 mx-auto block px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Tentar Novamente
          </motion.button>
        </motion.div>
      )}

      {/* Audio Player */}
      <AnimatePresence>
        {showPlayer && currentTrack && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="mb-6"
          >
            <AudioPlayer
              currentTrack={currentTrack}
              playlist={playlist}
              onTrackChange={handleTrackChange}
              autoPlay={true}
              showPlaylist={true}
              theme="dark"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-royal-gold" />
          <p className="text-pearl-white/60 text-lg">
            Carregando áudios da biblioteca...
          </p>
        </motion.div>
      )}

      {/* Audio Grid */}
      {!isLoading && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence>
            {filteredAudios.map((audio, index) => (
              <motion.div
                key={audio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <AudioCard
                  audio={audio}
                  onPlay={handlePlayAudio}
                  isPlaying={currentTrack?.id === audio.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!isLoading && filteredAudios.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Music className="w-16 h-16 mx-auto mb-4 text-pearl-white/30" />
          <p className="text-pearl-white/60 text-lg mb-2">
            {searchTerm.trim() 
              ? `Nenhum áudio encontrado para "${searchTerm}"` 
              : `Nenhum áudio encontrado na categoria "${selectedCategory}"`
            }
          </p>
          <p className="text-pearl-white/40 text-sm mb-4">
            Tente buscar por outros termos ou selecione uma categoria diferente
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('Todos')
            }}
            className="px-6 py-2 bg-royal-gold/20 text-royal-gold rounded-full hover:bg-royal-gold/30 transition-colors"
          >
            Ver Todos os Áudios
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

export default MindVaultPage