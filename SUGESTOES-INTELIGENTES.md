# Sistema de Sugestões Inteligentes

## Visão Geral
Implementei um sistema de sugestões inteligentes que analisa o tema da pergunta do usuário e gera sugestões contextualizadas e relevantes para aprofundar a discussão sobre o tópico em questão.

## Como Funciona

### Análise Contextual
O sistema analisa a mensagem do usuário em busca de palavras-chave relacionadas a diferentes temas de bem-estar mental e desenvolvimento pessoal.

### Categorias de Temas Suportadas

#### 1. **Ansiedade**
- **Palavras-chave**: ansiedade, ansioso, preocupação, nervoso
- **Sugestões**:
  - "Como posso usar a respiração para controlar a ansiedade?"
  - "Quais técnicas de mindfulness podem me ajudar agora?"
  - "Como identificar os gatilhos da minha ansiedade?"

#### 2. **Estresse**
- **Palavras-chave**: estresse, estressado, pressão, sobrecarga
- **Sugestões**:
  - "Como posso gerenciar melhor meu tempo e prioridades?"
  - "Quais exercícios de relaxamento são mais eficazes?"
  - "Como criar limites saudáveis no trabalho e vida pessoal?"

#### 3. **Sono**
- **Palavras-chave**: sono, dormir, insônia, cansaço
- **Sugestões**:
  - "Que rotina noturna pode melhorar meu sono?"
  - "Como a meditação pode ajudar com a insônia?"
  - "Quais hábitos durante o dia afetam meu sono?"

#### 4. **Relacionamentos**
- **Palavras-chave**: relacionamento, família, amigos, conflito
- **Sugestões**:
  - "Como melhorar a comunicação nos meus relacionamentos?"
  - "Quais são as bases de um relacionamento saudável?"
  - "Como lidar com conflitos de forma construtiva?"

#### 5. **Autoestima**
- **Palavras-chave**: autoestima, confiança, insegurança, valor
- **Sugestões**:
  - "Como desenvolver uma autoimagem mais positiva?"
  - "Quais práticas diárias fortalecem a autoconfiança?"
  - "Como lidar com a autocrítica excessiva?"

#### 6. **Protocolo 5P**
- **Palavras-chave**: protocolo, 5p, prática, rotina
- **Sugestões**:
  - "Como posso personalizar o protocolo 5P para minha rotina?"
  - "Qual a melhor hora do dia para praticar o protocolo?"
  - "Como manter a consistência na prática diária?"

#### 7. **Trabalho/Carreira**
- **Palavras-chave**: trabalho, carreira, profissional, emprego
- **Sugestões**:
  - "Como encontrar propósito no meu trabalho atual?"
  - "Quais estratégias ajudam com o burnout profissional?"
  - "Como equilibrar ambição e bem-estar mental?"

#### 8. **Mudanças**
- **Palavras-chave**: mudança, transição, novo, diferente
- **Sugestões**:
  - "Como me adaptar melhor a mudanças na vida?"
  - "Quais são os primeiros passos para uma transformação pessoal?"
  - "Como lidar com a incerteza durante transições?"

#### 9. **Sugestões Padrão**
Para temas que não se encaixam nas categorias específicas:
- "Como posso aplicar o protocolo 5P na minha situação?"
- "Que exercícios de mindfulness você recomenda?"
- "Como posso desenvolver mais resiliência emocional?"

## Implementação Técnica

### Arquivo Modificado
- `src/services/therapistService.ts` - Adicionado método `generateSmartSuggestions()`

### Método Principal
```typescript
private static generateSmartSuggestions(userMessage: string): string[] {
  const message = userMessage.toLowerCase()
  // Análise de palavras-chave e retorno de sugestões contextualizadas
}
```

### Integração
O sistema está integrado em três pontos:
1. **Resposta normal**: Usa sugestões inteligentes como fallback se o n8n não retornar sugestões
2. **Timeout**: Mantém sugestões relevantes mesmo quando há timeout
3. **Erro 404**: Fornece sugestões contextualizadas mesmo quando o serviço está indisponível

## Interface do Usuário

### Exibição das Sugestões
As sugestões são exibidas em um elemento `div` com:
- **Título**: "Sugestões:" em texto pequeno e translúcido
- **Botões clicáveis**: Cada sugestão é um botão que, quando clicado, envia automaticamente a pergunta
- **Estilo visual**: Fundo translúcido com hover effect
- **Responsividade**: Adapta-se ao layout do chat

### Interação
- Usuário pode clicar em qualquer sugestão para enviá-la como nova mensagem
- Sugestões são desabilitadas durante o carregamento
- Transições suaves para melhor experiência

## Benefícios

1. **Contextualização**: Sugestões sempre relevantes ao tema da conversa
2. **Engajamento**: Encoraja o usuário a aprofundar a discussão
3. **Orientação**: Ajuda usuários que não sabem como continuar a conversa
4. **Consistência**: Funciona mesmo quando há problemas técnicos
5. **Personalização**: Adapta-se ao conteúdo específico de cada mensagem

## Exemplos de Uso

### Exemplo 1: Ansiedade
**Usuário**: "Estou me sentindo muito ansioso com a apresentação de amanhã"
**Sugestões geradas**:
- "Como posso usar a respiração para controlar a ansiedade?"
- "Quais técnicas de mindfulness podem me ajudar agora?"
- "Como identificar os gatilhos da minha ansiedade?"

### Exemplo 2: Trabalho
**Usuário**: "Meu trabalho está me deixando esgotado"
**Sugestões geradas**:
- "Como encontrar propósito no meu trabalho atual?"
- "Quais estratégias ajudam com o burnout profissional?"
- "Como equilibrar ambição e bem-estar mental?"

## Status
✅ **Implementado e Ativo** - O sistema está funcionando e gerando sugestões inteligentes baseadas no contexto das mensagens dos usuários.