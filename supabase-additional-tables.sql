-- Additional tables for privacy, security and admin features

-- Privacy settings table
CREATE TABLE public.privacy_settings (
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
CREATE TABLE public.user_consents (
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
CREATE TABLE public.security_events (
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
CREATE TABLE public.admin_actions (
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

-- User profiles table (for additional user data)
CREATE TABLE public.user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  birth_date DATE,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'pt-BR',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User activities table (for monitoring)
CREATE TABLE public.user_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  page TEXT,
  action TEXT,
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error logs table
CREATE TABLE public.error_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  url TEXT,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session metrics table
CREATE TABLE public.session_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  pages_visited INTEGER DEFAULT 0,
  actions_performed INTEGER DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables

-- Privacy settings - users can only see their own
CREATE POLICY "Users can view own privacy settings" ON public.privacy_settings
  FOR ALL USING (auth.uid() = user_id);

-- User consents - users can only see their own
CREATE POLICY "Users can view own consents" ON public.user_consents
  FOR ALL USING (auth.uid() = user_id);

-- Security events - only admins can view
CREATE POLICY "Admins can view security events" ON public.security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin actions - only admins can view
CREATE POLICY "Admins can view admin actions" ON public.admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin actions - only admins can insert
CREATE POLICY "Admins can log actions" ON public.admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- User profiles - users can only see their own
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- User activities - users can see their own, admins can see all
CREATE POLICY "Users can view own activities" ON public.user_activities
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Error logs - admins can view all
CREATE POLICY "Admins can view error logs" ON public.error_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Session metrics - users can see their own, admins can see all
CREATE POLICY "Users can view own session metrics" ON public.session_metrics
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_consents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for better performance
CREATE INDEX idx_privacy_settings_user ON public.privacy_settings(user_id);
CREATE INDEX idx_user_consents_user_type ON public.user_consents(user_id, consent_type);
CREATE INDEX idx_security_events_type_created ON public.security_events(event_type, created_at);
CREATE INDEX idx_admin_actions_admin_created ON public.admin_actions(admin_id, created_at);
CREATE INDEX idx_user_profiles_user ON public.user_profiles(user_id);
CREATE INDEX idx_user_activities_user_created ON public.user_activities(user_id, created_at);
CREATE INDEX idx_error_logs_created_resolved ON public.error_logs(created_at, resolved);
CREATE INDEX idx_session_metrics_user_start ON public.session_metrics(user_id, start_time);

-- Function to create default privacy settings for new users
CREATE OR REPLACE FUNCTION public.create_default_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_profiles (user_id, first_name, last_name)
  VALUES (NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'name', 'User'), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(COALESCE(NEW.raw_user_meta_data->>'name', ''), ' ', 2))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing trigger to include privacy settings
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_profiles (user_id, first_name, last_name)
  VALUES (NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'name', 'User'), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(COALESCE(NEW.raw_user_meta_data->>'name', ''), ' ', 2))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();