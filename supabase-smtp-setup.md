# Configuração SMTP Customizado no Supabase

## 📧 Status Atual
✅ **Emails funcionando** - O Supabase está enviando emails usando o provedor padrão  
✅ **Recuperação de senha** - Funcional  
✅ **Confirmação de email** - Funcional  

## 🎯 Próximos Passos para Personalização

### 1. Acessar Painel do Supabase
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto: `oywdjirdotwdsixpxiox`

### 2. Configurar SMTP Customizado
1. No painel, vá em **Authentication** → **Settings**
2. Role até a seção **SMTP Settings**
3. Ative **Enable custom SMTP**

### 3. Configurações Recomendadas

#### Opção A: Resend (Recomendado)
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Pass: [SUA_API_KEY_RESEND]
Sender Name: Essential Factor 5P
Sender Email: noreply@essentialfactor5p.com
```

#### Opção B: Gmail (Para testes)
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: seu-email@gmail.com
SMTP Pass: [APP_PASSWORD]
Sender Name: Essential Factor 5P
Sender Email: seu-email@gmail.com
```

#### Opção C: SendGrid
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [SUA_API_KEY_SENDGRID]
Sender Name: Essential Factor 5P
Sender Email: noreply@essentialfactor5p.com
```

### 4. Configurar Templates de Email
No painel do Supabase, vá em **Authentication** → **Email Templates**:

#### Template de Confirmação:
- **Subject**: `Confirme sua conta - Essential Factor 5P`
- **Body**: Use o HTML do arquivo `supabase-email-config.sql`

#### Template de Recuperação:
- **Subject**: `Recuperação de senha - Essential Factor 5P`
- **Body**: Use o HTML do arquivo `supabase-email-config.sql`

### 5. Configurar Domínio Personalizado (Opcional)

#### DNS Records necessários:
```
# SPF Record
TXT @ "v=spf1 include:_spf.resend.com ~all"

# DKIM (fornecido pelo provedor)
CNAME resend._domainkey "resend._domainkey.resend.com"

# DMARC
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@essentialfactor5p.com"
```

### 6. Testar Configuração

Execute o script de teste:
```bash
node test-email-recovery.js
```

### 7. URLs de Redirecionamento

Configure as URLs permitidas no Supabase:
```
Site URL: https://essential-factor-5p.vercel.app
Additional URLs:
- http://localhost:5173
- http://localhost:3000
- https://essential-factor-5p.vercel.app
```

## 🔧 Configuração Rápida com Gmail (Para Desenvolvimento)

### Passo a passo:
1. **Ativar 2FA** na sua conta Google
2. **Gerar App Password**:
   - Vá em Google Account → Security
   - 2-Step Verification → App passwords
   - Gere uma senha para "Mail"
3. **Configurar no Supabase**:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: rickrapozo@gmail.com
   SMTP Pass: [APP_PASSWORD_GERADA]
   Sender Name: Essential Factor 5P
   Sender Email: rickrapozo@gmail.com
   ```

## 📊 Monitoramento

### Logs de Email
Monitore os logs no painel do Supabase:
- **Authentication** → **Logs**
- Filtrar por "email" para ver tentativas de envio

### Métricas Importantes
- Taxa de entrega
- Emails bounced
- Tempo de entrega
- Erros de SMTP

## 🚨 Troubleshooting

### Problemas Comuns:

#### 1. "SMTP Authentication Failed"
- Verifique usuário e senha
- Para Gmail, use App Password, não senha normal

#### 2. "Connection Timeout"
- Verifique host e porta
- Teste conectividade SMTP

#### 3. "Emails não chegam"
- Verifique pasta de spam
- Verifique SPF/DKIM records
- Teste com diferentes provedores de email

#### 4. "Invalid Sender"
- Configure domínio no provedor SMTP
- Verifique se o email remetente está autorizado

## 📝 Checklist Final

- [ ] SMTP configurado no Supabase
- [ ] Templates de email personalizados
- [ ] URLs de redirecionamento configuradas
- [ ] Teste de recuperação de senha
- [ ] Teste de confirmação de email
- [ ] DNS records configurados (se usando domínio próprio)
- [ ] Monitoramento de logs ativo

## 🎉 Resultado Esperado

Após a configuração:
- ✅ Emails com visual personalizado da Essential Factor 5P
- ✅ Melhor entregabilidade
- ✅ Controle total sobre templates
- ✅ Analytics detalhados
- ✅ Domínio personalizado (opcional)