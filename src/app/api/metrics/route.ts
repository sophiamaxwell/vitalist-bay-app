import { NextRequest, NextResponse } from 'next/server'
import { getPerformanceSummary, exportMetrics } from '@/lib/monitoring'
import { checkDatabaseHealth } from '@/lib/prisma-pooled'
import { getRateLimitStats } from '@/middleware/rate-limit'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/metrics - Performance metrics endpoint
 * 
 * Supports two formats:
 * - JSON (default): Human-readable summary
 * - Prometheus: Standard metrics format (Accept: text/plain)
 */
export async function GET(request: NextRequest) {
  const accept = request.headers.get('accept') || ''
  
  // Check for API key in production
  const apiKey = request.headers.get('x-metrics-key')
  const expectedKey = process.env.METRICS_API_KEY
  
  if (expectedKey && apiKey !== expectedKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Prometheus format
  if (accept.includes('text/plain')) {
    try {
      const metrics = exportMetrics()
      return new NextResponse(metrics, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    } catch (error) {
      return new NextResponse('# Error exporting metrics', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      })
    }
  }

  // JSON format (default)
  try {
    const [dbHealth, performanceSummary] = await Promise.all([
      checkDatabaseHealth(prisma),
      Promise.resolve(getPerformanceSummary()),
    ])

    const rateLimitStats = getRateLimitStats()

    return NextResponse.json({
      status: dbHealth.healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      
      // Database health
      database: {
        healthy: dbHealth.healthy,
        latencyMs: dbHealth.latencyMs,
      },
      
      // HTTP performance
      http: performanceSummary.http,
      
      // Database query performance
      queries: performanceSummary.database,
      
      // Memory usage
      memory: performanceSummary.memory,
      
      // Rate limiting
      rateLimiting: rateLimitStats,
      
      // Node.js details
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
    })
  } catch (error) {
    console.error('Metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to collect metrics' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/metrics/reset - Reset metrics (admin only)
 */
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-metrics-key')
  const expectedKey = process.env.METRICS_API_KEY
  
  if (expectedKey && apiKey !== expectedKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const body = await request.json().catch(() => ({}))
  
  if (body.action === 'reset') {
    const { metrics } = await import('@/lib/monitoring')
    metrics.reset()
    return NextResponse.json({ success: true, message: 'Metrics reset' })
  }

  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  )
}
