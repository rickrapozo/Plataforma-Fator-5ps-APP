import { GoogleGenerativeAI } from '@google/generative-ai';

export interface MotivationalMessage {
  id: string;
  message: string;
  author: string;
  category: 'filosofia' | 'lideranca' | 'superacao' | 'sabedoria' | 'inspiracao' | 'crescimento';
  timestamp: Date;
  country?: string;
  era?: string;
}

export interface MotivationalRequest {
  category?: string;
  mood?: 'motivado' | 'desanimado' | 'ansioso' | 'reflexivo' | 'determinado';
  length?: 'curta' | 'media' | 'longa';
  timeOfDay?: 'manha' | 'tarde' | 'noite';
  personalContext?: string;
}

class MotivationalService {
  private static instance: MotivationalService;
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isInitialized = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): MotivationalService {
    if (!MotivationalService.instance) {
      MotivationalService.instance = new MotivationalService();
    }
    return MotivationalService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Chave da API Gemini não configurada');
      }

      if (!apiKey.startsWith('AIza')) {
        throw new Error('Formato inválido da chave da API Gemini');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      this.isInitialized = true;
      
      console.log('✅ Serviço de Mensagens Motivacionais inicializado com Gemini 2.0');
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço motivacional:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Gera uma mensagem motivacional personalizada
   */
  public async generateMotivationalMessage(request: MotivationalRequest = {}): Promise<MotivationalMessage> {
    if (!this.isInitialized || !this.model) {
      console.warn('⚠️ Serviço não inicializado, usando mensagem de fallback');
      return this.getFallbackMessage(request.category);
    }

    try {
      const prompt = this.buildPrompt(request);
      const result = await this.generateWithGemini(prompt);
      return this.parseResponse(result);
    } catch (error) {
      console.error('❌ Erro ao gerar mensagem motivacional:', error);
      return this.getFallbackMessage(request.category);
    }
  }

  /**
   * Gera múltiplas mensagens motivacionais
   */
  public async generateMultipleMessages(count: number = 3, request: MotivationalRequest = {}): Promise<MotivationalMessage[]> {
    const messages: MotivationalMessage[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const message = await this.generateMotivationalMessage(request);
        messages.push(message);
        // Pequena pausa entre requisições para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Erro ao gerar mensagem ${i + 1}:`, error);
        messages.push(this.getFallbackMessage(request.category));
      }
    }

    return messages;
  }

  /**
   * Constrói o prompt personalizado para o Gemini
   */
  private buildPrompt(request: MotivationalRequest): string {
    const categoryContext = this.getCategoryContext(request.category);
    const moodContext = this.getMoodContext(request.mood);
    const lengthContext = this.getLengthContext(request.length);
    const timeContext = this.getTimeContext(request.timeOfDay);
    const personalContext = request.personalContext ? `\nContexto pessoal: ${request.personalContext}` : '';

    return `
Você é um mentor de desenvolvimento pessoal especializado em criar mensagens motivacionais profundamente transformadoras e personalizadas.

CRIE uma mensagem motivacional única que seja:
- Focada em: ${categoryContext}
- Para uma: ${moodContext}
- Formato: ${lengthContext}
- Autêntica e inspiradora, evitando clichês
- Com linguagem elevada mas acessível
- Que gere reflexão profunda e ação consciente${timeContext}${personalContext}

RETORNE APENAS um JSON válido no formato:
{
  "message": "[mensagem inspiradora única]",
  "author": "[nome do autor/pensador]",
  "category": "${request.category || 'inspiracao'}",
  "country": "[país de origem do autor]",
  "era": "[período histórico]"
}

A mensagem deve ser original, profunda e transformadora. Use autores reais e relevantes para o contexto.`;
  }

  /**
   * Gera mensagem usando Gemini
   */
  private async generateWithGemini(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * Obtém contexto baseado na categoria
   */
  private getCategoryContext(category?: string): string {
    const contexts = {
      filosofia: 'reflexões profundas sobre a vida, existência e o significado de nossa jornada humana',
      lideranca: 'inspiração para liderar com autenticidade, influenciar positivamente e criar impacto transformador',
      superacao: 'força interior para superar desafios, transformar obstáculos em oportunidades de crescimento',
      sabedoria: 'conhecimento prático e intuição profunda para decisões sábias e vida plena',
      inspiracao: 'motivação transformadora para ação consciente, crescimento e realização pessoal',
      crescimento: 'desenvolvimento pessoal contínuo, evolução da consciência e expansão do potencial'
    };
    return contexts[category as keyof typeof contexts] || contexts.inspiracao;
  }

  /**
   * Obtém contexto baseado no humor/estado emocional
   */
  private getMoodContext(mood?: string): string {
    const contexts = {
      motivado: 'pessoa já energizada que busca direcionamento e foco para canalizar sua energia',
      desanimado: 'pessoa que precisa de encorajamento profundo, esperança renovada e lembrança de sua força interior',
      ansioso: 'pessoa que busca tranquilidade, perspectiva clara e ferramentas para acalmar a mente',
      reflexivo: 'pessoa em momento de introspecção profunda que busca clareza e sabedoria',
      determinado: 'pessoa focada que busca reforço de propósito e estratégias para manter a determinação'
    };
    return contexts[mood as keyof typeof contexts] || 'pessoa buscando inspiração transformadora e crescimento pessoal';
  }

  /**
   * Obtém contexto baseado no comprimento desejado
   */
  private getLengthContext(length?: string): string {
    const contexts = {
      curta: 'concisa e impactante (máximo 2 linhas) - vá direto ao coração',
      media: 'equilibrada e reflexiva (2-4 linhas) - permita respiração e contemplação',
      longa: 'elaborada e profundamente transformadora (4-6 linhas) - crie uma jornada emocional completa'
    };
    return contexts[length as keyof typeof contexts] || contexts.media;
  }

  /**
   * Obtém contexto baseado no período do dia
   */
  private getTimeContext(timeOfDay?: string): string {
    if (!timeOfDay) return '';
    
    const contexts = {
      manha: '\nÉ manhã - foque em energia renovada, novos começos e estabelecimento de intenções para o dia',
      tarde: '\nÉ tarde - considere o momento de reflexão, avaliação do progresso e renovação de energia',
      noite: '\nÉ noite - enfatize reflexão, gratidão pelo dia e preparação mental para o descanso e renovação'
    };
    
    return contexts[timeOfDay as keyof typeof contexts] || '';
  }

  /**
   * Processa a resposta do Gemini
   */
  private parseResponse(text: string): MotivationalMessage {
    try {
      // Remove possíveis marcadores de código
      const cleanText = text.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      return {
        id: this.generateId(),
        message: parsed.message || 'Mensagem não disponível',
        author: parsed.author || 'Pensador Anônimo',
        category: parsed.category || 'inspiracao',
        timestamp: new Date(),
        country: parsed.country,
        era: parsed.era
      };
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      console.log('Resposta recebida:', text);
      
      // Fallback: tentar extrair mensagem do texto bruto
      return {
        id: this.generateId(),
        message: this.extractMessageFromText(text),
        author: 'Pensador Inspirador',
        category: 'inspiracao',
        timestamp: new Date()
      };
    }
  }

  /**
   * Extrai mensagem do texto quando JSON falha
   */
  private extractMessageFromText(text: string): string {
    // Tenta encontrar uma frase inspiradora no texto
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 20);
    if (sentences.length > 0) {
      return sentences[0].trim() + '.';
    }
    return 'A jornada de mil milhas começa com um único passo.';
  }

  /**
   * Retorna mensagem de fallback quando a API falha
   */
  private getFallbackMessage(category?: string): MotivationalMessage {
    const fallbackMessages = {
      filosofia: {
        message: 'A vida não é sobre encontrar a si mesmo, é sobre criar conscientemente quem você escolhe ser a cada momento.',
        author: 'Mentor Inspirador',
        country: 'Universal',
        era: 'Contemporâneo'
      },
      lideranca: {
        message: 'Liderança autêntica não é sobre ter seguidores, mas sobre inspirar outros a descobrirem o líder dentro de si mesmos.',
        author: 'Mentor Inspirador',
        country: 'Universal',
        era: 'Contemporâneo'
      },
      superacao: {
        message: 'Sua força não está na ausência de quedas, mas na coragem de se levantar cada vez mais sábio e resiliente.',
        author: 'Mentor Inspirador',
        country: 'Universal',
        era: 'Contemporâneo'
      },
      sabedoria: {
        message: 'A verdadeira sabedoria floresce quando unimos o conhecimento da mente com a intuição do coração.',
        author: 'Mentor Inspirador',
        country: 'Universal',
        era: 'Contemporâneo'
      },
      crescimento: {
        message: 'Crescimento é a arte de se tornar amigo de suas imperfeições enquanto caminha em direção ao seu potencial infinito.',
        author: 'Mentor Inspirador',
        country: 'Universal',
        era: 'Contemporâneo'
      },
      inspiracao: {
        message: 'Cada respiração é uma nova oportunidade de escolher coragem ao invés de medo, amor ao invés de julgamento.',
        author: 'Mentor Inspirador',
        country: 'Universal',
        era: 'Contemporâneo'
      }
    };

    const selectedMessage = fallbackMessages[category as keyof typeof fallbackMessages] || fallbackMessages.inspiracao;

    return {
      id: this.generateId(),
      ...selectedMessage,
      category: (category as any) || 'inspiracao',
      timestamp: new Date()
    };
  }

  /**
   * Gera ID único para a mensagem
   */
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica se o serviço está inicializado
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Obtém estatísticas do serviço
   */
  public getServiceStats() {
    return {
      initialized: this.isInitialized,
      hasApiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
      modelName: this.isInitialized ? 'gemini-2.0-flash-exp' : 'not-initialized'
    };
  }
}

export default MotivationalService;
export const motivationalService = MotivationalService.getInstance();