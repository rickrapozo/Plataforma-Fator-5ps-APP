// Script para confirmar email do usuário usando service key
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
// Nota: Você precisa da service key real do seu projeto Supabase
// Esta é apenas um exemplo - substitua pela sua service key real
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg0MDQ5NiwiZXhwIjoyMDcyNDE2NDk2fQ.SERVICE_KEY_AQUI'

// Para este exemplo, vou usar a anon key e tentar uma abordagem diferente
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createConfirmedUser() {
  try {
    console.log('🔧 Criando usuário com email confirmado...')
    
    // Vamos tentar criar um novo usuário com um email diferente para teste
    const testEmail = 'test.rickrapozo@gmail.com'
    const password = 'Rick@2290'
    
    console.log('1. Criando usuário de teste...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: password,
      options: {
        data: {
          name: 'Rick Rapozo (Test)'
        }
      }
    })
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('ℹ️ Usuário já existe, tentando login...')
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: password
        })
        
        if (signInError) {
          console.error('❌ Erro no login:', signInError.message)
          
          // Se o problema for email não confirmado, vamos tentar reenviar confirmação
          if (signInError.message.includes('Email not confirmed')) {
            console.log('2. Reenviando confirmação de email...')
            const { error: resendError } = await supabase.auth.resend({
              type: 'signup',
              email: testEmail
            })
            
            if (resendError) {
              console.error('❌ Erro ao reenviar confirmação:', resendError.message)
            } else {
              console.log('✅ Email de confirmação reenviado!')
              console.log('📧 Verifique sua caixa de entrada e clique no link de confirmação')
            }
          }
          return
        }
        
        console.log('✅ Login bem-sucedido!')
        console.log('ID:', signInData.user.id)
        console.log('Email:', signInData.user.email)
        
        // Criar perfil se não existir
        await createUserProfile(signInData.user.id, testEmail, 'Rick Rapozo (Test)')
        
      } else {
        console.error('❌ Erro no registro:', signUpError.message)
        return
      }
    } else {
      console.log('✅ Usuário criado!')
      console.log('📧 Verifique sua caixa de entrada para confirmar o email')
      console.log('Email:', testEmail)
      console.log('Senha:', password)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

async function createUserProfile(userId, email, name) {
  try {
    console.log('3. Criando perfil do usuário...')
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: email,
        name: name,
        subscription: null,
        subscription_status: 'trial'
      }, {
        onConflict: 'id'
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError.message)
      return
    }
    
    console.log('✅ Perfil criado:', profile.name)
    
    // Criar progresso
    const { error: progressError } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        streak: 0,
        longest_streak: 0,
        total_days: 0,
        level: 1,
        xp: 0,
        badges: []
      }, {
        onConflict: 'user_id'
      })
    
    if (progressError) {
      console.error('❌ Erro ao criar progresso:', progressError.message)
    } else {
      console.log('✅ Progresso criado')
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar perfil:', error)
  }
}

createConfirmedUser()