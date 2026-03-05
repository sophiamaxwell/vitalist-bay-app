import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/events',
  '/profile',
  '/settings',
  '/studio',
  '/admin',
]

// Routes only for unauthenticated users
const authRoutes = [
  '/login',
  '/register',
  '/verify-email',
]

// Routes that require specific roles
const roleRoutes: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/studio': ['ADMIN', 'ORGANIZER'],
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get session
  const session = await auth()
  const isAuthenticated = !!session?.user
  
  // Check if current path matches protected routes
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if current path matches auth-only routes
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check role-based access
  if (isAuthenticated && session.user.role) {
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(session.user.role)) {
          // Redirect to dashboard if user doesn't have required role
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
