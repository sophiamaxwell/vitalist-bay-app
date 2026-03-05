'use client'

import { useState, useMemo } from 'react'
import { Speaker } from '@/types'
import { SpeakerCard } from './SpeakerCard'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface SpeakerListProps {
  speakers: Speaker[]
  onSpeakerClick?: (speaker: Speaker) => void
  showFilters?: boolean
  showSearch?: boolean
  emptyMessage?: string
  variant?: 'grid' | 'list'
}

export function SpeakerList({
  speakers,
  onSpeakerClick,
  showFilters = true,
  showSearch = true,
  emptyMessage = 'No speakers found',
  variant = 'grid',
}: SpeakerListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'regular'>('all')

  // Filter and search speakers
  const filteredSpeakers = useMemo(() => {
    let result = [...speakers]

    // Filter by featured status
    if (filterFeatured === 'featured') {
      result = result.filter((s) => s.featured)
    } else if (filterFeatured === 'regular') {
      result = result.filter((s) => !s.featured)
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.company?.toLowerCase().includes(query) ||
          s.jobTitle?.toLowerCase().includes(query) ||
          s.bio?.toLowerCase().includes(query)
      )
    }

    // Sort: featured first, then by name
    result.sort((a, b) => {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1
      }
      return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
    })

    return result
  }, [speakers, searchQuery, filterFeatured])

  // Featured vs regular counts
  const featuredCount = speakers.filter((s) => s.featured).length
  const regularCount = speakers.length - featuredCount

  if (speakers.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {showSearch && (
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search speakers by name, company, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
          )}

          {showFilters && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterFeatured('all')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  filterFeatured === 'all'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                All ({speakers.length})
              </button>
              <button
                onClick={() => setFilterFeatured('featured')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  filterFeatured === 'featured'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                Featured ({featuredCount})
              </button>
              <button
                onClick={() => setFilterFeatured('regular')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  filterFeatured === 'regular'
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                Regular ({regularCount})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {filteredSpeakers.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>No speakers match your search</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setFilterFeatured('all')
            }}
            className="mt-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className={cn(
          variant === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        )}>
          {filteredSpeakers.map((speaker) => (
            <SpeakerCard
              key={speaker.id}
              speaker={speaker}
              onClick={() => onSpeakerClick?.(speaker)}
              variant={variant === 'grid' ? 'full' : 'compact'}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {(searchQuery || filterFeatured !== 'all') && filteredSpeakers.length > 0 && (
        <p className="text-sm text-slate-500 text-center">
          Showing {filteredSpeakers.length} of {speakers.length} speakers
        </p>
      )}
    </div>
  )
}
