// Script para criar usuário de teste no Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

// Cliente normal para registro
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestUser() {
  try {
    console.log('Registrando usuário de teste...')
    
    // Registrar usuário normalmente
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'rickrapozo@gmail.com',
      password: 'Rick@2290',
      options: {
        data: {
          name: 'Rick Rapozo'
        }
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('Usuário já existe, tentando fazer login...')
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: 'rickrapozo@gmail.com',
          password: 'Rick@2290'
        })
        
        if (loginError) {
          console.error('Erro no login:', loginError)
          return
        }
        
        console.log('✅ Login bem-sucedido!')
        console.log('Usuário:', loginData.user.email)
        return
      }
      
      console.error('Erro ao registrar usuário:', authError)
      return
    }

    console.log('✅ Usuário registrado com sucesso!')
    console.log('ID:', authData.user?.id)
    console.log('Email:', authData.user?.email)
    console.log('Confirmação necessária:', !authData.user?.email_confirmed_at)

  } catch (error) {
    console.error('Erro geral:', error)
  }
}

createTestUser()