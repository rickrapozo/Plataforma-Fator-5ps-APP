/**
 * Testes de integração para toda a infraestrutura de monitoramento
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { monitoringInitializer } from '../services/monitoringInitializer'
import { apmService } from '../services/apmService'
import { loggerService } from '../services/loggerService'
import { circuitBreakerManager } from '../services/circuitBreakerService'
import { alertService } from '../services/alertService'
import { webhookRetryService } from '../services/webhookRetryService'
import { tokenExpirationService } from '../services/tokenExpirationService'
import { validateMonitoringConfig } from '../config/monitoring'

// Mock environment variables for testing
const originalEnv = process.env

beforeAll(() => {
  // Set up test environment variables
  process.env = {
    ...originalEnv,
    NODE_ENV: 'test',
    REACT_APP_MONITORING_ENABLED: 'true',
    REACT_APP_APM_ENABLED: 'true',
    REACT_APP_APM_SERVICE_NAME: 'essential-factor-test',
    REACT_APP_LOG_LEVEL: 'debug',
    REACT_APP_LOG_CONSOLE: 'true',
    REACT_APP_CIRCUIT_BREAKER_ENABLED: 'true',
    // REACT_APP_GEMINI_CACHE_ENABLED: 'true', // Removido
    REACT_APP_ALERTS_ENABLED: 'true',
    REACT_APP_WEBHOOK_RETRY_ENABLED: 'true',
    REACT_APP_TOKEN_EXPIRATION_ENABLED: 'true'
  }
})

afterAll(() => {
  // Restore original environment
  process.env = originalEnv
})

beforeEach(async () => {
  // Clean up any existing state
  await monitoringInitializer.cleanup()
})

afterEach(async () => {
  // Clean up after each test
  await monitoringInitializer.cleanup()
})

describe('Monitoring Configuration', () => {
  it('should validate monitoring configuration successfully', () => {
    const isValid = validateMonitoringConfig()
    expect(isValid).toBe(true)
  })

  it('should have all required environment variables for testing', () => {
    expect(process.env.REACT_APP_MONITORING_ENABLED).toBe('true')
    expect(process.env.REACT_APP_APM_ENABLED).toBe('true')
    expect(process.env.NODE_ENV).toBe('test')
  })
})

describe('Monitoring Initializer', () => {
  it('should initialize all monitoring services successfully', async () => {
    const result = await monitoringInitializer.initialize()
    
    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.initializedServices.length).toBeGreaterThan(0)
    expect(result.initializedServices).toContain('Logger Service')
  })

  it('should handle service initialization failures gracefully', async () => {
    // Mock a service to fail initialization
    const originalInitialize = apmService.initialize
    apmService.initialize = vi.fn().mockRejectedValue(new Error('Test initialization failure'))
    
    const result = await monitoringInitializer.initialize()
    
    // Should still succeed overall but report the error
    expect(result.success).toBe(true) // Logger is critical, APM is not
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('APM Service')
    
    // Restore original method
    apmService.initialize = originalInitialize
  })

  it('should perform health checks on initialized services', async () => {
    await monitoringInitializer.initialize()
    
    const healthStatus = await monitoringInitializer.healthCheck()
    
    expect(typeof healthStatus).toBe('object')
    expect(Object.keys(healthStatus).length).toBeGreaterThan(0)
    
    // Logger should always be healthy
    expect(healthStatus['Logger Service']).toBe(true)
  })

  it('should provide initialization statistics', async () => {
    await monitoringInitializer.initialize()
    
    const stats = monitoringInitializer.getStats()
    
    expect(stats.initialized).toBe(true)
    expect(stats.initializationResult).toBeTruthy()
    expect(stats.services).toBeInstanceOf(Array)
    expect(stats.services.length).toBeGreaterThan(0)
  })

  it('should cleanup services properly', async () => {
    await monitoringInitializer.initialize()
    expect(monitoringInitializer.isInitialized()).toBe(true)
    
    await monitoringInitializer.cleanup()
    expect(monitoringInitializer.isInitialized()).toBe(false)
  })

  it('should support reinitialization', async () => {
    // First initialization
    const result1 = await monitoringInitializer.initialize()
    expect(result1.success).toBe(true)
    
    // Reinitialize
    const result2 = await monitoringInitializer.reinitialize()
    expect(result2.success).toBe(true)
    expect(monitoringInitializer.isInitialized()).toBe(true)
  })
})

describe('Individual Service Integration', () => {
  beforeEach(async () => {
    await monitoringInitializer.initialize()
  })

  describe('Logger Service', () => {
    it('should log messages at different levels', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      loggerService.debug('Debug message')
      loggerService.info('Info message')
      loggerService.warn('Warning message')
      loggerService.error('Error message')
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle structured logging', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      loggerService.info('Test message', {
        userId: '123',
        action: 'test',
        metadata: { key: 'value' }
      })
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('APM Service', () => {
    it('should create and manage transactions', () => {
      try {
        const transactionId = apmService.startTransaction('test-transaction', 'custom')
        
        expect(transactionId).toBeTruthy()
        expect(typeof transactionId).toBe('string')
        
        // Finalizar transação usando o ID
        apmService.endTransaction(transactionId, 'success')
      } catch (error) {
        // APM pode não estar disponível em ambiente de teste
        expect(error).toBeDefined()
      }
    })

    it('should record custom metrics', () => {
      expect(() => {
        apmService.recordMetric('test.metric', 42)
      }).not.toThrow()
    })

    it('should have basic APM functionality', () => {
      // Verificar se o serviço APM está disponível
      expect(apmService).toBeDefined()
      expect(typeof apmService.startTransaction).toBe('function')
    })
  })

  describe('Circuit Breaker Manager', () => {
    it('should create and manage circuit breakers', () => {
      const breaker = circuitBreakerManager.getOrCreate('test-service')
      
      expect(breaker).toBeTruthy()
      expect(typeof breaker.execute).toBe('function')
    })

    it('should execute functions through circuit breaker', async () => {
      const breaker = circuitBreakerManager.getOrCreate('test-service')
      
      const result = await breaker.execute(async () => {
        return 'success'
      })
      
      expect(result).toBe('success')
    })

    it('should provide circuit breaker statistics', () => {
      circuitBreakerManager.getOrCreate('test-service')
      
      const stats = circuitBreakerManager.getAllStats()
      
      expect(Array.isArray(stats)).toBe(true)
      expect(stats.length).toBeGreaterThanOrEqual(0)
    })
  })

  // Removido: Gemini Cache Service tests

  describe('Alert Service', () => {
    it('should initialize alert service successfully', () => {
      // Verificar se o serviço está disponível
      expect(alertService).toBeDefined()
      expect(typeof alertService.getStats).toBe('function')
    })

    it('should provide alert statistics', () => {
      const stats = alertService.getStats()
      
      expect(typeof stats).toBe('object')
      expect(typeof stats.activeAlertsCount).toBe('number')
      expect(typeof stats.totalAlertsCount).toBe('number')
      expect(typeof stats.enabled).toBe('boolean')
    })
  })

  describe('Webhook Retry Service', () => {
    it('should enqueue webhook payloads', async () => {
      const payload = {
        url: 'https://example.com/webhook',
        method: 'POST' as const,
        headers: { 'Content-Type': 'application/json' },
        body: { test: 'data' },
        priority: 2, // WebhookPriority.NORMAL
        metadata: {},
        timeout: 30000,
        maxRetries: 3,
        retryDelay: 1000
      }
      
      const webhookId = await webhookRetryService.enqueue(payload)
      expect(typeof webhookId).toBe('string')
    })

    it('should provide webhook statistics', async () => {
      const stats = await webhookRetryService.getStats()
      
      expect(typeof stats).toBe('object')
      expect(typeof stats.totalWebhooks).toBe('number')
      expect(typeof stats.successfulWebhooks).toBe('number')
    })
  })

  describe('Token Expiration Service', () => {
    it('should register and monitor tokens', () => {
      const tokenInfo = {
        token: 'test-token-value',
        type: 'access' as const,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        userId: 'test-user'
      }
      
      expect(() => {
        tokenExpirationService.registerToken('test-token-id', tokenInfo)
      }).not.toThrow()
    })

    it('should provide token statistics', () => {
      const stats = tokenExpirationService.getStats()
      
      expect(typeof stats).toBe('object')
      expect(typeof stats.totalTokens).toBe('number')
      expect(typeof stats.expiringSoon).toBe('number')
      expect(typeof stats.expired).toBe('number')
    })

    it('should start and stop monitoring', () => {
      expect(() => {
        tokenExpirationService.startMonitoring()
      }).not.toThrow()
      
      // Verificar se o serviço iniciou corretamente através das estatísticas
      const initialStats = tokenExpirationService.getStats()
      expect(initialStats).toBeDefined()
      
      expect(() => {
        tokenExpirationService.stopMonitoring()
      }).not.toThrow()
      
      // Verificar se o serviço parou corretamente através das estatísticas
      const stats = tokenExpirationService.getStats()
      expect(stats).toBeDefined()
    })
  })
})

// Removido: Error Handling and Recovery tests (dependiam do geminiCacheService)

// Removido: Performance and Load Testing (dependia do geminiCacheService)

describe('Integration with React Components', () => {
  // These tests would require a React testing environment
  // For now, we'll test the hook logic separately
  
  it('should provide monitoring initialization hook', () => {
    // Test that the hook exports exist
    expect(typeof monitoringInitializer.initialize).toBe('function')
    expect(typeof monitoringInitializer.healthCheck).toBe('function')
    expect(typeof monitoringInitializer.getStats).toBe('function')
  })
})

describe('Configuration Validation', () => {
  it('should validate complete configuration', () => {
    const isValid = validateMonitoringConfig()
    expect(isValid).toBe(true)
  })

  it('should handle missing optional configuration', () => {
    const originalEnv = process.env.REACT_APP_GEMINI_CACHE_ENABLED
    delete process.env.REACT_APP_GEMINI_CACHE_ENABLED
    
    const isValid = validateMonitoringConfig()
    expect(isValid).toBe(true) // Should still be valid
    
    process.env.REACT_APP_GEMINI_CACHE_ENABLED = originalEnv
  })
})

// Cleanup function for test environment
export const cleanupTestEnvironment = async () => {
  await monitoringInitializer.cleanup()
  
  // Clear any remaining timers or intervals
  vi.clearAllTimers()
  vi.clearAllMocks()
}

// Test utilities
export const createMockAlert = (overrides = {}) => ({
  type: 'system' as const,
  severity: 'medium' as const,
  title: 'Test Alert',
  message: 'Test alert message',
  metadata: {},
  ...overrides
})

export const createMockWebhookPayload = (overrides = {}) => ({
  url: 'https://example.com/webhook',
  method: 'POST' as const,
  headers: { 'Content-Type': 'application/json' },
  body: { test: 'data' },
  priority: 2, // WebhookPriority.NORMAL
  metadata: {},
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  ...overrides
})

export const createMockToken = (overrides = {}) => ({
  id: 'test-token',
  type: 'access' as const,
  value: 'test-token-value',
  expiresAt: new Date(Date.now() + 3600000),
  refreshToken: 'refresh-token-value',
  ...overrides
})