import { useState, useEffect, useCallback } from 'react'
import { tokenExpirationService, TokenStats, TokenInfo } from '../services/tokenExpirationService'
import { loggerService } from '../services/loggerService'

export interface UseTokenExpirationReturn {
  stats: TokenStats
  getAllTokens: () => Array<{ id: string; info: TokenInfo }>
  getTokenStatus: (id: string) => {
    exists: boolean
    expired: boolean
    expiringSoon: boolean
    timeUntilExpiration?: number
  }
  checkExpirations: () => Promise<void>
  registerToken: (id: string, tokenInfo: TokenInfo) => void
  unregisterToken: (id: string) => void
  isLoading: boolean
}

export const useTokenExpiration = (): UseTokenExpirationReturn => {
  const [stats, setStats] = useState<TokenStats>({
    totalTokens: 0,
    expiringSoon: 0,
    expired: 0,
    refreshed: 0,
    failed: 0,
    lastCheck: new Date()
  })
  const [isLoading, setIsLoading] = useState(false)

  // Atualizar stats quando o serviço notificar mudanças
  useEffect(() => {
    const updateStats = (newStats: TokenStats) => {
      setStats(newStats)
    }

    // Registrar listener
    const removeListener = tokenExpirationService.addStatsListener(updateStats)
    
    // Obter stats iniciais
    setStats(tokenExpirationService.getStats())
    
    // Iniciar monitoramento
    tokenExpirationService.startMonitoring()

    return () => {
      removeListener()
    }
  }, [])

  const getAllTokens = useCallback(() => {
    return tokenExpirationService.getAllTokens()
  }, [])

  const getTokenStatus = useCallback((id: string) => {
    return tokenExpirationService.getTokenStatus(id)
  }, [])

  const checkExpirations = useCallback(async () => {
    setIsLoading(true)
    try {
      await tokenExpirationService.checkTokenExpirations()
    } catch (error) {
      loggerService.error('Failed to check token expirations', { error })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const registerToken = useCallback((id: string, tokenInfo: TokenInfo) => {
    tokenExpirationService.registerToken(id, tokenInfo)
  }, [])

  const unregisterToken = useCallback((id: string) => {
    tokenExpirationService.unregisterToken(id)
  }, [])

  return {
    stats,
    getAllTokens,
    getTokenStatus,
    checkExpirations,
    registerToken,
    unregisterToken,
    isLoading
  }
}

export default useTokenExpiration