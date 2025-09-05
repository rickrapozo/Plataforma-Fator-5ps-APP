// Script para popular a tabela users com dados do usuário autenticado
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function populateUsersTable() {
  console.log('🔧 Populando tabela users...')
  
  try {
    // Fazer login com usuário admin
    console.log('\n🔐 Fazendo login com usuário admin...')
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'rickrapozo@gmail.com',
      password: 'Rick@2290'
    })
    
    if (authError) {
      console.log('❌ Erro no login:', authError.message)
      return false
    }
    
    console.log('✅ Login realizado com sucesso!')
    console.log('👤 Usuário logado:', authData.user?.email)
    console.log('🆔 ID do usuário:', authData.user?.id)
    
    // Verificar se o usuário já existe na tabela users
    console.log('\n🔍 Verificando se usuário existe na tabela users...')
    
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user?.id)
    
    if (checkError) {
      console.log('⚠️  Erro ao verificar usuário existente:', checkError.message)
    }
    
    if (existingUser && existingUser.length > 0) {
      console.log('✅ Usuário já existe na tabela users:', existingUser[0])
    } else {
      console.log('❌ Usuário não encontrado na tabela users. Criando...')
      
      // Criar usuário na tabela users
      const userData = {
        id: authData.user?.id,
        email: authData.user?.email,
        name: authData.user?.user_metadata?.name || 'Rick Rapozo',
        role: 'admin',
        subscription: 'premium',
        subscription_status: 'active',
        permissions: ['read', 'write', 'admin'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([userData])
        .select()
      
      if (insertError) {
        console.log('❌ Erro ao criar usuário:', insertError.message)
        console.log('📝 Código do erro:', insertError.code)
        
        // Tentar inserção mais simples
        console.log('\n🔄 Tentando inserção simplificada...')
        
        const simpleUserData = {
          id: authData.user?.id,
          email: authData.user?.email,
          name: 'Rick Rapozo'
        }
        
        const { data: simpleUser, error: simpleError } = await supabase
          .from('users')
          .insert([simpleUserData])
          .select()
        
        if (simpleError) {
          console.log('❌ Erro na inserção simplificada:', simpleError.message)
        } else {
          console.log('✅ Usuário criado com dados básicos:', simpleUser)
        }
      } else {
        console.log('✅ Usuário criado com sucesso:', newUser)
      }
    }
    
    // Verificar novamente após inserção
    console.log('\n🔍 Verificação final da tabela users...')
    
    const { data: finalCheck, error: finalError } = await supabase
      .from('users')
      .select('*')
    
    if (finalError) {
      console.log('❌ Erro na verificação final:', finalError.message)
    } else {
      console.log('✅ Usuários na tabela:', finalCheck?.length || 0)
      
      if (finalCheck && finalCheck.length > 0) {
        console.log('\n👥 Lista de usuários:')
        finalCheck.forEach(user => {
          console.log(`  - ${user.email} (ID: ${user.id}) - Role: ${user.role || 'N/A'}`)
        })
      }
    }
    
    // Criar user_progress se não existir
    console.log('\n📊 Verificando user_progress...')
    
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', authData.user?.id)
    
    if (progressError) {
      console.log('⚠️  Erro ao verificar user_progress:', progressError.message)
    } else if (!progressData || progressData.length === 0) {
      console.log('📊 Criando user_progress...')
      
      const { error: createProgressError } = await supabase
        .from('user_progress')
        .insert([{ user_id: authData.user?.id }])
      
      if (createProgressError) {
        console.log('❌ Erro ao criar user_progress:', createProgressError.message)
      } else {
        console.log('✅ User_progress criado com sucesso')
      }
    } else {
      console.log('✅ User_progress já existe')
    }
    
    // Fazer logout
    await supabase.auth.signOut()
    console.log('🚪 Logout realizado')
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message)
    return false
  }
  
  return true
}

populateUsersTable()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Tabela users populada com sucesso!')
      console.log('\n📋 PRÓXIMOS PASSOS:')
      console.log('1. Teste o login na aplicação')
      console.log('2. Verifique se os erros RLS foram resolvidos')
    } else {
      console.log('\n❌ Falha ao popular tabela users')
    }
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })