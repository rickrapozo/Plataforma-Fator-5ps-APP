// Script para verificar e criar tabelas adicionais no Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAndCreateTables() {
  try {
    console.log('Verificando tabelas adicionais...')
    
    // Verificar se as tabelas existem
    const tables = ['privacy_settings', 'user_consents', 'security_events', 'admin_actions', 'user_profiles']
    
    for (const table of tables) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (tableError) {
          if (tableError.message.includes('does not exist') || tableError.message.includes('not found')) {
            console.log(`❌ Tabela ${table}: não existe`)
          } else {
            console.log(`⚠️  Tabela ${table}: ${tableError.message}`)
          }
        } else {
          console.log(`✅ Tabela ${table}: existe e acessível`)
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: erro ao verificar - ${err.message}`)
      }
    }
    
    // Tentar criar configurações de privacidade padrão para usuários existentes
    console.log('\nVerificando usuários sem configurações de privacidade...')
    
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(5)
      
      if (usersError) {
        console.log('Erro ao buscar usuários:', usersError.message)
      } else {
        console.log(`Encontrados ${users?.length || 0} usuários`)
        
        // Tentar inserir configurações padrão
        if (users && users.length > 0) {
          for (const user of users) {
            try {
              const { data: privacyData, error: privacyError } = await supabase
                .from('privacy_settings')
                .insert({
                  user_id: user.id,
                  data_collection_consent: false,
                  analytics_consent: false,
                  marketing_consent: false
                })
              
              if (privacyError) {
                if (privacyError.message.includes('duplicate') || privacyError.message.includes('already exists')) {
                  console.log(`✅ Usuário ${user.id}: configurações já existem`)
                } else {
                  console.log(`⚠️  Usuário ${user.id}: ${privacyError.message}`)
                }
              } else {
                console.log(`✅ Usuário ${user.id}: configurações criadas`)
              }
            } catch (err) {
              console.log(`❌ Usuário ${user.id}: erro - ${err.message}`)
            }
          }
        }
      }
    } catch (err) {
      console.log('Erro geral ao processar usuários:', err.message)
    }
    
  } catch (error) {
    console.error('Erro geral:', error.message)
  }
}

checkAndCreateTables()