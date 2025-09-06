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
      // Usar as credenciais demo válidas
      await login('admin@example.com', '123456')
      
      // Navegar para dashboard após login bem-sucedido
      navigate('/app/dashboard')
    } catch (err) {
      console.error('Erro no login demo:', err)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full mt-4">
      <button
        onClick={enterAdminMode}
        disabled={isLoading}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg border border-purple-400/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Entrando...</span>
          </>
        ) : (
          <>
            <span>👑</span>
            <span>Entrar como Administrador</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  )
}

export default DemoModeButton