import GeminiService from './geminiService';

interface GeminiTTSConfig {
  voiceName?: string;
  prompt?: string;
  language?: string;
}

interface GeminiTTSResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        inlineData?: {
          data: string;
          mimeType: string;
        };
      }>;
    };
  }>;
}

export class GeminiTTSService {
  private static instance: GeminiTTSService;
  private geminiService: GeminiService;
  private apiKey: string;

  private constructor() {
    this.geminiService = GeminiService.getInstance();
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('AVISO: Chave da API do Gemini não configurada para TTS.');
    }
  }

  public static getInstance(): GeminiTTSService {
    if (!GeminiTTSService.instance) {
      GeminiTTSService.instance = new GeminiTTSService();
    }
    return GeminiTTSService.instance;
  }

  /**
   * Converte texto em áudio usando Gemini TTS
   */
  public async textToSpeech(
    text: string, 
    config: GeminiTTSConfig = {}
  ): Promise<ArrayBuffer | null> {
    if (!this.apiKey) {
      console.error('Chave da API do Gemini não configurada');
      return null;
    }

    try {
      const {
        voiceName = 'Aoede', // Voz feminina mais natural e empática
        prompt = 'Fale de forma calorosa, empática e tranquilizadora, como uma terapeuta experiente oferecendo apoio emocional. Use tom suave e pausas naturais.',
        language = 'pt-BR'
      } = config;

      // Prepara o texto com o prompt para melhor controle da voz
      const enhancedText = prompt ? `${prompt}\n\n${text}` : text;

      const requestBody = {
        contents: [{
          parts: [{
            text: enhancedText
          }]
        }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName
              }
            }
          }
        }
      };

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API do Gemini TTS:', errorText);
        return null;
      }

      const data: GeminiTTSResponse = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
        console.error('Resposta inválida da API do Gemini TTS');
        return null;
      }

      // Converte base64 para ArrayBuffer
      const base64Data = data.candidates[0].content.parts[0].inlineData.data;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return bytes.buffer;
    } catch (error) {
      console.error('Erro ao gerar áudio com Gemini TTS:', error);
      return null;
    }
  }

  /**
   * Reproduz texto usando Gemini TTS com configurações otimizadas para crise
   */
  public async speakText(
    text: string, 
    config: GeminiTTSConfig = {},
    urgencyLevel?: string
  ): Promise<boolean> {
    try {
      // Configurações específicas baseadas no nível de urgência
      const crisisConfig = this.getCrisisVoiceConfig(urgencyLevel, config);
      
      const audioBuffer = await this.textToSpeech(text, crisisConfig);
      
      if (!audioBuffer) {
        console.warn('Gemini TTS indisponível, usando síntese do navegador');
        return this.fallbackToWebSpeech(text, urgencyLevel);
      }

      // Para o áudio anterior se estiver tocando
      this.stopSpeaking();

      // Cria contexto de áudio e reproduz
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBufferSource = audioContext.createBufferSource();
      
      // Decodifica o áudio
      const decodedAudio = await audioContext.decodeAudioData(audioBuffer);
      audioBufferSource.buffer = decodedAudio;
      audioBufferSource.connect(audioContext.destination);
      
      // Reproduz o áudio
      audioBufferSource.start();
      
      console.log('Áudio do Gemini TTS reproduzido com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao reproduzir áudio do Gemini TTS:', error);
      return this.fallbackToWebSpeech(text, urgencyLevel);
    }
  }

  /**
   * Obtém configuração de voz baseada no nível de urgência
   */
  private getCrisisVoiceConfig(urgencyLevel?: string, baseConfig: GeminiTTSConfig = {}): GeminiTTSConfig {
    const urgencyConfigs = {
      critical: {
        voiceName: 'Aoede',
        prompt: 'Fale de forma extremamente calma, suave e tranquilizadora, como uma terapeuta experiente em situações de crise. Use tom muito baixo e pausas reconfortantes.',
        language: 'pt-BR'
      },
      high: {
        voiceName: 'Aoede',
        prompt: 'Fale de forma calorosa e empática, como uma conselheira experiente. Use tom suave e pausas naturais para transmitir calma.',
        language: 'pt-BR'
      },
      medium: {
        voiceName: 'Aoede',
        prompt: 'Fale de forma acolhedora e encorajadora, como uma amiga compreensiva. Use tom natural e pausas apropriadas.',
        language: 'pt-BR'
      },
      low: {
        voiceName: 'Aoede',
        prompt: 'Fale de forma positiva e encorajadora, como um coach de bem-estar. Use tom alegre mas respeitoso.',
        language: 'pt-BR'
      }
    };

    const urgencyConfig = urgencyLevel ? urgencyConfigs[urgencyLevel as keyof typeof urgencyConfigs] : urgencyConfigs.medium;
    
    return {
      ...urgencyConfig,
      ...baseConfig // Permite sobrescrever configurações específicas
    };
  }

  /**
   * Fallback para síntese de voz do navegador com configurações de crise
   */
  private fallbackToWebSpeech(text: string, urgencyLevel?: string): boolean {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        
        // Configurações baseadas no nível de urgência
        const urgencySettings = {
          critical: { rate: 0.7, pitch: 0.8, volume: 0.9 }, // Mais lento e suave
          high: { rate: 0.8, pitch: 0.9, volume: 0.8 },
          medium: { rate: 0.9, pitch: 1.0, volume: 0.8 },
          low: { rate: 1.0, pitch: 1.1, volume: 0.8 }
        };
        
        const settings = urgencyLevel ? urgencySettings[urgencyLevel as keyof typeof urgencySettings] : urgencySettings.medium;
        
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;
        
        speechSynthesis.speak(utterance);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no fallback de síntese de voz:', error);
      return false;
    }
  }

  /**
   * Para a reprodução de áudio atual
   */
  public stopSpeaking(): void {
    try {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    } catch (error) {
      console.error('Erro ao parar síntese de voz:', error);
    }
  }

  /**
   * Verifica se o serviço está disponível
   */
  public isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Lista de vozes disponíveis no Gemini TTS
   */
  public getAvailableVoices(): Array<{name: string, gender: string, description: string}> {
    return [
      { name: 'Kore', gender: 'Female', description: 'Voz feminina natural' },
      { name: 'Aoede', gender: 'Female', description: 'Voz feminina suave' },
      { name: 'Callirrhoe', gender: 'Female', description: 'Voz feminina expressiva' },
      { name: 'Charon', gender: 'Male', description: 'Voz masculina profunda' },
      { name: 'Enceladus', gender: 'Male', description: 'Voz masculina natural' },
      { name: 'Fenrir', gender: 'Male', description: 'Voz masculina forte' }
    ];
  }
}

// Exporta instância singleton
export const geminiTTSService = GeminiTTSService.getInstance();
export default GeminiTTSService;