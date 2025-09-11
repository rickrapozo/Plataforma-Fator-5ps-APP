import { useState, useEffect, useCallback } from 'react'
import { rateLimitService, RateLimitConfigs, RateLimitUtils } from '../services/rateLimitService'
import { useAppStore } from '../stores/useAppStore'
import { toast } from 'react-hot-toast'

interface UseRateLimitOptions {
  endpoint?: string
  config?: typeof RateLimitConfigs.api
  onLimitExceeded?: (resetTime: number) => void
  showToast?: boolean
}

interface RateLimitState {
  isAllowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
  isLoading: boolean
}

/**
 * Hook para controle de rate limiting em componentes React
 */
export function useRateLimit(options: UseRateLimitOptions = {}) {
  const { user } = useAppStore()
  const {
    endpoint = 'general',
    config = RateLimitConfigs.api,
    onLimitExceeded,
    showToast = true
  } = options

  const [state, setState] = useState<RateLimitState>({
    isAllowed: true,
    remaining: config.maxRequests,
    resetTime: Date.now() + config.windowMs,
    totalHits: 0,
    isLoading: false
  })

  // Gerar identificador único baseado no usuário ou IP
  const getIdentifier = useCallback(() => {
    if (user?.id) {
      return RateLimitUtils.userKey(user.id)
    }
    // Fallback para identificador baseado em sessão
    let sessionId = localStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('session_id', sessionId)
    }
    return `session:${sessionId}`
  }, [user?.id])

  // Verificar limite
  const checkLimit = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const identifier = RateLimitUtils.endpointKey(endpoint, getIdentifier())
      const result = await rateLimitService.checkLimit(identifier, config)
      
      setState({
        isAllowed: result.allowed,
        remaining: result.remaining,
        resetTime: result.resetTime,
        totalHits: result.totalHits,
        isLoading: false
      })

      // Callback quando limite é excedido
      if (!result.allowed && onLimitExceeded) {
        onLimitExceeded(result.resetTime)
      }

      // Toast de aviso
      if (!result.allowed && showToast) {
        const resetDate = new Date(result.resetTime)
        const resetIn = Math.ceil((result.resetTime - Date.now()) / 1000 / 60)
        
        toast.error(
          `Limite de requisições excedido. Tente novamente em ${resetIn} minutos.`,
          {
            duration: 5000,
            id: `rate-limit-${endpoint}`
          }
        )
      }

      // Toast de aviso quando restam poucas requisições
      if (result.allowed && result.remaining <= 5 && result.remaining > 0 && showToast) {
        toast(
          `Restam apenas ${result.remaining} requisições nesta sessão.`,
          {
            duration: 3000,
            id: `rate-limit-warning-${endpoint}`
          }
        )
      }

      return result
    } catch (error) {
      console.error('Erro ao verificar rate limit:', error)
      
      // Em caso de erro, permite a requisição
      setState({
        isAllowed: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        totalHits: 0,
        isLoading: false
      })

      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        totalHits: 0
      }
    }
  }, [endpoint, getIdentifier, config, onLimitExceeded, showToast])

  // Resetar limite
  const resetLimit = useCallback(async () => {
    try {
      const identifier = RateLimitUtils.endpointKey(endpoint, getIdentifier())
      await rateLimitService.resetLimit(identifier)
      
      setState({
        isAllowed: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        totalHits: 0,
        isLoading: false
      })

      if (showToast) {
        toast.success('Limite resetado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao resetar rate limit:', error)
      if (showToast) {
        toast.error('Erro ao resetar limite')
      }
    }
  }, [endpoint, getIdentifier, config, showToast])

  // Executar ação com verificação de rate limit
  const executeWithLimit = useCallback(async <T>(
    action: () => Promise<T>,
    skipCheck = false
  ): Promise<T | null> => {
    if (!skipCheck) {
      const result = await checkLimit()
      if (!result.allowed) {
        return null
      }
    }

    try {
      return await action()
    } catch (error) {
      console.error('Erro na execução da ação:', error)
      throw error
    }
  }, [checkLimit])

  // Verificar limite automaticamente ao montar o componente
  useEffect(() => {
    checkLimit()
  }, [checkLimit])

  // Utilitários para formatação
  const formatResetTime = useCallback(() => {
    const now = Date.now()
    const diff = state.resetTime - now
    
    if (diff <= 0) return 'Agora'
    
    const minutes = Math.floor(diff / 1000 / 60)
    const seconds = Math.floor((diff / 1000) % 60)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }, [state.resetTime])

  const getProgressPercentage = useCallback(() => {
    return ((config.maxRequests - state.remaining) / config.maxRequests) * 100
  }, [config.maxRequests, state.remaining])

  return {
    // Estado
    ...state,
    
    // Ações
    checkLimit,
    resetLimit,
    executeWithLimit,
    
    // Utilitários
    formatResetTime,
    getProgressPercentage,
    
    // Configuração
    config,
    endpoint
  }
}

/**
 * Hook específico para rate limiting de autenticação
 */
export function useAuthRateLimit() {
  return useRateLimit({
    endpoint: 'auth',
    config: RateLimitConfigs.auth,
    showToast: true
  })
}

/**
 * Hook específico para rate limiting de IA
 */
export function useAIRateLimit() {
  return useRateLimit({
    endpoint: 'ai',
    config: RateLimitConfigs.ai,
    showToast: true
  })
}

/**
 * Hook específico para rate limiting de upload
 */
export function useUploadRateLimit() {
  return useRateLimit({
    endpoint: 'upload',
    config: RateLimitConfigs.upload,
    showToast: true
  })
}

/**
 * Hook específico para rate limiting de webhooks
 */
export function useWebhookRateLimit() {
  return useRateLimit({
    endpoint: 'webhook',
    config: RateLimitConfigs.webhook,
    showToast: false // Webhooks não devem mostrar toast
  })
}

/**
 * Hook para operações que requerem rate limiting estrito
 */
export function useStrictRateLimit() {
  return useRateLimit({
    endpoint: 'strict',
    config: RateLimitConfigs.strict,
    showToast: true,
    onLimitExceeded: (resetTime) => {
      console.warn('Rate limit estrito excedido:', new Date(resetTime))
    }
  })
}