-- Essential Factor 5P Platform Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE public.users (
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

-- User progress table
CREATE TABLE public.user_progress (
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

-- Daily protocols table
CREATE TABLE public.daily_protocols (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  p1_affirmations TEXT[] DEFAULT '{}',
  p2_feeling TEXT,
  p2_trigger TEXT DEFAULT '',
  p3_peak_state_completed BOOLEAN DEFAULT FALSE,
  p4_amv TEXT DEFAULT '',
  p4_completed BOOLEAN DEFAULT FALSE,
  p5_victory TEXT DEFAULT '',
  p5_feedback TEXT DEFAULT '',
  p5_gratitude TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Onboarding results table
CREATE TABLE public.onboarding_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  thought INTEGER NOT NULL CHECK (thought >= 0 AND thought <= 100),
  feeling INTEGER NOT NULL CHECK (feeling >= 0 AND feeling <= 100),
  emotion INTEGER NOT NULL CHECK (emotion >= 0 AND emotion <= 100),
  action INTEGER NOT NULL CHECK (action >= 0 AND action <= 100),
  result INTEGER NOT NULL CHECK (result >= 0 AND result <= 100),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Chat messages table (for AI therapist)
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journey progress table
CREATE TABLE public.journey_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  journey_id TEXT NOT NULL,
  current_day INTEGER DEFAULT 1,
  completed_days INTEGER[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, journey_id)
);

-- Audio listening history
CREATE TABLE public.audio_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  audio_id TEXT NOT NULL,
  listened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_listened INTEGER DEFAULT 0 -- in seconds
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_history ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user creation during registration" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own protocols" ON public.daily_protocols
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own onboarding" ON public.onboarding_results
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat messages" ON public.chat_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own journey progress" ON public.journey_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own audio history" ON public.audio_history
  FOR ALL USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.daily_protocols
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for better performance
CREATE INDEX idx_daily_protocols_user_date ON public.daily_protocols(user_id, date);
CREATE INDEX idx_chat_messages_user_created ON public.chat_messages(user_id, created_at);
CREATE INDEX idx_audio_history_user_listened ON public.audio_history(user_id, listened_at);
CREATE INDEX idx_journey_progress_user_journey ON public.journey_progress(user_id, journey_id);