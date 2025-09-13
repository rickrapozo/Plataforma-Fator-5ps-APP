// Script para testar a conexão com o webhook do terapeuta AI
import axios from 'axios';

// URL do webhook configurada
const WEBHOOK_URL = 'https://primary-production-33a76.up.railway.app/webhook/terapeuta-ai-webhook';

async function testWebhook() {
  console.log('🔗 Testando webhook do Terapeuta AI...');
  console.log('📍 URL:', WEBHOOK_URL);
  
  try {
    const testData = {
      message: 'Olá, este é um teste de conexão com o terapeuta AI.',
      user: {
        id: 'test-user-123',
        name: 'Usuário Teste',
        email: 'teste@exemplo.com'
      },
      userInfo: {
        nome: 'Usuário Teste',
        id: 'test-user-123',
        output: 'Olá, este é um teste de conexão com o terapeuta AI.'
      },
      context: {
        dailyProtocol: null,
        userProgress: null,
        onboardingResults: null
      },
      conversationId: `conv_${Date.now()}_test-user-123`,
      timestamp: new Date().toISOString(),
      platform: 'essential-factor-5p',
      requestFragmentedResponse: true,
      test: true
    };

    console.log('📤 Enviando dados de teste...');
    console.log('📋 Payload:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(WEBHOOK_URL, testData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Essential-Factor-5P-Test'
      }
    });

    console.log('✅ Teste bem-sucedido!');
    console.log('📊 Status:', response.status);
    console.log('📨 Resposta:', JSON.stringify(response.data, null, 2));
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro no teste:');
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📨 Resposta:', error.response.data);
      console.error('🔍 Headers:', error.response.headers);
    } else if (error.request) {
      console.error('📡 Sem resposta do servidor');
      console.error('🔍 Request:', error.request);
    } else {
      console.error('⚠️ Erro de configuração:', error.message);
    }
    
    return false;
  }
}

// Executa o teste
testWebhook()
  .then(success => {
    if (success) {
      console.log('\n🎉 Webhook configurado e funcionando corretamente!');
      process.exit(0);
    } else {
      console.log('\n💥 Falha na configuração do webhook.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Erro inesperado:', error);
    process.exit(1);
  });