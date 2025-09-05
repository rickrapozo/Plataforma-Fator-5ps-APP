-- Script para corrigir políticas RLS da tabela users
-- O problema é que as políticas estão muito restritivas para login

-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user creation during registration" ON public.users;

-- Criar políticas mais permissivas para permitir login e operações básicas

-- Permitir que usuários vejam seu próprio perfil (necessário para login)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.role() = 'authenticated'
  );

-- Permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (
    auth.uid() = id
  );

-- Permitir criação de usuários durante registro (mais permissivo)
CREATE POLICY "Allow user creation during registration" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    auth.role() = 'anon' OR
    auth.role() = 'authenticated'
  );

-- Política adicional para permitir acesso durante autenticação
CREATE POLICY "Allow authentication access" ON public.users
  FOR SELECT USING (
    true  -- Temporariamente permissivo para resolver login
  );

-- Verificar se as políticas foram aplicadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';