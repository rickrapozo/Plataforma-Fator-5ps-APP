// Script para corrigir políticas RLS que estão impedindo login
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixRLSPolicies() {
  console.log('🔧 Corrigindo políticas RLS da tabela users...')
  
  try {
    // Primeiro, vamos tentar desabilitar temporariamente RLS na tabela users
    console.log('\n📋 Tentando desabilitar RLS temporariamente...')
    
    const disableRLS = `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;`
    
    // Como não temos acesso direto ao SQL, vamos tentar uma abordagem diferente
    // Vamos verificar se conseguimos acessar a tabela users
    console.log('\n🔍 Testando acesso à tabela users...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Erro ao acessar tabela users:', usersError.message)
      console.log('📝 Código do erro:', usersError.code)
      
      if (usersError.code === '42501') {
        console.log('\n⚠️  ERRO RLS CONFIRMADO (42501)')
        console.log('\n📋 SOLUÇÕES NECESSÁRIAS:')
        console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard')
        console.log('2. Vá para SQL Editor')
        console.log('3. Execute o arquivo: fix-rls-policies.sql')
        console.log('\nOu execute manualmente:')
        console.log('ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;')
        console.log('\nOu ajuste as políticas para serem menos restritivas.')
      }
    } else {
      console.log('✅ Tabela users acessível:', users?.length || 0, 'usuários encontrados')
      
      if (users && users.length > 0) {
        console.log('\n👥 Usuários na tabela:')
        users.forEach(user => {
          console.log(`  - ${user.email} (ID: ${user.id})`)
        })
      }
    }
    
    // Testar autenticação com usuário admin
    console.log('\n🔐 Testando login com usuário admin...')
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'rickrapozo@gmail.com',
      password: 'Rick@2290'
    })
    
    if (authError) {
      console.log('❌ Erro no login:', authError.message)
      console.log('📝 Código do erro:', authError.code || 'N/A')
    } else {
      console.log('✅ Login realizado com sucesso!')
      console.log('👤 Usuário logado:', authData.user?.email)
      
      // Tentar acessar dados do usuário logado
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user?.id)
        .single()
      
      if (userError) {
        console.log('❌ Erro ao buscar dados do usuário:', userError.message)
        console.log('📝 Código do erro:', userError.code)
      } else {
        console.log('✅ Dados do usuário recuperados:', userData)
      }
      
      // Fazer logout
      await supabase.auth.signOut()
      console.log('🚪 Logout realizado')
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }
  
  return true
}

fixRLSPolicies()
  .then(() => {
    console.log('\n🎉 Diagnóstico de RLS concluído!')
    console.log('\n📋 PRÓXIMOS PASSOS:')
    console.log('1. Se houver erro 42501, execute fix-rls-policies.sql no Supabase')
    console.log('2. Ou desabilite temporariamente RLS: ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;')
    console.log('3. Teste o login novamente na aplicação')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })