import Link from 'next/link'

export const metadata = {
  title: 'Check Your Email - Vitalist Bay Events',
  description: 'We sent you a magic link to sign in',
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Email Icon */}
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-gray-600 mb-6">
          We sent you a magic link to sign in. Click the link in your email to continue.
        </p>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <p className="text-sm text-gray-500">
            The link expires in <span className="font-medium text-gray-700">10 minutes</span>.
            <br />
            If you don&apos;t see the email, check your spam folder.
          </p>
        </div>

        <Link
          href="/login"
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          ← Back to sign in
        </Link>
      </div>
    </main>
  )
}
