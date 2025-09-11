import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, User } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { analyticsService } from '../../services/analyticsService'
import Logo from './Logo'
import HamburgerMenu from './HamburgerMenu'

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
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 safe-area-top">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <HamburgerMenu />
        </div>
        <div className="flex-1 flex justify-center">
          <Logo />
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          {/* Streak Counter */}
          <motion.div 
            className="flex items-center space-x-1 sm:space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-base sm:text-lg">🔥</span>
            <span className="text-white font-semibold text-xs sm:text-sm">{streak}</span>
          </motion.div>
          

          
          {/* Notifications */}
          <motion.button
            className="relative p-2 rounded-full bg-white/10 backdrop-blur-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            {notifications && (
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-royal-gold rounded-full" />
            )}
          </motion.button>
          
          {/* User Profile */}
          <motion.button
            className="w-7 h-7 sm:w-8 sm:h-8 bg-royal-gold rounded-full flex items-center justify-center min-w-[44px] min-h-[44px]"
            whileTap={{ scale: 0.95 }}
          >
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header