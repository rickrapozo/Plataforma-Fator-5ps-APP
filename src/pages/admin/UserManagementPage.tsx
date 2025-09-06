import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Shield,
  Activity,
  Calendar,
  Download,
  Upload,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

import useRealtimeMetrics from '../../hooks/useRealtimeMetrics'
import { useAdminAuth } from '../../hooks/useSecureAuth'
import { dataService } from '../../services/dataService'
import type { UserMetrics } from '../../services/dataService'

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserMetrics[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10

  const { getActiveUsers } = useRealtimeMetrics({ updateInterval: 60000 })
  const { isLoading: authLoading, isAuthorized, error: authError, logAction } = useAdminAuth()

  // Carregar dados reais do Supabase
  useEffect(() => {
    if (!authLoading && isAuthorized) {
      loadUsers()
      logAction('user_management_access', { filter: filterRole })
    }
  }, [authLoading, isAuthorized, filterRole, logAction])

  const loadUsers = async () => {
    try {
      const usersData = await dataService.getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success-green'
      case 'inactive': return 'text-pearl-white/60'
      case 'suspended': return 'text-error-red'
      case 'pending': return 'text-warning-yellow'
      default: return 'text-pearl-white/60'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'inactive': return XCircle
      case 'suspended': return Ban
      case 'pending': return AlertTriangle
      default: return XCircle
    }
  }

  // Verificar se o usuário tem acesso
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-teal via-ocean-blue to-royal-purple flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-16 h-16 text-royal-gold mx-auto mb-4 animate-spin" />
          <h1 className="text-white text-2xl font-bold mb-2">Verificando Acesso</h1>
          <p className="text-pearl-white/80">
            Validando suas credenciais administrativas...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthorized || authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-teal via-ocean-blue to-royal-purple flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Shield className="w-16 h-16 text-error-red mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-pearl-white/80 mb-6">
            {authError || 'Você não tem permissão para acessar o gerenciamento de usuários.'}
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="bg-royal-gold hover:bg-bright-gold text-deep-teal px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    )
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'text-royal-purple'
      case 'admin': return 'text-royal-gold'
      case 'user': return 'text-bright-gold'
      default: return 'text-pearl-white/60'
    }
  }

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'enterprise': return 'text-royal-purple'
      case 'premium': return 'text-royal-gold'
      case 'free': return 'text-pearl-white/60'
      default: return 'text-pearl-white/60'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    return formatDate(dateString)
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(currentUsers.map(user => user.id))
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Ação em lote: ${action} para usuários:`, selectedUsers)
    // Implementar ações em lote
    setSelectedUsers([])
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(user => user.id !== userId))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-navy via-royal-purple to-midnight-blue p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Gerenciamento de Usuários</h1>
          <p className="text-pearl-white/80">Gerencie usuários, permissões e assinaturas da plataforma</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-8 h-8 text-royal-gold" />
              <div>
                <h3 className="text-white font-semibold">Total Usuários</h3>
                <p className="text-pearl-white/60 text-sm">Registrados</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{users.length}</p>
            <p className="text-success-green text-sm mt-2">+12 esta semana</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-8 h-8 text-bright-gold" />
              <div>
                <h3 className="text-white font-semibold">Usuários Ativos</h3>
                <p className="text-pearl-white/60 text-sm">Últimos 30 dias</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{getActiveUsers(30 * 24 * 60)}</p>
            <p className="text-royal-gold text-sm mt-2">Taxa: 78%</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8 text-success-green" />
              <div>
                <h3 className="text-white font-semibold">Administradores</h3>
                <p className="text-pearl-white/60 text-sm">Com acesso</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{users.filter(u => u.role === 'admin' || u.role === 'superadmin').length}</p>
            <p className="text-pearl-white/60 text-sm mt-2">Ativos</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-8 h-8 text-royal-purple" />
              <div>
                <h3 className="text-white font-semibold">Novos Hoje</h3>
                <p className="text-pearl-white/60 text-sm">Registros</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">8</p>
            <p className="text-success-green text-sm mt-2">+25%</p>
          </div>
        </div>

        {/* Controls */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pearl-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-pearl-white/60 focus:outline-none focus:border-royal-gold w-64"
                />
              </div>

              {/* Filters */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-royal-gold"
              >
                <option value="all">Todas as funções</option>
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
                <option value="superadmin">Super Admin</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-royal-gold"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="suspended">Suspenso</option>
                <option value="pending">Pendente</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button className="neuro-button bg-success-green hover:bg-success-green/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Novo Usuário</span>
              </button>
              <button className="neuro-button bg-royal-gold hover:bg-royal-gold/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
              <button className="neuro-button bg-bright-gold hover:bg-bright-gold/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Importar</span>
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-4 bg-royal-gold/20 border border-royal-gold/30 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-white">
                  {selectedUsers.length} usuário(s) selecionado(s)
                </p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleBulkAction('activate')}
                    className="px-3 py-1 bg-success-green hover:bg-success-green/80 text-white rounded transition-colors text-sm"
                  >
                    Ativar
                  </button>
                  <button 
                    onClick={() => handleBulkAction('suspend')}
                    className="px-3 py-1 bg-warning-yellow hover:bg-warning-yellow/80 text-white rounded transition-colors text-sm"
                  >
                    Suspender
                  </button>
                  <button 
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 bg-error-red hover:bg-error-red/80 text-white rounded transition-colors text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-white/20 bg-white/10 text-royal-gold focus:ring-royal-gold"
                    />
                  </th>
                  <th className="p-4 text-left text-white font-semibold">Usuário</th>
                  <th className="p-4 text-left text-white font-semibold">Função</th>
                  <th className="p-4 text-left text-white font-semibold">Status</th>
                  <th className="p-4 text-left text-white font-semibold">Assinatura</th>
                  <th className="p-4 text-left text-white font-semibold">Último Login</th>
                  <th className="p-4 text-left text-white font-semibold">Atividade</th>
                  <th className="p-4 text-left text-white font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => {
                  const StatusIcon = getStatusIcon(user.status)
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-t border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-white/20 bg-white/10 text-royal-gold focus:ring-royal-gold"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-royal-gold/20 rounded-full flex items-center justify-center">
                            <span className="text-royal-gold font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-pearl-white/60 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-medium ${getRoleColor(user.role)}`}>
                          {user.role === 'superadmin' ? 'Super Admin' : 
                           user.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(user.status)}`} />
                          <span className={`font-medium ${getStatusColor(user.status)}`}>
                            {user.status === 'active' ? 'Ativo' :
                             user.status === 'inactive' ? 'Inativo' :
                             user.status === 'suspended' ? 'Suspenso' : 'Pendente'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-medium ${getSubscriptionColor(user.subscription)}`}>
                          {user.subscription === 'enterprise' ? 'Enterprise' :
                           user.subscription === 'premium' ? 'Premium' : 'Gratuito'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-pearl-white/80 text-sm">
                          {formatLastLogin(user.lastLogin)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="text-white">{user.totalSessions} sessões</p>
                          <p className="text-pearl-white/60">{user.completedJourneys} jornadas</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => console.log('Edit user:', user.id)}
                            className="p-2 text-royal-gold hover:bg-royal-gold/20 rounded-lg transition-colors"
                            title="Editar usuário"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-bright-gold hover:bg-bright-gold/20 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-success-green hover:bg-success-green/20 rounded-lg transition-colors"
                            title="Enviar email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-error-red hover:bg-error-red/20 rounded-lg transition-colors"
                            title="Excluir usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-pearl-white/60 text-sm">
                Mostrando {(currentPage - 1) * usersPerPage + 1} a {Math.min(currentPage * usersPerPage, filteredUsers.length)} de {filteredUsers.length} usuários
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded transition-colors ${
                      currentPage === page
                        ? 'bg-royal-gold text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserManagementPage