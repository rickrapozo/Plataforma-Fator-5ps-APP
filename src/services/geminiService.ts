interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string
      }[]
    }
  }[]
}

interface AnalysisRequest {
  type: 'user_behavior' | 'system_performance' | 'content_insights' | 'predictive_analysis'
  data: any
  context?: string
}

interface AnalysisResult {
  insights: string[]
  recommendations: string[]
  metrics: Record<string, number>
  summary: string
  confidence: number
}

class GeminiService {
  private static instance: GeminiService
  private readonly apiKey: string
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

  constructor() {
    // Obter a chave da API das variáveis de ambiente
    this.apiKey = process.env.VITE_GEMINI_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('AVISO: Chave da API do Gemini não configurada. Defina VITE_GEMINI_API_KEY nas variáveis de ambiente.')
      // Não lançar erro para permitir que a aplicação continue funcionando
      return
    }
    
    // Validar formato básico da chave
    if (!this.apiKey.startsWith('AIza')) {
      console.warn('AVISO: Formato inválido da chave da API do Gemini')
      this.apiKey = '' // Limpar chave inválida
    }
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService()
    }
    return GeminiService.instance
  }

  async makeRequest(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not available')
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })

      if (!response.ok) {
        console.warn(`Gemini API error: ${response.status} - ${response.statusText}`)
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data: GeminiResponse = await response.json()
      return data.candidates[0]?.content?.parts[0]?.text || 'Sem resposta disponível'
    } catch (error) {
      console.error('Erro na requisição Gemini:', error)
      throw error
    }
  }

  async analyzeUserBehavior(userData: any[]): Promise<AnalysisResult> {
    const prompt = `
      Analise os seguintes dados de comportamento do usuário de uma plataforma de desenvolvimento pessoal:
      
      ${JSON.stringify(userData, null, 2)}
      
      Por favor, forneça uma análise detalhada incluindo:
      1. Padrões de uso identificados
      2. Insights sobre engajamento
      3. Recomendações para melhorar a experiência
      4. Métricas-chave calculadas
      5. Resumo executivo
      
      Responda em formato JSON com as seguintes chaves:
      {
        "insights": ["insight1", "insight2", ...],
        "recommendations": ["rec1", "rec2", ...],
        "metrics": {"engagement_score": 0.85, "retention_rate": 0.72, ...},
        "summary": "Resumo executivo da análise",
        "confidence": 0.9
      }
    `

    try {
      const response = await this.makeRequest(prompt)
      return this.parseAnalysisResponse(response)
    } catch (error) {
      return this.getDefaultAnalysis('user_behavior')
    }
  }

  async analyzeSystemPerformance(metricsData: any[]): Promise<AnalysisResult> {
    const prompt = `
      Analise as seguintes métricas de performance do sistema:
      
      ${JSON.stringify(metricsData, null, 2)}
      
      Forneça uma análise técnica incluindo:
      1. Identificação de gargalos
      2. Tendências de performance
      3. Recomendações de otimização
      4. Alertas de sistema
      5. Previsões de capacidade
      
      Responda em formato JSON com as seguintes chaves:
      {
        "insights": ["insight1", "insight2", ...],
        "recommendations": ["rec1", "rec2", ...],
        "metrics": {"performance_score": 0.78, "optimization_potential": 0.65, ...},
        "summary": "Resumo da análise de performance",
        "confidence": 0.85
      }
    `

    try {
      const response = await this.makeRequest(prompt)
      return this.parseAnalysisResponse(response)
    } catch (error) {
      return this.getDefaultAnalysis('system_performance')
    }
  }

  async generateContentInsights(contentData: any[]): Promise<AnalysisResult> {
    const prompt = `
      Analise os seguintes dados de conteúdo e engajamento:
      
      ${JSON.stringify(contentData, null, 2)}
      
      Forneça insights sobre:
      1. Conteúdo mais eficaz
      2. Padrões de engajamento
      3. Oportunidades de melhoria
      4. Sugestões de novos conteúdos
      5. Otimização de jornadas
      
      Responda em formato JSON com as seguintes chaves:
      {
        "insights": ["insight1", "insight2", ...],
        "recommendations": ["rec1", "rec2", ...],
        "metrics": {"content_effectiveness": 0.82, "engagement_rate": 0.67, ...},
        "summary": "Resumo dos insights de conteúdo",
        "confidence": 0.88
      }
    `

    try {
      const response = await this.makeRequest(prompt)
      return this.parseAnalysisResponse(response)
    } catch (error) {
      return this.getDefaultAnalysis('content_insights')
    }
  }

  async generatePredictiveAnalysis(historicalData: any[]): Promise<AnalysisResult> {
    const prompt = `
      Com base nos seguintes dados históricos, gere uma análise preditiva:
      
      ${JSON.stringify(historicalData, null, 2)}
      
      Forneça previsões sobre:
      1. Tendências futuras de uso
      2. Crescimento esperado
      3. Possíveis problemas
      4. Oportunidades de expansão
      5. Recomendações estratégicas
      
      Responda em formato JSON com as seguintes chaves:
      {
        "insights": ["insight1", "insight2", ...],
        "recommendations": ["rec1", "rec2", ...],
        "metrics": {"growth_prediction": 0.25, "risk_score": 0.15, ...},
        "summary": "Resumo da análise preditiva",
        "confidence": 0.75
      }
    `

    try {
      const response = await this.makeRequest(prompt)
      return this.parseAnalysisResponse(response)
    } catch (error) {
      return this.getDefaultAnalysis('predictive_analysis')
    }
  }

  async generateCustomAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
    const prompt = `
      Análise customizada do tipo: ${request.type}
      Contexto: ${request.context || 'Não especificado'}
      
      Dados para análise:
      ${JSON.stringify(request.data, null, 2)}
      
      Por favor, forneça uma análise detalhada e específica para este contexto.
      
      Responda em formato JSON com as seguintes chaves:
      {
        "insights": ["insight1", "insight2", ...],
        "recommendations": ["rec1", "rec2", ...],
        "metrics": {"key1": value1, "key2": value2, ...},
        "summary": "Resumo da análise customizada",
        "confidence": 0.8
      }
    `

    try {
      const response = await this.makeRequest(prompt)
      return this.parseAnalysisResponse(response)
    } catch (error) {
      return this.getDefaultAnalysis(request.type)
    }
  }

  async generateRecommendations(context: string, data: any): Promise<string[]> {
    const prompt = `
      Contexto: ${context}
      Dados: ${JSON.stringify(data, null, 2)}
      
      Gere 5 recomendações específicas e acionáveis baseadas nos dados fornecidos.
      Responda apenas com uma lista de recomendações, uma por linha, sem numeração.
    `

    try {
      const response = await this.makeRequest(prompt)
      return response.split('\n').filter(line => line.trim().length > 0).slice(0, 5)
    } catch (error) {
      return [
        'Monitore métricas-chave regularmente',
        'Implemente feedback contínuo dos usuários',
        'Otimize performance baseado em dados',
        'Personalize experiência do usuário',
        'Mantenha segurança e privacidade'
      ]
    }
  }

  async summarizeData(data: any[], context: string): Promise<string> {
    const prompt = `
      Contexto: ${context}
      
      Dados para resumir:
      ${JSON.stringify(data, null, 2)}
      
      Forneça um resumo executivo conciso (máximo 200 palavras) destacando os pontos mais importantes.
    `

    try {
      const response = await this.makeRequest(prompt)
      return response.trim()
    } catch (error) {
      return 'Resumo não disponível devido a erro na análise.'
    }
  }

  private parseAnalysisResponse(response: string): AnalysisResult {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          insights: parsed.insights || [],
          recommendations: parsed.recommendations || [],
          metrics: parsed.metrics || {},
          summary: parsed.summary || 'Análise concluída',
          confidence: parsed.confidence || 0.7
        }
      }
      
      // Fallback: tentar parsear resposta como texto estruturado
      return this.parseTextResponse(response)
    } catch (error) {
      console.error('Erro ao parsear resposta Gemini:', error)
      return this.getDefaultAnalysis('general')
    }
  }

  private parseTextResponse(response: string): AnalysisResult {
    const lines = response.split('\n').filter(line => line.trim().length > 0)
    
    return {
      insights: lines.slice(0, 3).map(line => line.replace(/^[\d\-\*\.]\s*/, '').trim()),
      recommendations: lines.slice(3, 6).map(line => line.replace(/^[\d\-\*\.]\s*/, '').trim()),
      metrics: { analysis_score: 0.75 },
      summary: lines[0] || 'Análise processada com sucesso',
      confidence: 0.7
    }
  }

  private getDefaultAnalysis(type: string): AnalysisResult {
    const defaults = {
      user_behavior: {
        insights: [
          'Padrões de uso identificados nos dados',
          'Engajamento varia por período do dia',
          'Usuários preferem conteúdo interativo'
        ],
        recommendations: [
          'Implementar notificações personalizadas',
          'Otimizar horários de conteúdo',
          'Adicionar mais elementos interativos'
        ],
        metrics: { engagement_score: 0.75, retention_rate: 0.68 },
        summary: 'Análise de comportamento do usuário concluída com dados limitados'
      },
      system_performance: {
        insights: [
          'Performance geral dentro dos parâmetros',
          'Picos de uso em horários específicos',
          'Oportunidades de otimização identificadas'
        ],
        recommendations: [
          'Implementar cache mais eficiente',
          'Otimizar consultas de banco de dados',
          'Monitorar recursos em tempo real'
        ],
        metrics: { performance_score: 0.78, optimization_potential: 0.65 },
        summary: 'Sistema operando adequadamente com espaço para melhorias'
      },
      content_insights: {
        insights: [
          'Conteúdo educacional tem alta aceitação',
          'Formatos visuais geram mais engajamento',
          'Jornadas personalizadas são mais eficazes'
        ],
        recommendations: [
          'Expandir biblioteca de conteúdo visual',
          'Criar mais jornadas personalizadas',
          'Implementar sistema de feedback'
        ],
        metrics: { content_effectiveness: 0.82, engagement_rate: 0.67 },
        summary: 'Conteúdo atual mostra boa aceitação com oportunidades de expansão'
      },
      predictive_analysis: {
        insights: [
          'Tendência de crescimento positiva',
          'Sazonalidade identificada nos dados',
          'Potencial para expansão de recursos'
        ],
        recommendations: [
          'Preparar infraestrutura para crescimento',
          'Desenvolver estratégias sazonais',
          'Investir em novos recursos'
        ],
        metrics: { growth_prediction: 0.25, risk_score: 0.15 },
        summary: 'Previsões indicam crescimento sustentável com baixo risco'
      }
    }

    return {
      ...defaults[type as keyof typeof defaults] || defaults.user_behavior,
      confidence: 0.6
    }
  }

  async generateDynamicGreeting(userData: {
    name: string
    timeOfDay: 'morning' | 'afternoon' | 'evening'
    streak: number
    lastActivity: string
    recentProgress: any
    isFirstTime: boolean
  }): Promise<string> {
    const prompt = `
      Gere uma saudação personalizada e inspiradora para um usuário da plataforma de desenvolvimento pessoal "5 Pilares para uma Mente Próspera".
      
      Dados do usuário:
      - Nome: ${userData.name}
      - Período: ${userData.timeOfDay === 'morning' ? 'Manhã (6h-12h)' : userData.timeOfDay === 'afternoon' ? 'Tarde (12h-18h)' : 'Noite (18h-00h)'}
      - Sequência atual: ${userData.streak} dias
      - Última atividade: ${userData.lastActivity}
      - Progresso recente: ${JSON.stringify(userData.recentProgress)}
      - Primeiro acesso: ${userData.isFirstTime ? 'Sim' : 'Não'}
      
      Diretrizes:
      1. Use o nome do usuário
      2. Seja empático, inspirador e acionável
      3. Mencione o progresso quando relevante
      4. Adapte a mensagem ao período do dia
      5. Máximo 2 frases
      6. Foque na transformação e nos 5Ps
      
      Responda apenas com a saudação, sem formatação adicional.
    `

    try {
      const response = await this.makeRequest(prompt)
      return response.trim()
    } catch (error) {
      // Fallback para saudações padrão
      const { timeOfDay, name, streak } = userData
      const greetings = {
        morning: `Bom dia, ${name}! Pronto para alinhar sua mente e criar um dia próspero?`,
        afternoon: `Olá, ${name}! Como está a energia dos seus 5Ps? Vamos recalibrar para uma tarde produtiva.`,
        evening: `Boa noite, ${name}! É hora de refletir sobre suas conquistas e preparar sua mente para um descanso poderoso.`
      }
      return greetings[timeOfDay]
    }
  }

  async analyze5PsPillars(userData: {
    p1_thoughts: any[]
    p2_feelings: any[]
    p3_emotions: any[]
    p4_actions: any[]
    p5_results: any[]
    recentActivity: any
  }): Promise<{
    alignment: Record<string, number>
    insights: string[]
    recommendations: Record<string, string>
    overallScore: number
  }> {
    const prompt = `
      Analise o alinhamento dos 5 Pilares (5Ps) de um usuário baseado nos seguintes dados:
      
      P1 - Pensamentos: ${JSON.stringify(userData.p1_thoughts)}
      P2 - Sentimentos: ${JSON.stringify(userData.p2_feelings)}
      P3 - Emoções: ${JSON.stringify(userData.p3_emotions)}
      P4 - Ações: ${JSON.stringify(userData.p4_actions)}
      P5 - Resultados: ${JSON.stringify(userData.p5_results)}
      Atividade Recente: ${JSON.stringify(userData.recentActivity)}
      
      Forneça uma análise em formato JSON com:
      {
        "alignment": {
          "pensamento": 0-100,
          "sentimento": 0-100,
          "emocao": 0-100,
          "acao": 0-100,
          "resultado": 0-100
        },
        "insights": ["insight1", "insight2", ...],
        "recommendations": {
          "pensamento": "recomendação específica",
          "sentimento": "recomendação específica",
          "emocao": "recomendação específica",
          "acao": "recomendação específica",
          "resultado": "recomendação específica"
        },
        "overallScore": 0-100
      }
    `

    try {
      const response = await this.makeRequest(prompt)
      return this.parse5PsResponse(response)
    } catch (error) {
      return this.getDefault5PsAnalysis()
    }
  }

  async generateDailyJourney(userProfile: {
    currentAlignment: Record<string, number>
    goals: string[]
    challenges: string[]
    preferences: any
    availableTime: number
  }): Promise<{
    title: string
    type: 'alignment' | 'challenge' | 'manifestation'
    steps: Array<{
      title: string
      description: string
      duration: number
      type: 'reading' | 'writing' | 'audio' | 'exercise'
    }>
    estimatedTime: number
  }> {
    const prompt = `
      Crie uma "Jornada de Hoje" personalizada de 15 minutos para um usuário baseado em:
      
      Alinhamento atual dos 5Ps: ${JSON.stringify(userProfile.currentAlignment)}
      Objetivos: ${JSON.stringify(userProfile.goals)}
      Desafios: ${JSON.stringify(userProfile.challenges)}
      Tempo disponível: ${userProfile.availableTime} minutos
      
      Tipos de jornada:
      - "alignment": Foco em fortalecer um pilar em baixa
      - "challenge": Foco em superar um desafio específico
      - "manifestation": Foco em alinhar todos os 5Ps para um objetivo
      
      Responda em formato JSON:
      {
        "title": "Nome da Jornada",
        "type": "alignment|challenge|manifestation",
        "steps": [
          {
            "title": "Passo 1",
            "description": "Descrição detalhada",
            "duration": 5,
            "type": "reading|writing|audio|exercise"
          }
        ],
        "estimatedTime": 15
      }
    `

    try {
      const response = await this.makeRequest(prompt)
      return this.parseJourneyResponse(response)
    } catch (error) {
      return this.getDefaultJourney(userProfile)
    }
  }

  private parse5PsResponse(response: string): any {
    try {
      const cleanResponse = response.replace(/```json|```/g, '').trim()
      return JSON.parse(cleanResponse)
    } catch (error) {
      return this.getDefault5PsAnalysis()
    }
  }

  private parseJourneyResponse(response: string): any {
    try {
      const cleanResponse = response.replace(/```json|```/g, '').trim()
      return JSON.parse(cleanResponse)
    } catch (error) {
      return this.getDefaultJourney({})
    }
  }

  private getDefault5PsAnalysis(): any {
    return {
      alignment: {
        pensamento: 70,
        sentimento: 65,
        emocao: 75,
        acao: 60,
        resultado: 68
      },
      insights: [
        "Seus pensamentos estão bem alinhados, continue praticando afirmações positivas",
        "Há espaço para melhorar o alinhamento entre ações e objetivos"
      ],
      recommendations: {
        pensamento: "Continue com as afirmações diárias",
        sentimento: "Pratique mais exercícios de reconhecimento emocional",
        emocao: "Mantenha as práticas de estado peak",
        acao: "Defina ações mais específicas e mensuráveis",
        resultado: "Celebre mais suas pequenas vitórias diárias"
      },
      overallScore: 68
    }
  }

  private getDefaultJourney(userProfile: any): any {
    return {
      title: "Jornada de Alinhamento Matinal",
      type: "alignment",
      steps: [
        {
          title: "Leitura Inspiradora",
          description: "Leia uma reflexão sobre o poder dos pensamentos positivos",
          duration: 3,
          type: "reading"
        },
        {
          title: "Exercício de Escrita",
          description: "Escreva 3 afirmações poderosas para o seu dia",
          duration: 5,
          type: "writing"
        },
        {
          title: "Áudio de Ativação",
          description: "Ouça um áudio de ativação do estado peak",
          duration: 7,
          type: "audio"
        }
      ],
      estimatedTime: 15
    }
  }

  async generateMotivationalQuote(context?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening'
    userMood?: string
    currentGoals?: string[]
    recentAchievements?: string[]
  }): Promise<{
    quote: string
    author: string
    context: string
  }> {
    if (!this.apiKey) {
      // Fallback quotes quando API não está disponível
      const fallbackQuotes = [
        {
          quote: "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
          author: "Robert Collier",
          context: "Sobre consistência e perseverança"
        },
        {
          quote: "A única maneira de fazer um excelente trabalho é amar o que você faz.",
          author: "Steve Jobs",
          context: "Sobre paixão e propósito"
        },
        {
          quote: "Não é o que acontece com você, mas como você reage ao que acontece com você que importa.",
          author: "Epicteto",
          context: "Sobre controle e perspectiva"
        },
        {
          quote: "O futuro pertence àqueles que acreditam na beleza de seus sonhos.",
          author: "Eleanor Roosevelt",
          context: "Sobre sonhos e determinação"
        },
        {
          quote: "Seja você mesmo; todos os outros já foram tomados.",
          author: "Oscar Wilde",
          context: "Sobre autenticidade e individualidade"
        }
      ]
      return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
    }

    try {
      const contextInfo = context ? `
      Contexto do usuário:
      - Período do dia: ${context.timeOfDay || 'não especificado'}
      - Humor atual: ${context.userMood || 'neutro'}
      - Objetivos atuais: ${context.currentGoals?.join(', ') || 'desenvolvimento pessoal'}
      - Conquistas recentes: ${context.recentAchievements?.join(', ') || 'progresso contínuo'}
      ` : ''

      const prompt = `
        Gere uma citação motivacional inspiradora de um grande pensador, filósofo, líder ou personalidade histórica.
        ${contextInfo}
        
        A citação deve ser:
        - Autêntica e verificável
        - Inspiradora e motivacional
        - Relevante para desenvolvimento pessoal e transformação
        - Adequada ao contexto fornecido (se houver)
        
        Responda APENAS em formato JSON válido:
        {
          "quote": "texto da citação",
          "author": "nome do autor",
          "context": "breve explicação sobre o contexto ou significado da citação"
        }
      `

      const response = await this.makeRequest(prompt)
      
      try {
        const parsed = JSON.parse(response)
        if (parsed.quote && parsed.author && parsed.context) {
          return parsed
        }
      } catch {
        // Se não conseguir fazer parse, extrair manualmente
        const quoteMatch = response.match(/"quote":\s*"([^"]+)"/)
        const authorMatch = response.match(/"author":\s*"([^"]+)"/)
        const contextMatch = response.match(/"context":\s*"([^"]+)"/)
        
        if (quoteMatch && authorMatch && contextMatch) {
          return {
            quote: quoteMatch[1],
            author: authorMatch[1],
            context: contextMatch[1]
          }
        }
      }
      
      // Fallback se a resposta não estiver no formato esperado
      throw new Error('Invalid response format')
      
    } catch (error) {
      console.error('Erro ao gerar citação motivacional:', error)
      // Retornar citação padrão em caso de erro
      const fallbackQuotes = [
        {
          quote: "A jornada de mil milhas começa com um único passo.",
          author: "Lao Tzu",
          context: "Sobre começar e perseverar em qualquer jornada"
        },
        {
          quote: "Seja a mudança que você quer ver no mundo.",
          author: "Mahatma Gandhi",
          context: "Sobre responsabilidade pessoal e transformação"
        }
      ]
      return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('Teste de conexão. Responda apenas "OK".')
      return response.toLowerCase().includes('ok')
    } catch (error) {
      console.error('Erro no teste de conexão Gemini:', error)
      return false
    }
  }
}

export const geminiService = GeminiService.getInstance()
export default GeminiService
export type { AnalysisRequest, AnalysisResult }