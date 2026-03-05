'use client'

import { useState, useEffect, useCallback } from 'react'

// Hook to detect if user is on mobile device
export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}

// Hook to detect touch device
export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}

// Hook for haptic feedback (vibration API)
export function useHaptic() {
  const trigger = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern)
      } catch (e) {
        // Vibration not supported or blocked
      }
    }
  }, [])

  const light = useCallback(() => trigger(10), [trigger])
  const medium = useCallback(() => trigger(20), [trigger])
  const heavy = useCallback(() => trigger([30, 10, 30]), [trigger])
  const success = useCallback(() => trigger([10, 50, 10]), [trigger])
  const error = useCallback(() => trigger([50, 50, 50]), [trigger])

  return { trigger, light, medium, heavy, success, error }
}

// Hook for safe area insets (for notched devices)
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })

  useEffect(() => {
    const style = getComputedStyle(document.documentElement)
    setInsets({
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0', 10),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0', 10),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0', 10),
    })
  }, [])

  return insets
}

// Hook for screen orientation
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const updateOrientation = () => {
      if (window.matchMedia('(orientation: portrait)').matches) {
        setOrientation('portrait')
      } else {
        setOrientation('landscape')
      }
    }

    updateOrientation()
    window.addEventListener('orientationchange', updateOrientation)
    window.addEventListener('resize', updateOrientation)

    return () => {
      window.removeEventListener('orientationchange', updateOrientation)
      window.removeEventListener('resize', updateOrientation)
    }
  }, [])

  return orientation
}

// Hook for network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<string>('unknown')

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const updateNetworkInfo = () => {
      setIsOnline(navigator.onLine)
      
      // @ts-ignore - connection is not in standard Navigator type
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown')
      }
    }

    updateNetworkInfo()

    window.addEventListener('online', updateNetworkInfo)
    window.addEventListener('offline', updateNetworkInfo)

    return () => {
      window.removeEventListener('online', updateNetworkInfo)
      window.removeEventListener('offline', updateNetworkInfo)
    }
  }, [])

  return { isOnline, connectionType, isSlow: connectionType === '2g' || connectionType === 'slow-2g' }
}

// Hook for reduced motion preference
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

// Hook for dark mode preference
export function usePrefersDarkMode() {
  const [prefersDark, setPrefersDark] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setPrefersDark(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersDark(e.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersDark
}

// Prevent body scroll (useful for modals/drawers)
export function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (!lock) return

    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [lock])
}

// Scroll to top helper
export function scrollToTop(smooth: boolean = true) {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  })
}
