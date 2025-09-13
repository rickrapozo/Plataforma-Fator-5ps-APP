import React, { useState, useEffect } from 'react'
import { Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { useTokenExpiration } from '../hooks/useTokenExpiration'
import { TokenStats, TokenInfo } from '../services/tokenExpirationService'
import { loggerService } from '../services/loggerService'
import { useToast } from '../hooks/useToast'
import { supabase } from '../lib/supabase'

interface TokenMonitorProps {
  className?: string
  showDetails?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

interface TokenDisplayInfo {
  id: string
  info: TokenInfo
  status: {
    exists: boolean
    expired: boolean
    expiringSoon: boolean
    timeUntilExpiration?: number
  }
}

const TokenMonitor: React.FC<TokenMonitorProps> = ({
  className = '',
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const {
    stats,
    getAllTokens,
    getTokenStatus,
    checkExpirations,
    registerToken,
    unregisterToken
  } = useTokenExpiration()
  
  const { toast } = useToast()
  const [tokens, setTokens] = useState<TokenDisplayInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showTokenValues, setShowTokenValues] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'expired' | 'expiring' | 'healthy'>('all')

  // Carregar tokens
  const loadTokens = async () => {
    try {
      setIsLoading(true)
      const allTokens = getAllTokens()
      
      const tokensWithStatus = allTokens.map(({ id, info }) => ({
        id,
        info,
        status: getTokenStatus(id)
      }))
      
      setTokens(tokensWithStatus)
    } catch (error) {
      loggerService.error('Failed to load tokens', { error })
      toast({
        title: 'Erro',
        description: 'Falha ao carregar tokens',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Auto refresh
  useEffect(() => {
    loadTokens()
    
    if (autoRefresh) {
      const interval = setInterval(loadTokens, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  // Verificar expirações manualmente
  const handleCheckExpirations = async () => {
    try {
      setIsLoading(true)
      await checkExpirations()
      await loadTokens()
      
      toast({
        title: 'Sucesso',
        description: 'Verificação de expiração concluída',
        variant: 'default'
      })
    } catch (error) {
      loggerService.error('Failed to check expirations', { error })
      toast({
        title: 'Erro',
        description: 'Falha ao verificar expirações',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Remover token
  const handleRemoveToken = (tokenId: string) => {
    try {
      unregisterToken(tokenId)
      loadTokens()
      
      toast({
        title: 'Sucesso',
        description: 'Token removido do monitoramento',
        variant: 'default'
      })
    } catch (error) {
      loggerService.error('Failed to remove token', { tokenId, error })
      toast({
        title: 'Erro',
        description: 'Falha ao remover token',
        variant: 'destructive'
      })
    }
  }

  // Filtrar tokens
  const filteredTokens = tokens.filter(token => {
    switch (filter) {
      case 'expired':
        return token.status.expired
      case 'expiring':
        return token.status.expiringSoon && !token.status.expired
      case 'healthy':
        return !token.status.expired && !token.status.expiringSoon
      default:
        return true
    }
  })

  // Formatar tempo até expiração
  const formatTimeUntilExpiration = (timeMs?: number): string => {
    if (!timeMs || timeMs <= 0) return 'Expirado'
    
    const minutes = Math.floor(timeMs / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  // Obter cor do status
  const getStatusColor = (token: TokenDisplayInfo): string => {
    if (token.status.expired) return 'text-red-500'
    if (token.status.expiringSoon) return 'text-yellow-500'
    return 'text-green-500'
  }

  // Obter ícone do status
  const getStatusIcon = (token: TokenDisplayInfo) => {
    if (token.status.expired) return <XCircle className="w-4 h-4" />
    if (token.status.expiringSoon) return <AlertTriangle className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Monitor de Tokens
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTokenValues(!showTokenValues)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title={showTokenValues ? 'Ocultar valores' : 'Mostrar valores'}
          >
            {showTokenValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleCheckExpirations}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Verificar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.totalTokens}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</div>
          <div className="text-sm text-gray-600">Expirando</div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          <div className="text-sm text-gray-600">Expirados</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{stats.refreshed}</div>
          <div className="text-sm text-gray-600">Renovados</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'healthy', label: 'Saudáveis' },
          { key: 'expiring', label: 'Expirando' },
          { key: 'expired', label: 'Expirados' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lista de tokens */}
      {showDetails && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Carregando tokens...</span>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === 'all' ? 'Nenhum token monitorado' : `Nenhum token ${filter}`}
            </div>
          ) : (
            filteredTokens.map((token) => (
              <div
                key={token.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={getStatusColor(token)}>
                      {getStatusIcon(token)}
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900">
                        {token.id}
                      </div>
                      <div className="text-sm text-gray-600">
                        Tipo: {token.info.type}
                        {token.info.userId && ` • Usuário: ${token.info.userId}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getStatusColor(token)}`}>
                        {formatTimeUntilExpiration(token.status.timeUntilExpiration)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Expira: {token.info.expiresAt.toLocaleString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveToken(token.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                      title="Remover do monitoramento"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Detalhes expandidos */}
                {selectedToken === token.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Token:</span>
                        <div className="mt-1 font-mono text-xs bg-gray-100 p-2 rounded">
                          {showTokenValues 
                            ? token.info.token 
                            : '••••••••••••••••••••••••••••••••'
                          }
                        </div>
                      </div>
                      
                      {token.info.metadata && (
                        <div>
                          <span className="font-medium text-gray-700">Metadados:</span>
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(token.info.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Toggle detalhes */}
                <button
                  onClick={() => setSelectedToken(
                    selectedToken === token.id ? null : token.id
                  )}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  {selectedToken === token.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Última verificação */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        Última verificação: {stats.lastCheck.toLocaleString()}
        {autoRefresh && (
          <span className="ml-2">
            • Auto-refresh: {refreshInterval / 1000}s
          </span>
        )}
      </div>
    </div>
  )
}

export default TokenMonitor

// Componente compacto para dashboard
export const TokenMonitorCompact: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { stats } = useTokenExpiration()
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">Tokens</span>
        </div>
        
        <div className="flex items-center gap-2">
          {stats.expired > 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <XCircle className="w-3 h-3" />
              <span className="text-xs font-medium">{stats.expired}</span>
            </div>
          )}
          
          {stats.expiringSoon > 0 && (
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs font-medium">{stats.expiringSoon}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-gray-600">
            <CheckCircle className="w-3 h-3" />
            <span className="text-xs font-medium">{stats.totalTokens}</span>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Última verificação: {stats.lastCheck.toLocaleTimeString()}
      </div>
    </div>
  )
}

// Hook para integração fácil
export const useTokenMonitorIntegration = () => {
  const { registerToken, unregisterToken, getTokenStatus } = useTokenExpiration()
  
  // Registrar token de sessão automaticamente
  useEffect(() => {
    const registerSessionToken = async () => {
      try {
        // Obter token da sessão atual do Supabase
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.access_token) {
          registerToken('current_session', {
            token: session.access_token,
            type: 'access',
            expiresAt: new Date(session.expires_at! * 1000),
            userId: session.user.id,
            metadata: {
              provider: session.user.app_metadata.provider,
              role: session.user.role
            }
          })
        }
      } catch (error) {
        loggerService.error('Failed to register session token', { error })
      }
    }
    
    registerSessionToken()
    
    // Cleanup ao desmontar
    return () => {
      unregisterToken('current_session')
    }
  }, [])
  
  return {
    registerToken,
    unregisterToken,
    getTokenStatus
  }
}