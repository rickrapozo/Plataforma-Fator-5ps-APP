/**
 * Configuração centralizada do banco de dados
 * Este arquivo consolida todas as configurações de banco de dados
 */

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseConfig = {
  url: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'
};

// Cliente Supabase
const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
const supabaseAdmin = createClient(supabaseConfig.url, supabaseConfig.serviceKey);

// Configurações de tabelas
const tableConfig = {
  users: {
    name: 'users',
    columns: ['id', 'email', 'password_hash', 'role', 'created_at', 'updated_at']
  },
  user_progress: {
    name: 'user_progress',
    columns: ['id', 'user_id', 'current_step', 'completed_steps', 'created_at', 'updated_at']
  },
  privacy_settings: {
    name: 'privacy_settings',
    columns: ['id', 'user_id', 'data_collection', 'marketing_emails', 'analytics', 'created_at', 'updated_at']
  },
  user_consents: {
    name: 'user_consents',
    columns: ['id', 'user_id', 'consent_type', 'consent_given', 'consent_date', 'ip_address']
  },
  security_events: {
    name: 'security_events',
    columns: ['id', 'user_id', 'event_type', 'event_data', 'ip_address', 'user_agent', 'created_at']
  },
  admin_actions: {
    name: 'admin_actions',
    columns: ['id', 'admin_id', 'action_type', 'target_user_id', 'action_data', 'created_at']
  },
  rate_limits: {
    name: 'rate_limits',
    columns: ['id', 'identifier', 'action', 'count', 'window_start', 'created_at']
  }
};

// Configurações de migração
const migrationConfig = {
  migrationsPath: './migrations',
  seedsPath: './seeds',
  policiesPath: './policies'
};

module.exports = {
  supabase,
  supabaseAdmin,
  supabaseConfig,
  tableConfig,
  migrationConfig
};