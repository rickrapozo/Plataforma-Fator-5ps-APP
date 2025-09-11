import { useAppStore } from '../../stores/useAppStore'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const DemoModeButton = () => {
  const { login } = useAppStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const enterAdminMode = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      console.log('🚀 Entrando em modo desenvolvedor')
      
      // Fazer login com usuário admin existente
      await login('rickrapozo@gmail.com', 'Rick@2290')
      
      console.log('✅ Login demo realizado com sucesso')
      navigate('/app/dashboard')
    } catch (err) {
      console.error('Erro ao entrar em modo desenvolvedor:', err)
      setError('Erro ao acessar modo desenvolvedor. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={enterAdminMode}
        disabled={isLoading}
        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg border border-purple-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '⏳ Entrando...' : '👑 Entrar como Administrador'}
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}

export default DemoModeButton