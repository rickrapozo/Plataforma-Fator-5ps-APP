# Sistema de Agente AI para Suporte de Crise

## Visão Geral

Este sistema implementa um agente AI avançado para suporte de crise com funcionalidades de processamento de voz em tempo real, análise de sentimentos, detecção automática de emergências e protocolos de segurança robustos.

## Funcionalidades Principais

### 🎤 Processamento de Áudio em Tempo Real
- **Captura de áudio**: Utiliza Web Audio API para captura de alta qualidade
- **Análise de características vocais**: Pitch, volume, taxa de fala e estabilidade vocal
- **Visualização em tempo real**: Gráfico de ondas de áudio ao vivo
- **Detecção de silêncio**: Monitoramento automático de períodos de silêncio

### 🤖 Integração com Google Gemini Live API
- **Comunicação bidirecional**: Conversas naturais em tempo real
- **Respostas contextuais**: IA treinada para situações de crise
- **Síntese de voz**: Respostas faladas para maior acessibilidade
- **Processamento de linguagem natural**: Compreensão avançada de contexto emocional

### 📝 Transcrição e Análise de Sentimentos
- **Transcrição em tempo real**: Conversão automática de fala para texto
- **Análise emocional**: Detecção de stress, ansiedade, depressão, raiva e medo
- **Avaliação de risco**: Classificação automática de níveis de urgência
- **Recomendações inteligentes**: Sugestões baseadas no estado emocional detectado

### 🚨 Detecção Automática de Emergências
- **Palavras-chave de emergência**: Detecção de termos críticos
- **Análise de padrões vocais**: Identificação de sinais de angústia
- **Alertas em tempo real**: Notificações imediatas para situações críticas
- **Escalação automática**: Protocolos de resposta baseados no nível de risco

### 🔒 Protocolos de Segurança e Privacidade
- **Criptografia de dados**: Proteção AES-256 para informações sensíveis
- **Sessões seguras**: Gerenciamento de sessões com tokens únicos
- **Anonimização**: Remoção automática de dados identificáveis
- **Auditoria**: Log completo de atividades para compliance
- **Controle de acesso**: Autenticação e autorização robustas

## Como Usar

### 1. Iniciando uma Sessão
1. Acesse o Centro de Controle do Agente AI
2. Clique no botão "Iniciar Sessão"
3. Permita o acesso ao microfone quando solicitado
4. O sistema iniciará automaticamente:
   - Processamento de áudio
   - Transcrição em tempo real
   - Análise de sentimentos
   - Detecção de emergências

### 2. Durante a Conversa
- **Fale naturalmente**: O agente está treinado para conversas empáticas
- **Monitore os indicadores**: Observe os níveis de urgência e estado emocional
- **Atenção aos alertas**: Alertas de emergência aparecem automaticamente
- **Use os controles**: Pause/retome o áudio conforme necessário

### 3. Monitoramento em Tempo Real
- **Painel de Urgência**: Mostra o nível atual de risco (baixo/médio/alto/crítico)
- **Estado Emocional**: Gráficos em tempo real das emoções detectadas
- **Transcrição**: Texto da conversa sendo processado
- **Estatísticas**: Métricas da sessão e qualidade do áudio

### 4. Encerrando a Sessão
1. Clique em "Encerrar Sessão"
2. O sistema automaticamente:
   - Para todos os serviços
   - Limpa dados sensíveis
   - Gera relatório da sessão (se configurado)

## Configurações Avançadas

### Sensibilidade de Detecção
- **Urgência**: Ajuste o limiar para detecção de situações críticas
- **Emoções**: Configure a sensibilidade da análise emocional
- **Palavras-chave**: Personalize termos de emergência

### Protocolos de Resposta
- **Escalação automática**: Configure quando acionar protocolos de emergência
- **Notificações**: Defina destinatários para alertas críticos
- **Integração**: Conecte com sistemas externos de emergência

## Arquitetura Técnica

### Serviços Implementados

1. **geminiLiveAPIService**: Integração com Google Gemini Live API
2. **realTimeAudioProcessingService**: Processamento de áudio com Web Audio API
3. **transcriptionSentimentService**: Transcrição e análise de sentimentos
4. **voiceEmergencyDetectionService**: Detecção automática de emergências
5. **securityProtocolService**: Protocolos de segurança e privacidade
6. **voiceCrisisDetectionService**: Análise especializada para situações de crise
7. **sentimentAnalysisService**: Análise avançada de sentimentos

### Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Tailwind CSS
- **Áudio**: Web Audio API + MediaRecorder API
- **IA**: Google Gemini Live API
- **Segurança**: Crypto-js para criptografia
- **Visualização**: Canvas API para gráficos em tempo real

## Requisitos do Sistema

### Navegador
- Chrome 88+ (recomendado)
- Firefox 85+
- Safari 14+
- Edge 88+

### Permissões Necessárias
- **Microfone**: Obrigatório para captura de áudio
- **Notificações**: Opcional para alertas de emergência

### Conectividade
- **Internet**: Conexão estável para API do Gemini
- **Largura de banda**: Mínimo 1 Mbps para qualidade adequada

## Considerações de Segurança

### Dados Sensíveis
- Todos os dados de áudio são processados localmente quando possível
- Informações pessoais são criptografadas antes do armazenamento
- Sessões expiram automaticamente após inatividade

### Compliance
- Compatível com LGPD/GDPR
- Logs de auditoria para todas as ações
- Direito ao esquecimento implementado

### Boas Práticas
- Use sempre HTTPS em produção
- Configure timeouts apropriados
- Monitore logs de segurança regularmente
- Mantenha as dependências atualizadas

## Troubleshooting

### Problemas Comuns

**Microfone não funciona**
- Verifique permissões do navegador
- Teste com outros aplicativos
- Reinicie o navegador

**IA não responde**
- Verifique conexão com internet
- Confirme configuração da API do Gemini
- Verifique logs do console

**Transcrição imprecisa**
- Melhore qualidade do áudio
- Reduza ruído ambiente
- Fale mais claramente

**Alertas falsos**
- Ajuste sensibilidade de detecção
- Revise palavras-chave configuradas
- Calibre análise emocional

## Suporte e Desenvolvimento

Para suporte técnico ou contribuições:
1. Verifique os logs do console do navegador
2. Documente passos para reproduzir problemas
3. Inclua informações do ambiente (navegador, OS, etc.)

## Roadmap Futuro

- [ ] Integração com sistemas de emergência externos
- [ ] Suporte a múltiplos idiomas
- [ ] Análise de vídeo facial
- [ ] Dashboard administrativo
- [ ] API para integrações externas
- [ ] Modo offline para situações críticas