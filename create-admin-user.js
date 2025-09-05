// Script para criar usuário administrador
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Credenciais do administrador
const ADMIN_EMAIL = 'rickrapozo@gmail.com'
const ADMIN_PASSWORD = 'Rick@2290'
const ADMIN_NAME = 'Rick Rapozo'

async function createAdminUser() {
  console.log('🔧 Criando usuário administrador...')
  console.log('Email:', ADMIN_EMAIL)
  
  try {
    // Primeiro, tentar fazer login para ver se já existe
    console.log('\n1. Verificando se usuário já existe...')
    const { data: existingUser, error: loginError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })

    if (existingUser.user && !loginError) {
      console.log('✅ Usuário já existe!')
      console.log('ID:', existingUser.user.id)
      console.log('Email confirmado:', existingUser.user.email_confirmed_at ? 'Sim' : 'Não')
      
      // Fazer logout para limpar sessão
      await supabase.auth.signOut()
      
    } else {
      // Criar novo usuário
      console.log('👤 Criando novo usuário administrador...')
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: {
            name: ADMIN_NAME,
            role: 'super_admin',
            subscription: 'prosperous',
            subscription_status: 'active',
            permissions: [
              'admin_panel',
              'user_management', 
              'content_management',
              'analytics',
              'system_settings',
              'all_features',
              'therapist_ai',
              'premium_content',
              'unlimited_access'
            ]
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log('ℹ️ Usuário já registrado, tentando fazer login...')
          
          const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
          })
          
          if (loginData.user) {
            console.log('✅ Login bem-sucedido!')
            console.log('ID:', loginData.user.id)
            await supabase.auth.signOut()
          } else {
            console.error('❌ Erro no login:', loginErr?.message)
          }
        } else {
          console.error('❌ Erro ao criar usuário:', authError.message)
          return
        }
      } else {
        console.log('✅ Usuário criado na autenticação!')
        console.log('ID:', authData.user?.id)
      }
    }

    // Reenviar email de confirmação
    console.log('\n📧 Enviando email de confirmação...')
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: ADMIN_EMAIL
    })

    if (resendError) {
      console.warn('⚠️ Aviso ao reenviar confirmação:', resendError.message)
    } else {
      console.log('✅ Email de confirmação enviado!')
    }

    console.log('\n🎉 USUÁRIO ADMINISTRADOR CONFIGURADO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', ADMIN_EMAIL)
    console.log('🔑 Senha:', ADMIN_PASSWORD)
    console.log('👑 Role: Super Admin (configurado nos metadados)')
    console.log('💎 Subscription: Prosperous (Ativo)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✨ COMO USAR:')
    console.log('1. 📬 Verifique seu email e confirme a conta')
    console.log('2. 🌐 Acesse o app: http://localhost:5173')
    console.log('3. 👑 Use o botão "Entrar como Administrador" para acesso completo')
    console.log('4. 🔐 Ou faça login normal com as credenciais acima')
    console.log('\n🚀 FUNCIONALIDADES ADMINISTRATIVAS:')
    console.log('• Acesso total ao Terapeuta AI')
    console.log('• Todas as funcionalidades premium')
    console.log('• Painel administrativo (/admin)')
    console.log('• Ícone de coroa no header')
    console.log('• Dados avançados (Level 10, 30 dias streak)')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createAdminUser()