import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Settings, Shield, Info } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { privacyService } from '../../services/privacyService'

interface CookieConsentBannerProps {
  onAcceptAll?: () => void
  onRejectAll?: () => void
  onCustomize?: () => void
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onAcceptAll,
  onRejectAll,
  onCustomize
}) => {
  const { user } = useAppStore()
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkConsentStatus()
  }, [user?.id])

  const checkConsentStatus = async () => {
    if (!user?.id) {
      // Para usuários não logados, verificar localStorage
      const localConsent = localStorage.getItem('cookie_consent')
      if (!localConsent) {
        setIsVisible(true)
      }
      return
    }

    try {
      // Tentar verificar no banco primeiro
      const hasConsent = await privacyService.hasConsent(user.id, 'cookies')
      if (!hasConsent) {
        setIsVisible(true)
      }
    } catch (error) {
      console.warn('Erro ao verificar consentimento no banco, verificando localStorage:', error)
      // Fallback para localStorage se o banco falhar
      const localConsent = localStorage.getItem('cookie_consent')
      if (!localConsent) {
        setIsVisible(true)
      } else {
        try {
          const consent = JSON.parse(localConsent)
          // Verificar se o consentimento é do usuário atual
          if (!consent.userId || consent.userId !== user.id) {
            setIsVisible(true)
          }
        } catch (parseError) {
          console.warn('Erro ao parsear consentimento local:', parseError)
          setIsVisible(true)
        }
      }
    }
  }

  const handleAcceptAll = async () => {
    setLoading(true)
    try {
      // Salvar consentimento no localStorage
      const consentData = {
        cookies: true,
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString(),
        ...(user?.id && { userId: user.id })
      }
      
      localStorage.setItem('cookie_consent', JSON.stringify(consentData))
      
      setIsVisible(false)
      onAcceptAll?.()
    } catch (error) {
      console.error('Erro ao aceitar cookies:', error)
      // Mesmo com erro, ocultar o banner para não bloquear a UX
      setIsVisible(false)
    } finally {
      setLoading(false)
    }
  }

  const handleRejectAll = async () => {
    setLoading(true)
    try {
      // Salvar consentimento no localStorage
      const consentData = {
        cookies: true, // Essenciais sempre aceitos
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
        ...(user?.id && { userId: user.id })
      }
      
      localStorage.setItem('cookie_consent', JSON.stringify(consentData))
      
      setIsVisible(false)
      onRejectAll?.()
    } catch (error) {
      console.error('Erro ao rejeitar cookies:', error)
      // Mesmo com erro, ocultar o banner para não bloquear a UX
      setIsVisible(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomize = () => {
    setShowDetails(!showDetails)
    onCustomize?.()
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-deep-navy/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center space-x-2">
              <Cookie className="w-4 h-4 text-bright-gold" />
              <h3 className="text-sm font-medium text-white">Cookies</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-3">
            <p className="text-gray-300 text-xs leading-relaxed mb-3">
              Usamos cookies para melhorar sua experiência. Alguns são essenciais para o funcionamento.
            </p>

            {/* Detailed Options */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-3 space-y-2 overflow-hidden"
                >
                  {[
                    {
                      title: 'Essenciais',
                      description: 'Funcionamento básico',
                      required: true,
                      icon: Shield
                    },
                    {
                      title: 'Analytics',
                      description: 'Melhorar experiência',
                      required: false,
                      icon: Info
                    },
                    {
                      title: 'Marketing',
                      description: 'Conteúdo personalizado',
                      required: false,
                      icon: Cookie
                    }
                  ].map(({ title, description, required, icon: Icon }) => (
                    <div key={title} className="flex items-center space-x-2 p-2 bg-white/5 rounded">
                      <Icon className="w-3 h-3 text-bright-gold" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-1">
                          <h4 className="text-white font-medium text-xs">{title}</h4>
                          {required && (
                            <span className="text-xs bg-bright-gold text-deep-navy px-1 py-0.5 rounded text-xs">
                              Obr.
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs">{description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={required}
                        className="w-3 h-3 text-bright-gold bg-transparent border border-gray-400 rounded"
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Privacy Policy Link */}
            <div className="flex items-center space-x-1 mb-3">
              <Shield className="w-3 h-3 text-bright-gold" />
              <span className="text-gray-400 text-xs">
                Ao continuar, você concorda com nossa{' '}
                <button className="text-bright-gold hover:underline">
                  Política
                </button>
                {' '}e{' '}
                <button className="text-bright-gold hover:underline">
                  Termos
                </button>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 p-4 pt-0 border-t border-white/5">
            <button
              onClick={handleCustomize}
              className="flex items-center justify-center space-x-1 text-gray-400 hover:text-white transition-colors text-xs"
            >
              <Settings className="w-3 h-3" />
              <span>{showDetails ? 'Ocultar' : 'Personalizar'}</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRejectAll}
                disabled={loading}
                className="flex-1 px-3 py-1.5 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded text-xs transition-colors disabled:opacity-50"
              >
                Essenciais
              </button>
              
              <button
                onClick={handleAcceptAll}
                disabled={loading}
                className="flex-1 px-3 py-1.5 bg-bright-gold text-deep-navy font-medium rounded hover:bg-bright-gold/90 transition-colors text-xs disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border border-deep-navy/30 border-t-deep-navy rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Aceitar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CookieConsentBanner