import { auth } from './auth'
import { redirect } from 'next/navigation'

/**
 * Get the current session on the server
 * Use this in Server Components
 */
export async function getSession() {
  return await auth()
}

/**
 * Get the current user from session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

/**
 * Require authentication for a page
 * Redirects to login if not authenticated
 * Use in Server Components
 */
export async function requireAuth(callbackUrl?: string) {
  const session = await auth()
  
  if (!session?.user) {
    const url = callbackUrl 
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/login'
    redirect(url)
  }
  
  return session
}

/**
 * Require specific role(s) for a page
 * Redirects to dashboard if user doesn't have required role
 */
export async function requireRole(
  allowedRoles: Array<'ADMIN' | 'ORGANIZER' | 'SPEAKER' | 'EXHIBITOR' | 'ATTENDEE'>,
  callbackUrl?: string
) {
  const session = await requireAuth(callbackUrl)
  
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/dashboard')
  }
  
  return session
}

/**
 * Check if user has specific role
 */
export async function hasRole(
  role: 'ADMIN' | 'ORGANIZER' | 'SPEAKER' | 'EXHIBITOR' | 'ATTENDEE'
) {
  const session = await auth()
  return session?.user?.role === role
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(
  roles: Array<'ADMIN' | 'ORGANIZER' | 'SPEAKER' | 'EXHIBITOR' | 'ATTENDEE'>
) {
  const session = await auth()
  return session?.user?.role ? roles.includes(session.user.role) : false
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  return hasRole('ADMIN')
}

/**
 * Check if user can manage events (admin or organizer)
 */
export async function canManageEvents() {
  return hasAnyRole(['ADMIN', 'ORGANIZER'])
}
