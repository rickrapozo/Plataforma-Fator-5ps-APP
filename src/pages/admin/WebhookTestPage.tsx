import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Info, RefreshCw, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAdminAuth } from '../../hooks/useSecureAuth'
import WebhookTester from '../../components/debug/WebhookTester'

const WebhookTestPage: React.FC = () => {
  const navigate = useNavigate()
  const { isLoading: authLoading, isAuthorized, error: authError, logAction } = useAdminAuth()

  // Register access action
  useEffect(() => {
    if (!isAuthorized) return
    
    const registerAccess = async () => {
      try {
        await logAction('access_webhook_test', { page: 'WebhookTestPage' })
      } catch (error) {
        console.error('Erro ao registrar acesso ao teste de webhook:', error)
      }
    }
    
    registerAccess()
  }, [isAuthorized, logAction])

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <RefreshCw className="w-8 h-8 text-royal-gold animate-spin mx-auto mb-4" />
          <p className="text-white">Verificando permissões...</p>
        </motion.div>
      </div>
    )
  }

  // Access denied state
  if (!isAuthorized || authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center max-w-md"
        >
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          
          <h2 className="text-white text-2xl font-heading font-bold mb-4">
            Acesso Negado
          </h2>
          
          <p className="text-pearl-white/80 text-body-md mb-6">
            Você não tem permissão para acessar o teste de webhooks.
          </p>
          
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-royal-gold to-bright-gold text-white py-3 rounded-lg font-semibold"
            whileTap={{ scale: 0.98 }}
          >
            Voltar ao Dashboard
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 backdrop-blur-sm border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            
            <div>
              <h1 className="text-white text-2xl font-heading font-bold">
                Teste de Webhook N8N
              </h1>
              <p className="text-pearl-white/80 text-sm">
                Ferramenta de diagnóstico para o Terapeuta AI
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-royal-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white text-lg font-semibold mb-2">
                Como Funciona o Sistema de Webhook
              </h3>
              <div className="text-pearl-white/80 text-sm space-y-2">
                <p>
                  <strong>Webhook Direto:</strong> Envia mensagem e aguarda resposta síncrona do n8n (timeout: 30s)
                </p>
                <p>
                  <strong>Webhook Assíncrono:</strong> Envia mensagem e registra callback para receber resposta posterior
                </p>
                <p>
                  <strong>Simulação:</strong> Testa o sistema de callbacks sem depender do n8n externo
                </p>
                <p>
                  <strong>URL Atual:</strong> <code className="bg-black/20 px-2 py-1 rounded text-royal-gold">
                    {(import.meta as any).env?.VITE_N8N_WEBHOOK_URL || 'Não configurada'}
                  </code>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Webhook Tester */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WebhookTester />
        </motion.div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mt-8"
        >
          <h3 className="text-white text-lg font-semibold mb-4">
            Detalhes Técnicos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-royal-gold font-medium mb-2">Fluxo de Dados</h4>
              <ul className="text-pearl-white/80 text-sm space-y-1">
                <li>1. Frontend envia mensagem para n8n</li>
                <li>2. N8n processa com IA (GPT/Claude)</li>
                <li>3. N8n retorna resposta via webhook</li>
                <li>4. WebhookService processa resposta</li>
                <li>5. Callback atualiza interface</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-royal-gold font-medium mb-2">Configurações</h4>
              <ul className="text-pearl-white/80 text-sm space-y-1">
                <li>Timeout: 30s (direto) / 45s (assíncrono)</li>
                <li>Retry: Automático em caso de falha</li>
                <li>Fallback: Respostas padrão de erro</li>
                <li>Logging: Console + Supabase</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default WebhookTestPage