// Script para executar o schema SQL no Supabase
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function executeSchema() {
  console.log('📋 Verificando estrutura do banco de dados...')
  
  try {
    // Verificar se a tabela users existe
    console.log('\n1. Verificando tabela users...')
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Tabela users não existe:', usersError.message)
      console.log('\n⚠️  AÇÃO NECESSÁRIA:')
      console.log('1. Acesse o painel do Supabase: https://supabase.com')
      console.log('2. Vá em SQL Editor')
      console.log('3. Execute o conteúdo do arquivo: supabase-schema.sql')
      console.log('4. Depois execute novamente: node create-admin-user.js')
      return
    }
    
    console.log('✅ Tabela users existe!')
    
    // Verificar se a tabela user_progress existe
    console.log('\n2. Verificando tabela user_progress...')
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('count')
      .limit(1)
    
    if (progressError) {
      console.log('❌ Tabela user_progress não existe:', progressError.message)
    } else {
      console.log('✅ Tabela user_progress existe!')
    }
    
    // Verificar outras tabelas importantes
    const tables = ['daily_protocols', 'onboarding_results', 'chat_messages']
    
    for (const table of tables) {
      console.log(`\n3. Verificando tabela ${table}...`)
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`❌ Tabela ${table} não existe:`, error.message)
      } else {
        console.log(`✅ Tabela ${table} existe!`)
      }
    }
    
    console.log('\n🎉 Estrutura do banco verificada!')
    console.log('Agora você pode executar: node create-admin-user.js')
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error)
  }
}

executeSchema()