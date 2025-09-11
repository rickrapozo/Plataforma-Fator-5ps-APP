interface ThemeMapping {
  theme: string
  keywords: string[]
  searchTerms: string[]
  relatedThemes: string[]
  priority: number
  audioTypes: ('meditation' | 'music' | 'affirmations' | 'binaural' | 'nature')[] 
}

interface AudioRecommendation {
  audioId: string
  relevanceScore: number
  matchedKeywords: string[]
  recommendationReason: string
}

class ThemeMatchingService {
  private static instance: ThemeMatchingService
  
  // Mapeamento detalhado de temas para otimizar buscas
  private readonly themeMap: Record<string, ThemeMapping> = {
    'Prosperidade': {
      theme: 'Prosperidade',
      keywords: [
        'abundância', 'riqueza', 'dinheiro', 'sucesso financeiro', 'prosperidade',
        'manifestação', 'lei da atração', 'abundância financeira', 'wealth',
        'money', 'abundance', 'prosperity', 'financial success', 'rich mindset'
      ],
      searchTerms: [
        'abundance meditation music',
        'prosperity affirmations',
        'wealth mindset meditation',
        'financial success subliminal',
        'money manifestation frequencies',
        'abundance binaural beats',
        'prosperity visualization music',
        'wealth attraction meditation'
      ],
      relatedThemes: ['Confiança', 'Autoestima', 'Mindfulness'],
      priority: 9,
      audioTypes: ['meditation', 'affirmations', 'binaural', 'music']
    },
    
    'Foco': {
      theme: 'Foco',
      keywords: [
        'concentração', 'foco', 'atenção', 'produtividade', 'estudo',
        'trabalho', 'performance', 'focus', 'concentration', 'attention',
        'productivity', 'study', 'work', 'performance', 'deep work'
      ],
      searchTerms: [
        'focus concentration music',
        'deep work ambient sounds',
        'productivity meditation',
        'concentration enhancement binaural',
        'brain focus frequencies',
        'study music concentration',
        'attention improvement meditation',
        'cognitive enhancement sounds'
      ],
      relatedThemes: ['Mindfulness', 'Ansiedade'],
      priority: 8,
      audioTypes: ['binaural', 'music', 'meditation', 'nature']
    },
    
    'Confiança': {
      theme: 'Confiança',
      keywords: [
        'confiança', 'autoconfiança', 'segurança', 'coragem', 'determinação',
        'força interior', 'confidence', 'self confidence', 'courage',
        'inner strength', 'self assurance', 'empowerment'
      ],
      searchTerms: [
        'confidence building meditation',
        'self confidence affirmations',
        'courage meditation music',
        'inner strength subliminal',
        'empowerment meditation',
        'self assurance binaural beats',
        'confidence boost frequencies',
        'personal power meditation'
      ],
      relatedThemes: ['Autoestima', 'Prosperidade', 'Relacionamentos'],
      priority: 8,
      audioTypes: ['meditation', 'affirmations', 'music', 'binaural']
    },
    
    'Sono': {
      theme: 'Sono',
      keywords: [
        'sono', 'dormir', 'relaxamento', 'descanso', 'insônia', 'sleep',
        'rest', 'relaxation', 'bedtime', 'insomnia', 'deep sleep',
        'peaceful sleep', 'sleep meditation', 'night time'
      ],
      searchTerms: [
        'sleep meditation music',
        'deep sleep sounds',
        'bedtime relaxation music',
        'insomnia relief meditation',
        'peaceful sleep meditation',
        'sleep hypnosis',
        'night time meditation',
        'sleep inducing frequencies'
      ],
      relatedThemes: ['Ansiedade', 'Mindfulness'],
      priority: 9,
      audioTypes: ['meditation', 'nature', 'binaural', 'music']
    },
    
    'Relacionamentos': {
      theme: 'Relacionamentos',
      keywords: [
        'relacionamentos', 'amor', 'família', 'amizade', 'parceria',
        'comunicação', 'relationships', 'love', 'family', 'friendship',
        'partnership', 'communication', 'heart chakra', 'emotional healing'
      ],
      searchTerms: [
        'relationship healing meditation',
        'love attraction meditation',
        'heart chakra healing music',
        'emotional healing sounds',
        'relationship harmony meditation',
        'love frequency meditation',
        'heart opening meditation',
        'compassion meditation music'
      ],
      relatedThemes: ['Autoestima', 'Confiança', 'Ansiedade'],
      priority: 7,
      audioTypes: ['meditation', 'music', 'affirmations', 'binaural']
    },
    
    'Ansiedade': {
      theme: 'Ansiedade',
      keywords: [
        'ansiedade', 'estresse', 'calma', 'tranquilidade', 'paz', 'serenidade',
        'anxiety', 'stress', 'calm', 'peace', 'tranquility', 'serenity',
        'stress relief', 'anxiety relief', 'relaxation', 'peaceful'
      ],
      searchTerms: [
        'anxiety relief meditation',
        'calm anxiety music',
        'stress reduction sounds',
        'peaceful meditation music',
        'anxiety healing frequencies',
        'calming meditation',
        'stress relief binaural beats',
        'tranquility meditation'
      ],
      relatedThemes: ['Sono', 'Mindfulness', 'Relacionamentos'],
      priority: 9,
      audioTypes: ['meditation', 'nature', 'binaural', 'music']
    },
    
    'Autoestima': {
      theme: 'Autoestima',
      keywords: [
        'autoestima', 'amor próprio', 'autoaceitação', 'valorização pessoal',
        'self esteem', 'self love', 'self acceptance', 'self worth',
        'personal value', 'self appreciation', 'inner beauty'
      ],
      searchTerms: [
        'self love meditation',
        'self esteem affirmations',
        'self acceptance music',
        'inner beauty meditation',
        'self worth subliminal',
        'personal value meditation',
        'self appreciation frequencies',
        'loving kindness meditation'
      ],
      relatedThemes: ['Confiança', 'Relacionamentos', 'Prosperidade'],
      priority: 8,
      audioTypes: ['meditation', 'affirmations', 'music', 'binaural']
    },
    
    'Mindfulness': {
      theme: 'Mindfulness',
      keywords: [
        'mindfulness', 'atenção plena', 'consciência', 'presente', 'meditação',
        'awareness', 'present moment', 'meditation', 'consciousness',
        'mindful breathing', 'mindful awareness', 'present awareness'
      ],
      searchTerms: [
        'mindfulness meditation music',
        'present moment awareness',
        'mindful breathing sounds',
        'consciousness meditation',
        'awareness enhancement music',
        'mindfulness practice music',
        'present moment meditation',
        'mindful awareness sounds'
      ],
      relatedThemes: ['Foco', 'Ansiedade', 'Sono'],
      priority: 7,
      audioTypes: ['meditation', 'nature', 'music', 'binaural']
    }
  }

  static getInstance(): ThemeMatchingService {
    if (!ThemeMatchingService.instance) {
      ThemeMatchingService.instance = new ThemeMatchingService()
    }
    return ThemeMatchingService.instance
  }

  // Obter termos de busca otimizados para um tema
  getSearchTermsForTheme(theme: string): string[] {
    const mapping = this.themeMap[theme]
    if (!mapping) {
      return [theme.toLowerCase()]
    }
    return mapping.searchTerms
  }

  // Obter palavras-chave para um tema
  getKeywordsForTheme(theme: string): string[] {
    const mapping = this.themeMap[theme]
    if (!mapping) {
      return [theme.toLowerCase()]
    }
    return mapping.keywords
  }

  // Calcular relevância de um áudio para um tema específico
  calculateRelevanceScore(audioTitle: string, audioDescription: string, audioTags: string[], targetTheme: string): number {
    const mapping = this.themeMap[targetTheme]
    if (!mapping) return 0

    let score = 0
    const content = `${audioTitle} ${audioDescription} ${audioTags.join(' ')}`.toLowerCase()
    
    // Pontuação por palavras-chave encontradas
    mapping.keywords.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        score += 10
      }
    })

    // Pontuação por termos de busca encontrados
    mapping.searchTerms.forEach(term => {
      const termWords = term.toLowerCase().split(' ')
      const matchedWords = termWords.filter(word => content.includes(word))
      score += (matchedWords.length / termWords.length) * 15
    })

    // Pontuação por temas relacionados
    mapping.relatedThemes.forEach(relatedTheme => {
      const relatedMapping = this.themeMap[relatedTheme]
      if (relatedMapping) {
        relatedMapping.keywords.forEach(keyword => {
          if (content.includes(keyword.toLowerCase())) {
            score += 3
          }
        })
      }
    })

    // Normalizar score (0-100)
    return Math.min(100, Math.max(0, score))
  }

  // Recomendar áudios baseado em múltiplos temas
  recommendAudiosForThemes(audios: any[], themes: string[], limit: number = 10): AudioRecommendation[] {
    const recommendations: AudioRecommendation[] = []

    audios.forEach(audio => {
      let maxScore = 0
      let bestTheme = ''
      let matchedKeywords: string[] = []

      themes.forEach(theme => {
        const score = this.calculateRelevanceScore(
          audio.title, 
          audio.description, 
          audio.tags || [], 
          theme
        )
        
        if (score > maxScore) {
          maxScore = score
          bestTheme = theme
          matchedKeywords = this.getMatchedKeywords(audio, theme)
        }
      })

      if (maxScore > 20) { // Threshold mínimo
        recommendations.push({
          audioId: audio.id,
          relevanceScore: maxScore,
          matchedKeywords,
          recommendationReason: `Altamente relevante para ${bestTheme} (${maxScore.toFixed(0)}% de compatibilidade)`
        })
      }
    })

    // Ordenar por relevância e limitar resultados
    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
  }

  // Obter palavras-chave que fizeram match
  private getMatchedKeywords(audio: any, theme: string): string[] {
    const mapping = this.themeMap[theme]
    if (!mapping) return []

    const content = `${audio.title} ${audio.description} ${(audio.tags || []).join(' ')}`.toLowerCase()
    const matched: string[] = []

    mapping.keywords.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        matched.push(keyword)
      }
    })

    return matched.slice(0, 5) // Limitar a 5 palavras-chave
  }

  // Sugerir temas relacionados
  getRelatedThemes(theme: string): string[] {
    const mapping = this.themeMap[theme]
    return mapping ? mapping.relatedThemes : []
  }

  // Obter todos os temas disponíveis ordenados por prioridade
  getAllThemes(): string[] {
    return Object.values(this.themeMap)
      .sort((a, b) => b.priority - a.priority)
      .map(mapping => mapping.theme)
  }

  // Obter tipos de áudio recomendados para um tema
  getRecommendedAudioTypes(theme: string): string[] {
    const mapping = this.themeMap[theme]
    return mapping ? mapping.audioTypes : ['meditation', 'music']
  }

  // Gerar query de busca otimizada para um tema
  generateOptimizedSearchQuery(theme: string, audioType?: string): string {
    const mapping = this.themeMap[theme]
    if (!mapping) return theme

    // Selecionar termo de busca baseado no tipo de áudio
    let selectedTerm = mapping.searchTerms[0]
    
    if (audioType) {
      const typeSpecificTerm = mapping.searchTerms.find(term => 
        term.toLowerCase().includes(audioType.toLowerCase())
      )
      if (typeSpecificTerm) {
        selectedTerm = typeSpecificTerm
      }
    }

    return selectedTerm
  }

  // Analisar preferências do usuário baseado no histórico
  analyzeUserPreferences(playHistory: any[]): { preferredThemes: string[], recommendedThemes: string[] } {
    const themeCount: Record<string, number> = {}
    const audioTypeCount: Record<string, number> = {}

    // Contar temas e tipos mais ouvidos
    playHistory.forEach(audio => {
      if (audio.category) {
        themeCount[audio.category] = (themeCount[audio.category] || 0) + 1
      }
      if (audio.source) {
        audioTypeCount[audio.source] = (audioTypeCount[audio.source] || 0) + 1
      }
    })

    // Temas preferidos (mais ouvidos)
    const preferredThemes = Object.entries(themeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme)

    // Temas recomendados baseado nos preferidos
    const recommendedThemes = new Set<string>()
    preferredThemes.forEach(theme => {
      this.getRelatedThemes(theme).forEach(related => {
        if (!preferredThemes.includes(related)) {
          recommendedThemes.add(related)
        }
      })
    })

    return {
      preferredThemes,
      recommendedThemes: Array.from(recommendedThemes).slice(0, 3)
    }
  }

  // Filtrar áudios por múltiplos critérios
  filterAudiosByCriteria(audios: any[], criteria: {
    themes?: string[]
    audioTypes?: string[]
    minDuration?: number
    maxDuration?: number
    minRating?: number
    sources?: ('youtube' | 'spotify')[]
  }): any[] {
    return audios.filter(audio => {
      // Filtro por tema
      if (criteria.themes && criteria.themes.length > 0) {
        const hasMatchingTheme = criteria.themes.some(theme => {
          const score = this.calculateRelevanceScore(
            audio.title, 
            audio.description, 
            audio.tags || [], 
            theme
          )
          return score > 30
        })
        if (!hasMatchingTheme) return false
      }

      // Filtro por fonte
      if (criteria.sources && criteria.sources.length > 0) {
        if (!criteria.sources.includes(audio.source)) return false
      }

      // Filtro por rating
      if (criteria.minRating && audio.rating && audio.rating < criteria.minRating) {
        return false
      }

      // Filtro por duração (converter string para segundos)
      if (criteria.minDuration || criteria.maxDuration) {
        const durationInSeconds = this.parseDurationToSeconds(audio.duration)
        if (criteria.minDuration && durationInSeconds < criteria.minDuration) return false
        if (criteria.maxDuration && durationInSeconds > criteria.maxDuration) return false
      }

      return true
    })
  }

  // Converter duração string para segundos
  private parseDurationToSeconds(duration: string): number {
    if (!duration) return 0
    
    const parts = duration.split(':')
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1])
    } else if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
    }
    
    return 0
  }
}

export default ThemeMatchingService
export type { ThemeMapping, AudioRecommendation }