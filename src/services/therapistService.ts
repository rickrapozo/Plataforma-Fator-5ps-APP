import axios from 'axios'
import { WebhookService } from './webhookService'

export interface TherapistMessage {
  message: string
  userId: string
  userName: string
  userEmail: string
  context?: {
    dailyProtocol?: any
    userProgress?: any
    onboardingResults?: any
  }
}

export interface TherapistResponse {
  response: string
  suggestions?: string[]
  exercises?: string[]
}

export class TherapistService {
  private static webhookUrl = (import.meta as any).env?.VITE_N8N_WEBHOOK_URL
  private static productionWebhookUrl = 'https://fator5ps.app.n8n.cloud/webhook/a95c2946-75d2-4e20-82bf-f04442a5cdbf'
  
  // Tenta primeiro a URL de produção, depois a de desenvolvimento
  private static async getWebhookUrl(): Promise<string> {
    // Prioriza URL de produção se disponível
    if (this.productionWebhookUrl) {
      return this.productionWebhookUrl
    }
    
    // Fallback para URL de desenvolvimento
    if (this.webhookUrl) {
      return this.webhookUrl
    }
    
    throw new Error('Nenhuma URL de webhook configurada')
  }

  // Gera sugestões inteligentes baseadas no tema da pergunta
  private static generateSmartSuggestions(userMessage: string): string[] {
    const message = userMessage.toLowerCase()
    
    // Temas relacionados a ansiedade
    if (message.includes('ansiedade') || message.includes('ansioso') || message.includes('preocupação') || message.includes('nervoso')) {
      return [
        'Como posso usar a respiração para controlar a ansiedade?',
        'Quais técnicas de mindfulness podem me ajudar agora?',
        'Como identificar os gatilhos da minha ansiedade?'
      ]
    }
    
    // Temas relacionados a estresse
    if (message.includes('estresse') || message.includes('estressado') || message.includes('pressão') || message.includes('sobrecarga')) {
      return [
        'Como posso gerenciar melhor meu tempo e prioridades?',
        'Quais exercícios de relaxamento são mais eficazes?',
        'Como criar limites saudáveis no trabalho e vida pessoal?'
      ]
    }
    
    // Temas relacionados a sono
    if (message.includes('sono') || message.includes('dormir') || message.includes('insônia') || message.includes('cansaço')) {
      return [
        'Que rotina noturna pode melhorar meu sono?',
        'Como a meditação pode ajudar com a insônia?',
        'Quais hábitos durante o dia afetam meu sono?'
      ]
    }
    
    // Temas relacionados a relacionamentos
    if (message.includes('relacionamento') || message.includes('família') || message.includes('amigos') || message.includes('conflito')) {
      return [
        'Como melhorar a comunicação nos meus relacionamentos?',
        'Quais são as bases de um relacionamento saudável?',
        'Como lidar com conflitos de forma construtiva?'
      ]
    }
    
    // Temas relacionados a autoestima
    if (message.includes('autoestima') || message.includes('confiança') || message.includes('insegurança') || message.includes('valor')) {
      return [
        'Como desenvolver uma autoimagem mais positiva?',
        'Quais práticas diárias fortalecem a autoconfiança?',
        'Como lidar com a autocrítica excessiva?'
      ]
    }
    
    // Temas relacionados ao protocolo 5P
    if (message.includes('protocolo') || message.includes('5p') || message.includes('prática') || message.includes('rotina')) {
      return [
        'Como posso personalizar o protocolo 5P para minha rotina?',
        'Qual a melhor hora do dia para praticar o protocolo?',
        'Como manter a consistência na prática diária?'
      ]
    }
    
    // Temas relacionados a trabalho/carreira
    if (message.includes('trabalho') || message.includes('carreira') || message.includes('profissional') || message.includes('emprego')) {
      return [
        'Como encontrar propósito no meu trabalho atual?',
        'Quais estratégias ajudam com o burnout profissional?',
        'Como equilibrar ambição e bem-estar mental?'
      ]
    }
    
    // Temas relacionados a mudanças
    if (message.includes('mudança') || message.includes('transição') || message.includes('novo') || message.includes('diferente')) {
      return [
        'Como me adaptar melhor a mudanças na vida?',
        'Quais são os primeiros passos para uma transformação pessoal?',
        'Como lidar com a incerteza durante transições?'
      ]
    }
    
    // Sugestões padrão para temas gerais
    return [
      'Como posso aplicar o protocolo 5P na minha situação?',
      'Que exercícios de mindfulness você recomenda?',
      'Como posso desenvolver mais resiliência emocional?'
    ]
  }

  static async sendMessage(data: TherapistMessage): Promise<TherapistResponse> {
    try {
      const webhookUrl = await this.getWebhookUrl()
      
      console.log('📤 Enviando mensagem para terapeuta AI (modo síncrono):', data)
      console.log('🔗 Usando webhook URL:', webhookUrl)

      // Gera ID único para esta conversa
      const conversationId = `conv_${Date.now()}_${data.userId}`

      // Envia mensagem para o n8n e aguarda resposta síncrona
      const response = await axios.post(webhookUrl, {
        message: data.message,
        user: {
          id: data.userId,
          name: data.userName,
          email: data.userEmail
        },
        context: data.context,
        conversationId,
        timestamp: new Date().toISOString(),
        platform: 'essential-factor-5p'
      }, {
        timeout: 60000 // 60 segundos para dar tempo da IA processar
      })

      console.log('✅ Resposta síncrona do terapeuta AI:', response.data)

      // Extrai especificamente o campo 'output' da resposta do webhook
      const aiOutput = response.data.output || response.data.response || response.data.message
      
      // Gera sugestões inteligentes baseadas na mensagem do usuário
      const smartSuggestions = this.generateSmartSuggestions(data.message)
      
      return {
        response: aiOutput || 'Resposta não encontrada no campo output',
        suggestions: response.data.suggestions || smartSuggestions,
        exercises: response.data.exercises || [
          'Exercício de respiração 4-7-8',
          'Meditação de 5 minutos'
        ]
      }

    } catch (error: any) {
      console.error('Erro ao comunicar com terapeuta AI:', error)

      // Gera sugestões inteligentes mesmo em caso de erro
      const smartSuggestions = this.generateSmartSuggestions(data.message)
      
      // Fallback response em caso de erro
      if (error.code === 'ECONNABORTED') {
        return {
          response: 'Desculpe, o tempo limite foi excedido. Tente novamente em alguns instantes.',
          suggestions: smartSuggestions
        }
      }

      if (error.response?.status === 404) {
        return {
          response: 'Serviço temporariamente indisponível. Nossa equipe está trabalhando para resolver isso.',
          suggestions: smartSuggestions
        }
      }

      return {
        response: 'Desculpe, estou enfrentando dificuldades técnicas no momento. Que tal tentar novamente?',
        suggestions: smartSuggestions
      }
    }
  }

  // Método para compatibilidade com código existente (agora usa resposta síncrona)
  static async sendMessageWithCallback(
    data: TherapistMessage, 
    onResponse: (response: TherapistResponse) => void
  ): Promise<void> {
    try {
      console.log('🔄 Usando método de callback (redirecionando para síncrono):', data)
      
      // Chama o método síncrono e executa callback
      const response = await this.sendMessage(data)
      onResponse(response)

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem via callback:', error)
      onResponse({
        response: 'Erro ao enviar mensagem. Tente novamente.',
        suggestions: ['Verifique sua conexão', 'Tente reformular a pergunta']
      })
    }
  }

  // Simula resposta do webhook para testes
  static async simulateWebhookResponse(userId: string, message: string): Promise<void> {
    setTimeout(async () => {
      await WebhookService.testWebhookResponse(userId, message)
    }, 2000) // Simula delay de 2 segundos
  }

  static async testConnection(): Promise<boolean> {
    try {
      if (!this.webhookUrl) {
        console.warn('Webhook URL do n8n não configurada')
        return false
      }

      const response = await axios.post(this.webhookUrl, {
        message: 'Teste de conexão',
        user: {
          id: 'test-user',
          name: 'Test User',
          email: 'test@example.com'
        },
        test: true,
        timestamp: new Date().toISOString()
      }, {
        timeout: 10000
      })

      console.log('Teste de conexão com n8n bem-sucedido:', response.status)
      return response.status === 200

    } catch (error) {
      console.error('Falha no teste de conexão com n8n:', error)
      return false
    }
  }
}