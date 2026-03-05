import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/health - Health check endpoint
 * 
 * Returns:
 * - 200: Service is healthy
 * - 503: Service is degraded (database issues)
 */
export async function GET() {
  const startTime = Date.now()
  let dbHealthy = false
  let dbLatency = 0
  
  // Check database connectivity
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    dbLatency = Date.now() - dbStart
    dbHealthy = true
  } catch (error) {
    console.error('Health check - database error:', error)
    dbHealthy = false
  }

  const memoryUsage = process.memoryUsage()
  const totalDuration = Date.now() - startTime

  const response = {
    status: dbHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    
    checks: {
      database: {
        status: dbHealthy ? 'pass' : 'fail',
        latencyMs: dbLatency,
      },
      memory: {
        status: memoryUsage.heapUsed < memoryUsage.heapTotal * 0.9 ? 'pass' : 'warn',
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
      },
    },
    
    service: {
      version: process.env.npm_package_version || '0.1.0',
      uptime: Math.round(process.uptime()),
      nodeVersion: process.version,
    },
    
    responseTimeMs: totalDuration,
  }

  // Return 503 if database is unhealthy
  if (!dbHealthy) {
    return NextResponse.json(response, { status: 503 })
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
