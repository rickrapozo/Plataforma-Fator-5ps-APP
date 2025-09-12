import CryptoJS from 'crypto-js';

export interface SecurityConfig {
  encryptionKey: string;
  sessionTimeout: number; // em minutos
  maxRetryAttempts: number;
  auditLogEnabled: boolean;
  dataRetentionDays: number;
  anonymizationEnabled: boolean;
  emergencyOverride: boolean;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  role: 'user' | 'agent' | 'supervisor' | 'admin';
  startTime: Date;
  lastActivity: Date;
  permissions: string[];
  isActive: boolean;
  emergencyLevel: number;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  action: string;
  resource: string;
  details: any;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
}

export interface SensitiveData {
  id: string;
  type: 'audio' | 'transcript' | 'analysis' | 'personal' | 'medical';
  content: any;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  createdAt: Date;
  expiresAt?: Date;
  accessCount: number;
  lastAccessed?: Date;
}

export interface DataAccessRequest {
  requestId: string;
  userId: string;
  dataId: string;
  purpose: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'denied' | 'expired';
}

class SecurityProtocolService {
  private static instance: SecurityProtocolService;
  private config: SecurityConfig;
  private activeSessions: Map<string, UserSession> = new Map();
  private auditLogs: AuditLog[] = [];
  private sensitiveDataStore: Map<string, SensitiveData> = new Map();
  private accessRequests: Map<string, DataAccessRequest> = new Map();
  private encryptionKey: string;
  private sessionCleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      encryptionKey: this.generateEncryptionKey(),
      sessionTimeout: 30, // 30 minutos
      maxRetryAttempts: 3,
      auditLogEnabled: true,
      dataRetentionDays: 30,
      anonymizationEnabled: true,
      emergencyOverride: false
    };
    
    this.encryptionKey = this.config.encryptionKey;
    this.startSessionCleanup();
  }

  public static getInstance(): SecurityProtocolService {
    if (!SecurityProtocolService.instance) {
      SecurityProtocolService.instance = new SecurityProtocolService();
    }
    return SecurityProtocolService.instance;
  }

  // Gerenciamento de Configuração de Segurança
  public updateSecurityConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logAudit('system', 'config_update', 'security_config', newConfig, 'medium');
  }

  public getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }

  // Criptografia e Descriptografia
  private generateEncryptionKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  public encryptData(data: any, classification: SensitiveData['classification'] = 'confidential'): string {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();
      
      this.logAudit('system', 'data_encrypt', 'sensitive_data', 
        { classification, size: jsonString.length }, 'low');
      
      return encrypted;
    } catch (error) {
      this.logAudit('system', 'encryption_error', 'sensitive_data', 
        { error: error.message }, 'high');
      throw new Error('Falha na criptografia dos dados');
    }
  }

  public decryptData(encryptedData: string, userId: string, purpose: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!jsonString) {
        throw new Error('Dados corrompidos ou chave inválida');
      }
      
      this.logAudit(userId, 'data_decrypt', 'sensitive_data', 
        { purpose, size: jsonString.length }, 'medium');
      
      return JSON.parse(jsonString);
    } catch (error) {
      this.logAudit(userId, 'decryption_error', 'sensitive_data', 
        { error: error.message, purpose }, 'high');
      throw new Error('Falha na descriptografia dos dados');
    }
  }

  // Gerenciamento de Sessões
  public createSession(userId: string, role: UserSession['role'], permissions: string[] = []): UserSession {
    const sessionId = this.generateSessionId();
    const session: UserSession = {
      sessionId,
      userId,
      role,
      startTime: new Date(),
      lastActivity: new Date(),
      permissions,
      isActive: true,
      emergencyLevel: 0
    };
    
    this.activeSessions.set(sessionId, session);
    
    this.logAudit(userId, 'session_create', 'user_session', 
      { sessionId, role, permissions }, 'low');
    
    return session;
  }

  public validateSession(sessionId: string): UserSession | null {
    const session = this.activeSessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return null;
    }
    
    // Verificar timeout da sessão
    const now = new Date();
    const timeDiff = (now.getTime() - session.lastActivity.getTime()) / (1000 * 60);
    
    if (timeDiff > this.config.sessionTimeout && !this.config.emergencyOverride) {
      this.terminateSession(sessionId, 'timeout');
      return null;
    }
    
    // Atualizar última atividade
    session.lastActivity = now;
    this.activeSessions.set(sessionId, session);
    
    return session;
  }

  public terminateSession(sessionId: string, reason: string = 'manual'): void {
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      session.isActive = false;
      
      this.logAudit(session.userId, 'session_terminate', 'user_session', 
        { sessionId, reason, duration: Date.now() - session.startTime.getTime() }, 'low');
      
      this.activeSessions.delete(sessionId);
    }
  }

  public updateSessionEmergencyLevel(sessionId: string, emergencyLevel: number): void {
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      const oldLevel = session.emergencyLevel;
      session.emergencyLevel = emergencyLevel;
      
      this.logAudit(session.userId, 'emergency_level_update', 'user_session', 
        { sessionId, oldLevel, newLevel: emergencyLevel }, 
        emergencyLevel > 7 ? 'critical' : emergencyLevel > 5 ? 'high' : 'medium');
      
      // Ativar override de emergência se necessário
      if (emergencyLevel >= 8) {
        this.config.emergencyOverride = true;
        this.logAudit('system', 'emergency_override_activated', 'security_config', 
          { sessionId, emergencyLevel }, 'critical');
      }
    }
  }

  private generateSessionId(): string {
    return CryptoJS.lib.WordArray.random(128/8).toString() + Date.now().toString();
  }

  // Controle de Acesso
  public hasPermission(sessionId: string, permission: string): boolean {
    const session = this.validateSession(sessionId);
    
    if (!session) {
      return false;
    }
    
    // Verificar permissões específicas
    if (session.permissions.includes(permission) || session.permissions.includes('*')) {
      return true;
    }
    
    // Verificar permissões baseadas em role
    const rolePermissions = this.getRolePermissions(session.role);
    if (rolePermissions.includes(permission) || rolePermissions.includes('*')) {
      return true;
    }
    
    // Override de emergência
    if (this.config.emergencyOverride && session.emergencyLevel >= 8) {
      this.logAudit(session.userId, 'emergency_access_granted', 'access_control', 
        { permission, emergencyLevel: session.emergencyLevel }, 'critical');
      return true;
    }
    
    this.logAudit(session.userId, 'access_denied', 'access_control', 
      { permission, role: session.role }, 'medium');
    
    return false;
  }

  private getRolePermissions(role: UserSession['role']): string[] {
    const permissions = {
      'user': ['read_own_data', 'create_session', 'voice_input'],
      'agent': ['read_user_data', 'create_analysis', 'voice_output', 'emergency_response'],
      'supervisor': ['read_all_data', 'manage_sessions', 'view_audit_logs', 'emergency_override'],
      'admin': ['*'] // Todas as permissões
    };
    
    return permissions[role] || [];
  }

  // Gerenciamento de Dados Sensíveis
  public storeSensitiveData(
    data: any, 
    type: SensitiveData['type'], 
    classification: SensitiveData['classification'],
    expirationHours?: number
  ): string {
    const id = this.generateDataId();
    const now = new Date();
    
    const sensitiveData: SensitiveData = {
      id,
      type,
      content: this.encryptData(data, classification),
      classification,
      createdAt: now,
      expiresAt: expirationHours ? new Date(now.getTime() + expirationHours * 60 * 60 * 1000) : undefined,
      accessCount: 0
    };
    
    this.sensitiveDataStore.set(id, sensitiveData);
    
    this.logAudit('system', 'data_store', 'sensitive_data', 
      { dataId: id, type, classification }, 'low');
    
    return id;
  }

  public retrieveSensitiveData(dataId: string, userId: string, purpose: string): any {
    const data = this.sensitiveDataStore.get(dataId);
    
    if (!data) {
      this.logAudit(userId, 'data_not_found', 'sensitive_data', 
        { dataId, purpose }, 'medium');
      throw new Error('Dados não encontrados');
    }
    
    // Verificar expiração
    if (data.expiresAt && new Date() > data.expiresAt) {
      this.sensitiveDataStore.delete(dataId);
      this.logAudit(userId, 'data_expired', 'sensitive_data', 
        { dataId, purpose }, 'low');
      throw new Error('Dados expirados');
    }
    
    // Atualizar contadores de acesso
    data.accessCount++;
    data.lastAccessed = new Date();
    
    this.logAudit(userId, 'data_access', 'sensitive_data', 
      { dataId, purpose, accessCount: data.accessCount }, 'low');
    
    return this.decryptData(data.content, userId, purpose);
  }

  public deleteSensitiveData(dataId: string, userId: string, reason: string): boolean {
    const data = this.sensitiveDataStore.get(dataId);
    
    if (!data) {
      return false;
    }
    
    this.sensitiveDataStore.delete(dataId);
    
    this.logAudit(userId, 'data_delete', 'sensitive_data', 
      { dataId, reason, type: data.type, classification: data.classification }, 'medium');
    
    return true;
  }

  private generateDataId(): string {
    return 'data_' + CryptoJS.lib.WordArray.random(64/8).toString() + '_' + Date.now();
  }

  // Anonimização de Dados
  public anonymizeData(data: any, type: SensitiveData['type']): any {
    if (!this.config.anonymizationEnabled) {
      return data;
    }
    
    const anonymized = JSON.parse(JSON.stringify(data)); // Deep clone
    
    switch (type) {
      case 'personal':
        anonymized.name = this.hashValue(anonymized.name);
        anonymized.email = this.hashValue(anonymized.email);
        anonymized.phone = this.hashValue(anonymized.phone);
        break;
        
      case 'audio':
        // Remover metadados identificáveis
        delete anonymized.deviceId;
        delete anonymized.ipAddress;
        anonymized.timestamp = this.roundTimestamp(anonymized.timestamp);
        break;
        
      case 'transcript':
        // Substituir nomes próprios por placeholders
        anonymized.content = this.replacePersonalIdentifiers(anonymized.content);
        break;
        
      case 'analysis':
        // Manter apenas dados agregados
        delete anonymized.userId;
        delete anonymized.sessionId;
        break;
    }
    
    this.logAudit('system', 'data_anonymize', 'sensitive_data', 
      { type, originalSize: JSON.stringify(data).length }, 'low');
    
    return anonymized;
  }

  private hashValue(value: string): string {
    if (!value) return value;
    return CryptoJS.SHA256(value + this.encryptionKey).toString().substring(0, 8);
  }

  private roundTimestamp(timestamp: Date | string): Date {
    const date = new Date(timestamp);
    // Arredondar para a hora mais próxima
    date.setMinutes(0, 0, 0);
    return date;
  }

  private replacePersonalIdentifiers(text: string): string {
    if (!text) return text;
    
    // Substituir padrões comuns de informações pessoais
    return text
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NOME]') // Nomes próprios
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[TELEFONE]') // Telefones
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Emails
      .replace(/\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, '[CPF]') // CPF
      .replace(/\b\d{5}[-.]?\d{3}\b/g, '[CEP]'); // CEP
  }

  // Sistema de Auditoria
  public logAudit(
    userId: string, 
    action: string, 
    resource: string, 
    details: any, 
    riskLevel: AuditLog['riskLevel'],
    ipAddress?: string,
    userAgent?: string
  ): void {
    if (!this.config.auditLogEnabled) {
      return;
    }
    
    const auditLog: AuditLog = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      userId,
      sessionId: this.getSessionIdByUserId(userId) || 'unknown',
      action,
      resource,
      details: this.config.anonymizationEnabled ? this.anonymizeData(details, 'analysis') : details,
      riskLevel,
      ipAddress,
      userAgent
    };
    
    this.auditLogs.push(auditLog);
    
    // Manter apenas logs dos últimos dias conforme configuração
    this.cleanupAuditLogs();
    
    // Alertar sobre atividades de alto risco
    if (riskLevel === 'critical' || riskLevel === 'high') {
      console.warn('Atividade de alto risco detectada:', auditLog);
    }
  }

  public getAuditLogs(
    userId?: string, 
    startDate?: Date, 
    endDate?: Date, 
    riskLevel?: AuditLog['riskLevel']
  ): AuditLog[] {
    let filteredLogs = [...this.auditLogs];
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }
    
    if (startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    }
    
    if (endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    }
    
    if (riskLevel) {
      filteredLogs = filteredLogs.filter(log => log.riskLevel === riskLevel);
    }
    
    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private generateAuditId(): string {
    return 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  }

  private getSessionIdByUserId(userId: string): string | null {
    for (const [sessionId, session] of this.activeSessions) {
      if (session.userId === userId && session.isActive) {
        return sessionId;
      }
    }
    return null;
  }

  private cleanupAuditLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.dataRetentionDays);
    
    this.auditLogs = this.auditLogs.filter(log => log.timestamp > cutoffDate);
  }

  // Limpeza e Manutenção
  private startSessionCleanup(): void {
    this.sessionCleanupInterval = setInterval(() => {
      const now = new Date();
      const expiredSessions: string[] = [];
      
      for (const [sessionId, session] of this.activeSessions) {
        const timeDiff = (now.getTime() - session.lastActivity.getTime()) / (1000 * 60);
        
        if (timeDiff > this.config.sessionTimeout && !this.config.emergencyOverride) {
          expiredSessions.push(sessionId);
        }
      }
      
      expiredSessions.forEach(sessionId => {
        this.terminateSession(sessionId, 'cleanup_timeout');
      });
      
      // Limpeza de dados expirados
      this.cleanupExpiredData();
      
    }, 5 * 60 * 1000); // A cada 5 minutos
  }

  private cleanupExpiredData(): void {
    const now = new Date();
    const expiredDataIds: string[] = [];
    
    for (const [dataId, data] of this.sensitiveDataStore) {
      if (data.expiresAt && now > data.expiresAt) {
        expiredDataIds.push(dataId);
      }
    }
    
    expiredDataIds.forEach(dataId => {
      this.sensitiveDataStore.delete(dataId);
      this.logAudit('system', 'data_cleanup', 'sensitive_data', 
        { dataId, reason: 'expired' }, 'low');
    });
  }

  // Relatórios de Segurança
  public generateSecurityReport(): any {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentLogs = this.getAuditLogs(undefined, last24Hours);
    const activeSessions = Array.from(this.activeSessions.values());
    const storedDataCount = this.sensitiveDataStore.size;
    
    const report = {
      timestamp: now,
      summary: {
        activeSessions: activeSessions.length,
        storedDataItems: storedDataCount,
        auditLogsLast24h: recentLogs.length,
        emergencyOverrideActive: this.config.emergencyOverride
      },
      riskAnalysis: {
        criticalEvents: recentLogs.filter(log => log.riskLevel === 'critical').length,
        highRiskEvents: recentLogs.filter(log => log.riskLevel === 'high').length,
        failedAccessAttempts: recentLogs.filter(log => log.action === 'access_denied').length,
        encryptionErrors: recentLogs.filter(log => log.action.includes('encryption_error')).length
      },
      sessionAnalysis: {
        averageSessionDuration: this.calculateAverageSessionDuration(activeSessions),
        emergencySessions: activeSessions.filter(s => s.emergencyLevel >= 5).length,
        roleDistribution: this.calculateRoleDistribution(activeSessions)
      },
      dataAnalysis: {
        dataByType: this.calculateDataDistribution(),
        dataByClassification: this.calculateClassificationDistribution(),
        averageAccessCount: this.calculateAverageAccessCount()
      },
      recommendations: this.generateSecurityRecommendations(recentLogs, activeSessions)
    };
    
    this.logAudit('system', 'security_report_generated', 'security_report', 
      { reportSize: JSON.stringify(report).length }, 'low');
    
    return report;
  }

  private calculateAverageSessionDuration(sessions: UserSession[]): number {
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce((sum, session) => {
      return sum + (Date.now() - session.startTime.getTime());
    }, 0);
    
    return totalDuration / sessions.length / (1000 * 60); // em minutos
  }

  private calculateRoleDistribution(sessions: UserSession[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    sessions.forEach(session => {
      distribution[session.role] = (distribution[session.role] || 0) + 1;
    });
    
    return distribution;
  }

  private calculateDataDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (const data of this.sensitiveDataStore.values()) {
      distribution[data.type] = (distribution[data.type] || 0) + 1;
    }
    
    return distribution;
  }

  private calculateClassificationDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (const data of this.sensitiveDataStore.values()) {
      distribution[data.classification] = (distribution[data.classification] || 0) + 1;
    }
    
    return distribution;
  }

  private calculateAverageAccessCount(): number {
    const dataArray = Array.from(this.sensitiveDataStore.values());
    if (dataArray.length === 0) return 0;
    
    const totalAccess = dataArray.reduce((sum, data) => sum + data.accessCount, 0);
    return totalAccess / dataArray.length;
  }

  private generateSecurityRecommendations(logs: AuditLog[], sessions: UserSession[]): string[] {
    const recommendations: string[] = [];
    
    // Análise de logs críticos
    const criticalEvents = logs.filter(log => log.riskLevel === 'critical');
    if (criticalEvents.length > 5) {
      recommendations.push('Alto número de eventos críticos detectados - revisar protocolos de segurança');
    }
    
    // Análise de sessões de emergência
    const emergencySessions = sessions.filter(s => s.emergencyLevel >= 7);
    if (emergencySessions.length > 0) {
      recommendations.push('Sessões de emergência ativas - monitorar de perto e preparar suporte adicional');
    }
    
    // Análise de falhas de acesso
    const accessDenied = logs.filter(log => log.action === 'access_denied');
    if (accessDenied.length > 10) {
      recommendations.push('Múltiplas tentativas de acesso negadas - verificar tentativas de acesso não autorizado');
    }
    
    // Análise de dados armazenados
    if (this.sensitiveDataStore.size > 1000) {
      recommendations.push('Grande volume de dados sensíveis armazenados - considerar arquivamento ou limpeza');
    }
    
    // Override de emergência ativo
    if (this.config.emergencyOverride) {
      recommendations.push('Override de emergência ativo - revisar e desativar quando apropriado');
    }
    
    return recommendations;
  }

  public destroy(): void {
    if (this.sessionCleanupInterval) {
      clearInterval(this.sessionCleanupInterval);
    }
    
    // Limpar todas as sessões ativas
    for (const sessionId of this.activeSessions.keys()) {
      this.terminateSession(sessionId, 'service_shutdown');
    }
    
    // Limpar dados sensíveis
    this.sensitiveDataStore.clear();
    
    this.logAudit('system', 'service_shutdown', 'security_service', {}, 'medium');
  }
}

export default SecurityProtocolService;
export const securityProtocolService = SecurityProtocolService.getInstance();