import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthService } from '../services/authService'
import { ProtocolService } from '../services/protocolService'
import { UserService } from '../services/userService'

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  subscription?: 'essential' | 'prosperous' | null
  subscription_status?: 'active' | 'trial' | 'expired' | 'cancelled'
  role?: 'user' | 'admin' | 'super_admin'
  permissions?: string[]
}

export interface DailyProtocol {
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
}

export interface OnboardingResults {
  thought: number
  feeling: number
  emotion: number
  action: number
  result: number
  completedAt: string
}

export interface AppState {
  // User State
  user: User | null
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  onboardingResults: OnboardingResults | null
  
  // Daily Protocol State
  dailyProtocol: DailyProtocol
  
  // Progress State
  streak: number
  longestStreak: number
  totalDays: number
  level: number
  xp: number
  badges: string[]
  
  // Audio State
  currentAudio: any | null
  isPlaying: boolean
  
  // App State
  theme: 'light' | 'dark'
  notifications: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  
  // Permission helpers
  hasPermission: (permission: string) => boolean
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
  hasFullAccess: () => boolean
  completeOnboarding: (results: OnboardingResults) => void
  updateDailyProtocol: (field: keyof DailyProtocol, value: any) => void
  resetDailyProtocol: () => void
  addXP: (amount: number) => void
  incrementStreak: () => void
  resetStreak: () => void
  addBadge: (badge: string) => void
  setCurrentAudio: (audio: any) => void
  setIsPlaying: (playing: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  setNotifications: (enabled: boolean) => void
  
  // Async Actions
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  loadUserData: () => Promise<void>
  saveDailyProtocol: () => Promise<void>
  loadDailyProtocol: (date?: string) => Promise<void>
}

const getTodayDate = () => new Date().toISOString().split('T')[0]

const initialDailyProtocol: DailyProtocol = {
  date: getTodayDate(),
  p1_affirmations: [],
  p2_feeling: null,
  p2_trigger: '',
  p3_peak_state_completed: false,
  p4_amv: '',
  p4_completed: false,
  p5_victory: '',
  p5_feedback: '',
  p5_gratitude: ''
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      onboardingResults: null,
      dailyProtocol: initialDailyProtocol,
      streak: 0,
      longestStreak: 0,
      totalDays: 0,
      level: 1,
      xp: 0,
      badges: [],
      currentAudio: null,
      isPlaying: false,
      theme: 'light',
      notifications: true,
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      
      completeOnboarding: (results) => set({
        hasCompletedOnboarding: true,
        onboardingResults: results
      }),
      
      updateDailyProtocol: (field, value) => {
        const today = getTodayDate()
        const currentProtocol = get().dailyProtocol
        
        // Reset protocol if it's a new day
        if (currentProtocol.date !== today) {
          set({
            dailyProtocol: {
              ...initialDailyProtocol,
              date: today,
              [field]: value
            }
          })
        } else {
          set({
            dailyProtocol: { ...currentProtocol, [field]: value }
          })
        }
      },
      
      resetDailyProtocol: () => set({
        dailyProtocol: { ...initialDailyProtocol, date: getTodayDate() }
      }),
      
      addXP: (amount) => {
        const currentXP = get().xp
        const newXP = currentXP + amount
        const newLevel = Math.floor(newXP / 1000) + 1
        
        set({ xp: newXP, level: newLevel })
        
        // Check for level up badge
        if (newLevel > get().level) {
          get().addBadge(`level-${newLevel}`)
        }
      },
      
      incrementStreak: () => {
        const currentStreak = get().streak + 1
        const longestStreak = Math.max(currentStreak, get().longestStreak)
        
        set({
          streak: currentStreak,
          longestStreak,
          totalDays: get().totalDays + 1
        })
        
        // Streak milestone badges
        if ([7, 21, 50, 100].includes(currentStreak)) {
          get().addBadge(`streak-${currentStreak}`)
        }
      },
      
      resetStreak: () => set({ streak: 0 }),
      
      addBadge: (badge) => {
        const currentBadges = get().badges
        if (!currentBadges.includes(badge)) {
          set({ badges: [...currentBadges, badge] })
        }
      },
      
      setCurrentAudio: (audio) => set({ currentAudio: audio }),
      
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      
      setTheme: (theme) => set({ theme }),
      
      setNotifications: (enabled) => set({ notifications: enabled }),
      
      // Permission helpers
      hasPermission: (permission: string) => {
        const { user } = get()
        if (!user) return false
        if (user.role === 'super_admin') return true
        return user.permissions?.includes(permission) || false
      },
      
      isAdmin: () => {
        const { user } = get()
        return user?.role === 'admin' || user?.role === 'super_admin'
      },
      
      isSuperAdmin: () => {
        const { user } = get()
        return user?.role === 'super_admin'
      },
      
      hasFullAccess: () => {
        const { user } = get()
        return Boolean(user?.role === 'super_admin' ||
          user?.subscription === 'prosperous' ||
          user?.permissions?.includes('all_features'))
      },
      
      // Async Actions
      login: async (email: string, password: string) => {
        try {
          const { profile } = await AuthService.login({ email, password })
          
          set({
            user: profile,
            isAuthenticated: true,
            hasCompletedOnboarding: true
          })
          
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        }
      },
      
      register: async (email: string, password: string, name: string) => {
        try {
          const { profile } = await AuthService.register({ email, password, name })
          
          set({
            user: profile,
            isAuthenticated: true,
            hasCompletedOnboarding: false
          })
          
        } catch (error) {
          console.error('Registration failed:', error)
          throw error
        }
      },
      
      logout: async () => {
        try {
          await AuthService.logout()
          
          // Reset store to initial state
          set({
            user: null,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
            onboardingResults: null,
            dailyProtocol: initialDailyProtocol,
            streak: 0,
            longestStreak: 0,
            totalDays: 0,
            level: 1,
            xp: 0,
            badges: [],
            currentAudio: null,
            isPlaying: false
          })
          
        } catch (error) {
          console.error('Logout failed:', error)
          throw error
        }
      },
      
      loadUserData: async () => {
        try {
          // Demo user for testing
          const demoUser = {
            id: 'demo-user-id',
            email: 'demo@essentialfactor.com',
            name: 'Usuário Demo',
            avatar_url: null,
            subscription: 'essential' as const,
            subscription_status: 'active' as const,
            role: 'user' as const,
            permissions: []
          }
          
          set({
            user: demoUser,
            isAuthenticated: true,
            hasCompletedOnboarding: true,
            onboardingResults: {
              thought: 8,
              feeling: 7,
              emotion: 9,
              action: 6,
              result: 8,
              completedAt: new Date().toISOString()
            },
            streak: 5,
            longestStreak: 12,
            totalDays: 30,
            level: 3,
            xp: 1250,
            badges: ['first_week', 'consistent_user']
          })
          
          console.log('Demo user loaded successfully')
          
        } catch (error) {
          console.error('Load user data failed:', error)
        }
      },
      
      saveDailyProtocol: async () => {
        try {
          const { user, dailyProtocol } = get()
          if (!user) return
          
          // Skip saving for demo user
          if (user.id === 'demo-user-id') {
            console.log('Demo mode: Protocol saved locally only')
            return
          }
          
          await ProtocolService.saveDailyProtocol(user.id, dailyProtocol)
        } catch (error) {
          console.error('Save daily protocol failed:', error)
        }
      },
      
      loadDailyProtocol: async (date?: string) => {
        try {
          const { user } = get()
          if (!user) return
          
          const targetDate = date || getTodayDate()
          
          // Skip loading for demo user
          if (user.id === 'demo-user-id') {
            set({ dailyProtocol: { ...initialDailyProtocol, date: targetDate } })
            return
          }
          
          const protocol = await ProtocolService.getDailyProtocol(user.id, targetDate)
          
          if (protocol) {
            set({ dailyProtocol: protocol })
          } else {
            // Reset to initial state for new day
            set({ dailyProtocol: { ...initialDailyProtocol, date: targetDate } })
          }
        } catch (error) {
          console.error('Load daily protocol failed:', error)
        }
      }
    }),
    {
      name: 'essential-factor-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        onboardingResults: state.onboardingResults,
        dailyProtocol: state.dailyProtocol,
        streak: state.streak,
        longestStreak: state.longestStreak,
        totalDays: state.totalDays,
        level: state.level,
        xp: state.xp,
        badges: state.badges,
        theme: state.theme,
        notifications: state.notifications
      })
    }
  )
)