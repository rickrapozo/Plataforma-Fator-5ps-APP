# 🌐 Solução: Webhook Público sem ngrok

## 🚨 Problema Identificado

O ngrok foi bloqueado pelo antivírus do Windows. Precisamos de uma solução alternativa para expor o webhook server publicamente.

## 🔧 Soluções Alternativas

### Solução 1: Usar Webhook.site (Temporário)

1. **Acesse:** https://webhook.site
2. **Copie a URL única** (ex: https://webhook.site/12345678-1234-1234-1234-123456789012)
3. **Configure no n8n** para enviar resposta para essa URL
4. **Monitore as requisições** na interface do webhook.site

### Solução 2: Modificar n8n para Resposta Síncrona

**Configure o n8n para retornar a resposta diretamente:**

```json
// No nó Webhook de entrada, configure:
{
  "responseMode": "responseNode",
  "responseData": "allEntries"
}

// Adicione um nó "Respond to Webhook" no final do workflow
{
  "response": "{{$json.ai_response}}",
  "suggestions": ["sugestão1", "sugestão2"],
  "exercises": ["exercício1"],
  "userId": "{{$json.user.id}}",
  "conversationId": "{{$json.conversationId}}",
  "timestamp": "{{new Date().toISOString()}}"
}
```

### Solução 3: Usar Serviço de Tunnel Alternativo

**LocalTunnel (alternativa ao ngrok):**
```bash
npm install -g localtunnel
lt --port 3001 --subdomain therapist-webhook
```

**Cloudflare Tunnel:**
```bash
# Instalar cloudflared
# Depois executar:
cloudflared tunnel --url http://localhost:3001
```

### Solução 4: Webhook Server na Nuvem (Recomendado)

**Usar Vercel, Netlify ou Railway para hospedar o webhook server:**

```javascript
// api/webhook/response.js (Vercel)
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { response, suggestions, exercises, userId, conversationId, timestamp } = req.body

  // Salvar em banco de dados ou cache (Redis)
  // Para que o frontend possa fazer polling

  console.log('Webhook response recebida:', {
    conversationId,
    response: response?.substring(0, 100) + '...'
  })

  res.status(200).json({ success: true })
}
```

## 🎯 Implementação Imediata

### Passo 1: Configurar n8n para Resposta Síncrona

1. **No n8n, edite o workflow**
2. **No nó Webhook de entrada:**
   - Response Mode: `Response Node`
   - Response Data: `All Entries`

3. **Adicione nó "Respond to Webhook" no final:**
   - Response Body:
   ```json
   {
     "response": "{{$('OpenAI').first().json.choices[0].message.content}}",
     "suggestions": [
       "Continue praticando o protocolo 5P",
       "Mantenha o foco na gratidão",
       "Lembre-se de respirar profundamente"
     ],
     "exercises": [
       "Exercício de respiração 4-7-8",
       "Meditação de 5 minutos"
     ],
     "userId": "{{$json.user.id}}",
     "conversationId": "{{$json.conversationId}}",
     "timestamp": "{{new Date().toISOString()}}"
   }
   ```

### Passo 2: Modificar TherapistService

```typescript
// Remover sistema de polling e usar resposta direta
static async sendMessage(data: TherapistMessage): Promise<TherapistResponse> {
  try {
    const response = await axios.post(this.webhookUrl, {
      message: data.message,
      user: {
        id: data.userId,
        name: data.userName,
        email: data.userEmail
      },
      context: data.context,
      conversationId: `conv_${Date.now()}_${data.userId}`,
      timestamp: new Date().toISOString(),
      platform: 'essential-factor-5p'
    }, {
      timeout: 60000 // 60 segundos para IA processar
    })

    return {
      response: response.data.response,
      suggestions: response.data.suggestions || [],
      exercises: response.data.exercises || []
    }
  } catch (error) {
    // Fallback response
    return {
      response: 'Desculpe, estou enfrentando dificuldades técnicas no momento.',
      suggestions: ['Tente novamente em alguns instantes']
    }
  }
}
```

## 🧪 Teste da Solução

```bash
# Testar diretamente o webhook do n8n
curl -X POST https://fator5ps.app.n8n.cloud/webhook-test/a95c2946-75d2-4e20-82bf-f04442a5cdbf \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Como posso melhorar minha ansiedade?",
    "user": {
      "id": "test-user",
      "name": "Teste",
      "email": "teste@email.com"
    },
    "conversationId": "conv_test_123",
    "timestamp": "2025-01-03T12:00:00.000Z",
    "platform": "essential-factor-5p"
  }'
```

## 📋 Vantagens da Solução Síncrona

✅ **Simplicidade:** Sem necessidade de webhook server local
✅ **Confiabilidade:** Resposta direta do n8n
✅ **Sem dependências:** Não precisa de ngrok ou tunnels
✅ **Menos pontos de falha:** Comunicação direta
✅ **Mais rápido:** Sem polling ou delays

## ⚠️ Considerações

- **Timeout:** Aumente para 60s para dar tempo da IA processar
- **Fallback:** Mantenha resposta de erro amigável
- **Logs:** Adicione logs detalhados para debug
- **Rate Limiting:** Configure limites no n8n se necessário

---

**🚀 Recomendação:** Implemente a Solução 2 (Resposta Síncrona) primeiro, pois é mais simples e confiável.