import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Users, Settings, BarChart3, Shield, 
  Crown, Brain, BookOpen,
  Activity, AlertTriangle,
  FileText, CheckCircle,
  XCircle, Zap, Eye, Server,
  RefreshCw, Database, Globe
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import useRealtimeMetrics from '../../hooks/useRealtimeMetrics'
import { useAdminAuth } from '../../hooks/useSecureAuth'
import NotificationSystem from '../../components/admin/NotificationSystem'

const AdminPanelPage: React.FC = () => {
  const { user, isSuperAdmin } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()
  
  const {
    metrics,
    getActiveUsers,
    getPerformanceScore,
    isHealthy,
    hasWarnings
  } = useRealtimeMetrics({ updateInterval: 60000 })

  const { isLoading, isAuthorized, error, logAction } = useAdminAuth()

  useEffect(() => {
    if (!isLoading && isAuthorized) {
      logAction('admin_panel_access', { tab: activeTab })
    }
  }, [isLoading, isAuthorized, activeTab, logAction])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center max-w-md"
        >
          <RefreshCw className="w-16 h-16 mx-auto mb-4 text-royal-gold animate-spin" />
          <h2 className="text-white text-xl font-bold mb-2">Verificando Acesso</h2>
          <p className="text-pearl-white/80">Validando suas credenciais administrativas...</p>
        </motion.div>
      </div>
    )
  }

  if (!isAuthorized || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center max-w-md"
        >
          <Shield className="w-16 h-16 mx-auto mb-4 text-error-red" />
          <h2 className="text-white text-xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-pearl-white/80">{error || 'Você não tem permissão para acessar o painel administrativo.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-royal-gold hover:bg-bright-gold text-deep-teal px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'content', label: 'Conteúdo', icon: BookOpen },
    { id: 'ai', label: 'IA & Webhooks', icon: Brain },
    { id: 'system', label: 'Sistema', icon: Settings },
  ]

  const stats = [
    {
      label: 'Usuários Ativos',
      value: getActiveUsers(30).toString(),
      change: '+12%',
      icon: Users,
      color: 'text-success-green'
    },
    {
      label: 'Performance',
      value: `${getPerformanceScore()}%`,
      change: getPerformanceScore() > 80 ? '+5%' : '-2%',
      icon: Zap,
      color: getPerformanceScore() > 80 ? 'text-success-green' : 'text-warning-yellow'
    },
    {
      label: 'Visualizações',
      value: (metrics.current?.totalSessions || 0).toString(),
      change: '+8%',
      icon: Eye,
      color: 'text-royal-gold'
    },
    {
      label: 'Status Sistema',
      value: isHealthy ? 'Saudável' : hasWarnings ? 'Atenção' : 'Crítico',
      change: isHealthy ? '✓' : hasWarnings ? '⚠' : '✗',
      icon: isHealthy ? CheckCircle : hasWarnings ? AlertTriangle : XCircle,
      color: isHealthy ? 'text-success-green' : hasWarnings ? 'text-warning-yellow' : 'text-error-red'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-3xl font-heading font-bold mb-2">
                Painel Administrativo
              </h1>
              <p className="text-pearl-white/80">
                Bem-vindo, {user?.name} • {isSuperAdmin() ? 'Super Admin' : 'Admin'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationSystem />
              <div className="flex items-center space-x-2">
                <Crown className="w-6 h-6 text-royal-gold" />
                <span className="text-royal-gold font-semibold">
                  {isSuperAdmin() ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, _) => (
            <div key={stat.label} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <span className={`text-sm font-semibold ${stat.color}`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-pearl-white/60 text-sm">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card mb-6"
        >
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-royal-gold border-b-2 border-royal-gold'
                    : 'text-pearl-white/80 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-6">Visão Geral do Sistema</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Atividade Recente</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-success-green rounded-full"></div>
                      <span className="text-pearl-white/80 text-sm">15 novos usuários registrados hoje</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-royal-gold rounded-full"></div>
                      <span className="text-pearl-white/80 text-sm">234 protocolos diários completados</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-bright-gold rounded-full"></div>
                      <span className="text-pearl-white/80 text-sm">89 consultas ao Terapeuta AI</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Status do Sistema</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-pearl-white/80">Supabase</span>
                      <span className="text-success-green font-semibold">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-pearl-white/80">Webhook N8N</span>
                      <span className="text-success-green font-semibold">Conectado</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-pearl-white/80">Email Service</span>
                      <span className="text-success-green font-semibold">Funcionando</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <motion.button
                      onClick={() => navigate('/app/admin/analytics')}
                      className="neuro-button bg-royal-gold hover:bg-royal-gold/80 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center space-x-2 w-full justify-center"
                      whileTap={{ scale: 0.98 }}
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span>📊 Analytics Avançado</span>
                    </motion.button>
                    
                    <div className="flex gap-3">
                      <Link
                        to="/app/admin/realtime-metrics"
                        className="neuro-button bg-bright-gold hover:bg-bright-gold/80 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center space-x-2 w-full justify-center"
                      >
                        <Activity className="w-5 h-5" />
                        <span>⚡ Métricas Tempo Real</span>
                      </Link>
                      <Link
                        to="/app/admin/performance"
                        className="neuro-button bg-royal-purple hover:bg-royal-purple/80 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center space-x-2 w-full justify-center"
                      >
                        <Zap className="w-5 h-5" />
                        <span>📊 Análise de Performance</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-white text-2xl font-bold mb-6">Gerenciamento de Usuários</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="glass-card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-8 h-8 text-royal-gold" />
                    <div>
                      <h3 className="text-white font-semibold">Total de Usuários</h3>
                      <p className="text-pearl-white/60 text-sm">Registrados na plataforma</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">1,247</p>
                  <p className="text-success-green text-sm mt-2">+23 esta semana</p>
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
                      <p className="text-pearl-white/60 text-sm">Com acesso total</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">3</p>
                  <p className="text-pearl-white/60 text-sm mt-2">Ativos</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Ações Rápidas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="neuro-button bg-royal-gold hover:bg-royal-gold/80 text-white py-3 px-4 rounded-lg transition-colors">
                      Adicionar Usuário
                    </button>
                    <button className="neuro-button bg-bright-gold hover:bg-bright-gold/80 text-white py-3 px-4 rounded-lg transition-colors">
                      Exportar Lista
                    </button>
                    <button className="neuro-button bg-success-green hover:bg-success-green/80 text-white py-3 px-4 rounded-lg transition-colors">
                      Enviar Convites
                    </button>
                    <Link 
                      to="/app/admin/users"
                      className="neuro-button bg-royal-purple hover:bg-royal-purple/80 text-white py-3 px-4 rounded-lg transition-colors"
                    >
                      Gerenciar Usuários
                    </Link>
                  </div>
                </div>
                
                <div className="glass-card p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Usuários Recentes</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Maria Silva', email: 'maria@email.com', date: '2024-01-15', status: 'Ativo' },
                      { name: 'João Santos', email: 'joao@email.com', date: '2024-01-14', status: 'Ativo' },
                      { name: 'Ana Costa', email: 'ana@email.com', date: '2024-01-13', status: 'Pendente' },
                      { name: 'Pedro Lima', email: 'pedro@email.com', date: '2024-01-12', status: 'Ativo' }
                    ].map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-royal-gold/20 rounded-full flex items-center justify-center">
                            <span className="text-royal-gold font-semibold">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-pearl-white/60 text-sm">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            user.status === 'Ativo' ? 'text-success-green' : 'text-warning-yellow'
                          }`}>
                            {user.status}
                          </p>
                          <p className="text-pearl-white/60 text-xs">{user.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <h2 className="text-white text-2xl font-bold mb-6">Gerenciamento de Conteúdo</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <div className="glass-card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-8 h-8 text-royal-gold" />
                    <div>
                      <h3 className="text-white font-semibold">Jornadas</h3>
                      <p className="text-pearl-white/60 text-sm">Guiadas</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">12</p>
                  <p className="text-success-green text-sm mt-2">+2 este mês</p>
                </div>
                
                <div className="glass-card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Globe className="w-8 h-8 text-bright-gold" />
                    <div>
                      <h3 className="text-white font-semibold">Áudios</h3>
                      <p className="text-pearl-white/60 text-sm">Biblioteca</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">48</p>
                  <p className="text-royal-gold text-sm mt-2">156h total</p>
                </div>
                
                <div className="glass-card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Database className="w-8 h-8 text-success-green" />
                    <div>
                      <h3 className="text-white font-semibold">Templates</h3>
                      <p className="text-pearl-white/60 text-sm">Email</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">24</p>
                  <p className="text-pearl-white/60 text-sm mt-2">Ativos</p>
                </div>
                
                <div className="glass-card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Eye className="w-8 h-8 text-royal-purple" />
                    <div>
                      <h3 className="text-white font-semibold">Visualizações</h3>
                      <p className="text-pearl-white/60 text-sm">Este mês</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">8.4K</p>
                  <p className="text-success-green text-sm mt-2">+18%</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Ações de Conteúdo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="neuro-button bg-royal-gold hover:bg-royal-gold/80 text-white py-3 px-4 rounded-lg transition-colors">
                      Nova Jornada
                    </button>
                    <button className="neuro-button bg-bright-gold hover:bg-bright-gold/80 text-white py-3 px-4 rounded-lg transition-colors">
                      Upload Áudio
                    </button>
                    <button className="neuro-button bg-success-green hover:bg-success-green/80 text-white py-3 px-4 rounded-lg transition-colors">
                      Criar Template
                    </button>
                    <Link 
                      to="/app/admin/content"
                      className="neuro-button bg-royal-purple hover:bg-royal-purple/80 text-white py-3 px-4 rounded-lg transition-colors"
                    >
                      Gerenciar Conteúdo
                    </Link>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="text-white text-lg font-semibold mb-4">Conteúdo Mais Popular</h3>
                    <div className="space-y-3">
                      {[
                        { title: 'Jornada da Autoestima', type: 'Jornada', views: '1.2K', rating: 4.8 },
                        { title: 'Meditação Matinal', type: 'Áudio', views: '890', rating: 4.9 },
                        { title: 'Protocolo de Ansiedade', type: 'Template', views: '756', rating: 4.7 },
                        { title: 'Respiração Consciente', type: 'Áudio', views: '634', rating: 4.6 }
                      ].map((content, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{content.title}</p>
                            <p className="text-pearl-white/60 text-sm">{content.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-royal-gold font-semibold">{content.views} views</p>
                            <p className="text-success-green text-sm">★ {content.rating}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="glass-card p-6">
                    <h3 className="text-white text-lg font-semibold mb-4">Atividade Recente</h3>
                    <div className="space-y-3">
                      {[
                        { action: 'Nova jornada criada', item: 'Mindfulness Avançado', time: '2h atrás' },
                        { action: 'Áudio atualizado', item: 'Relaxamento Profundo', time: '4h atrás' },
                        { action: 'Template publicado', item: 'Boas-vindas Premium', time: '1d atrás' },
                        { action: 'Jornada arquivada', item: 'Teste Beta v1', time: '2d atrás' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white text-sm">{activity.action}</p>
                            <p className="text-pearl-white/60 text-xs">{activity.item}</p>
                          </div>
                          <p className="text-pearl-white/60 text-xs">{activity.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div>
              <h2 className="text-white text-2xl font-bold mb-6">IA & Webhooks</h2>
              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Terapeuta AI</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-pearl-white/80">Status do Webhook N8N</span>
                      <span className="text-success-green font-semibold">Conectado</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-pearl-white/80">URL</span>
                      <span className="text-pearl-white/60 text-sm">
                        https://fator5ps.app.n8n.cloud/webhook-test/...
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-pearl-white/80">Consultas hoje</span>
                      <span className="text-royal-gold font-semibold">89</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Configurações</h3>
                  <p className="text-pearl-white/80 mb-4">
                    Configurações avançadas da IA e webhooks.
                  </p>
                  
                  <motion.button
                    onClick={() => navigate('/admin/webhook-test')}
                    className="neuro-button bg-royal-gold hover:bg-royal-gold/80 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    🔧 Testar Webhook N8N
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div>
              <h2 className="text-white text-2xl font-bold mb-6">Configurações do Sistema</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="glass-card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Server className={`w-8 h-8 ${
                      isHealthy ? 'text-success-green' : hasWarnings ? 'text-warning-yellow' : 'text-error-red'
                    }`} />
                    <div>
                      <h3 className="text-white font-semibold">Status Servidor</h3>
                      <p className="text-pearl-white/60 text-sm">Monitoramento ativo</p>
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${
                    isHealthy ? 'text-success-green' : hasWarnings ? 'text-warning-yellow' : 'text-error-red'
                  }`}>
                    {isHealthy ? 'Saudável' : hasWarnings ? 'Atenção' : 'Crítico'}
                  </p>
                  <p className="text-pearl-white/60 text-sm mt-2">Uptime: 99.8%</p>
                </div>
                
                <div className="glass-card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Database className="w-8 h-8 text-royal-gold" />
                    <div>
                      <h3 className="text-white font-semibold">Banco de Dados</h3>
                      <p className="text-pearl-white/60 text-sm">Supabase PostgreSQL</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-success-green">Online</p>
                  <p className="text-pearl-white/60 text-sm mt-2">Latência: 45ms</p>
                </div>
                
                <div className="glass-card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="w-8 h-8 text-bright-gold" />
                    <div>
                      <h3 className="text-white font-semibold">Gemini AI</h3>
                      <p className="text-pearl-white/60 text-sm">Sistema de análise</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-success-green">Ativo</p>
                  <p className="text-pearl-white/60 text-sm mt-2">API conectada</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Informações do Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-pearl-white/60 text-sm">Versão da Aplicação</p>
                      <p className="text-white font-semibold">2.1.0</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-pearl-white/60 text-sm">Ambiente</p>
                      <p className="text-white font-semibold">Produção</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-pearl-white/60 text-sm">CPU</p>
                      <p className="text-white font-semibold">{(metrics.current?.cpuUsage || 0).toFixed(1)}%</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-pearl-white/60 text-sm">Memória</p>
                      <p className="text-white font-semibold">{(metrics.current?.memoryUsage || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Ferramentas de Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button 
                      onClick={() => navigate('/app/admin/realtime-metrics')}
                      className="neuro-button bg-royal-gold hover:bg-royal-gold/80 text-white py-3 px-4 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Activity className="w-4 h-4" />
                      <span>Monitoramento</span>
                    </button>
                    <button className="neuro-button bg-bright-gold hover:bg-bright-gold/80 text-white py-3 px-4 rounded-lg transition-colors flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>Backup</span>
                    </button>
                    <button className="neuro-button bg-success-green hover:bg-success-green/80 text-white py-3 px-4 rounded-lg transition-colors flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Segurança</span>
                    </button>
                    <Link 
                      to="/app/admin/settings"
                      className="neuro-button bg-royal-purple hover:bg-royal-purple/80 text-white py-3 px-4 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configurar</span>
                    </Link>
                  </div>
                </div>

                {isSuperAdmin() && (
                  <div className="glass-card p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-error-red" />
                      <h3 className="text-error-red text-lg font-semibold">Zona de Perigo</h3>
                    </div>
                    <p className="text-pearl-white/80 mb-4">
                      Configurações críticas do sistema. Use com extrema cautela.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="bg-error-red/20 hover:bg-error-red/30 text-error-red px-4 py-2 rounded-lg transition-colors border border-error-red/30">
                        Reset Database
                      </button>
                      <button className="bg-error-red/20 hover:bg-error-red/30 text-error-red px-4 py-2 rounded-lg transition-colors border border-error-red/30">
                        Clear All Data
                      </button>
                      <button className="bg-warning-yellow/20 hover:bg-warning-yellow/30 text-warning-yellow px-4 py-2 rounded-lg transition-colors border border-warning-yellow/30">
                        Maintenance Mode
                      </button>
                      <button className="bg-royal-purple/20 hover:bg-royal-purple/30 text-royal-purple px-4 py-2 rounded-lg transition-colors border border-royal-purple/30">
                        Export Logs
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AdminPanelPage