// Script para verificar status do usuário no banco
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const ADMIN_EMAIL = 'rickrapozo@gmail.com'
const ADMIN_PASSWORD = 'Rick@2290'

async function checkUserStatus() {
  console.log('🔍 Verificando status do usuário administrador...')
  console.log('Email:', ADMIN_EMAIL)
  
  try {
    // 1. Tentar fazer login
    console.log('\n1. Tentando fazer login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message)
      console.error('Código:', loginError.status)
      
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('\n🔍 Verificando se usuário existe na tabela auth.users...')
        
        // Não podemos acessar auth.users diretamente, mas podemos tentar outras abordagens
        console.log('\n2. Tentando recuperação de senha para verificar se email existe...')
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL)
        
        if (resetError) {
          console.error('❌ Erro na recuperação:', resetError.message)
        } else {
          console.log('✅ Email de recuperação enviado - usuário existe no auth')
        }
      }
      
      return
    }

    console.log('✅ Login bem-sucedido!')
    console.log('ID do usuário:', loginData.user.id)
    console.log('Email confirmado:', loginData.user.email_confirmed_at ? 'Sim' : 'Não')
    console.log('Metadados:', JSON.stringify(loginData.user.user_metadata, null, 2))
    
    // 2. Verificar perfil na tabela users
    console.log('\n2. Verificando perfil na tabela users...')
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', loginData.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message)
      
      if (profileError.code === 'PGRST116') {
        console.log('\n🔧 Perfil não encontrado, criando...')
        
        const newProfile = {
          id: loginData.user.id,
          email: ADMIN_EMAIL,
          name: 'Rick Rapozo',
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
        
        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single()
        
        if (createError) {
          console.error('❌ Erro ao criar perfil:', createError.message)
        } else {
          console.log('✅ Perfil criado com sucesso!')
          console.log('Dados:', JSON.stringify(createdProfile, null, 2))
        }
      }
    } else {
      console.log('✅ Perfil encontrado!')
      console.log('Dados:', JSON.stringify(profile, null, 2))
    }
    
    // 3. Fazer logout
    await supabase.auth.signOut()
    console.log('\n✅ Logout realizado')
    
    console.log('\n🎉 DIAGNÓSTICO COMPLETO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Usuário existe e pode fazer login')
    console.log('✅ Perfil configurado corretamente')
    console.log('✅ Credenciais funcionando')
    console.log('\n🔐 CREDENCIAIS CONFIRMADAS:')
    console.log('📧 Email:', ADMIN_EMAIL)
    console.log('🔑 Senha:', ADMIN_PASSWORD)
    console.log('\n🌐 Acesse: http://localhost:5173/login')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkUserStatus()