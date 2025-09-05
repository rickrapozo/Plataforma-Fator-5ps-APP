# Correção para Exibir Apenas o Campo 'output' do Webhook

## Problema Identificado
O webhook do n8n estava disparando corretamente, mas a resposta não estava sendo exibida corretamente na interface do chat. O problema era que o código estava tentando extrair a resposta dos campos `response` ou `message`, mas o n8n estava retornando a resposta da IA no campo `output`.

## Solução Implementada

### Modificação no TherapistService
O arquivo `src/services/therapistService.ts` foi modificado para priorizar o campo `output` da resposta do webhook:

```typescript
// Antes
response: response.data.response || response.data.message || 'Resposta não encontrada'

// Depois
const aiOutput = response.data.output || response.data.response || response.data.message
response: aiOutput || 'Resposta não encontrada no campo output'
```

### Ordem de Prioridade dos Campos
Agora o sistema verifica os campos na seguinte ordem:
1. `output` - Campo principal onde o n8n retorna a resposta da IA
2. `response` - Campo alternativo de fallback
3. `message` - Campo secundário de fallback

## Configuração do n8n
Para garantir que o webhook retorne a resposta no campo `output`, certifique-se de que o nó "Respond to Webhook" no n8n esteja configurado com:

```json
{
  "output": "{{ $json.choices[0].message.content }}",
  "suggestions": [
    "Continue praticando o protocolo 5P",
    "Mantenha o foco na gratidão"
  ],
  "exercises": [
    "Exercício de respiração 4-7-8",
    "Meditação de 5 minutos"
  ]
}
```

## Teste da Funcionalidade
1. Acesse a página do Terapeuta AI
2. Envie uma mensagem no chat
3. Verifique se a resposta da IA aparece corretamente
4. Monitore o console do navegador para ver os logs da resposta

## Logs de Debug
O sistema agora registra a resposta completa do webhook no console:
```
✅ Resposta síncrona do terapeuta AI: { output: "...", suggestions: [...] }
```

Isso permite verificar se o campo `output` está sendo retornado corretamente pelo n8n.

## Status
✅ **Implementado** - O sistema agora extrai corretamente a resposta do campo `output` do webhook do n8n.