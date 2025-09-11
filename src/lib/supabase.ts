import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

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