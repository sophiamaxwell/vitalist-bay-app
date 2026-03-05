'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

type LoginMode = 'magic-link' | 'credentials'

export function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')
  
  const [mode, setMode] = useState<LoginMode>('magic-link')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setMessage({ type: 'error', text: 'Failed to send magic link. Please try again.' })
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Magic link sent! Check your email to sign in.' 
        })
        setEmail('')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setMessage({ type: 'error', text: 'Invalid email or password.' })
      } else if (result?.ok) {
        window.location.href = callbackUrl
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo/Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vitalist Bay Events</h1>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      {/* Error from URL */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            {error === 'CredentialsSignin' 
              ? 'Invalid email or password.' 
              : error === 'OAuthCallback'
              ? 'Error during sign in. Please try again.'
              : 'An error occurred. Please try again.'}
          </p>
        </div>
      )}

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setMode('magic-link')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            mode === 'magic-link'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Magic Link
        </button>
        <button
          type="button"
          onClick={() => setMode('credentials')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            mode === 'credentials'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Password
        </button>
      </div>

      {/* Magic Link Form */}
      {mode === 'magic-link' && (
        <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
          <div>
            <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="magic-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Magic Link'}
          </button>
          <p className="text-xs text-gray-500 text-center">
            We&apos;ll email you a magic link for a password-free sign in.
          </p>
        </form>
      )}

      {/* Credentials Form */}
      {mode === 'credentials' && (
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label htmlFor="cred-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="cred-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      )}

      {/* Register Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}
