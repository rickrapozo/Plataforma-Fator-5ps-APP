import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Trophy, Calendar, Target, Zap, Heart, Brain, Eye, CheckCircle, Clock, Star, Award, TrendingUp } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { getCapitalizedFirstName } from '../../utils/nameUtils'

interface Challenge {
  id: string
  title: string
  description: string
  pillar: '5ps' | 'pensamento' | 'sentimento' | 'emocao' | 'acao' | 'resultado'
  duration: 7 | 21
  participants: number
  maxParticipants: number
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'completed'
  rewards: {
    xp: number
    badge: string
    title: string
  }
  dailyTasks: string[]
  progress?: number
  isParticipating?: boolean
}

interface UserProgress {
  challengeId: string
  completedDays: number
  totalDays: number
  streak: number
  achievements: string[]
}

const CommunityHub: React.FC = () => {
  const { user } = useAppStore()
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'achievements'>('challenges')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const firstName = getCapitalizedFirstName(user?.name || 'Transformador')

  // Mock data - em produção viria do backend
  useEffect(() => {
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Desafio de 21 Dias: Ação Massiva',
        description: 'Transforme sua vida através de ações consistentes e poderosas. Cada dia uma nova conquista!',
        pillar: 'acao',
        duration: 21,
        participants: 847,
        maxParticipants: 1000,
        startDate: '2024-02-01',
        endDate: '2024-02-21',
        status: 'active',
        rewards: {
          xp: 2100,
          badge: 'Executor Imparável',
          title: 'Mestre da Ação'
        },
        dailyTasks: [
          'Complete uma tarefa importante antes das 10h',
          'Pratique 15 min de exercício físico',
          'Faça uma ação que te tire da zona de conforto'
        ],
        progress: 65,
        isParticipating: true
      },
      {
        id: '2',
        title: 'Desafio de 7 Dias: Reset Mental',
        description: 'Uma semana para reprogramar seus padrões mentais e criar uma mentalidade próspera.',
        pillar: 'pensamento',
        duration: 7,
        participants: 324,
        maxParticipants: 500,
        startDate: '2024-02-15',
        endDate: '2024-02-21',
        status: 'upcoming',
        rewards: {
          xp: 700,
          badge: 'Mente Renovada',
          title: 'Arquiteto Mental'
        },
        dailyTasks: [
          'Pratique 10 min de meditação matinal',
          'Escreva 3 afirmações poderosas',
          'Identifique e transforme um pensamento limitante'
        ]
      },
      {
        id: '3',
        title: 'Desafio de 21 Dias: Inteligência Emocional',
        description: 'Desenvolva o domínio sobre suas emoções e crie relacionamentos mais profundos.',
        pillar: 'emocao',
        duration: 21,
        participants: 156,
        maxParticipants: 300,
        startDate: '2024-02-10',
        endDate: '2024-03-02',
        status: 'active',
        rewards: {
          xp: 2100,
          badge: 'Mestre Emocional',
          title: 'Guardião das Emoções'
        },
        dailyTasks: [
          'Pratique o reconhecimento emocional',
          'Expresse gratidão genuína a alguém',
          'Transforme uma emoção negativa em aprendizado'
        ]
      }
    ]

    setChallenges(mockChallenges)
    setIsLoading(false)
  }, [])

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'pensamento': return Brain
      case 'sentimento': return Heart
      case 'emocao': return Zap
      case 'acao': return Target
      case 'resultado': return Eye
      default: return Trophy
    }
  }

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'pensamento': return 'from-blue-500 to-indigo-600'
      case 'sentimento': return 'from-pink-500 to-rose-600'
      case 'emocao': return 'from-yellow-500 to-orange-600'
      case 'acao': return 'from-green-500 to-emerald-600'
      case 'resultado': return 'from-purple-500 to-violet-600'
      default: return 'from-royal-gold to-amber-500'
    }
  }

  const joinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, participants: challenge.participants + 1, isParticipating: true }
        : challenge
    ))
  }

  const renderChallenges = () => (
    <div className="space-y-6">
      {challenges.map((challenge) => {
        const PillarIcon = getPillarIcon(challenge.pillar)
        const pillarColor = getPillarColor(challenge.pillar)
        
        return (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${pillarColor}`}>
                  <PillarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{challenge.title}</h3>
                  <p className="text-pearl-white/70 text-sm">{challenge.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  challenge.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  challenge.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {challenge.status === 'active' ? 'Ativo' : 
                   challenge.status === 'upcoming' ? 'Em breve' : 'Concluído'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-royal-gold" />
                <span className="text-sm text-pearl-white/80">
                  {challenge.participants}/{challenge.maxParticipants} participantes
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-royal-gold" />
                <span className="text-sm text-pearl-white/80">
                  {challenge.duration} dias
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-royal-gold" />
                <span className="text-sm text-pearl-gold">
                  {challenge.rewards.xp} XP
                </span>
              </div>
            </div>

            {challenge.isParticipating && challenge.progress && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-pearl-white/80">Seu Progresso</span>
                  <span className="text-sm font-semibold text-royal-gold">{challenge.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${pillarColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${challenge.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-royal-gold" />
                <span className="text-sm text-pearl-gold font-semibold">
                  {challenge.rewards.badge}
                </span>
              </div>
              
              {!challenge.isParticipating ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => joinChallenge(challenge.id)}
                  className="px-6 py-2 bg-gradient-to-r from-royal-gold to-amber-500 text-deep-forest font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Participar
                </motion.button>
              ) : (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">Participando</span>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )

  const renderLeaderboard = () => (
    <div className="space-y-4">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-royal-gold" />
          Ranking Semanal
        </h3>
        
        {[1, 2, 3, 4, 5].map((position) => (
          <div key={position} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                position === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-deep-forest' :
                position === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-deep-forest' :
                position === 3 ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white' :
                'bg-white/20 text-pearl-white'
              }`}>
                {position}
              </div>
              <div>
                <p className="font-semibold text-white">
                  {position === 1 ? firstName : `Transformador ${position}`}
                </p>
                <p className="text-sm text-pearl-white/70">Nível {10 + position}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-royal-gold">{(1000 - position * 100)} XP</p>
              <p className="text-sm text-pearl-white/70">{21 - position} desafios</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAchievements = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { title: 'Primeiro Desafio', description: 'Complete seu primeiro desafio', icon: Trophy, earned: true },
        { title: 'Streak de Fogo', description: '7 dias consecutivos', icon: Zap, earned: true },
        { title: 'Líder Comunitário', description: 'Top 10 no ranking', icon: Star, earned: false },
        { title: 'Mestre dos 5Ps', description: 'Complete desafios de todos os pilares', icon: Award, earned: false },
      ].map((achievement, index) => {
        const IconComponent = achievement.icon
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              achievement.earned 
                ? 'bg-gradient-to-br from-royal-gold/20 to-amber-500/20 border-royal-gold/50' 
                : 'bg-white/5 border-white/20'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <IconComponent className={`w-6 h-6 ${
                achievement.earned ? 'text-royal-gold' : 'text-pearl-white/50'
              }`} />
              <h4 className={`font-semibold ${
                achievement.earned ? 'text-royal-gold' : 'text-pearl-white/70'
              }`}>
                {achievement.title}
              </h4>
            </div>
            <p className={`text-sm ${
              achievement.earned ? 'text-pearl-white' : 'text-pearl-white/50'
            }`}>
              {achievement.description}
            </p>
            {achievement.earned && (
              <div className="mt-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-royal-gold border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Comunidade 5Ps
        </motion.h2>
        <p className="text-pearl-white/80">
          Conecte-se, desafie-se e transforme-se junto com outros Transformadores
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
          {[
            { key: 'challenges', label: 'Desafios', icon: Target },
            { key: 'leaderboard', label: 'Ranking', icon: Trophy },
            { key: 'achievements', label: 'Conquistas', icon: Award }
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(key as any)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-royal-gold to-amber-500 text-deep-forest'
                  : 'text-pearl-white hover:text-royal-gold'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'challenges' && renderChallenges()}
          {activeTab === 'leaderboard' && renderLeaderboard()}
          {activeTab === 'achievements' && renderAchievements()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default CommunityHub