import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'

export interface AdminNotification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'system' | 'user' | 'performance' | 'security' | 'content'
  actionUrl?: string
  actionLabel?: string
}

interface NotificationSystemProps {
  className?: string
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ className = '' }) => {
  const { user } = useAppStore()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Generate mock notifications for demo
  const generateMockNotifications = useCallback((): AdminNotification[] => {
    const mockNotifications: AdminNotification[] = [
      {
        id: '1',
        type: 'error',
        title: 'Alto Uso de Memória Detectado',
        message: 'O sistema está usando 85% da memória disponível. Considere otimizar ou reiniciar serviços.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        priority: 'critical',
        category: 'performance',
        actionUrl: '/app/admin/performance',
        actionLabel: 'Ver Detalhes'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Taxa de Cache Baixa',
        message: 'A taxa de acerto do cache caiu para 65%. Performance pode estar comprometida.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        priority: 'high',
        category: 'performance',
        actionUrl: '/app/admin/performance',
        actionLabel: 'Otimizar Cache'
      },
      {
        id: '3',
        type: 'success',
        title: 'Backup Concluído',
        message: 'Backup automático do banco de dados foi concluído com sucesso.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true,
        priority: 'medium',
        category: 'system'
      },
      {
        id: '4',
        type: 'info',
        title: 'Novo Usuário Registrado',
        message: '5 novos usuários se registraram na última hora.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: false,
        priority: 'low',
        category: 'user',
        actionUrl: '/app/admin/users',
        actionLabel: 'Ver Usuários'
      },
      {
        id: '5',
        type: 'warning',
        title: 'Tentativa de Login Suspeita',
        message: 'Múltiplas tentativas de login falharam para o IP 192.168.1.100.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: false,
        priority: 'high',
        category: 'security'
      },
      {
        id: '6',
        type: 'info',
        title: 'Conteúdo Publicado',
        message: 'Nova jornada "Mindfulness Avançado" foi publicada e está disponível.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        priority: 'medium',
        category: 'content',
        actionUrl: '/app/admin/content',
        actionLabel: 'Ver Conteúdo'
      }
    ]
    return mockNotifications
  }, [])

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch from an API
      const mockData = generateMockNotifications()
      setNotifications(mockData)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [generateMockNotifications])

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [])

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read
      case 'high':
        return notification.priority === 'high' || notification.priority === 'critical'
      default:
        return true
    }
  })

  // Get notification icon
  const getNotificationIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  // Get priority color
  const getPriorityColor = (priority: AdminNotification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50'
      case 'high':
        return 'border-l-orange-500 bg-orange-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      loadNotifications()
      
      // Set up real-time updates (in a real app, this would be WebSocket or SSE)
      const interval = setInterval(loadNotifications, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user?.role, loadNotifications])

  if (user?.role !== 'admin' && user?.role !== 'super_admin') return null

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Filters */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filter === 'all'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filter === 'unread'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Não Lidas ({unreadCount})
                  </button>
                  <button
                    onClick={() => setFilter('high')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filter === 'high'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Prioridade
                  </button>
                </div>
                
                {/* Actions */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Carregando notificações...
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                          getPriorityColor(notification.priority)
                        } ${!notification.read ? 'bg-blue-50' : ''}`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-medium text-gray-900 ${
                                !notification.read ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                notification.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                notification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {notification.category}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                {notification.actionUrl && (
                                  <a
                                    href={notification.actionUrl}
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                    onClick={() => setIsOpen(false)}
                                  >
                                    {notification.actionLabel || 'Ver'}
                                  </a>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                  className="text-xs text-gray-400 hover:text-gray-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationSystem