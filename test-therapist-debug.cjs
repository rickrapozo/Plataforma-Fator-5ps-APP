const axios = require('axios');
require('dotenv').config();

// Simula exatamente o que a aplicação está fazendo
async function testTherapistService() {
  try {
    console.log('🔍 Testando TherapistService - Debug Completo');
    console.log('=' .repeat(50));
    
    // Dados simulando um usuário real
    const testData = {
      message: "Olá, como você pode me ajudar hoje?",
      userId: "test-user-123",
      userName: "Usuário Teste",
      userEmail: "teste@exemplo.com",
      context: {
        dailyProtocol: null,
        userProgress: { streak: 5, level: 2, xp: 150 },
        onboardingResults: {
          thought: 4,
          feeling: 3,
          emotion: 4,
          action: 3,
          result: 4
        }
      }
    };
    
    const webhookUrl = process.env.VITE_N8N_WEBHOOK_URL;
    console.log('🔗 Webhook URL:', webhookUrl);
    
    if (!webhookUrl) {
      throw new Error('VITE_N8N_WEBHOOK_URL não encontrada no .env');
    }
    
    // Gera ID único para esta conversa
    const conversationId = `conv_${Date.now()}_${testData.userId}`;
    
    console.log('📤 Enviando payload:');
    const payload = {
      message: testData.message,
      user: {
        id: testData.userId,
        name: testData.userName,
        email: testData.userEmail
      },
      userInfo: {
        nome: testData.userName,
        id: testData.userId,
        output: testData.message
      },
      context: testData.context,
      conversationId,
      timestamp: new Date().toISOString(),
      platform: 'essential-factor-5p',
      requestFragmentedResponse: true
    };
    
    console.log(JSON.stringify(payload, null, 2));
    console.log('\n⏱️ Enviando requisição...');
    
    const response = await axios.post(webhookUrl, payload, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Essential-Factor-5P-Debug'
      }
    });
    
    console.log('\n✅ Resposta recebida:');
    console.log('📊 Status:', response.status);
    console.log('📨 Headers:', response.headers);
    console.log('📄 Data:', JSON.stringify(response.data, null, 2));
    
    // Análise da resposta
    console.log('\n🔍 Análise da resposta:');
    
    // Verifica se é um echo
    if (response.data.body && typeof response.data.body === 'object') {
      const sentPayload = {
        message: testData.message,
        user: { id: testData.userId, name: testData.userName, email: testData.userEmail },
        platform: 'essential-factor-5p'
      };
      
      if (response.data.body.message === sentPayload.message && 
          response.data.body.user?.id === sentPayload.user.id) {
        console.log('⚠️ PROBLEMA IDENTIFICADO: N8N está retornando apenas echo dos dados!');
        console.log('🔧 Isso indica que o workflow do N8N não está configurado corretamente.');
        console.log('💡 Solução: Configurar um nó de IA (OpenAI, Claude, etc.) no workflow do N8N.');
        return;
      }
    }
    
    // Tenta extrair a resposta da IA
    let aiOutput;
    if (typeof response.data === 'string') {
      aiOutput = response.data;
      console.log('✅ Resposta da IA encontrada (string):', aiOutput);
    } else {
      aiOutput = response.data.output || response.data.response || response.data.message;
      if (aiOutput) {
        console.log('✅ Resposta da IA encontrada (objeto):', aiOutput);
      } else {
        console.log('❌ Resposta da IA não encontrada nos campos esperados');
        console.log('📋 Campos disponíveis:', Object.keys(response.data));
      }
    }
    
    if (!aiOutput) {
      console.log('⚠️ PROBLEMA: Não foi possível extrair resposta da IA');
      console.log('🔧 Verifique se o workflow do N8N está retornando o campo correto');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('⏱️ Timeout - O N8N demorou mais de 60 segundos para responder');
    } else if (error.response) {
      console.log('📊 Status do erro:', error.response.status);
      console.log('📄 Dados do erro:', error.response.data);
    } else if (error.request) {
      console.log('🌐 Erro de rede - Não foi possível conectar ao webhook');
    }
  }
}

testTherapistService();