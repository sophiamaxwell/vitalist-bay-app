'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { RegistrationWithDetails } from '@/types/registration'

export default function MyRegistrationsPage() {
  const { status } = useSession()
  const router = useRouter()
  
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile/registrations')
      return
    }

    const fetchRegistrations = async () => {
      try {
        const response = await fetch('/api/user/registrations')
        if (response.ok) {
          const data = await response.json()
          setRegistrations(data.registrations)
        }
      } catch (err) {
        console.error('Failed to load registrations:', err)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchRegistrations()
    }
  }, [status, router])

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const isUpcoming = (date: Date | string) => {
    return new Date(date) >= new Date()
  }

  const filteredRegistrations = registrations.filter((reg) => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return reg.event && isUpcoming(reg.event.startDate)
    if (filter === 'past') return reg.event && !isUpcoming(reg.event.startDate)
    return true
  })

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Loading your registrations...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Registrations</h1>
        <p className="text-slate-500">View and manage your event registrations</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'past'
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All
        </button>
      </div>

      {/* Registration List */}
      {filteredRegistrations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {filter === 'upcoming' && 'No upcoming events'}
              {filter === 'past' && 'No past events'}
              {filter === 'all' && 'No registrations yet'}
            </h2>
            <p className="text-slate-500 mb-6">
              {filter === 'upcoming' 
                ? "You don't have any upcoming event registrations."
                : "Browse our events and register for one!"}
            </p>
            <Link href="/">
              <Button>Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRegistrations.map((registration) => (
            <Card key={registration.id} variant="interactive">
              <CardContent className="p-0">
                <Link href={`/events/${registration.eventId}`} className="block">
                  <div className="flex flex-col md:flex-row">
                    {/* Event Banner */}
                    <div className="w-full md:w-48 h-32 md:h-auto bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
                      {registration.event?.banner ? (
                        <img 
                          src={registration.event.banner} 
                          alt="" 
                          className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
                        />
                      ) : (
                        <span className="text-4xl text-white">🎪</span>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {registration.event?.name || 'Event'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              📅 {formatDate(registration.event?.startDate || new Date())}
                            </span>
                            {registration.event?.city && (
                              <span className="flex items-center gap-1">
                                📍 {registration.event.city}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            registration.status === 'CONFIRMED' ? 'success' :
                            registration.status === 'PENDING' ? 'warning' :
                            registration.status === 'CANCELLED' ? 'danger' : 'secondary'
                          }
                        >
                          {registration.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {registration.ticketType && (
                          <span className="text-slate-600">
                            🎫 {registration.ticketType.name}
                          </span>
                        )}
                        <span className="text-slate-400">
                          ID: {registration.id.slice(0, 8)}...
                        </span>
                        {registration.checkedIn && (
                          <span className="text-green-600 font-medium">
                            ✓ Checked In
                          </span>
                        )}
                      </div>
                      
                      {/* View Ticket Button */}
                      {registration.status === 'CONFIRMED' && registration.event && isUpcoming(registration.event.startDate) && (
                        <Link 
                          href={`/events/${registration.eventId}/my-ticket`}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                        >
                          📱 View Ticket & QR Code
                        </Link>
                      )}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Back to Profile */}
      <div className="mt-8 text-center">
        <Link href="/profile">
          <Button variant="ghost">← Back to Profile</Button>
        </Link>
      </div>
    </div>
  )
}
