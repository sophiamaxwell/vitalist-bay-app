import { requireAuth } from '@/lib/auth-utils'
import { UserMenu } from '@/components/auth'
import Link from 'next/link'

export const metadata = {
  title: 'Dashboard - Vitalist Bay Events',
  description: 'Your event dashboard',
}

export default async function DashboardPage() {
  const session = await requireAuth('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Vitalist Bay Events
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900">
                  Events
                </Link>
                <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900">
                  Profile
                </Link>
                {(session.user.role === 'ADMIN' || session.user.role === 'ORGANIZER') && (
                  <Link href="/studio" className="text-sm text-gray-600 hover:text-gray-900">
                    Studio
                  </Link>
                )}
              </nav>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{session.user.name ? `, ${session.user.name}` : ''}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with your events.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/events"
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Browse Events</h3>
            <p className="text-sm text-gray-500 mt-1">Discover upcoming events</p>
          </Link>

          <Link
            href="/profile"
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">My Profile</h3>
            <p className="text-sm text-gray-500 mt-1">Update your information</p>
          </Link>

          <Link
            href="/settings"
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Settings</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your account</p>
          </Link>

          {(session.user.role === 'ADMIN' || session.user.role === 'ORGANIZER') && (
            <Link
              href="/studio"
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Organizer Studio</h3>
              <p className="text-sm text-gray-500 mt-1">Create and manage events</p>
            </Link>
          )}
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium text-gray-900">{session.user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Role</dt>
              <dd className="text-sm font-medium text-gray-900">{session.user.role}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-sm font-medium text-gray-900">{session.user.name || 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">User ID</dt>
              <dd className="text-sm font-mono text-gray-600">{session.user.id}</dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  )
}
