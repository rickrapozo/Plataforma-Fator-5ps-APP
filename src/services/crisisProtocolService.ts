// Removed GeminiService import - using local analysis instead

export interface CrisisProtocol {
  id: string;
  name: string;
  description: string;
  category: 'breathing' | 'grounding' | 'cognitive';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  duration: number; // em minutos
  steps: ProtocolStep[];
  triggers: string[]; // palavras-chave que ativam este protocolo
  audioEnabled: boolean;
}

export interface ProtocolStep {
  id: string;
  instruction: string;
  duration: number; // em segundos
  type: 'breathing' | 'visualization' | 'grounding' | 'cognitive';
  audioScript?: string;
  breathingPattern?: {
    inhale: number;
    hold: number;
    exhale: number;
    cycles: number;
  };
}

export interface CrisisResponse {
  protocol: CrisisProtocol;
  personalizedMessage: string;
  audioUrl?: string;
  estimatedDuration: number;
  followUpActions: string[];
}

export interface CrisisAnalysisResult {
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedProtocol: string;
  emotionalState: string;
  riskFactors: string[];
  personalizedApproach: string;
}

class CrisisProtocolService {
  private static instance: CrisisProtocolService;
  private protocols: Map<string, CrisisProtocol>;

  private constructor() {
    this.protocols = new Map();
    this.initializeProtocols();
  }

  public static getInstance(): CrisisProtocolService {
    if (!CrisisProtocolService.instance) {
      CrisisProtocolService.instance = new CrisisProtocolService();
    }
    return CrisisProtocolService.instance;
  }

  private initializeProtocols(): void {
    // Protocolo 1: Respiração 4-7-8 (Técnica do Dr. Andrew Weil)
    const breathing478: CrisisProtocol = {
      id: 'breathing-478',
      name: 'Respiração 4-7-8',
      description: 'Técnica de respiração para reduzir ansiedade e promover calma instantânea',
      category: 'breathing',
      urgencyLevel: 'medium',
      duration: 5,
      audioEnabled: true,
      triggers: ['ansioso', 'nervoso', 'respirar', 'calma', 'relaxar', 'estresse'],
      steps: [
        {
          id: 'prep',
          instruction: 'Encontre uma posição confortável, sentado ou deitado. Coloque a ponta da língua atrás dos dentes superiores.',
          duration: 30,
          type: 'breathing',
          audioScript: 'Vamos começar com a técnica de respiração 4-7-8. Encontre uma posição confortável e coloque a ponta da língua atrás dos dentes superiores. Esta técnica vai ajudar você a se acalmar rapidamente.'
        },
        {
          id: 'cycle1',
          instruction: 'Inspire pelo nariz contando até 4, segure a respiração contando até 7, expire pela boca contando até 8.',
          duration: 60,
          type: 'breathing',
          breathingPattern: { inhale: 4, hold: 7, exhale: 8, cycles: 3 },
          audioScript: 'Agora vamos fazer o primeiro ciclo. Inspire pelo nariz... 1, 2, 3, 4. Segure a respiração... 1, 2, 3, 4, 5, 6, 7. Expire pela boca fazendo um som suave... 1, 2, 3, 4, 5, 6, 7, 8. Muito bem!'
        },
        {
          id: 'cycle2',
          instruction: 'Continue com mais 3 ciclos da respiração 4-7-8, mantendo o ritmo constante.',
          duration: 180,
          type: 'breathing',
          breathingPattern: { inhale: 4, hold: 7, exhale: 8, cycles: 9 },
          audioScript: 'Continue respirando no seu próprio ritmo. Inspire... segure... expire. Sinta como seu corpo está relaxando a cada ciclo. Você está fazendo muito bem.'
        },
        {
          id: 'integration',
          instruction: 'Respire naturalmente e observe como se sente. Note a diferença no seu estado emocional.',
          duration: 60,
          type: 'breathing',
          audioScript: 'Agora respire naturalmente e observe como você se sente. Note a diferença no seu estado emocional. Você conseguiu! Esta técnica está sempre disponível quando precisar.'
        }
      ]
    };

    // Protocolo 2: Grounding 5-4-3-2-1
    const grounding54321: CrisisProtocol = {
      id: 'grounding-54321',
      name: 'Técnica de Grounding 5-4-3-2-1',
      description: 'Técnica de ancoragem sensorial para crises de ansiedade e ataques de pânico',
      category: 'grounding',
      urgencyLevel: 'high',
      duration: 7,
      audioEnabled: true,
      triggers: ['pânico', 'descontrole', 'perdido', 'confuso', 'dissociação', 'ataque'],
      steps: [
        {
          id: 'introduction',
          instruction: 'Você está seguro. Vamos usar seus sentidos para te trazer de volta ao momento presente.',
          duration: 30,
          type: 'grounding',
          audioScript: 'Você está seguro agora. Vamos usar uma técnica chamada 5-4-3-2-1 que vai usar seus sentidos para te trazer de volta ao momento presente. Respire comigo.'
        },
        {
          id: 'sight',
          instruction: 'Olhe ao seu redor e identifique 5 coisas que você pode VER. Diga em voz alta ou mentalmente o que são.',
          duration: 90,
          type: 'grounding',
          audioScript: 'Primeiro, olhe ao seu redor e identifique 5 coisas que você pode ver. Pode ser uma parede, um objeto, uma cor... Diga em voz alta ou mentalmente o que você está vendo. Tome seu tempo.'
        },
        {
          id: 'touch',
          instruction: 'Agora identifique 4 coisas que você pode TOCAR. Sinta a textura, temperatura ou peso.',
          duration: 90,
          type: 'grounding',
          audioScript: 'Agora identifique 4 coisas que você pode tocar. Pode ser sua roupa, uma mesa, o chão... Sinta a textura, a temperatura. Isso está te conectando com o presente.'
        },
        {
          id: 'sound',
          instruction: 'Identifique 3 sons que você pode OUVIR. Pode ser sua respiração, ruídos externos ou internos.',
          duration: 60,
          type: 'grounding',
          audioScript: 'Agora escute e identifique 3 sons ao seu redor. Pode ser sua respiração, ruídos da rua, o ar condicionado... Apenas observe os sons sem julgamento.'
        },
        {
          id: 'smell',
          instruction: 'Identifique 2 cheiros que você pode SENTIR. Se não conseguir, lembre-se de 2 cheiros que gosta.',
          duration: 60,
          type: 'grounding',
          audioScript: 'Agora tente identificar 2 cheiros. Se não conseguir sentir nenhum cheiro no momento, lembre-se de 2 cheiros que você gosta, como café ou flores.'
        },
        {
          id: 'taste',
          instruction: 'Identifique 1 sabor que você pode SENTIR na boca, ou lembre-se de um sabor que gosta.',
          duration: 30,
          type: 'grounding',
          audioScript: 'Por último, identifique 1 sabor que você pode sentir na boca agora, ou lembre-se de um sabor que você gosta muito.'
        },
        {
          id: 'integration',
          instruction: 'Respire profundamente. Você está aqui, no presente, e está seguro.',
          duration: 60,
          type: 'grounding',
          audioScript: 'Muito bem! Respire profundamente. Você conseguiu se conectar com o presente usando seus 5 sentidos. Você está aqui, agora, e está seguro.'
        }
      ]
    };

    // Protocolo 3: Reestruturação Cognitiva
    const cognitiveRestructuring: CrisisProtocol = {
      id: 'cognitive-restructuring',
      name: 'Reestruturação Cognitiva',
      description: 'Técnica para identificar e modificar pensamentos negativos automáticos',
      category: 'cognitive',
      urgencyLevel: 'low',
      duration: 10,
      audioEnabled: true,
      triggers: ['pensamentos', 'negativo', 'catastrófico', 'preocupação', 'ruminação'],
      steps: [
        {
          id: 'identification',
          instruction: 'Vamos identificar o pensamento que está te incomodando. Qual é exatamente?',
          duration: 120,
          type: 'cognitive',
          audioScript: 'Vamos trabalhar juntos para entender e modificar os pensamentos que estão te causando sofrimento. Primeiro, vamos identificar exatamente qual pensamento está te incomodando.'
        },
        {
          id: 'evidence-against',
          instruction: 'Quais evidências você tem CONTRA este pensamento? Pense em fatos, não em sentimentos.',
          duration: 180,
          type: 'cognitive',
          audioScript: 'Agora vamos examinar as evidências. Quais evidências concretas você tem contra este pensamento? Pense em fatos reais, experiências passadas que contradizem essa ideia.'
        },
        {
          id: 'evidence-for',
          instruction: 'Quais evidências você tem A FAVOR deste pensamento? Seja honesto, mas objetivo.',
          duration: 120,
          type: 'cognitive',
          audioScript: 'Agora, sendo honesto mas objetivo, quais evidências você tem a favor deste pensamento? Lembre-se de separar fatos de interpretações.'
        },
        {
          id: 'alternative',
          instruction: 'Qual seria uma forma mais equilibrada e realista de ver esta situação?',
          duration: 180,
          type: 'cognitive',
          audioScript: 'Considerando todas as evidências, qual seria uma forma mais equilibrada e realista de ver esta situação? Como um amigo sábio veria isso?'
        },
        {
          id: 'action-plan',
          instruction: 'Que ação prática você pode tomar agora para lidar com esta situação?',
          duration: 120,
          type: 'cognitive',
          audioScript: 'Agora que você tem uma perspectiva mais equilibrada, que ação prática e construtiva você pode tomar para lidar com esta situação?'
        },
        {
          id: 'affirmation',
          instruction: 'Repita: "Eu posso lidar com desafios. Meus pensamentos não são fatos. Eu tenho controle sobre minhas respostas."',
          duration: 60,
          type: 'cognitive',
          audioScript: 'Para finalizar, repita comigo: "Eu posso lidar com desafios. Meus pensamentos não são fatos. Eu tenho controle sobre minhas respostas." Você fez um excelente trabalho!'
        }
      ]
    };

    this.protocols.set(breathing478.id, breathing478);
    this.protocols.set(grounding54321.id, grounding54321);
    this.protocols.set(cognitiveRestructuring.id, cognitiveRestructuring);
  }

  public async analyzeCrisisAndSelectProtocol(userInput: string, context?: any): Promise<CrisisAnalysisResult> {
    const input = userInput.toLowerCase();
    
    // Análise baseada em palavras-chave
    const panicKeywords = ['pânico', 'desespero', 'descontrole', 'não consigo', 'sufocando', 'coração acelerado'];
    const anxietyKeywords = ['ansioso', 'nervoso', 'preocupado', 'estresse', 'tensão', 'inquieto'];
    const negativeThoughtsKeywords = ['inútil', 'fracasso', 'não sirvo', 'pessimista', 'ruminação', 'pensamentos negativos'];
    const criticalKeywords = ['suicídio', 'morrer', 'acabar com tudo', 'não aguento mais', 'sem saída'];
    
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let recommendedProtocol = 'breathing-478';
    let emotionalState = 'estado emocional alterado';
    let riskFactors: string[] = [];
    
    // Detectar nível crítico
    if (criticalKeywords.some(keyword => input.includes(keyword))) {
      urgencyLevel = 'critical';
      recommendedProtocol = 'grounding-54321';
      emotionalState = 'crise severa';
      riskFactors = ['ideação suicida', 'desespero extremo'];
    }
    // Detectar pânico
    else if (panicKeywords.some(keyword => input.includes(keyword))) {
      urgencyLevel = 'high';
      recommendedProtocol = 'grounding-54321';
      emotionalState = 'ataque de pânico';
      riskFactors = ['pânico', 'descontrole'];
    }
    // Detectar pensamentos negativos
    else if (negativeThoughtsKeywords.some(keyword => input.includes(keyword))) {
      urgencyLevel = 'medium';
      recommendedProtocol = 'cognitive-restructuring';
      emotionalState = 'pensamentos negativos';
      riskFactors = ['autocrítica', 'pessimismo'];
    }
    // Detectar ansiedade
    else if (anxietyKeywords.some(keyword => input.includes(keyword))) {
      urgencyLevel = 'medium';
      recommendedProtocol = 'breathing-478';
      emotionalState = 'ansiedade';
      riskFactors = ['estresse', 'ansiedade'];
    }
    
    return {
      urgencyLevel,
      recommendedProtocol,
      emotionalState,
      riskFactors,
      personalizedApproach: 'Vamos trabalhar juntos para te ajudar a se sentir melhor. Escolhi uma técnica que pode ser muito eficaz para sua situação atual.'
    };
  }

  public async generateCrisisResponse(userInput: string, userName?: string): Promise<CrisisResponse> {
    // 1. Analisar a crise e selecionar protocolo
    const analysis = await this.analyzeCrisisAndSelectProtocol(userInput);
    const protocol = this.protocols.get(analysis.recommendedProtocol);

    if (!protocol) {
      throw new Error('Protocolo não encontrado');
    }

    // 2. Gerar mensagem personalizada
    const personalizationPrompt = `
      Crie uma mensagem de apoio personalizada e empática para alguém em crise emocional.
      
      Contexto:
      - Nome: ${userName || 'pessoa querida'}
      - Mensagem original: "${userInput}"
      - Estado emocional: ${analysis.emotionalState}
      - Protocolo selecionado: ${protocol.name}
      - Abordagem: ${analysis.personalizedApproach}
      
      A mensagem deve:
      - Ser calorosa e acolhedora
      - Validar os sentimentos da pessoa
      - Explicar brevemente o protocolo que será usado
      - Transmitir esperança e confiança
      - Ter no máximo 150 palavras
      
      Responda apenas com a mensagem, sem formatação adicional.
    `;

    // Personalização simplificada sem Gemini
    const personalizedMessage = `Olá ${userName || 'pessoa querida'}, eu entendo que você está passando por um momento difícil. Vamos trabalhar juntos com a técnica ${protocol.name} para te ajudar a se sentir melhor. Você não está sozinho(a) nisto.`;
    
    console.log('Mensagem personalizada gerada localmente');

    // 3. Áudio desabilitado (funcionalidade TTS removida)
    let audioUrl: string | undefined;

    // 4. Calcular duração estimada
    const estimatedDuration = protocol.steps.reduce((total, step) => total + step.duration, 0);

    // 5. Gerar ações de follow-up
    const followUpActions = [
      'Pratique esta técnica regularmente',
      'Considere conversar com um profissional de saúde mental',
      'Mantenha contato com pessoas de confiança',
      'Cuide da sua alimentação e sono'
    ];

    return {
      protocol,
      personalizedMessage,
      audioUrl,
      estimatedDuration,
      followUpActions
    };
  }

  public getProtocol(id: string): CrisisProtocol | undefined {
    return this.protocols.get(id);
  }

  public getAllProtocols(): CrisisProtocol[] {
    return Array.from(this.protocols.values());
  }

  public async generateStepAudio(step: ProtocolStep): Promise<string | null> {
    if (!step.audioScript) return null;

    try {
      // Usar síntese de voz nativa do navegador
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(step.audioScript);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        // Tentar encontrar uma voz feminina em português
        const voices = speechSynthesis.getVoices();
        const ptVoice = voices.find(voice => 
          voice.lang.includes('pt') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => voice.lang.includes('pt'));
        
        if (ptVoice) {
          utterance.voice = ptVoice;
        }
        
        speechSynthesis.speak(utterance);
        return 'native-speech-synthesis'; // Indicador de que o áudio foi reproduzido
      }
      return null;
    } catch (error) {
      console.error('Erro ao gerar áudio do passo:', error);
      return null;
    }
  }

  public detectCrisisTriggers(text: string): string[] {
    const detectedProtocols: string[] = [];
    const lowerText = text.toLowerCase();

    for (const protocol of Array.from(this.protocols.values())) {
      const hasMatch = protocol.triggers.some(trigger => 
        lowerText.includes(trigger.toLowerCase())
      );
      
      if (hasMatch) {
        detectedProtocols.push(protocol.id);
      }
    }

    return detectedProtocols;
  }
}

export default CrisisProtocolService;