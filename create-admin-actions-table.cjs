const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdminActionsTable() {
  console.log('Verificando se tabela admin_actions existe...')
  
  // Primeiro, vamos verificar se a tabela já existe
  const { data, error: checkError } = await supabase
    .from('admin_actions')
    .select('id')
    .limit(1)
  
  if (!checkError) {
    console.log('✅ Tabela admin_actions já existe')
    return
  }
  
  if (checkError.code === 'PGRST116' || checkError.message?.includes('does not exist')) {
    console.log('❌ Tabela admin_actions não existe. Precisa ser criada via migração SQL no Supabase Dashboard.')
    console.log('Execute o seguinte SQL no Supabase Dashboard:')
    console.log(`
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin actions" ON public.admin_actions
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  ));

CREATE POLICY "Admins can insert admin actions" ON public.admin_actions
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  ));`)
  } else {
    console.error('❌ Erro ao verificar tabela admin_actions:', checkError)
  }
}

createAdminActionsTable().catch(console.error)