'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SessionWithRelations, Track } from '@/types'
import { SessionList } from '@/components/sessions/SessionList'
import { SessionDetail } from '@/components/sessions/SessionDetail'
import { Modal } from '@/components/ui/Modal'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface AgendaPageProps {
  params: { eventId: string }
}

// Mock user ID - in production this would come from auth
const MOCK_USER_ID = 'user-demo-123'

export default function AgendaPage({ params }: AgendaPageProps) {
  const { eventId } = params
  const router = useRouter()

  const [sessions, setSessions] = useState<SessionWithRelations[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [agendaSessionIds, setAgendaSessionIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [showFiltersSheet, setShowFiltersSheet] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [selectedSession, setSelectedSession] = useState<SessionWithRelations | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [sessionsRes, tracksRes, agendaRes] = await Promise.all([
          fetch(`/api/events/${eventId}/sessions?published=true`),
          fetch(`/api/events/${eventId}/tracks`),
          fetch(`/api/events/${eventId}/agenda?userId=${MOCK_USER_ID}`),
        ])

        const [sessionsData, tracksData, agendaData] = await Promise.all([
          sessionsRes.json(),
          tracksRes.json(),
          agendaRes.json(),
        ])

        setSessions(sessionsData)
        setTracks(tracksData)
        setAgendaSessionIds(new Set(agendaData.map((item: any) => item.sessionId)))
      } catch (err) {
        console.error('Failed to load agenda:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [eventId])

  // Add to agenda
  const handleAddToAgenda = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: MOCK_USER_ID, sessionId }),
      })

      if (response.ok) {
        setAgendaSessionIds((prev) => new Set([...prev, sessionId]))
      }
    } catch (err) {
      console.error('Failed to add to agenda:', err)
    }
  }, [eventId])

  // Remove from agenda
  const handleRemoveFromAgenda = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(
        `/api/events/${eventId}/agenda?userId=${MOCK_USER_ID}&sessionId=${sessionId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setAgendaSessionIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(sessionId)
          return newSet
        })
      }
    } catch (err) {
      console.error('Failed to remove from agenda:', err)
    }
  }, [eventId])

  // View session detail
  const handleSessionClick = (session: SessionWithRelations) => {
    setSelectedSession(session)
    setShowDetailModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Mobile Search & Filter Bar */}
      <div className="md:hidden sticky top-14 bg-slate-50 -mx-4 px-4 py-3 z-10 border-b border-slate-200">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="search"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setShowFiltersSheet(true)}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center gap-2 touch-target"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-medium">Filter</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-80 flex-shrink-0">
        {/* Search */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Time zone</h3>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="radio" name="timezone" defaultChecked className="text-emerald-500" />
                My time zone (America/Los_Angeles)
              </label>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Time format</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="radio" name="timeformat" defaultChecked className="text-emerald-500" />
                  12-hour format
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="radio" name="timeformat" className="text-emerald-500" />
                  24-hour format
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Click 📅 to register and add it to your schedule
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Register for sessions to build your personal schedule. You can access it anytime in your personal area and sync it with Google Calendar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 sm:py-16 text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <span className="text-4xl sm:text-5xl">📅</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                No content available yet
              </h2>
              <p className="text-sm sm:text-base text-slate-500">
                Check back soon for sessions and updates.
              </p>
            </CardContent>
          </Card>
        ) : (
          <SessionList
            sessions={sessions}
            tracks={tracks}
            agendaSessionIds={agendaSessionIds}
            onSessionClick={handleSessionClick}
            onAddToAgenda={handleAddToAgenda}
            onRemoveFromAgenda={handleRemoveFromAgenda}
            showFilters={true}
            showAgendaActions={true}
            emptyMessage="No sessions match your filters"
            viewMode="list"
          />
        )}
      </div>

      {/* Mobile Filter Sheet */}
      {showFiltersSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setShowFiltersSheet(false)}
          />
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 md:hidden max-h-[80vh] overflow-auto"
               style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
            <div className="sticky top-0 bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
              <button
                onClick={() => setShowFiltersSheet(false)}
                className="touch-target flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Track Filters */}
              {tracks.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Tracks</h4>
                  <div className="flex flex-wrap gap-2">
                    {tracks.map((track) => (
                      <button
                        key={track.id}
                        className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-600 touch-interactive"
                      >
                        {track.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Options */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Time Zone</h4>
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl touch-interactive">
                  <input type="radio" name="timezone-mobile" defaultChecked className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-600">My time zone (America/Los_Angeles)</span>
                </label>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-3">Time Format</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl touch-interactive">
                    <input type="radio" name="timeformat-mobile" defaultChecked className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-slate-600">12-hour format</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl touch-interactive">
                    <input type="radio" name="timeformat-mobile" className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-slate-600">24-hour format</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => setShowFiltersSheet(false)}
                className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl touch-interactive"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

      {/* Session Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedSession(null)
        }}
        title={selectedSession?.title}
        size="lg"
      >
        {selectedSession && (
          <SessionDetail
            session={selectedSession}
            isInAgenda={agendaSessionIds.has(selectedSession.id)}
            onAddToAgenda={() => handleAddToAgenda(selectedSession.id)}
            onRemoveFromAgenda={() => handleRemoveFromAgenda(selectedSession.id)}
          />
        )}
      </Modal>
    </div>
  )
}
