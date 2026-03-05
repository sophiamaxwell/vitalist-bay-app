import { Suspense } from 'react'
import { LoginForm } from '@/components/auth'

export const metadata = {
  title: 'Sign In - Vitalist Bay Events',
  description: 'Sign in to your Vitalist Bay Events account',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  )
}
