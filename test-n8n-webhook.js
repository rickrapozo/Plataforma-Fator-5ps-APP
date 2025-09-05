// Teste do webhook n8n para Terapeuta AI
import axios from 'axios'

const webhookUrl = 'https://fator5ps.app.n8n.cloud/webhook-test/a95c2946-75d2-4e20-82bf-f04442a5cdbf'

async function testWebhook() {
  console.log('🔍 Testando webhook n8n para Terapeuta AI...')
  console.log('URL:', webhookUrl)
  
  try {
    // Teste 1: Conexão básica
    console.log('\n1. Testando conexão básica...')
    const testData = {
      message: 'Olá, este é um teste de conexão',
      user: {
        id: 'test-user-123',
        name: 'Rick Rapozo',
        email: 'rickrapozo@gmail.com'
      },
      context: {
        dailyProtocol: {
          date: '2025-02-09',
          p1_affirmations: ['Eu sou capaz de grandes transformações'],
          p2_feeling: 'Motivado',
          p3_peak_state_completed: true,
          p4_amv: 'Meditar por 10 minutos',
          p4_completed: true
        },
        userProgress: {
          streak: 7,
          level: 3,
          xp: 2450
        }
      },
      timestamp: new Date().toISOString(),
      platform: 'essential-factor-5p',
      test: true
    }

    const response = await axios.post(webhookUrl, testData, {
      timeout: 30000
    })

    console.log('✅ Webhook respondeu com sucesso!')
    console.log('Status:', response.status)
    console.log('Resposta:', response.data)

    // Teste 2: Mensagem específica sobre protocolo
    console.log('\n2. Testando mensagem sobre protocolo diário...')
    const protocolMessage = {
      message: 'Como posso melhorar meu protocolo diário? Estou com dificuldades no P2 (sentimentos)',
      user: {
        id: 'test-user-123',
        name: 'Rick Rapozo',
        email: 'rickrapozo@gmail.com'
      },
      context: {
        dailyProtocol: {
          date: '2025-02-09',
          p1_affirmations: ['Eu sou capaz de grandes transformações'],
          p2_feeling: null, // Usuário não preencheu
          p2_trigger: '',
          p3_peak_state_completed: false,
          p4_amv: '',
          p4_completed: false
        },
        userProgress: {
          streak: 3,
          level: 1,
          xp: 450
        },
        onboardingResults: {
          thought: 65,
          feeling: 45, // Baixo score em sentimentos
          emotion: 70,
          action: 80,
          result: 55
        }
      },
      timestamp: new Date().toISOString(),
      platform: 'essential-factor-5p'
    }

    const response2 = await axios.post(webhookUrl, {
      message: protocolMessage.message,
      user: protocolMessage.user,
      context: protocolMessage.context,
      timestamp: protocolMessage.timestamp,
      platform: protocolMessage.platform
    }, {
      timeout: 30000
    })

    console.log('✅ Teste de mensagem específica bem-sucedido!')
    console.log('Status:', response2.status)
    console.log('Resposta:', response2.data)

  } catch (error) {
    console.error('❌ Erro no teste do webhook:', error.message)
    
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Dados:', error.response.data)
    } else if (error.request) {
      console.error('Sem resposta do servidor')
    } else {
      console.error('Erro na configuração:', error.message)
    }
  }
}

testWebhook()