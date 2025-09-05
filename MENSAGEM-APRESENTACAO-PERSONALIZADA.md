# Mensagem de Apresentação Personalizada

## Funcionalidade Implementada

Implementado um sistema de mensagem de apresentação personalizada que adapta a primeira mensagem do chat baseada no perfil do usuário, focando no bem-estar mental e físico.

## Personalização Implementada

### Para Usuários Administradores
- **Saudação personalizada** com nome do usuário
- **Reconhecimento do papel administrativo**
- **Foco duplo**: bem-estar pessoal + gestão da plataforma
- **Sugestões mistas**: métricas da plataforma + bem-estar pessoal

### Para Usuários Regulares
- **Saudação calorosa** com nome do usuário
- **Reconhecimento do progresso** (streak de dias)
- **Celebração de conquistas** (nível alcançado)
- **Lembrança dos objetivos** (baseado no onboarding)
- **Foco no bem-estar** mental e físico

## Elementos de Personalização

### Dados do Perfil Utilizados
1. **Nome do usuário** (`user?.name`)
2. **Nível atual** (`level`)
3. **Sequência de dias** (`streak`)
4. **Objetivos primários** (`onboardingResults?.primaryGoals`)
5. **Status administrativo** (`isAdmin()`)

### Estrutura da Mensagem

**Saudação Inicial:**
```
"Olá [Nome]! 🌟 Sou seu Terapeuta Essencial AI, seu companheiro dedicado ao seu bem-estar mental e físico."
```

**Reconhecimento de Progresso:**
- Streak > 0: "Vejo que você está em uma sequência incrível de X dias!"
- Nível > 1: "Você já alcançou o nível X em sua jornada de transformação"

**Personalização por Objetivos:**
- "Lembro que seu foco principal é [objetivo do onboarding]"

**Convite à Conversa:**
```
"Estou aqui para te apoiar em cada passo, seja para fortalecer sua mente, cuidar do seu corpo, ou encontrar equilíbrio emocional. Vamos conversar sobre o que está em seu coração hoje?"
```

## Sugestões Personalizadas

### Sugestões Base (Todos os Usuários)
- "Como está meu bem-estar hoje?"
- "Preciso de técnicas de relaxamento"
- "Como melhorar minha energia física?"

### Sugestões Específicas por Objetivo

**Reduzir Ansiedade:**
- "Exercícios para acalmar a ansiedade"

**Melhorar Autoestima:**
- "Como fortalecer minha autoconfiança?"

**Gerenciar Estresse:**
- "Estratégias para lidar com o estresse"

**Objetivo Geral:**
- "Como manter minha motivação?"

### Sugestões para Administradores
- "Análise de métricas da plataforma"
- "Como está meu bem-estar pessoal?"
- "Gerenciamento de conteúdo"
- "Preciso de um momento de relaxamento"

## Implementação Técnica

### Função `generateWelcomeMessage()`
```typescript
const generateWelcomeMessage = () => {
  const userName = user?.name || 'amigo(a)'
  const userLevel = level || 1
  const userStreak = streak || 0
  
  // Lógica de personalização...
  
  return {
    content: welcomeContent,
    suggestions: personalizedSuggestions
  }
}
```

### Integração no Estado
```typescript
const welcomeMessage = generateWelcomeMessage()
const [messages, setMessages] = useState<ChatMessage[]>([
  {
    id: '1',
    type: 'ai',
    content: welcomeMessage.content,
    timestamp: new Date(),
    suggestions: welcomeMessage.suggestions
  }
])
```

## Arquivo Modificado

### `src/pages/therapist-ai/TherapistAIPage.tsx`
- **Função adicionada**: `generateWelcomeMessage()`
- **Personalização**: Baseada em dados do usuário
- **Foco**: Bem-estar mental e físico
- **Sugestões**: Adaptadas ao perfil e objetivos

## Benefícios

### Experiência do Usuário
- **Conexão pessoal**: Usuário se sente reconhecido
- **Motivação**: Celebração de conquistas e progresso
- **Relevância**: Sugestões alinhadas com objetivos
- **Acolhimento**: Tom caloroso e empático

### Bem-estar Focado
- **Mental**: Técnicas de relaxamento, ansiedade, autoestima
- **Físico**: Energia, cuidados corporais
- **Emocional**: Equilíbrio, motivação, autocuidado
- **Holístico**: Abordagem integrada do bem-estar

## Exemplos de Mensagens

### Usuário Novo (Nível 1, Sem Streak)
```
"Olá João! 🌟 Sou seu Terapeuta Essencial AI, seu companheiro dedicado ao seu bem-estar mental e físico. Lembro que seu foco principal é reduzir ansiedade. Estou aqui para te apoiar em cada passo, seja para fortalecer sua mente, cuidar do seu corpo, ou encontrar equilíbrio emocional. Vamos conversar sobre o que está em seu coração hoje?"
```

### Usuário Experiente (Nível 5, Streak 15)
```
"Olá Maria! 🌟 Sou seu Terapeuta Essencial AI, seu companheiro dedicado ao seu bem-estar mental e físico. Vejo que você está em uma sequência incrível de 15 dias! Isso mostra sua dedicação ao autocuidado. Você já alcançou o nível 5 em sua jornada de transformação - que conquista! Lembro que seu foco principal é melhorar autoestima. Estou aqui para te apoiar em cada passo, seja para fortalecer sua mente, cuidar do seu corpo, ou encontrar equilíbrio emocional. Vamos conversar sobre o que está em seu coração hoje?"
```

### Administrador
```
"Olá Admin! 👋 Sou seu Terapeuta Essencial AI com acesso administrativo completo. Estou aqui para te apoiar tanto no seu bem-estar pessoal quanto na gestão da plataforma. Posso te ajudar com análises de dados, suporte aos usuários, ou simplesmente conversar sobre seu equilíbrio mental e físico. Como posso te apoiar hoje?"
```

A funcionalidade está ativa e proporciona uma experiência mais acolhedora e personalizada, sempre com foco no bem-estar integral do usuário.