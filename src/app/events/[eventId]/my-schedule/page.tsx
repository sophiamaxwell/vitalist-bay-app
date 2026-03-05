'use client'

import { useState, useEffect, useCallback } from 'react'
import { SessionWithRelations, Track } from '@/types'
import { SessionList } from '@/components/sessions/SessionList'
import { SessionDetail } from '@/components/sessions/SessionDetail'
import { Modal } from '@/components/ui/Modal'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface MySchedulePageProps {
  params: { eventId: string }
}

// Mock user ID - in production this would come from auth
const MOCK_USER_ID = 'user-demo-123'

export default function MySchedulePage({ params }: MySchedulePageProps) {
  const { eventId } = params

  const [agendaItems, setAgendaItems] = useState<{ sessionId: string; session: SessionWithRelations }[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [selectedSession, setSelectedSession] = useState<SessionWithRelations | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [agendaRes, tracksRes] = await Promise.all([
          fetch(`/api/events/${eventId}/agenda?userId=${MOCK_USER_ID}`),
          fetch(`/api/events/${eventId}/tracks`),
        ])

        const [agendaData, tracksData] = await Promise.all([
          agendaRes.json(),
          tracksRes.json(),
        ])

        setAgendaItems(agendaData)
        setTracks(tracksData)
      } catch (err) {
        console.error('Failed to load schedule:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [eventId])

  // Remove from agenda
  const handleRemoveFromAgenda = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(
        `/api/events/${eventId}/agenda?userId=${MOCK_USER_ID}&sessionId=${sessionId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setAgendaItems((prev) => prev.filter((item) => item.sessionId !== sessionId))
        // Close modal if the removed session was selected
        if (selectedSession?.id === sessionId) {
          setShowDetailModal(false)
          setSelectedSession(null)
        }
      }
    } catch (err) {
      console.error('Failed to remove from schedule:', err)
    }
  }, [eventId, selectedSession])

  // View session detail
  const handleSessionClick = (session: SessionWithRelations) => {
    setSelectedSession(session)
    setShowDetailModal(true)
  }

  // Extract sessions from agenda items
  const sessions = agendaItems.map((item) => item.session)
  const agendaSessionIds = new Set(agendaItems.map((item) => item.sessionId))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
          <p className="text-slate-600 mt-1">
            {sessions.length > 0
              ? `You have ${sessions.length} session${sessions.length !== 1 ? 's' : ''} in your personal schedule`
              : 'Your personal schedule is empty'}
          </p>
        </div>
        {sessions.length > 0 && (
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => alert('Export to calendar coming soon!')}>
              📅 Export to Calendar
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
              <span className="text-5xl">📅</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Build your personal schedule
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Browse sessions in the Agenda and click the calendar icon to add them to your personal schedule.
            </p>
            <Link href={`/events/${eventId}/agenda`}>
              <Button>Browse Agenda</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <SessionList
          sessions={sessions}
          tracks={tracks}
          agendaSessionIds={agendaSessionIds}
          onSessionClick={handleSessionClick}
          onRemoveFromAgenda={handleRemoveFromAgenda}
          showFilters={false}
          showAgendaActions={true}
          emptyMessage="No sessions in your schedule"
          viewMode="schedule"
        />
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
            isInAgenda={true}
            onRemoveFromAgenda={() => handleRemoveFromAgenda(selectedSession.id)}
          />
        )}
      </Modal>
    </div>
  )
}
