import { supabase } from '../lib/supabase'
import type { DailyProtocol } from '../lib/supabase'

export class ProtocolService {
  static async saveDailyProtocol(userId: string, protocolData: Omit<DailyProtocol, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('daily_protocols')
        .upsert({
          user_id: userId,
          ...protocolData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Save daily protocol error:', error)
      throw error
    }
  }

  static async getDailyProtocol(userId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('daily_protocols')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      return data
    } catch (error) {
      console.error('Get daily protocol error:', error)
      throw error
    }
  }

  static async getProtocolHistory(userId: string, days: number = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('daily_protocols')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get protocol history error:', error)
      throw error
    }
  }

  static async getCompletionStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('daily_protocols')
        .select('date, p1_affirmations, p2_feeling, p3_peak_state_completed, p4_completed, p5_victory, p5_gratitude')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) throw error

      const stats = {
        totalDays: data?.length || 0,
        completedDays: 0,
        currentStreak: 0,
        longestStreak: 0
      }

      if (!data || data.length === 0) return stats

      // Calculate completed days
      stats.completedDays = data.filter(protocol => {
        const isBasicComplete = 
          protocol.p1_affirmations?.length === 3 &&
          protocol.p2_feeling &&
          protocol.p3_peak_state_completed &&
          protocol.p4_completed

        // For evening protocols, also check P5
        const hour = new Date().getHours()
        if (hour >= 18) {
          return isBasicComplete && protocol.p5_victory && protocol.p5_gratitude
        }
        
        return isBasicComplete
      }).length

      // Calculate streaks
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0

      const today = new Date().toISOString().split('T')[0]
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      for (let i = 0; i < sortedData.length; i++) {
        const protocol = sortedData[i]
        const isComplete = 
          protocol.p1_affirmations?.length === 3 &&
          protocol.p2_feeling &&
          protocol.p3_peak_state_completed &&
          protocol.p4_completed

        if (isComplete) {
          tempStreak++
          if (i === 0 && protocol.date === today) {
            currentStreak = tempStreak
          }
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak
          }
          tempStreak = 0
        }
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }

      stats.currentStreak = currentStreak
      stats.longestStreak = longestStreak

      return stats
    } catch (error) {
      console.error('Get completion stats error:', error)
      throw error
    }
  }
}