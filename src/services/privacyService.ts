import { supabase } from '../lib/supabase'

interface UserConsent {
  id: string
  user_id: string
  consent_type: 'data_processing' | 'marketing_emails' | 'analytics' | 'cookies' | 'ai_analysis'
  granted: boolean
  granted_at: string
  withdrawn_at?: string
  ip_address?: string
  user_agent?: string
  version: string
}

interface PrivacySettings {
  user_id: string
  data_processing_consent: boolean
  marketing_emails_consent: boolean
  analytics_consent: boolean
  cookies_consent: boolean
  ai_analysis_consent: boolean
  data_retention_period: number // em dias
  allow_data_export: boolean
  allow_data_deletion: boolean
  updated_at: string
}

interface DataExportRequest {
  id: string
  user_id: string
  request_type: 'export' | 'deletion'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  requested_at: string
  completed_at?: string
  download_url?: string
  expiry_date?: string
}

class PrivacyService {
  // Registrar consentimento do usuário
  async recordConsent(
    userId: string,
    consentType: UserConsent['consent_type'],
    granted: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserConsent> {
    try {
      const consentData = {
        user_id: userId,
        consent_type: consentType,
        granted,
        granted_at: new Date().toISOString(),
        withdrawn_at: granted ? null : new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
        version: '1.0'
      }

      const { data, error } = await supabase
        .from('user_consents')
        .insert(consentData)
        .select()
        .single()

      if (error) {
        // Se a tabela não existir, retornar dados simulados
        if (error.message?.includes('Could not find the table') || error.code === 'PGRST205') {
          console.warn('Tabela user_consents não encontrada, retornando dados simulados')
          return {
            id: `consent_${Date.now()}`,
            ...consentData
          } as UserConsent
        }
        throw error
      }
      return data
    } catch (error) {
      console.error('Erro ao registrar consentimento:', error)
      // Retornar dados simulados em caso de erro
      return {
        id: `consent_${Date.now()}`,
        user_id: userId,
        consent_type: consentType,
        granted,
        granted_at: new Date().toISOString(),
        withdrawn_at: granted ? undefined : new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
        version: '1.0'
      } as UserConsent
    }
  }

  // Obter configurações de privacidade do usuário
  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      // Verificar se é usuário demo
      if (userId === 'demo-user-id') {
        return this.getDefaultPrivacySettings(userId)
      }

      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // Se a tabela não existir ou não for encontrada, retornar configurações padrão
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('Could not find the table') || 
            error.message?.includes('does not exist') || 
            error.message?.includes('not found')) {
          console.warn('Tabela privacy_settings não encontrada, usando configurações padrão')
          return this.getDefaultPrivacySettings(userId)
        }
        throw error
      }

      // Se não existir, tentar criar configurações padrão
      if (!data) {
        return await this.createDefaultPrivacySettings(userId)
      }

      return data
    } catch (error) {
      console.error('Erro ao obter configurações de privacidade:', error)
      // Em caso de erro, sempre retornar configurações padrão seguras
      return this.getDefaultPrivacySettings(userId)
    }
  }

  // Obter configurações padrão sem acessar o banco
  private getDefaultPrivacySettings(userId: string): PrivacySettings {
    return {
      user_id: userId,
      data_processing_consent: false,
      marketing_emails_consent: false,
      analytics_consent: false,
      cookies_consent: false,
      ai_analysis_consent: false,
      data_retention_period: 365, // 1 ano por padrão
      allow_data_export: true,
      allow_data_deletion: true,
      updated_at: new Date().toISOString()
    }
  }

  // Criar configurações padrão de privacidade
  private async createDefaultPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      const defaultSettings = this.getDefaultPrivacySettings(userId)

      const { data, error } = await supabase
        .from('privacy_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (error) {
        // Se a tabela não existir ou falhar ao inserir, retornar configurações padrão
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          console.warn('Tabela privacy_settings não encontrada, usando configurações padrão locais')
        } else {
          console.warn('Não foi possível criar configurações no banco, usando padrões:', error.message)
        }
        return defaultSettings
      }
      return data
    } catch (error) {
      console.error('Erro ao criar configurações padrão:', error)
      // Sempre retornar configurações padrão mesmo em caso de erro
      return this.getDefaultPrivacySettings(userId)
    }
  }

  // Atualizar configurações de privacidade
  async updatePrivacySettings(
    userId: string,
    settings: Partial<Omit<PrivacySettings, 'user_id' | 'updated_at'>>
  ): Promise<PrivacySettings> {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        // Se a tabela não existir, retornar configurações padrão com as atualizações aplicadas
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          console.warn('Tabela privacy_settings não encontrada, retornando configurações simuladas')
          const defaultSettings = this.getDefaultPrivacySettings(userId)
          const updatedSettings = {
            ...defaultSettings,
            ...settings,
            updated_at: new Date().toISOString()
          }
          
          // Registrar consentimentos individuais
          for (const [key, value] of Object.entries(settings)) {
            if (key.includes('_consent') && typeof value === 'boolean') {
              const consentType = key.replace('_consent', '') as UserConsent['consent_type']
              await this.recordConsent(userId, consentType, value)
            }
          }
          
          return updatedSettings
        }
        throw error
      }

      // Registrar consentimentos individuais
      for (const [key, value] of Object.entries(settings)) {
        if (key.includes('_consent') && typeof value === 'boolean') {
          const consentType = key.replace('_consent', '') as UserConsent['consent_type']
          await this.recordConsent(userId, consentType, value)
        }
      }

      return data
    } catch (error) {
      console.error('Erro ao atualizar configurações de privacidade:', error)
      // Retornar configurações padrão com as atualizações aplicadas
      const defaultSettings = this.getDefaultPrivacySettings(userId)
      const updatedSettings = {
        ...defaultSettings,
        ...settings,
        updated_at: new Date().toISOString()
      }
      
      // Registrar consentimentos individuais
      for (const [key, value] of Object.entries(settings)) {
        if (key.includes('_consent') && typeof value === 'boolean') {
          const consentType = key.replace('_consent', '') as UserConsent['consent_type']
          await this.recordConsent(userId, consentType, value)
        }
      }
      
      return updatedSettings
    }
  }

  // Solicitar exportação de dados
  async requestDataExport(userId: string): Promise<DataExportRequest> {
    try {
      const requestData = {
        user_id: userId,
        request_type: 'export' as const,
        status: 'pending' as const,
        requested_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('data_export_requests')
        .insert(requestData)
        .select()
        .single()

      if (error) {
        // Se a tabela não existir, retornar dados simulados
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          console.warn('Tabela data_export_requests não encontrada, simulando solicitação')
          const simulatedData = {
            id: `export_${Date.now()}`,
            ...requestData
          } as DataExportRequest
          
          // Processar exportação em background (simulado)
          this.processDataExport(simulatedData.id)
          return simulatedData
        }
        throw error
      }

      // Processar exportação em background (simulado)
      this.processDataExport(data.id)

      return data
    } catch (error) {
      console.error('Erro ao solicitar exportação de dados:', error)
      // Retornar dados simulados em caso de erro
      const simulatedData = {
        id: `export_${Date.now()}`,
        user_id: userId,
        request_type: 'export' as const,
        status: 'pending' as const,
        requested_at: new Date().toISOString()
      } as DataExportRequest
      
      // Processar exportação em background (simulado)
      this.processDataExport(simulatedData.id)
      return simulatedData
    }
  }

  // Solicitar exclusão de dados
  async requestDataDeletion(userId: string): Promise<DataExportRequest> {
    try {
      const requestData = {
        user_id: userId,
        request_type: 'deletion' as const,
        status: 'pending' as const,
        requested_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('data_export_requests')
        .insert(requestData)
        .select()
        .single()

      if (error) {
        // Se a tabela não existir, retornar dados simulados
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          console.warn('Tabela data_export_requests não encontrada, simulando solicitação')
          const simulatedData = {
            id: `deletion_${Date.now()}`,
            ...requestData
          } as DataExportRequest
          
          // Processar exclusão em background (simulado)
          this.processDataDeletion(simulatedData.id)
          return simulatedData
        }
        throw error
      }

      // Processar exclusão em background (simulado)
      this.processDataDeletion(data.id)

      return data
    } catch (error) {
      console.error('Erro ao solicitar exclusão de dados:', error)
      // Retornar dados simulados em caso de erro
      const simulatedData = {
        id: `deletion_${Date.now()}`,
        user_id: userId,
        request_type: 'deletion' as const,
        status: 'pending' as const,
        requested_at: new Date().toISOString()
      } as DataExportRequest
      
      // Processar exclusão em background (simulado)
      this.processDataDeletion(simulatedData.id)
      return simulatedData
    }
  }

  // Processar exportação de dados (simulado)
  private async processDataExport(requestId: string): Promise<void> {
    try {
      // Simular processamento
      setTimeout(async () => {
        const { error } = await supabase
          .from('data_export_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            download_url: `https://example.com/exports/${requestId}.zip`,
            expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
          })
          .eq('id', requestId)

        if (error) console.error('Erro ao atualizar status da exportação:', error)
      }, 5000) // 5 segundos para simular processamento
    } catch (error) {
      console.error('Erro no processamento da exportação:', error)
    }
  }

  // Processar exclusão de dados (simulado)
  private async processDataDeletion(requestId: string): Promise<void> {
    try {
      // Simular processamento
      setTimeout(async () => {
        const { error } = await supabase
          .from('data_export_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', requestId)

        if (error) console.error('Erro ao atualizar status da exclusão:', error)
      }, 3000) // 3 segundos para simular processamento
    } catch (error) {
      console.error('Erro no processamento da exclusão:', error)
    }
  }

  // Anonimizar dados do usuário
  async anonymizeUserData(userId: string): Promise<any> {
    try {
      // Buscar todos os dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Criar versão anonimizada
      const anonymizedData = {
        id: userData.id,
        name: `Usuário Anônimo ${userData.id.slice(-8)}`,
        email: `anonimo_${userData.id.slice(-8)}@example.com`,
        role: userData.role,
        subscription: userData.subscription,
        subscription_status: userData.subscription_status,
        created_at: userData.created_at,
        updated_at: new Date().toISOString(),
        // Remover dados pessoais
        avatar_url: null,
        phone: null,
        birth_date: null,
        address: null
      }

      return anonymizedData
    } catch (error) {
      console.error('Erro ao anonimizar dados:', error)
      throw error
    }
  }

  // Verificar se o usuário deu consentimento para um tipo específico
  async hasConsent(userId: string, consentType: UserConsent['consent_type']): Promise<boolean> {
    try {
      // Verificar se é usuário demo
      if (userId === 'demo-user-id') {
        return true // Usuário demo tem todos os consentimentos
      }

      const { data, error } = await supabase
        .from('user_consents')
        .select('granted')
        .eq('user_id', userId)
        .eq('consent_type', consentType)
        .order('granted_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        // Se a tabela não existir ou não encontrar dados, retornar false
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('Could not find the table')) {
          console.warn('Tabela user_consents não encontrada ou sem dados, retornando false')
          return false
        }
        throw error
      }
      return data?.granted || false
    } catch (error) {
      console.error('Erro ao verificar consentimento:', error)
      return false
    }
  }

  // Obter histórico de consentimentos
  async getConsentHistory(userId: string): Promise<UserConsent[]> {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', userId)
        .order('granted_at', { ascending: false })

      if (error) {
        // Se a tabela não existir, retornar array vazio
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          console.warn('Tabela user_consents não encontrada, retornando histórico vazio')
          return []
        }
        throw error
      }
      return data || []
    } catch (error) {
      console.error('Erro ao obter histórico de consentimentos:', error)
      return []
    }
  }

  // Validar se os dados podem ser processados
  async canProcessData(userId: string): Promise<boolean> {
    try {
      const settings = await this.getPrivacySettings(userId)
      return settings.data_processing_consent
    } catch (error) {
      console.error('Erro ao verificar permissão de processamento:', error)
      return false
    }
  }

  // Validar se pode enviar emails de marketing
  async canSendMarketingEmails(userId: string): Promise<boolean> {
    try {
      const settings = await this.getPrivacySettings(userId)
      return settings.marketing_emails_consent
    } catch (error) {
      console.error('Erro ao verificar permissão de marketing:', error)
      return false
    }
  }

  // Validar se pode coletar analytics
  async canCollectAnalytics(userId: string): Promise<boolean> {
    try {
      const settings = await this.getPrivacySettings(userId)
      return settings.analytics_consent
    } catch (error) {
      console.error('Erro ao verificar permissão de analytics:', error)
      return false
    }
  }
}

export const privacyService = new PrivacyService()
export type { UserConsent, PrivacySettings, DataExportRequest }