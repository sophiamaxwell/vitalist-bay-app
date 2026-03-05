'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TicketQRCode } from '@/components/tickets'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Registration {
  id: string
  qrCode: string
  checkedIn: boolean
  checkedInAt: string | null
  status: string
  ticketType: {
    name: string
  } | null
}

interface Event {
  id: string
  name: string
  startDate: string
  endDate: string
  venue: string | null
  address: string | null
  city: string | null
}

interface User {
  id: string
  name: string | null
  email: string
}

interface MyTicketPageProps {
  params: { eventId: string }
}

export default function MyTicketPage({ params }: MyTicketPageProps) {
  const { eventId } = params
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/my-ticket`)
        if (res.ok) {
          const data = await res.json()
          setRegistration(data.registration)
          setEvent(data.event)
          setUser(data.user)
        } else if (res.status === 401) {
          setError('Please log in to view your ticket')
        } else if (res.status === 404) {
          setError('You are not registered for this event')
        } else {
          setError('Failed to load ticket')
        }
      } catch {
        setError('Network error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTicket()
  }, [eventId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading your ticket...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-5xl mb-4">🎫</div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Ticket Not Available</h1>
            <p className="text-slate-500 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Link href={`/events/${eventId}`}>
                <Button variant="secondary">View Event</Button>
              </Link>
              <Link href="/login">
                <Button>Log In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!registration || !event || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Link */}
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
        >
          ← Back to event
        </Link>

        {/* Ticket */}
        <TicketQRCode
          registration={registration}
          event={event}
          user={user}
          ticketType={registration.ticketType?.name}
        />

        {/* Download / Print Options */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1 h-12 touch-interactive"
            onClick={() => window.print()}
          >
            🖨️ Print
          </Button>
          <Button
            variant="secondary"
            className="flex-1 h-12 touch-interactive"
            onClick={() => {
              // Add to calendar functionality placeholder
              alert('Add to Calendar - Coming soon!')
            }}
          >
            📅 Calendar
          </Button>
        </div>

        {/* Event Details */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Event Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="text-slate-900">
                  {new Date(event.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time</span>
                <span className="text-slate-900">
                  {new Date(event.startDate).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {event.venue && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Venue</span>
                  <span className="text-slate-900">{event.venue}</span>
                </div>
              )}
              {event.address && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Address</span>
                  <span className="text-slate-900 text-right">
                    {event.address}
                    {event.city && `, ${event.city}`}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Having trouble? Contact the event organizer for assistance.
        </p>
      </div>
    </div>
  )
}
