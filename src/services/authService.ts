import { supabase } from '../lib/supabase'
import { privacyService } from './privacyService'


export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  acceptedTerms?: boolean
  marketingConsent?: boolean
  analyticsConsent?: boolean
}

export class AuthService {
  static async login(credentials: LoginCredentials) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (authError) {
        // Se o email não foi confirmado, tenta reenviar confirmação
        if (authError.message.includes('Email not confirmed')) {
          console.log('Email não confirmado, reenviando confirmação...')
          await supabase.auth.resend({
            type: 'signup',
            email: credentials.email
          })
          throw new Error('Email não confirmado. Um novo email de confirmação foi enviado.')
        }
        throw authError
      }

      // Get user profile
      let { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      // Se o perfil não existe, cria um
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Perfil não encontrado, criando...')
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: credentials.email,
            name: authData.user.user_metadata?.name || 'Usuário',
            subscription: null,
            subscription_status: 'trial'
          })
          .select()
          .single()

        if (createError) throw createError
        profile = newProfile

        // Criar progresso inicial também
        await supabase
          .from('user_progress')
          .insert({
            user_id: authData.user.id,
            streak: 0,
            longest_streak: 0,
            total_days: 0,
            level: 1,
            xp: 0,
            badges: []
          })
      } else if (profileError) {
        // Se não conseguir acessar a tabela users, usar dados dos metadados
        console.log('Usando dados dos metadados do usuário')
        profile = {
          id: authData.user.id,
          email: credentials.email,
          name: authData.user.user_metadata?.name || 'Usuário',
          role: authData.user.user_metadata?.role || 'user',
          subscription: authData.user.user_metadata?.subscription || null,
          subscription_status: authData.user.user_metadata?.subscription_status || 'trial',
          permissions: authData.user.user_metadata?.permissions || [],
          created_at: authData.user.created_at,
          updated_at: authData.user.updated_at
        }
      }

      // Enriquecer perfil com dados dos metadados do usuário
      const enrichedProfile = {
        ...profile,
        role: authData.user.user_metadata?.role || profile.role || 'user',
        subscription: authData.user.user_metadata?.subscription || profile.subscription,
        subscription_status: authData.user.user_metadata?.subscription_status || profile.subscription_status,
        permissions: authData.user.user_metadata?.permissions || profile.permissions || []
      }

      return {
        user: authData.user,
        profile: enrichedProfile,
        session: authData.session
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  static async register(userData: RegisterData) {
    try {
      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) throw new Error('Failed to create user')

      // Wait a bit for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Get the created profile
      let { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        // If profile doesn't exist, create it manually as fallback
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: userData.email,
            name: userData.name,
            subscription: null,
            subscription_status: 'trial'
          })
          .select()
          .single()

        if (createError) throw createError
        profile = newProfile
        
        // Also create user progress if it doesn't exist
        await supabase
          .from('user_progress')
          .insert({
            user_id: authData.user.id,
            streak: 0,
            longest_streak: 0,
            total_days: 0,
            level: 1,
            xp: 0,
            badges: []
          })
          .select()
          .single()
      }

      // Registrar consentimentos iniciais de LGPD
      try {
        // Privacy consents will be handled separately
        console.log('User registered successfully')
      } catch (consentError) {
        console.error('Erro ao registrar consentimentos:', consentError)
        // Não falha o registro se houver erro nos consentimentos
      }

      return {
        user: authData.user,
        profile,
        session: authData.session
      }
    } catch (error) {
      console.error('Register error:', error)
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
      // Primeiro verificar se há uma sessão ativa
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.warn('Session error:', sessionError.message)
        return null
      }
      
      if (!session || !session.user) {
        return null
      }

      const user = session.user

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.warn('Profile error:', profileError.message)
        // Retornar usuário mesmo sem perfil completo
        return { user, profile: null }
      }

      return { user, profile }
    } catch (error) {
      console.warn('Get current user error:', error)
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

  // Verificar se o usuário pode receber emails de marketing
  static async canSendMarketingEmail(userId: string): Promise<boolean> {
    try {
      return await privacyService.canSendMarketingEmails(userId)
    } catch (error) {
      console.error('Erro ao verificar consentimento de marketing:', error)
      return false
    }
  }

  // Verificar se o usuário consentiu com analytics
  static async canCollectAnalytics(userId: string): Promise<boolean> {
    try {
      return await privacyService.canCollectAnalytics(userId)
    } catch (error) {
      console.error('Erro ao verificar consentimento de analytics:', error)
      return false
    }
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}