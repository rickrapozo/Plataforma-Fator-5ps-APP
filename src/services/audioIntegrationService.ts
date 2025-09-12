interface AudioTrack {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  source: 'youtube' | 'spotify'
  url: string
  category: string
  tags: string[]
  rating?: number
  plays?: number
}

interface YouTubeSearchResult {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    thumbnails: {
      default: { url: string }
      medium: { url: string }
      high: { url: string }
    }
    publishedAt: string
    channelTitle: string
  }
  contentDetails?: {
    duration: string
  }
}

interface SpotifySearchResult {
  tracks: {
    items: Array<{
      id: string
      name: string
      artists: Array<{ name: string }>
      album: {
        name: string
        images: Array<{ url: string; height: number; width: number }>
      }
      duration_ms: number
      external_urls: { spotify: string }
      preview_url: string | null
    }>
  }
}

class AudioIntegrationService {
  private static instance: AudioIntegrationService
  private readonly youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyBt4vyuZZhxDd5Vz1I4WfkTzKWht7SdcNA'
  private readonly spotifyClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
  private readonly spotifyClientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || ''
  private spotifyAccessToken: string | null = null
  private spotifyTokenExpiry: number = 0

  // Mapeamento de temas para termos de busca otimizados
  private readonly themeSearchTerms: Record<string, string[]> = {
    'Prosperidade': [
      'abundance meditation music',
      'prosperity affirmations',
      'wealth mindset music',
      'financial success meditation',
      'money manifestation sounds'
    ],
    'Foco': [
      'focus concentration music',
      'deep work ambient',
      'productivity meditation',
      'concentration enhancement',
      'brain focus frequencies'
    ],
    'Confiança': [
      'confidence building meditation',
      'self esteem affirmations',
      'confidence boost music',
      'self worth meditation',
      'empowerment sounds'
    ],
    'Sono': [
      'sleep meditation music',
      'deep sleep sounds',
      'bedtime relaxation',
      'insomnia relief music',
      'peaceful sleep meditation'
    ],
    'Relacionamentos': [
      'relationship healing meditation',
      'love attraction music',
      'heart chakra healing',
      'emotional healing sounds',
      'relationship harmony meditation'
    ],
    'Ansiedade': [
      'anxiety relief meditation',
      'calm anxiety music',
      'stress reduction sounds',
      'peaceful meditation',
      'anxiety healing frequencies'
    ],
    'Autoestima': [
      'self love meditation',
      'self acceptance music',
      'inner strength sounds',
      'self confidence meditation',
      'positive self image music'
    ],
    'Mindfulness': [
      'mindfulness meditation music',
      'present moment awareness',
      'mindful breathing sounds',
      'consciousness meditation',
      'awareness enhancement music'
    ]
  }

  static getInstance(): AudioIntegrationService {
    if (!AudioIntegrationService.instance) {
      AudioIntegrationService.instance = new AudioIntegrationService()
    }
    return AudioIntegrationService.instance
  }

  // Buscar áudios por tema específico
  async searchAudiosByTheme(theme: string, limit: number = 10): Promise<AudioTrack[]> {
    const searchTerms = this.themeSearchTerms[theme] || [theme]
    const allTracks: AudioTrack[] = []

    try {
      // Buscar no YouTube
      for (const term of searchTerms.slice(0, 2)) { // Limitar a 2 termos por tema
        const youtubeTracks = await this.searchYouTube(term, Math.ceil(limit / 4))
        allTracks.push(...youtubeTracks)
      }

      // Buscar no Spotify
      for (const term of searchTerms.slice(0, 2)) {
        const spotifyTracks = await this.searchSpotify(term, Math.ceil(limit / 4))
        allTracks.push(...spotifyTracks)
      }

      // Remover duplicatas e limitar resultados
      const uniqueTracks = this.removeDuplicates(allTracks)
      return uniqueTracks.slice(0, limit)
    } catch (error) {
      console.error('Erro ao buscar áudios por tema:', error)
      return this.getFallbackTracks(theme)
    }
  }

  // Buscar no YouTube
  private async searchYouTube(query: string, maxResults: number = 5): Promise<AudioTrack[]> {
    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoDuration=medium&videoDefinition=high&maxResults=${maxResults}&key=${this.youtubeApiKey}`
      
      const response = await fetch(searchUrl)
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`)
      }

      const data = await response.json()
      const videoIds = data.items.map((item: YouTubeSearchResult) => item.id.videoId).join(',')
      
      // Buscar detalhes dos vídeos para obter duração
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${this.youtubeApiKey}`
      const detailsResponse = await fetch(detailsUrl)
      const detailsData = await detailsResponse.json()

      return data.items.map((item: YouTubeSearchResult, index: number) => {
        const details = detailsData.items[index]
        return {
          id: `yt_${item.id.videoId}`,
          title: item.snippet.title,
          description: item.snippet.description.substring(0, 200) + '...',
          duration: this.formatYouTubeDuration(details?.contentDetails?.duration || 'PT0S'),
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
          source: 'youtube' as const,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          category: this.inferCategoryFromTitle(item.snippet.title),
          tags: this.extractTagsFromTitle(item.snippet.title),
          rating: 4.5 + Math.random() * 0.5, // Rating simulado
          plays: Math.floor(Math.random() * 10000) + 1000
        }
      })
    } catch (error) {
      console.error('Erro na busca do YouTube:', error)
      return []
    }
  }

  // Buscar no Spotify
  private async searchSpotify(query: string, limit: number = 5): Promise<AudioTrack[]> {
    try {
      await this.ensureSpotifyToken()
      
      if (!this.spotifyAccessToken) {
        console.warn('Token do Spotify não disponível')
        return []
      }

      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${this.spotifyAccessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`)
      }

      const data: SpotifySearchResult = await response.json()
      
      return data.tracks.items.map(track => ({
        id: `sp_${track.id}`,
        title: track.name,
        description: `${track.artists.map(a => a.name).join(', ')} - ${track.album.name}`,
        duration: this.formatSpotifyDuration(track.duration_ms),
        thumbnail: track.album.images[1]?.url || track.album.images[0]?.url || '',
        source: 'spotify' as const,
        url: track.external_urls.spotify,
        category: this.inferCategoryFromTitle(track.name),
        tags: this.extractTagsFromTitle(track.name),
        rating: 4.0 + Math.random() * 1.0,
        plays: Math.floor(Math.random() * 50000) + 5000
      }))
    } catch (error) {
      console.error('Erro na busca do Spotify:', error)
      return []
    }
  }

  // Garantir token válido do Spotify
  private async ensureSpotifyToken(): Promise<void> {
    if (this.spotifyAccessToken && Date.now() < this.spotifyTokenExpiry) {
      return
    }

    if (!this.spotifyClientId || !this.spotifyClientSecret) {
      console.warn('Credenciais do Spotify não configuradas')
      return
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.spotifyClientId}:${this.spotifyClientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        throw new Error(`Spotify token error: ${response.status}`)
      }

      const data = await response.json()
      this.spotifyAccessToken = data.access_token
      this.spotifyTokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // 1 minuto de margem
    } catch (error) {
      console.error('Erro ao obter token do Spotify:', error)
    }
  }

  // Utilitários
  private formatYouTubeDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return '0:00'
    
    const hours = parseInt(match[1]?.replace('H', '') || '0')
    const minutes = parseInt(match[2]?.replace('M', '') || '0')
    const seconds = parseInt(match[3]?.replace('S', '') || '0')
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  private formatSpotifyDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  private inferCategoryFromTitle(title: string): string {
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('sleep') || lowerTitle.includes('sono')) return 'Sono'
    if (lowerTitle.includes('focus') || lowerTitle.includes('foco')) return 'Foco'
    if (lowerTitle.includes('confidence') || lowerTitle.includes('confiança')) return 'Confiança'
    if (lowerTitle.includes('prosperity') || lowerTitle.includes('abundance')) return 'Prosperidade'
    if (lowerTitle.includes('relationship') || lowerTitle.includes('love')) return 'Relacionamentos'
    if (lowerTitle.includes('anxiety') || lowerTitle.includes('calm')) return 'Ansiedade'
    if (lowerTitle.includes('self') || lowerTitle.includes('autoestima')) return 'Autoestima'
    if (lowerTitle.includes('mindful') || lowerTitle.includes('meditation')) return 'Mindfulness'
    
    return 'Geral'
  }

  private extractTagsFromTitle(title: string): string[] {
    const commonTags = ['meditation', 'music', 'relaxation', 'healing', 'therapy', 'mindfulness', 'sleep', 'focus']
    const lowerTitle = title.toLowerCase()
    return commonTags.filter(tag => lowerTitle.includes(tag))
  }

  private removeDuplicates(tracks: AudioTrack[]): AudioTrack[] {
    const seen = new Set<string>()
    return tracks.filter(track => {
      const key = track.title.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // Tracks de fallback para quando as APIs falham
  private getFallbackTracks(theme: string): AudioTrack[] {
    const fallbackTracks: Record<string, AudioTrack[]> = {
      'Prosperidade': [
        {
          id: 'fallback_prosperity_1',
          title: 'Meditação da Abundância Financeira',
          description: 'Reprogramação mental para atrair prosperidade e abundância',
          duration: '15:30',
          thumbnail: '💰',
          source: 'youtube',
          url: '#',
          category: 'Prosperidade',
          tags: ['meditação', 'abundância', 'dinheiro'],
          rating: 4.8,
          plays: 12500
        }
      ],
      'Foco': [
        {
          id: 'fallback_focus_1',
          title: 'Sons Binaurais para Concentração',
          description: 'Frequências especiais para melhorar o foco e produtividade',
          duration: '30:00',
          thumbnail: '🎯',
          source: 'youtube',
          url: '#',
          category: 'Foco',
          tags: ['binaural', 'concentração', 'produtividade'],
          rating: 4.9,
          plays: 8900
        }
      ]
    }

    return fallbackTracks[theme] || []
  }

  // Buscar áudios recomendados baseados no histórico do usuário
  async getRecommendedAudios(userPreferences: string[], limit: number = 5): Promise<AudioTrack[]> {
    const recommendations: AudioTrack[] = []
    
    for (const preference of userPreferences) {
      const tracks = await this.searchAudiosByTheme(preference, Math.ceil(limit / userPreferences.length))
      recommendations.push(...tracks)
    }

    return this.removeDuplicates(recommendations).slice(0, limit)
  }

  // Obter áudios populares por categoria
  async getPopularAudiosByCategory(category: string, limit: number = 10): Promise<AudioTrack[]> {
    return this.searchAudiosByTheme(category, limit)
  }

  // Buscar áudios por palavra-chave livre
  async searchAudios(query: string, limit: number = 20): Promise<AudioTrack[]> {
    const youtubeTracks = await this.searchYouTube(query, Math.ceil(limit / 2))
    const spotifyTracks = await this.searchSpotify(query, Math.ceil(limit / 2))
    
    const allTracks = [...youtubeTracks, ...spotifyTracks]
    return this.removeDuplicates(allTracks).slice(0, limit)
  }
}

export default AudioIntegrationService
export type { AudioTrack }