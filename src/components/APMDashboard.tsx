import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/index'
import { Alert, AlertDescription } from './ui/alert'

// Componente Progress simples
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div 
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)
import { supabase } from '../lib/supabase'
import { apmService } from '../services/apmService'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Server,
  TrendingUp,
  Users,
  Zap,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'

// Interfaces
interface MetricData {
  timestamp: string
  value: number
  name: string
}

interface ErrorData {
  id: string
  message: string
  level: 'error' | 'warning' | 'critical'
  timestamp: string
  count: number
}

interface SystemHealth {
  cpu: number
  memory: number
  disk: number
  networkLatency: number
  databaseStatus: 'healthy' | 'degraded' | 'down'
  databaseQueryTime: number
}

interface TransactionData {
  name: string
  avgDuration: number
  count: number
  errorRate: number
}

interface AlertData {
  id: string
  ruleName: string
  metric: string
  value: number
  threshold: number
  triggeredAt: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function APMDashboard() {
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [errors, setErrors] = useState<ErrorData[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 segundos
  const [timeRange, setTimeRange] = useState('1h') // 1h, 6h, 24h, 7d

  // Carrega dados iniciais
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      await Promise.all([
        loadMetrics(),
        loadErrors(),
        loadSystemHealth(),
        loadTransactions(),
        loadAlerts()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados do APM:', error)
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  // Carrega métricas
  const loadMetrics = async () => {
    const timeFilter = getTimeFilter()
    const { data, error } = await supabase
      .from('apm_metrics')
      .select('name, value, timestamp')
      .gte('timestamp', timeFilter)
      .order('timestamp', { ascending: true })
      .limit(1000)

    if (error) throw error

    const processedData = data?.map(item => ({
      timestamp: new Date(item.timestamp).toLocaleTimeString(),
      value: item.value,
      name: item.name
    })) || []

    setMetrics(processedData)
  }

  // Carrega erros
  const loadErrors = async () => {
    const timeFilter = getTimeFilter()
    const { data, error } = await supabase
      .from('apm_errors')
      .select('id, message, level, timestamp')
      .gte('timestamp', timeFilter)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (error) throw error

    // Agrupa erros similares
    const errorMap = new Map<string, ErrorData>()
    data?.forEach(item => {
      const key = `${item.level}-${item.message}`
      if (errorMap.has(key)) {
        errorMap.get(key)!.count++
      } else {
        errorMap.set(key, {
          id: item.id,
          message: item.message,
          level: item.level,
          timestamp: item.timestamp,
          count: 1
        })
      }
    })

    setErrors(Array.from(errorMap.values()))
  }

  // Carrega saúde do sistema
  const loadSystemHealth = async () => {
    try {
      const health = await apmService.collectSystemHealth()
      setSystemHealth({
        cpu: health.cpu,
        memory: health.memory,
        disk: health.disk,
        networkLatency: health.network.latency,
        databaseStatus: health.database.status,
        databaseQueryTime: health.database.queryTime
      })
    } catch (error) {
      console.error('Erro ao carregar saúde do sistema:', error)
    }
  }

  // Carrega transações
  const loadTransactions = async () => {
    const timeFilter = getTimeFilter()
    const { data, error } = await supabase
      .from('apm_transactions')
      .select('name, duration, status')
      .gte('start_time', timeFilter)
      .not('duration', 'is', null)

    if (error) throw error

    // Agrupa por nome da transação
    const transactionMap = new Map<string, { durations: number[], errors: number, total: number }>()
    
    data?.forEach(item => {
      if (!transactionMap.has(item.name)) {
        transactionMap.set(item.name, { durations: [], errors: 0, total: 0 })
      }
      
      const transaction = transactionMap.get(item.name)!
      transaction.durations.push(item.duration)
      transaction.total++
      if (item.status === 'error') {
        transaction.errors++
      }
    })

    const processedTransactions = Array.from(transactionMap.entries()).map(([name, data]) => ({
      name,
      avgDuration: data.durations.reduce((a, b) => a + b, 0) / data.durations.length,
      count: data.total,
      errorRate: (data.errors / data.total) * 100
    }))

    setTransactions(processedTransactions.sort((a, b) => b.avgDuration - a.avgDuration))
  }

  // Carrega alertas
  const loadAlerts = async () => {
    const { data, error } = await supabase
      .from('apm_alerts')
      .select('id, rule_name, metric, value, threshold, triggered_at')
      .is('resolved_at', null)
      .order('triggered_at', { ascending: false })
      .limit(50)

    if (error) throw error

    const processedAlerts = data?.map(item => ({
      id: item.id,
      ruleName: item.rule_name,
      metric: item.metric,
      value: item.value,
      threshold: item.threshold,
      triggeredAt: item.triggered_at
    })) || []

    setAlerts(processedAlerts)
  }

  // Obtém filtro de tempo
  const getTimeFilter = () => {
    const now = new Date()
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString()
      case '6h':
        return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    }
  }

  // Auto refresh
  useEffect(() => {
    loadData()

    if (autoRefresh) {
      const interval = setInterval(loadData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [loadData, autoRefresh, refreshInterval])

  // Obtém status da saúde
  const getHealthStatus = (value: number, type: 'cpu' | 'memory' | 'disk') => {
    if (value < 70) return { status: 'healthy', color: 'text-green-600' }
    if (value < 85) return { status: 'warning', color: 'text-yellow-600' }
    return { status: 'critical', color: 'text-red-600' }
  }

  // Exporta dados
  const exportData = async () => {
    try {
      const data = {
        metrics,
        errors,
        systemHealth,
        transactions,
        alerts,
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `apm-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados do APM...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard APM</h1>
          <p className="text-muted-foreground">Monitoramento de Performance da Aplicação</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1h">Última hora</option>
            <option value="6h">Últimas 6 horas</option>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 dias</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            Auto Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Alertas Ativos */}
      {alerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{alerts.length} alerta(s) ativo(s)</strong>
            <div className="mt-2 space-y-1">
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="text-sm">
                  {alert.ruleName}: {alert.metric} = {alert.value} (limite: {alert.threshold})
                </div>
              ))}
              {alerts.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  +{alerts.length - 3} mais alertas...
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Saúde do Sistema */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.cpu.toFixed(1)}%</div>
              <Progress value={systemHealth.cpu} className="mt-2" />
              <p className={`text-xs mt-1 ${getHealthStatus(systemHealth.cpu, 'cpu').color}`}>
                {getHealthStatus(systemHealth.cpu, 'cpu').status}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memória</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.memory.toFixed(1)}%</div>
              <Progress value={systemHealth.memory} className="mt-2" />
              <p className={`text-xs mt-1 ${getHealthStatus(systemHealth.memory, 'memory').color}`}>
                {getHealthStatus(systemHealth.memory, 'memory').status}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latência de Rede</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.networkLatency}ms</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tempo de resposta da rede
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={systemHealth.databaseStatus === 'healthy' ? 'default' : 'destructive'}
                >
                  {systemHealth.databaseStatus}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Query time: {systemHealth.databaseQueryTime}ms
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs principais */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="errors">Erros</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        {/* Tab de Métricas */}
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Transações */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transações Mais Lentas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 10).map((transaction, index) => (
                  <div key={transaction.name} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{transaction.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.count} execuções
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{transaction.avgDuration.toFixed(2)}ms</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.errorRate.toFixed(1)}% erros
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Erros */}
        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Erros Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errors.slice(0, 20).map((error) => (
                  <div key={error.id} className="flex items-start space-x-3 p-3 border rounded">
                    <Badge 
                      variant={error.level === 'critical' ? 'destructive' : 
                              error.level === 'error' ? 'destructive' : 'secondary'}
                    >
                      {error.level}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{error.message}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(error.timestamp).toLocaleString()} • {error.count} ocorrências
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Alertas */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  Nenhum alerta ativo
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border border-red-200 rounded bg-red-50">
                      <div>
                        <div className="font-medium">{alert.ruleName}</div>
                        <div className="text-sm text-muted-foreground">
                          {alert.metric}: {alert.value} &gt; {alert.threshold}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(alert.triggeredAt).toLocaleString()}
                        </div>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default APMDashboard