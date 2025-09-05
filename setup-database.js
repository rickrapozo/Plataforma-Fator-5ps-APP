// Script para configurar automaticamente o banco de dados Supabase
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
// Service key para operações administrativas
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg0MDQ5NiwiZXhwIjoyMDcyNDE2NDk2fQ.Ej3zQHNqCJBJZJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Configurando banco de dados automaticamente...')
  
  try {
    // Primeiro, vamos executar comandos SQL básicos para criar as tabelas
    console.log('\n1. Criando extensão UUID...')
    const { error: uuidError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
    })
    
    if (uuidError && !uuidError.message.includes('already exists')) {
      console.log('⚠️  Aviso UUID:', uuidError.message)
    } else {
      console.log('✅ Extensão UUID configurada!')
    }
    
    // Criar tabela users
    console.log('\n2. Criando tabela users...')
    const createUsersSQL = `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        avatar_url TEXT,
        subscription TEXT CHECK (subscription IN ('essential', 'prosperous')),
        subscription_status TEXT CHECK (subscription_status IN ('active', 'trial', 'expired', 'cancelled')) DEFAULT 'trial',
        role TEXT CHECK (role IN ('user', 'admin', 'super_admin')) DEFAULT 'user',
        permissions TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: createUsersSQL
    })
    
    if (usersError) {
      console.log('❌ Erro ao criar tabela users:', usersError.message)
      
      // Tentar método alternativo - inserir diretamente
      console.log('\n🔄 Tentando método alternativo...')
      
      // Vamos tentar criar o usuário admin diretamente na auth e depois na nossa tabela
      const ADMIN_EMAIL = 'rickrapozo@gmail.com'
      const ADMIN_PASSWORD = 'Rick@2290'
      
      console.log('\n3. Fazendo login como admin...')
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
      
      if (loginError) {
        console.error('❌ Erro no login:', loginError.message)
        return
      }
      
      console.log('✅ Login realizado com sucesso!')
      console.log('ID do usuário:', loginData.user.id)
      
      // Agora vamos tentar uma abordagem diferente
      console.log('\n4. Verificando se conseguimos acessar alguma tabela...')
      
      // Tentar listar tabelas existentes
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
      
      if (tablesError) {
        console.log('❌ Não conseguimos acessar o schema:', tablesError.message)
        
        console.log('\n📋 INSTRUÇÕES MANUAIS:')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('1. Acesse: https://supabase.com/dashboard')
        console.log('2. Selecione seu projeto: essential-factor-5p')
        console.log('3. Vá em "SQL Editor" no menu lateral')
        console.log('4. Clique em "New Query"')
        console.log('5. Cole o conteúdo do arquivo: supabase-schema.sql')
        console.log('6. Clique em "Run" para executar')
        console.log('7. Depois execute: node create-admin-user.js')
        console.log('\n🔐 CREDENCIAIS PARA LOGIN:')
        console.log('📧 Email:', ADMIN_EMAIL)
        console.log('🔑 Senha:', ADMIN_PASSWORD)
        console.log('🌐 URL: http://localhost:5173/login')
        
        return
      }
      
      console.log('✅ Tabelas encontradas:', tables?.map(t => t.table_name))
      
    } else {
      console.log('✅ Tabela users criada com sucesso!')
      
      // Criar outras tabelas essenciais
      console.log('\n3. Criando tabela user_progress...')
      const createProgressSQL = `
        CREATE TABLE IF NOT EXISTS public.user_progress (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
          streak INTEGER DEFAULT 0,
          longest_streak INTEGER DEFAULT 0,
          total_days INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          xp INTEGER DEFAULT 0,
          badges TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `
      
      const { error: progressError } = await supabase.rpc('exec_sql', {
        sql: createProgressSQL
      })
      
      if (progressError) {
        console.log('⚠️  Aviso user_progress:', progressError.message)
      } else {
        console.log('✅ Tabela user_progress criada!')
      }
      
      console.log('\n🎉 BANCO DE DADOS CONFIGURADO COM SUCESSO!')
      console.log('Agora execute: node create-admin-user.js')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
    
    console.log('\n📋 SOLUÇÃO MANUAL:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('1. Acesse: https://supabase.com/dashboard')
    console.log('2. Vá em SQL Editor')
    console.log('3. Execute o arquivo: supabase-schema.sql')
    console.log('4. Depois: node create-admin-user.js')
  }
}

setupDatabase()