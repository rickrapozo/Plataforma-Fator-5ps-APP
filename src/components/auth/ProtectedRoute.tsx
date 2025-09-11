import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppStore } from '../../stores/useAppStore'
import { useSecureAuth } from '../../hooks/useSecureAuth'
import { analyticsService } from '../../services/analyticsService'
import LoadingScreen from '../shared/LoadingScreen'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOnboarding?: boolean
  requireAdmin?: boolean
  requiredPermissions?: string[]
  allowedRoles?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOnboarding = false,
  requireAdmin = false,
  requiredPermissions,
  allowedRoles
}) => {
  const { isAuthenticated, hasCompletedOnboarding, user } = useAppStore()
  const { 
    isLoading, 
    isAuthorized, 
    error, 
    logAction,
    isSessionValid 
  } = useSecureAuth({
    requireAuth: true,
    requireAdmin,
    requiredPermissions,
    allowedRoles,
    autoValidateSession: true,
    rateLimitKey: user?.id ? `user_${user.id}` : undefined
  })

  useEffect(() => {
    // Track page access attempt
    if (isAuthenticated && user) {
      analyticsService.trackPageView(
        window.location.pathname,
        user.id,
        user.role
      )
      
      // Log access attempt
      logAction('page_access', {
        path: window.location.pathname,
        requireOnboarding,
        requireAdmin,
        requiredPermissions,
        allowedRoles
      })
    }
  }, [isAuthenticated, user, logAction, requireOnboarding, requireAdmin, requiredPermissions, allowedRoles])

  // Aguardar carregamento - evitar redirecionamentos prematuros
  if (isLoading) {
    return <LoadingScreen />
  }

  // Verificar autenticação apenas se não estiver carregando
  if (!isLoading && (!isAuthenticated || !user)) {
    analyticsService.trackRedirect(
      window.location.pathname,
      '/login',
      'unauthenticated_access',
      user?.id,
      user?.role
    )
    return <Navigate to="/login" replace />
  }

  // Verificar validade da sessão apenas se não estiver carregando
  if (!isLoading && !isSessionValid && user) {
    analyticsService.trackRedirect(
      window.location.pathname,
      '/login',
      'invalid_session',
      user?.id,
      user?.role
    )
    return <Navigate to="/login" replace />
  }

  // Verificar autorização apenas se não estiver carregando
  if (!isLoading && user && !isAuthorized) {
    if (user) {
      analyticsService.trackRedirect(
        window.location.pathname,
        '/app/dashboard',
        'unauthorized_access',
        user.id,
        user.role
      )
    }
    return <Navigate to="/app/dashboard" replace />
  }

  // Verificar onboarding se necessário
  if (requireOnboarding && !hasCompletedOnboarding) {
    analyticsService.trackRedirect(
      window.location.pathname,
      '/onboarding/welcome',
      'incomplete_onboarding_protected_route',
      user?.id,
      user?.role
    )
    return <Navigate to="/onboarding/welcome" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute