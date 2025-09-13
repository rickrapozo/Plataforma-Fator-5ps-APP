require('dotenv').config()
const axios = require('axios')

// Simula exatamente o que o TherapistService faz
async function testTherapistService() {
  console.log('🧪 Testando TherapistService com resposta vazia do N8N')
  console.log('==================================================')
  
  const webhookUrl = process.env.VITE_N8N_WEBHOOK_URL
  
  if (!webhookUrl) {
    throw new Error('VITE_N8N_WEBHOOK_URL não encontrada no .env')
  }
  
  console.log('🔗 Webhook URL:', webhookUrl)
  
  const data = {
    message: 'Olá, como você pode me ajudar hoje?',
    user: {
      id: 'test-user-123',
      name: 'Usuário Teste',
      email: 'teste@exemplo.com'
    },
    userInfo: {
      nome: 'Usuário Teste',
      id: 'test-user-123',
      output: 'Olá, como você pode me ajudar hoje?'
    },
    context: {
      dailyProtocol: null,
      userProgress: {
        streak: 5,
        level: 2,
        xp: 150
      },
      onboardingResults: {
        thought: 4,
        feeling: 3,
        emotion: 4,
        action: 3,
        result: 4
      }
    },
    conversationId: `conv_${Date.now()}_test-user-123`,
    timestamp: new Date().toISOString(),
    platform: 'essential-factor-5p',
    requestFragmentedResponse: true
  }
  
  try {
    console.log('📤 Enviando requisição...')
    
    const response = await axios.post(webhookUrl, data, {
      timeout: 60000
    })
    
    console.log('✅ Resposta recebida:')
    console.log('📊 Status:', response.status)
    console.log('📄 Data:', JSON.stringify(response.data, null, 2))
    
    // Simula exatamente a lógica do TherapistService
    let aiOutput
    if (typeof response.data === 'string') {
      aiOutput = response.data
    } else {
      aiOutput = response.data.output || response.data.response || response.data.message || JSON.stringify(response.data)
    }
    
    console.log('🔍 aiOutput extraído:', JSON.stringify(aiOutput))
    
    // Verifica se a resposta está vazia ou inválida (nova lógica)
    if (!aiOutput || aiOutput.trim() === '' || aiOutput === '{}' || aiOutput === 'null') {
      console.log('⚠️ N8N retornou resposta vazia - ativando fallback')
      
      const welcomeMessages = [
        'Olá! Estou aqui para ajudar você em sua jornada de desenvolvimento pessoal. Como você está se sentindo hoje?',
        'Oi! É um prazer conversar com você. Estou aqui para apoiar seu crescimento pessoal. O que gostaria de compartilhar?',
        'Olá! Sou seu terapeuta virtual e estou aqui para ouvir e ajudar. Como posso apoiá-lo hoje?',
        'Que bom te encontrar aqui! Estou pronto para conversar sobre qualquer coisa que esteja em sua mente. Como posso ajudar?',
        'Seja bem-vindo! Sou seu assistente de bem-estar e estou aqui para apoiar você. O que gostaria de explorar hoje?'
      ]
      
      const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
      
      console.log('✅ Resposta de fallback gerada:')
      console.log('💬 Mensagem:', randomWelcome)
      
      return {
        response: randomWelcome,
        exercises: [
          'Exercício de respiração 4-7-8',
          'Meditação de 5 minutos',
          'Técnica de grounding 5-4-3-2-1'
        ]
      }
    }
    
    console.log('✅ Resposta válida da IA:')
    console.log('💬 Mensagem:', aiOutput)
    
    return {
      response: aiOutput
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message)
    
    if (error.code === 'ECONNABORTED') {
      console.log('⏰ Timeout - usando fallback')
      return {
        response: 'Desculpe, o tempo limite foi excedido. Tente novamente em alguns instantes.'
      }
    }
    
    if (error.response?.status === 404) {
      console.log('🔍 404 - usando fallback')
      return {
        response: 'Serviço temporariamente indisponível. Nossa equipe está trabalhando para resolver isso.'
      }
    }
    
    console.log('🔧 Erro genérico - usando fallback')
    return {
      response: 'Desculpe, estou enfrentando dificuldades técnicas no momento. Que tal tentar novamente?'
    }
  }
}

// Executa o teste
testTherapistService()
  .then(result => {
    console.log('\n🎉 RESULTADO FINAL:')
    console.log('📝 Resposta:', result.response)
    if (result.exercises) {
      console.log('🏃 Exercícios:', result.exercises)
    }
    console.log('\n✅ Teste concluído com sucesso!')
  })
  .catch(error => {
    console.error('\n❌ Erro no teste:', error.message)
    process.exit(1)
  })