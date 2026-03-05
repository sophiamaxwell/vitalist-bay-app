import { requireAuth } from '@/lib/auth-utils'
import Link from 'next/link'

export const metadata = {
  title: 'Welcome - Vitalist Bay Events',
  description: 'Complete your profile setup',
}

export default async function OnboardingPage() {
  await requireAuth('/onboarding')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg mx-auto">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <svg 
              className="w-8 h-8 text-emerald-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Vitalist Bay Events!
          </h1>
          <p className="text-gray-600 mb-8">
            Your account has been created successfully. Let&apos;s get you set up.
          </p>

          {/* Quick Setup Steps */}
          <div className="text-left space-y-4 mb-8">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Complete your profile</h3>
                <p className="text-sm text-gray-500">Add your name, company, and bio</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Browse events</h3>
                <p className="text-sm text-gray-500">Discover and register for upcoming events</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Connect with attendees</h3>
                <p className="text-sm text-gray-500">Network with other participants</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/settings"
              className="block w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
            >
              Complete Your Profile
            </Link>
            <Link
              href="/dashboard"
              className="block w-full py-3 px-4 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Skip for now →
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Need help? <a href="mailto:support@vitalistbay.com" className="text-emerald-600 hover:text-emerald-700">Contact support</a>
        </p>
      </div>
    </div>
  )
}
