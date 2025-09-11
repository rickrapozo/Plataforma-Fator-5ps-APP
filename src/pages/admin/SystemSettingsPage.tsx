import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Settings,
  Server,
  Shield,
  Mail,
  Bell,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  Download,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Lock
} from 'lucide-react'

import { useAdminAuth } from '../../hooks/useSecureAuth'

import { dataService } from '../../services/dataService'
import { monitoringService } from '../../services/monitoringService'

interface SystemConfig {
  id: string
  category: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json' | 'password'
  description: string
  required: boolean
  sensitive: boolean
}

interface ServiceStatus {
  name: string
  status: 'online' | 'offline' | 'warning' | 'maintenance'
  uptime: string
  lastCheck: string
  responseTime: number
  version?: string
  url?: string
}

const SystemSettingsPage: React.FC = () => {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('general')
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [isTestingServices, setIsTestingServices] = useState(false)
  const { isLoading: authLoading, isAuthorized, error: authError, logAction } = useAdminAuth()

  // Load real data from Supabase
  useEffect(() => {
    if (!authLoading && isAuthorized) {
      loadConfigs()
      loadServices()
      logAction('system_settings_access', { category: activeTab })
    }
  }, [authLoading, isAuthorized, activeTab, logAction])

  const loadConfigs = async () => {
      try {
        const configsData = await dataService.getSystemConfigs()
        setConfigs(configsData as SystemConfig[])
      } catch (error) {
        console.error('Error loading configs:', error)
        // Fallback to mock data if API fails
        const mockConfigs: SystemConfig[] = [
      // Configurações Gerais
      {
        id: '1',
        category: 'general',
        key: 'app_name',
        value: 'Essential Factor',
        type: 'string',
        description: 'Nome da aplicação exibido na interface',
        required: true,
        sensitive: false
      },
      {
        id: '2',
        category: 'general',
        key: 'app_version',
        value: '1.0.0',
        type: 'string',
        description: 'Versão atual da aplicação',
        required: true,
        sensitive: false
      },
      {
        id: '3',
        category: 'general',
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        description: 'Ativar modo de manutenção',
        required: false,
        sensitive: false
      },
      {
        id: '4',
        category: 'general',
        key: 'max_users',
        value: '10000',
        type: 'number',
        description: 'Número máximo de usuários permitidos',
        required: false,
        sensitive: false
      },
      
      // Configurações de Segurança
      {
        id: '5',
        category: 'security',
        key: 'jwt_secret',
        value: 'super_secret_jwt_key_here',
        type: 'password',
        description: 'Chave secreta para tokens JWT',
        required: true,
        sensitive: true
      },
      {
        id: '6',
        category: 'security',
        key: 'session_timeout',
        value: '3600',
        type: 'number',
        description: 'Tempo limite da sessão em segundos',
        required: true,
        sensitive: false
      },
      {
        id: '7',
        category: 'security',
        key: 'password_min_length',
        value: '8',
        type: 'number',
        description: 'Comprimento mínimo da senha',
        required: true,
        sensitive: false
      },
      {
        id: '8',
        category: 'security',
        key: 'two_factor_enabled',
        value: 'true',
        type: 'boolean',
        description: 'Habilitar autenticação de dois fatores',
        required: false,
        sensitive: false
      },
      
      // Configurações de Email
      {
        id: '9',
        category: 'email',
        key: 'smtp_host',
        value: 'smtp.gmail.com',
        type: 'string',
        description: 'Servidor SMTP para envio de emails',
        required: true,
        sensitive: false
      },
      {
        id: '10',
        category: 'email',
        key: 'smtp_port',
        value: '587',
        type: 'number',
        description: 'Porta do servidor SMTP',
        required: true,
        sensitive: false
      },
      {
        id: '11',
        category: 'email',
        key: 'smtp_username',
        value: 'noreply@essentialfactor.com',
        type: 'string',
        description: 'Usuário para autenticação SMTP',
        required: true,
        sensitive: false
      },
      {
        id: '12',
        category: 'email',
        key: 'smtp_password',
        value: 'email_password_here',
        type: 'password',
        description: 'Senha para autenticação SMTP',
        required: true,
        sensitive: true
      },
      
      // Configurações de API
      {
        id: '13',
        category: 'api',
        key: 'gemini_api_key',
        value: '••••••••••••••••••••••••••••••••••••••••',
        type: 'password',
        description: 'Chave da API do Gemini AI (configurada via variável de ambiente)',
        required: true,
        sensitive: true
      },
      {
        id: '14',
        category: 'api',
        key: 'rate_limit_per_minute',
        value: '100',
        type: 'number',
        description: 'Limite de requisições por minuto por usuário',
        required: true,
        sensitive: false
      },
      {
        id: '15',
        category: 'api',
        key: 'api_timeout',
        value: '30000',
        type: 'number',
        description: 'Timeout das requisições API em milissegundos',
        required: true,
        sensitive: false
      },
      
      // Configurações de Notificação
      {
        id: '16',
        category: 'notifications',
        key: 'push_notifications_enabled',
        value: 'true',
        type: 'boolean',
        description: 'Habilitar notificações push',
        required: false,
        sensitive: false
      },
      {
        id: '17',
        category: 'notifications',
        key: 'email_notifications_enabled',
        value: 'true',
        type: 'boolean',
        description: 'Habilitar notificações por email',
        required: false,
        sensitive: false
      }
    ]
    

        
        setConfigs(mockConfigs)
      }
    }
    
  const loadServices = async () => {
      try {
        const servicesData = await monitoringService.getServiceStatus()
        setServices(servicesData)
      } catch (error) {
        console.error('Error loading services:', error)
        // Fallback to mock data if API fails
        setServices([])
      }
    }

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'api', label: 'APIs', icon: Zap },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'services', label: 'Serviços', icon: Server },
    { id: 'monitoring', label: 'Monitoramento', icon: Activity }
  ]

  const filteredConfigs = configs.filter(config => 
    config.category === activeTab &&
    (config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
     config.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircle
      case 'offline': return XCircle
      case 'warning': return AlertTriangle
      case 'maintenance': return Settings
      default: return XCircle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-success-green'
      case 'offline': return 'text-error-red'
      case 'warning': return 'text-warning-yellow'
      case 'maintenance': return 'text-bright-gold'
      default: return 'text-pearl-white/60'
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      online: 'bg-success-green/20 text-success-green border-success-green/30',
      offline: 'bg-error-red/20 text-error-red border-error-red/30',
      warning: 'bg-warning-yellow/20 text-warning-yellow border-warning-yellow/30',
      maintenance: 'bg-bright-gold/20 text-bright-gold border-bright-gold/30'
    }
    
    const labels = {
      online: 'Online',
      offline: 'Offline',
      warning: 'Atenção',
      maintenance: 'Manutenção'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const handleConfigChange = (configId: string, newValue: string) => {
    setConfigs(prev => prev.map(config => 
      config.id === configId ? { ...config, value: newValue } : config
    ))
    setHasChanges(true)
  }

  const toggleSensitiveVisibility = (configId: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }))
  }

  const handleSaveChanges = async () => {
    try {
      await dataService.updateSystemConfigs(configs)
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving configurations:', error)
    }
  }

  const handleTestServices = async () => {
    setIsTestingServices(true)
    try {
      const updatedServices = await monitoringService.testAllServices()
      setServices(updatedServices)
    } catch (error) {
      console.error('Error testing services:', error)
    } finally {
      setIsTestingServices(false)
    }
  }

  const handleExportConfig = () => {
    const exportData = configs.filter(config => !config.sensitive)
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'system-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderConfigInput = (config: SystemConfig) => {
    const isPassword = config.type === 'password'
    const shouldHide = isPassword && !showSensitive[config.id]
    
    switch (config.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.value === 'true'}
              onChange={(e) => handleConfigChange(config.id, e.target.checked.toString())}
              className="rounded border-white/20 bg-white/10 text-royal-gold focus:ring-royal-gold"
            />
            <span className="text-pearl-white/80 text-sm">
              {config.value === 'true' ? 'Habilitado' : 'Desabilitado'}
            </span>
          </div>
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={config.value}
            onChange={(e) => handleConfigChange(config.id, e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-pearl-white/60 focus:outline-none focus:border-royal-gold"
          />
        )
      
      case 'password':
        return (
          <div className="relative">
            <input
              type={shouldHide ? 'password' : 'text'}
              value={shouldHide ? '••••••••••••' : config.value}
              onChange={(e) => !shouldHide && handleConfigChange(config.id, e.target.value)}
              readOnly={shouldHide}
              className="w-full px-3 py-2 pr-20 bg-white/10 border border-white/20 rounded-lg text-white placeholder-pearl-white/60 focus:outline-none focus:border-royal-gold"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <button
                type="button"
                onClick={() => toggleSensitiveVisibility(config.id)}
                className="p-1 text-pearl-white/60 hover:text-white transition-colors"
              >
                {shouldHide ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(config.value)}
                className="p-1 text-pearl-white/60 hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      
      default:
        return (
          <input
            type="text"
            value={config.value}
            onChange={(e) => handleConfigChange(config.id, e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-pearl-white/60 focus:outline-none focus:border-royal-gold"
          />
        )
    }
  }

  const renderServicesTab = () => (
    <div className="space-y-6">
      {/* Service Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-success-green" />
            <div>
              <h3 className="text-white font-semibold">Serviços Online</h3>
              <p className="text-2xl font-bold text-success-green">
                {services.filter(s => s.status === 'online').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-warning-yellow" />
            <div>
              <h3 className="text-white font-semibold">Com Problemas</h3>
              <p className="text-2xl font-bold text-warning-yellow">
                {services.filter(s => s.status === 'warning' || s.status === 'offline').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-bright-gold" />
            <div>
              <h3 className="text-white font-semibold">Tempo Resposta</h3>
              <p className="text-2xl font-bold text-bright-gold">
                {Math.round(services.reduce((sum, s) => sum + s.responseTime, 0) / services.length)}ms
              </p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center space-x-3">
            <Server className="w-8 h-8 text-royal-purple" />
            <div>
              <h3 className="text-white font-semibold">Uptime Médio</h3>
              <p className="text-2xl font-bold text-royal-purple">99.1%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="glass-card">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Status dos Serviços</h3>
            <button
              onClick={handleTestServices}
              disabled={isTestingServices}
              className="neuro-button bg-royal-gold hover:bg-royal-gold/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingServices ? 'animate-spin' : ''}`} />
              <span>{isTestingServices ? 'Testando...' : 'Testar Todos'}</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {services.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status)
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center space-x-4">
                    <StatusIcon className={`w-6 h-6 ${getStatusColor(service.status)}`} />
                    <div>
                      <h4 className="text-white font-semibold">{service.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-pearl-white/60">
                        <span>Uptime: {service.uptime}</span>
                        <span>Resposta: {service.responseTime}ms</span>
                        {service.version && <span>v{service.version}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(service.status)}
                    {service.url && (
                      <button
                        onClick={() => window.open(service.url, '_blank')}
                        className="p-2 text-pearl-white/60 hover:text-white transition-colors"
                        title="Abrir serviço"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  const renderMonitoringTab = () => (
    <div className="space-y-6">
      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center space-x-3">
            <Cpu className="w-8 h-8 text-royal-gold" />
            <div>
              <h3 className="text-white font-semibold">CPU</h3>
              <p className="text-2xl font-bold text-white">
                45%
              </p>
            </div>
          </div>
          <div className="mt-2 bg-white/10 rounded-full h-2">
            <div 
              className="bg-royal-gold rounded-full h-2 transition-all duration-300"
              style={{ width: '45%' }}
            />
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center space-x-3">
            <MemoryStick className="w-8 h-8 text-bright-gold" />
            <div>
              <h3 className="text-white font-semibold">Memória</h3>
              <p className="text-2xl font-bold text-white">
                67%
              </p>
            </div>
          </div>
          <div className="mt-2 bg-white/10 rounded-full h-2">
            <div 
              className="bg-bright-gold rounded-full h-2 transition-all duration-300"
              style={{ width: '67%' }}
            />
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-8 h-8 text-success-green" />
            <div>
              <h3 className="text-white font-semibold">Disco</h3>
              <p className="text-2xl font-bold text-white">67%</p>
            </div>
          </div>
          <div className="mt-2 bg-white/10 rounded-full h-2">
            <div className="bg-success-green rounded-full h-2 transition-all duration-300" style={{ width: '67%' }} />
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center space-x-3">
            <Wifi className="w-8 h-8 text-royal-purple" />
            <div>
              <h3 className="text-white font-semibold">Rede</h3>
              <p className="text-2xl font-bold text-white">98%</p>
            </div>
          </div>
          <div className="mt-2 bg-white/10 rounded-full h-2">
            <div className="bg-royal-purple rounded-full h-2 transition-all duration-300" style={{ width: '98%' }} />
          </div>
        </div>
      </div>

      {/* Monitoring Settings */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Configurações de Monitoramento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-pearl-white/80 text-sm font-medium mb-2">
              Intervalo de Coleta (segundos)
            </label>
            <input
              type="number"
              defaultValue="30"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-royal-gold"
            />
          </div>
          
          <div>
            <label className="block text-pearl-white/80 text-sm font-medium mb-2">
              Retenção de Dados (dias)
            </label>
            <input
              type="number"
              defaultValue="30"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-royal-gold"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-white/20 bg-white/10 text-royal-gold focus:ring-royal-gold"
            />
            <label className="text-pearl-white/80 text-sm">
              Alertas por Email
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-white/20 bg-white/10 text-royal-gold focus:ring-royal-gold"
            />
            <label className="text-pearl-white/80 text-sm">
              Análise com Gemini AI
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  // Verificar se o usuário tem acesso
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-navy via-royal-purple to-midnight-blue flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-deep-navy via-royal-purple to-midnight-blue flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Shield className="w-16 h-16 text-error-red mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-pearl-white/80 mb-6">
            {authError || 'Apenas Super Administradores podem acessar as configurações do sistema.'}
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="bg-royal-gold hover:bg-bright-gold text-deep-navy px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-navy via-royal-purple to-midnight-blue p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Configurações do Sistema</h1>
          <p className="text-pearl-white/80">Gerencie todas as configurações e serviços da plataforma</p>
        </div>

        {/* Tabs */}
        <div className="glass-card mb-8">
          <div className="flex flex-wrap border-b border-white/10">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-royal-gold border-b-2 border-royal-gold'
                      : 'text-pearl-white/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'services' ? (
          renderServicesTab()
        ) : activeTab === 'monitoring' ? (
          renderMonitoringTab()
        ) : (
          <div className="space-y-6">
            {/* Search and Actions */}
            <div className="glass-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="relative">
                  <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pearl-white/60 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar configuração..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-pearl-white/60 focus:outline-none focus:border-royal-gold w-64"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportConfig}
                    className="neuro-button bg-bright-gold hover:bg-bright-gold/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                  
                  {hasChanges && (
                    <button
                      onClick={handleSaveChanges}
                      className="neuro-button bg-success-green hover:bg-success-green/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Alterações</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Configuration Items */}
            <div className="glass-card">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white capitalize">
                  Configurações de {tabs.find(t => t.id === activeTab)?.label}
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {filteredConfigs.map((config, index) => (
                    <motion.div
                      key={config.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-semibold">{config.key}</h4>
                            {config.required && (
                              <span className="px-2 py-1 bg-error-red/20 text-error-red text-xs rounded-full border border-error-red/30">
                                Obrigatório
                              </span>
                            )}
                            {config.sensitive && (
                              <Lock className="w-4 h-4 text-warning-yellow" />
                            )}
                          </div>
                          <p className="text-pearl-white/70 text-sm">{config.description}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        {renderConfigInput(config)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SystemSettingsPage