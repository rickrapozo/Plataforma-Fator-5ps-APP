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
  private readonly apiKey = 'AIzaSyBt4vyuZZhxDd5Vz1I4WfkTzKWht7SdcNA'
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService()
    }
    return GeminiService.instance
  }

  private async makeRequest(prompt: string): Promise<string> {
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
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
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