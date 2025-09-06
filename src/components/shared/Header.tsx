import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, User, Crown } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { analyticsService } from '../../services/analyticsService'
import Logo from './Logo'

const Header: React.FC = () => {
  const { user, streak, notifications, isAdmin, hasCompletedOnboarding } = useAppStore()
  const navigate = useNavigate()

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-deep-forest to-forest-green backdrop-blur-lg border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between px-4 py-3 safe-area-top">
        <Logo />
        
        <div className="flex items-center space-x-4">
          {/* Streak Counter */}
          <motion.div 
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">🔥</span>
            <span className="text-white font-semibold text-sm">{streak}</span>
          </motion.div>
          
          {/* Admin Panel Link */}
          {isAdmin() && (
            <motion.button
              className="relative p-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 backdrop-blur-sm"
              whileTap={{ scale: 0.95 }}
              title="Painel Administrativo"
              onClick={() => {
                // Track admin panel button click
                analyticsService.trackButtonClick(
                  'admin_panel_button',
                  user?.id,
                  user?.role || 'admin',
                  {
                    hasCompletedOnboarding: hasCompletedOnboarding,
                    currentPage: window.location.pathname,
                    userAgent: navigator.userAgent
                  }
                )

                // Track admin panel access attempt
                analyticsService.trackAdminPanelAccess(
                  user?.id,
                  user?.role || 'admin',
                  true
                )

                // Check if user will be redirected to onboarding
                if (!hasCompletedOnboarding) {
                  analyticsService.trackRedirect(
                    window.location.pathname,
                    '/onboarding/welcome',
                    'incomplete_onboarding',
                    user?.id,
                    user?.role || 'admin'
                  )
                }

                // Navigate to admin panel
                navigate('/app/admin')
              }}
            >
              <Crown className="w-5 h-5 text-white" />
            </motion.button>
          )}
          
          {/* Notifications */}
          <motion.button
            className="relative p-2 rounded-full bg-white/10 backdrop-blur-sm"
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 text-white" />
            {notifications && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-royal-gold rounded-full" />
            )}
          </motion.button>
          
          {/* User Profile */}
          <motion.button
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full p-1 pr-3"
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-8 h-8 bg-royal-gold rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-sm font-medium">
              {user?.name?.split(' ')[0] || 'Usuário'}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header