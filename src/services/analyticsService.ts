import { privacyService } from './privacyService'

interface AnalyticsEvent {
  eventType: 'button_click' | 'page_view' | 'redirect' | 'user_interaction'
  eventName: string
  userId?: string
  userRole?: string
  timestamp: string
  metadata?: Record<string, any>
  source: string
  destination?: string
  sessionId: string
}

interface PageViewEvent {
  page: string
  userId?: string
  userRole?: string
  timestamp: string
  referrer?: string
  sessionId: string
  timeOnPage?: number
}

interface RedirectEvent {
  source: string
  destination: string
  reason: string
  userId?: string
  userRole?: string
  timestamp: string
  sessionId: string
}

class AnalyticsService {
  private sessionId: string
  private events: AnalyticsEvent[] = []
  private pageViews: PageViewEvent[] = []
  private redirects: RedirectEvent[] = []
  private pageStartTime: number = Date.now()

  constructor() {
    this.sessionId = this.generateSessionId()
    this.loadStoredData()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadStoredData(): void {
    try {
      const storedEvents = localStorage.getItem('analytics_events')
      const storedPageViews = localStorage.getItem('analytics_pageviews')
      const storedRedirects = localStorage.getItem('analytics_redirects')
      
      if (storedEvents) {
        this.events = JSON.parse(storedEvents)
      }
      if (storedPageViews) {
        this.pageViews = JSON.parse(storedPageViews)
      }
      if (storedRedirects) {
        this.redirects = JSON.parse(storedRedirects)
      }
    } catch (error) {
      console.warn('Failed to load stored analytics data:', error)
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-1000))) // Keep last 1000 events
      localStorage.setItem('analytics_pageviews', JSON.stringify(this.pageViews.slice(-500))) // Keep last 500 page views
      localStorage.setItem('analytics_redirects', JSON.stringify(this.redirects.slice(-200))) // Keep last 200 redirects
    } catch (error) {
      console.warn('Failed to save analytics data:', error)
    }
  }

  // Track button clicks
  async trackButtonClick(buttonName: string, userId?: string, userRole?: string, metadata?: Record<string, any>): Promise<void> {
    // Verificar consentimento antes de coletar dados
    if (userId) {
      const canCollect = await privacyService.canCollectAnalytics(userId)
      if (!canCollect) {
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Analytics - Button Click bloqueado: usuário não deu consentimento')
        }
        return
      }
    }

    const event: AnalyticsEvent = {
      eventType: 'button_click',
      eventName: buttonName,
      userId,
      userRole,
      timestamp: new Date().toISOString(),
      metadata,
      source: window.location.pathname,
      sessionId: this.sessionId
    }

    this.events.push(event)
    this.saveToStorage()
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics - Button Click:', event)
    }
  }

  // Track page views
  async trackPageView(page: string, userId?: string, userRole?: string, referrer?: string): Promise<void> {
    // Verificar consentimento antes de coletar dados
    if (userId) {
      const canCollect = await privacyService.canCollectAnalytics(userId)
      if (!canCollect) {
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Analytics - Page View bloqueado: usuário não deu consentimento')
        }
        return
      }
    }

    // Calculate time on previous page
    if (this.pageViews.length > 0) {
      const lastPageView = this.pageViews[this.pageViews.length - 1]
      lastPageView.timeOnPage = Date.now() - this.pageStartTime
    }

    const pageView: PageViewEvent = {
      page,
      userId,
      userRole,
      timestamp: new Date().toISOString(),
      referrer,
      sessionId: this.sessionId
    }

    this.pageViews.push(pageView)
    this.pageStartTime = Date.now()
    this.saveToStorage()

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics - Page View:', pageView)
    }
  }

  // Track redirects
  async trackRedirect(source: string, destination: string, reason: string, userId?: string, userRole?: string): Promise<void> {
    // Verificar consentimento antes de coletar dados
    if (userId) {
      const canCollect = await privacyService.canCollectAnalytics(userId)
      if (!canCollect) {
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Analytics - Redirect bloqueado: usuário não deu consentimento')
        }
        return
      }
    }

    const redirect: RedirectEvent = {
      source,
      destination,
      reason,
      userId,
      userRole,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    }

    this.redirects.push(redirect)
    this.saveToStorage()

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics - Redirect:', redirect)
    }
  }

  // Track admin panel access attempts
  async trackAdminPanelAccess(userId?: string, userRole?: string, hasAccess: boolean = true): Promise<void> {
    // Verificar consentimento antes de coletar dados
    if (userId) {
      const canCollect = await privacyService.canCollectAnalytics(userId)
      if (!canCollect) {
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Analytics - Admin Panel Access bloqueado: usuário não deu consentimento')
        }
        return
      }
    }

    const event: AnalyticsEvent = {
      eventType: 'user_interaction',
      eventName: 'admin_panel_access_attempt',
      userId,
      userRole,
      timestamp: new Date().toISOString(),
      metadata: {
        hasAccess,
        accessGranted: hasAccess
      },
      source: window.location.pathname,
      destination: hasAccess ? '/app/admin' : '/onboarding/welcome',
      sessionId: this.sessionId
    }

    this.events.push(event)
    this.saveToStorage()

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics - Admin Panel Access:', event)
    }
  }

  // Get analytics data for admin dashboard
  getAnalyticsData() {
    return {
      events: this.events,
      pageViews: this.pageViews,
      redirects: this.redirects,
      sessionId: this.sessionId
    }
  }

  // Get page view metrics
  getPageViewMetrics(): Record<string, any> {
    const pageStats: Record<string, any> = {}
    
    this.pageViews.forEach(view => {
      if (!pageStats[view.page]) {
        pageStats[view.page] = {
          views: 0,
          uniqueUsers: new Set(),
          totalTime: 0,
          bounces: 0
        }
      }
      
      pageStats[view.page].views++
      if (view.userId) {
        pageStats[view.page].uniqueUsers.add(view.userId)
      }
      if (view.timeOnPage) {
        pageStats[view.page].totalTime += view.timeOnPage
      }
      if (view.timeOnPage && view.timeOnPage < 5000) { // Less than 5 seconds = bounce
        pageStats[view.page].bounces++
      }
    })

    // Convert Sets to counts and calculate averages
    Object.keys(pageStats).forEach(page => {
      const stats = pageStats[page]
      stats.uniqueUsers = stats.uniqueUsers.size
      stats.avgTimeOnPage = stats.views > 0 ? stats.totalTime / stats.views : 0
      stats.bounceRate = stats.views > 0 ? (stats.bounces / stats.views) * 100 : 0
    })

    return pageStats
  }

  // Get redirect analytics
  getRedirectAnalytics(): Record<string, any> {
    const redirectStats: Record<string, any> = {}
    
    this.redirects.forEach(redirect => {
      const key = `${redirect.source} -> ${redirect.destination}`
      if (!redirectStats[key]) {
        redirectStats[key] = {
          count: 0,
          reasons: {},
          users: new Set()
        }
      }
      
      redirectStats[key].count++
      redirectStats[key].reasons[redirect.reason] = (redirectStats[key].reasons[redirect.reason] || 0) + 1
      if (redirect.userId) {
        redirectStats[key].users.add(redirect.userId)
      }
    })

    // Convert Sets to counts
    Object.keys(redirectStats).forEach(key => {
      redirectStats[key].uniqueUsers = redirectStats[key].users.size
      delete redirectStats[key].users
    })

    return redirectStats
  }

  // Clear analytics data (admin function)
  clearAnalyticsData(): void {
    this.events = []
    this.pageViews = []
    this.redirects = []
    localStorage.removeItem('analytics_events')
    localStorage.removeItem('analytics_pageviews')
    localStorage.removeItem('analytics_redirects')
    
    console.log('📊 Analytics data cleared')
  }

  // Export analytics data
  exportAnalyticsData(): string {
    const data = {
      events: this.events,
      pageViews: this.pageViews,
      redirects: this.redirects,
      exportedAt: new Date().toISOString(),
      sessionId: this.sessionId
    }
    
    return JSON.stringify(data, null, 2)
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService()

// Export types for use in other files
export type { AnalyticsEvent, PageViewEvent, RedirectEvent }