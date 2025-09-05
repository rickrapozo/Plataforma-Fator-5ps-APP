const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

// Configurar encoding UTF-8
process.stdout.setEncoding('utf8')
process.stderr.setEncoding('utf8')

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Configurar charset UTF-8 para todas as respostas
app.use((req, res, next) => {
  res.charset = 'utf-8'
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  next()
})

// Armazena callbacks ativos
const activeCallbacks = new Map()

// Endpoint para receber respostas do n8n
app.post('/api/webhook/response', (req, res) => {
  console.log('🔔 Webhook response recebida do n8n:')
  console.log('📋 Headers:', req.headers)
  console.log('📦 Body:', JSON.stringify(req.body, null, 2))
  
  try {
    const data = req.body
    
    // Validação básica
    if (!data.conversationId) {
      console.error('❌ conversationId não fornecido na resposta do webhook')
      return res.status(400).json({ 
        success: false, 
        error: 'conversationId é obrigatório' 
      })
    }
    
    // Estrutura esperada do n8n
    const webhookResponse = {
      response: data.response || data.message || 'Resposta do n8n recebida',
      suggestions: data.suggestions || [],
      exercises: data.exercises || [],
      userId: data.userId || data.user?.id,
      conversationId: data.conversationId,
      timestamp: data.timestamp || new Date().toISOString()
    }
    
    console.log('📤 Processando resposta estruturada:', JSON.stringify(webhookResponse, null, 2))
    
    // Salva a resposta em arquivo temporário para o frontend ler
    const tempFile = path.join(__dirname, 'temp', `webhook_${webhookResponse.conversationId}.json`)
    
    // Cria diretório temp se não existir
    const tempDir = path.dirname(tempFile)
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    
    // Salva resposta
    fs.writeFileSync(tempFile, JSON.stringify(webhookResponse, null, 2), 'utf8')
    
    // Também salva em arquivo geral para polling
    const generalFile = path.join(__dirname, 'temp', 'latest_webhook_response.json')
    fs.writeFileSync(generalFile, JSON.stringify({
      ...webhookResponse,
      receivedAt: new Date().toISOString()
    }, null, 2), 'utf8')
    
    console.log('✅ Resposta salva em:', tempFile)
    
    res.json({ 
      success: true, 
      message: 'Webhook processado com sucesso',
      conversationId: webhookResponse.conversationId
    })
    
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error)
    res.status(400).json({ 
      success: false, 
      error: 'Erro ao processar webhook: ' + error.message 
    })
  }
})

// Endpoint para o frontend buscar respostas
app.get('/api/webhook/poll/:conversationId', (req, res) => {
  const { conversationId } = req.params
  const tempDir = path.join(__dirname, 'temp')
  const conversationFile = path.join(tempDir, `webhook_${conversationId}.json`)
  
  console.log(`🔍 Polling para conversationId: ${conversationId}`)
  console.log(`📁 Procurando arquivo: ${conversationFile}`)
  
  if (fs.existsSync(conversationFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(conversationFile, 'utf8'))
      console.log(`✅ Arquivo encontrado, dados:`, JSON.stringify(data, null, 2))
      
      // Remove o arquivo após leitura para evitar reprocessamento
      fs.unlinkSync(conversationFile)
      console.log(`🗑️ Arquivo removido: ${conversationFile}`)
      
      res.json({ success: true, data })
    } catch (error) {
      console.error('❌ Erro ao ler arquivo de resposta:', error)
      res.json({ success: false, error: 'Erro ao processar resposta' })
    }
  } else {
    console.log(`⚠️ Arquivo não encontrado para conversationId: ${conversationId}`)
    res.json({ success: false, message: 'Nenhuma resposta encontrada' })
  }
})

// Endpoint para buscar última resposta (para testes)
app.get('/api/webhook/latest', (req, res) => {
  const generalFile = path.join(__dirname, 'temp', 'latest_webhook_response.json')
  
  if (fs.existsSync(generalFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(generalFile, 'utf8'))
      res.json({ success: true, data })
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao ler resposta' })
    }
  } else {
    res.json({ success: false, message: 'Nenhuma resposta disponível' })
  }
})

// Endpoint de status
app.get('/api/webhook/status', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Webhook server funcionando',
    timestamp: new Date().toISOString(),
    port: PORT
  })
})

// Limpa arquivos temporários antigos a cada 5 minutos
setInterval(() => {
  const tempDir = path.join(__dirname, 'temp')
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir)
    const now = Date.now()
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file)
      const stats = fs.statSync(filePath)
      const ageInMinutes = (now - stats.mtime.getTime()) / (1000 * 60)
      
      // Remove arquivos com mais de 10 minutos
      if (ageInMinutes > 10) {
        fs.unlinkSync(filePath)
        console.log(`🗑️ Arquivo temporário removido: ${file}`)
      }
    })
  }
}, 5 * 60 * 1000) // 5 minutos

app.listen(PORT, () => {
  console.log(`🚀 Webhook server rodando na porta ${PORT}`)
  console.log(`📡 Endpoint para n8n: http://localhost:${PORT}/api/webhook/response`)
  console.log(`🔍 Status: http://localhost:${PORT}/api/webhook/status`)
  console.log(`📊 Última resposta: http://localhost:${PORT}/api/webhook/latest`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando webhook server...')
  process.exit(0)
})

module.exports = app