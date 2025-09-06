import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

// Configuração melhorada do cliente Supabase com tratamento de erros de rede
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-application-name': 'essential-factor-5p'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Função para verificar conectividade
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.getSession()
    return !error
  } catch (error) {
    console.warn('Supabase connection check failed:', error)
    return false
  }
}

// Função para tentar reconectar
export const reconnectSupabase = async (): Promise<boolean> => {
  try {
    // Tentar uma operação simples para verificar conectividade
    const { error } = await supabase.from('users').select('count').limit(1)
    return !error
  } catch (error) {
    console.warn('Supabase reconnection failed:', error)
    return false
  }
}

// Database Types
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  subscription?: 'essential' | 'prosperous' | null
  subscription_status?: 'active' | 'trial' | 'expired' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface DailyProtocol {
  id: string
  user_id: string
  date: string
  p1_affirmations: string[]
  p2_feeling: string | null
  p2_trigger: string
  p3_peak_state_completed: boolean
  p4_amv: string
  p4_completed: boolean
  p5_victory: string
  p5_feedback: string
  p5_gratitude: string
  created_at: string
  updated_at: string
}

export interface OnboardingResults {
  id: string
  user_id: string
  thought: number
  feeling: number
  emotion: number
  action: number
  result: number
  completed_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  streak: number
  longest_streak: number
  total_days: number
  level: number
  xp: number
  badges: string[]
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  message: string
  response: string
  created_at: string
}