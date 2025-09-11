import { securityService } from '../services/securityService'
import { User } from '../stores/useAppStore'

interface AuthContext {
  user: User | null
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
  isAdmin: () => boolean
  canAccessRoute: (route: string) => boolean
}

interface AuthMiddlewareOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  requiredPermissions?: string[]
  allowedRoles?: string[]
  rateLimitKey?: string
}

class AuthMiddleware {
  // Validar autenticação e permissões
  async validateAccess(
    user: User | null,
    options: AuthMiddlewareOptions = {}
  ): Promise<{ allowed: boolean; reason?: string; context: AuthContext }> {
    const context: AuthContext = {
      user,
      isAuthenticated: !!user,
      hasPermission: (permission: string) => securityService.hasPermission(user, permission),
      isAdmin: () => securityService.isAdmin(user),
      canAccessRoute: (route: string) => securityService.canAccessAdminRoute(user, route)
    }

    // Verificar rate limiting se especificado
    if (options.rateLimitKey) {
      const rateLimitAllowed = securityService.checkRateLimit(options.rateLimitKey)
      if (!rateLimitAllowed) {
        if (user) {
          await securityService.logSecurityEvent(
            user.id,
            'rate_limit_exceeded',
            { rateLimitKey: options.rateLimitKey }
          )
        }
        return {
          allowed: false,
          reason: 'Rate limit exceeded',
          context
        }
      }
    }

    // Verificar se autenticação é obrigatória
    if (options.requireAuth && !user) {
      return {
        allowed: false,
        reason: 'Authentication required',
        context
      }
    }

    // Verificar se é necessário ser admin
    if (options.requireAdmin && !securityService.isAdmin(user)) {
      if (user) {
        await securityService.logSecurityEvent(
          user.id,
          'unauthorized_access',
          { reason: 'admin_required', attemptedAction: 'admin_access' }
        )
      }
      return {
        allowed: false,
        reason: 'Admin access required',
        context
      }
    }

    // Verificar permissões específicas
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const hasAllPermissions = options.requiredPermissions.every(permission =>
        securityService.hasPermission(user, permission)
      )
      
      if (!hasAllPermissions) {
        if (user) {
          await securityService.logSecurityEvent(
            user.id,
            'unauthorized_access',
            { 
              reason: 'insufficient_permissions',
              requiredPermissions: options.requiredPermissions,
              userPermissions: user?.permissions || []
            }
          )
        }
        return {
          allowed: false,
          reason: 'Insufficient permissions',
          context
        }
      }
    }

    // Verificar roles permitidos
    if (options.allowedRoles && options.allowedRoles.length > 0) {
      const hasAllowedRole = options.allowedRoles.includes(user?.role || '')
      
      if (!hasAllowedRole) {
        if (user) {
          await securityService.logSecurityEvent(
            user.id,
            'unauthorized_access',
            { 
              reason: 'invalid_role',
              allowedRoles: options.allowedRoles,
              userRole: user?.role
            }
          )
        }
        return {
          allowed: false,
          reason: 'Invalid role for this action',
          context
        }
      }
    }

    // Verificar atividade suspeita
    if (user) {
      const isSuspicious = await securityService.detectSuspiciousActivity(user.id)
      if (isSuspicious) {
        return {
          allowed: false,
          reason: 'Suspicious activity detected',
          context
        }
      }
    }

    return {
      allowed: true,
      context
    }
  }

  // Middleware para validação de sessão
  async validateSession(userId: string): Promise<{ valid: boolean; user?: User; reason?: string }> {
    try {
      const sessionResult = await securityService.validateSession(userId)
      
      if (!sessionResult.isValid) {
        return {
          valid: false,
          reason: 'Invalid or expired session'
        }
      }

      return {
        valid: true,
        user: sessionResult.user
      }
    } catch (error) {
      console.error('Erro na validação de sessão:', error)
      return {
        valid: false,
        reason: 'Session validation error'
      }
    }
  }

  // Middleware para validação de entrada
  validateInput(data: Record<string, any>): { valid: boolean; sanitized: Record<string, any>; errors: string[] } {
    const errors: string[] = []
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Sanitizar strings
        sanitized[key] = securityService.sanitizeInput(value)
        
        // Validar email se o campo contém 'email'
        if (key.toLowerCase().includes('email') && !securityService.isValidEmail(value)) {
          errors.push(`Invalid email format for field: ${key}`)
        }
      } else {
        sanitized[key] = value
      }
    }

    return {
      valid: errors.length === 0,
      sanitized,
      errors
    }
  }

  // Middleware para validação de senha
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    return securityService.validatePasswordStrength(password)
  }

  // Middleware para logging de ações
  async logUserAction(
    userId: string,
    action: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      await securityService.logSecurityEvent(
        userId,
        'login_attempt', // Usar um tipo mais genérico ou expandir os tipos
        {
          action,
          ...details,
          timestamp: new Date().toISOString()
        }
      )
    } catch (error) {
      console.error('Erro ao registrar ação do usuário:', error)
    }
  }

  // Middleware para verificação de CSRF
  validateCSRF(token: string, expectedToken: string): boolean {
    return securityService.validateCSRFToken(token, expectedToken)
  }

  // Middleware para verificação de integridade de dados
  verifyDataIntegrity(data: any, expectedHash?: string): boolean {
    return securityService.verifyDataIntegrity(data, expectedHash)
  }

  // Criar contexto de autenticação
  createAuthContext(user: User | null): AuthContext {
    return {
      user,
      isAuthenticated: !!user,
      hasPermission: (permission: string) => securityService.hasPermission(user, permission),
      isAdmin: () => securityService.isAdmin(user),
      canAccessRoute: (route: string) => securityService.canAccessAdminRoute(user, route)
    }
  }

  // Middleware para rotas administrativas
  async validateAdminAccess(
    user: User | null,
    route: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (!user) {
      return {
        allowed: false,
        reason: 'Authentication required'
      }
    }

    if (!securityService.canAccessAdminRoute(user, route)) {
      await securityService.logSecurityEvent(
        user.id,
        'unauthorized_access',
        { 
          reason: 'admin_route_access_denied',
          route,
          userRole: user.role
        }
      )
      
      return {
        allowed: false,
        reason: 'Insufficient privileges for admin route'
      }
    }

    return { allowed: true }
  }

  // Middleware para verificação de 2FA
  async requireTwoFactor(userId: string): Promise<{ required: boolean; enabled: boolean }> {
    try {
      const enabled = await securityService.isTwoFactorEnabled(userId)
      const config = securityService.getSecurityConfig()
      
      return {
        required: config.twoFactorEnabled,
        enabled
      }
    } catch (error) {
      console.error('Erro ao verificar 2FA:', error)
      return {
        required: false,
        enabled: false
      }
    }
  }
}

export const authMiddleware = new AuthMiddleware()
export type { AuthContext, AuthMiddlewareOptions }