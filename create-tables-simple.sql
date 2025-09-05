-- Script SQL simples para criar tabelas ausentes
-- Execute este arquivo no SQL Editor do Supabase

-- Privacy settings table
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

-- User consents table
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

-- Security events table
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

-- Admin actions log table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for privacy_settings
CREATE POLICY IF NOT EXISTS "Users can view own privacy settings" ON public.privacy_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own privacy settings" ON public.privacy_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own privacy settings" ON public.privacy_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for user_consents
CREATE POLICY IF NOT EXISTS "Users can view own consents" ON public.user_consents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own consents" ON public.user_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for security_events
CREATE POLICY IF NOT EXISTS "Users can view own security events" ON public.security_events
  FOR SELECT USING (auth.uid() = user_id);

-- Create policies for admin_actions
CREATE POLICY IF NOT EXISTS "Admins can view all admin actions" ON public.admin_actions
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Admins can insert admin actions" ON public.admin_actions
  FOR INSERT WITH CHECK (true);

-- Insert default privacy settings for existing users
INSERT INTO public.privacy_settings (user_id, data_collection_consent, analytics_consent, marketing_consent)
SELECT id, false, false, false
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.privacy_settings WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;