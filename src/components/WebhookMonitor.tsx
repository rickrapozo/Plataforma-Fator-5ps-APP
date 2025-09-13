import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Progress,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/index'
import {
  RefreshCw,
  Play,
  Pause,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  BarChart3,
  Filter,
  Download,
  Upload,
  Settings,
  Eye,
  RotateCcw,
} from 'lucide-react'
import { webhookRetryService, WebhookStatus, WebhookPriority, type WebhookPayload, type WebhookStats } from '../services/webhookRetryService'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/use-toast'
import { loggerService } from '../services/loggerService'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Interface para filtros
 */
interface WebhookFilters {
  status?: WebhookStatus
  priority?: WebhookPriority
  domain?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

/**
 * Interface para webhook com dados estendidos
 */
interface ExtendedWebhook extends WebhookPayload {
  status: WebhookStatus
  attemptCount: number
  lastError?: string
  nextRetryAt?: number
  domain: string
}

/**
 * Obtém cor do status
 */
const getStatusColor = (status: WebhookStatus): string => {
  switch (status) {
    case WebhookStatus.SUCCESS:
      return 'bg-green-100 text-green-800'
    case WebhookStatus.FAILED:
      return 'bg-red-100 text-red-800'
    case WebhookStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800'
    case WebhookStatus.PROCESSING:
      return 'bg-blue-100 text-blue-800'
    case WebhookStatus.DEAD_LETTER:
      return 'bg-gray-100 text-gray-800'
    case WebhookStatus.CANCELLED:
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Formata duração
 */
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

/**
 * Componente principal de monitoramento de webhooks
 */
export const WebhookMonitor: React.FC = () => {
  const [webhooks, setWebhooks] = useState<ExtendedWebhook[]>([])
  const [stats, setStats] = useState<WebhookStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<WebhookFilters>({})
  const [selectedWebhook, setSelectedWebhook] = useState<ExtendedWebhook | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const { toast } = useToast()

  /**
   * Carrega webhooks do banco de dados
   */
  const loadWebhooks = useCallback(async () => {
    try {
      let query = supabase
        .from('webhook_queue')
        .select(`
          *,
          webhook_attempts!inner(
            attempt_number,
            error,
            next_retry_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      // Aplica filtros
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.domain) {
        query = query.ilike('url', `%${filters.domain}%`)
      }
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString())
      }

      const { data, error } = await query

      if (error) throw error

      const extendedWebhooks: ExtendedWebhook[] = data?.map(webhook => {
        const attempts = webhook.webhook_attempts || []
        const lastAttempt = attempts[attempts.length - 1]
        
        return {
          id: webhook.id,
          url: webhook.url,
          method: webhook.method,
          headers: webhook.headers,
          body: webhook.body,
          priority: webhook.priority,
          maxRetries: webhook.max_retries,
          retryDelay: webhook.retry_delay,
          timeout: webhook.timeout,
          metadata: webhook.metadata,
          createdAt: new Date(webhook.created_at).getTime(),
          scheduledAt: webhook.scheduled_at ? new Date(webhook.scheduled_at).getTime() : undefined,
          expiresAt: webhook.expires_at ? new Date(webhook.expires_at).getTime() : undefined,
          status: webhook.status,
          attemptCount: attempts.length,
          lastError: lastAttempt?.error,
          nextRetryAt: lastAttempt?.next_retry_at ? new Date(lastAttempt.next_retry_at).getTime() : undefined,
          domain: new URL(webhook.url).hostname
        }
      }) || []

      setWebhooks(extendedWebhooks)
    } catch (error) {
      loggerService.error('Failed to load webhooks', {
        error: (error as Error).message
      })
      
      toast({
        title: 'Erro ao carregar webhooks',
        description: 'Não foi possível carregar a lista de webhooks.',
        variant: 'destructive'
      })
    }
  }, [filters, toast])

  /**
   * Carrega estatísticas
   */
  const loadStats = useCallback(async () => {
    try {
      const stats = await webhookRetryService.getStats()
      setStats(stats)
    } catch (error) {
      loggerService.error('Failed to load webhook stats', {
        error: (error as Error).message
      })
    }
  }, [])

  /**
   * Reprocessa webhook
   */
  const reprocessWebhook = async (webhookId: string) => {
    try {
      const success = await webhookRetryService.reprocessWebhook(webhookId)
      
      if (success) {
        toast({
          title: 'Webhook reprocessado',
          description: 'O webhook foi adicionado novamente à fila de processamento.'
        })
        await loadWebhooks()
      } else {
        toast({
          title: 'Erro ao reprocessar',
          description: 'Não foi possível reprocessar o webhook.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao reprocessar',
        description: 'Ocorreu um erro ao tentar reprocessar o webhook.',
        variant: 'destructive'
      })
    }
  }

  /**
   * Cancela webhook
   */
  const cancelWebhook = async (webhookId: string) => {
    try {
      const success = await webhookRetryService.cancelWebhook(webhookId, 'Cancelado pelo usuário')
      
      if (success) {
        toast({
          title: 'Webhook cancelado',
          description: 'O webhook foi cancelado com sucesso.'
        })
        await loadWebhooks()
      } else {
        toast({
          title: 'Erro ao cancelar',
          description: 'Não foi possível cancelar o webhook.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao cancelar',
        description: 'Ocorreu um erro ao tentar cancelar o webhook.',
        variant: 'destructive'
      })
    }
  }

  /**
   * Obtém ícone do status
   */
  const getStatusIcon = (status: WebhookStatus) => {
    switch (status) {
      case WebhookStatus.SUCCESS:
        return <CheckCircle className="h-4 w-4" />
      case WebhookStatus.FAILED:
        return <XCircle className="h-4 w-4" />
      case WebhookStatus.PENDING:
        return <Clock className="h-4 w-4" />
      case WebhookStatus.PROCESSING:
        return <Zap className="h-4 w-4" />
      case WebhookStatus.DEAD_LETTER:
        return <AlertTriangle className="h-4 w-4" />
      case WebhookStatus.CANCELLED:
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  /**
   * Obtém cor da prioridade
   */
  const getPriorityColor = (priority: WebhookPriority): string => {
    switch (priority) {
      case WebhookPriority.EMERGENCY:
        return 'bg-red-500'
      case WebhookPriority.CRITICAL:
        return 'bg-red-400'
      case WebhookPriority.HIGH:
        return 'bg-orange-400'
      case WebhookPriority.NORMAL:
        return 'bg-blue-400'
      case WebhookPriority.LOW:
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  // Efeito para carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadWebhooks(), loadStats()])
      setLoading(false)
    }

    loadData()
  }, [loadWebhooks, loadStats])

  // Efeito para auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadWebhooks()
      loadStats()
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh, loadWebhooks, loadStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando webhooks...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWebhooks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Taxa de sucesso: {stats?.successRate.toFixed(1) || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingWebhooks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Processando: {stats?.processingWebhooks || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dead Letter</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.deadLetterWebhooks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Falharam: {stats?.failedWebhooks || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageProcessingTime ? formatDuration(stats.averageProcessingTime) : '0ms'}
            </div>
            <p className="text-xs text-muted-foreground">
              Throughput: {stats?.throughputPerMinute || 0}/min
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monitor de Webhooks</CardTitle>
              <CardDescription>
                Monitore e gerencie webhooks com retry exponencial e dead letter queue
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {autoRefresh ? 'Pausar' : 'Iniciar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadWebhooks()
                  loadStats()
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Select
              value={filters.status || ''}
              onValueChange={(value: string) => 
                setFilters(prev => ({ ...prev, status: value as WebhookStatus || undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value={WebhookStatus.PENDING}>Pendente</SelectItem>
                <SelectItem value={WebhookStatus.PROCESSING}>Processando</SelectItem>
                <SelectItem value={WebhookStatus.SUCCESS}>Sucesso</SelectItem>
                <SelectItem value={WebhookStatus.FAILED}>Falhou</SelectItem>
                <SelectItem value={WebhookStatus.DEAD_LETTER}>Dead Letter</SelectItem>
                <SelectItem value={WebhookStatus.CANCELLED}>Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority?.toString() || ''}
              onValueChange={(value: string) => 
                setFilters(prev => ({ ...prev, priority: value ? parseInt(value) as WebhookPriority : undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="5">Emergência</SelectItem>
                <SelectItem value="4">Crítica</SelectItem>
                <SelectItem value="3">Alta</SelectItem>
                <SelectItem value="2">Normal</SelectItem>
                <SelectItem value="1">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filtrar por domínio..."
              value={filters.domain || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value || undefined }))}
              className="w-48"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({})}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>

          {/* Tabela de webhooks */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Tentativas</TableHead>
                  <TableHead>Criado</TableHead>
                  <TableHead>Próximo Retry</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className={getStatusColor(webhook.status)}>
                              {getStatusIcon(webhook.status)}
                              <span className="ml-1">{webhook.status}</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {webhook.lastError && (
                              <p className="max-w-xs">{webhook.lastError}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        <span className="font-mono text-sm">{webhook.method}</span>
                        <span className="ml-2">{webhook.url}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {webhook.domain}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className={`w-2 h-2 rounded-full mr-2 ${getPriorityColor(webhook.priority)}`}
                        />
                        {webhook.priority}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <span className="font-medium">{webhook.attemptCount}</span>
                        <span className="text-muted-foreground">/{webhook.maxRetries}</span>
                      </div>
                      {webhook.attemptCount > 0 && (
                        <Progress 
                          value={(webhook.attemptCount / webhook.maxRetries) * 100} 
                          className="w-16 h-1 mt-1"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(webhook.createdAt, { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(webhook.createdAt, 'dd/MM/yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {webhook.nextRetryAt ? (
                        <div className="text-sm">
                          {webhook.nextRetryAt > Date.now() ? (
                            <span className="text-orange-600">
                              {formatDistanceToNow(webhook.nextRetryAt, { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          ) : (
                            <span className="text-green-600">Pronto</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedWebhook(webhook)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {webhook.status === WebhookStatus.DEAD_LETTER && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => reprocessWebhook(webhook.id)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reprocessar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {[WebhookStatus.PENDING, WebhookStatus.PROCESSING].includes(webhook.status) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => cancelWebhook(webhook.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cancelar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {webhooks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum webhook encontrado com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes do webhook */}
      {selectedWebhook && (
        <WebhookDetailsModal
          webhook={selectedWebhook}
          onClose={() => setSelectedWebhook(null)}
        />
      )}
    </div>
  )
}

/**
 * Modal de detalhes do webhook
 */
interface WebhookDetailsModalProps {
  webhook: ExtendedWebhook
  onClose: () => void
}

const WebhookDetailsModal: React.FC<WebhookDetailsModalProps> = ({ webhook, onClose }) => {
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        const { data, error } = await supabase
          .from('webhook_attempts')
          .select('*')
          .eq('webhook_id', webhook.id)
          .order('attempt_number', { ascending: true })

        if (error) throw error
        setAttempts(data || [])
      } catch (error) {
        console.error('Failed to load attempts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAttempts()
  }, [webhook.id])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Detalhes do Webhook</h2>
            <Button variant="ghost" onClick={onClose}>
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="attempts">Tentativas</TabsTrigger>
              <TabsTrigger value="payload">Payload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">ID</label>
                  <p className="font-mono text-sm">{webhook.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={`ml-2 ${getStatusColor(webhook.status)}`}>
                    {webhook.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">URL</label>
                  <p className="font-mono text-sm break-all">{webhook.url}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Método</label>
                  <p className="font-mono text-sm">{webhook.method}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <p>{webhook.priority}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Timeout</label>
                  <p>{webhook.timeout}ms</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Max Retries</label>
                  <p>{webhook.maxRetries}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Retry Delay</label>
                  <p>{webhook.retryDelay}ms</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Criado em</label>
                  <p>{format(webhook.createdAt, 'dd/MM/yyyy HH:mm:ss')}</p>
                </div>
                {webhook.scheduledAt && (
                  <div>
                    <label className="text-sm font-medium">Agendado para</label>
                    <p>{format(webhook.scheduledAt, 'dd/MM/yyyy HH:mm:ss')}</p>
                  </div>
                )}
                {webhook.expiresAt && (
                  <div>
                    <label className="text-sm font-medium">Expira em</label>
                    <p>{format(webhook.expiresAt, 'dd/MM/yyyy HH:mm:ss')}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="attempts">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {attempts.map((attempt) => (
                    <Card key={attempt.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Tentativa #{attempt.attempt_number}</span>
                          <Badge className={getStatusColor(attempt.status)}>
                            {attempt.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="font-medium">Iniciado em</label>
                            <p>{format(new Date(attempt.started_at), 'dd/MM/yyyy HH:mm:ss')}</p>
                          </div>
                          {attempt.completed_at && (
                            <div>
                              <label className="font-medium">Concluído em</label>
                              <p>{format(new Date(attempt.completed_at), 'dd/MM/yyyy HH:mm:ss')}</p>
                            </div>
                          )}
                          {attempt.duration && (
                            <div>
                              <label className="font-medium">Duração</label>
                              <p>{formatDuration(attempt.duration)}</p>
                            </div>
                          )}
                          {attempt.http_status && (
                            <div>
                              <label className="font-medium">Status HTTP</label>
                              <p>{attempt.http_status}</p>
                            </div>
                          )}
                          {attempt.error && (
                            <div className="col-span-2">
                              <label className="font-medium">Erro</label>
                              <Alert className="mt-1">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{attempt.error}</AlertDescription>
                              </Alert>
                            </div>
                          )}
                          {attempt.next_retry_at && (
                            <div>
                              <label className="font-medium">Próximo retry</label>
                              <p>{format(new Date(attempt.next_retry_at), 'dd/MM/yyyy HH:mm:ss')}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="payload">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Headers</label>
                  <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
                    {JSON.stringify(webhook.headers, null, 2)}
                  </pre>
                </div>
                {webhook.body && (
                  <div>
                    <label className="text-sm font-medium">Body</label>
                    <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
                      {JSON.stringify(webhook.body, null, 2)}
                    </pre>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Metadata</label>
                  <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
                    {JSON.stringify(webhook.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default WebhookMonitor