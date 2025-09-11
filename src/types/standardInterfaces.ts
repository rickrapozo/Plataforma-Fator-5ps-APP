/**
 * Interfaces TypeScript padronizadas para o projeto Essential Factor 5P
 * Centraliza todas as definições de tipos para consistência
 */

// === CORE TYPES ===

/**
 * Identificador único universal
 */
export type UUID = string

/**
 * Timestamp em formato ISO
 */
export type ISOTimestamp = string

/**
 * Status genérico para entidades
 */
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'archived'

/**
 * Prioridade genérica
 */
export type Priority = 'low' | 'medium' | 'high' | 'critical'

// === USER INTERFACES ===

/**
 * Interface base para usuário
 */
export interface BaseUser {
  id: UUID
  email: string
  name: string
  avatar?: string
  createdAt: ISOTimestamp
  updatedAt: ISOTimestamp
  status: EntityStatus
  isAdmin?: boolean
  role?: 'user' | 'admin' | 'super_admin'
  permissions?: string[]
}

/**
 * Perfil completo do usuário
 */
export interface UserProfile extends BaseUser {
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  timezone: string
  language: string
  preferences: UserPreferences
  subscription: SubscriptionInfo
  progress: UserProgress
}

/**
 * Preferências do usuário
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  notifications: NotificationSettings
  privacy: PrivacySettings
  accessibility: AccessibilitySettings
}

/**
 * Configurações de notificação
 */
export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  reminders: boolean
  marketing: boolean
  frequency: 'immediate' | 'daily' | 'weekly' | 'never'
}

/**
 * Configurações de privacidade
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  dataSharing: boolean
  analytics: boolean
  cookies: CookieConsent
}

/**
 * Configurações de acessibilidade
 */
export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
}

/**
 * Consentimento de cookies
 */
export interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
  timestamp: ISOTimestamp
}

// === SUBSCRIPTION INTERFACES ===

/**
 * Informações de assinatura
 */
export interface SubscriptionInfo {
  id: UUID
  userId: UUID
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodStart: ISOTimestamp
  currentPeriodEnd: ISOTimestamp
  cancelAtPeriodEnd: boolean
  trialEnd?: ISOTimestamp
  metadata?: Record<string, any>
}

/**
 * Planos de assinatura
 */
export type SubscriptionPlan = 'free' | 'premium' | 'pro' | 'enterprise'

/**
 * Status da assinatura
 */
export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'past_due' 
  | 'trialing' 
  | 'unpaid'

// === PROGRESS INTERFACES ===

/**
 * Progresso do usuário
 */
export interface UserProgress {
  id: UUID
  userId: UUID
  level: number
  experience: number
  streak: StreakInfo
  achievements: Achievement[]
  stats: UserStats
  lastActivity: ISOTimestamp
}

/**
 * Informações de sequência (streak)
 */
export interface StreakInfo {
  current: number
  longest: number
  lastUpdate: ISOTimestamp
  type: 'daily' | 'weekly' | 'monthly'
}

/**
 * Conquista/Achievement
 */
export interface Achievement {
  id: UUID
  name: string
  description: string
  icon: string
  category: AchievementCategory
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt: ISOTimestamp
  progress: number
  maxProgress: number
}

/**
 * Categoria de conquista
 */
export type AchievementCategory = 
  | 'daily_protocol' 
  | 'streak' 
  | 'learning' 
  | 'community' 
  | 'wellness' 
  | 'milestone'

/**
 * Estatísticas do usuário
 */
export interface UserStats {
  totalSessions: number
  totalMinutes: number
  averageSessionLength: number
  completedProtocols: number
  aiInteractions: number
  communityPosts: number
  lastWeekActivity: number
  monthlyGoalProgress: number
}

// === PROTOCOL INTERFACES ===

/**
 * Protocolo diário base
 */
export interface DailyProtocol {
  id: UUID
  userId: UUID
  date: string // YYYY-MM-DD
  fivePs: FivePsData
  completed: boolean
  completedAt?: ISOTimestamp
  notes?: string
  mood: MoodLevel
  energy: EnergyLevel
}

/**
 * Dados dos 5Ps
 */
export interface FivePsData {
  purpose: PurposeData
  presence: PresenceData
  physiology: PhysiologyData
  psychology: PsychologyData
  productivity: ProductivityData
}

/**
 * Dados de Propósito
 */
export interface PurposeData {
  completed: boolean
  reflection: string
  goals: string[]
  alignment: number // 1-10
}

/**
 * Dados de Presença
 */
export interface PresenceData {
  completed: boolean
  meditationMinutes: number
  mindfulnessActivities: string[]
  gratitude: string[]
}

/**
 * Dados de Fisiologia
 */
export interface PhysiologyData {
  completed: boolean
  exercise: ExerciseData
  nutrition: NutritionData
  sleep: SleepData
  hydration: number // glasses of water
}

/**
 * Dados de exercício
 */
export interface ExerciseData {
  type: string
  duration: number // minutes
  intensity: 'low' | 'medium' | 'high'
  completed: boolean
}

/**
 * Dados de nutrição
 */
export interface NutritionData {
  meals: number
  quality: number // 1-10
  supplements: string[]
  notes: string
}

/**
 * Dados de sono
 */
export interface SleepData {
  bedtime: string // HH:MM
  wakeTime: string // HH:MM
  quality: number // 1-10
  duration: number // hours
}

/**
 * Dados de Psicologia
 */
export interface PsychologyData {
  completed: boolean
  affirmations: string[]
  journaling: string
  emotionalState: EmotionalState
  stressLevel: number // 1-10
}

/**
 * Estado emocional
 */
export interface EmotionalState {
  primary: string
  secondary?: string
  intensity: number // 1-10
  triggers?: string[]
}

/**
 * Dados de Produtividade
 */
export interface ProductivityData {
  completed: boolean
  tasks: TaskData[]
  focusTime: number // minutes
  priorities: string[]
  achievements: string[]
}

/**
 * Dados de tarefa
 */
export interface TaskData {
  id: UUID
  title: string
  completed: boolean
  priority: Priority
  category: string
  estimatedTime: number // minutes
  actualTime?: number // minutes
}

/**
 * Níveis de humor e energia
 */
export type MoodLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type EnergyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

// === AI INTERFACES ===

/**
 * Mensagem para IA Terapeuta
 */
export interface AIMessage {
  id: UUID
  userId: UUID
  content: string
  type: 'user' | 'assistant'
  timestamp: ISOTimestamp
  context?: AIContext
  metadata?: Record<string, any>
}

/**
 * Contexto para IA
 */
export interface AIContext {
  userProfile: Partial<UserProfile>
  recentProtocols: DailyProtocol[]
  currentMood: MoodLevel
  sessionGoal?: string
  previousMessages: AIMessage[]
}

/**
 * Resposta da IA
 */
export interface AIResponse {
  content: string
  suggestions: string[]
  exercises?: string[]
  confidence: number // 0-1
  rateLimitInfo?: RateLimitInfo
  metadata?: Record<string, any>
}

// === RATE LIMITING INTERFACES ===

/**
 * Informações de rate limiting
 */
export interface RateLimitInfo {
  remaining: number
  resetTime: number
  totalHits: number
  limit: number
  windowMs: number
}

/**
 * Configuração de rate limit
 */
export interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
}

// === ANALYTICS INTERFACES ===

/**
 * Evento de analytics
 */
export interface AnalyticsEvent {
  id: UUID
  userId?: UUID
  event: string
  category: string
  properties: Record<string, any>
  timestamp: ISOTimestamp
  sessionId: string
  userAgent?: string
  ip?: string
}

/**
 * Métricas do sistema
 */
export interface SystemMetrics {
  timestamp: ISOTimestamp
  activeUsers: number
  totalSessions: number
  averageSessionDuration: number
  errorRate: number
  responseTime: number
  memoryUsage: number
  cpuUsage: number
  page_views: number
  memory_usage: number
  cpu_usage: number
}

// === API INTERFACES ===

/**
 * Resposta padrão da API
 */
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: APIError
  metadata?: {
    timestamp: ISOTimestamp
    requestId: UUID
    version: string
  }
}

/**
 * Erro da API
 */
export interface APIError {
  code: string
  message: string
  details?: Record<string, any>
  stack?: string
}

/**
 * Parâmetros de paginação
 */
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Resposta paginada
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// === UTILITY TYPES ===

/**
 * Torna todas as propriedades opcionais exceto as especificadas
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

/**
 * Torna todas as propriedades obrigatórias exceto as especificadas
 */
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>

/**
 * Extrai o tipo de um array
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

/**
 * Cria um tipo com propriedades aninhadas opcionais
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Omite propriedades aninhadas
 */
export type DeepOmit<T, K extends string> = {
  [P in keyof T]: P extends K
    ? never
    : T[P] extends object
    ? DeepOmit<T[P], K>
    : T[P]
}

// === VALIDATION SCHEMAS ===

/**
 * Schema de validação base
 */
export interface ValidationSchema {
  required: string[]
  optional: string[]
  rules: Record<string, ValidationRule[]>
}

/**
 * Regra de validação
 */
export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date' | 'custom'
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
  message: string
}

/**
 * Resultado de validação
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Erro de validação
 */
export interface ValidationError {
  field: string
  message: string
  value: any
}

// === APP STATE INTERFACES ===

/**
 * Estado da aplicação
 */
export interface AppState {
  user: BaseUser | null
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  hasActivePlan: boolean
  theme: 'light' | 'dark'
  notifications: any[]
  loading: boolean
}

// === AUDIO INTERFACES ===

/**
 * Interface para faixas de áudio
 */
export interface AudioTrack {
  id: string
  title: string
  artist: string
  description: string
  duration: string
  category: string
  youtubeUrl?: string
  spotifyUrl?: string
  thumbnail: string
  tags: string[]
  mood: 'relaxing' | 'energizing' | 'focused' | 'peaceful' | 'inspiring'
  source?: 'youtube' | 'spotify' | 'local'
}

// === EXPORT ALL ===

/**
 * Todos os tipos já estão exportados individualmente acima
 * Não é necessário re-exportar para evitar conflitos
 */