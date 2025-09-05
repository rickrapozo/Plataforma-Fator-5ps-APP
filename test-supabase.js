// Teste simples da conexão Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseAnonKey.substring(0, 20) + '...')
  
  try {
    // Teste 1: Verificar se consegue conectar
    console.log('\n1. Testando conexão básica...')
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message)
      console.error('Detalhes:', error)
      return
    }
    
    console.log('✅ Conexão OK')
    
    // Teste 2: Tentar registrar usuário
    console.log('\n2. Tentando registrar usuário de teste...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'rickrapozo@gmail.com',
      password: 'Rick@2290',
      options: {
        data: {
          name: 'Rick Rapozo'
        }
      }
    })
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('ℹ️ Usuário já existe, tentando fazer login...')
        
        // Teste 3: Tentar fazer login
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'rickrapozo@gmail.com',
          password: 'Rick@2290'
        })
        
        if (signInError) {
          console.error('❌ Erro no login:', signInError.message)
          console.error('Detalhes:', signInError)
        } else {
          console.log('✅ Login bem-sucedido!')
          console.log('Usuário:', signInData.user.email)
          console.log('ID:', signInData.user.id)
        }
      } else {
        console.error('❌ Erro no registro:', signUpError.message)
        console.error('Detalhes:', signUpError)
      }
    } else {
      console.log('✅ Usuário registrado com sucesso!')
      console.log('ID:', signUpData.user?.id)
      console.log('Email:', signUpData.user?.email)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testConnection()