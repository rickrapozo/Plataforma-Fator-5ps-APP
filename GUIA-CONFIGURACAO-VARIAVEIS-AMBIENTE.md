# 🔧 Guia Completo de Configuração de Variáveis de Ambiente

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Configuração Local (.env)](#configuração-local-env)
3. [Configuração de Produção](#configuração-de-produção)
4. [Variáveis Obrigatórias](#variáveis-obrigatórias)
5. [Variáveis Opcionais](#variáveis-opcionais)
6. [Configuração por Serviço](#configuração-por-serviço)
7. [Validação e Testes](#validação-e-testes)
8. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

Este guia fornece instruções detalhadas para configurar todas as variáveis de ambiente necessárias para o **Essential Factor 5P**. As configurações foram organizadas por categoria e ambiente (desenvolvimento/produção).

### ⚠️ Importante
- **NUNCA** commite o arquivo `.env` no repositório
- Use `.env.example` como template
- Mantenha chaves de produção seguras
- Valide todas as configurações antes do deploy

## 🛠️ Configuração Local (.env)

### Passo 1: Criar o arquivo .env

```bash
# Na raiz do projeto
cp .env.example .env
```

### Passo 2: Configurar variáveis básicas

```env
# ===========================================
# CONFIGURAÇÕES BÁSICAS DA APLICAÇÃO
# ===========================================
VITE_APP_NAME="Essential Factor 5P"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENV="development"
VITE_APP_URL="http://localhost:5173"
VITE_API_URL="http://localhost:3000/api"

# ===========================================
# SUPABASE - BANCO DE DADOS E AUTENTICAÇÃO
# ===========================================
VITE_SUPABASE_URL="sua_url_do_supabase"
VITE_SUPABASE_ANON_KEY="sua_chave_anonima_do_supabase"
VITE_SUPABASE_SERVICE_ROLE_KEY="sua_chave_service_role" # Apenas para desenvolvimento
```

### Passo 3: Configurar Stripe (Desenvolvimento)

```env
# ===========================================
# STRIPE - PAGAMENTOS (DESENVOLVIMENTO)
# ===========================================
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_sua_chave_publica_de_teste"
VITE_STRIPE_SECRET_KEY="sk_test_sua_chave_secreta_de_teste"
VITE_STRIPE_WEBHOOK_SECRET="whsec_sua_chave_webhook_local"

# Chaves de produção (comentadas para desenvolvimento)
# VITE_STRIPE_PUBLISHABLE_KEY_LIVE="pk_live_sua_chave_publica_producao"
# VITE_STRIPE_SECRET_KEY_LIVE="sk_live_sua_chave_secreta_producao"
# VITE_STRIPE_WEBHOOK_SECRET_LIVE="whsec_sua_chave_webhook_producao"
```

### Passo 4: Configurar APIs Externas

```env
# ===========================================
# APIS EXTERNAS
# ===========================================

# YouTube API (para integração de vídeos)
VITE_YOUTUBE_API_KEY="sua_chave_youtube_api"

# Gemini AI (para terapeuta virtual)
VITE_GEMINI_API_KEY="sua_chave_gemini_ai"
VITE_GEMINI_MODEL="gemini-pro"
VITE_GEMINI_MAX_TOKENS="2048"
VITE_GEMINI_TEMPERATURE="0.7"

# Configurações de E-mail
VITE_EMAIL_SERVICE_URL="https://api.emailjs.com/api/v1.0/email/send"
VITE_EMAIL_SERVICE_ID="seu_service_id_emailjs"
VITE_EMAIL_TEMPLATE_ID="seu_template_id"
VITE_EMAIL_PUBLIC_KEY="sua_chave_publica_emailjs"
```

### Passo 5: Configurar Webhooks e Integrações

```env
# ===========================================
# WEBHOOKS E INTEGRAÇÕES
# ===========================================

# N8N Webhooks
VITE_N8N_WEBHOOK_URL="https://sua-instancia-n8n.com/webhook/essential-factor"
VITE_N8N_LOCAL_WEBHOOK_URL="http://localhost:5678/webhook/essential-factor"
VITE_N8N_FALLBACK_WEBHOOK_URL="https://webhook-backup.sua-empresa.com/n8n"
VITE_N8N_WEBHOOK_SECRET="sua_chave_secreta_n8n"

# Configurações de Áudio
VITE_AUDIO_CDN_URL="https://cdn.sua-empresa.com/audio"
VITE_AUDIO_STREAMING_URL="https://stream.sua-empresa.com"
```

### Passo 6: Configurar Segurança

```env
# ===========================================
# CONFIGURAÇÕES DE SEGURANÇA
# ===========================================

# JWT e Sessões
VITE_JWT_SECRET="sua_chave_jwt_super_secreta_com_pelo_menos_32_caracteres"
VITE_SESSION_TIMEOUT="3600000" # 1 hora em millisegundos
VITE_REFRESH_TOKEN_EXPIRY="604800000" # 7 dias em millisegundos

# Rate Limiting
VITE_RATE_LIMIT_WINDOW="900000" # 15 minutos
VITE_RATE_LIMIT_MAX_REQUESTS="100"
VITE_RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS="true"

# CORS
VITE_CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
VITE_CORS_CREDENTIALS="true"

# Criptografia
VITE_ENCRYPTION_KEY="sua_chave_de_criptografia_32_caracteres"
VITE_HASH_SALT_ROUNDS="12"
```

## 🚀 Configuração de Produção

### Variáveis de Produção (.env.production)

```env
# ===========================================
# PRODUÇÃO - CONFIGURAÇÕES BÁSICAS
# ===========================================
VITE_APP_ENV="production"
VITE_APP_URL="https://essentialfactor5p.com"
VITE_API_URL="https://api.essentialfactor5p.com"

# ===========================================
# SUPABASE - PRODUÇÃO
# ===========================================
VITE_SUPABASE_URL="https://sua-instancia-producao.supabase.co"
VITE_SUPABASE_ANON_KEY="sua_chave_anonima_producao"
# NÃO incluir service_role_key em produção no frontend

# ===========================================
# STRIPE - PRODUÇÃO
# ===========================================
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_sua_chave_publica_producao"
# Chaves secretas devem estar apenas no backend/servidor
VITE_STRIPE_WEBHOOK_SECRET="whsec_sua_chave_webhook_producao"

# ===========================================
# SEGURANÇA - PRODUÇÃO
# ===========================================
VITE_JWT_SECRET="chave_jwt_producao_extremamente_segura_64_caracteres_minimo"
VITE_SESSION_TIMEOUT="1800000" # 30 minutos em produção
VITE_RATE_LIMIT_MAX_REQUESTS="50" # Mais restritivo em produção
VITE_CORS_ORIGIN="https://essentialfactor5p.com"
```

## ✅ Variáveis Obrigatórias

### Para Funcionamento Básico:
```env
# Essenciais
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_JWT_SECRET
VITE_APP_URL

# Para Pagamentos
VITE_STRIPE_PUBLISHABLE_KEY
VITE_STRIPE_WEBHOOK_SECRET

# Para IA
VITE_GEMINI_API_KEY
```

### Para Funcionalidades Completas:
```env
# Comunicação
VITE_EMAIL_SERVICE_ID
VITE_EMAIL_TEMPLATE_ID
VITE_EMAIL_PUBLIC_KEY

# Integrações
VITE_N8N_WEBHOOK_URL
VITE_YOUTUBE_API_KEY

# Segurança Avançada
VITE_ENCRYPTION_KEY
VITE_RATE_LIMIT_WINDOW
```

## 🔧 Configuração por Serviço

### 1. Supabase

**Onde obter:**
1. Acesse [supabase.com](https://supabase.com)
2. Crie/acesse seu projeto
3. Vá em Settings > API
4. Copie URL e anon key

**Configuração:**
```env
VITE_SUPABASE_URL="https://xyzabc123.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Stripe

**Onde obter:**
1. Acesse [stripe.com](https://stripe.com)
2. Faça login no Dashboard
3. Vá em Developers > API keys
4. Para webhooks: Developers > Webhooks

**URLs de Webhook:**
- Desenvolvimento: `http://localhost:5173/api/stripe/webhook`
- Produção: `https://seudominio.com/api/stripe/webhook`

**Configuração:**
```env
# Teste
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
VITE_STRIPE_SECRET_KEY="sk_test_..." # Apenas backend
VITE_STRIPE_WEBHOOK_SECRET="whsec_..."

# Produção
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."
VITE_STRIPE_SECRET_KEY="sk_live_..." # Apenas backend
VITE_STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Google Gemini AI

**Onde obter:**
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma API key
3. Configure cotas e limites

**Configuração:**
```env
VITE_GEMINI_API_KEY="AIzaSy..."
VITE_GEMINI_MODEL="gemini-pro"
VITE_GEMINI_MAX_TOKENS="2048"
VITE_GEMINI_TEMPERATURE="0.7"
```

### 4. EmailJS

**Onde obter:**
1. Acesse [emailjs.com](https://www.emailjs.com/)
2. Crie conta e serviço
3. Configure template de email
4. Obtenha Service ID, Template ID e Public Key

**Configuração:**
```env
VITE_EMAIL_SERVICE_ID="service_abc123"
VITE_EMAIL_TEMPLATE_ID="template_xyz789"
VITE_EMAIL_PUBLIC_KEY="user_def456"
```

### 5. YouTube API

**Onde obter:**
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie/selecione projeto
3. Ative YouTube Data API v3
4. Crie credenciais (API Key)

**Configuração:**
```env
VITE_YOUTUBE_API_KEY="AIzaSy..."
```

### 6. N8N Webhooks

**Configuração:**
```env
# URL principal do webhook
VITE_N8N_WEBHOOK_URL="https://sua-instancia.n8n.cloud/webhook/essential-factor"

# URL local para desenvolvimento
VITE_N8N_LOCAL_WEBHOOK_URL="http://localhost:5678/webhook/essential-factor"

# URL de fallback
VITE_N8N_FALLBACK_WEBHOOK_URL="https://backup-webhook.com/n8n"

# Chave secreta para validação
VITE_N8N_WEBHOOK_SECRET="sua_chave_secreta_n8n"
```

## 🧪 Validação e Testes

### Script de Validação

Crie um arquivo `validate-env.js`:

```javascript
// validate-env.js
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_JWT_SECRET',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'VITE_GEMINI_API_KEY'
]

const optionalVars = [
  'VITE_EMAIL_SERVICE_ID',
  'VITE_YOUTUBE_API_KEY',
  'VITE_N8N_WEBHOOK_URL'
]

console.log('🔍 Validando variáveis de ambiente...')

let hasErrors = false

// Verificar variáveis obrigatórias
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ ERRO: ${varName} é obrigatória mas não está definida`)
    hasErrors = true
  } else {
    console.log(`✅ ${varName}: Definida`)
  }
})

// Verificar variáveis opcionais
optionalVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`⚠️  AVISO: ${varName} não está definida (opcional)`)
  } else {
    console.log(`✅ ${varName}: Definida`)
  }
})

// Validações específicas
if (process.env.VITE_JWT_SECRET && process.env.VITE_JWT_SECRET.length < 32) {
  console.error('❌ ERRO: VITE_JWT_SECRET deve ter pelo menos 32 caracteres')
  hasErrors = true
}

if (process.env.VITE_SUPABASE_URL && !process.env.VITE_SUPABASE_URL.includes('supabase.co')) {
  console.warn('⚠️  AVISO: VITE_SUPABASE_URL pode não ser uma URL válida do Supabase')
}

if (hasErrors) {
  console.error('\n❌ Configuração inválida! Corrija os erros antes de continuar.')
  process.exit(1)
} else {
  console.log('\n✅ Todas as variáveis obrigatórias estão configuradas!')
}
```

### Executar Validação

```bash
# Instalar dotenv se necessário
npm install --save-dev dotenv

# Executar validação
node -r dotenv/config validate-env.js
```

### Teste de Conectividade

Crie um arquivo `test-connections.js`:

```javascript
// test-connections.js
import { createClient } from '@supabase/supabase-js'

const testSupabase = async () => {
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    )
    
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) throw error
    console.log('✅ Supabase: Conectado com sucesso')
  } catch (error) {
    console.error('❌ Supabase: Erro de conexão:', error.message)
  }
}

const testGemini = async () => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.VITE_GEMINI_API_KEY}`)
    
    if (response.ok) {
      console.log('✅ Gemini AI: API Key válida')
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    console.error('❌ Gemini AI: Erro na API:', error.message)
  }
}

// Executar testes
testSupabase()
testGemini()
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. "Environment variable not defined"

**Causa:** Variável não está no arquivo `.env` ou tem nome incorreto

**Solução:**
```bash
# Verificar se o arquivo .env existe
ls -la .env

# Verificar conteúdo
cat .env | grep NOME_DA_VARIAVEL

# Reiniciar servidor de desenvolvimento
npm run dev
```

#### 2. "Supabase connection failed"

**Verificações:**
- URL está correta e acessível
- Anon key está válida
- Projeto Supabase está ativo
- Não há caracteres especiais mal escapados

#### 3. "Stripe webhook signature invalid"

**Verificações:**
- Webhook secret está correto
- URL do webhook está configurada no Stripe
- Endpoint está respondendo corretamente

#### 4. "Gemini API quota exceeded"

**Soluções:**
- Verificar cotas no Google AI Studio
- Implementar rate limiting
- Usar cache para respostas

### Comandos Úteis

```bash
# Verificar variáveis carregadas
echo $VITE_SUPABASE_URL

# Recarregar variáveis
source .env

# Verificar sintaxe do .env
cat .env | grep -v '^#' | grep -v '^$'

# Backup do .env
cp .env .env.backup

# Restaurar backup
cp .env.backup .env
```

### Logs de Debug

Adicione ao seu código para debug:

```javascript
// Debug de variáveis (remover em produção)
if (import.meta.env.DEV) {
  console.log('🔧 Variáveis de ambiente carregadas:')
  console.log('- Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Definida' : '❌ Não definida')
  console.log('- Stripe Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? '✅ Definida' : '❌ Não definida')
  console.log('- Gemini Key:', import.meta.env.VITE_GEMINI_API_KEY ? '✅ Definida' : '❌ Não definida')
}
```

## 📚 Recursos Adicionais

### Templates

- [.env.example](/.env.example) - Template base
- [.env.development](/.env.development) - Configuração de desenvolvimento
- [.env.production](/.env.production) - Configuração de produção

### Documentação

- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Gemini AI Docs](https://ai.google.dev/docs)
- [Vite Env Docs](https://vitejs.dev/guide/env-and-mode.html)

### Segurança

- [OWASP Environment Variables](https://owasp.org/www-community/vulnerabilities/Improper_Data_Validation)
- [12 Factor App Config](https://12factor.net/config)
- [Secrets Management Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

## 📞 Suporte

Se você encontrar problemas:

1. Verifique este guia primeiro
2. Execute os scripts de validação
3. Consulte os logs de erro
4. Entre em contato com a equipe de desenvolvimento

**Lembre-se:** Nunca compartilhe suas chaves de produção ou inclua o arquivo `.env` no controle de versão!