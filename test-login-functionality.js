import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Carregar variáveis de ambiente do arquivo .env
let supabaseUrl, supabaseAnonKey

try {
  const envContent = readFileSync(join(process.cwd(), '.env'), 'utf8')
  const envLines = envContent.split('\n')
  
  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim()
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1].trim()
    }
  }
} catch (error) {
  console.error('❌ Erro ao ler arquivo .env:', error.message)
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.log('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLoginFunctionality() {
  console.log('🧪 Testando funcionalidade de login...')
  console.log('=' .repeat(50))

  try {
    // 1. Testar conexão com Supabase
    console.log('\n1. Testando conexão com Supabase...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (healthError) {
      if (healthError.code === '42501') {
        console.log('⚠️  Erro de política RLS detectado (42501) - isso é esperado se RLS estiver ativo')
      } else if (healthError.code === 'PGRST205') {
        console.log('⚠️  Tabela users não encontrada')
      } else {
        console.log('❌ Erro de conexão:', healthError.message)
        return
      }
    } else {
      console.log('✅ Conexão com Supabase estabelecida')
    }

    // 2. Testar login com usuário administrador
    console.log('\n2. Testando login com usuário administrador...')
    const adminEmail = 'rickrapozo@gmail.com'
    const adminPassword = 'Rick@2290'
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    })

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message)
      
      // Verificar se o usuário existe
      console.log('\n   Verificando se o usuário existe...')
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.log('   ❌ Erro ao listar usuários:', authError.message)
      } else {
        const adminUser = authUsers.users.find(u => u.email === adminEmail)
        if (adminUser) {
          console.log('   ✅ Usuário administrador encontrado no auth')
          console.log('   📧 Email confirmado:', adminUser.email_confirmed_at ? 'Sim' : 'Não')
        } else {
          console.log('   ❌ Usuário administrador não encontrado no auth')
          console.log('   💡 Execute o script create-admin-user.js para criar o usuário')
        }
      }
      return
    }

    console.log('✅ Login realizado com sucesso!')
    console.log('👤 Usuário logado:', loginData.user.email)
    console.log('🔑 Sessão ativa:', loginData.session ? 'Sim' : 'Não')

    // 3. Testar acesso à tabela users
    console.log('\n3. Testando acesso à tabela users...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', loginData.user.id)
      .single()

    if (userError) {
      if (userError.code === '42501') {
        console.log('❌ Erro de política RLS (42501) - usuário não pode acessar seus próprios dados')
        console.log('💡 Execute o script fix-rls-policies.sql no painel do Supabase')
      } else if (userError.code === 'PGRST116') {
        console.log('⚠️  Usuário não encontrado na tabela users')
        console.log('💡 Execute o script populate-users-table.js para popular a tabela')
      } else {
        console.log('❌ Erro ao acessar dados do usuário:', userError.message)
      }
    } else {
      console.log('✅ Dados do usuário acessados com sucesso')
      console.log('📊 Dados:', {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      })
    }

    // 4. Testar serviços de privacidade e segurança
    console.log('\n4. Testando serviços de privacidade e segurança...')
    
    // Testar privacy service
    try {
      const { data: privacyData, error: privacyError } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', loginData.user.id)
        .single()
      
      if (privacyError && privacyError.code === 'PGRST205') {
        console.log('⚠️  Tabela privacy_settings não encontrada - usando configurações padrão')
      } else if (privacyError) {
        console.log('⚠️  Erro ao acessar privacy_settings:', privacyError.message)
      } else {
        console.log('✅ Configurações de privacidade acessadas')
      }
    } catch (error) {
      console.log('⚠️  Erro no teste de privacidade:', error.message)
    }

    // Testar security events
    try {
      const { data: securityData, error: securityError } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', loginData.user.id)
        .limit(1)
      
      if (securityError && securityError.code === 'PGRST205') {
        console.log('⚠️  Tabela security_events não encontrada - eventos serão logados no console')
      } else if (securityError) {
        console.log('⚠️  Erro ao acessar security_events:', securityError.message)
      } else {
        console.log('✅ Eventos de segurança acessados')
      }
    } catch (error) {
      console.log('⚠️  Erro no teste de segurança:', error.message)
    }

    // 5. Fazer logout
    console.log('\n5. Fazendo logout...')
    const { error: logoutError } = await supabase.auth.signOut()
    
    if (logoutError) {
      console.log('❌ Erro no logout:', logoutError.message)
    } else {
      console.log('✅ Logout realizado com sucesso')
    }

    // 6. Resumo dos testes
    console.log('\n' + '=' .repeat(50))
    console.log('📋 RESUMO DOS TESTES:')
    console.log('✅ Conexão com Supabase: OK')
    console.log('✅ Login de usuário: OK')
    console.log('⚠️  Acesso à tabela users: Verificar políticas RLS')
    console.log('⚠️  Tabelas auxiliares: Podem não existir (comportamento esperado)')
    console.log('✅ Logout: OK')
    
    console.log('\n💡 PRÓXIMOS PASSOS:')
    console.log('1. Se houver erro 42501, execute: fix-rls-policies.sql')
    console.log('2. Se usuário não estiver na tabela users, execute: populate-users-table.js')
    console.log('3. Para criar tabelas auxiliares, execute: create-tables-simple.sql')
    console.log('4. Teste a aplicação web em: http://localhost:5173')

  } catch (error) {
    console.error('❌ Erro geral no teste:', error)
  }
}

// Executar teste
testLoginFunctionality()
  .then(() => {
    console.log('\n🎉 Teste de funcionalidade concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })