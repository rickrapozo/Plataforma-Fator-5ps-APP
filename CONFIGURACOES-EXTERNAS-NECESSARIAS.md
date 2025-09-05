# 🔧 Configurações Externas Necessárias

## 📋 Resumo dos Problemas Identificados

1. **Políticas RLS muito restritivas** na tabela `users` (erro 42501)
2. **Usuário não existe na tabela `users`** (apenas no auth.users)
3. **Tabelas auxiliares ausentes** (user_consents, security_events, privacy_settings)
4. **PostgreSQL CLI não instalado** localmente

---

## 🎯 Soluções - Configurações no Painel Supabase

### 1. 🔐 Corrigir Políticas RLS da Tabela Users

**Problema:** As políticas RLS estão impedindo inserções na tabela `users`

**Solução no Painel Supabase:**

1. **Acesse o Painel Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta
   - Selecione seu projeto

2. **Navegue para o Editor SQL:**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Execute o Script de Correção RLS:**
   ```sql
   -- Remover políticas existentes da tabela users
   DROP POLICY IF EXISTS "Users can view own profile" ON users;
   DROP POLICY IF EXISTS "Users can update own profile" ON users;
   DROP POLICY IF EXISTS "Enable insert for authenticated users during registration" ON users;
   
   -- Criar políticas mais permissivas
   CREATE POLICY "Allow authenticated users to view users" ON users
       FOR SELECT USING (auth.role() = 'authenticated');
   
   CREATE POLICY "Allow authenticated users to insert users" ON users
       FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   
   CREATE POLICY "Allow users to update own profile" ON users
       FOR UPDATE USING (auth.uid() = id);
   
   -- Permitir acesso durante autenticação
   CREATE POLICY "Allow service role full access" ON users
       FOR ALL USING (auth.role() = 'service_role');
   ```

4. **Clique em "Run" para executar**

---

### 2. 📊 Criar Tabelas Auxiliares Ausentes

**Problema:** Tabelas `user_consents`, `security_events`, `privacy_settings` não existem

**Solução no Painel Supabase:**

1. **No SQL Editor, execute:**
   ```sql
   -- Criar tabela user_consents
   CREATE TABLE IF NOT EXISTS user_consents (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
       consent_type TEXT NOT NULL,
       granted BOOLEAN DEFAULT false,
       granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Criar tabela privacy_settings
   CREATE TABLE IF NOT EXISTS privacy_settings (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
       data_collection BOOLEAN DEFAULT true,
       marketing_emails BOOLEAN DEFAULT false,
       analytics_tracking BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Criar tabela security_events
   CREATE TABLE IF NOT EXISTS security_events (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
       event_type TEXT NOT NULL,
       ip_address INET,
       user_agent TEXT,
       metadata JSONB DEFAULT '{}',
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Criar tabela data_export_requests
   CREATE TABLE IF NOT EXISTS data_export_requests (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
       request_type TEXT NOT NULL CHECK (request_type IN ('export', 'deletion')),
       status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
       requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       completed_at TIMESTAMP WITH TIME ZONE,
       metadata JSONB DEFAULT '{}'
   );
   ```

2. **Configurar RLS para as novas tabelas:**
   ```sql
   -- Habilitar RLS
   ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
   ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
   ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
   
   -- Políticas para user_consents
   CREATE POLICY "Users can view own consents" ON user_consents
       FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert own consents" ON user_consents
       FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   -- Políticas para privacy_settings
   CREATE POLICY "Users can view own privacy settings" ON privacy_settings
       FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can manage own privacy settings" ON privacy_settings
       FOR ALL USING (auth.uid() = user_id);
   
   -- Políticas para security_events
   CREATE POLICY "Users can view own security events" ON security_events
       FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Service can insert security events" ON security_events
       FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);
   
   -- Políticas para data_export_requests
   CREATE POLICY "Users can manage own export requests" ON data_export_requests
       FOR ALL USING (auth.uid() = user_id);
   ```

---

### 3. 👤 Popular Tabela Users

**Problema:** Usuário existe no `auth.users` mas não na tabela `users`

**Solução no Painel Supabase:**

1. **No SQL Editor, execute:**
   ```sql
   -- Inserir usuário admin na tabela users
   INSERT INTO users (
       id,
       email,
       name,
       role,
       subscription,
       subscription_status,
       permissions,
       created_at,
       updated_at
   )
   SELECT 
       id,
       email,
       COALESCE(raw_user_meta_data->>'full_name', 'Administrador'),
       'admin',
       'prosperous',
       'active',
       ARRAY['admin', 'premium', 'basic'],
       created_at,
       updated_at
   FROM auth.users 
   WHERE email = 'rickrapozo@gmail.com'
   ON CONFLICT (id) DO UPDATE SET
       role = EXCLUDED.role,
       subscription = EXCLUDED.subscription,
       subscription_status = EXCLUDED.subscription_status,
       permissions = EXCLUDED.permissions,
       updated_at = NOW();
   ```

2. **Criar user_progress para o usuário:**
   ```sql
   -- Inserir progresso inicial do usuário
   INSERT INTO user_progress (
       user_id,
       level,
       experience_points,
       current_streak,
       longest_streak,
       total_sessions,
       total_minutes,
       achievements,
       last_activity
   )
   SELECT 
       id,
       10,
       5000,
       30,
       30,
       100,
       3000,
       ARRAY['early_adopter', 'streak_master', 'level_10'],
       NOW()
   FROM auth.users 
   WHERE email = 'rickrapozo@gmail.com'
   ON CONFLICT (user_id) DO UPDATE SET
       level = EXCLUDED.level,
       experience_points = EXCLUDED.experience_points,
       current_streak = EXCLUDED.current_streak,
       longest_streak = EXCLUDED.longest_streak,
       updated_at = NOW();
   ```

---

### 4. 📧 Configurar Autenticação por Email (Opcional)

**Para melhorar a experiência de login:**

1. **Vá para Authentication > Settings**
2. **Configure Email Templates:**
   - Customize os templates de confirmação
   - Configure redirect URLs

3. **Configure SMTP (Recomendado):**
   - Vá para Authentication > Settings > SMTP Settings
   - Configure com seu provedor de email preferido

---

## ✅ Verificação Final

**Após executar todas as configurações acima:**

1. **Teste no terminal:**
   ```bash
   node test-login-functionality.js
   ```

2. **Teste na aplicação web:**
   - Acesse: http://localhost:5173
   - Faça login com: rickrapozo@gmail.com / Rick@2290
   - Verifique se o ícone de admin aparece

3. **Verifique as tabelas no Supabase:**
   - Vá para Table Editor
   - Confirme que todas as tabelas existem
   - Verifique se o usuário está na tabela `users`

---

## 🚨 Troubleshooting

### Se ainda houver erro 42501:
1. **Desabilite RLS temporariamente:**
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ```
2. **Insira o usuário**
3. **Reabilite RLS:**
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ```

### Se as tabelas não forem criadas:
1. **Verifique permissões do usuário no Supabase**
2. **Execute os comandos um por vez**
3. **Verifique logs de erro no painel**

---

## 📞 Suporte

Se encontrar problemas:
1. **Verifique os logs no painel Supabase**
2. **Execute os scripts de teste fornecidos**
3. **Verifique se todas as variáveis de ambiente estão corretas**

**Arquivos de teste disponíveis:**
- `test-login-functionality.js` - Teste completo de login
- `create-admin-user.js` - Criar usuário admin
- `populate-users-table.js` - Popular tabela users

---

*Última atualização: Janeiro 2025*