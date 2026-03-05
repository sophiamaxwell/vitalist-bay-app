'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Attendee {
  id: string
  qrCode: string
  user: {
    id: string
    name: string | null
    email: string
    avatar: string | null
    company: string | null
    jobTitle: string | null
  }
  ticketType: string
  checkedIn: boolean
  checkedInAt: string | null
  registeredAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface AttendeesPageProps {
  params: { eventId: string }
}

export default function AttendeesPage({ params }: AttendeesPageProps) {
  const { eventId } = params
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 50, total: 0, totalPages: 0
  })
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'checked-in' | 'not-checked-in'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchAttendees = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        filter,
        ...(search && { search })
      })
      
      const res = await fetch(`/api/events/${eventId}/attendees?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAttendees(data.attendees)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch attendees:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendees()
  }, [eventId, pagination.page, filter])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (pagination.page === 1) {
        fetchAttendees()
      } else {
        setPagination(p => ({ ...p, page: 1 }))
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  // Toggle check-in status
  const toggleCheckIn = async (attendee: Attendee) => {
    setUpdatingId(attendee.id)
    try {
      const res = await fetch(`/api/events/${eventId}/checkin/${attendee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkedIn: !attendee.checkedIn })
      })

      if (res.ok) {
        setAttendees(prev => prev.map(a => 
          a.id === attendee.id
            ? { ...a, checkedIn: !a.checkedIn, checkedInAt: !a.checkedIn ? new Date().toISOString() : null }
            : a
        ))
      }
    } catch (error) {
      console.error('Failed to update check-in:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const stats = {
    total: pagination.total,
    checkedIn: attendees.filter(a => a.checkedIn).length,
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendees</h1>
          <p className="text-slate-500 mt-1">Manage event attendees and check-in status</p>
        </div>
        <Link href={`/studio/${eventId}/checkin`}>
          <Button>
            📱 Open Scanner
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({pagination.total})
              </button>
              <button
                onClick={() => setFilter('checked-in')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'checked-in'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ✓ Checked In
              </button>
              <button
                onClick={() => setFilter('not-checked-in')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'not-checked-in'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Not Arrived
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendee List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">
              Loading attendees...
            </div>
          ) : attendees.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              {search || filter !== 'all' ? 'No matching attendees found.' : 'No attendees registered yet.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Attendee</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Ticket</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Registered</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((attendee) => (
                      <tr key={attendee.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {attendee.user.avatar ? (
                              <img
                                src={attendee.user.avatar}
                                alt=""
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-600 font-semibold">
                                  {attendee.user.name?.[0] || attendee.user.email[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-slate-900">
                                {attendee.user.name || 'No name'}
                              </div>
                              <div className="text-sm text-slate-500">{attendee.user.email}</div>
                              {attendee.user.company && (
                                <div className="text-xs text-slate-400">
                                  {attendee.user.jobTitle && `${attendee.user.jobTitle} @ `}
                                  {attendee.user.company}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {attendee.ticketType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500">
                          {new Date(attendee.registeredAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {attendee.checkedIn ? (
                            <div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                ✓ Checked In
                              </span>
                              {attendee.checkedInAt && (
                                <div className="text-xs text-slate-400 mt-1">
                                  {new Date(attendee.checkedInAt).toLocaleTimeString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                              Not arrived
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => toggleCheckIn(attendee)}
                            disabled={updatingId === attendee.id}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              attendee.checkedIn
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            } disabled:opacity-50`}
                          >
                            {updatingId === attendee.id
                              ? '...'
                              : attendee.checkedIn
                                ? 'Undo Check-in'
                                : 'Check In'
                            }
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-200">
                  <div className="text-sm text-slate-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 text-sm rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
