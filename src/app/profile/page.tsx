import { requireAuth } from '@/lib/auth-utils'
import Link from 'next/link'

export const metadata = {
  title: 'Profile - Vitalist Bay Events',
  description: 'Your profile',
}

export default async function ProfilePage() {
  const session = await requireAuth('/profile')

  const initials = session.user.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : session.user.email?.[0].toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
              ← Back to Dashboard
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Cover */}
          <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-500" />
          
          {/* Avatar & Name */}
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              {session.user.avatar ? (
                <img
                  src={session.user.avatar}
                  alt={session.user.name || 'User'}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {session.user.name || 'User'}
                </h2>
                <p className="text-gray-500">{session.user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 rounded-full">
                  {session.user.role}
                </span>
              </div>
              <Link
                href="/settings"
                className="px-4 py-2 text-sm font-medium text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Profile Completion</h3>
            <span className="text-sm font-medium text-emerald-600">25%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '25%' }} />
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-600">Email verified</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
              </svg>
              <span className="text-gray-400">Add profile photo</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
              </svg>
              <span className="text-gray-400">Add bio</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
              </svg>
              <span className="text-gray-400">Add company info</span>
            </li>
          </ul>
        </div>

        {/* My Registrations */}
        <div className="mt-6">
          <Link
            href="/profile/registrations"
            className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                  🎫
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">My Registrations</h3>
                  <p className="text-sm text-gray-500">View your event registrations</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Profile Sections */}
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">About</h3>
            <p className="text-gray-500 text-sm">No bio added yet.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{session.user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-400">Not set</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Website</dt>
                <dd className="text-gray-400">Not set</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Social Media</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">LinkedIn</dt>
                <dd className="text-gray-400">Not set</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Twitter</dt>
                <dd className="text-gray-400">Not set</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  )
}
