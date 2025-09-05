// Script para criar um usuário que funcione imediatamente
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createWorkingUser() {
  try {
    console.log('🔧 Criando usuário funcional...')
    
    // Vamos tentar com um email temporário que não precisa de confirmação
    const emails = [
      'test1@example.com',
      'test2@example.com', 
      'demo@test.com',
      'user@demo.com'
    ]
    
    for (const email of emails) {
      console.log(`\nTentando criar usuário: ${email}`)
      
      try {
        // Tentar criar usuário
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: 'Rick@2290',
          options: {
            data: {
              name: 'Rick Rapozo'
            }
          }
        })
        
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            console.log(`ℹ️ ${email} já existe, tentando login...`)
            
            // Tentar login
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: email,
              password: 'Rick@2290'
            })
            
            if (signInError) {
              console.log(`❌ Login falhou para ${email}: ${signInError.message}`)
              continue
            }
            
            console.log(`✅ Login bem-sucedido para ${email}!`)
            await createProfile(signInData.user.id, email, 'Rick Rapozo')
            return { email, password: 'Rick@2290' }
            
          } else {
            console.log(`❌ Erro ao criar ${email}: ${signUpError.message}`)
            continue
          }
        }
        
        console.log(`✅ Usuário ${email} criado!`)
        
        // Tentar login imediatamente
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: 'Rick@2290'
        })
        
        if (signInError) {
          console.log(`❌ Login falhou para ${email}: ${signInError.message}`)
          continue
        }
        
        console.log(`✅ Login imediato bem-sucedido para ${email}!`)
        await createProfile(signInData.user.id, email, 'Rick Rapozo')
        return { email, password: 'Rick@2290' }
        
      } catch (error) {
        console.log(`❌ Erro geral para ${email}:`, error.message)
        continue
      }
    }
    
    console.log('❌ Não foi possível criar nenhum usuário funcional')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

async function createProfile(userId, email, name) {
  try {
    console.log('Criando perfil...')
    
    // Criar perfil
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
    
    console.log('✅ Perfil criado')
    
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

createWorkingUser().then(result => {
  if (result) {
    console.log('\n🎉 USUÁRIO FUNCIONAL CRIADO!')
    console.log(`📧 Email: ${result.email}`)
    console.log(`🔑 Senha: ${result.password}`)
    console.log('\nUse essas credenciais para fazer login na aplicação.')
  }
})