import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './stores/useAppStore'
import { useAnalytics } from './hooks/useAnalytics'
import Layout from './components/shared/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingScreen from './components/shared/LoadingScreen'
import CookieConsentBanner from './components/shared/CookieConsentBanner'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Onboarding Pages
import WelcomePage from './pages/onboarding/WelcomePage'
import ResultsPage from './pages/onboarding/ResultsPage'
import CommitmentPage from './pages/onboarding/CommitmentPage'

// Quiz Pages
import WelcomeQuizPage from './pages/quiz/WelcomeQuizPage'
import QuizQuestionPage from './pages/quiz/QuizQuestionPage'
import QuizAnalysisPage from './pages/quiz/QuizAnalysisPage'
import QuizResultsPage from './pages/quiz/QuizResultsPage'

// Main App Pages
import DashboardPage from './pages/dashboard/DashboardPage'
import TherapistAIPage from './pages/therapist-ai/TherapistAIPage'
import JourneysPage from './pages/journeys/JourneysPage'
import JourneyDayPage from './pages/journeys/JourneyDayPage'
import MindVaultPage from './pages/mind-vault/MindVaultPage'
import AudioPlayerPage from './pages/mind-vault/AudioPlayerPage'
import LibraryPage from './pages/library/LibraryPage'
import ProfilePage from './pages/profile/ProfilePage'
import SubscriptionPage from './pages/subscription/SubscriptionPage'
import AdminPanelPage from './pages/admin/AdminPanelPage'
import PrivacySettingsPage from './pages/settings/PrivacySettingsPage'
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage'
// Lazy loaded admin components for better performance
import {
  LazyRealtimeMetricsPage,
  LazyUserManagementPage,
  LazyContentManagementPage,
  LazySystemSettingsPage,
  LazyAnalyticsPage,
  LazyWebhookTestPage,
  LazyPerformanceAnalysisPage
} from './components/admin/LazyAdminComponents'

function App() {
  const { isAuthenticated, hasCompletedOnboarding, loadUserData } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  
  // Rastreamento automático de analytics
  useAnalytics()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        await loadUserData()
      } catch (error) {
        console.error('Erro ao inicializar aplicação:', error)
      } finally {
        // Pequeno delay para evitar flash de conteúdo
        setTimeout(() => setIsLoading(false), 100)
      }
    }

    initializeApp()
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Onboarding Routes - Public Welcome Page */}
        <Route path="/onboarding/welcome" element={<WelcomePage />} />
        <Route path="/onboarding/results" element={
          <ProtectedRoute>
            <ResultsPage />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/commitment" element={
          <ProtectedRoute>
            <CommitmentPage />
          </ProtectedRoute>
        } />
        
        {/* Quiz Routes - Public (No Authentication Required) */}
        <Route path="/quiz/welcome" element={<WelcomeQuizPage />} />
        <Route path="/quiz/questions" element={<QuizQuestionPage />} />
        <Route path="/quiz/analysis" element={<QuizAnalysisPage />} />
        <Route path="/quiz/results" element={<QuizResultsPage />} />
        
        {/* Public Subscription Page */}
        <Route path="/subscription" element={<SubscriptionPage />} />
        
        {/* Legal Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        
        {/* Protected App Routes */}
        <Route path="/app" element={
          <ProtectedRoute requireOnboarding>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="therapist-ai" element={<TherapistAIPage />} />
          <Route path="journeys" element={<JourneysPage />} />
          <Route path="journeys/:journeyId/day/:dayNumber" element={<JourneyDayPage />} />
          <Route path="mind-vault" element={<MindVaultPage />} />
          <Route path="mind-vault/player/:audioId" element={<AudioPlayerPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="privacy-settings" element={<PrivacySettingsPage />} />
          <Route path="admin" element={<AdminPanelPage />} />
          <Route path="admin/analytics" element={<LazyAnalyticsPage />} />
          <Route path="admin/webhook-test" element={<LazyWebhookTestPage />} />
          <Route path="admin/realtime-metrics" element={<LazyRealtimeMetricsPage />} />
          <Route path="admin/users" element={<LazyUserManagementPage />} />
          <Route path="admin/content" element={<LazyContentManagementPage />} />
          <Route path="admin/settings" element={<LazySystemSettingsPage />} />
          <Route path="admin/performance" element={<LazyPerformanceAnalysisPage />} />
        </Route>
        
        {/* Redirect logic */}
        <Route path="/" element={
          isAuthenticated 
            ? hasCompletedOnboarding 
              ? <Navigate to="/app/dashboard" replace />
              : <Navigate to="/onboarding/welcome" replace />
            : <Navigate to="/onboarding/welcome" replace />
        } />
        <Route path="*" element={<Navigate to="/onboarding/welcome" replace />} />
      </Routes>
      
      {/* Banner de consentimento de cookies - LGPD */}
      <CookieConsentBanner />
    </div>
  )
}

export default App