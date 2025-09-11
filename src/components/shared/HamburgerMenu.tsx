import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Brain, 
  Map, 
  Headphones, 
  BookOpen,
  Users,
  Crown,
  Menu,
  X
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { getCapitalizedFullName, getCapitalizedFirstName } from '../../utils/nameUtils'

interface NavItem {
  icon: React.ElementType
  label: string
  route: string
  premium?: boolean
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', route: '/app/dashboard' },
  { icon: Brain, label: 'Terapeuta AI', route: '/app/therapist-ai', premium: true },
  { icon: Map, label: 'Jornadas', route: '/app/journeys' },
  { icon: Headphones, label: 'Cofre Mental', route: '/app/mind-vault' },
  { icon: Users, label: 'Comunidade', route: '/app/community' },
  { icon: BookOpen, label: 'Biblioteca', route: '/app/library' }
]

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, hasActivePlan } = useAppStore()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Hamburger Button - Only visible when menu is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'relative', zIndex: 9999, pointerEvents: 'auto' }}
          >
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleMenu()
              }}
              className="relative z-[60] p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 touch-manipulation cursor-pointer hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center shadow-lg"
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 9999 }}
              aria-label="Abrir menu de navegação"
              type="button"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white pointer-events-none" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* Menu Panel */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              duration: 0.4
            }}
            className="fixed top-0 left-0 h-full w-72 sm:w-80 max-w-[90vw] sm:max-w-[85vw] bg-[#0a1f23] border-r-2 border-royal-gold/30 z-[60] shadow-2xl rounded-r-2xl border-r-4 border-yellow-400 shadow-yellow-400/30"
            style={{ backgroundColor: '#0a1f23', boxShadow: '0 0 30px rgba(251, 191, 36, 0.3), inset 0 0 0 2px rgba(251, 191, 36, 0.2)' }}

          >
            {/* Header com botão X */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-royal-gold/20 bg-[#0a1f23]">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg sm:text-xl font-bold text-white"
              >
                Menu
              </motion.h2>
              
              <button
                onClick={toggleMenu}
                className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center group border border-yellow-400/30 hover:border-yellow-400/60 hover:scale-105 active:scale-95"
                aria-label="Fechar menu"
                type="button"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:text-red-300 transition-colors" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-4 sm:p-6 bg-[#0a1f23] flex-1 overflow-y-auto rounded-r-2xl">
              <div className="space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  const isPremium = item.premium
                  const isLocked = isPremium && !hasActivePlan

                  return (
                    <motion.div
                      key={item.route}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + (index * 0.05) }}
                    >
                      <NavLink
                        to={item.route}
                        onClick={toggleMenu}
                        className={({ isActive }) => `
                          flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl transition-all duration-300 min-h-[56px] group
                          ${isActive 
                            ? 'bg-royal-gold/20 text-white border-2 border-royal-gold shadow-lg transform scale-[1.02]' 
                            : 'text-white/90 hover:bg-white/10 hover:text-white border-2 border-transparent hover:border-white/20'
                          }
                          ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {({ isActive }) => (
                          <>
                            <motion.div 
                              className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 transition-all duration-300 ${
                                isActive ? 'bg-royal-gold/30' : 'bg-white/10 group-hover:bg-white/20'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                                isActive ? 'text-royal-gold' : 'text-white group-hover:text-royal-gold'
                              }`} />
                              
                              {isPremium && (
                                <Crown className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 text-royal-gold" />
                              )}
                              
                              {isLocked && (
                                <div className="absolute inset-0 bg-gray-600/50 rounded-full backdrop-blur-sm" />
                              )}
                            </motion.div>
                            
                            <div className="flex-1 min-w-0">
                              <span className={`font-medium text-sm sm:text-base truncate block transition-colors ${
                                isActive ? 'text-white' : 'text-white/90 group-hover:text-white'
                              }`}>
                                {item.label}
                              </span>
                              {isPremium && (
                                <div className="text-[10px] sm:text-xs text-royal-gold mt-1 font-medium">
                                  Premium
                                </div>
                              )}
                            </div>
                            
                            {isActive && (
                              <motion.div
                                className="w-2 h-2 bg-royal-gold rounded-full shadow-lg"
                                layoutId="activeIndicator"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  )
                })}
              </div>
            </nav>

            {/* User Info */}
            {user && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-royal-gold/20 bg-[#0a1f23]"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-royal-gold/30 rounded-full flex items-center justify-center flex-shrink-0 border border-royal-gold/50">
                    <span className="text-royal-gold font-semibold text-sm sm:text-base">
                      {getCapitalizedFirstName(user.name)?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate text-sm sm:text-base">
                      {getCapitalizedFullName(user.name) || 'Usuário'}
                    </p>
                    <p className="text-white/60 text-xs sm:text-sm truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default HamburgerMenu