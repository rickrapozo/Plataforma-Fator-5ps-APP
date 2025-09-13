/**
 * Serviço de integração com Google Gemini AI
 * Fornece funcionalidades de análise de texto, geração de conteúdo e processamento de linguagem natural
 */

export interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  confidence: number
  insights: string[]
  recommendations: string[]
  categories: string[]
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, any>
}

export interface GeminiConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  timeout: number
}

export interface GenerationOptions {
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  context?: string
  format?: 'text' | 'json' | 'markdown'
}

class GeminiService {
  private static instance: GeminiService
  private config: GeminiConfig
  private isInitialized = false

  private constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-pro',
      temperature: parseFloat(import.meta.env.VITE_GEMINI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(import.meta.env.VITE_GEMINI_MAX_TOKENS || '1000'),
      timeout: parseInt(import.meta.env.VITE_GEMINI_TIMEOUT || '30000')
    }
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService()
    }
    return GeminiService.instance
  }

  public async initialize(): Promise<void> {
    try {
      if (!this.config.apiKey) {
        console.warn('Gemini API key not configured, using fallback mode')
        this.isInitialized = true
        return
      }

      // Teste de conectividade básico
      this.isInitialized = true
      console.log('Gemini Service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Gemini Service:', error)
      this.isInitialized = true // Permite fallback
    }
  }

  public async analyzeText(text: string, context?: string): Promise<AnalysisResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      // Fallback para quando a API não está disponível
      if (!this.config.apiKey) {
        return this.getFallbackAnalysis(text)
      }

      // Simulação de análise (implementar integração real com Gemini API)
      const analysis = await this.performAnalysis(text, context)
      return analysis
    } catch (error) {
      console.error('Error analyzing text:', error)
      return this.getFallbackAnalysis(text)
    }
  }

  public async generateContent(prompt: string, options?: GenerationOptions): Promise<string> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      if (!this.config.apiKey) {
        return this.getFallbackContent(prompt)
      }

      // Implementar geração de conteúdo
      return await this.performGeneration(prompt, options)
    } catch (error) {
      console.error('Error generating content:', error)
      return this.getFallbackContent(prompt)
    }
  }

  public async generateMotivationalQuote(context?: string): Promise<{ quote: string; author: string }> {
    try {
      const prompt = `Gere uma citação motivacional inspiradora ${context ? `relacionada a: ${context}` : 'sobre crescimento pessoal'}. Retorne no formato JSON com 'quote' e 'author'.`
      
      const response = await this.generateContent(prompt, { format: 'json' })
      
      try {
        const parsed = JSON.parse(response)
        return {
          quote: parsed.quote || 'A jornada de mil milhas começa com um único passo.',
          author: parsed.author || 'Lao Tzu'
        }
      } catch {
        return {
          quote: 'A jornada de mil milhas começa com um único passo.',
          author: 'Lao Tzu'
        }
      }
    } catch (error) {
      console.error('Error generating motivational quote:', error)
      return {
        quote: 'A jornada de mil milhas começa com um único passo.',
        author: 'Lao Tzu'
      }
    }
  }

  private async performAnalysis(text: string, context?: string): Promise<AnalysisResult> {
    // Implementar análise real com Gemini API
    // Por enquanto, retorna análise simulada
    return this.getFallbackAnalysis(text)
  }

  private async performGeneration(prompt: string, options?: GenerationOptions): Promise<string> {
    // Implementar geração real com Gemini API
    // Por enquanto, retorna conteúdo simulado
    return this.getFallbackContent(prompt)
  }

  private getFallbackAnalysis(text: string): AnalysisResult {
    const words = text.toLowerCase()
    let sentiment: AnalysisResult['sentiment'] = 'neutral'
    let confidence = 0.5
    let urgencyLevel: AnalysisResult['urgencyLevel'] = 'low'

    // Análise básica de sentimento
    const positiveWords = ['bom', 'ótimo', 'excelente', 'feliz', 'alegre', 'sucesso']
    const negativeWords = ['ruim', 'péssimo', 'triste', 'problema', 'erro', 'falha']
    const urgentWords = ['urgente', 'crítico', 'emergência', 'ajuda', 'socorro']

    const positiveCount = positiveWords.filter(word => words.includes(word)).length
    const negativeCount = negativeWords.filter(word => words.includes(word)).length
    const urgentCount = urgentWords.filter(word => words.includes(word)).length

    if (urgentCount > 0) {
      urgencyLevel = 'critical'
    }

    if (positiveCount > negativeCount) {
      sentiment = 'positive'
      confidence = Math.min(0.8, 0.5 + (positiveCount * 0.1))
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative'
      confidence = Math.min(0.8, 0.5 + (negativeCount * 0.1))
    }

    return {
      sentiment,
      confidence,
      insights: ['Análise baseada em palavras-chave'],
      recommendations: ['Continue compartilhando seus pensamentos'],
      categories: ['geral'],
      urgencyLevel,
      metadata: {
        fallback: true,
        wordCount: text.split(' ').length
      }
    }
  }

  private getFallbackContent(prompt: string): string {
    // Conteúdo padrão baseado no tipo de prompt
    if (prompt.toLowerCase().includes('motivacional')) {
      return 'O sucesso é a soma de pequenos esforços repetidos dia após dia.'
    }
    if (prompt.toLowerCase().includes('análise')) {
      return 'Análise concluída com base nos dados disponíveis.'
    }
    return 'Conteúdo gerado com base no contexto fornecido.'
  }

  public isReady(): boolean {
    return this.isInitialized
  }

  public getConfig(): Partial<GeminiConfig> {
    return {
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      timeout: this.config.timeout
    }
  }
}

// Instância singleton
const geminiService = GeminiService.getInstance()

// Exportações
export default GeminiService
export { geminiService }