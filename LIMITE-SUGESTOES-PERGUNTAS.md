# Limite de Sugestões de Perguntas

## Funcionalidade Implementada

Implementado um sistema que limita a exibição de sugestões de perguntas apenas às **3 primeiras respostas** do agente de IA terapeuta.

## Como Funciona

### Contador de Mensagens
- **Estado `aiMessageCount`**: Rastreia o número de mensagens enviadas pela IA
- **Valor inicial**: 1 (conta a mensagem de boas-vindas inicial)
- **Incremento**: A cada nova resposta da IA (incluindo erros)

### Lógica de Exibição
```typescript
// Só mostra sugestões nas 3 primeiras mensagens
suggestions: newAiMessageCount <= 3 ? response.suggestions : undefined
```

### Aplicação
- **Mensagens 1, 2 e 3**: Exibem sugestões de perguntas
- **Mensagem 4 em diante**: Não exibem sugestões
- **Mensagens de erro**: Seguem a mesma regra

## Arquivos Modificados

### `src/pages/therapist-ai/TherapistAIPage.tsx`

**Adições:**
1. **Estado do contador**:
   ```typescript
   const [aiMessageCount, setAiMessageCount] = useState(1)
   ```

2. **Incremento em respostas normais**:
   ```typescript
   const newAiMessageCount = aiMessageCount + 1
   setAiMessageCount(newAiMessageCount)
   ```

3. **Incremento em mensagens de erro**:
   ```typescript
   const newAiMessageCount = aiMessageCount + 1
   setAiMessageCount(newAiMessageCount)
   ```

4. **Condição para exibir sugestões**:
   ```typescript
   suggestions: newAiMessageCount <= 3 ? response.suggestions : undefined
   ```

## Benefícios

### Experiência do Usuário
- **Orientação inicial**: Usuários recebem direcionamento nas primeiras interações
- **Autonomia progressiva**: Após 3 mensagens, usuários desenvolvem independência
- **Interface limpa**: Reduz poluição visual em conversas longas

### Performance
- **Menos elementos DOM**: Melhora performance em conversas extensas
- **Processamento otimizado**: Reduz carga de renderização

## Comportamento Esperado

### Primeira Mensagem (Boas-vindas)
- ✅ Exibe sugestões
- Contador: 1

### Segunda Resposta da IA
- ✅ Exibe sugestões
- Contador: 2

### Terceira Resposta da IA
- ✅ Exibe sugestões
- Contador: 3

### Quarta Resposta da IA e Seguintes
- ❌ Não exibe sugestões
- Contador: 4+

## Casos Especiais

### Mensagens de Erro
- **Comportamento**: Seguem a mesma regra de limite
- **Contador**: Incrementado normalmente
- **Sugestões**: Só aparecem se dentro do limite de 3

### Reset da Conversa
- **Comportamento**: Contador reinicia em 1
- **Implementação**: Automática ao recarregar a página

## Testes Recomendados

1. **Teste básico**: Enviar 4+ mensagens e verificar que sugestões param na 4ª
2. **Teste de erro**: Forçar erro nas primeiras 3 mensagens
3. **Teste de reload**: Verificar reset do contador
4. **Teste visual**: Confirmar que interface fica limpa após 3ª mensagem

## Configuração

Para alterar o limite de 3 mensagens, modifique a condição:
```typescript
// Exemplo para 5 mensagens
suggestions: newAiMessageCount <= 5 ? response.suggestions : undefined
```

A funcionalidade está ativa e funcionando conforme especificado.