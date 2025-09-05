// Script para criar tabelas usando API REST do Supabase
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

// Usar chave anon para operações
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTablesDirectly() {
  console.log('🔧 Criando tabelas diretamente...')
  
  // SQL para criar as tabelas uma por vez
  const createPrivacySettings = `
    CREATE TABLE IF NOT EXISTS public.privacy_settings (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
      data_collection_consent BOOLEAN DEFAULT FALSE,
      analytics_consent BOOLEAN DEFAULT FALSE,
      marketing_consent BOOLEAN DEFAULT FALSE,
      data_retention_days INTEGER DEFAULT 365,
      anonymize_data BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id)
    );
  `

  const createUserConsents = `
    CREATE TABLE IF NOT EXISTS public.user_consents (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
      consent_type TEXT NOT NULL,
      granted BOOLEAN DEFAULT FALSE,
      granted_at TIMESTAMP WITH TIME ZONE,
      revoked_at TIMESTAMP WITH TIME ZONE,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

  const createSecurityEvents = `
    CREATE TABLE IF NOT EXISTS public.security_events (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      event_type TEXT NOT NULL,
      severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
      description TEXT,
      ip_address INET,
      user_agent TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

  const createAdminActions = `
    CREATE TABLE IF NOT EXISTS public.admin_actions (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
      action_type TEXT NOT NULL,
      target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      description TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

  const enableRLS = `
    ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
  `

  const createPolicies = `
    -- Privacy settings policies
    CREATE POLICY IF NOT EXISTS "Users can view own privacy settings" ON public.privacy_settings
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY IF NOT EXISTS "Users can update own privacy settings" ON public.privacy_settings
      FOR UPDATE USING (auth.uid() = user_id);
     
    CREATE POLICY IF NOT EXISTS "Users can insert own privacy settings" ON public.privacy_settings
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- User consents policies
    CREATE POLICY IF NOT EXISTS "Users can view own consents" ON public.user_consents
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY IF NOT EXISTS "Users can insert own consents" ON public.user_consents
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Security events policies
    CREATE POLICY IF NOT EXISTS "Users can view own security events" ON public.security_events
      FOR SELECT USING (auth.uid() = user_id);

    -- Admin actions policies
    CREATE POLICY IF NOT EXISTS "Admins can view all admin actions" ON public.admin_actions
      FOR SELECT USING (true);
    
    CREATE POLICY IF NOT EXISTS "Admins can insert admin actions" ON public.admin_actions
      FOR INSERT WITH CHECK (true);
  `

  const sqlCommands = [
    { name: 'privacy_settings', sql: createPrivacySettings },
    { name: 'user_consents', sql: createUserConsents },
    { name: 'security_events', sql: createSecurityEvents },
    { name: 'admin_actions', sql: createAdminActions },
    { name: 'RLS policies', sql: enableRLS },
    { name: 'security policies', sql: createPolicies }
  ]

  for (const command of sqlCommands) {
    try {
      console.log(`\n📋 Executando: ${command.name}...`)
      
      // Usar fetch direto para a API REST do Supabase
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          sql: command.sql
        })
      })

      if (response.ok) {
        console.log(`✅ ${command.name}: criado com sucesso`)
      } else {
        const error = await response.text()
        console.log(`⚠️  ${command.name}: ${error}`)
      }
    } catch (error) {
      console.log(`❌ Erro ao criar ${command.name}:`, error.message)
    }
  }

  // Verificar se as tabelas foram criadas
  console.log('\n🔍 Verificando tabelas criadas...')
  const tables = ['privacy_settings', 'user_consents', 'security_events', 'admin_actions']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`⚠️  Tabela ${table}: ${error.message}`)
      } else {
        console.log(`✅ Tabela ${table}: existe e acessível`)
      }
    } catch (err) {
      console.log(`❌ Erro ao verificar tabela ${table}:`, err.message)
    }
  }

  return true
}

createTablesDirectly()
  .then(() => {
    console.log('\n🎉 Processo de criação de tabelas concluído!')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })