'use client'

import { SessionWithRelations } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatTime, formatDuration, getSessionTypeColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface SessionCardProps {
  session: SessionWithRelations
  onClick?: () => void
  onAddToAgenda?: () => void
  onRemoveFromAgenda?: () => void
  isInAgenda?: boolean
  showActions?: boolean
  variant?: 'compact' | 'full'
}

export function SessionCard({
  session,
  onClick,
  onAddToAgenda,
  onRemoveFromAgenda,
  isInAgenda = false,
  showActions = true,
  variant = 'full',
}: SessionCardProps) {
  const handleAgendaClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isInAgenda && onRemoveFromAgenda) {
      onRemoveFromAgenda()
    } else if (onAddToAgenda) {
      onAddToAgenda()
    }
  }

  return (
    <Card
      className={cn(
        'relative group',
        session.track && `border-l-4`,
        onClick && 'hover:shadow-md transition-shadow cursor-pointer'
      )}
      style={{
        borderLeftColor: session.track?.color || '#e2e8f0',
      }}
      onClick={onClick}
    >
      <CardContent className={variant === 'compact' ? 'p-3' : 'p-4'}>
        {/* Time and Type Row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-slate-600">
            {formatTime(session.startTime)} - {formatTime(session.endTime)}
          </span>
          <span className="text-xs text-slate-400">
            ({formatDuration(session.startTime, session.endTime)})
          </span>
          <Badge variant="secondary" className={cn('ml-auto', getSessionTypeColor(session.type), 'text-white')}>
            {session.type}
          </Badge>
        </div>

        {/* Title */}
        <h3 className={cn(
          'font-semibold text-slate-900',
          variant === 'compact' ? 'text-base' : 'text-lg'
        )}>
          {session.title}
        </h3>

        {/* Description (only in full variant) */}
        {variant === 'full' && session.description && (
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
            {session.description}
          </p>
        )}

        {/* Speakers */}
        {session.speakers && session.speakers.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex -space-x-2">
              {session.speakers.slice(0, 3).map((ss) => (
                <div
                  key={ss.id}
                  className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600"
                  title={ss.speaker.name}
                >
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
              ))}
            </div>
            <span className="text-sm text-slate-600">
              {session.speakers.map((ss) => ss.speaker.name).join(', ')}
            </span>
          </div>
        )}

        {/* Room & Track */}
        <div className="flex items-center gap-3 mt-3 text-sm">
          {session.room && (
            <span className="flex items-center gap-1 text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {session.room.name}
            </span>
          )}
          {session.track && (
            <Badge 
              variant="default" 
              className="text-white"
              style={{ backgroundColor: session.track.color }}
            >
              {session.track.name}
            </Badge>
          )}
          {session.capacity && (
            <span className="flex items-center gap-1 text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {session.capacity}
            </span>
          )}
        </div>

        {/* Add to Agenda Button */}
        {showActions && (onAddToAgenda || onRemoveFromAgenda) && (
          <button
            onClick={handleAgendaClick}
            className={cn(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
              isInAgenda
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600'
            )}
            title={isInAgenda ? 'Remove from schedule' : 'Add to schedule'}
          >
            {isInAgenda ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  )
}
