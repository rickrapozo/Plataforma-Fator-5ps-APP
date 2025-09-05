import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Mail,
  BarChart3,
  Cookie,
  Brain,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Lock,
  Unlock,
  History,
  Settings
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { privacyService, type PrivacySettings, type UserConsent, type DataExportRequest } from '../../services/privacyService'

const PrivacySettingsPage: React.FC = () => {
  const { user } = useAppStore()
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null)
  const [consentHistory, setConsentHistory] = useState<UserConsent[]>([])
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'settings' | 'history' | 'requests'>('settings')

  useEffect(() => {
    if (user?.id) {
      loadPrivacyData()
    }
  }, [user?.id])

  const loadPrivacyData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const [settings, history] = await Promise.all([
        privacyService.getPrivacySettings(user.id),
        privacyService.getConsentHistory(user.id)
      ])
      
      setPrivacySettings(settings)
      setConsentHistory(history)
    } catch (error) {
      console.error('Erro ao carregar dados de privacidade:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = async (key: keyof PrivacySettings, value: boolean | number) => {
    if (!user?.id || !privacySettings) return

    try {
      setSaving(true)
      const updatedSettings = await privacyService.updatePrivacySettings(user.id, {
        [key]: value
      })
      
      setPrivacySettings(updatedSettings)
      
      // Recarregar histórico para mostrar novos consentimentos
      const newHistory = await privacyService.getConsentHistory(user.id)
      setConsentHistory(newHistory)
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDataExport = async () => {
    if (!user?.id) return

    try {
      const request = await privacyService.requestDataExport(user.id)
      setExportRequests(prev => [request, ...prev])
    } catch (error) {
      console.error('Erro ao solicitar exportação:', error)
    }
  }

  const handleDataDeletion = async () => {
    if (!user?.id) return

    const confirmed = window.confirm(
      'Tem certeza que deseja solicitar a exclusão de todos os seus dados? Esta ação não pode ser desfeita.'
    )

    if (!confirmed) return

    try {
      const request = await privacyService.requestDataDeletion(user.id)
      setExportRequests(prev => [request, ...prev])
    } catch (error) {
      console.error('Erro ao solicitar exclusão:', error)
    }
  }

  const getConsentIcon = (granted: boolean) => {
    return granted ? (
      <CheckCircle className="w-5 h-5 text-success-green" />
    ) : (
      <XCircle className="w-5 h-5 text-red-400" />
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success-green" />
      case 'processing':
        return <Clock className="w-5 h-5 text-bright-gold" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-navy via-royal-purple to-deep-navy flex items-center justify-center">
        <div className="text-white text-xl">Carregando configurações de privacidade...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-navy via-royal-purple to-deep-navy p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-bright-gold" />
            <h1 className="text-3xl font-bold text-white">Configurações de Privacidade</h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Gerencie suas preferências de privacidade e controle como seus dados são utilizados.
            Estamos comprometidos com a proteção dos seus dados pessoais conforme a LGPD.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'settings', label: 'Configurações', icon: Settings },
            { id: 'history', label: 'Histórico', icon: History },
            { id: 'requests', label: 'Solicitações', icon: FileText }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === id
                  ? 'bg-bright-gold text-deep-navy font-semibold'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Settings Tab */}
        {activeTab === 'settings' && privacySettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Consentimentos */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-bright-gold" />
                <span>Consentimentos de Dados</span>
              </h2>
              
              <div className="space-y-4">
                {[
                  {
                    key: 'data_processing_consent' as keyof PrivacySettings,
                    label: 'Processamento de Dados',
                    description: 'Permitir o processamento dos seus dados para funcionalidades essenciais da plataforma',
                    icon: Shield,
                    required: true
                  },
                  {
                    key: 'marketing_emails_consent' as keyof PrivacySettings,
                    label: 'Emails de Marketing',
                    description: 'Receber emails promocionais e informativos sobre novos recursos',
                    icon: Mail,
                    required: false
                  },
                  {
                    key: 'analytics_consent' as keyof PrivacySettings,
                    label: 'Coleta de Analytics',
                    description: 'Permitir coleta de dados de uso para melhorar a experiência da plataforma',
                    icon: BarChart3,
                    required: false
                  },
                  {
                    key: 'cookies_consent' as keyof PrivacySettings,
                    label: 'Cookies',
                    description: 'Usar cookies para personalizar sua experiência e lembrar preferências',
                    icon: Cookie,
                    required: false
                  },
                  {
                    key: 'ai_analysis_consent' as keyof PrivacySettings,
                    label: 'Análise por IA',
                    description: 'Permitir análise dos seus dados por IA para insights personalizados',
                    icon: Brain,
                    required: false
                  }
                ].map(({ key, label, description, icon: Icon, required }) => (
                  <div key={key} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                    <Icon className="w-6 h-6 text-bright-gold mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-medium">{label}</h3>
                        {required && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                            Obrigatório
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{description}</p>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings[key] as boolean}
                          onChange={(e) => handleSettingChange(key, e.target.checked)}
                          disabled={saving || required}
                          className="w-4 h-4 text-bright-gold bg-transparent border-2 border-gray-400 rounded focus:ring-bright-gold focus:ring-2"
                        />
                        <span className="text-white text-sm">
                          {privacySettings[key] ? 'Consentimento concedido' : 'Consentimento negado'}
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configurações de Retenção */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-bright-gold" />
                <span>Retenção de Dados</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-white font-medium min-w-0 flex-1">
                    Período de retenção de dados (dias):
                  </label>
                  <select
                    value={privacySettings.data_retention_period}
                    onChange={(e) => handleSettingChange('data_retention_period', parseInt(e.target.value))}
                    disabled={saving}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-bright-gold"
                  >
                    <option value={30}>30 dias</option>
                    <option value={90}>90 dias</option>
                    <option value={180}>180 dias</option>
                    <option value={365}>1 ano</option>
                    <option value={730}>2 anos</option>
                  </select>
                </div>
                
                <div className="text-sm text-gray-300">
                  <Info className="w-4 h-4 inline mr-2" />
                  Após este período, seus dados serão automaticamente anonimizados ou excluídos.
                </div>
              </div>
            </div>

            {/* Direitos do Usuário */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-bright-gold" />
                <span>Seus Direitos</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={handleDataExport}
                  className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
                >
                  <Download className="w-6 h-6 text-bright-gold group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <h3 className="text-white font-medium">Exportar Dados</h3>
                    <p className="text-gray-300 text-sm">Baixe uma cópia de todos os seus dados</p>
                  </div>
                </button>
                
                <button
                  onClick={handleDataDeletion}
                  className="flex items-center space-x-3 p-4 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all group"
                >
                  <Trash2 className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <h3 className="text-white font-medium">Excluir Dados</h3>
                    <p className="text-gray-300 text-sm">Solicite a exclusão permanente dos seus dados</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <History className="w-5 h-5 text-bright-gold" />
              <span>Histórico de Consentimentos</span>
            </h2>
            
            {consentHistory.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">Nenhum histórico de consentimento encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consentHistory.map((consent) => (
                  <div key={consent.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                    {getConsentIcon(consent.granted)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium capitalize">
                          {consent.consent_type.replace('_', ' ')}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          consent.granted ? 'bg-success-green/20 text-success-green' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {consent.granted ? 'Concedido' : 'Negado'}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {new Date(consent.granted_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      v{consent.version}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-bright-gold" />
              <span>Solicitações de Dados</span>
            </h2>
            
            {exportRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">Nenhuma solicitação de dados encontrada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exportRequests.map((request) => (
                  <div key={request.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                    {getStatusIcon(request.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium capitalize">
                          {request.request_type === 'export' ? 'Exportação' : 'Exclusão'} de Dados
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          request.status === 'completed' ? 'bg-success-green/20 text-success-green' :
                          request.status === 'processing' ? 'bg-bright-gold/20 text-bright-gold' :
                          request.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {request.status === 'completed' ? 'Concluído' :
                           request.status === 'processing' ? 'Processando' :
                           request.status === 'failed' ? 'Falhou' : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Solicitado em: {new Date(request.requested_at).toLocaleString('pt-BR')}
                      </p>
                      {request.completed_at && (
                        <p className="text-gray-300 text-sm">
                          Concluído em: {new Date(request.completed_at).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>
                    {request.download_url && request.status === 'completed' && (
                      <a
                        href={request.download_url}
                        className="flex items-center space-x-2 px-4 py-2 bg-bright-gold text-deep-navy rounded-lg hover:bg-bright-gold/90 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Baixar</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 glass-card p-6"
        >
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-bright-gold mt-1" />
            <div>
              <h3 className="text-white font-semibold mb-2">Sobre a Proteção dos Seus Dados</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Estamos comprometidos com a proteção da sua privacidade e seguimos rigorosamente as diretrizes da 
                Lei Geral de Proteção de Dados (LGPD). Seus dados são processados apenas com o seu consentimento 
                explícito e para as finalidades específicas que você autorizou. Você pode revogar seus consentimentos 
                a qualquer momento e solicitar a exportação ou exclusão dos seus dados.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PrivacySettingsPage