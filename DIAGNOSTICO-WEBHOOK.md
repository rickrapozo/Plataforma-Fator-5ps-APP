# 🔍 Diagnóstico: Webhook Disparado mas Chat Não Comunica

## 📊 Status Atual

✅ **Funcionando:**
- Webhook server rodando na porta 3001
- Sistema de polling implementado
- Estrutura de dados correta
- Testes unitários passando

❌ **Problema Identificado:**
- Webhook é disparado no n8n
- Chat não recebe/processa a resposta
- Desconexão entre envio e recebimento

## 🔧 Configuração Atual

### Frontend (TherapistAI)
```typescript
// URL configurada no .env.local
VITE_N8N_WEBHOOK_URL=https://fator5ps.app.n8n.cloud/webhook-test/a95c2946-75d2-4e20-82bf-f04442a5cdbf

// Payload enviado para n8n
{
  message: "mensagem do usuário",
  user: { id, name, email },
  context: { dailyProtocol, userProgress, onboardingResults },
  conversationId: "conv_timestamp_userId",
  timestamp: "ISO string",
  platform: "essential-factor-5p",
  responseWebhook: "http://localhost:3001/api/webhook/response"
}
```

### Webhook Server (Local)
```javascript
// Endpoint esperando resposta do n8n
POST http://localhost:3001/api/webhook/response

// Estrutura esperada
{
  response: "resposta da IA",
  suggestions: ["sugestão1", "sugestão2"],
  exercises: ["exercício1", "exercício2"],
  userId: "user-id",
  conversationId: "conv_id",
  timestamp: "ISO string"
}
```

## 🚨 Possíveis Causas do Problema

### 1. **Configuração Incorreta no n8n**

**Problema:** O n8n não está enviando a resposta de volta

**Verificações Necessárias:**
- [ ] Workflow tem nó HTTP Request para resposta?
- [ ] URL do responseWebhook está correta?
- [ ] Headers Content-Type: application/json?
- [ ] Estrutura JSON da resposta está correta?

**Solução:**
```json
// Configuração do nó HTTP Request no n8n
{
  "method": "POST",
  "url": "{{$json.responseWebhook}}",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "response": "{{$json.ai_response}}",
    "suggestions": ["sugestão1", "sugestão2"],
    "exercises": ["exercício1"],
    "userId": "{{$json.user.id}}",
    "conversationId": "{{$json.conversationId}}",
    "timestamp": "{{new Date().toISOString()}}"
  }
}
```

### 2. **Problema de Conectividade**

**Problema:** n8n não consegue acessar localhost:3001

**Verificações:**
- [ ] n8n está na nuvem? (não acessa localhost)
- [ ] Firewall bloqueando porta 3001?
- [ ] URL precisa ser pública (ngrok, tunnel)?

**Solução para n8n Cloud:**
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3001 publicamente
ngrok http 3001

# Usar URL do ngrok no responseWebhook
# Exemplo: https://abc123.ngrok.io/api/webhook/response
```

### 3. **Timeout ou Erro no n8n**

**Problema:** Workflow falha antes de enviar resposta

**Verificações:**
- [ ] Logs de execução no n8n
- [ ] Timeout da IA (OpenAI/Claude)
- [ ] Erro de autenticação na IA
- [ ] Limite de tokens excedido

### 4. **Problema no Polling**

**Problema:** Frontend não está fazendo polling corretamente

**Verificações:**
- [ ] conversationId único sendo gerado?
- [ ] Polling iniciado antes do envio?
- [ ] Callback registrado corretamente?

## 🧪 Testes de Diagnóstico

### Teste 1: Verificar se n8n recebe requisição
```bash
# No n8n, adicionar nó "Function" após webhook de entrada
return [{
  json: {
    debug: "Requisição recebida",
    conversationId: $json.conversationId,
    message: $json.message,
    responseWebhook: $json.responseWebhook
  }
}];
```

### Teste 2: Testar resposta manual
```bash
# Enviar resposta manual para webhook server
curl -X POST http://localhost:3001/api/webhook/response \
  -H "Content-Type: application/json" \
  -d '{
    "response": "Teste manual",
    "suggestions": ["Sugestão teste"],
    "exercises": ["Exercício teste"],
    "userId": "test-user",
    "conversationId": "conv_test_123",
    "timestamp": "2025-01-03T12:00:00.000Z"
  }'
```

### Teste 3: Verificar logs em tempo real
```bash
# Terminal 1: Logs do webhook server
node webhook-server.cjs

# Terminal 2: Logs do frontend
npm run dev

# Terminal 3: Teste manual
curl -X POST https://fator5ps.app.n8n.cloud/webhook-test/a95c2946-75d2-4e20-82bf-f04442a5cdbf \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Teste de diagnóstico",
    "user": {"id": "test", "name": "Teste", "email": "test@test.com"},
    "conversationId": "conv_diagnostic_123",
    "responseWebhook": "http://localhost:3001/api/webhook/response"
  }'
```

## 🔧 Soluções Recomendadas

### Solução 1: Usar ngrok para n8n Cloud
```bash
# 1. Instalar ngrok
npm install -g ngrok

# 2. Expor webhook server
ngrok http 3001

# 3. Atualizar TherapistService.ts
responseWebhook: 'https://sua-url.ngrok.io/api/webhook/response'
```

### Solução 2: Configurar n8n Self-hosted
```yaml
# docker-compose.yml para n8n local
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
    volumes:
      - n8n_data:/home/node/.n8n
```

### Solução 3: Implementar Webhook Público
```javascript
// Usar serviço como Railway, Vercel, ou Heroku
// para hospedar webhook server publicamente

// Exemplo: webhook-server-public.js
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(cors())

app.post('/api/webhook/response', (req, res) => {
  // Processar resposta e notificar frontend via WebSocket
  // ou salvar em banco de dados para polling
})

app.listen(PORT)
```

## 📋 Checklist de Verificação

### No n8n:
- [ ] Webhook de entrada configurado e ativo
- [ ] Nó de IA (OpenAI/Claude) configurado
- [ ] Nó HTTP Request para resposta configurado
- [ ] URL do responseWebhook correta
- [ ] Headers Content-Type definidos
- [ ] Estrutura JSON da resposta correta
- [ ] Workflow testado manualmente

### No Frontend:
- [ ] VITE_N8N_WEBHOOK_URL configurada
- [ ] conversationId único sendo gerado
- [ ] Polling iniciado antes do envio
- [ ] Callback registrado corretamente
- [ ] Logs de debug habilitados

### No Webhook Server:
- [ ] Servidor rodando na porta 3001
- [ ] CORS configurado
- [ ] Endpoint /api/webhook/response ativo
- [ ] Logs detalhados habilitados
- [ ] Arquivos temporários sendo criados

## 🎯 Próximos Passos

1. **Verificar logs do n8n** - Confirmar se workflow executa completamente
2. **Testar conectividade** - Verificar se n8n consegue acessar localhost:3001
3. **Implementar ngrok** - Se n8n estiver na nuvem
4. **Adicionar logs detalhados** - No n8n para debug
5. **Testar fluxo completo** - Do frontend até a resposta

---

**🚀 Solução Mais Provável:**
O n8n Cloud não consegue acessar `localhost:3001`. Use ngrok ou hospede o webhook server publicamente.