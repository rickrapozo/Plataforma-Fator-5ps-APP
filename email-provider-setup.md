# Configuração de Provedor de Email

## Opções Recomendadas

### 1. Resend (Recomendado)
- **Vantagens**: Simples, moderno, boa entregabilidade
- **Preço**: Gratuito até 3.000 emails/mês
- **Setup**:
```bash
npm install resend
```

```typescript
import { Resend } from 'resend'

const resend = new Resend('re_123456789')

await resend.emails.send({
  from: 'Essential Factor 5P <noreply@essentialfactor5p.com>',
  to: userEmail,
  subject: subject,
  html: html
})
```

### 2. SendGrid
- **Vantagens**: Robusto, analytics detalhados
- **Preço**: Gratuito até 100 emails/dia
- **Setup**:
```bash
npm install @sendgrid/mail
```

### 3. Mailgun
- **Vantagens**: Boa para desenvolvedores
- **Preço**: Gratuito até 5.000 emails/mês (primeiros 3 meses)

### 4. Amazon SES
- **Vantagens**: Muito barato, escalável
- **Preço**: $0.10 por 1.000 emails

## Configuração no Supabase

### 1. Configurar SMTP customizado
No painel do Supabase:
1. Vá em Authentication > Settings
2. Configure SMTP settings:
   - **Host**: smtp.resend.com (ou seu provedor)
   - **Port**: 587
   - **Username**: resend
   - **Password**: sua_api_key

### 2. Configurar domínio personalizado
1. Configure DNS records:
```
CNAME: mail.seudominio.com -> smtp.resend.com
TXT: v=spf1 include:_spf.resend.com ~all
```

### 3. Variáveis de ambiente
Adicione no `.env.local`:
```env
# Email Provider
VITE_EMAIL_PROVIDER=resend
RESEND_API_KEY=re_123456789
SENDGRID_API_KEY=SG.123456789
MAILGUN_API_KEY=key-123456789

# Email Settings
VITE_FROM_EMAIL=noreply@essentialfactor5p.com
VITE_FROM_NAME=Essential Factor 5P
VITE_REPLY_TO=support@essentialfactor5p.com
```

## Templates de Email Personalizados

### Estrutura recomendada:
```
src/
  templates/
    email/
      base.html          # Template base
      welcome.html       # Boas-vindas
      recovery.html      # Recuperação de senha
      confirmation.html  # Confirmação de email
      notification.html  # Notificações gerais
```

## Implementação Completa

### 1. Atualizar EmailService
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export class EmailService {
  static async sendEmail(options: EmailOptions) {
    try {
      const result = await resend.emails.send({
        from: `${process.env.VITE_FROM_NAME} <${process.env.VITE_FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      })
      
      return { success: true, id: result.data?.id }
    } catch (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }
  }
}
```

### 2. Integrar com hooks do Supabase
Criar Edge Functions para envio automático:

```sql
-- Trigger para envio de email de boas-vindas
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Chamar Edge Function para envio de email
  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-welcome-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.jwt_token') || '"}',
    body := json_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'name', NEW.name
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_send_welcome
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION send_welcome_email();
```

## Monitoramento e Analytics

### 1. Logs de email
```sql
CREATE TABLE email_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  email_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'delivered', 'bounced', 'failed')),
  provider_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);
```

### 2. Dashboard de métricas
- Taxa de entrega
- Taxa de abertura
- Taxa de clique
- Bounces e reclamações

## Compliance e Boas Práticas

### 1. LGPD/GDPR
- Consentimento explícito para emails promocionais
- Opção de unsubscribe em todos os emails
- Política de privacidade clara

### 2. CAN-SPAM Act
- Endereço físico no rodapé
- Assunto claro e não enganoso
- Identificação como email promocional

### 3. Autenticação
- SPF record configurado
- DKIM habilitado
- DMARC policy definida

## Próximos Passos

1. **Escolher provedor** (Recomendo Resend)
2. **Configurar domínio** personalizado
3. **Implementar templates** responsivos
4. **Configurar analytics** e monitoramento
5. **Testar entregabilidade** com ferramentas como Mail Tester
6. **Implementar automações** baseadas em eventos do usuário