import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { TherapistService } from '../../services/therapistService'
import { useAppStore } from '../../stores/useAppStore'

interface TestResult {
  type: 'success' | 'error' | 'info'
  message: string
  timestamp: Date
}

const WebhookTester: React.FC = () => {
  const { user } = useAppStore()
  const [testMessage, setTestMessage] = useState('Olá, como você pode me ajudar hoje?')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const addResult = (type: TestResult['type'], message: string) => {
    setResults(prev => [...prev, { type, message, timestamp: new Date() }])
  }

  const testDirectWebhook = async () => {
    setIsLoading(true)
    addResult('info', 'Testando webhook direto...')

    try {
      const response = await TherapistService.sendMessage({
        message: testMessage,
        userId: user?.id || 'test-user',
        userName: user?.name || 'Test User',
        userEmail: user?.email || 'test@example.com',
        context: {
          dailyProtocol: { completed: false },
          userProgress: { streak: 5, level: 2, xp: 150 }
        }
      })

      addResult('success', `Resposta recebida: ${response.response.substring(0, 100)}...`)
      if (response.suggestions?.length) {
        addResult('info', `Sugestões: ${response.suggestions.join(', ')}`)
      }
    } catch (error) {
      addResult('error', `Erro no teste direto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testAsyncWebhook = async () => {
    setIsLoading(true)
    addResult('info', 'Testando webhook assíncrono...')

    try {
      await TherapistService.sendMessageWithCallback({
        message: testMessage,
        userId: user?.id || 'test-user',
        userName: user?.name || 'Test User',
        userEmail: user?.email || 'test@example.com',
        context: {
          dailyProtocol: { completed: false },
          userProgress: { streak: 5, level: 2, xp: 150 }
        }
      }, (response) => {
        addResult('success', `Resposta assíncrona: ${response.response.substring(0, 100)}...`)
        if (response.suggestions?.length) {
          addResult('info', `Sugestões: ${response.suggestions.join(', ')}`)
        }
        setIsLoading(false)
      })

      addResult('info', 'Mensagem enviada, aguardando resposta...')
    } catch (error) {
      addResult('error', `Erro no teste assíncrono: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setIsLoading(false)
    }
  }

  const testSimulatedResponse = async () => {
    addResult('info', 'Simulando resposta do webhook...')
    
    try {
      await TherapistService.simulateWebhookResponse(
        user?.id || 'test-user',
        testMessage
      )
      addResult('success', 'Simulação de webhook iniciada')
    } catch (error) {
      addResult('error', `Erro na simulação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  const testConnection = async () => {
    addResult('info', 'Testando conexão com n8n...')
    
    try {
      const isConnected = await TherapistService.testConnection()
      if (isConnected) {
        addResult('success', 'Conexão com n8n estabelecida com sucesso')
      } else {
        addResult('error', 'Falha na conexão com n8n')
      }
    } catch (error) {
      addResult('error', `Erro no teste de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  const getResultIcon = (type: TestResult['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success-green" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-error-red" />
      default:
        return <Zap className="w-4 h-4 text-royal-gold" />
    }
  }

  return (
    <div className="glass-card p-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Zap className="w-6 h-6 text-royal-gold" />
        <h2 className="text-white text-xl font-heading font-bold">
          Testador de Webhook N8N
        </h2>
      </div>

      {/* Input de Teste */}
      <div className="mb-6">
        <label className="block text-pearl-white/80 text-sm font-medium mb-2">
          Mensagem de Teste
        </label>
        <textarea
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-pearl-white/50 focus:outline-none focus:border-royal-gold resize-none"
          rows={3}
          placeholder="Digite uma mensagem para testar o webhook..."
        />
      </div>

      {/* Botões de Teste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.button
          onClick={testConnection}
          disabled={isLoading}
          className="neuro-button bg-sage-green hover:bg-sage-green/80 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          whileTap={{ scale: 0.98 }}
        >
          Testar Conexão
        </motion.button>

        <motion.button
          onClick={testDirectWebhook}
          disabled={isLoading || !testMessage.trim()}
          className="neuro-button bg-royal-gold hover:bg-royal-gold/80 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          whileTap={{ scale: 0.98 }}
        >
          Webhook Direto
        </motion.button>

        <motion.button
          onClick={testAsyncWebhook}
          disabled={isLoading || !testMessage.trim()}
          className="neuro-button bg-deep-forest hover:bg-deep-forest/80 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          whileTap={{ scale: 0.98 }}
        >
          Webhook Assíncrono
        </motion.button>

        <motion.button
          onClick={testSimulatedResponse}
          disabled={isLoading || !testMessage.trim()}
          className="neuro-button bg-forest-green hover:bg-forest-green/80 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          whileTap={{ scale: 0.98 }}
        >
          Simular Resposta
        </motion.button>
      </div>

      {/* Resultados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-lg font-semibold">
            Resultados dos Testes
          </h3>
          {results.length > 0 && (
            <motion.button
              onClick={clearResults}
              className="text-pearl-white/60 hover:text-white text-sm transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              Limpar
            </motion.button>
          )}
        </div>

        <div className="bg-black/20 rounded-lg p-4 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-pearl-white/60 text-center py-8">
              Nenhum teste executado ainda
            </p>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg"
                >
                  {getResultIcon(result.type)}
                  <div className="flex-1">
                    <p className="text-white text-sm">{result.message}</p>
                    <p className="text-pearl-white/50 text-xs mt-1">
                      {result.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center space-x-2 mt-4 p-4 bg-royal-gold/10 rounded-lg"
        >
          <div className="w-4 h-4 border-2 border-royal-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-royal-gold font-medium">Executando teste...</span>
        </motion.div>
      )}
    </div>
  )
}

export default WebhookTester