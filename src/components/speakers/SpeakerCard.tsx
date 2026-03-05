'use client'

import { Speaker } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface SpeakerCardProps {
  speaker: Speaker
  onClick?: () => void
  variant?: 'compact' | 'full'
  showSocial?: boolean
}

export function SpeakerCard({
  speaker,
  onClick,
  variant = 'full',
  showSocial = true,
}: SpeakerCardProps) {
  return (
    <Card
      variant={onClick ? 'interactive' : 'default'}
      className={cn(
        'relative group overflow-hidden',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <CardContent className={variant === 'compact' ? 'p-4' : 'p-5'}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={cn(
            'flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold overflow-hidden',
            variant === 'compact' ? 'w-12 h-12 text-lg' : 'w-16 h-16 text-xl'
          )}>
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

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'font-semibold text-slate-900 truncate',
                variant === 'compact' ? 'text-base' : 'text-lg'
              )}>
                {speaker.name}
              </h3>
              {speaker.featured && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 flex-shrink-0">
                  Featured
                </Badge>
              )}
            </div>

            {speaker.jobTitle && (
              <p className="text-sm text-slate-600 mt-0.5 truncate">
                {speaker.jobTitle}
              </p>
            )}

            {speaker.company && (
              <p className="text-sm text-slate-500 truncate">
                {speaker.company}
              </p>
            )}

            {/* Bio preview (only in full variant) */}
            {variant === 'full' && speaker.bio && (
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                {speaker.bio}
              </p>
            )}

            {/* Social links */}
            {showSocial && variant === 'full' && (
              <div className="flex items-center gap-2 mt-3">
                {speaker.linkedin && (
                  <a
                    href={speaker.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {speaker.twitter && (
                  <a
                    href={speaker.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
                {speaker.website && (
                  <a
                    href={speaker.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
