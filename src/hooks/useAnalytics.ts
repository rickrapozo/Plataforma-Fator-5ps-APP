import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { analyticsService } from '../services/analyticsService'
import { useAppStore } from '../stores/useAppStore'

/**
 * Hook personalizado para rastreamento automático de analytics
 * Rastreia visualizações de página, tempo na página e interações do usuário
 */
export const useAnalytics = () => {
  const location = useLocation()
  const { user } = useAppStore()
  const pageStartTime = useRef<number>(Date.now())
  const previousPath = useRef<string>('')

  useEffect(() => {
    // Rastrear mudança de página
    const currentPath = location.pathname
    const referrer = previousPath.current || document.referrer

    // Rastrear visualização da nova página
    analyticsService.trackPageView(
      currentPath,
      user?.id,
      user?.role,
      referrer
    )

    // Atualizar referências
    previousPath.current = currentPath
    pageStartTime.current = Date.now()

    // Cleanup: rastrear tempo na página quando o componente for desmontado
    return () => {
      const timeOnPage = Date.now() - pageStartTime.current
      if (timeOnPage > 1000) { // Só rastrear se ficou mais de 1 segundo
        analyticsService.trackPageView(
          currentPath,
          user?.id,
          user?.role,
          referrer
        )
      }
    }
  }, [location.pathname, user?.id, user?.role])

  // Funções utilitárias para rastreamento manual
  const trackEvent = (eventName: string, metadata?: Record<string, any>) => {
    analyticsService.trackButtonClick(
      eventName,
      user?.id,
      user?.role,
      {
        ...metadata,
        currentPage: location.pathname,
        timestamp: new Date().toISOString()
      }
    )
  }

  const trackButtonClick = (buttonName: string, metadata?: Record<string, any>) => {
    analyticsService.trackButtonClick(
      buttonName,
      user?.id,
      user?.role,
      {
        ...metadata,
        currentPage: location.pathname,
        userAgent: navigator.userAgent
      }
    )
  }

  const trackRedirect = (destination: string, reason: string, metadata?: Record<string, any>) => {
    analyticsService.trackRedirect(
      location.pathname,
      destination,
      reason,
      user?.id,
      user?.role
    )
  }

  const trackAdminAccess = (hasAccess: boolean = true) => {
    analyticsService.trackAdminPanelAccess(
      user?.id,
      user?.role,
      hasAccess
    )
  }

  return {
    trackEvent,
    trackButtonClick,
    trackRedirect,
    trackAdminAccess,
    analyticsService
  }
}

/**
 * Hook para rastreamento de performance de componentes
 */
export const useComponentAnalytics = (componentName: string) => {
  const mountTime = useRef<number>(Date.now())
  const { user } = useAppStore()
  const location = useLocation()

  useEffect(() => {
    // Rastrear montagem do componente
    analyticsService.trackButtonClick(
      `component_mount_${componentName}`,
      user?.id,
      user?.role,
      {
        componentName,
        currentPage: location.pathname,
        mountTime: new Date().toISOString()
      }
    )

    return () => {
      // Rastrear desmontagem e tempo de vida do componente
      const lifeTime = Date.now() - mountTime.current
      analyticsService.trackButtonClick(
        `component_unmount_${componentName}`,
        user?.id,
        user?.role,
        {
          componentName,
          currentPage: location.pathname,
          lifeTime,
          unmountTime: new Date().toISOString()
        }
      )
    }
  }, [componentName, user?.id, user?.role, location.pathname])

  const trackComponentEvent = (eventName: string, metadata?: Record<string, any>) => {
    analyticsService.trackButtonClick(
      `${componentName}_${eventName}`,
      user?.id,
      user?.role,
      {
        ...metadata,
        componentName,
        currentPage: location.pathname
      }
    )
  }

  return {
    trackComponentEvent
  }
}

/**
 * Hook para rastreamento de erros
 */
export const useErrorAnalytics = () => {
  const { user } = useAppStore()
  const location = useLocation()

  const trackError = (error: Error, errorInfo?: any) => {
    analyticsService.trackButtonClick(
      'application_error',
      user?.id,
      user?.role,
      {
        errorMessage: error.message,
        errorStack: error.stack,
        errorInfo,
        currentPage: location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    )
  }

  const trackApiError = (endpoint: string, status: number, message: string) => {
    analyticsService.trackButtonClick(
      'api_error',
      user?.id,
      user?.role,
      {
        endpoint,
        status,
        message,
        currentPage: location.pathname,
        timestamp: new Date().toISOString()
      }
    )
  }

  return {
    trackError,
    trackApiError
  }
}