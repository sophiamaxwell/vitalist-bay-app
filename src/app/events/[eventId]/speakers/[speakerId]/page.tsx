'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SpeakerWithSessions } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatTime, formatDate } from '@/lib/utils'

interface SpeakerDetailPageProps {
  params: { eventId: string; speakerId: string }
}

export default function SpeakerDetailPage({ params }: SpeakerDetailPageProps) {
  const { eventId, speakerId } = params
  const router = useRouter()

  const [speaker, setSpeaker] = useState<SpeakerWithSessions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch speaker with sessions
  useEffect(() => {
    async function fetchSpeaker() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/events/${eventId}/speakers/${speakerId}`)
        if (!response.ok) {
          throw new Error('Speaker not found')
        }
        const data = await response.json()
        setSpeaker(data)
      } catch (err) {
        setError('Failed to load speaker')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpeaker()
  }, [eventId, speakerId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !speaker) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Speaker not found</h2>
        <p className="text-slate-500 mb-4">This speaker may have been removed or does not exist.</p>
        <Button onClick={() => router.push(`/events/${eventId}/speakers`)}>
          Back to Speakers
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href={`/events/${eventId}/speakers`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Speakers
      </Link>

      {/* Speaker Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-slate-200 flex items-center justify-center text-4xl md:text-5xl font-semibold text-slate-600 overflow-hidden flex-shrink-0 mx-auto md:mx-0">
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
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{speaker.name}</h1>
                {speaker.featured && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    ⭐ Featured Speaker
                  </Badge>
                )}
              </div>
              
              {speaker.jobTitle && (
                <p className="text-lg text-slate-600">{speaker.jobTitle}</p>
              )}
              
              {speaker.company && (
                <p className="text-slate-500">{speaker.company}</p>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                {speaker.linkedin && (
                  <a
                    href={speaker.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
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
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
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
                    className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {speaker.bio && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">About</h2>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{speaker.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions */}
      {speaker.sessions && speaker.sessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Sessions ({speaker.sessions.length})
          </h2>
          <div className="space-y-3">
            {speaker.sessions.map((ss) => (
              <Card 
                key={ss.id} 
                variant="interactive"
                onClick={() => router.push(`/events/${eventId}/sessions/${ss.session.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-fit">
                      {formatDate(ss.session.startTime, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-sm text-slate-500">
                      {formatTime(ss.session.startTime)} - {formatTime(ss.session.endTime)}
                    </span>
                    <Badge variant="secondary" className="text-xs w-fit">
                      {ss.role}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">{ss.session.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    {ss.session.room && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {ss.session.room.name}
                      </span>
                    )}
                    {ss.session.track && (
                      <Badge 
                        variant="default"
                        className="text-white text-xs"
                        style={{ backgroundColor: ss.session.track.color }}
                      >
                        {ss.session.track.name}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No sessions */}
      {(!speaker.sessions || speaker.sessions.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No sessions scheduled for this speaker yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Request Meeting Button (if networking is enabled) */}
      <div className="mt-6 text-center">
        <Button 
          variant="secondary"
          onClick={() => alert('Meeting requests coming soon!')}
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Request a Meeting
        </Button>
      </div>
    </div>
  )
}
