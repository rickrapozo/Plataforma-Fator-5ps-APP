import { supabase } from '../lib/supabase'

export interface WebhookResponse {
  response: string
  suggestions?: string[]
  exercises?: string[]
  userId: string
  conversationId?: string
  timestamp: string
}

export interface WebhookConfig {
  url: string
  timeout: number
  retries: number
  environment: 'production' | 'development' | 'local'
}

export class WebhookService {
  private static instance: WebhookService
  private responseCallbacks: Map<string, (response: WebhookResponse) => void> = new Map()
  private webhookConfigs: WebhookConfig[] = []
  private currentConfigIndex: number = 0
  private failedAttempts: Map<string, number> = new Map()

  private constructor() {
    this.initializeWebhookConfigs()
  }

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService()
    }
    return WebhookService.instance
  }

  // Inicializa configurações de webhook com fallback
  private initializeWebhookConfigs() {
    const productionUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://fator5ps.app.n8n.cloud/webhook/a95c2946-75d2-4e20-82bf-f04442a5cdbf'
    const localUrl = import.meta.env.VITE_N8N_LOCAL_WEBHOOK_URL || 'http://localhost:5678/webhook/a95c2946-75d2-4e20-82bf-f04442a5cdbf'
    const fallbackUrl = import.meta.env.VITE_N8N_FALLBACK_WEBHOOK_URL || 'http://localhost:3001/api/webhook'

    this.webhookConfigs = [
      {
        url: productionUrl,
        timeout: 30000,
        retries: 2,
        environment: 'production'
      },
      {
        url: localUrl,
        timeout: 15000,
        retries: 1,
        environment: 'development'
      },
      {
        url: fallbackUrl,
        timeout: 10000,
        retries: 1,
        environment: 'local'
      }
    ]

    // Ordena por ambiente (produção primeiro se não estiver em desenvolvimento)
    if (import.meta.env.PROD) {
      this.webhookConfigs.sort((a, b) => {
        const order = { production: 0, development: 1, local: 2 }
        return order[a.environment] - order[b.environment]
      })
    } else {
      this.webhookConfigs.sort((a, b) => {
        const order = { development: 0, local: 1, production: 2 }
        return order[a.environment] - order[b.environment]
      })
    }

    console.log('🔧 Configurações de webhook inicializadas:', this.webhookConfigs)
  }

  // Obtém a URL do webhook atual com fallback inteligente
  private getWebhookUrl(): string {
    const config = this.webhookConfigs[this.currentConfigIndex]
    if (!config) {
      console.warn('⚠️ Nenhuma configuração de webhook disponível, usando fallback')
      return 'http://localhost:3001/api/webhook'
    }
    return config.url
  }

  // Tenta próxima configuração em caso de falha
  private tryNextWebhookConfig(): boolean {
    this.currentConfigIndex++
    if (this.currentConfigIndex >= this.webhookConfigs.length) {
      this.currentConfigIndex = 0
      return false // Voltou ao início, todas as configurações falharam
    }
    console.log(`🔄 Tentando próxima configuração de webhook: ${this.getWebhookUrl()}`)
    return true
  }

  // Registra falha para uma configuração específica
  private recordFailure(url: string) {
    const failures = this.failedAttempts.get(url) || 0
    this.failedAttempts.set(url, failures + 1)
    console.log(`❌ Falha registrada para ${url}: ${failures + 1} tentativas`)
  }

  // Verifica se uma configuração deve ser evitada temporariamente
  private shouldSkipConfig(config: WebhookConfig): boolean {
    const failures = this.failedAttempts.get(config.url) || 0
    return failures >= config.retries
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

  // Faz polling para buscar respostas do webhook server com fallback
  async pollForResponse(conversationId: string): Promise<WebhookResponse | null> {
    let attempts = 0
    const maxConfigAttempts = this.webhookConfigs.length
    
    while (attempts < maxConfigAttempts) {
      const currentConfig = this.webhookConfigs[this.currentConfigIndex]
      
      // Pula configurações que falharam muito
      if (this.shouldSkipConfig(currentConfig)) {
        console.log(`⏭️ Pulando configuração com muitas falhas: ${currentConfig.url}`)
        if (!this.tryNextWebhookConfig()) {
          break
        }
        attempts++
        continue
      }

      try {
        const webhookUrl = this.getWebhookUrl()
        const pollUrl = webhookUrl.includes('localhost:3001') 
          ? `${webhookUrl}/poll/${conversationId}`
          : `${webhookUrl}?conversationId=${conversationId}&action=poll`
        
        console.log(`🔍 Fazendo polling em: ${pollUrl}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), currentConfig.timeout)
        
        const response = await fetch(pollUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          console.log(`⚠️ Polling response não OK: ${response.status} - ${response.statusText}`)
          this.recordFailure(webhookUrl)
          
          if (!this.tryNextWebhookConfig()) {
            break
          }
          attempts++
          continue
        }
        
        const result = await response.json()
        
        if (result.success && result.data) {
          console.log('📥 Resposta encontrada via polling:', result.data)
          // Reset do índice de configuração em caso de sucesso
          this.currentConfigIndex = 0
          this.failedAttempts.clear()
          
          // Processa a resposta através do sistema de callbacks
          await this.processWebhookResponse(result.data)
          return result.data
        }
        
        return null
        
      } catch (error) {
        console.error(`❌ Erro no polling com ${currentConfig.url}:`, error)
        this.recordFailure(currentConfig.url)
        
        if (!this.tryNextWebhookConfig()) {
          break
        }
        attempts++
      }
    }
    
    console.error('❌ Todas as configurações de webhook falharam no polling')
    return null
  }

  // Envia dados para o webhook com fallback inteligente
  async sendToWebhook(data: any): Promise<{ success: boolean; error?: string }> {
    let attempts = 0
    const maxConfigAttempts = this.webhookConfigs.length
    
    while (attempts < maxConfigAttempts) {
      const currentConfig = this.webhookConfigs[this.currentConfigIndex]
      
      // Pula configurações que falharam muito
      if (this.shouldSkipConfig(currentConfig)) {
        console.log(`⏭️ Pulando configuração com muitas falhas: ${currentConfig.url}`)
        if (!this.tryNextWebhookConfig()) {
          break
        }
        attempts++
        continue
      }

      try {
        const webhookUrl = this.getWebhookUrl()
        console.log(`📤 Enviando dados para webhook: ${webhookUrl}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), currentConfig.timeout)
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          console.log(`⚠️ Webhook response não OK: ${response.status} - ${response.statusText}`)
          this.recordFailure(webhookUrl)
          
          if (!this.tryNextWebhookConfig()) {
            break
          }
          attempts++
          continue
        }
        
        console.log('✅ Dados enviados com sucesso para o webhook')
        // Reset do índice de configuração em caso de sucesso
        this.currentConfigIndex = 0
        this.failedAttempts.clear()
        
        return { success: true }
        
      } catch (error) {
        console.error(`❌ Erro ao enviar para webhook ${currentConfig.url}:`, error)
        this.recordFailure(currentConfig.url)
        
        if (!this.tryNextWebhookConfig()) {
          break
        }
        attempts++
      }
    }
    
    console.error('❌ Todas as configurações de webhook falharam no envio')
    return { success: false, error: 'Todas as configurações de webhook falharam' }
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