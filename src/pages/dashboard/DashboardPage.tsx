import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../stores/useAppStore'
import WelcomeHeader from '../../components/dashboard/WelcomeHeader'
import DailyProgress from '../../components/dashboard/DailyProgress'
import StreakCounter from '../../components/dashboard/StreakCounter'
import WeeklyStats from '../../components/dashboard/WeeklyStats'
import AchievementSystem from '../../components/dashboard/AchievementSystem'
import ProtocolSection from '../../components/dashboard/ProtocolSection'
import AffirmationsChecklist from '../../components/dashboard/AffirmationsChecklist'
import FeelingTracker from '../../components/dashboard/FeelingTracker'
import PeakStateActivator from '../../components/dashboard/PeakStateActivator'
import AMVTracker from '../../components/dashboard/AMVTracker'
import NightlyReflection from '../../components/dashboard/NightlyReflection'

const DashboardPage: React.FC = () => {
  const { 
    dailyProtocol, 
    updateDailyProtocol, 
    addXP, 
    incrementStreak,
    saveDailyProtocol 
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
      <div className="px-4 py-6 space-y-6">
        <WelcomeHeader />
        <DailyProgress />
        <StreakCounter />
        <WeeklyStats />
        <AchievementSystem />
        
        {/* P1 - Pensamento */}
        <ProtocolSection
          title="P1 - Reprogramação do Pensamento"
          icon="Brain"
          completed={dailyProtocol.p1_affirmations.length === 3}
          description="Reprograme sua mente com afirmações poderosas"
        >
          <AffirmationsChecklist
            affirmations={dailyProtocol.p1_affirmations}
            onUpdate={(affirmations) => updateDailyProtocol('p1_affirmations', affirmations)}
          />
        </ProtocolSection>

        {/* P2 - Sentimento */}
        <ProtocolSection
          title="P2 - Registro de Sentimentos"
          icon="Heart"
          completed={!!dailyProtocol.p2_feeling}
          description="Identifique e registre seus sentimentos atuais"
        >
          <FeelingTracker
            currentFeeling={dailyProtocol.p2_feeling}
            trigger={dailyProtocol.p2_trigger}
            onUpdate={(feeling, trigger) => {
              updateDailyProtocol('p2_feeling', feeling)
              updateDailyProtocol('p2_trigger', trigger)
            }}
          />
        </ProtocolSection>

        {/* P3 - Emoção */}
        <ProtocolSection
          title="P3 - Ativação do Estado Peak"
          icon="Zap"
          completed={dailyProtocol.p3_peak_state_completed}
          description="Ative seu estado emocional de alta performance"
        >
          <PeakStateActivator
            onComplete={() => updateDailyProtocol('p3_peak_state_completed', true)}
            completed={dailyProtocol.p3_peak_state_completed}
          />
        </ProtocolSection>

        {/* P4 - Ação */}
        <ProtocolSection
          title="P4 - Ação Mínima Viável"
          icon="Target"
          completed={dailyProtocol.p4_completed}
          description="Defina e execute uma ação concreta hoje"
        >
          <AMVTracker
            amv={dailyProtocol.p4_amv}
            completed={dailyProtocol.p4_completed}
            onUpdate={(amv, completed) => {
              updateDailyProtocol('p4_amv', amv)
              updateDailyProtocol('p4_completed', completed)
            }}
          />
        </ProtocolSection>

        {/* P5 - Resultado (Noturno) */}
        {isNightTime && (
          <ProtocolSection
            title="P5 - Reflexão Noturna"
            icon="Moon"
            completed={!!(dailyProtocol.p5_victory && dailyProtocol.p5_gratitude)}
            description="Reflita sobre seu dia e celebre suas conquistas"
            nightOnly={true}
          >
            <NightlyReflection
              data={{
                victory: dailyProtocol.p5_victory,
                feedback: dailyProtocol.p5_feedback,
                gratitude: dailyProtocol.p5_gratitude
              }}
              onUpdate={(field, value) => updateDailyProtocol(`p5_${field}` as any, value)}
            />
          </ProtocolSection>
        )}

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
              Parabéns! Você completou seu protocolo diário 5P. Continue assim!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage