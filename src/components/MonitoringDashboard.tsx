import React, { useState, useEffect } from 'react'
import { Activity, AlertTriangle, Clock, Database, Globe, Zap, RefreshCw, TrendingUp } from 'lucide-react'
import { TokenMonitorCompact } from './TokenMonitor'
import WebhookMonitor from './WebhookMonitor'
import { useAPM } from '../hooks/useAPM'
import { loggerService } from '../services/loggerService'
import { circuitBreakerManager } from '../services/circuitBreakerService'

import { alertService } from '../services/alertService'
import { useToast } from '../hooks/useToast'

interface MonitoringDashboardProps {
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface SystemMetrics {
  apm: {
    activeTransactions: number
    errorRate: number
    avgResponseTime: number
    throughput: number
  }
  circuitBreakers: {
    total: number
    open: number
    halfOpen: number
    closed: number
  }
  cache: {
    hitRate: number
    totalKeys: number
    memoryUsage: number
    operations: number
  }
  alerts: {
    active: number
    resolved: number
    escalated: number
  }
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const { startTransaction, recordMetric, recordError } = useAPM()
  const { toast } = useToast()
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    apm: {
      activeTransactions: 0,
      errorRate: 0,
      avgResponseTime: 0,
      throughput: 0
    },
    circuitBreakers: {
      total: 0,
      open: 0,
      halfOpen: 0,
      closed: 0
    },
    cache: {
      hitRate: 0,
      totalKeys: 0,
      memoryUsage: 0,
      operations: 0
    },
    alerts: {
      active: 0,
      resolved: 0,
      escalated: 0
    }
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedTab, setSelectedTab] = useState<'overview' | 'tokens' | 'webhooks' | 'logs'>('overview')
  const [recentLogs, setRecentLogs] = useState<any[]>([])

  // Carregar métricas do sistema
  const loadSystemMetrics = async () => {
    const transaction = startTransaction('load_system_metrics', 'custom')
    
    try {
      setIsLoading(true)
      
      // Métricas dos Circuit Breakers
      const circuitBreakerStats = circuitBreakerManager.getAllStats()
      const cbMetrics = {
        total: Object.keys(circuitBreakerStats).length,
        open: Object.values(circuitBreakerStats).filter(s => s.state === 'open').length,
        halfOpen: Object.values(circuitBreakerStats).filter(s => s.state === 'half_open').length,
        closed: Object.values(circuitBreakerStats).filter(s => s.state === 'closed').length
      }
      
      // Métricas do Cache (serviço removido)
      const cacheMetrics = {
        hitRate: 0,
        totalKeys: 0,
        memoryUsage: 0,
        operations: 0
      }
      
      // Métricas de Alertas
      const alertStats = alertService.getStats()
      const alertMetrics = {
        active: alertStats.activeAlertsCount || 0,
        resolved: alertStats.totalAlertsCount - alertStats.activeAlertsCount || 0,
        escalated: 0 // Propriedade não disponível no serviço atual
      }
      
      // Simular métricas APM (em produção, viria do serviço real)
      const apmMetrics = {
        activeTransactions: Math.floor(Math.random() * 50),
        errorRate: Math.random() * 5,
        avgResponseTime: 150 + Math.random() * 100,
        throughput: 100 + Math.random() * 200
      }
      
      setMetrics({
        apm: apmMetrics,
        circuitBreakers: cbMetrics,
        cache: cacheMetrics,
        alerts: alertMetrics
      })
      
      setLastUpdate(new Date())
      
      // Registrar métricas no APM
      recordMetric('system.circuit_breakers.open', cbMetrics.open)
      recordMetric('system.cache.hit_rate', cacheMetrics.hitRate)
      recordMetric('system.alerts.active', alertMetrics.active)
      
      // Transaction completed successfully
    } catch (error) {
      recordError(error as Error, 'error')
      loggerService.error('Failed to load system metrics', { error })
      
      toast({
        title: 'Erro',
        description: 'Falha ao carregar métricas do sistema',
        variant: 'destructive'
      })
      
      // Error recorded in APM
    } finally {
      setIsLoading(false)
      // Transaction ended
    }
  }

  // Carregar logs recentes
  const loadRecentLogs = async () => {
    try {
      // Em produção, isso viria de um endpoint ou serviço de logs
      const logs = [
        {
          id: '1',
          timestamp: new Date(),
          level: 'info',
          message: 'Sistema inicializado com sucesso',
          service: 'app'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 60000),
          level: 'warn',
          message: 'Token expirando em 5 minutos',
          service: 'token-monitor'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 120000),
          level: 'error',
          message: 'Falha na conexão com API externa',
          service: 'circuit-breaker'
        }
      ]
      
      setRecentLogs(logs)
    } catch (error) {
      loggerService.error('Failed to load recent logs', { error })
    }
  }

  // Auto refresh
  useEffect(() => {
    loadSystemMetrics()
    loadRecentLogs()
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadSystemMetrics()
        loadRecentLogs()
      }, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  // Obter cor do status baseado na métrica
  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600 bg-red-50'
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  // Formatar números
  const formatNumber = (num: number, decimals = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Monitoramento</h2>
          <p className="text-gray-600 mt-1">
            Visão geral do sistema • Última atualização: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        
        <button
          onClick={loadSystemMetrics}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Visão Geral', icon: Activity },
            { key: 'tokens', label: 'Tokens', icon: Clock },
            { key: 'webhooks', label: 'Webhooks', icon: Globe },
            { key: 'logs', label: 'Logs', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* APM */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">APM</h3>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(metrics.apm.errorRate, { warning: 2, critical: 5 })
                }`}>
                  {metrics.apm.errorRate < 2 ? 'Saudável' : metrics.apm.errorRate < 5 ? 'Atenção' : 'Crítico'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transações Ativas</span>
                  <span className="font-medium">{metrics.apm.activeTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taxa de Erro</span>
                  <span className="font-medium">{formatNumber(metrics.apm.errorRate, 2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tempo Médio</span>
                  <span className="font-medium">{formatNumber(metrics.apm.avgResponseTime)}ms</span>
                </div>
              </div>
            </div>

            {/* Circuit Breakers */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">Circuit Breakers</h3>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(metrics.circuitBreakers.open, { warning: 1, critical: 3 })
                }`}>
                  {metrics.circuitBreakers.open === 0 ? 'Saudável' : 'Atenção'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-medium">{metrics.circuitBreakers.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Abertos</span>
                  <span className="font-medium text-red-600">{metrics.circuitBreakers.open}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fechados</span>
                  <span className="font-medium text-green-600">{metrics.circuitBreakers.closed}</span>
                </div>
              </div>
            </div>

            {/* Cache */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Cache</h3>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(100 - metrics.cache.hitRate, { warning: 20, critical: 40 })
                }`}>
                  {metrics.cache.hitRate > 80 ? 'Excelente' : metrics.cache.hitRate > 60 ? 'Bom' : 'Baixo'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hit Rate</span>
                  <span className="font-medium">{formatNumber(metrics.cache.hitRate, 1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Chaves</span>
                  <span className="font-medium">{formatNumber(metrics.cache.totalKeys)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Operações</span>
                  <span className="font-medium">{formatNumber(metrics.cache.operations)}</span>
                </div>
              </div>
            </div>

            {/* Alertas */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-900">Alertas</h3>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(metrics.alerts.active, { warning: 5, critical: 10 })
                }`}>
                  {metrics.alerts.active === 0 ? 'Limpo' : metrics.alerts.active < 5 ? 'Atenção' : 'Crítico'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ativos</span>
                  <span className="font-medium text-red-600">{metrics.alerts.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Resolvidos</span>
                  <span className="font-medium text-green-600">{metrics.alerts.resolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Escalados</span>
                  <span className="font-medium text-yellow-600">{metrics.alerts.escalated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monitor de tokens compacto */}
          <TokenMonitorCompact />
        </div>
      )}

      {selectedTab === 'tokens' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <TokenMonitorCompact className="border-0 shadow-none" />
        </div>
      )}

      {selectedTab === 'webhooks' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <WebhookMonitor />
        </div>
      )}

      {selectedTab === 'logs' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Logs Recentes</h3>
          
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  log.level === 'error' ? 'bg-red-500' :
                  log.level === 'warn' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {log.service}
                    </span>
                    <span className="text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MonitoringDashboard