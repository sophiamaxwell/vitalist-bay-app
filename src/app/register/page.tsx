import { RegisterForm } from '@/components/auth'

export const metadata = {
  title: 'Create Account - Vitalist Bay Events',
  description: 'Create your Vitalist Bay Events account',
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <RegisterForm />
    </main>
  )
}
