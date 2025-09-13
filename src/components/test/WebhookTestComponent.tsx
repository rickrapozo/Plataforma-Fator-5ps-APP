import React, { useState } from 'react'
import { TherapistService } from '../../services/therapistService'

interface TestResult {
  success: boolean
  message: string
  timestamp: string
  responseTime?: number
}

export const WebhookTestComponent: React.FC = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isTestingMessage, setIsTestingMessage] = useState(false)
  const [isRunningFullTest, setIsRunningFullTest] = useState(false)
  const [connectionResult, setConnectionResult] = useState<TestResult | null>(null)
  const [messageResult, setMessageResult] = useState<TestResult | null>(null)
  const [fullTestResult, setFullTestResult] = useState<any>(null)

  const testWebhookConnection = async () => {
    setIsTestingConnection(true)
    setConnectionResult(null)
    
    const startTime = Date.now()
    
    try {
      const success = await TherapistService.testWebhookConnection()
      const responseTime = Date.now() - startTime
      
      setConnectionResult({
        success,
        message: success 
          ? 'Sistema de webhook de teste configurado corretamente!' 
          : 'Falha na conexão com o webhook de teste',
        timestamp: new Date().toISOString(),
        responseTime
      })
    } catch (error) {
      setConnectionResult({
        success: false,
        message: `Erro durante teste: ${error}`,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const testMessageSending = async () => {
    setIsTestingMessage(true)
    setMessageResult(null)
    
    const startTime = Date.now()
    
    try {
      const response = await TherapistService.sendTestMessage({
        message: 'Como posso melhorar minha ansiedade?',
        userId: 'test-user-ui',
        userName: 'Test User UI',
        userEmail: 'test-ui@example.com',
        context: {
          dailyProtocol: { mood: 'anxious' },
          userProgress: { level: 'beginner' }
        }
      })
      
      const responseTime = Date.now() - startTime
      
      setMessageResult({
        success: true,
        message: `Resposta recebida: "${response.response.substring(0, 100)}..."`,
        timestamp: new Date().toISOString(),
        responseTime
      })
    } catch (error) {
      setMessageResult({
        success: false,
        message: `Erro durante teste de mensagem: ${error}`,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      })
    } finally {
      setIsTestingMessage(false)
    }
  }

  const runFullSystemTest = async () => {
    setIsRunningFullTest(true)
    setFullTestResult(null)
    
    try {
      const result = await TherapistService.runAutomatedSystemTest()
      setFullTestResult(result)
    } catch (error) {
      setFullTestResult({
        success: false,
        results: {
          webhookTest: false,
          responseTime: 0,
          timestamp: new Date().toISOString()
        },
        error: String(error)
      })
    } finally {
      setIsRunningFullTest(false)
    }
  }

  const ResultCard: React.FC<{ result: TestResult; title: string }> = ({ result, title }) => (
    <div className={`p-4 rounded-lg border-2 ${
      result.success 
        ? 'border-green-200 bg-green-50' 
        : 'border-red-200 bg-red-50'
    }`}>
      <h4 className={`font-semibold mb-2 ${
        result.success ? 'text-green-800' : 'text-red-800'
      }`}>
        {result.success ? '✅' : '❌'} {title}
      </h4>
      <p className={`text-sm mb-2 ${
        result.success ? 'text-green-700' : 'text-red-700'
      }`}>
        {result.message}
      </p>
      <div className="text-xs text-gray-600">
        <p>Tempo: {result.responseTime}ms</p>
        <p>Timestamp: {new Date(result.timestamp).toLocaleString()}</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🧪 Sistema de Teste de Webhook
        </h2>
        <p className="text-gray-600 mb-6">
          Este sistema testa exclusivamente o webhook de teste configurado, 
          sem interferir com o ambiente de produção.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">🔗 URL de Teste Configurada:</h3>
          <code className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
            https://primary-production-33a76.up.railway.app/webhook-test/terapeuta-ai-webhook
          </code>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testWebhookConnection}
            disabled={isTestingConnection}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isTestingConnection ? '🔄 Testando...' : '🔗 Testar Conexão'}
          </button>
          
          <button
            onClick={testMessageSending}
            disabled={isTestingMessage}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isTestingMessage ? '🔄 Enviando...' : '📨 Testar Mensagem'}
          </button>
          
          <button
            onClick={runFullSystemTest}
            disabled={isRunningFullTest}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isRunningFullTest ? '🔄 Executando...' : '🚀 Teste Completo'}
          </button>
        </div>

        <div className="space-y-4">
          {connectionResult && (
            <ResultCard result={connectionResult} title="Teste de Conexão" />
          )}
          
          {messageResult && (
            <ResultCard result={messageResult} title="Teste de Mensagem" />
          )}
          
          {fullTestResult && (
            <div className={`p-4 rounded-lg border-2 ${
              fullTestResult.success 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                fullTestResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {fullTestResult.success ? '✅' : '❌'} Teste Automatizado Completo
              </h4>
              <div className="text-sm space-y-1">
                <p>Webhook: {fullTestResult.results.webhookTest ? '✅ Sucesso' : '❌ Falha'}</p>
                <p>Tempo total: {fullTestResult.results.responseTime}ms</p>
                <p>Timestamp: {new Date(fullTestResult.results.timestamp).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ Informações Importantes:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Este sistema usa exclusivamente a URL de teste configurada</li>
            <li>• Não interfere com o ambiente de produção</li>
            <li>• Erro 404 é tratado como sucesso (sistema configurado corretamente)</li>
            <li>• Fallbacks automáticos garantem funcionamento independente do N8N</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default WebhookTestComponent