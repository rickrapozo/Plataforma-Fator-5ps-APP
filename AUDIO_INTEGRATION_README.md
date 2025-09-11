# Integração de Áudio - Mind Vault

## 🎵 Visão Geral

Esta integração conecta automaticamente áudios do YouTube e Spotify com temas da categoria "Cofre da Mente", fornecendo background musical personalizado para cada tema de desenvolvimento pessoal.

## ✨ Funcionalidades Implementadas

### 🎯 Sistema de Correspondência Automática
- **8 temas principais** mapeados com palavras-chave otimizadas
- **Busca inteligente** por termos específicos para cada tema
- **Sistema de pontuação** para relevância de áudios (0-100%)
- **Recomendações personalizadas** baseadas no histórico do usuário

### 🎮 Player de Áudio Avançado
- **Suporte dual**: YouTube e Spotify
- **Controles completos**: play/pause, volume, progresso
- **Playlist automática** por tema
- **Interface responsiva** com animações suaves
- **Background automático** durante navegação

### 🔍 Busca e Filtragem
- **Busca em tempo real** por título, descrição e tags
- **Filtros por categoria** com contadores dinâmicos
- **Carregamento automático** de áudios por tema
- **Estatísticas em tempo real** de áudios disponíveis

## 🛠️ Configuração das APIs

### 1. YouTube Data API v3

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **YouTube Data API v3**
4. Crie credenciais (API Key)
5. Configure no arquivo `.env`:

```env
VITE_YOUTUBE_API_KEY=sua_chave_aqui
VITE_YOUTUBE_MAX_RESULTS=10
```

### 2. Spotify Web API

1. Acesse o [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Crie uma nova aplicação
3. Obtenha Client ID e Client Secret
4. Configure no arquivo `.env`:

```env
VITE_SPOTIFY_CLIENT_ID=seu_client_id_aqui
VITE_SPOTIFY_CLIENT_SECRET=seu_client_secret_aqui
VITE_SPOTIFY_MAX_RESULTS=10
```

### 3. Configurações Opcionais

```env
# Configurações de áudio
VITE_AUDIO_DEFAULT_VOLUME=0.7
VITE_AUDIO_CROSSFADE_DURATION=3000
VITE_AUDIO_CACHE_DURATION=3600000
```

## 📁 Estrutura de Arquivos

```
src/
├── services/
│   ├── audioIntegrationService.ts    # Integração com APIs
│   └── themeMatchingService.ts        # Sistema de correspondência
├── components/
│   └── audio/
│       └── AudioPlayer.tsx            # Player de áudio
└── pages/
    └── mind-vault/
        └── MindVaultPage.tsx          # Página principal
```

## 🎨 Temas Disponíveis

| Tema | Palavras-chave | Tipos de Áudio |
|------|----------------|----------------|
| **Prosperidade** | abundância, riqueza, manifestação | meditation, affirmations, binaural |
| **Foco** | concentração, produtividade, deep work | binaural, music, nature |
| **Confiança** | autoconfiança, coragem, empowerment | meditation, affirmations, music |
| **Sono** | relaxamento, sleep meditation | meditation, nature, binaural |
| **Relacionamentos** | amor, comunicação, heart chakra | meditation, music, affirmations |
| **Ansiedade** | calma, stress relief, tranquilidade | meditation, nature, binaural |
| **Autoestima** | self love, autoaceitação | meditation, affirmations, music |
| **Mindfulness** | atenção plena, present moment | meditation, nature, music |

## 🚀 Como Usar

### 1. Navegação Básica
- Acesse `/mind-vault` no aplicativo
- Selecione uma categoria de tema
- Os áudios serão carregados automaticamente

### 2. Busca Personalizada
- Use a barra de busca para encontrar áudios específicos
- Combine filtros de categoria com busca textual
- Resultados são atualizados em tempo real

### 3. Reprodução de Áudio
- Clique no botão play de qualquer áudio
- O player será aberto com controles completos
- Áudios continuam em background durante navegação

### 4. Playlist Automática
- Áudios do mesmo tema são organizados em playlist
- Reprodução automática do próximo áudio
- Shuffle e repeat disponíveis

## 🔧 Desenvolvimento

### Executar em Desenvolvimento

```bash
npm run dev
```

### Estrutura de Dados

```typescript
interface AudioTrack {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  source: 'youtube' | 'spotify'
  url: string
  tags: string[]
  category: string
  rating?: number
}
```

### Adicionar Novos Temas

1. Edite `themeMatchingService.ts`
2. Adicione novo tema no `themeMap`
3. Configure palavras-chave e termos de busca
4. Defina temas relacionados e prioridade

## 📊 Métricas e Analytics

### Sistema de Pontuação
- **Palavras-chave diretas**: +10 pontos
- **Termos de busca**: +15 pontos (proporcional)
- **Temas relacionados**: +3 pontos
- **Threshold mínimo**: 20 pontos para recomendação

### Recomendações Inteligentes
- Análise do histórico de reprodução
- Sugestões baseadas em preferências
- Temas relacionados automáticos

## 🛡️ Segurança

- **Chaves de API** armazenadas em variáveis de ambiente
- **Rate limiting** implementado para APIs
- **Validação de dados** em todas as requisições
- **Fallback** para conteúdo offline

## 🐛 Troubleshooting

### Problemas Comuns

1. **Áudios não carregam**
   - Verifique as chaves de API no `.env`
   - Confirme que as APIs estão ativas
   - Verifique a conexão com internet

2. **Player não funciona**
   - Verifique permissões de autoplay no navegador
   - Confirme que o áudio não está bloqueado
   - Teste em modo incógnito

3. **Busca sem resultados**
   - Verifique se há quota disponível nas APIs
   - Teste com termos mais genéricos
   - Verifique logs do console

### Logs de Debug

```javascript
// Ativar logs detalhados
localStorage.setItem('audio-debug', 'true')
```

## 📈 Próximos Passos

- [ ] Cache inteligente de áudios
- [ ] Sincronização offline
- [ ] Playlists personalizadas
- [ ] Integração com mais plataformas
- [ ] Analytics de uso
- [ ] Recomendações por IA

## 🤝 Contribuição

Para contribuir com melhorias:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste thoroughly
5. Submeta um Pull Request

---

**Status**: ✅ Pronto para produção
**Versão**: 1.0.0
**Última atualização**: Janeiro 2025