import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Tag, Heart, ExternalLink } from 'lucide-react';
import { AudioTrack } from '../../services/audioIntegrationService';

interface AudioCardProps {
  audio: AudioTrack;
  onPlay: (audio: AudioTrack) => void;
  isPlaying?: boolean;
}

const AudioCard: React.FC<AudioCardProps> = ({ audio, onPlay, isPlaying = false }) => {
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'relaxing': return 'from-blue-500/20 to-indigo-500/20 border-blue-400/30';
      case 'energizing': return 'from-orange-500/20 to-red-500/20 border-orange-400/30';
      case 'focused': return 'from-purple-500/20 to-violet-500/20 border-purple-400/30';
      case 'peaceful': return 'from-green-500/20 to-emerald-500/20 border-green-400/30';
      case 'inspiring': return 'from-yellow-500/20 to-amber-500/20 border-yellow-400/30';
      default: return 'from-gray-500/20 to-slate-500/20 border-gray-400/30';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'relaxing': return '🧘';
      case 'energizing': return '⚡';
      case 'focused': return '🎯';
      case 'peaceful': return '🕊️';
      case 'inspiring': return '✨';
      default: return '🎵';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`relative group bg-gradient-to-br ${getMoodColor(audio.mood)} backdrop-blur-sm border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300`}
    >
      {/* Thumbnail com overlay */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={audio.thumbnail}
          alt={audio.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop';
          }}
        />
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Mood indicator */}
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white flex items-center gap-1">
          <span>{getMoodIcon(audio.mood)}</span>
          <span className="capitalize">{audio.mood}</span>
        </div>
        
        {/* Play button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onPlay(audio)}
          className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            isPlaying 
              ? 'bg-royal-gold text-white shadow-lg' 
              : 'bg-white/20 backdrop-blur-sm text-white hover:bg-royal-gold hover:text-white'
          }`}
        >
          <Play className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} fill={isPlaying ? 'currentColor' : 'none'} />
        </motion.button>
        
        {/* Duration */}
        <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{audio.duration}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Artist */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-royal-gold transition-colors">
            {audio.title}
          </h3>
          <p className="text-pearl-white/70 text-sm">
            {audio.artist}
          </p>
        </div>
        
        {/* Description */}
        <p className="text-pearl-white/60 text-sm line-clamp-2 leading-relaxed">
          {audio.description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {audio.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-xs text-pearl-white/80"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
          {audio.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 bg-white/10 rounded-full text-xs text-pearl-white/60">
              +{audio.tags.length - 3}
            </span>
          )}
        </div>
        
        {/* Footer with external links */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            {audio.youtubeUrl && (
              <motion.a
                href={audio.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                title="Abrir no YouTube"
              >
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            )}
            {audio.spotifyUrl && (
              <motion.a
                href={audio.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 bg-green-500/20 hover:bg-green-500/30 rounded-full flex items-center justify-center text-green-400 hover:text-green-300 transition-colors"
                title="Abrir no Spotify"
              >
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            )}
          </div>
          
          {/* Like button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-pearl-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Adicionar aos favoritos"
          >
            <Heart className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-royal-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default AudioCard;