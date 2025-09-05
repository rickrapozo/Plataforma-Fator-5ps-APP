// Script para corrigir o perfil do usuário
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixUserProfile() {
  try {
    console.log('🔧 Corrigindo perfil do usuário...')
    
    // 1. Fazer login
    console.log('1. Fazendo login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'rickrapozo@gmail.com',
      password: 'Rick@2290'
    })
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message)
      return
    }
    
    console.log('✅ Login bem-sucedido!')
    const userId = loginData.user.id
    
    // 2. Verificar se perfil existe
    console.log('2. Verificando perfil...')
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar perfil:', profileCheckError.message)
      return
    }
    
    if (existingProfile) {
      console.log('✅ Perfil já existe:', existingProfile.name)
    } else {
      // 3. Criar perfil
      console.log('3. Criando perfil...')
      const { data: newProfile, error: createProfileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: 'rickrapozo@gmail.com',
          name: 'Rick Rapozo',
          subscription: null,
          subscription_status: 'trial'
        })
        .select()
        .single()
      
      if (createProfileError) {
        console.error('❌ Erro ao criar perfil:', createProfileError.message)
        return
      }
      
      console.log('✅ Perfil criado:', newProfile.name)
    }
    
    // 4. Verificar/criar progresso
    console.log('4. Verificando progresso...')
    const { data: existingProgress, error: progressCheckError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (progressCheckError && progressCheckError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar progresso:', progressCheckError.message)
      return
    }
    
    if (existingProgress) {
      console.log('✅ Progresso já existe')
    } else {
      console.log('5. Criando progresso...')
      const { data: newProgress, error: createProgressError } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          streak: 0,
          longest_streak: 0,
          total_days: 0,
          level: 1,
          xp: 0,
          badges: []
        })
        .select()
        .single()
      
      if (createProgressError) {
        console.error('❌ Erro ao criar progresso:', createProgressError.message)
        return
      }
      
      console.log('✅ Progresso criado')
    }
    
    console.log('\n🎉 Usuário configurado com sucesso!')
    console.log('Email: rickrapozo@gmail.com')
    console.log('Senha: Rick@2290')
    console.log('ID:', userId)
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

fixUserProfile()