// Script simplificado para criar tabelas ausentes
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createMissingTables() {
  console.log('🔧 Verificando e criando tabelas ausentes...')
  
  // Verificar se as tabelas existem
  const tables = ['privacy_settings', 'user_consents', 'security_events', 'admin_actions']
  
  for (const table of tables) {
    try {
      console.log(`\n📋 Verificando tabela ${table}...`)
      
      // Tentar acessar a tabela
      const { data, error } = await supabase.from(table).select('*').limit(1)
      
      if (error) {
        if (error.message.includes('Could not find the table')) {
          console.log(`❌ Tabela ${table} não encontrada`)
          console.log(`ℹ️  Esta tabela precisa ser criada manualmente no painel do Supabase`)
        } else {
          console.log(`⚠️  Erro ao acessar ${table}: ${error.message}`)
        }
      } else {
        console.log(`✅ Tabela ${table}: existe e acessível`)
      }
    } catch (err) {
      console.log(`❌ Erro ao verificar tabela ${table}:`, err.message)
    }
  }

  console.log('\n📝 INSTRUÇÕES PARA CRIAR AS TABELAS:')
  console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard')
  console.log('2. Vá para SQL Editor')
  console.log('3. Execute o conteúdo do arquivo: supabase-additional-tables.sql')
  console.log('\nOu execute este comando no terminal:')
  console.log('psql -h db.oywdjirdotwdsixpxiox.supabase.co -U postgres -d postgres -f supabase-additional-tables.sql')

  // Criar configurações padrão para usuários existentes
  console.log('\n🔧 Verificando usuários sem configurações...')
  
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
    
    if (usersError) {
      console.log('❌ Erro ao buscar usuários:', usersError.message)
      return
    }

    console.log(`📊 Encontrados ${users?.length || 0} usuários`)
    
    if (users && users.length > 0) {
      console.log('\n👥 Usuários encontrados:')
      users.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`)
      })
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar usuários:', error.message)
  }

  return true
}

createMissingTables()
  .then(() => {
    console.log('\n🎉 Verificação concluída!')
    console.log('\n⚠️  AÇÃO NECESSÁRIA:')
    console.log('As tabelas ausentes precisam ser criadas manualmente no Supabase.')
    console.log('Use o arquivo supabase-additional-tables.sql no SQL Editor.')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })