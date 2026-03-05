'use client'

import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
import { SessionWithRelations, Track, Room, Speaker, SessionFormData } from '@/types'
import { SessionList } from '@/components/sessions/SessionList'
import { SessionForm } from '@/components/sessions/SessionForm'
import { SessionDetail } from '@/components/sessions/SessionDetail'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface SessionsPageProps {
  params: { eventId: string }
}

export default function SessionsPage({ params }: SessionsPageProps) {
  const { eventId } = params

  const [sessions, setSessions] = useState<SessionWithRelations[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [, setError] = useState<string | null>(null)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionWithRelations | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Initial load state
  const [showEmptyState, setShowEmptyState] = useState(false)

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [sessionsRes, tracksRes, roomsRes, speakersRes] = await Promise.all([
          fetch(`/api/events/${eventId}/sessions`),
          fetch(`/api/events/${eventId}/tracks`),
          fetch(`/api/events/${eventId}/rooms`),
          fetch(`/api/events/${eventId}/speakers`),
        ])

        const [sessionsData, tracksData, roomsData, speakersData] = await Promise.all([
          sessionsRes.json(),
          tracksRes.json(),
          roomsRes.json(),
          speakersRes.json(),
        ])

        setSessions(sessionsData)
        setTracks(tracksData)
        setRooms(roomsData)
        setSpeakers(speakersData)
        setShowEmptyState(sessionsData.length === 0)
      } catch (err) {
        setError('Failed to load data')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [eventId])

  // Create session
  const handleCreate = async (data: SessionFormData) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/events/${eventId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create session')

      const newSession = await response.json()
      setSessions((prev) => [...prev, newSession])
      setShowCreateModal(false)
      setShowEmptyState(false)
    } catch (err) {
      console.error(err)
      alert('Failed to create session')
    } finally {
      setIsSaving(false)
    }
  }

  // Update session
  const handleUpdate = async (data: SessionFormData) => {
    if (!selectedSession) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/events/${eventId}/sessions/${selectedSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update session')

      const updatedSession = await response.json()
      setSessions((prev) =>
        prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
      )
      setSelectedSession(updatedSession)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      alert('Failed to update session')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete session
  const handleDelete = async () => {
    if (!selectedSession) return
    if (!confirm('Are you sure you want to delete this session?')) return

    try {
      const response = await fetch(`/api/events/${eventId}/sessions/${selectedSession.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete session')

      setSessions((prev) => prev.filter((s) => s.id !== selectedSession.id))
      setShowDetailModal(false)
      setSelectedSession(null)
    } catch (err) {
      console.error(err)
      alert('Failed to delete session')
    }
  }

  // View session
  const handleSessionClick = (session: SessionWithRelations) => {
    setSelectedSession(session)
    setIsEditing(false)
    setShowDetailModal(true)
  }

  // Format session for form
  const formatSessionForForm = (session: SessionWithRelations): Partial<SessionFormData> => ({
    title: session.title,
    description: session.description || '',
    startTime: new Date(session.startTime).toISOString().slice(0, 16),
    endTime: new Date(session.endTime).toISOString().slice(0, 16),
    type: session.type,
    trackId: session.trackId,
    roomId: session.roomId,
    speakerIds: session.speakers?.map((ss) => ss.speakerId) || [],
    capacity: session.capacity,
    streamUrl: session.streamUrl,
    recordingUrl: session.recordingUrl,
    isPublished: session.isPublished,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Empty state
  if (showEmptyState) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create sessions</h1>
          <p className="text-slate-600 mt-1">
            Allow people to plan their schedule, save time and keep them informed on the latest updates.
          </p>
          <a href="#" className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1 mt-2">
            🎯 Learn how →
          </a>
        </div>

        <div className="space-y-4">
          {/* Import Option */}
          <Card hoverable onClick={() => alert('Excel import coming soon!')}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Import via Excel file</h3>
                <p className="text-sm text-slate-500">
                  Download and update our pre-filled Excel template to add or edit sessions in bulk.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Create Manually */}
          <Card hoverable onClick={() => setShowCreateModal(true)}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <span className="text-2xl">✏️</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Create manually</h3>
                <p className="text-sm text-slate-500">Add a session on the next screen.</p>
              </div>
            </CardContent>
          </Card>

          {/* Session Settings */}
          <Card hoverable onClick={() => alert('Session settings coming soon!')}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Session settings</h3>
                <p className="text-sm text-slate-500">
                  We recommend that you choose your default settings before adding sessions. You can create custom fields to add more data and use them for filters.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Session"
          size="lg"
        >
          <SessionForm
            eventId={eventId}
            tracks={tracks}
            rooms={rooms}
            speakers={speakers}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateModal(false)}
            isLoading={isSaving}
          />
        </Modal>
      </div>
    )
  }

  // Sessions list view
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sessions</h1>
          <p className="text-slate-600 mt-1">
            Manage your event schedule and sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => alert('Export coming soon!')}>
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>+ Create Session</Button>
        </div>
      </div>

      {/* Sessions List */}
      <SessionList
        sessions={sessions}
        tracks={tracks}
        onSessionClick={handleSessionClick}
        showFilters={true}
        showAgendaActions={false}
        emptyMessage="No sessions yet. Create your first session!"
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Session"
        size="lg"
      >
        <SessionForm
          eventId={eventId}
          tracks={tracks}
          rooms={rooms}
          speakers={speakers}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isSaving}
        />
      </Modal>

      {/* Detail/Edit Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedSession(null)
          setIsEditing(false)
        }}
        title={isEditing ? 'Edit Session' : selectedSession?.title}
        size="lg"
      >
        {selectedSession && (
          isEditing ? (
            <SessionForm
              initialData={formatSessionForForm(selectedSession)}
              eventId={eventId}
              tracks={tracks}
              rooms={rooms}
              speakers={speakers}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={isSaving}
            />
          ) : (
            <SessionDetail
              session={selectedSession}
              isOrganizer={true}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
            />
          )
        )}
      </Modal>
    </div>
  )
}
