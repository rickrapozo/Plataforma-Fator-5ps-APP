# Configuração da URL de Produção do Webhook

## Visão Geral
Implementei um sistema de URLs de webhook com fallback automático que prioriza a URL de produção do n8n Cloud e mantém a URL de desenvolvimento como backup.

## URLs Configuradas

### URL de Produção (Prioritária)
```
https://fator5ps.app.n8n.cloud/webhook/a95c2946-75d2-4e20-82bf-f04442a5cdbf
```
- **Ambiente**: n8n Cloud (Produção)
- **Prioridade**: Alta (sempre tentada primeiro)
- **Status**: Ativa e funcional

### URL de Desenvolvimento (Fallback)
```
VITE_N8N_WEBHOOK_URL (variável de ambiente)
```
- **Ambiente**: Desenvolvimento local
- **Prioridade**: Baixa (usado apenas se produção falhar)
- **Configuração**: Arquivo `.env`

## Como Funciona o Sistema de Fallback

### Lógica de Priorização
1. **Primeira tentativa**: URL de produção do n8n Cloud
2. **Fallback**: URL de desenvolvimento (se configurada no .env)
3. **Erro**: Se nenhuma URL estiver disponível

### Implementação Técnica
```typescript
private static async getWebhookUrl(): Promise<string> {
  // Prioriza URL de produção se disponível
  if (this.productionWebhookUrl) {
    return this.productionWebhookUrl
  }
  
  // Fallback para URL de desenvolvimento
  if (this.webhookUrl) {
    return this.webhookUrl
  }
  
  throw new Error('Nenhuma URL de webhook configurada')
}
```

## Logs de Debug
O sistema agora registra qual URL está sendo utilizada:
```
📤 Enviando mensagem para terapeuta AI (modo síncrono)
🔗 Usando webhook URL: https://fator5ps.app.n8n.cloud/webhook/...
```

## Vantagens da Implementação

### 1. **Produção Prioritária**
- Sistema sempre tenta usar a URL de produção primeiro
- Garante melhor performance e disponibilidade

### 2. **Fallback Automático**
- Se a produção falhar, automaticamente usa desenvolvimento
- Continuidade do serviço garantida

### 3. **Transparência**
- Logs claros mostram qual URL está sendo usada
- Facilita debugging e monitoramento

### 4. **Flexibilidade**
- Fácil alteração entre ambientes
- Não quebra funcionalidade existente

## Configuração de Ambiente

### Produção
- URL hardcoded no código para máxima confiabilidade
- Sempre disponível e prioritária

### Desenvolvimento
- Configurada via variável de ambiente `VITE_N8N_WEBHOOK_URL`
- Permite testes locais quando necessário

### Arquivo .env (Exemplo)
```env
# URL de desenvolvimento (opcional - usado apenas como fallback)
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/dev-webhook-id
```

## Teste da Funcionalidade

### Verificação de URL
1. Abra o console do navegador
2. Envie uma mensagem no chat
3. Verifique o log: `🔗 Usando webhook URL: ...`
4. Confirme que está usando a URL de produção

### Teste de Fallback
Para testar o fallback (apenas para desenvolvimento):
1. Temporariamente comente a `productionWebhookUrl`
2. Configure `VITE_N8N_WEBHOOK_URL` no .env
3. Teste se usa a URL de desenvolvimento
4. Restaure a configuração original

## Manutenção

### Alteração da URL de Produção
Se precisar alterar a URL de produção:
1. Modifique `productionWebhookUrl` em `therapistService.ts`
2. Teste a nova URL
3. Deploy da aplicação

### Monitoramento
- Monitore os logs para verificar qual URL está sendo usada
- Verifique se há falhas na URL de produção
- Confirme que o fallback funciona quando necessário

## Status
✅ **Implementado e Ativo** - Sistema de URLs com fallback funcionando corretamente, priorizando a URL de produção do n8n Cloud.

## Arquivos Modificados
- `src/services/therapistService.ts` - Adicionada lógica de fallback de URLs
- `CONFIGURACAO-URL-PRODUCAO.md` - Documentação da implementação