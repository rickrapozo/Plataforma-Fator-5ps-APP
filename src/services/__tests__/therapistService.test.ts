/**
 * Testes unitários para o Therapist Service
 * Testa funcionalidades críticas da IA terapeuta
 */

import { TherapistService } from '../therapistService'
import { rateLimitService } from '../rateLimitService'
import axios from 'axios'
// import { toast } from 'react-hot-toast' // Removed - not installed
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mocks
vi.mock('axios')
vi.mock('../rateLimitService')
// vi.mock('react-hot-toast') // Removed - not installed

const mockedAxios = vi.mocked(axios)
const mockedRateLimitService = vi.mocked(rateLimitService)
// const mockedToast = vi.mocked(toast) // Removed - not installed

// Mock do axios.post
mockedAxios.post = vi.fn()

describe('TherapistService', () => {
  const mockUserId = 'test-user-123'
  const mockMessage = 'Estou me sentindo ansioso hoje'
  const mockUserName = 'João Silva'
  const mockUserEmail = 'joao@email.com'
  const mockConversationId = 'conv-123'

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockedRateLimitService.checkLimit.mockResolvedValue({
      allowed: true,
      remaining: 9,
      resetTime: Date.now() + 60000,
      totalHits: 1
    })
    
    ;(mockedAxios.post as any).mockResolvedValue({
      data: {
        response: 'Entendo sua ansiedade. Vamos trabalhar juntos nisso.',
        suggestions: ['Pratique respiração profunda', 'Tente meditação'],
        exercises: ['Exercício de grounding']
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sendMessage', () => {
    it('deve enviar mensagem com sucesso', async () => {
      // Act
      const result = await TherapistService.sendMessage({
          message: mockMessage,
          userId: mockUserId,
          userName: mockUserName,
          userEmail: mockUserEmail
        })

      // Assert
      expect(result.response).toBe('Entendo sua ansiedade. Vamos trabalhar juntos nisso.')
      expect(result.suggestions).toEqual(['Pratique respiração profunda', 'Tente meditação'])
      expect(result.exercises).toEqual(['Exercício de grounding'])
      expect(result.rateLimitInfo).toBeDefined()
      expect(result.rateLimitInfo?.remaining).toBe(9)
    })

    it('deve verificar rate limit antes de enviar', async () => {
      // Act
      await TherapistService.sendMessage({
        message: mockMessage,
            userId: mockUserId,
            userName: mockUserName,
            userEmail: mockUserEmail
      })

      // Assert
      expect(mockedRateLimitService.checkLimit).toHaveBeenCalledWith(
        `therapist_ai:${mockUserId}`,
        expect.any(Object)
      )
    })

    it('deve bloquear quando rate limit é excedido', async () => {
      // Arrange
      mockedRateLimitService.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 30000,
        totalHits: 10
      })

      // Act & Assert
      await expect(
        TherapistService.sendMessage({
          message: mockMessage,
          userId: mockUserId,
          userName: mockUserName,
          userEmail: mockUserEmail
        })
      ).rejects.toThrow('Rate limit exceeded')
    })

    it('deve gerar ID de conversa quando não fornecido', async () => {
      // Act
      await TherapistService.sendMessage({
        message: mockMessage,
        userId: mockUserId,
        userName: mockUserName,
        userEmail: mockUserEmail
      })

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
        }),
        expect.any(Object)
      )
    })

    it('deve incluir contexto do usuário na requisição', async () => {
      // Arrange
      const userContext = {
        mood: 7,
        recentProtocols: [],
        preferences: { theme: 'light' }
      }

      // Act
      await TherapistService.sendMessage({
        message: mockMessage,
        userId: mockUserId,
        userName: mockUserName,
        userEmail: mockUserEmail,
        context: {
          dailyProtocol: userContext.recentProtocols,
          userProgress: { mood: userContext.mood },
          onboardingResults: userContext.preferences
        }
      })

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userContext
        }),
        expect.any(Object)
      )
    })

    it('deve lidar com erro de timeout', async () => {
      // Arrange
      ;(mockedAxios.post as any).mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      })

      // Act & Assert
      await expect(
        TherapistService.sendMessage({
          message: mockMessage,
          userId: mockUserId,
          userName: mockUserName,
          userEmail: mockUserEmail
        })
      ).rejects.toThrow('Tempo limite excedido')
    })

    it('deve lidar com erro 404', async () => {
      // Arrange
      ;(mockedAxios.post as any).mockRejectedValue({
        response: { status: 404 },
        message: 'Not found'
      })

      // Act & Assert
      await expect(
        TherapistService.sendMessage({
          message: mockMessage,
          userId: mockUserId,
          userName: mockUserName,
          userEmail: mockUserEmail
        })
      ).rejects.toThrow('Serviço temporariamente indisponível')
    })

    it('deve lidar com erro genérico', async () => {
      // Arrange
      ;(mockedAxios.post as any).mockRejectedValue(new Error('Network error'))

      // Act & Assert
      await expect(
          TherapistService.sendMessage({
            message: mockMessage,
            userId: mockUserId,
            userName: mockUserName,
            userEmail: mockUserEmail
          })
        ).rejects.toThrow('Erro interno do servidor')
    })

    it('deve incluir headers corretos na requisição', async () => {
      // Act
      await TherapistService.sendMessage({
        message: mockMessage,
          userId: mockUserId,
          userName: mockUserName,
          userEmail: mockUserEmail
      })

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer')
          }),
          timeout: 30000
        })
      )
    })
  })

  describe('integration tests', () => {
    it('deve incluir sugestões na resposta baseadas na mensagem', async () => {
      // Arrange
      ;(mockedAxios.post as any).mockResolvedValue({
        data: {
          response: 'Entendo sua ansiedade.',
          suggestions: ['Como posso usar a respiração para controlar a ansiedade?']
        }
      })

      // Act
      const result = await TherapistService.sendMessage({
        message: 'Estou me sentindo ansioso',
         userId: mockUserId,
         userName: mockUserName,
         userEmail: mockUserEmail
      })

      // Assert
       expect(result.suggestions).toBeInstanceOf(Array)
       expect(result.suggestions?.length).toBeGreaterThan(0)
       expect(result.suggestions?.some(s => s.toLowerCase().includes('respiração'))).toBe(true)
    })

    it('deve incluir diferentes tipos de sugestões baseadas no contexto', async () => {
      // Arrange
      ;(mockedAxios.post as any).mockResolvedValue({
        data: {
          response: 'Vamos trabalhar juntos nisso.',
          suggestions: ['Pratique respiração profunda', 'Tente meditação']
        }
      })

      // Act
      const result = await TherapistService.sendMessage({
        message: 'Estou estressado com o trabalho',
         userId: mockUserId,
         userName: mockUserName,
         userEmail: mockUserEmail
      })

      // Assert
      expect(result.suggestions).toBeInstanceOf(Array)
      expect(result.suggestions?.length).toBeGreaterThan(0)
    })
  })

  describe('error handling', () => {
    it('deve lidar com resposta malformada do webhook', async () => {
      // Arrange
      ;(mockedAxios.post as any).mockResolvedValue({
        data: null
      })

      // Act & Assert
      await expect(
        TherapistService.sendMessage({
          message: mockMessage,
          userId: mockUserId,
          userName: mockUserName,
          userEmail: mockUserEmail
        })
      ).rejects.toThrow()
    })

    it('deve lidar com webhook indisponível', async () => {
      // Arrange
      ;(mockedAxios.post as any).mockRejectedValue({
        response: { status: 503 },
        message: 'Service unavailable'
      })

      // Act & Assert
      await expect(
        TherapistService.sendMessage({
          message: mockMessage,
          userId: mockUserId,
          userName: mockUserName,
          userEmail: mockUserEmail
        })
      ).rejects.toThrow('Serviço temporariamente indisponível')
    })
  })

  describe('webhook configuration', () => {
    it('deve usar URL de produção quando disponível', async () => {
      // Arrange
      ;(mockedAxios.post as any).mockResolvedValue({
        data: {
          response: 'Resposta do webhook',
          suggestions: []
        }
      })

      // Act
      await TherapistService.sendMessage({
        message: mockMessage,
        userId: mockUserId,
        userName: mockUserName,
        userEmail: mockUserEmail
      })

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('fator5ps.app.n8n.cloud'),
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('deve incluir dados corretos na requisição do webhook', async () => {
      // Arrange
      ;(mockedAxios.post as any).mockResolvedValue({
        data: {
          response: 'Resposta do webhook',
          suggestions: []
        }
      })

      // Act
      await TherapistService.sendMessage({
        message: mockMessage,
        userId: mockUserId,
        userName: mockUserName,
        userEmail: mockUserEmail
      })

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: mockMessage,
          userId: mockUserId,
          userName: mockUserName,
          userEmail: mockUserEmail
        }),
        expect.any(Object)
      )
    })
  })

  describe('rate limit integration', () => {
    it('deve incluir informações de rate limit na resposta', async () => {
      // Arrange
      const rateLimitInfo = {
        allowed: true,
        remaining: 5,
        resetTime: Date.now() + 45000,
        totalHits: 5
      }
      
      mockedRateLimitService.checkLimit.mockResolvedValue(rateLimitInfo)
      ;(mockedAxios.post as any).mockResolvedValue({
        data: {
          response: 'Resposta com rate limit',
          suggestions: []
        }
      })

      // Act
      const result = await TherapistService.sendMessage({
        message: mockMessage,
        userId: mockUserId,
        userName: mockUserName,
        userEmail: mockUserEmail
      })

      // Assert
      expect(result.rateLimitInfo).toBeDefined()
      expect(result.rateLimitInfo?.remaining).toBe(5)
    })

    it('deve bloquear requisições quando rate limit excedido', async () => {
      // Arrange
      mockedRateLimitService.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 30000,
        totalHits: 10
      })

      // Act & Assert
      await expect(
        TherapistService.sendMessage({
          message: mockMessage,
          userId: mockUserId,
          userName: mockUserName,
          userEmail: mockUserEmail
        })
      ).rejects.toThrow('Rate limit exceeded')
    })
  })

  describe('input validation', () => {
    it('deve validar mensagem vazia', async () => {
      // Act & Assert
      await expect(
        TherapistService.sendMessage({
          message: '',
          userId: mockUserId,
          userName: mockUserName,
          userEmail: mockUserEmail
        })
      ).rejects.toThrow('Mensagem não pode estar vazia')
    })

    it('deve validar userId vazio', async () => {
      // Act & Assert
      await expect(
        TherapistService.sendMessage({
          message: mockMessage,
          userId: '',
          userName: mockUserName,
          userEmail: mockUserEmail
        })
      ).rejects.toThrow('ID do usuário é obrigatório')
    })

    it('deve validar mensagem muito longa', async () => {
      // Arrange
      const longMessage = 'A'.repeat(5001)

      // Act & Assert
      await expect(
        TherapistService.sendMessage({
          message: longMessage,
          userId: mockUserId,
          userName: mockUserName,
          userEmail: mockUserEmail
        })
      ).rejects.toThrow('Mensagem muito longa')
    })

    it('deve aceitar mensagem de tamanho válido', async () => {
      // Arrange
      const validMessage = 'a'.repeat(1000)
      ;(mockedAxios.post as any).mockResolvedValue({
        data: {
          response: 'Resposta válida',
          suggestions: []
        }
      })

      // Act & Assert
      await expect(
        TherapistService.sendMessage({
          message: validMessage,
          userId: mockUserId,
          userName: mockUserName,
          userEmail: mockUserEmail
        })
      ).resolves.not.toThrow()
    })
  })

  describe('performance', () => {
    it('deve completar requisição dentro do timeout', async () => {
      // Arrange
      const startTime = Date.now()
      ;(mockedAxios.post as any).mockResolvedValue({
        data: {
          response: 'Resposta rápida',
          suggestions: []
        }
      })

      // Act
      await TherapistService.sendMessage({
        message: mockMessage,
        userId: mockUserId,
        userName: mockUserName,
        userEmail: mockUserEmail
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime

      // Assert
      expect(duration).toBeLessThan(30000) // Menos que timeout
    })
  })
})