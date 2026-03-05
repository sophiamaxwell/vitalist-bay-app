'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { QRCodeDisplay } from '@/components/qrcode'
import type { RegistrationWithDetails } from '@/types/registration'

interface ConfirmationPageProps {
  params: { eventId: string }
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { eventId } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  
  const [registration, setRegistration] = useState<RegistrationWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const registrationId = searchParams.get('id')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    const fetchRegistration = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/register`)
        if (!response.ok) {
          throw new Error('Failed to load registration')
        }
        
        const data = await response.json()
        if (!data.registered) {
          router.push(`/events/${eventId}/register`)
          return
        }
        
        setRegistration(data.registration)
      } catch (err) {
        setError('Failed to load registration details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchRegistration()
    }
  }, [eventId, status, router])

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Loading confirmation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <Link href={`/events/${eventId}`}>
              <Button>Back to Event</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!registration) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Success Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">You're Registered! 🎉</h1>
        <p className="text-slate-500">
          A confirmation email has been sent to your inbox.
        </p>
      </div>

      {/* Registration Details Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Event Info */}
          <div className="border-b border-slate-200 pb-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {registration.event?.name || 'Event'}
            </h2>
            <div className="space-y-3 text-slate-600">
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <span>{formatDate(registration.event?.startDate || new Date())}</span>
              </div>
              {registration.event?.venue && (
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <span>
                    {registration.event.venue}
                    {registration.event.city && `, ${registration.event.city}`}
                  </span>
                </div>
              )}
              {registration.ticketType && (
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎫</span>
                  <span>{registration.ticketType.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Registration Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-500">Registration ID</label>
              <p className="text-lg font-mono font-semibold text-slate-900">{registration.id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500">QR Code for Check-in</label>
              <div className="mt-2 p-4 bg-white border-2 border-slate-200 rounded-xl inline-block">
                <QRCodeDisplay value={registration.qrCode} size={160} />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Show this code at the event check-in
              </p>
              <Link 
                href={`/events/${eventId}/my-ticket`}
                className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 inline-block"
              >
                View full ticket →
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-500">Status:</label>
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${registration.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : ''}
                ${registration.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                ${registration.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : ''}
                ${registration.status === 'WAITLISTED' ? 'bg-blue-100 text-blue-700' : ''}
              `}>
                {registration.status === 'CONFIRMED' && '✓ Confirmed'}
                {registration.status === 'PENDING' && '⏳ Pending'}
                {registration.status === 'CANCELLED' && '✕ Cancelled'}
                {registration.status === 'WAITLISTED' && '📋 Waitlisted'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">What's Next?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-primary">✓</span>
              <span className="text-slate-600">Check your email for the confirmation and calendar invite</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">✓</span>
              <span className="text-slate-600">Browse the event agenda and plan your schedule</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">✓</span>
              <span className="text-slate-600">Connect with other attendees and schedule meetings</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">✓</span>
              <span className="text-slate-600">Download the event app for the best experience</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href={`/events/${eventId}/agenda`} className="flex-1">
          <Button fullWidth variant="primary">
            View Agenda
          </Button>
        </Link>
        <Link href={`/events/${eventId}`} className="flex-1">
          <Button fullWidth variant="secondary">
            Event Home
          </Button>
        </Link>
      </div>

      {/* Add to Calendar */}
      <div className="mt-6 text-center">
        <Button variant="ghost" className="text-slate-500">
          📅 Add to Calendar
        </Button>
      </div>
    </div>
  )
}
