import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

const LoginDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    const info: any = {}

    try {
      // 1. Verificar variáveis de ambiente
      info.environment = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'NOT_SET',
        supabaseKeyExists: !!(import.meta.env.VITE_SUPABASE_ANON_KEY),
        nodeEnv: import.meta.env.NODE_ENV || 'production',
        mode: import.meta.env.MODE || 'production'
      }

      // 2. Testar conexão Supabase
      try {
        const { data } = await supabase.auth.getSession()
        info.supabaseConnection = {
          status: 'SUCCESS',
          hasSession: !!data.session,
          error: null
        }
      } catch (error: any) {
        info.supabaseConnection = {
          status: 'ERROR',
          error: error?.message || 'Unknown error'
        }
      }

      // 3. Testar acesso à tabela users
      try {
        const { error } = await supabase
          .from('users')
          .select('count')
          .limit(1)
        
        info.databaseAccess = {
          status: error ? 'ERROR' : 'SUCCESS',
          error: error?.message || null,
          canAccessUsers: !error
        }
      } catch (error: any) {
        info.databaseAccess = {
          status: 'ERROR',
          error: error?.message || 'Unknown error'
        }
      }

      // 4. Testar login com credenciais demo
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@example.com',
          password: '123456'
        })
        
        info.demoLogin = {
          status: error ? 'ERROR' : 'SUCCESS',
          error: error?.message || null,
          userExists: !!data.user
        }

        // Fazer logout se o login funcionou
        if (data.user) {
          await supabase.auth.signOut()
        }
      } catch (error: any) {
        info.demoLogin = {
          status: 'ERROR',
          error: error?.message || 'Unknown error'
        }
      }

      // 5. Verificar localStorage
      info.localStorage = {
        hasSupabaseSession: !!localStorage.getItem('sb-oywdjirdotwdsixpxiox-auth-token'),
        hasAppStore: !!localStorage.getItem('app-store'),
        keys: Object.keys(localStorage).filter(key => 
          key.includes('supabase') || key.includes('app') || key.includes('auth')
        )
      }

      setDebugInfo(info)
    } catch (error: any) {
      setDebugInfo({
        error: 'Failed to run diagnostics',
        details: error?.message || 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={runDiagnostics}
        disabled={isLoading}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
      >
        {isLoading ? 'Diagnosticando...' : '🔍 Debug Login'}
      </button>

      {debugInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Diagnóstico de Login</h3>
              <button
                onClick={() => setDebugInfo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold">Ações Recomendadas:</h4>
              <ul className="text-sm space-y-1">
                {debugInfo.environment?.supabaseUrl === 'NOT_SET' && (
                  <li className="text-red-600">❌ Configurar VITE_SUPABASE_URL no Vercel</li>
                )}
                {!debugInfo.environment?.supabaseKeyExists && (
                  <li className="text-red-600">❌ Configurar VITE_SUPABASE_ANON_KEY no Vercel</li>
                )}
                {debugInfo.supabaseConnection?.status === 'ERROR' && (
                  <li className="text-red-600">❌ Verificar conexão com Supabase</li>
                )}
                {debugInfo.databaseAccess?.status === 'ERROR' && (
                  <li className="text-red-600">❌ Verificar permissões da tabela users</li>
                )}
                {debugInfo.demoLogin?.status === 'ERROR' && (
                  <li className="text-red-600">❌ Criar usuário demo no banco</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginDebug