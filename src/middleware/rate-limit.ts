/**
 * Rate Limiting Middleware for VB26 (1000 concurrent users)
 * 
 * Implements sliding window rate limiting with different tiers
 * for various endpoint types.
 */

import { NextRequest, NextResponse } from 'next/server'

// In-memory store (use Redis in production for multi-instance)
const rateLimitStore = new Map<string, RateLimitEntry>()

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
  blockUntil?: number
}

// Rate limit configurations per endpoint type
const RATE_LIMITS = {
  // Authentication endpoints (prevent brute force)
  auth: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 10,           // 10 requests per minute
    blockDurationMs: 60 * 1000, // 1 minute block
  },
  
  // Registration endpoints (allow surge but prevent abuse)
  registration: {
    windowMs: 60 * 1000,
    maxRequests: 30,           // 30 registrations per minute per IP
    blockDurationMs: 5 * 60 * 1000, // 5 minute block
  },
  
  // Check-in endpoints (high frequency allowed)
  checkin: {
    windowMs: 60 * 1000,
    maxRequests: 100,          // 100 check-ins per minute (staff devices)
    blockDurationMs: 30 * 1000,
  },
  
  // Read-heavy endpoints (sessions, speakers, agenda)
  read: {
    windowMs: 60 * 1000,
    maxRequests: 200,          // 200 reads per minute
    blockDurationMs: 30 * 1000,
  },
  
  // Write endpoints (general)
  write: {
    windowMs: 60 * 1000,
    maxRequests: 50,
    blockDurationMs: 60 * 1000,
  },
  
  // API default
  default: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    blockDurationMs: 30 * 1000,
  },
}

// Endpoint classification
function getEndpointType(pathname: string, method: string): keyof typeof RATE_LIMITS {
  if (pathname.includes('/auth')) {
    return 'auth'
  }
  if (pathname.includes('/register')) {
    return 'registration'
  }
  if (pathname.includes('/checkin')) {
    return 'checkin'
  }
  if (method === 'GET') {
    return 'read'
  }
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return 'write'
  }
  return 'default'
}

/**
 * Get client identifier (IP + optional user ID)
 */
function getClientId(request: NextRequest): string {
  // Get IP from various headers (consider reverse proxy)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip')
  
  const ip = cfIp || forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
  
  // Include user ID if authenticated (from session)
  const userId = request.headers.get('x-user-id') || ''
  
  return userId ? `${ip}:${userId}` : ip
}

/**
 * Clean up expired entries periodically
 */
function cleanupStore() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime && !entry.blocked) {
      rateLimitStore.delete(key)
    }
    if (entry.blockUntil && now > entry.blockUntil) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every minute
setInterval(cleanupStore, 60 * 1000)

/**
 * Rate limiting middleware
 */
export async function rateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname
  const method = request.method
  const clientId = getClientId(request)
  const endpointType = getEndpointType(pathname, method)
  const config = RATE_LIMITS[endpointType]
  
  const key = `${clientId}:${endpointType}`
  const now = Date.now()
  
  let entry = rateLimitStore.get(key)
  
  // Check if blocked
  if (entry?.blocked && entry.blockUntil && now < entry.blockUntil) {
    const retryAfter = Math.ceil((entry.blockUntil - now) / 1000)
    
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.blockUntil / 1000)),
        },
      }
    )
  }
  
  // Reset if window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false,
    }
  }
  
  // Increment count
  entry.count++
  
  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    entry.blocked = true
    entry.blockUntil = now + config.blockDurationMs
    rateLimitStore.set(key, entry)
    
    const retryAfter = Math.ceil(config.blockDurationMs / 1000)
    
    console.warn(`Rate limit exceeded: ${clientId} on ${endpointType} (${entry.count} requests)`)
    
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.blockUntil / 1000)),
        },
      }
    )
  }
  
  // Update store
  rateLimitStore.set(key, entry)
  
  // Return null to continue (add headers via response)
  return null
}

/**
 * Helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const pathname = request.nextUrl.pathname
  const method = request.method
  const clientId = getClientId(request)
  const endpointType = getEndpointType(pathname, method)
  const config = RATE_LIMITS[endpointType]
  
  const key = `${clientId}:${endpointType}`
  const entry = rateLimitStore.get(key)
  
  if (entry) {
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests))
    response.headers.set('X-RateLimit-Remaining', String(Math.max(0, config.maxRequests - entry.count)))
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(entry.resetTime / 1000)))
  }
  
  return response
}

/**
 * Get current rate limit stats (for monitoring)
 */
export function getRateLimitStats() {
  const stats = {
    totalEntries: rateLimitStore.size,
    blockedClients: 0,
    byEndpointType: {} as Record<string, number>,
  }
  
  for (const [key, entry] of rateLimitStore.entries()) {
    const [, endpointType] = key.split(':').slice(-1)
    stats.byEndpointType[endpointType] = (stats.byEndpointType[endpointType] || 0) + 1
    
    if (entry.blocked) {
      stats.blockedClients++
    }
  }
  
  return stats
}

export default { rateLimit, addRateLimitHeaders, getRateLimitStats, RATE_LIMITS }
