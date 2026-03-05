/**
 * Production-optimized Prisma client with connection pooling
 * 
 * For VB26 with 1000 concurrent users:
 * - Uses PgBouncer or Prisma Data Proxy for connection pooling
 * - Implements retry logic for transient failures
 * - Includes query timeout protection
 */

import { PrismaClient, Prisma } from '@prisma/client'
import { Pool } from 'pg'

// Connection pool configuration for 1000 concurrent users
const POOL_CONFIG = {
  // Maximum connections in pool (adjust based on DB max_connections)
  // Rule of thumb: max_connections / 2 for the app
  max: parseInt(process.env.DATABASE_POOL_MAX || '50', 10),
  
  // Minimum connections to maintain
  min: parseInt(process.env.DATABASE_POOL_MIN || '10', 10),
  
  // How long to wait for a connection (ms)
  connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10000', 10),
  
  // How long a connection can be idle before being closed
  idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000', 10),
  
  // Max lifetime of a connection (ms)
  maxLifetimeSeconds: 1800, // 30 minutes
}

// Query timeout configuration
const QUERY_TIMEOUT = parseInt(process.env.DATABASE_QUERY_TIMEOUT || '30000', 10)

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  retryableErrors: [
    'P1001', // Can't reach database server
    'P1002', // Database server timed out
    'P1008', // Operations timed out
    'P1017', // Server closed connection
    'P2024', // Timed out fetching a new connection
  ],
}

// Global singleton for connection pool
const globalForPool = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

/**
 * Creates a production-optimized Prisma client
 */
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    
    // Enable metrics in production for monitoring
    // @ts-ignore - Prisma preview feature
    // metrics: process.env.NODE_ENV === 'production',
  })

  // Add query middleware for timeout protection
  client.$use(async (params, next) => {
    const startTime = Date.now()
    
    try {
      const result = await Promise.race([
        next(params),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Query timeout after ${QUERY_TIMEOUT}ms: ${params.model}.${params.action}`))
          }, QUERY_TIMEOUT)
        })
      ])
      
      // Log slow queries
      const duration = Date.now() - startTime
      if (duration > 1000) {
        console.warn(`Slow query (${duration}ms): ${params.model}.${params.action}`)
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`Query failed (${duration}ms): ${params.model}.${params.action}`, error)
      throw error
    }
  })

  return client
}

/**
 * Retry wrapper for database operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Check if error is retryable
      const isRetryable = RETRY_CONFIG.retryableErrors.some(code => 
        error.code === code || error.message?.includes(code)
      )
      
      if (!isRetryable || attempt === RETRY_CONFIG.maxRetries - 1) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelayMs
      )
      
      console.warn(
        `Retrying ${context || 'operation'} (attempt ${attempt + 2}/${RETRY_CONFIG.maxRetries}) after ${delay}ms`,
        { error: error.message }
      )
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Transaction wrapper with automatic retry
 */
export async function withTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxWait?: number
    timeout?: number
    isolationLevel?: Prisma.TransactionIsolationLevel
  }
): Promise<T> {
  return withRetry(
    () => prisma.$transaction(fn, {
      maxWait: options?.maxWait || 5000,
      timeout: options?.timeout || 10000,
      isolationLevel: options?.isolationLevel || Prisma.TransactionIsolationLevel.ReadCommitted,
    }),
    'transaction'
  )
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(prisma: PrismaClient): Promise<{
  healthy: boolean
  latencyMs: number
  poolStats?: {
    total: number
    idle: number
    waiting: number
  }
}> {
  const startTime = Date.now()
  
  try {
    await prisma.$queryRaw`SELECT 1`
    const latencyMs = Date.now() - startTime
    
    return {
      healthy: true,
      latencyMs,
      // Pool stats would come from PgBouncer or Prisma Data Proxy
    }
  } catch (error) {
    return {
      healthy: false,
      latencyMs: Date.now() - startTime,
    }
  }
}

// Export the singleton client
export const prisma = globalForPool.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPool.prisma = prisma
}

// Graceful shutdown handler
async function shutdown() {
  console.log('Closing database connections...')
  await prisma.$disconnect()
  console.log('Database connections closed')
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

export default prisma

/**
 * Connection pool metrics for monitoring
 */
export function getPoolMetrics() {
  return {
    config: POOL_CONFIG,
    queryTimeout: QUERY_TIMEOUT,
    retryConfig: RETRY_CONFIG,
  }
}
