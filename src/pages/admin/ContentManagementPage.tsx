import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Mail,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Star,
  TrendingUp,
  Video,
  BookOpen,
  Headphones,
  RefreshCw,
  Shield
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { useAdminAuth } from '../../hooks/useSecureAuth'
import { dataService } from '../../services/dataService'


interface Content {
  id: string
  title: string
  type: 'journey' | 'audio' | 'template' | 'article' | 'video'
  status: 'published' | 'draft' | 'archived' | 'scheduled'
  author: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  views: number
  likes: number
  rating: number
  duration?: string // Para áudios e vídeos
  category: string
  tags: string[]
  description: string
  thumbnail?: string
}

const ContentManagementPage: React.FC = () => {
  const {} = useAppStore()
  const navigate = useNavigate()
  const { isLoading: authLoading, isAuthorized, error: authError, logAction } = useAdminAuth()
  const [contents, setContents] = useState<Content[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedContents, setSelectedContents] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const contentsPerPage = 12

  // Load content data from Supabase
  useEffect(() => {
    if (!isAuthorized) return
    
    const loadContents = async () => {
      try {
        await logAction('access_content_management', { page: 'ContentManagementPage' })
        const contentData = await dataService.getContentMetrics()
        setContents(contentData)
      } catch (error) {
        console.error('Erro ao carregar conteúdos:', error)
        // Fallback to mock data if needed
        const mockContents: Content[] = [
          {
            id: '1',
            title: 'Jornada da Autoestima',
            type: 'journey',
            status: 'published',
            author: 'Dr. Ana Silva',
            createdAt: '2024-01-10T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z',
            publishedAt: '2024-01-12T00:00:00Z',
            views: 1247,
            likes: 89,
            rating: 4.8,
            category: 'Desenvolvimento Pessoal',
            tags: ['autoestima', 'confiança', 'mindset'],
            description: 'Uma jornada completa para desenvolver a autoestima e confiança pessoal'
          },
          {
            id: '2',
            title: 'Meditação Matinal',
            type: 'audio',
            status: 'published',
            author: 'Prof. João Santos',
            createdAt: '2024-01-08T00:00:00Z',
            updatedAt: '2024-01-14T00:00:00Z',
            publishedAt: '2024-01-09T00:00:00Z',
            views: 892,
            likes: 156,
            rating: 4.9,
            duration: '15:30',
            category: 'Meditação',
            tags: ['meditação', 'manhã', 'mindfulness'],
            description: 'Áudio guiado para meditação matinal e início do dia com energia positiva'
          },
          {
            id: '3',
            title: 'Template Boas-vindas Premium',
            type: 'template',
            status: 'published',
            author: 'Equipe Marketing',
            createdAt: '2024-01-05T00:00:00Z',
            updatedAt: '2024-01-13T00:00:00Z',
            publishedAt: '2024-01-06T00:00:00Z',
            views: 456,
            likes: 23,
            rating: 4.5,
            category: 'Email Marketing',
            tags: ['boas-vindas', 'premium', 'onboarding'],
            description: 'Template de email para dar boas-vindas aos novos usuários premium'
          },
          {
            id: '4',
            title: 'Respiração Consciente',
            type: 'audio',
            status: 'published',
            author: 'Dra. Maria Costa',
            createdAt: '2024-01-03T00:00:00Z',
            updatedAt: '2024-01-12T00:00:00Z',
            publishedAt: '2024-01-04T00:00:00Z',
            views: 634,
            likes: 78,
            rating: 4.6,
            duration: '12:45',
            category: 'Respiração',
            tags: ['respiração', 'relaxamento', 'ansiedade'],
            description: 'Exercícios de respiração consciente para reduzir ansiedade e stress'
          },
          {
            id: '5',
            title: 'Protocolo Anti-Ansiedade',
            type: 'journey',
            status: 'draft',
            author: 'Dr. Pedro Lima',
            createdAt: '2024-01-14T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z',
            views: 0,
            likes: 0,
            rating: 0,
            category: 'Saúde Mental',
            tags: ['ansiedade', 'protocolo', 'terapia'],
            description: 'Protocolo completo para gerenciamento e redução da ansiedade'
          },
          {
            id: '6',
            title: 'Mindfulness para Iniciantes',
            type: 'video',
            status: 'scheduled',
            author: 'Prof. Carla Oliveira',
            createdAt: '2024-01-12T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z',
            publishedAt: '2024-01-20T00:00:00Z',
            views: 0,
            likes: 0,
            rating: 0,
            duration: '25:15',
            category: 'Mindfulness',
            tags: ['mindfulness', 'iniciantes', 'meditação'],
            description: 'Vídeo introdutório sobre mindfulness para pessoas que estão começando'
          }
        ]
        setContents(mockContents)
      }
    }
    
    loadContents()
  }, [])

  const categories = ['Desenvolvimento Pessoal', 'Meditação', 'Email Marketing', 'Respiração', 'Saúde Mental', 'Mindfulness']

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || content.type === filterType
    const matchesStatus = filterStatus === 'all' || content.status === filterStatus
    const matchesCategory = filterCategory === 'all' || content.category === filterCategory
    return matchesSearch && matchesType && matchesStatus && matchesCategory
  })

  const sortedContents = [...filteredContents].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Content]
    let bValue: any = b[sortBy as keyof Content]
    
    if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'publishedAt') {
      aValue = new Date(aValue || 0).getTime()
      bValue = new Date(bValue || 0).getTime()
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const totalPages = Math.ceil(sortedContents.length / contentsPerPage)
  const currentContents = sortedContents.slice(
    (currentPage - 1) * contentsPerPage,
    currentPage * contentsPerPage
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'journey': return BookOpen
      case 'audio': return Headphones
      case 'template': return Mail
      case 'article': return FileText
      case 'video': return Video
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'journey': return 'text-royal-gold'
      case 'audio': return 'text-bright-gold'
      case 'template': return 'text-success-green'
      case 'article': return 'text-royal-purple'
      case 'video': return 'text-error-red'
      default: return 'text-pearl-white/60'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-success-green'
      case 'draft': return 'text-warning-yellow'
      case 'archived': return 'text-pearl-white/60'
      case 'scheduled': return 'text-bright-gold'
      default: return 'text-pearl-white/60'
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      published: 'bg-success-green/20 text-success-green border-success-green/30',
      draft: 'bg-warning-yellow/20 text-warning-yellow border-warning-yellow/30',
      archived: 'bg-pearl-white/20 text-pearl-white/60 border-pearl-white/30',
      scheduled: 'bg-bright-gold/20 text-bright-gold border-bright-gold/30'
    }
    
    const labels = {
      published: 'Publicado',
      draft: 'Rascunho',
      archived: 'Arquivado',
      scheduled: 'Agendado'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleSelectContent = (contentId: string) => {
    setSelectedContents(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedContents.length === currentContents.length) {
      setSelectedContents([])
    } else {
      setSelectedContents(currentContents.map(content => content.id))
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Ação em lote: ${action} para conteúdos:`, selectedContents)
    setSelectedContents([])
  }

  const handleDeleteContent = async (contentId: string) => {
    if (confirm('Tem certeza que deseja excluir este conteúdo?')) {
      try {
        await dataService.deleteContent(contentId)
        setContents(prev => prev.filter(content => content.id !== contentId))
      } catch (error) {
        console.error('Erro ao excluir conteúdo:', error)
        alert('Erro ao excluir conteúdo. Tente novamente.')
      }
    }
  }

  const getStatsData = () => {
    const totalViews = contents.reduce((sum, content) => sum + content.views, 0)
    const totalLikes = contents.reduce((sum, content) => sum + content.likes, 0)
    const avgRating = contents.filter(c => c.rating > 0).reduce((sum, content) => sum + content.rating, 0) / contents.filter(c => c.rating > 0).length || 0
    const publishedCount = contents.filter(c => c.status === 'published').length
    
    return { totalViews, totalLikes, avgRating, publishedCount }
  }

  const stats = getStatsData()

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-navy via-royal-purple to-midnight-blue flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-8 h-8 text-royal-gold animate-spin mx-auto mb-4" />
          <p className="text-white">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Access denied state
  if (!isAuthorized || authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-navy via-royal-purple to-midnight-blue flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-pearl-white/80 mb-6">
            Você não tem permissão para acessar o gerenciamento de conteúdo.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-royal-gold hover:bg-royal-gold/80 text-white rounded-lg transition-colors"
          >
            Voltar ao Dashboard
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
          <h1 className="text-4xl font-bold text-white mb-2">Gerenciamento de Conteúdo</h1>
          <p className="text-pearl-white/80">Gerencie jornadas, áudios, templates e todo o conteúdo da plataforma</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-8 h-8 text-royal-gold" />
              <div>
                <h3 className="text-white font-semibold">Total Conteúdos</h3>
                <p className="text-pearl-white/60 text-sm">Publicados</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stats.publishedCount}</p>
            <p className="text-success-green text-sm mt-2">+{contents.filter(c => c.status === 'draft').length} rascunhos</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-8 h-8 text-bright-gold" />
              <div>
                <h3 className="text-white font-semibold">Visualizações</h3>
                <p className="text-pearl-white/60 text-sm">Total</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
            <p className="text-royal-gold text-sm mt-2">Este mês</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Star className="w-8 h-8 text-success-green" />
              <div>
                <h3 className="text-white font-semibold">Avaliação Média</h3>
                <p className="text-pearl-white/60 text-sm">Geral</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stats.avgRating.toFixed(1)}</p>
            <p className="text-success-green text-sm mt-2">★ {stats.totalLikes} curtidas</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-8 h-8 text-royal-purple" />
              <div>
                <h3 className="text-white font-semibold">Engajamento</h3>
                <p className="text-pearl-white/60 text-sm">Taxa média</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">87%</p>
            <p className="text-success-green text-sm mt-2">+12% vs mês anterior</p>
          </div>
        </div>

        {/* Controls */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-4">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pearl-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-pearl-white/60 focus:outline-none focus:border-royal-gold w-64"
                />
              </div>

              {/* Filters */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-royal-gold"
              >
                <option value="all">Todos os tipos</option>
                <option value="journey">Jornadas</option>
                <option value="audio">Áudios</option>
                <option value="template">Templates</option>
                <option value="article">Artigos</option>
                <option value="video">Vídeos</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-royal-gold"
              >
                <option value="all">Todos os status</option>
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
                <option value="scheduled">Agendado</option>
                <option value="archived">Arquivado</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-royal-gold"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button className="neuro-button bg-success-green hover:bg-success-green/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Novo Conteúdo</span>
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

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <span className="text-pearl-white/80 text-sm">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-royal-gold"
            >
              <option value="updatedAt">Última atualização</option>
              <option value="createdAt">Data de criação</option>
              <option value="publishedAt">Data de publicação</option>
              <option value="views">Visualizações</option>
              <option value="likes">Curtidas</option>
              <option value="rating">Avaliação</option>
              <option value="title">Título</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white text-sm transition-colors"
            >
              {sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedContents.length > 0 && (
            <div className="mt-4 p-4 bg-royal-gold/20 border border-royal-gold/30 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-white">
                  {selectedContents.length} conteúdo(s) selecionado(s)
                </p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleBulkAction('publish')}
                    className="px-3 py-1 bg-success-green hover:bg-success-green/80 text-white rounded transition-colors text-sm"
                  >
                    Publicar
                  </button>
                  <button 
                    onClick={() => handleBulkAction('archive')}
                    className="px-3 py-1 bg-warning-yellow hover:bg-warning-yellow/80 text-white rounded transition-colors text-sm"
                  >
                    Arquivar
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {currentContents.map((content, index) => {
            const TypeIcon = getTypeIcon(content.type)
            return (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card overflow-hidden hover:scale-105 transition-transform duration-300"
              >
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedContents.includes(content.id)}
                        onChange={() => handleSelectContent(content.id)}
                        className="rounded border-white/20 bg-white/10 text-royal-gold focus:ring-royal-gold"
                      />
                      <TypeIcon className={`w-5 h-5 ${getTypeColor(content.type)}`} />
                    </div>
                    {getStatusBadge(content.status)}
                  </div>
                  
                  <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                    {content.title}
                  </h3>
                  
                  <p className="text-pearl-white/70 text-sm mb-3 line-clamp-2">
                    {content.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-pearl-white/60">
                    <span>Por {content.author}</span>
                    {content.duration && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{content.duration}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4 border-b border-white/10">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-white font-semibold">{content.views.toLocaleString()}</p>
                      <p className="text-pearl-white/60 text-xs">Visualizações</p>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{content.likes}</p>
                      <p className="text-pearl-white/60 text-xs">Curtidas</p>
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {content.rating > 0 ? content.rating.toFixed(1) : '-'}
                      </p>
                      <p className="text-pearl-white/60 text-xs">Avaliação</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex flex-wrap gap-1">
                    {content.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-white/10 text-pearl-white/80 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {content.tags.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 text-pearl-white/60 text-xs rounded-full">
                        +{content.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-royal-gold hover:bg-royal-gold/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-bright-gold hover:bg-bright-gold/20 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content.id)}
                        className="p-2 text-error-red hover:bg-error-red/20 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-pearl-white/60">
                      {formatDate(content.updatedAt)}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-pearl-white/60 text-sm">
                Mostrando {(currentPage - 1) * contentsPerPage + 1} a {Math.min(currentPage * contentsPerPage, sortedContents.length)} de {sortedContents.length} conteúdos
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                  
                  return (
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
                  )
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentManagementPage