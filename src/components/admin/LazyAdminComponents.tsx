import React, { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

// Lazy load admin components for better performance
export const LazyRealtimeMetricsPage = lazy(() => import('../../pages/admin/RealtimeMetricsPage'))
export const LazyUserManagementPage = lazy(() => import('../../pages/admin/UserManagementPage'))
export const LazyContentManagementPage = lazy(() => import('../../pages/admin/ContentManagementPage'))
export const LazySystemSettingsPage = lazy(() => import('../../pages/admin/SystemSettingsPage'))
export const LazyPerformanceAnalysisPage = lazy(() => import('../../pages/admin/PerformanceAnalysisPage'))
export const LazyAnalyticsPage = lazy(() => import('../../pages/admin/AnalyticsPage'))
export const LazyWebhookTestPage = lazy(() => import('../../pages/admin/WebhookTestPage'))

// Loading component for admin pages
const AdminPageLoader: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-deep-navy via-royal-purple to-midnight-blue flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="inline-block mb-4"
      >
        <Loader className="w-12 h-12 text-royal-gold" />
      </motion.div>
      <h3 className="text-xl font-semibold text-white mb-2">Carregando Painel</h3>
      <p className="text-pearl-white/60">Preparando interface administrativa...</p>
    </motion.div>
  </div>
)

// HOC for wrapping lazy components with suspense
export const withAdminSuspense = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <Suspense fallback={<AdminPageLoader />}>
      <Component {...props} />
    </Suspense>
  )
}

// Pre-wrapped components ready to use
export const RealtimeMetricsPageWithSuspense = withAdminSuspense(LazyRealtimeMetricsPage)
export const UserManagementPageWithSuspense = withAdminSuspense(LazyUserManagementPage)
export const ContentManagementPageWithSuspense = withAdminSuspense(LazyContentManagementPage)
export const SystemSettingsPageWithSuspense = withAdminSuspense(LazySystemSettingsPage)
export const AnalyticsPageWithSuspense = withAdminSuspense(LazyAnalyticsPage)
export const WebhookTestPageWithSuspense = withAdminSuspense(LazyWebhookTestPage)

export default AdminPageLoader