import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Play, Crown, Star } from 'lucide-react'

const MindVaultPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentCategory, setCurrentCategory] = useState('Todos')

  const categories = ['Todos', 'Prosperidade', 'Foco', 'Confiança', 'Sono', 'Relacionamentos']
  
  const audioLibrary = [
    {
      id: 'prosperity-meditation',
      title: 'Meditação da Prosperidade',
      description: 'Reprogramação profunda para abundância financeira',
      duration: '15:30',
      category: 'Prosperidade',
      thumbnail: '💰',
      isPremium: false,
      plays: 1250,
      rating: 4.9
    },
    {
      id: 'focus-enhancement',
      title: 'Potencializador de Foco',
      description: 'Elimine distrações e maximize sua concentração',
      duration: '12:45',
      category: 'Foco',
      thumbnail: '🎯',
      isPremium: true,
      plays: 980,
      rating: 4.8
    },
    {
      id: 'sleep-reprogramming',
      title: 'Reprogramação no Sono',
      description: 'Transforme sua mente enquanto dorme',
      duration: '45:00',
      category: 'Sono',
      thumbnail: '🌙',
      isPremium: true,
      plays: 2100,
      rating: 4.95
    }
  ]

  const filteredAudios = audioLibrary.filter(audio => {
    const matchesCategory = currentCategory === 'Todos' || audio.category === currentCategory
    const matchesSearch = audio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         audio.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-pearl-white/60 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-royal-gold transition-all"
          placeholder="Buscar áudios..."
        />
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex space-x-2 overflow-x-auto pb-2 mb-6"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setCurrentCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              currentCategory === category
                ? 'bg-royal-gold text-white'
                : 'bg-white/10 text-pearl-white/80 hover:bg-white/20'
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Audio Grid */}
      <div className="space-y-4">
        {filteredAudios.map((audio, index) => (
          <motion.div
            key={audio.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="glass-card p-4 flex items-center space-x-4"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 bg-gradient-to-br from-royal-gold to-bright-gold rounded-lg flex items-center justify-center text-2xl relative">
              {audio.thumbnail}
              {audio.isPremium && (
                <Crown className="absolute -top-1 -right-1 w-4 h-4 text-royal-gold bg-white rounded-full p-0.5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg mb-1">
                {audio.title}
              </h3>
              <p className="text-pearl-white/70 text-sm mb-2">
                {audio.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-pearl-white/60">
                <span>{audio.duration}</span>
                <span>{audio.category}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-current text-royal-gold" />
                  <span>{audio.rating}</span>
                </div>
                <span>{audio.plays.toLocaleString()} plays</span>
              </div>
            </div>

            {/* Play Button */}
            <motion.button
              className="w-12 h-12 bg-royal-gold rounded-full flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <Play className="w-6 h-6 text-white ml-0.5" />
            </motion.button>
          </motion.div>
        ))}
      </div>

      {filteredAudios.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-pearl-white/60 text-lg">
            Nenhum áudio encontrado para "{searchQuery}" na categoria "{currentCategory}"
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default MindVaultPage