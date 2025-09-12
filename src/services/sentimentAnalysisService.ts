import GeminiService from './geminiService';

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
  private geminiService: GeminiService;
  private analysisHistory: SentimentAnalysis[] = [];
  private contextWindow = 5; // Número de mensagens para contexto

  private constructor() {
    this.geminiService = GeminiService.getInstance();
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
      const contextText = conversationHistory.slice(-this.contextWindow).join('\n');
      const trendInfo = previousAnalysis ? this.getTrendInfo(previousAnalysis) : '';

      const prompt = this.buildAnalysisPrompt(text, contextText, trendInfo);
      
      const response = await this.geminiService.makeRequest(prompt);

      const analysis = this.parseAnalysisResponse(response || '{}');
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

  private buildAnalysisPrompt(text: string, context: string, trendInfo: string): string {
    return `
Você é um especialista em análise de sentimentos e psicologia clínica. Analise o seguinte texto de uma pessoa que pode estar em crise emocional.

Texto atual: "${text}"

${context ? `Contexto da conversa:\n${context}` : ''}

${trendInfo ? `Tendência anterior:\n${trendInfo}` : ''}

Forneça uma análise detalhada em formato JSON seguindo exatamente esta estrutura:

{
  "sentiment": "very_positive|positive|neutral|negative|very_negative|crisis",
  "confidence": 0.85,
  "emotions": {
    "joy": 0.1,
    "sadness": 0.7,
    "anger": 0.2,
    "fear": 0.6,
    "anxiety": 0.8,
    "hope": 0.3
  },
  "urgencyLevel": "low|medium|high|critical",
  "riskFactors": ["fator1", "fator2"],
  "supportiveElements": ["elemento1", "elemento2"],
  "recommendations": {
    "immediateActions": ["ação1", "ação2"],
    "techniques": ["técnica1", "técnica2"],
    "followUp": ["acompanhamento1", "acompanhamento2"]
  }
}

Critérios para classificação:

**Sentiment:**
- crisis: ideação suicida, autolesão, desespero extremo, perda total de esperança
- very_negative: depressão severa, ansiedade extrema, pensamentos muito negativos
- negative: tristeza profunda, preocupação intensa, pessimismo
- neutral: estado emocional equilibrado, sem sinais de crise
- positive: otimismo moderado, esperança, busca por soluções
- very_positive: alegria, gratidão, bem-estar emocional

**Urgency Level:**
- critical: risco imediato de autolesão, necessita intervenção urgente
- high: crise emocional severa, necessita apoio imediato
- medium: estresse significativo, necessita acompanhamento
- low: situação estável, apoio preventivo

**Emotions:** Valores de 0 a 1 representando a intensidade de cada emoção detectada.

**Risk Factors:** Elementos que indicam risco ou vulnerabilidade.

**Supportive Elements:** Aspectos positivos ou recursos de enfrentamento identificados.

**Recommendations:** Sugestões específicas baseadas na análise.

Responda APENAS com o JSON válido, sem explicações adicionais.
    `;
  }

  private parseAnalysisResponse(responseContent: string): SentimentAnalysis {
    try {
      // Limpar possíveis caracteres extras
      const cleanContent = responseContent
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanContent);
      
      // Validar e normalizar a estrutura
      return {
        sentiment: this.validateSentiment(parsed.sentiment),
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        emotions: this.validateEmotions(parsed.emotions),
        urgencyLevel: this.validateUrgencyLevel(parsed.urgencyLevel),
        riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : [],
        supportiveElements: Array.isArray(parsed.supportiveElements) ? parsed.supportiveElements : [],
        recommendations: this.validateRecommendations(parsed.recommendations),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Erro ao parsear resposta de análise:', error);
      return this.getDefaultAnalysis();
    }
  }

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