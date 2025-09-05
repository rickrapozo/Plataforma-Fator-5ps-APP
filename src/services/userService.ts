import { supabase } from '../lib/supabase'
import type { User, UserProgress, OnboardingResults } from '../lib/supabase'

export class UserService {
  static async getUserProgress(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get user progress error:', error)
      throw error
    }
  }

  static async updateUserProgress(userId: string, progressData: Partial<UserProgress>) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .update({
          ...progressData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update user progress error:', error)
      throw error
    }
  }

  static async addXP(userId: string, amount: number) {
    try {
      // Get current progress
      const currentProgress = await this.getUserProgress(userId)
      
      const newXP = currentProgress.xp + amount
      const newLevel = Math.floor(newXP / 1000) + 1
      
      const updates: Partial<UserProgress> = {
        xp: newXP,
        level: newLevel
      }

      // Add level up badge if leveled up
      if (newLevel > currentProgress.level) {
        updates.badges = [...currentProgress.badges, `level-${newLevel}`]
      }

      return await this.updateUserProgress(userId, updates)
    } catch (error) {
      console.error('Add XP error:', error)
      throw error
    }
  }

  static async updateStreak(userId: string, increment: boolean = true) {
    try {
      const currentProgress = await this.getUserProgress(userId)
      
      const newStreak = increment ? currentProgress.streak + 1 : 0
      const longestStreak = Math.max(newStreak, currentProgress.longest_streak)
      const totalDays = increment ? currentProgress.total_days + 1 : currentProgress.total_days

      const updates: Partial<UserProgress> = {
        streak: newStreak,
        longest_streak: longestStreak,
        total_days: totalDays
      }

      // Add streak milestone badges
      if (increment && [7, 21, 50, 100].includes(newStreak)) {
        updates.badges = [...currentProgress.badges, `streak-${newStreak}`]
      }

      return await this.updateUserProgress(userId, updates)
    } catch (error) {
      console.error('Update streak error:', error)
      throw error
    }
  }

  static async addBadge(userId: string, badge: string) {
    try {
      const currentProgress = await this.getUserProgress(userId)
      
      if (!currentProgress.badges.includes(badge)) {
        const updates: Partial<UserProgress> = {
          badges: [...currentProgress.badges, badge]
        }
        
        return await this.updateUserProgress(userId, updates)
      }
      
      return currentProgress
    } catch (error) {
      console.error('Add badge error:', error)
      throw error
    }
  }

  static async saveOnboardingResults(userId: string, results: Omit<OnboardingResults, 'id' | 'user_id'>) {
    try {
      const { data, error } = await supabase
        .from('onboarding_results')
        .upsert({
          user_id: userId,
          ...results
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) throw error

      // Mark user as having completed onboarding
      await supabase
        .from('user_profiles')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      return data
    } catch (error) {
      console.error('Save onboarding results error:', error)
      throw error
    }
  }

  static async getOnboardingResults(userId: string) {
    try {
      const { data, error } = await supabase
        .from('onboarding_results')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Get onboarding results error:', error)
      throw error
    }
  }

  static async updateUserProfile(userId: string, profileData: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update user profile error:', error)
      throw error
    }
  }
}