# Configuração do Webhook N8N para Terapeuta AI

## Status Atual
✅ **Webhook URL configurado na plataforma:** `https://fator5ps.app.n8n.cloud/webhook-test/terapeuta-ai-webhook`

❌ **Erro encontrado:** O webhook está retornando erro 500 "No authentication data defined on node!"

## Passos para Configurar no N8N

### 1. Acessar o N8N
- Acesse: https://fator5ps.app.n8n.cloud
- Faça login com suas credenciais

### 2. Configurar o Workflow do Terapeuta AI

#### 2.1 Webhook Node (Entrada)
- **Path:** `/webhook-test/terapeuta-ai-webhook`
- **HTTP Method:** POST
- **Authentication:** None (ou configurar se necessário)
- **Response Mode:** Respond to Webhook

#### 2.2 Configurações Necessárias

**Credenciais do Gemini:**
```
Nome: gemini-credentials
Tipo: Generic Credential
Fields:
- API Key: [SUA_CHAVE_DO_GEMINI]
```

**Credenciais do PostgreSQL (se usando):**
```
Nome: postgresql-credentials
Tipo: Postgres
Fields:
- Host: [SEU_HOST_POSTGRES]
- Database: [SEU_DATABASE]
- User: [SEU_USER]
- Password: [SUA_SENHA]
- Port: 5432
```

### 3. Estrutura do Payload Esperado

O webhook receberá dados neste formato:

```json
{
  "message": "Mensagem do usuário",
  "user": {
    "id": "user-id",
    "name": "Nome do Usuário",
    "email": "email@exemplo.com"
  },
  "userInfo": {
    "nome": "Nome do Usuário",
    "id": "user-id",
    "output": "Mensagem do usuário"
  },
  "context": {
    "dailyProtocol": null,
    "userProgress": null,
    "onboardingResults": null
  },
  "conversationId": "conv_timestamp_user-id",
  "timestamp": "2025-01-12T19:48:18.710Z",
  "platform": "essential-factor-5p",
  "requestFragmentedResponse": true,
  "test": false
}
```

### 4. Formato de Resposta Esperado

O webhook deve retornar:

```json
{
  "response": "Resposta do terapeuta AI",
  "suggestions": [
    "Sugestão 1",
    "Sugestão 2",
    "Sugestão 3"
  ],
  "exercises": [
    "Exercício 1",
    "Exercício 2"
  ]
}
```

### 5. Teste de Conectividade

Após configurar o workflow no N8N, execute:

```bash
node test-webhook.js
```

Ou teste manualmente:

```powershell
Invoke-WebRequest -Uri "https://fator5ps.app.n8n.cloud/webhook-test/terapeuta-ai-webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"test": true, "message": "Olá, teste de conexão", "user": {"id": "test", "name": "Teste", "email": "test@test.com"}}'
```

### 6. Troubleshooting

#### Erro: "No authentication data defined on node!"
- Verifique se as credenciais do Gemini estão configuradas corretamente
- Certifique-se de que o node do Gemini está usando as credenciais corretas

#### Erro: 404 "This webhook is not registered for GET requests"
- Normal para requisições GET
- Use apenas POST requests

#### Erro: 500 Internal Server Error
- Verifique os logs do N8N
- Confirme se todas as credenciais estão configuradas
- Teste cada node individualmente

### 7. Próximos Passos

1. **Configure o workflow no N8N** seguindo a estrutura fornecida anteriormente
2. **Adicione as credenciais** do Gemini e PostgreSQL (se necessário)
3. **Ative o workflow**
4. **Execute o teste** usando `node test-webhook.js`
5. **Teste na plataforma** acessando o chat do terapeuta AI

### 8. Monitoramento

Após a configuração, monitore:
- Logs do N8N para erros
- Tempo de resposta do webhook
- Taxa de sucesso das requisições
- Qualidade das respostas do Gemini

---

## Contato para Suporte

Se encontrar problemas:
1. Verifique os logs do N8N
2. Confirme se o workflow está ativo
3. Teste as credenciais individualmente
4. Execute o script de teste fornecido