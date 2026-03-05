/**
 * Performance Monitoring Instrumentation
 * For VB26 - 1000 concurrent user support
 * 
 * Tracks key metrics for identifying bottlenecks:
 * - Request latency (p50, p95, p99)
 * - Error rates
 * - Database query performance
 * - Memory usage
 * - Active connections
 */

// Simple in-memory metrics store (use Prometheus/DataDog in production)
interface MetricSample {
  value: number
  timestamp: number
}

interface Histogram {
  samples: MetricSample[]
  sum: number
  count: number
}

interface Counter {
  value: number
}

interface Gauge {
  value: number
  timestamp: number
}

class MetricsCollector {
  private histograms: Map<string, Histogram> = new Map()
  private counters: Map<string, Counter> = new Map()
  private gauges: Map<string, Gauge> = new Map()
  private readonly maxSamples = 10000 // Keep last 10k samples per metric
  private readonly retentionMs = 60 * 60 * 1000 // 1 hour retention

  // Record a timing/duration
  recordHistogram(name: string, value: number, labels: Record<string, string> = {}) {
    const key = this.makeKey(name, labels)
    let histogram = this.histograms.get(key)
    
    if (!histogram) {
      histogram = { samples: [], sum: 0, count: 0 }
      this.histograms.set(key, histogram)
    }

    histogram.samples.push({ value, timestamp: Date.now() })
    histogram.sum += value
    histogram.count++

    // Trim old samples
    if (histogram.samples.length > this.maxSamples) {
      const removed = histogram.samples.shift()
      if (removed) {
        histogram.sum -= removed.value
        histogram.count--
      }
    }
  }

  // Increment a counter
  incrementCounter(name: string, value: number = 1, labels: Record<string, string> = {}) {
    const key = this.makeKey(name, labels)
    let counter = this.counters.get(key)
    
    if (!counter) {
      counter = { value: 0 }
      this.counters.set(key, counter)
    }

    counter.value += value
  }

  // Set a gauge value
  setGauge(name: string, value: number, labels: Record<string, string> = {}) {
    const key = this.makeKey(name, labels)
    this.gauges.set(key, { value, timestamp: Date.now() })
  }

  // Get histogram statistics
  getHistogramStats(name: string, labels: Record<string, string> = {}): {
    count: number
    sum: number
    avg: number
    p50: number
    p95: number
    p99: number
    min: number
    max: number
  } | null {
    const key = this.makeKey(name, labels)
    const histogram = this.histograms.get(key)
    
    if (!histogram || histogram.samples.length === 0) {
      return null
    }

    const values = histogram.samples.map(s => s.value).sort((a, b) => a - b)
    const count = values.length

    return {
      count,
      sum: histogram.sum,
      avg: histogram.sum / count,
      p50: values[Math.floor(count * 0.5)] || 0,
      p95: values[Math.floor(count * 0.95)] || 0,
      p99: values[Math.floor(count * 0.99)] || 0,
      min: values[0] || 0,
      max: values[count - 1] || 0,
    }
  }

  // Get counter value
  getCounter(name: string, labels: Record<string, string> = {}): number {
    const key = this.makeKey(name, labels)
    return this.counters.get(key)?.value || 0
  }

  // Get gauge value
  getGauge(name: string, labels: Record<string, string> = {}): number | null {
    const key = this.makeKey(name, labels)
    const gauge = this.gauges.get(key)
    return gauge ? gauge.value : null
  }

  // Get all metrics for export
  getAllMetrics() {
    const metrics: Record<string, unknown> = {
      histograms: {},
      counters: {},
      gauges: {},
      timestamp: new Date().toISOString(),
    }

    for (const [key] of this.histograms.entries()) {
      const stats = this.getHistogramStats(key)
      if (stats) {
        (metrics.histograms as Record<string, unknown>)[key] = stats
      }
    }

    for (const [key, counter] of this.counters.entries()) {
      metrics.counters[key] = counter.value
    }

    for (const [key, gauge] of this.gauges.entries()) {
      metrics.gauges[key] = gauge.value
    }

    return metrics
  }

  // Reset all metrics
  reset() {
    this.histograms.clear()
    this.counters.clear()
    this.gauges.clear()
  }

  private makeKey(name: string, labels: Record<string, string>): string {
    if (Object.keys(labels).length === 0) {
      return name
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',')
    return `${name}{${labelStr}}`
  }

  // Cleanup old samples
  cleanup() {
    const cutoff = Date.now() - this.retentionMs
    
    for (const [key, histogram] of this.histograms.entries()) {
      const before = histogram.samples.length
      histogram.samples = histogram.samples.filter(s => s.timestamp > cutoff)
      
      // Recalculate sum if samples were removed
      if (histogram.samples.length < before) {
        histogram.sum = histogram.samples.reduce((sum, s) => sum + s.value, 0)
        histogram.count = histogram.samples.length
      }
      
      // Remove empty histograms
      if (histogram.samples.length === 0) {
        this.histograms.delete(key)
      }
    }
  }
}

// Global singleton
export const metrics = new MetricsCollector()

// Run cleanup every 5 minutes
setInterval(() => metrics.cleanup(), 5 * 60 * 1000)

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Track HTTP request duration
 */
export function trackRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number
) {
  // Record duration
  metrics.recordHistogram('http_request_duration_ms', durationMs, {
    method,
    path: normalizePath(path),
    status: String(Math.floor(statusCode / 100) * 100), // 2xx, 4xx, 5xx
  })

  // Count requests
  metrics.incrementCounter('http_requests_total', 1, {
    method,
    path: normalizePath(path),
    status: String(statusCode),
  })

  // Track errors
  if (statusCode >= 400) {
    metrics.incrementCounter('http_errors_total', 1, {
      method,
      path: normalizePath(path),
      status: String(statusCode),
    })
  }
}

/**
 * Track database query duration
 */
export function trackDbQuery(
  operation: string,
  model: string,
  durationMs: number,
  success: boolean
) {
  metrics.recordHistogram('db_query_duration_ms', durationMs, {
    operation,
    model,
    success: String(success),
  })

  metrics.incrementCounter('db_queries_total', 1, {
    operation,
    model,
    success: String(success),
  })
}

/**
 * Track active connections
 */
export function setActiveConnections(type: string, count: number) {
  metrics.setGauge('active_connections', count, { type })
}

/**
 * Track memory usage
 */
export function trackMemoryUsage() {
  const usage = process.memoryUsage()
  metrics.setGauge('memory_heap_used_bytes', usage.heapUsed)
  metrics.setGauge('memory_heap_total_bytes', usage.heapTotal)
  metrics.setGauge('memory_external_bytes', usage.external)
  metrics.setGauge('memory_rss_bytes', usage.rss)
}

// Track memory every 30 seconds
setInterval(trackMemoryUsage, 30 * 1000)
trackMemoryUsage() // Initial capture

/**
 * Normalize path for grouping (remove IDs)
 */
function normalizePath(path: string): string {
  return path
    .replace(/\/[a-z0-9]{20,}/gi, '/:id') // CUID/UUID
    .replace(/\/\d+/g, '/:id')             // Numeric IDs
    .split('?')[0]                          // Remove query string
}

/**
 * Middleware wrapper for automatic request tracking
 */
export function withMetrics<T>(
  handler: () => Promise<T>,
  context: {
    method: string
    path: string
  }
): Promise<T> {
  const start = Date.now()
  
  return handler()
    .then(result => {
      const duration = Date.now() - start
      trackRequest(context.method, context.path, 200, duration)
      return result
    })
    .catch(error => {
      const duration = Date.now() - start
      const status = error.status || error.statusCode || 500
      trackRequest(context.method, context.path, status, duration)
      throw error
    })
}

/**
 * Get performance summary for monitoring dashboard
 */
export function getPerformanceSummary() {
  const requestStats = metrics.getHistogramStats('http_request_duration_ms')
  const dbStats = metrics.getHistogramStats('db_query_duration_ms')
  
  return {
    timestamp: new Date().toISOString(),
    http: {
      totalRequests: metrics.getCounter('http_requests_total'),
      totalErrors: metrics.getCounter('http_errors_total'),
      latency: requestStats ? {
        avg: Math.round(requestStats.avg),
        p50: Math.round(requestStats.p50),
        p95: Math.round(requestStats.p95),
        p99: Math.round(requestStats.p99),
      } : null,
    },
    database: {
      totalQueries: metrics.getCounter('db_queries_total'),
      latency: dbStats ? {
        avg: Math.round(dbStats.avg),
        p50: Math.round(dbStats.p50),
        p95: Math.round(dbStats.p95),
        p99: Math.round(dbStats.p99),
      } : null,
    },
    memory: {
      heapUsedMB: Math.round((metrics.getGauge('memory_heap_used_bytes') || 0) / 1024 / 1024),
      heapTotalMB: Math.round((metrics.getGauge('memory_heap_total_bytes') || 0) / 1024 / 1024),
      rssMB: Math.round((metrics.getGauge('memory_rss_bytes') || 0) / 1024 / 1024),
    },
  }
}

// API endpoint handler for metrics export
export function exportMetrics(): string {
  const allMetrics = metrics.getAllMetrics()
  
  // Format as Prometheus text format
  const lines: string[] = []
  
  // Histograms
  for (const [name, stats] of Object.entries(allMetrics.histograms)) {
    lines.push(`# HELP ${name} Histogram metric`)
    lines.push(`# TYPE ${name} histogram`)
    lines.push(`${name}_count ${stats.count}`)
    lines.push(`${name}_sum ${stats.sum}`)
    lines.push(`${name}{quantile="0.5"} ${stats.p50}`)
    lines.push(`${name}{quantile="0.95"} ${stats.p95}`)
    lines.push(`${name}{quantile="0.99"} ${stats.p99}`)
  }
  
  // Counters
  for (const [name, value] of Object.entries(allMetrics.counters)) {
    lines.push(`# TYPE ${name} counter`)
    lines.push(`${name} ${value}`)
  }
  
  // Gauges
  for (const [name, value] of Object.entries(allMetrics.gauges)) {
    lines.push(`# TYPE ${name} gauge`)
    lines.push(`${name} ${value}`)
  }
  
  return lines.join('\n')
}

export default metrics
