'use client'

import { useState, useEffect } from 'react'
import { QRCodeDisplay } from '@/components/qrcode'
import { Card, CardContent } from '@/components/ui/Card'

interface TicketQRCodeProps {
  registration: {
    id: string
    qrCode: string
    checkedIn: boolean
    checkedInAt: string | null
  }
  event: {
    name: string
    startDate: string
    venue?: string | null
  }
  user: {
    name: string | null
    email: string
  }
  ticketType?: string | null
  className?: string
}

export function TicketQRCode({ 
  registration, 
  event, 
  user, 
  ticketType,
  className = '' 
}: TicketQRCodeProps) {
  const [brightness, setBrightness] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Keep screen awake while viewing ticket (for scanning)
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
        }
      } catch (err) {
        console.log('Wake lock not supported')
      }
    }

    requestWakeLock()

    return () => {
      if (wakeLock) {
        wakeLock.release()
      }
    }
  }, [])

  // Increase brightness hint for scanning
  const handleBrightnessBoost = () => {
    setBrightness(brightness === 1 ? 1.2 : 1)
  }

  // Toggle fullscreen for QR
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Fullscreen QR view for easy scanning
  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6"
        onClick={toggleFullscreen}
        style={{ filter: `brightness(${brightness})` }}
      >
        <div className="mb-6 text-center">
          <h2 className="text-lg font-semibold text-slate-900">{user.name || 'Attendee'}</h2>
          <p className="text-sm text-slate-500">{event.name}</p>
        </div>
        
        <div className="p-4 bg-white rounded-2xl shadow-2xl">
          <QRCodeDisplay value={registration.qrCode} size={280} />
        </div>

        {ticketType && (
          <div className="mt-6 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
            {ticketType}
          </div>
        )}

        <p className="mt-8 text-sm text-slate-400">Tap anywhere to close</p>
      </div>
    )
  }

  return (
    <Card className={`qr-ticket-display bg-gradient-to-br from-emerald-50 to-white overflow-hidden ${className}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="text-center">
          {/* Event Name */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">{event.name}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            {new Date(event.startDate).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
            {event.venue && ` • ${event.venue}`}
          </p>

          {/* QR Code - Larger on mobile for easy scanning */}
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleFullscreen}
              className="qr-code-wrapper p-4 sm:p-5 bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow active:scale-[0.98] touch-interactive"
              style={{ filter: `brightness(${brightness})` }}
              aria-label="Tap to enlarge QR code"
            >
              <QRCodeDisplay value={registration.qrCode} size={200} />
            </button>
          </div>

          {/* Tap hint */}
          <p className="text-xs text-slate-400 mb-4 md:hidden">
            Tap QR code to enlarge for scanning
          </p>

          {/* Brightness control for mobile */}
          <button
            onClick={handleBrightnessBoost}
            className="md:hidden inline-flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-full mb-4 touch-interactive"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {brightness === 1 ? 'Boost Brightness' : 'Normal Brightness'}
          </button>

          {/* Attendee Info */}
          <div className="mb-4">
            <div className="font-semibold text-slate-900 text-base sm:text-lg">{user.name || 'Attendee'}</div>
            <div className="text-sm text-slate-500 truncate">{user.email}</div>
          </div>

          {/* Ticket Type Badge */}
          {ticketType && (
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 mb-4">
              🎫 {ticketType}
            </div>
          )}

          {/* Check-in Status */}
          {registration.checkedIn ? (
            <div className="mt-4 p-4 bg-emerald-100 rounded-xl">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-700 font-semibold">Checked In</span>
              </div>
              {registration.checkedInAt && (
                <div className="text-sm text-emerald-600 mt-1">
                  {new Date(registration.checkedInAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 p-4 bg-slate-100 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span className="font-medium">Show at check-in</span>
              </div>
            </div>
          )}

          {/* Registration ID - smaller on mobile */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-400 font-mono">
              ID: {registration.qrCode.slice(0, 8)}...{registration.qrCode.slice(-4)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
