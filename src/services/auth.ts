import { supabase } from '../lib/supabase'


export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export class AuthService {
  static async login({ email, password }: LoginCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.warn('Profile not found, creating new profile')
        // Create profile if it doesn't exist
        const newProfile = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single()

        if (createError) throw createError
        return { user: data.user, profile: createdProfile }
      }

      return { user: data.user, profile }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  static async register({ email, password, name }: RegisterData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Create user profile
        const profile = {
          id: data.user.id,
          email,
          name,
          subscription_plan: null,
          subscription_status: 'trial',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: createdProfile, error: profileError } = await supabase
          .from('users')
          .insert([profile])
          .select()
          .single()

        if (profileError) throw profileError

        // Create initial progress record
        const initialProgress = {
          user_id: data.user.id,
          streak: 0,
          longest_streak: 0,
          total_days: 0,
          level: 1,
          xp: 0,
          badges: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        await supabase
          .from('user_progress')
          .insert([initialProgress])

        return { user: data.user, profile: createdProfile }
      }

      throw new Error('User creation failed')
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  static async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      if (!user) return null

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      return { user, profile }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}