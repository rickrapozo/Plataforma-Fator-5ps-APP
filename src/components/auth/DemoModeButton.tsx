import { useAppStore } from '../../stores/useAppStore'
import { useNavigate } from 'react-router-dom'

const DemoModeButton = () => {
  const { setUser, setAuthenticated, completeOnboarding } = useAppStore()
  const navigate = useNavigate()

  const enterAdminMode = () => {
    // Criar usuário administrador fictício
    const adminUser = {
      id: 'admin-user-id',
      email: 'rickrapozo@gmail.com',
      name: 'Rick Rapozo (Admin)',
      subscription: 'prosperous' as const,
      subscription_status: 'active' as const,
      role: 'super_admin' as const,
      permissions: [
        'admin_panel',
        'user_management', 
        'content_management',
        'analytics',
        'system_settings',
        'all_features',
        'therapist_ai',
        'premium_content',
        'unlimited_access'
      ]
    }

    // Configurar estado como autenticado com dados admin
    setUser(adminUser)
    setAuthenticated(true)
    
    // Completar onboarding com resultados fictícios
    completeOnboarding({
      thought: 5,
      feeling: 5,
      emotion: 5,
      action: 5,
      result: 5,
      completedAt: new Date().toISOString()
    })
    
    // Configurar dados admin avançados usando o store
    useAppStore.setState({
      streak: 30,
      longestStreak: 45,
      totalDays: 100,
      level: 10,
      xp: 15000,
      badges: [
        'admin', 'super_user', 'streak-7', 'streak-21', 'streak-30',
        'level-5', 'level-10', 'master', 'guru', 'transformer'
      ]
    })
    
    // Navegar para dashboard
    navigate('/app/dashboard')
  }

  return (
    <button
      onClick={enterAdminMode}
      className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg border border-purple-400/30"
    >
      👑 Entrar como Administrador
    </button>
  )
}

export default DemoModeButton