'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Speaker } from '@/types'
import { SpeakerList } from '@/components/speakers/SpeakerList'

interface SpeakersPageProps {
  params: { eventId: string }
}

export default function SpeakersPage({ params }: SpeakersPageProps) {
  const { eventId } = params
  const router = useRouter()

  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch speakers
  useEffect(() => {
    async function fetchSpeakers() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/events/${eventId}/speakers`)
        const data = await response.json()
        setSpeakers(data)
      } catch (err) {
        setError('Failed to load speakers')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpeakers()
  }, [eventId])

  // Navigate to speaker detail
  const handleSpeakerClick = (speaker: Speaker) => {
    router.push(`/events/${eventId}/speakers/${speaker.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  // Featured speakers section
  const featuredSpeakers = speakers.filter(s => s.featured)
  const regularSpeakers = speakers.filter(s => !s.featured)

  return (
    <div>
      {/* Header - Mobile optimized */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Speakers</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
          Meet the speakers presenting at this event
        </p>
      </div>

      {/* Featured Speakers - Horizontal scroll on mobile */}
      {featuredSpeakers.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2 px-0">
            <span className="text-amber-500">⭐</span>
            Featured Speakers
          </h2>
          
          {/* Mobile horizontal scroll */}
          <div className="md:hidden -mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {featuredSpeakers.map((speaker) => (
                <div
                  key={speaker.id}
                  onClick={() => handleSpeakerClick(speaker)}
                  className="flex-shrink-0 w-[280px] bg-white rounded-xl shadow-sm active:shadow-none active:scale-[0.98] transition-all cursor-pointer p-4 border-l-4 border-amber-400 touch-interactive"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-lg font-semibold text-slate-600 overflow-hidden flex-shrink-0">
                      {speaker.avatar ? (
                        <img
                          src={speaker.avatar}
                          alt={speaker.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        speaker.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-slate-900 truncate">{speaker.name}</h3>
                      {speaker.jobTitle && (
                        <p className="text-sm text-slate-600 truncate">{speaker.jobTitle}</p>
                      )}
                      {speaker.company && (
                        <p className="text-sm text-slate-500 truncate">{speaker.company}</p>
                      )}
                    </div>
                  </div>
                  {speaker.bio && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{speaker.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredSpeakers.map((speaker) => (
              <div
                key={speaker.id}
                onClick={() => handleSpeakerClick(speaker)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5 border-l-4 border-amber-400"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-semibold text-slate-600 overflow-hidden flex-shrink-0">
                    {speaker.avatar ? (
                      <img
                        src={speaker.avatar}
                        alt={speaker.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      speaker.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-slate-900">{speaker.name}</h3>
                    {speaker.jobTitle && (
                      <p className="text-sm text-slate-600">{speaker.jobTitle}</p>
                    )}
                    {speaker.company && (
                      <p className="text-sm text-slate-500">{speaker.company}</p>
                    )}
                    {speaker.bio && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{speaker.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Speakers */}
      <div>
        {featuredSpeakers.length > 0 && regularSpeakers.length > 0 && (
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">All Speakers</h2>
        )}
        <SpeakerList
          speakers={speakers}
          onSpeakerClick={handleSpeakerClick}
          showFilters={speakers.length > 6}
          showSearch={speakers.length > 6}
          emptyMessage="No speakers have been added to this event yet."
        />
      </div>
    </div>
  )
}
