interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

interface CacheConfig {
  defaultTTL: number // Time to live in milliseconds
  maxSize: number    // Maximum number of items in cache
  cleanupInterval: number // Cleanup interval in milliseconds
}

class CacheManager {
  private cache: Map<string, CacheItem<any>>
  private config: CacheConfig
  private cleanupTimer: NodeJS.Timeout | null

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map()
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      cleanupInterval: 60 * 1000, // 1 minute
      ...config
    }
    this.cleanupTimer = null
    this.startCleanup()
  }

  /**
   * Set an item in the cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiry = now + (ttl || this.config.defaultTTL)
    
    // If cache is at max size, remove oldest item
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry
    })
  }

  /**
   * Get an item from the cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    // Check if item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.data as T
  }

  /**
   * Check if an item exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  /**
   * Remove an item from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    keys: string[]
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Get or set with a factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    
    if (cached !== null) {
      return cached
    }
    
    const data = await factory()
    this.set(key, data, ttl)
    return data
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): number {
    let count = 0
    const regex = new RegExp(pattern)
    
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    
    return count
  }

  /**
   * Start automatic cleanup of expired items
   */
  private startCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now > item.expiry) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Destroy the cache manager
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.cache.clear()
  }
}

// Create cache instances for different data types
export const metricsCache = new CacheManager({
  defaultTTL: 30 * 1000, // 30 seconds for metrics
  maxSize: 50
})

export const userCache = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes for user data
  maxSize: 200
})

export const contentCache = new CacheManager({
  defaultTTL: 10 * 60 * 1000, // 10 minutes for content
  maxSize: 100
})

export const systemCache = new CacheManager({
  defaultTTL: 15 * 60 * 1000, // 15 minutes for system data
  maxSize: 50
})

// Cache key generators
export const CacheKeys = {
  // Metrics
  REALTIME_METRICS: 'metrics:realtime',
  HISTORICAL_METRICS: (hours: number) => `metrics:historical:${hours}`,
  SYSTEM_HEALTH: 'metrics:system_health',
  USER_ACTIVITIES: 'metrics:user_activities',
  ERROR_LOGS: 'metrics:error_logs',
  
  // Users
  USER_LIST: (page: number, filters: string) => `users:list:${page}:${filters}`,
  USER_DETAILS: (userId: string) => `users:details:${userId}`,
  USER_STATS: 'users:stats',
  
  // Content
  CONTENT_LIST: (page: number, filters: string) => `content:list:${page}:${filters}`,
  CONTENT_DETAILS: (contentId: string) => `content:details:${contentId}`,
  CONTENT_STATS: 'content:stats',
  
  // System
  SYSTEM_CONFIG: 'system:config',
  SERVICE_STATUS: 'system:services',
  // GEMINI_INSIGHTS: (type: string) => `system:gemini:${type}`, // Removido
}

// Utility functions for common caching patterns
export const withCache = {
  /**
   * Cache API responses
   */
  async apiCall<T>(
    cacheManager: CacheManager,
    key: string,
    apiCall: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    return cacheManager.getOrSet(key, apiCall, ttl)
  },

  /**
   * Cache computed values
   */
  compute<T>(
    cacheManager: CacheManager,
    key: string,
    computation: () => T,
    ttl?: number
  ): T {
    const cached = cacheManager.get<T>(key)
    if (cached !== null) {
      return cached
    }
    
    const result = computation()
    cacheManager.set(key, result, ttl)
    return result
  },

  /**
   * Invalidate related cache entries
   */
  invalidateRelated(patterns: string[]): void {
    patterns.forEach(pattern => {
      metricsCache.invalidatePattern(pattern)
      userCache.invalidatePattern(pattern)
      contentCache.invalidatePattern(pattern)
      systemCache.invalidatePattern(pattern)
    })
  }
}

export default CacheManager