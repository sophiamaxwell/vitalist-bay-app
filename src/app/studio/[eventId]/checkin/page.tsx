'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface CheckInStats {
  totalRegistrations: number
  checkedInCount: number
  notCheckedInCount: number
  checkInRate: number
  recentCheckIns: Array<{
    id: string
    user: {
      id: string
      name: string | null
      email: string
      avatar: string | null
      company: string | null
    }
    checkedInAt: string
  }>
}

interface CheckInResult {
  success?: boolean
  alreadyCheckedIn?: boolean
  message?: string
  error?: string
  registration?: {
    id: string
    user: {
      id: string
      name: string | null
      email: string
      avatar: string | null
      company: string | null
      jobTitle: string | null
    }
    ticketType: string | null
    checkedInAt: string
  }
}

interface ScannerPageProps {
  params: { eventId: string }
}

export default function CheckInScannerPage({ params }: ScannerPageProps) {
  const { eventId } = params
  const [stats, setStats] = useState<CheckInStats | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null)
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('manual')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraError, setCameraError] = useState<string>('')

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/checkin`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    // Poll for stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [eventId])

  // Process check-in
  const processCheckIn = async (qrCode: string) => {
    if (isProcessing || !qrCode.trim()) return

    setIsProcessing(true)
    setLastResult(null)

    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: qrCode.trim() })
      })

      const data = await res.json()
      setLastResult(data)

      if (data.success) {
        // Refresh stats
        fetchStats()
        setManualCode('')
      }
    } catch (error) {
      setLastResult({ error: 'Network error. Please try again.' })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle manual entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    processCheckIn(manualCode)
  }

  // Start camera for QR scanning
  const startCamera = async () => {
    try {
      setCameraError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      setCameraError('Could not access camera. Please use manual entry.')
      setScanMode('manual')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    if (scanMode === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [scanMode])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Mobile-optimized Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Check-in Scanner</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Scan QR codes to check in attendees</p>
        </div>
      </div>

      {/* Stats Cards - Compact on mobile */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-6">
          <Card className="card-pressable">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats.checkedInCount}</div>
              <div className="text-xs sm:text-sm text-slate-500">Checked In</div>
            </CardContent>
          </Card>
          <Card className="card-pressable">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-600">{stats.notCheckedInCount}</div>
              <div className="text-xs sm:text-sm text-slate-500">Pending</div>
            </CardContent>
          </Card>
          <Card className="card-pressable">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalRegistrations}</div>
              <div className="text-xs sm:text-sm text-slate-500">Total</div>
            </CardContent>
          </Card>
          <Card className="card-pressable">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.checkInRate}%</div>
              <div className="text-xs sm:text-sm text-slate-500">Rate</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Scanner Section - Full width priority on mobile */}
        <Card className="order-1 md:order-none">
          <CardContent className="p-4 sm:p-6">
            {/* Mode Toggle - Touch optimized */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setScanMode('manual')}
                className={`flex-1 py-3 sm:py-2 px-4 rounded-xl sm:rounded-lg text-sm font-medium transition-colors touch-interactive ${
                  scanMode === 'manual'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="text-base sm:text-sm">📝</span>
                <span className="ml-2">Manual</span>
              </button>
              <button
                onClick={() => setScanMode('camera')}
                className={`flex-1 py-3 sm:py-2 px-4 rounded-xl sm:rounded-lg text-sm font-medium transition-colors touch-interactive ${
                  scanMode === 'camera'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="text-base sm:text-sm">📷</span>
                <span className="ml-2">Scan</span>
              </button>
            </div>

            {scanMode === 'manual' ? (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Registration Code
                  </label>
                  <Input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Scan or type code..."
                    className="text-base sm:text-lg h-12 sm:h-10"
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="none"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Use a Bluetooth scanner or type manually
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 sm:h-10 text-base touch-interactive"
                  disabled={isProcessing || !manualCode.trim()}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Check In
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {cameraError ? (
                  <div className="text-center py-8 text-red-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="font-medium">{cameraError}</p>
                    <button
                      onClick={() => setScanMode('manual')}
                      className="mt-3 text-emerald-600 font-medium"
                    >
                      Use Manual Entry Instead
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative aspect-square bg-black rounded-2xl overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      {/* Enhanced scan overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-56 h-56 sm:w-48 sm:h-48">
                          {/* Corner markers */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                          {/* Scan line animation */}
                          <div className="absolute inset-x-2 h-0.5 bg-emerald-400 animate-pulse" style={{ top: '50%' }}></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-sm text-slate-500">
                      Align QR code within the frame
                    </p>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-xs text-amber-700">
                        <strong>Tip:</strong> For faster scanning, use a Bluetooth barcode scanner paired to your device in Manual mode.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Section */}
        <div className="space-y-4">
          {/* Last Check-in Result */}
          {lastResult && (
            <Card className={`border-2 ${
              lastResult.error 
                ? 'border-red-300 bg-red-50' 
                : lastResult.alreadyCheckedIn
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-emerald-300 bg-emerald-50'
            }`}>
              <CardContent className="p-6">
                {lastResult.error ? (
                  <div className="text-center">
                    <div className="text-5xl mb-3">❌</div>
                    <h3 className="text-lg font-semibold text-red-700">Check-in Failed</h3>
                    <p className="text-red-600 mt-1">{lastResult.error}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-5xl mb-3">
                      {lastResult.alreadyCheckedIn ? '⚠️' : '✅'}
                    </div>
                    <h3 className={`text-lg font-semibold ${
                      lastResult.alreadyCheckedIn ? 'text-yellow-700' : 'text-emerald-700'
                    }`}>
                      {lastResult.message}
                    </h3>
                    {lastResult.registration && (
                      <div className="mt-4 text-left bg-white rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          {lastResult.registration.user.avatar ? (
                            <img
                              src={lastResult.registration.user.avatar}
                              alt=""
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                              <span className="text-emerald-600 font-semibold text-lg">
                                {lastResult.registration.user.name?.[0] || '?'}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900">
                              {lastResult.registration.user.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-slate-500">
                              {lastResult.registration.user.email}
                            </div>
                            {lastResult.registration.user.company && (
                              <div className="text-sm text-slate-500">
                                {lastResult.registration.user.jobTitle} @ {lastResult.registration.user.company}
                              </div>
                            )}
                          </div>
                        </div>
                        {lastResult.registration.ticketType && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <span className="text-xs text-slate-500">Ticket: </span>
                            <span className="text-sm font-medium text-slate-700">
                              {lastResult.registration.ticketType}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Check-ins */}
          {stats && stats.recentCheckIns.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Recent Check-ins</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.recentCheckIns.map((checkin) => (
                    <div
                      key={checkin.id}
                      className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg"
                    >
                      {checkin.user.avatar ? (
                        <img
                          src={checkin.user.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-600 font-semibold text-sm">
                            {checkin.user.name?.[0] || '?'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {checkin.user.name || checkin.user.email}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(checkin.checkedInAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <span className="text-emerald-500">✓</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
