import { supabase } from '../lib/supabase'

export interface WebhookResponse {
  response: string
  suggestions?: string[]
  exercises?: string[]
  userId: string
  conversationId?: string
  timestamp: string
}

export class WebhookService {
  private static instance: WebhookService
  private responseCallbacks: Map<string, (response: WebhookResponse) => void> = new Map()

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService()
    }
    return WebhookService.instance
  }

  // Registra callback para receber resposta de uma conversa específica
  registerCallback(conversationId: string, callback: (response: WebhookResponse) => void) {
    this.responseCallbacks.set(conversationId, callback)
  }

  // Remove callback quando não precisar mais
  unregisterCallback(conversationId: string) {
    this.responseCallbacks.delete(conversationId)
  }

  // Processa resposta recebida do webhook
  async processWebhookResponse(data: WebhookResponse) {
    try {
      console.log('📨 Processando resposta do webhook:', data)

      // Salva a resposta no banco de dados
      await this.saveResponseToDatabase(data)

      // Chama callback se existir (prioriza conversationId)
      const conversationId = data.conversationId || data.userId
      const callback = this.responseCallbacks.get(conversationId)
      
      if (callback) {
        console.log('🎯 Callback encontrado para conversationId:', conversationId)
        callback(data)
        // Remove o callback após usar para evitar chamadas duplicadas
        this.unregisterCallback(conversationId)
      } else {
        console.log('⚠️ Nenhum callback registrado para conversationId:', conversationId)
      }

      return { success: true }
    } catch (error) {
      console.error('❌ Erro ao processar resposta do webhook:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }

  // Salva resposta no banco de dados
  private async saveResponseToDatabase(data: WebhookResponse) {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: data.userId,
          message: data.response,
          sender: 'ai',
          metadata: {
            suggestions: data.suggestions,
            exercises: data.exercises,
            conversation_id: data.conversationId,
            webhook_response: true
          },
          created_at: new Date(data.timestamp).toISOString()
        })

      if (error) {
        console.error('Erro ao salvar mensagem no banco:', error)
        throw error
      }

      console.log('Resposta salva no banco de dados com sucesso')
    } catch (error) {
      console.error('Erro ao salvar no banco:', error)
      throw error
    }
  }

  // Faz polling para buscar respostas do webhook server
  async pollForResponse(conversationId: string): Promise<WebhookResponse | null> {
    try {
      const response = await fetch(`http://localhost:3001/api/webhook/poll/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        console.log(`⚠️ Polling response não OK: ${response.status} - ${response.statusText}`)
        return null
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        console.log('📥 Resposta encontrada via polling:', result.data)
        // Processa a resposta através do sistema de callbacks
        await this.processWebhookResponse(result.data)
        return result.data
      }
      
      return null
    } catch (error) {
      console.error('Erro no polling:', error)
      return null
    }
  }

  // Inicia polling para uma conversa específica
  startPolling(conversationId: string, callback: (response: WebhookResponse) => void, maxAttempts: number = 30) {
    let attempts = 0
    let pollingActive = true
    
    // Registra o callback para esta conversa
    this.registerCallback(conversationId, callback)
    
    const poll = async () => {
      if (!pollingActive) {
        this.unregisterCallback(conversationId)
        return
      }
      
      attempts++
      console.log(`🔄 Polling tentativa ${attempts}/${maxAttempts} para conversationId: ${conversationId}`)
      
      try {
        const response = await this.pollForResponse(conversationId)
        if (response && pollingActive) {
          pollingActive = false
          console.log('✅ Resposta encontrada via polling, parando polling')
          this.unregisterCallback(conversationId)
          callback(response)
          return
        }
      } catch (error) {
        console.error('❌ Erro durante polling:', error)
      }
      
      if (attempts < maxAttempts && pollingActive) {
        setTimeout(poll, 2000) // Tenta novamente em 2 segundos
      } else if (pollingActive) {
        pollingActive = false
        this.unregisterCallback(conversationId)
        console.log('⏰ Timeout no polling para conversationId:', conversationId)
        callback({
          response: 'Desculpe, o tempo limite foi excedido. Tente novamente em alguns instantes.',
          suggestions: ['Tente reformular sua pergunta', 'Verifique sua conexão com a internet'],
          exercises: [],
          userId: '',
          conversationId,
          timestamp: new Date().toISOString()
        })
      }
    }
    
    // Inicia o polling
    console.log('🚀 Iniciando sistema de polling para conversationId:', conversationId)
    setTimeout(poll, 1000) // Primeira tentativa em 1 segundo
  }

  // Cria endpoint para receber webhooks (simulação para desenvolvimento)
  static createWebhookEndpoint() {
    // Em produção, isso seria um endpoint real no servidor
    // Para desenvolvimento, vamos simular com localStorage/eventos
    
    if (typeof window !== 'undefined') {
      // Escuta por mensagens do webhook via postMessage (para testes)
      window.addEventListener('message', (event) => {
        if (event.data.type === 'webhook_response') {
          const webhookService = WebhookService.getInstance()
          webhookService.processWebhookResponse(event.data.payload)
        }
      })

      // Também escuta por mudanças no localStorage (para testes)
      window.addEventListener('storage', (event) => {
        if (event.key === 'webhook_response') {
          try {
            const data = JSON.parse(event.newValue || '{}')
            const webhookService = WebhookService.getInstance()
            webhookService.processWebhookResponse(data)
            // Limpa o localStorage após processar
            localStorage.removeItem('webhook_response')
          } catch (error) {
            console.error('Erro ao processar resposta do localStorage:', error)
          }
        }
      })
    }
  }

  // Método para testar o webhook (simula resposta)
  static async testWebhookResponse(userId: string, message: string) {
    const testResponse: WebhookResponse = {
      response: `Resposta de teste para: "${message}". Esta é uma simulação do webhook do n8n funcionando corretamente.`,
      suggestions: [
        'Continue praticando o protocolo 5P',
        'Mantenha o foco na gratidão',
        'Lembre-se de respirar profundamente'
      ],
      exercises: [
        'Exercício de respiração 4-7-8',
        'Meditação de 5 minutos',
        'Journaling de gratidão'
      ],
      userId,
      conversationId: `test_${Date.now()}`,
      timestamp: new Date().toISOString()
    }

    const webhookService = WebhookService.getInstance()
    return await webhookService.processWebhookResponse(testResponse)
  }
}

// Inicializa o endpoint do webhook
WebhookService.createWebhookEndpoint()

export default WebhookService