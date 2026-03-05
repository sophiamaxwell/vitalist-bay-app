'use client'

import { useState, useMemo } from 'react'
import { SessionWithRelations, Track } from '@/types'
import { SessionCard } from './SessionCard'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { groupSessionsByDate, formatDate, cn } from '@/lib/utils'

interface SessionListProps {
  sessions: SessionWithRelations[]
  tracks: Track[]
  agendaSessionIds?: Set<string>
  onSessionClick?: (session: SessionWithRelations) => void
  onAddToAgenda?: (sessionId: string) => void
  onRemoveFromAgenda?: (sessionId: string) => void
  showFilters?: boolean
  showAgendaActions?: boolean
  emptyMessage?: string
  viewMode?: 'list' | 'schedule'
}

export function SessionList({
  sessions,
  tracks,
  agendaSessionIds = new Set(),
  onSessionClick,
  onAddToAgenda,
  onRemoveFromAgenda,
  showFilters = true,
  showAgendaActions = true,
  emptyMessage = 'No sessions found',
  viewMode: initialViewMode = 'list',
}: SessionListProps) {
  const [search, setSearch] = useState('')
  const [selectedTrack, setSelectedTrack] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'schedule'>(initialViewMode)

  const sessionTypes = useMemo(() => {
    const types = new Set(sessions.map((s) => s.type))
    return Array.from(types).map((type) => ({ value: type, label: type }))
  }, [sessions])

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        !search ||
        session.title.toLowerCase().includes(search.toLowerCase()) ||
        session.description?.toLowerCase().includes(search.toLowerCase()) ||
        session.speakers?.some((ss) => ss.speaker.name.toLowerCase().includes(search.toLowerCase()))

      const matchesTrack = !selectedTrack || session.trackId === selectedTrack
      const matchesType = !selectedType || session.type === selectedType

      return matchesSearch && matchesTrack && matchesType
    })
  }, [sessions, search, selectedTrack, selectedType])

  const groupedSessions = useMemo(() => {
    const sorted = [...filteredSessions].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    return groupSessionsByDate(sorted)
  }, [filteredSessions])

  const clearFilters = () => {
    setSearch('')
    setSelectedTrack('')
    setSelectedType('')
  }

  const hasActiveFilters = search || selectedTrack || selectedType

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search sessions, speakers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {tracks.length > 0 && (
              <Select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                options={[
                  { value: '', label: 'All Tracks' },
                  ...tracks.map((t) => ({ value: t.id, label: t.name })),
                ]}
                className="w-[180px]"
              />
            )}

            {sessionTypes.length > 0 && (
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  ...sessionTypes,
                ]}
                className="w-[150px]"
              />
            )}

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('schedule')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'schedule'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Schedule
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
          {hasActiveFilters ? ' (filtered)' : ''}
        </p>
      </div>

      {/* Session List/Schedule */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">{emptyMessage}</p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
              Clear filters
            </Button>
          )}
        </div>
      ) : viewMode === 'schedule' ? (
        <ScheduleView
          groupedSessions={groupedSessions}
          tracks={tracks}
          agendaSessionIds={agendaSessionIds}
          onSessionClick={onSessionClick}
          onAddToAgenda={onAddToAgenda}
          onRemoveFromAgenda={onRemoveFromAgenda}
          showAgendaActions={showAgendaActions}
        />
      ) : (
        <ListView
          groupedSessions={groupedSessions}
          agendaSessionIds={agendaSessionIds}
          onSessionClick={onSessionClick}
          onAddToAgenda={onAddToAgenda}
          onRemoveFromAgenda={onRemoveFromAgenda}
          showAgendaActions={showAgendaActions}
        />
      )}
    </div>
  )
}

// List View Component
interface ListViewProps {
  groupedSessions: Map<string, SessionWithRelations[]>
  agendaSessionIds: Set<string>
  onSessionClick?: (session: SessionWithRelations) => void
  onAddToAgenda?: (sessionId: string) => void
  onRemoveFromAgenda?: (sessionId: string) => void
  showAgendaActions: boolean
}

function ListView({
  groupedSessions,
  agendaSessionIds,
  onSessionClick,
  onAddToAgenda,
  onRemoveFromAgenda,
  showAgendaActions,
}: ListViewProps) {
  return (
    <div className="space-y-8">
      {Array.from(groupedSessions.entries()).map(([dateKey, daySessions]) => (
        <div key={dateKey}>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 sticky top-0 bg-white py-2 z-10">
            {formatDate(dateKey)}
          </h2>
          <div className="space-y-3">
            {daySessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => onSessionClick?.(session)}
                isInAgenda={agendaSessionIds.has(session.id)}
                onAddToAgenda={() => onAddToAgenda?.(session.id)}
                onRemoveFromAgenda={() => onRemoveFromAgenda?.(session.id)}
                showActions={showAgendaActions}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Schedule/Grid View Component
interface ScheduleViewProps {
  groupedSessions: Map<string, SessionWithRelations[]>
  tracks: Track[]
  agendaSessionIds: Set<string>
  onSessionClick?: (session: SessionWithRelations) => void
  onAddToAgenda?: (sessionId: string) => void
  onRemoveFromAgenda?: (sessionId: string) => void
  showAgendaActions: boolean
}

function ScheduleView({
  groupedSessions,
  tracks,
  agendaSessionIds,
  onSessionClick,
  onAddToAgenda,
  onRemoveFromAgenda,
  showAgendaActions,
}: ScheduleViewProps) {
  // Get unique time slots for the schedule grid
  const getTimeSlots = (sessions: SessionWithRelations[]): string[] => {
    const times = new Set<string>()
    sessions.forEach((s) => {
      times.add(new Date(s.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
    })
    return Array.from(times).sort()
  }

  return (
    <div className="space-y-8">
      {Array.from(groupedSessions.entries()).map(([dateKey, daySessions]) => (
        <div key={dateKey}>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {formatDate(dateKey)}
          </h2>
          
          {/* Track Headers */}
          {tracks.length > 0 && (
            <div className="grid gap-4" style={{ gridTemplateColumns: `120px repeat(${tracks.length}, 1fr)` }}>
              <div className="text-sm font-medium text-slate-500">Time</div>
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="text-sm font-medium text-center py-2 rounded-t-lg"
                  style={{ backgroundColor: `${track.color}20`, color: track.color }}
                >
                  {track.name}
                </div>
              ))}
            </div>
          )}

          {/* Sessions Grid */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {getTimeSlots(daySessions).map((timeSlot, idx) => {
              const sessionsAtTime = daySessions.filter(
                (s) => new Date(s.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) === timeSlot
              )
              
              return (
                <div
                  key={timeSlot}
                  className={cn(
                    'grid gap-2 p-2',
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  )}
                  style={{ gridTemplateColumns: tracks.length > 0 ? `120px repeat(${tracks.length}, 1fr)` : '1fr' }}
                >
                  <div className="text-sm font-medium text-slate-600 py-2">{timeSlot}</div>
                  
                  {tracks.length > 0 ? (
                    tracks.map((track) => {
                      const trackSession = sessionsAtTime.find((s) => s.trackId === track.id)
                      return (
                        <div key={track.id}>
                          {trackSession && (
                            <SessionCard
                              session={trackSession}
                              onClick={() => onSessionClick?.(trackSession)}
                              isInAgenda={agendaSessionIds.has(trackSession.id)}
                              onAddToAgenda={() => onAddToAgenda?.(trackSession.id)}
                              onRemoveFromAgenda={() => onRemoveFromAgenda?.(trackSession.id)}
                              showActions={showAgendaActions}
                              variant="compact"
                            />
                          )}
                        </div>
                      )
                    })
                  ) : (
                    sessionsAtTime.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onClick={() => onSessionClick?.(session)}
                        isInAgenda={agendaSessionIds.has(session.id)}
                        onAddToAgenda={() => onAddToAgenda?.(session.id)}
                        onRemoveFromAgenda={() => onRemoveFromAgenda?.(session.id)}
                        showActions={showAgendaActions}
                        variant="compact"
                      />
                    ))
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
