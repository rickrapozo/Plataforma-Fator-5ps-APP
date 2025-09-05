import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AuthService } from '../../services/authService'

const SupabaseDebug: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testando...')
  const [authStatus, setAuthStatus] = useState<string>('Verificando...')
  const [testLoginResult, setTestLoginResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    testConnection()
    checkAuthStatus()
  }, [])

  const testConnection = async () => {
    try {
      const { error } = await supabase.from('user_profiles').select('count').limit(1)
      
      if (error) {
        setConnectionStatus(`❌ Erro de conexão: ${error.message}`)
      } else {
        setConnectionStatus('✅ Conexão com Supabase OK')
      }
    } catch (error: any) {
      setConnectionStatus(`❌ Erro: ${error.message}`)
    }
  }

  const checkAuthStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setAuthStatus(`❌ Erro de auth: ${error.message}`)
      } else if (session) {
        setAuthStatus(`✅ Usuário logado: ${session.user.email}`)
      } else {
        setAuthStatus('ℹ️ Nenhum usuário logado')
      }
    } catch (error: any) {
      setAuthStatus(`❌ Erro: ${error.message}`)
    }
  }

  const testLogin = async () => {
    setIsLoading(true)
    setTestLoginResult('Testando login...')
    
    try {
      const result = await AuthService.login({
        email: 'rickrapozo@gmail.com',
        password: 'Rick@2290'
      })
      
      setTestLoginResult(`✅ Login bem-sucedido! Usuário: ${result.profile.name}`)
      setAuthStatus(`✅ Usuário logado: ${result.user.email}`)
    } catch (error: any) {
      console.error('Erro no teste de login:', error)
      setTestLoginResult(`❌ Erro no login: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testDevLogin = async () => {
    setIsLoading(true)
    setTestLoginResult('Testando login dev...')
    
    try {
      const result = await AuthService.login({
        email: 'dev.rickrapozo@gmail.com',
        password: 'Rick@2290'
      })
      
      setTestLoginResult(`✅ Login dev bem-sucedido! Usuário: ${result.profile.name}`)
      setAuthStatus(`✅ Usuário logado: ${result.user.email}`)
    } catch (error: any) {
      console.error('Erro no teste de login dev:', error)
      setTestLoginResult(`❌ Erro no login dev: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const createTestUser = async () => {
    setIsLoading(true)
    setTestLoginResult('Criando usuário de desenvolvimento...')
    
    try {
      // Criar usuário de desenvolvimento com email diferente
      const devEmail = 'dev.rickrapozo@gmail.com'
      const { error: signUpError } = await supabase.auth.signUp({
        email: devEmail,
        password: 'Rick@2290',
        options: {
          data: {
            name: 'Rick Rapozo (Dev)'
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setTestLoginResult('ℹ️ Usuário de desenvolvimento já existe. Tente fazer login.')
        } else {
          setTestLoginResult(`❌ Erro ao criar usuário: ${signUpError.message}`)
        }
        return
      }

      setTestLoginResult(`✅ Usuário de desenvolvimento criado! Email: ${devEmail}`)
      console.log('📧 Verifique o email para confirmação ou use o login direto se a confirmação estiver desabilitada')
      
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error)
      setTestLoginResult(`❌ Erro ao criar usuário: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
      setAuthStatus('ℹ️ Usuário deslogado')
      setTestLoginResult('')
    } catch (error: any) {
      console.error('Erro no logout:', error)
    }
  }

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md z-50">
      <h3 className="font-bold text-lg mb-4">Debug Supabase</h3>
      
      <div className="space-y-3">
        <div>
          <strong>Conexão:</strong>
          <div className="text-sm">{connectionStatus}</div>
        </div>
        
        <div>
          <strong>Auth Status:</strong>
          <div className="text-sm">{authStatus}</div>
        </div>
        
        {testLoginResult && (
          <div>
            <strong>Teste Login:</strong>
            <div className="text-sm">{testLoginResult}</div>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <button
            onClick={testLogin}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Testando...' : 'Login Original'}
          </button>
          
          <button
            onClick={testDevLogin}
            disabled={isLoading}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
          >
            Login Dev
          </button>
          
          <button
            onClick={createTestUser}
            disabled={isLoading}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            Criar Usuário Dev
          </button>
          
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Logout
          </button>
          
          <button
            onClick={() => {
              testConnection()
              checkAuthStatus()
            }}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Atualizar Status
          </button>
        </div>
      </div>
    </div>
  )
}

export default SupabaseDebug