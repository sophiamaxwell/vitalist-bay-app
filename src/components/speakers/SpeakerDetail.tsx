'use client'

import { SpeakerWithSessions } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatTime, formatDate } from '@/lib/utils'

interface SpeakerDetailProps {
  speaker: SpeakerWithSessions
  isOrganizer?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onSessionClick?: (sessionId: string) => void
}

export function SpeakerDetail({
  speaker,
  isOrganizer = false,
  onEdit,
  onDelete,
  onSessionClick,
}: SpeakerDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-semibold text-slate-600 overflow-hidden flex-shrink-0">
          {speaker.avatar ? (
            <img
              src={speaker.avatar}
              alt={speaker.name}
              className="w-full h-full object-cover"
            />
          ) : (
            speaker.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{speaker.name}</h2>
            {speaker.featured && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                Featured
              </Badge>
            )}
          </div>
          
          {speaker.jobTitle && (
            <p className="text-lg text-slate-600 mt-1">{speaker.jobTitle}</p>
          )}
          
          {speaker.company && (
            <p className="text-slate-500">{speaker.company}</p>
          )}

          {/* Social Links */}
          <div className="flex items-center gap-3 mt-4">
            {speaker.linkedin && (
              <a
                href={speaker.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            )}
            {speaker.twitter && (
              <a
                href={speaker.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X
              </a>
            )}
            {speaker.website && (
              <a
                href={speaker.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Website
              </a>
            )}
            {speaker.email && (
              <a
                href={`mailto:${speaker.email}`}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {speaker.bio && (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">About</h3>
          <p className="text-slate-700 whitespace-pre-wrap">{speaker.bio}</p>
        </div>
      )}

      {/* Sessions */}
      {speaker.sessions && speaker.sessions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Sessions ({speaker.sessions.length})
          </h3>
          <div className="space-y-3">
            {speaker.sessions.map((ss) => (
              <Card 
                key={ss.id} 
                variant={onSessionClick ? 'interactive' : 'bordered'}
                onClick={() => onSessionClick?.(ss.session.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-500">
                      {formatDate(ss.session.startTime, { month: 'short', day: 'numeric' })} • {formatTime(ss.session.startTime)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {ss.role}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-slate-900">{ss.session.title}</h4>
                  {ss.session.room && (
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {ss.session.room.name}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Organizer Actions */}
      {isOrganizer && (
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
          <Button onClick={onEdit}>
            Edit Speaker
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </div>
      )}
    </div>
  )
}
