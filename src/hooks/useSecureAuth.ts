import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { authMiddleware, type AuthContext, type AuthMiddlewareOptions } from '../middleware/authMiddleware'
import { securityService } from '../services/securityService'
import { toast } from 'react-toastify'

// Sistema global para controlar mensagens de erro de sessão
let sessionErrorShown = false
let sessionErrorTimeout: NodeJS.Timeout | null = null

const showSessionError = () => {
  if (sessionErrorShown) return
  
  sessionErrorShown = true
  toast.error('Sua sessão expirou. Faça login novamente.')
  
  // Reset após 5 segundos para permitir nova mensagem se necessário
  if (sessionErrorTimeout) clearTimeout(sessionErrorTimeout)
  sessionErrorTimeout = setTimeout(() => {
    sessionErrorShown = false
  }, 5000)
}

interface UseSecureAuthOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  requiredPermissions?: string[]
  allowedRoles?: string[]
  autoValidateSession?: boolean
  rateLimitKey?: string
}

interface UseSecureAuthReturn {
  authContext: AuthContext
  isLoading: boolean
  isAuthorized: boolean
  error: string | null
  validateAccess: (options?: AuthMiddlewareOptions) => Promise<boolean>
  validateSession: () => Promise<boolean>
  logAction: (action: string, details?: Record<string, any>) => Promise<void>
  checkPermission: (permission: string) => boolean
  checkRole: (role: string) => boolean
  isSessionValid: boolean
}

export const useSecureAuth = (options: UseSecureAuthOptions = {}): UseSecureAuthReturn => {
  const { user, isAuthenticated } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSessionValid, setIsSessionValid] = useState(false)
  const initializingRef = useRef(false)

  // Criar contexto de autenticação
  const authContext = authMiddleware.createAuthContext(user)

  // Validar acesso com base nas opções fornecidas
  const validateAccess = useCallback(async (customOptions?: AuthMiddlewareOptions): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const validationOptions = { ...options, ...customOptions }
      const result = await authMiddleware.validateAccess(user, validationOptions)

      if (!result.allowed) {
        setError(result.reason || 'Access denied')
        setIsAuthorized(false)
        
        // Mostrar toast de erro se necessário
        if (result.reason) {
          toast.error(result.reason)
        }
        
        return false
      }

      setIsAuthorized(true)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation error'
      setError(errorMessage)
      setIsAuthorized(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user, options])

  // Validar sessão do usuário
  const validateSession = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      setIsSessionValid(false)
      return false
    }

    try {
      const result = await authMiddleware.validateSession(user.id)
      setIsSessionValid(result.valid)
      
      if (!result.valid) {
        setError(result.reason || 'Invalid session')
        showSessionError()
      }
      
      return result.valid
    } catch (err) {
      setIsSessionValid(false)
      setError('Session validation failed')
      return false
    }
  }, [user?.id])

  // Registrar ação do usuário
  const logAction = useCallback(async (action: string, details: Record<string, any> = {}): Promise<void> => {
    if (!user?.id) return

    try {
      await authMiddleware.logUserAction(user.id, action, details)
    } catch (err) {
      console.error('Erro ao registrar ação:', err)
    }
  }, [user?.id])

  // Verificar permissão específica
  const checkPermission = useCallback((permission: string): boolean => {
    return authContext.hasPermission(permission)
  }, [authContext])

  // Verificar role específico
  const checkRole = useCallback((role: string): boolean => {
    return user?.role === role
  }, [user?.role])

  // Validação automática na inicialização (apenas uma vez)
  useEffect(() => {
    const initializeAuth = async () => {
      // Evitar múltiplas inicializações simultâneas
      if (initializingRef.current) return
      
      initializingRef.current = true
      setIsLoading(true)

      try {
        // Validar sessão se habilitado
        if (options.autoValidateSession && user?.id) {
          const sessionValid = await validateSession()
          if (!sessionValid) {
            setIsLoading(false)
            return
          }
        }

        // Validar acesso
        await validateAccess()
      } finally {
        initializingRef.current = false
      }
    }

    initializeAuth()
  }, [user, options.autoValidateSession])

  // Validação periódica de sessão (apenas se autenticado e não em loading)
  useEffect(() => {
    if (!options.autoValidateSession || !user?.id || !isAuthenticated) return

    const interval = setInterval(async () => {
      // Só validar se não estiver carregando para evitar múltiplas validações
      if (!isLoading && user?.id && isAuthenticated) {
        await validateSession()
      }
    }, 30 * 60 * 1000) // Aumentado para 30 minutos

    return () => clearInterval(interval)
  }, [user?.id, isAuthenticated, options.autoValidateSession, isLoading])

  // Detectar atividade suspeita (reduzida frequência)
  useEffect(() => {
    if (!user?.id || isLoading) return

    const checkSuspiciousActivity = async () => {
      if (!user?.id || isLoading) return
      
      try {
        const isSuspicious = await securityService.detectSuspiciousActivity(user.id)
        if (isSuspicious) {
          setError('Atividade suspeita detectada. Sessão bloqueada por segurança.')
          setIsAuthorized(false)
          setIsSessionValid(false)
          toast.error('Atividade suspeita detectada. Sua sessão foi bloqueada.')
        }
      } catch (err) {
        console.error('Erro ao verificar atividade suspeita:', err)
      }
    }

    // Verificar atividade suspeita a cada 20 minutos
    const interval = setInterval(checkSuspiciousActivity, 20 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [user?.id, isLoading])

  return {
    authContext,
    isLoading,
    isAuthorized,
    error,
    validateAccess,
    validateSession,
    logAction,
    checkPermission,
    checkRole,
    isSessionValid
  }
}

// Hook específico para rotas administrativas
export const useAdminAuth = () => {
  return useSecureAuth({
    requireAuth: true,
    requireAdmin: true,
    autoValidateSession: true,
    rateLimitKey: 'admin_access'
  })
}

// Hook específico para validação de permissões
export const usePermissionAuth = (permissions: string[]) => {
  return useSecureAuth({
    requireAuth: true,
    requiredPermissions: permissions,
    autoValidateSession: true
  })
}

// Hook específico para validação de roles
export const useRoleAuth = (roles: string[]) => {
  return useSecureAuth({
    requireAuth: true,
    allowedRoles: roles,
    autoValidateSession: true
  })
}