'use client'

import { useState, useRef, useCallback, ReactNode } from 'react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  threshold?: number
  className?: string
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  className = '' 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return
    
    const currentY = e.touches[0].clientY
    const distance = Math.max(0, currentY - startY.current)
    
    // Apply resistance - the further you pull, the harder it gets
    const resistance = 0.5
    const dampedDistance = Math.min(distance * resistance, threshold * 1.5)
    
    setPullDistance(dampedDistance)
  }, [isPulling, isRefreshing, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(threshold / 2) // Keep indicator visible
      
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
    
    setIsPulling(false)
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh])

  const progress = Math.min(pullDistance / threshold, 1)
  const rotation = progress * 360

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-transform duration-200 z-10"
        style={{
          top: -40,
          transform: `translateX(-50%) translateY(${pullDistance}px)`,
        }}
      >
        <div
          className={`w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
          }}
        >
          {isRefreshing ? (
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className={`w-5 h-5 transition-colors ${
                progress >= 1 ? 'text-emerald-500' : 'text-slate-400'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Content with pull translation */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease',
        }}
      >
        {children}
      </div>
    </div>
  )
}
