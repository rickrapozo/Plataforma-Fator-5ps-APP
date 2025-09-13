// Removed GeminiService import - using keyword-based analysis instead

export interface SentimentAnalysis {
  sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative' | 'crisis';
  confidence: number; // 0-1
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    anxiety: number;
    hope: number;
  };
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  supportiveElements: string[];
  recommendations: {
    immediateActions: string[];
    techniques: string[];
    followUp: string[];
  };
  timestamp: Date;
}

export interface ConversationContext {
  messages: Array<{
    content: string;
    timestamp: Date;
    sentiment?: SentimentAnalysis;
  }>;
  overallTrend: 'improving' | 'stable' | 'declining' | 'critical';
  sessionDuration: number;
  interventionsUsed: string[];
}

export class SentimentAnalysisService {
  private static instance: SentimentAnalysisService;
  private analysisHistory: SentimentAnalysis[] = [];
  private contextWindow = 5; // Número de mensagens para contexto

  private constructor() {
    // Análise baseada em palavras-chave, sem dependência do Gemini
  }

  public static getInstance(): SentimentAnalysisService {
    if (!SentimentAnalysisService.instance) {
      SentimentAnalysisService.instance = new SentimentAnalysisService();
    }
    return SentimentAnalysisService.instance;
  }

  public async analyzeSentiment(
    text: string, 
    conversationHistory: string[] = [],
    previousAnalysis?: SentimentAnalysis
  ): Promise<SentimentAnalysis> {
    try {
      const analysis = this.analyzeTextWithKeywords(text);
      analysis.timestamp = new Date();
      
      this.analysisHistory.push(analysis);
      
      // Manter apenas os últimos 50 análises
      if (this.analysisHistory.length > 50) {
        this.analysisHistory = this.analysisHistory.slice(-50);
      }

      return analysis;
    } catch (error) {
      console.error('Erro na análise de sentimento:', error);
      return this.getDefaultAnalysis();
    }
  }

  private analyzeTextWithKeywords(text: string): SentimentAnalysis {
    const lowerText = text.toLowerCase();
    
    // Palavras-chave para diferentes categorias
    const crisisKeywords = ['suicídio', 'morrer', 'acabar com tudo', 'não aguento mais', 'sem saída', 'quero morrer'];
    const veryNegativeKeywords = ['depressão', 'desespero', 'sozinho', 'perdido', 'inútil', 'fracasso'];
    const negativeKeywords = ['triste', 'preocupado', 'ansioso', 'nervoso', 'chateado', 'mal'];
    const positiveKeywords = ['bem', 'feliz', 'alegre', 'otimista', 'esperança', 'melhor'];
    const veryPositiveKeywords = ['ótimo', 'excelente', 'maravilhoso', 'perfeito', 'radiante', 'eufórico'];
    
    let sentiment: SentimentAnalysis['sentiment'] = 'neutral';
    let urgencyLevel: SentimentAnalysis['urgencyLevel'] = 'low';
    let confidence = 0.7;
    let riskFactors: string[] = [];
    let supportiveElements: string[] = [];
    
    // Detectar crise
    if (crisisKeywords.some(keyword => lowerText.includes(keyword))) {
      sentiment = 'crisis';
      urgencyLevel = 'critical';
      confidence = 0.9;
      riskFactors = ['ideação suicida', 'desespero extremo'];
    }
    // Detectar muito negativo
    else if (veryNegativeKeywords.some(keyword => lowerText.includes(keyword))) {
      sentiment = 'very_negative';
      urgencyLevel = 'high';
      confidence = 0.8;
      riskFactors = ['depressão severa', 'isolamento'];
    }
    // Detectar negativo
    else if (negativeKeywords.some(keyword => lowerText.includes(keyword))) {
      sentiment = 'negative';
      urgencyLevel = 'medium';
      riskFactors = ['ansiedade', 'estresse'];
    }
    // Detectar positivo
    else if (positiveKeywords.some(keyword => lowerText.includes(keyword))) {
      sentiment = 'positive';
      supportiveElements = ['otimismo', 'esperança'];
    }
    // Detectar muito positivo
    else if (veryPositiveKeywords.some(keyword => lowerText.includes(keyword))) {
      sentiment = 'very_positive';
      supportiveElements = ['alta motivação', 'bem-estar'];
    }
    
    return {
      sentiment,
      confidence,
      emotions: this.calculateEmotionsFromSentiment(sentiment),
      urgencyLevel,
      riskFactors,
      supportiveElements,
      recommendations: this.generateRecommendations(sentiment, urgencyLevel),
      timestamp: new Date()
    };
  }

  private calculateEmotionsFromSentiment(sentiment: SentimentAnalysis['sentiment']): SentimentAnalysis['emotions'] {
    const baseEmotions = { joy: 0.1, sadness: 0.1, anger: 0.1, fear: 0.1, anxiety: 0.1, hope: 0.1 };
    
    switch (sentiment) {
      case 'crisis':
        return { ...baseEmotions, sadness: 0.9, fear: 0.8, anxiety: 0.9, hope: 0.0 };
      case 'very_negative':
        return { ...baseEmotions, sadness: 0.8, anxiety: 0.7, hope: 0.2 };
      case 'negative':
        return { ...baseEmotions, sadness: 0.6, anxiety: 0.5, hope: 0.3 };
      case 'positive':
        return { ...baseEmotions, joy: 0.6, hope: 0.7, sadness: 0.2 };
      case 'very_positive':
        return { ...baseEmotions, joy: 0.9, hope: 0.8, sadness: 0.0 };
      default:
        return baseEmotions;
    }
  }

  private generateRecommendations(sentiment: SentimentAnalysis['sentiment'], urgencyLevel: SentimentAnalysis['urgencyLevel']): SentimentAnalysis['recommendations'] {
    const baseRecommendations = {
      immediateActions: ['Respiração profunda', 'Buscar ambiente seguro'],
      techniques: ['Técnica de respiração 4-7-8', 'Grounding 5-4-3-2-1'],
      followUp: ['Acompanhamento em 24h', 'Registro de humor']
    };
    
    if (urgencyLevel === 'critical') {
      return {
        immediateActions: ['Contatar emergência', 'Não ficar sozinho', 'Remover meios de autolesão'],
        techniques: ['Técnica de grounding', 'Respiração de emergência'],
        followUp: ['Acompanhamento profissional imediato', 'Suporte familiar']
      };
    }
    
    return baseRecommendations;
  }

  // Método removido - análise agora é baseada em palavras-chave

  // Método removido - análise agora é baseada em palavras-chave

  private validateSentiment(sentiment: any): SentimentAnalysis['sentiment'] {
    const validSentiments = ['very_positive', 'positive', 'neutral', 'negative', 'very_negative', 'crisis'];
    return validSentiments.includes(sentiment) ? sentiment : 'neutral';
  }

  private validateUrgencyLevel(level: any): SentimentAnalysis['urgencyLevel'] {
    const validLevels = ['low', 'medium', 'high', 'critical'];
    return validLevels.includes(level) ? level : 'medium';
  }

  private validateEmotions(emotions: any): SentimentAnalysis['emotions'] {
    const defaultEmotions = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      anxiety: 0,
      hope: 0
    };

    if (!emotions || typeof emotions !== 'object') {
      return defaultEmotions;
    }

    return {
      joy: Math.max(0, Math.min(1, emotions.joy || 0)),
      sadness: Math.max(0, Math.min(1, emotions.sadness || 0)),
      anger: Math.max(0, Math.min(1, emotions.anger || 0)),
      fear: Math.max(0, Math.min(1, emotions.fear || 0)),
      anxiety: Math.max(0, Math.min(1, emotions.anxiety || 0)),
      hope: Math.max(0, Math.min(1, emotions.hope || 0))
    };
  }

  private validateRecommendations(recommendations: any): SentimentAnalysis['recommendations'] {
    const defaultRecommendations = {
      immediateActions: [],
      techniques: [],
      followUp: []
    };

    if (!recommendations || typeof recommendations !== 'object') {
      return defaultRecommendations;
    }

    return {
      immediateActions: Array.isArray(recommendations.immediateActions) ? recommendations.immediateActions : [],
      techniques: Array.isArray(recommendations.techniques) ? recommendations.techniques : [],
      followUp: Array.isArray(recommendations.followUp) ? recommendations.followUp : []
    };
  }

  private getTrendInfo(previousAnalysis: SentimentAnalysis): string {
    const recentAnalyses = this.analysisHistory.slice(-3);
    if (recentAnalyses.length < 2) return '';

    const trend = this.calculateTrend(recentAnalyses);
    return `Tendência recente: ${trend}. Análise anterior: ${previousAnalysis.sentiment} (${previousAnalysis.urgencyLevel})`;
  }

  private calculateTrend(analyses: SentimentAnalysis[]): string {
    if (analyses.length < 2) return 'insuficiente';

    const sentimentScores = analyses.map(a => this.getSentimentScore(a.sentiment));
    const recent = sentimentScores.slice(-2);
    
    if (recent[1] > recent[0]) return 'melhorando';
    if (recent[1] < recent[0]) return 'piorando';
    return 'estável';
  }

  private getSentimentScore(sentiment: SentimentAnalysis['sentiment']): number {
    const scores = {
      'crisis': 1,
      'very_negative': 2,
      'negative': 3,
      'neutral': 4,
      'positive': 5,
      'very_positive': 6
    };
    return scores[sentiment] || 4;
  }

  private getDefaultAnalysis(): SentimentAnalysis {
    return {
      sentiment: 'neutral',
      confidence: 0.5,
      emotions: {
        joy: 0,
        sadness: 0,
        anger: 0,
        fear: 0,
        anxiety: 0.3,
        hope: 0.3
      },
      urgencyLevel: 'medium',
      riskFactors: [],
      supportiveElements: ['Busca por apoio'],
      recommendations: {
        immediateActions: ['Manter comunicação aberta'],
        techniques: ['Respiração profunda', 'Mindfulness'],
        followUp: ['Acompanhamento regular']
      },
      timestamp: new Date()
    };
  }

  public getAnalysisHistory(): SentimentAnalysis[] {
    return [...this.analysisHistory];
  }

  public getConversationContext(messages: Array<{content: string, timestamp: Date, sentiment?: SentimentAnalysis}>): ConversationContext {
    const sessionStart = messages[0]?.timestamp || new Date();
    const sessionDuration = Math.floor((Date.now() - sessionStart.getTime()) / 1000);
    
    const sentiments = messages
      .map(m => m.sentiment)
      .filter(s => s !== undefined) as SentimentAnalysis[];
    
    const overallTrend = this.calculateOverallTrend(sentiments);
    const interventionsUsed = this.extractInterventions(messages);

    return {
      messages,
      overallTrend,
      sessionDuration,
      interventionsUsed
    };
  }

  private calculateOverallTrend(sentiments: SentimentAnalysis[]): ConversationContext['overallTrend'] {
    if (sentiments.length < 2) return 'stable';

    const scores = sentiments.map(s => this.getSentimentScore(s.sentiment));
    const recent = scores.slice(-3);
    const earlier = scores.slice(0, -3);

    if (recent.length === 0) return 'stable';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : recentAvg;

    // Verificar se há sinais críticos
    const hasCritical = sentiments.some(s => s.urgencyLevel === 'critical' || s.sentiment === 'crisis');
    if (hasCritical) return 'critical';

    const difference = recentAvg - earlierAvg;
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }

  private extractInterventions(messages: Array<{content: string}>): string[] {
    const interventions: string[] = [];
    const interventionKeywords = {
      'respiração': 'Técnica de Respiração',
      'mindfulness': 'Mindfulness',
      'relaxamento': 'Relaxamento',
      'exercício': 'Exercício Físico',
      'contato': 'Contato de Emergência',
      'profissional': 'Encaminhamento Profissional'
    };

    messages.forEach(message => {
      const content = message.content.toLowerCase();
      Object.entries(interventionKeywords).forEach(([keyword, intervention]) => {
        if (content.includes(keyword) && !interventions.includes(intervention)) {
          interventions.push(intervention);
        }
      });
    });

    return interventions;
  }

  public async generateRealTimeInsights(currentAnalysis: SentimentAnalysis, context: ConversationContext): Promise<{
    alerts: string[];
    suggestions: string[];
    escalationNeeded: boolean;
  }> {
    const alerts: string[] = [];
    const suggestions: string[] = [];
    let escalationNeeded = false;

    // Verificar alertas críticos
    if (currentAnalysis.urgencyLevel === 'critical' || currentAnalysis.sentiment === 'crisis') {
      alerts.push('🚨 ALERTA CRÍTICO: Risco elevado detectado');
      escalationNeeded = true;
    }

    if (currentAnalysis.emotions.anxiety > 0.8) {
      alerts.push('⚠️ Nível de ansiedade muito elevado');
    }

    if (currentAnalysis.emotions.sadness > 0.8 && currentAnalysis.emotions.hope < 0.2) {
      alerts.push('⚠️ Sinais de depressão severa detectados');
    }

    // Gerar sugestões baseadas na análise
    if (currentAnalysis.emotions.anxiety > 0.6) {
      suggestions.push('Sugerir técnica de respiração para ansiedade');
    }

    if (context.overallTrend === 'declining') {
      suggestions.push('Considerar intensificar o apoio');
    }

    if (context.sessionDuration > 1800 && currentAnalysis.urgencyLevel === 'high') { // 30 minutos
      suggestions.push('Sessão longa com alta urgência - considerar pausa ou encaminhamento');
    }

    return { alerts, suggestions, escalationNeeded };
  }

  public clearHistory(): void {
    this.analysisHistory = [];
  }
}

export default SentimentAnalysisService;