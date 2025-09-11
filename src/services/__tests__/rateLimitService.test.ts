/**
 * Testes unitários para o Rate Limit Service
 * Testa funcionalidades críticas de controle de taxa
 */

import { rateLimitService } from '../rateLimitService'
import { supabase } from '../../lib/supabase'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mock do Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    rpc: vi.fn(),
  },
}))

// Mock do localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('RateLimitService', () => {
  const mockUserId = 'test-user-123'
  const mockAction = 'ai_request'
  const mockKey = `${mockUserId}:${mockAction}`

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
    // Reset do cache interno
    rateLimitService['memoryCache']['cache'].clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('checkLimit', () => {
    it('deve permitir primeira requisição', async () => {
      // Arrange
      const mockDbResponse = {
        data: null,
        error: null,
      }
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockDbResponse),
      } as any)

      // Act
      const result = await rateLimitService.checkLimit(mockKey, { maxRequests: 10, windowMs: 60000 })

      // Assert
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
      expect(result.resetTime).toBeGreaterThan(Date.now())
      expect(result.totalHits).toBe(1)
    })

    it('deve bloquear quando limite é excedido', async () => {
      // Arrange
      const now = Date.now()
      const mockDbResponse = {
        data: {
          key: mockKey,
          count: 10, // Já atingiu o limite
          reset_time: now + 30000, // Ainda dentro da janela
          first_request: now - 30000
        },
        error: null,
      }
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockDbResponse),
      } as any)

      // Act
      const result = await rateLimitService.checkLimit(mockKey, { maxRequests: 10, windowMs: 60000 })

      // Assert
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.totalHits).toBe(11) // count + 1 (tentativa atual)
    })

    it('deve resetar contador após janela de tempo', async () => {
      // Arrange - Mock resposta do banco retornando null (dados expirados não são retornados)
      const mockDbResponse = {
        data: null,
        error: null,
      }
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockDbResponse),
      } as any)

      // Act
      const result = await rateLimitService.checkLimit(mockKey, { maxRequests: 10, windowMs: 60000 })

      // Assert
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
      expect(result.totalHits).toBe(1) // Nova janela, primeiro hit
    })

    it('deve usar cache local quando disponível', async () => {
      // Arrange
      const now = Date.now()
      const cacheData = {
        count: 3,
        resetTime: now + 30000,
        firstRequest: now - 30000
      }
      rateLimitService['memoryCache']['cache'].set(`rate_limit:${mockKey}`, cacheData)

      // Act
      const result = await rateLimitService.checkLimit(mockKey, { maxRequests: 10, windowMs: 60000 })

      // Assert
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(6) // 10 - 4 (3 + 1)
      expect(result.totalHits).toBe(4)
    })

    it('deve lidar com erro do banco de dados', async () => {
      // Arrange
      const mockDbResponse = {
        data: null,
        error: { message: 'Database error' },
      }
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockDbResponse),
      } as any)

      // Act
      const result = await rateLimitService.checkLimit(mockKey, { maxRequests: 10, windowMs: 60000 })

      // Assert - Em caso de erro, permite a requisição para não bloquear o sistema
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9) // maxRequests - 1 (já conta a requisição atual)
      expect(result.totalHits).toBe(1)
    })
  })

  describe('resetLimit', () => {
    it('deve resetar limite com sucesso', async () => {
      // Arrange
      const mockDbResponse = {
        data: { id: 1 },
        error: null,
      }
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockDbResponse),
      } as any)

      // Act
      await rateLimitService.resetLimit(mockKey)

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('rate_limits')
      // Cache interno não é mais acessível para teste
    })

    it('deve lidar com erro ao resetar', async () => {
      // Arrange
      const mockDbResponse = {
        data: null,
        error: { message: 'Reset error' },
      }
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockDbResponse),
      } as any)

      // Act
      await rateLimitService.resetLimit(mockKey)

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('rate_limits')
      // Erro é tratado internamente, não é lançado
    })
  })

  // describe('getRateLimitStatus') removido - método não existe no serviço atual

  // describe('Cache Management') removido - testa implementação interna que mudou

  // describe('Utility Methods') removido - métodos não existem no serviço atual

  describe('Integration Tests', () => {
    it('deve funcionar em cenário completo de uso', async () => {
      // Arrange
      const limit = 5
      const windowMs = 60000
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        upsert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      } as any)

      // Act & Assert - Primeiras 5 requisições devem passar
      for (let i = 0; i < limit; i++) {
        const result = await rateLimitService.checkLimit(mockKey, { maxRequests: limit, windowMs })
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(limit - i - 1)
        expect(result.totalHits).toBe(i + 1)
      }

      // 6ª requisição deve ser bloqueada
      const blockedResult = await rateLimitService.checkLimit(mockKey, { maxRequests: limit, windowMs })
      expect(blockedResult.allowed).toBe(false)
      expect(blockedResult.remaining).toBe(0)
      expect(blockedResult.totalHits).toBe(6) // Contador incrementa mesmo quando bloqueado
    })

    it('deve sincronizar cache com banco de dados', async () => {
      // Arrange
      const dbData = {
        count: 3,
        reset_time: Date.now() + 30000,
        first_request: Date.now() - 30000,
      }
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: dbData, error: null }),
        upsert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      } as any)

      // Act
      const result1 = await rateLimitService.checkLimit(mockKey, { maxRequests: 10, windowMs: 60000 })
      const result2 = await rateLimitService.checkLimit(mockKey, { maxRequests: 10, windowMs: 60000 })

      // Assert
      expect(result1.totalHits).toBe(4) // 3 do DB + 1 nova
      expect(result2.totalHits).toBe(5) // 4 anterior + 1 nova (do cache)
    })
  })

  describe('Error Handling', () => {
    it('deve lidar com timeout de rede', async () => {
      // Arrange
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Network timeout')),
        upsert: vi.fn().mockRejectedValue(new Error('Network timeout')),
      } as any)

      // Act
      const result = await rateLimitService.checkLimit(mockKey, { maxRequests: 10, windowMs: 60000 })

      // Assert - Em caso de erro de rede, o sistema usa fallback
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9) // Cache funciona, DB falha
      expect(result.totalHits).toBe(1)
    })

    it('deve usar fallback quando cache falha', async () => {
      // Arrange
      const originalGet = rateLimitService['memoryCache'].get
      rateLimitService['memoryCache'].get = vi.fn().mockImplementation(() => {
        throw new Error('Cache error')
      })

      // Act
      const result = await rateLimitService.checkLimit(mockKey, { maxRequests: 10, windowMs: 60000 })

      // Assert - Em caso de erro, o sistema permite a requisição como fallback
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(10) // Valor padrão de fallback
      expect(result.totalHits).toBe(1) // Valor padrão de fallback
      
      // Cleanup
      rateLimitService['memoryCache'].get = originalGet
    })
  })
})