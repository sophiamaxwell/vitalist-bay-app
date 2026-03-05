'use client'

import { useState, useEffect, useCallback } from 'react'
// import { useRouter } from 'next/navigation'
import { SessionWithRelations } from '@/types'
import { SessionDetail } from '@/components/sessions/SessionDetail'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface SessionPageProps {
  params: { eventId: string; sessionId: string }
}

// Mock user ID
const MOCK_USER_ID = 'user-demo-123'

export default function SessionPage({ params }: SessionPageProps) {
  const { eventId, sessionId } = params

  const [session, setSession] = useState<SessionWithRelations | null>(null)
  const [isInAgenda, setIsInAgenda] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch session
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [sessionRes, agendaRes] = await Promise.all([
          fetch(`/api/events/${eventId}/sessions/${sessionId}`),
          fetch(`/api/events/${eventId}/agenda?userId=${MOCK_USER_ID}`),
        ])

        if (!sessionRes.ok) {
          setError('Session not found')
          return
        }

        const [sessionData, agendaData] = await Promise.all([
          sessionRes.json(),
          agendaRes.json(),
        ])

        setSession(sessionData)
        setIsInAgenda(agendaData.some((item: { sessionId: string }) => item.sessionId === sessionId))
      } catch {
        setError('Failed to load session')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [eventId, sessionId])

  // Add to agenda
  const handleAddToAgenda = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: MOCK_USER_ID, sessionId }),
      })

      if (response.ok) {
        setIsInAgenda(true)
      }
    } catch (err) {
      console.error('Failed to add to agenda:', err)
    }
  }, [eventId, sessionId])

  // Remove from agenda
  const handleRemoveFromAgenda = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/events/${eventId}/agenda?userId=${MOCK_USER_ID}&sessionId=${sessionId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setIsInAgenda(false)
      }
    } catch (err) {
      console.error('Failed to remove from agenda:', err)
    }
  }, [eventId, sessionId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          {error || 'Session not found'}
        </h1>
        <Link href={`/events/${eventId}/agenda`}>
          <Button>Back to Agenda</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href={`/events/${eventId}/agenda`}
          className="text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-1"
        >
          ← Back to Agenda
        </Link>
      </div>

      {/* Session Detail */}
      <SessionDetail
        session={session}
        isInAgenda={isInAgenda}
        onAddToAgenda={handleAddToAgenda}
        onRemoveFromAgenda={handleRemoveFromAgenda}
      />
    </div>
  )
}
