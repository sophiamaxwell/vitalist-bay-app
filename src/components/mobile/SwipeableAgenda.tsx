'use client'

import { useState, useRef, useCallback, ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Day {
  date: Date
  label: string
  shortLabel: string
}

interface SwipeableAgendaProps {
  days: Day[]
  selectedDay: number
  onDayChange: (dayIndex: number) => void
  children: (dayIndex: number) => ReactNode
  className?: string
}

export function SwipeableAgenda({
  days,
  selectedDay,
  onDayChange,
  children,
  className = '',
}: SwipeableAgendaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const currentX = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  // Snap to selected day
  useEffect(() => {
    if (containerRef.current && !isDragging) {
      containerRef.current.scrollTo({
        left: selectedDay * containerRef.current.offsetWidth,
        behavior: 'smooth',
      })
    }
  }, [selectedDay, isDragging])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    currentX.current = e.touches[0].clientX
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    currentX.current = e.touches[0].clientX
    const delta = currentX.current - startX.current
    setDragOffset(delta)
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = 50 // Minimum swipe distance
    const delta = currentX.current - startX.current

    if (Math.abs(delta) > threshold) {
      if (delta > 0 && selectedDay > 0) {
        // Swipe right - go to previous day
        onDayChange(selectedDay - 1)
      } else if (delta < 0 && selectedDay < days.length - 1) {
        // Swipe left - go to next day
        onDayChange(selectedDay + 1)
      }
    }

    setDragOffset(0)
  }, [isDragging, selectedDay, days.length, onDayChange])

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Day Tabs - Scrollable on Mobile */}
      <div className="mobile-tabs bg-white border-b border-slate-200 mb-4 py-2">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => onDayChange(index)}
            className={cn(
              'mobile-tab',
              selectedDay === index
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-600'
            )}
          >
            <span className="hidden sm:inline">{day.label}</span>
            <span className="sm:hidden">{day.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Swipeable Content Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-200"
          style={{
            transform: `translateX(calc(-${selectedDay * 100}% + ${isDragging ? dragOffset : 0}px))`,
            width: `${days.length * 100}%`,
          }}
        >
          {days.map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{ width: `${100 / days.length}%` }}
            >
              {children(index)}
            </div>
          ))}
        </div>
      </div>

      {/* Day indicator dots */}
      <div className="flex justify-center gap-1.5 py-3 md:hidden">
        {days.map((_, index) => (
          <button
            key={index}
            onClick={() => onDayChange(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              selectedDay === index ? 'bg-emerald-500' : 'bg-slate-300'
            )}
            aria-label={`Go to day ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// Hook for generating days from start/end dates
export function useAgendaDays(startDate: Date, endDate: Date): Day[] {
  const days: Day[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    days.push({
      date: new Date(current),
      label: current.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      shortLabel: current.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
      }),
    })
    current.setDate(current.getDate() + 1)
  }

  return days
}
