import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  Brain, 
  Map, 
  Headphones, 
  BookOpen,
  Users,
  Crown
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'

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

const MobileNavigation: React.FC = () => {

  const { user } = useAppStore()
  
  const isPremiumUser = user?.subscription === 'prosperous'

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 safe-area-bottom"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isLocked = item.premium && !isPremiumUser
          
          return (
            <NavLink
              key={item.route}
              to={item.route}
              className={({ isActive }: { isActive: boolean }) => 
                `relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-royal-gold text-white' 
                    : 'text-dark-gray hover:text-royal-gold'
                } ${isLocked ? 'opacity-50' : ''}`
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <item.icon className="w-6 h-6" />
                    
                    {item.premium && (
                      <Crown className="absolute -top-1 -right-1 w-3 h-3 text-royal-gold" />
                    )}
                    
                    {isLocked && (
                      <div className="absolute inset-0 bg-gray-400/50 rounded-full" />
                    )}
                  </motion.div>
                  
                  <span className="text-xs font-medium mt-1 text-center">
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 left-1/2 w-1 h-1 bg-white rounded-full"
                      layoutId="activeIndicator"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ x: '-50%' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </motion.nav>
  )
}

export default MobileNavigation