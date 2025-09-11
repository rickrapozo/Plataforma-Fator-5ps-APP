/**
 * Configuração global para testes Jest
 * Este arquivo é executado antes de todos os testes
 */

import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { vi, beforeAll, afterAll, afterEach } from 'vitest'
import React from 'react'

// Polyfills para Node.js
Object.assign(global, { TextDecoder, TextEncoder })

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock do IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock do fetch
global.fetch = vi.fn()

// Mock do console para testes mais limpos
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = vi.fn()
  console.warn = vi.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Limpar todos os mocks após cada teste
afterEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})

// Configurações globais para testes
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
}))

// Mock do Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  })),
}))

// Mock do Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    elements: vi.fn(),
    confirmPayment: vi.fn(),
    createPaymentMethod: vi.fn(),
  })),
}))

// Mock do React Hot Toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}))

// Mock do Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    option: 'option',
    img: 'img',
    svg: 'svg',
    path: 'path',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
  useInView: () => true,
}))

// Mock do Lucide React
vi.mock('lucide-react', () => {
  const MockIcon = ({ ...props }: any) => React.createElement('div', { 'data-testid': 'mock-icon', ...props })
  
  return new Proxy({}, {
    get: () => MockIcon
  })
})

// Helpers para testes
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'active' as const,
  ...overrides
})

export const createMockProtocol = (overrides = {}) => ({
  id: 'test-protocol-id',
  userId: 'test-user-id',
  date: new Date().toISOString().split('T')[0],
  fivePs: {
    purpose: { completed: false, reflection: '', goals: [], alignment: 5 },
    presence: { completed: false, meditationMinutes: 0, mindfulnessActivities: [], gratitude: [] },
    physiology: { 
      completed: false, 
      exercise: { type: '', duration: 0, intensity: 'medium' as const, completed: false },
      nutrition: { meals: 0, quality: 5, supplements: [], notes: '' },
      sleep: { bedtime: '22:00', wakeTime: '06:00', quality: 5, duration: 8 },
      hydration: 0
    },
    psychology: { 
      completed: false, 
      affirmations: [], 
      journaling: '', 
      emotionalState: { primary: 'neutral', intensity: 5 },
      stressLevel: 5
    },
    productivity: { 
      completed: false, 
      tasks: [], 
      focusTime: 0, 
      priorities: [], 
      achievements: []
    }
  },
  completed: false,
  mood: 5 as const,
  energy: 5 as const,
  ...overrides
})

export const createMockAPIResponse = <T>(data: T, success = true) => ({
  success,
  data: success ? data : undefined,
  error: success ? undefined : { code: 'TEST_ERROR', message: 'Test error' },
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: 'test-request-id',
    version: '1.0.0'
  }
})

// Utilitários de teste
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockConsole = () => {
  const originalConsole = { ...console }
  console.log = vi.fn()
  console.error = vi.fn()
  console.warn = vi.fn()
  console.info = vi.fn()
  
  return () => {
    Object.assign(console, originalConsole)
  }
}

// Configuração de timeout para testes
vi.setConfig({ testTimeout: 10000 })

// Configuração para debugging
if (process.env.DEBUG_TESTS) {
  console.log('🧪 Modo de debug de testes ativado')
  
  // Restaurar console.log para debugging
  console.log = originalConsoleError
}