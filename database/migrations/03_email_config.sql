-- Configuração de templates de email para Essential Factor 5P Platform

-- 1. Template de confirmação de email
UPDATE auth.config 
SET 
  site_url = 'https://essential-factor-5p.vercel.app',
  uri_allow_list = 'https://essential-factor-5p.vercel.app,http://localhost:5173,http://localhost:3000';

-- 2. Configurar templates de email personalizados
-- Template de confirmação de conta
INSERT INTO auth.email_templates (template_name, subject, body_html, body_text) 
VALUES (
  'confirmation',
  'Confirme sua conta - Essential Factor 5P',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirme sua conta</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #0f2027; color: #fefefe; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f2027 0%, #1a3d3a 100%); border-radius: 12px; padding: 40px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #d4af37; font-size: 28px; margin: 0; }
        .content { text-align: center; }
        .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #fefefe80; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>Essential Factor 5P</h1>
            <p style="color: #fefefe80; margin: 0;">Transformação Pessoal</p>
        </div>
        
        <div class="content">
            <h2 style="color: #d4af37;">Bem-vindo à sua jornada de transformação!</h2>
            <p>Obrigado por se cadastrar na Essential Factor 5P Platform. Para começar sua jornada de transformação pessoal, confirme sua conta clicando no botão abaixo:</p>
            
            <a href="{{ .ConfirmationURL }}" class="button">Confirmar Conta</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #fefefe80;">
                Se você não criou esta conta, pode ignorar este email com segurança.
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #fefefe60;">
                Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                <span style="word-break: break-all;">{{ .ConfirmationURL }}</span>
            </p>
        </div>
        
        <div class="footer">
            <p>Essential Factor 5P Platform - Transformando vidas através da tecnologia</p>
            <p>Este é um email automático, não responda.</p>
        </div>
    </div>
</body>
</html>',
  'Bem-vindo à Essential Factor 5P!

Obrigado por se cadastrar na nossa plataforma de transformação pessoal.

Para confirmar sua conta e começar sua jornada, clique no link abaixo:
{{ .ConfirmationURL }}

Se você não criou esta conta, pode ignorar este email com segurança.

---
Essential Factor 5P Platform
Transformando vidas através da tecnologia'
) ON CONFLICT (template_name) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text;

-- Template de recuperação de senha
INSERT INTO auth.email_templates (template_name, subject, body_html, body_text) 
VALUES (
  'recovery',
  'Recuperação de senha - Essential Factor 5P',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de senha</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #0f2027; color: #fefefe; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f2027 0%, #1a3d3a 100%); border-radius: 12px; padding: 40px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #d4af37; font-size: 28px; margin: 0; }
        .content { text-align: center; }
        .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .warning { background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #fefefe80; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>Essential Factor 5P</h1>
            <p style="color: #fefefe80; margin: 0;">Transformação Pessoal</p>
        </div>
        
        <div class="content">
            <h2 style="color: #d4af37;">Recuperação de senha</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta. Se foi você quem fez esta solicitação, clique no botão abaixo para criar uma nova senha:</p>
            
            <a href="{{ .ConfirmationURL }}" class="button">Redefinir Senha</a>
            
            <div class="warning">
                <p style="margin: 0; font-size: 14px;">
                    <strong>⚠️ Importante:</strong> Este link expira em 1 hora por segurança.
                </p>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; color: #fefefe80;">
                Se você não solicitou a recuperação de senha, ignore este email. Sua conta permanecerá segura.
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #fefefe60;">
                Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                <span style="word-break: break-all;">{{ .ConfirmationURL }}</span>
            </p>
        </div>
        
        <div class="footer">
            <p>Essential Factor 5P Platform - Transformando vidas através da tecnologia</p>
            <p>Este é um email automático, não responda.</p>
        </div>
    </div>
</body>
</html>',
  'Recuperação de senha - Essential Factor 5P

Recebemos uma solicitação para redefinir a senha da sua conta.

Para criar uma nova senha, clique no link abaixo:
{{ .ConfirmationURL }}

⚠️ Este link expira em 1 hora por segurança.

Se você não solicitou a recuperação de senha, ignore este email.

---
Essential Factor 5P Platform
Transformando vidas através da tecnologia'
) ON CONFLICT (template_name) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text;

-- Template de convite (se necessário)
INSERT INTO auth.email_templates (template_name, subject, body_html, body_text) 
VALUES (
  'invite',
  'Você foi convidado para Essential Factor 5P',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convite para Essential Factor 5P</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #0f2027; color: #fefefe; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f2027 0%, #1a3d3a 100%); border-radius: 12px; padding: 40px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #d4af37; font-size: 28px; margin: 0; }
        .content { text-align: center; }
        .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #fefefe80; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>Essential Factor 5P</h1>
            <p style="color: #fefefe80; margin: 0;">Transformação Pessoal</p>
        </div>
        
        <div class="content">
            <h2 style="color: #d4af37;">Você foi convidado!</h2>
            <p>Você recebeu um convite para se juntar à Essential Factor 5P Platform, uma plataforma premium de transformação pessoal baseada no método 5Ps.</p>
            
            <p>Clique no botão abaixo para aceitar o convite e começar sua jornada:</p>
            
            <a href="{{ .ConfirmationURL }}" class="button">Aceitar Convite</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #fefefe80;">
                Este convite expira em 7 dias.
            </p>
        </div>
        
        <div class="footer">
            <p>Essential Factor 5P Platform - Transformando vidas através da tecnologia</p>
            <p>Este é um email automático, não responda.</p>
        </div>
    </div>
</body>
</html>',
  'Convite para Essential Factor 5P

Você foi convidado para se juntar à Essential Factor 5P Platform!

Para aceitar o convite e começar sua jornada de transformação, clique no link:
{{ .ConfirmationURL }}

Este convite expira em 7 dias.

---
Essential Factor 5P Platform
Transformando vidas através da tecnologia'
) ON CONFLICT (template_name) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text;