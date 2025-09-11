import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../stores/useAppStore'
import DynamicGreeting from '../../components/dashboard/DynamicGreeting'
import FivePsPanel from '../../components/dashboard/FivePsPanel'
import DailyJourney from '../../components/dashboard/DailyJourney'

import VoiceCrisisMode from '../../components/crisis/VoiceCrisisMode'

import StreakCounter from '../../components/dashboard/StreakCounter'
import WeeklyStats from '../../components/dashboard/WeeklyStats'
import AchievementSystem from '../../components/dashboard/AchievementSystem'


const DashboardPage: React.FC = () => {
  const { 
    user, 
    dailyProtocol, 
    updateDailyProtocol, 
    addXP, 
    incrementStreak,
    saveDailyProtocol,
    streak,
    xp,
    level 
  } = useAppStore()

  const isNightTime = new Date().getHours() >= 18

  // Check if protocol is complete for the day
  const isProtocolComplete = () => {
    const { p1_affirmations, p2_feeling, p3_peak_state_completed, p4_completed } = dailyProtocol
    const basicComplete = p1_affirmations.length === 3 && p2_feeling && p3_peak_state_completed && p4_completed
    
    if (isNightTime) {
      return basicComplete && dailyProtocol.p5_victory && dailyProtocol.p5_gratitude
    }
    
    return basicComplete
  }

  // Save protocol changes to database
  useEffect(() => {
    const saveProtocol = async () => {
      try {
        await saveDailyProtocol()
      } catch (error) {
        console.error('Failed to save protocol:', error)
      }
    }

    // Debounce saves to avoid too many requests
    const timeoutId = setTimeout(saveProtocol, 1000)
    return () => clearTimeout(timeoutId)
  }, [dailyProtocol, saveDailyProtocol])

  // Award XP and increment streak when protocol is completed
  useEffect(() => {
    if (isProtocolComplete()) {
      const today = new Date().toISOString().split('T')[0]
      const lastCompletedDate = localStorage.getItem('lastProtocolCompleted')
      
      if (lastCompletedDate !== today) {
        addXP(50) // Daily protocol completion XP
        incrementStreak()
        localStorage.setItem('lastProtocolCompleted', today)
      }
    }
  }, [dailyProtocol, addXP, incrementStreak])

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green pb-20">
      <div className="px-4 py-6 space-y-8">
        {/* Dynamic Greeting */}
        <DynamicGreeting />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Journey and 5Ps Panel */}
          <div className="lg:col-span-2 space-y-8">
            <DailyJourney />
            <FivePsPanel />
          </div>
          
          {/* Right Column - Stats and Progress */}
          <div className="space-y-6">
            <StreakCounter />
            <WeeklyStats />
            <AchievementSystem />
          </div>
        </div>
        


        {/* Completion Celebration */}
        {isProtocolComplete() && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-royal-gold to-bright-gold rounded-full flex items-center justify-center"
            >
              <span className="text-2xl">🎉</span>
            </motion.div>
            <h3 className="text-white text-xl font-heading font-bold mb-2">
              Protocolo Completo!
            </h3>
            <p className="text-pearl-white/80 text-body-md">
              Parabens! Voce completou seu protocolo diario 5P. Continue assim!
            </p>
          </motion.div>
        )}
      </div>
      
      {/* Voice Crisis Mode - Global Floating Component */}
      <VoiceCrisisMode />
      

    </div>
  )
}

export default DashboardPage