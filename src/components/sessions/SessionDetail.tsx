'use client'

import { SessionWithRelations } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDateTime, formatDuration, getSessionTypeColor, cn } from '@/lib/utils'

interface SessionDetailProps {
  session: SessionWithRelations
  isInAgenda?: boolean
  onAddToAgenda?: () => void
  onRemoveFromAgenda?: () => void
  onEdit?: () => void
  onDelete?: () => void
  isOrganizer?: boolean
}

export function SessionDetail({
  session,
  isInAgenda = false,
  onAddToAgenda,
  onRemoveFromAgenda,
  onEdit,
  onDelete,
  isOrganizer = false,
}: SessionDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant="secondary" 
              className={cn(getSessionTypeColor(session.type), 'text-white')}
            >
              {session.type}
            </Badge>
            {session.track && (
              <Badge style={{ backgroundColor: session.track.color, color: 'white' }}>
                {session.track.name}
              </Badge>
            )}
            {!session.isPublished && (
              <Badge variant="warning">Draft</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{session.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Add/Remove from Agenda */}
          {(onAddToAgenda || onRemoveFromAgenda) && (
            <Button
              variant={isInAgenda ? 'primary' : 'outline'}
              onClick={isInAgenda ? onRemoveFromAgenda : onAddToAgenda}
              leftIcon={
                isInAgenda ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )
              }
            >
              {isInAgenda ? 'In My Schedule' : 'Add to Schedule'}
            </Button>
          )}

          {/* Organizer Actions */}
          {isOrganizer && (
            <>
              {onEdit && (
                <Button variant="secondary" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="danger" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Time & Location */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Date & Time</p>
                <p className="text-slate-900">{formatDateTime(session.startTime)}</p>
                <p className="text-sm text-slate-500">
                  Duration: {formatDuration(session.startTime, session.endTime)}
                </p>
              </div>
            </div>

            {/* Room */}
            {session.room && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Location</p>
                  <p className="text-slate-900">{session.room.name}</p>
                  {session.room.floor && (
                    <p className="text-sm text-slate-500">Floor: {session.room.floor}</p>
                  )}
                </div>
              </div>
            )}

            {/* Capacity */}
            {session.capacity && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Capacity</p>
                  <p className="text-slate-900">{session.capacity} attendees</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {session.description && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">About this session</h2>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 whitespace-pre-wrap">{session.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Speakers */}
      {session.speakers && session.speakers.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">
              {session.speakers.length === 1 ? 'Speaker' : 'Speakers'}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {session.speakers.map((ss) => (
                <div key={ss.id} className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-semibold text-slate-600 flex-shrink-0">
                    {ss.speaker.avatar ? (
                      <img
                        src={ss.speaker.avatar}
                        alt={ss.speaker.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      ss.speaker.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">{ss.speaker.name}</h3>
                      <Badge variant="default" size="sm">{ss.role}</Badge>
                    </div>
                    {(ss.speaker.jobTitle || ss.speaker.company) && (
                      <p className="text-sm text-slate-600">
                        {ss.speaker.jobTitle}
                        {ss.speaker.jobTitle && ss.speaker.company && ' at '}
                        {ss.speaker.company}
                      </p>
                    )}
                    {ss.speaker.bio && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-3">{ss.speaker.bio}</p>
                    )}
                    {/* Social Links */}
                    <div className="flex items-center gap-2 mt-2">
                      {ss.speaker.linkedin && (
                        <a
                          href={ss.speaker.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                      )}
                      {ss.speaker.twitter && (
                        <a
                          href={ss.speaker.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                        </a>
                      )}
                      {ss.speaker.website && (
                        <a
                          href={ss.speaker.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stream/Recording Links */}
      {(session.streamUrl || session.recordingUrl) && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Watch</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {session.streamUrl && (
                <Button
                  as="a"
                  href={session.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  Watch Live
                </Button>
              )}
              {session.recordingUrl && (
                <Button
                  as="a"
                  href={session.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                >
                  Watch Recording
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
