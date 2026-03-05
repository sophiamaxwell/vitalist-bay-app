'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'

interface CheckInStats {
  totalRegistrations: number
  checkedInCount: number
  notCheckedInCount: number
  checkInRate: number
}

interface StudioOverviewProps {
  params: { eventId: string }
}

export default function StudioOverview({ params }: StudioOverviewProps) {
  const { eventId } = params
  const [checkInStats, setCheckInStats] = useState<CheckInStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/checkin`)
        if (res.ok) {
          const data = await res.json()
          setCheckInStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch check-in stats:', error)
      }
    }
    fetchStats()
  }, [eventId])

  const setupSteps = [
    { label: 'Add an event cover', completed: false },
    { label: 'Brand the event with your colors', completed: false },
    { label: 'Personalize your pages and menu', completed: false },
    { label: 'Enable your communication emails', completed: false },
    { label: 'Create a session', completed: false, href: `/studio/${eventId}/sessions` },
    { label: 'Fill support email address', completed: false },
    { label: 'Publish the event', completed: false },
  ]

  const quickActions = [
    { label: 'Sessions', icon: '📋', href: `/studio/${eventId}/sessions`, color: 'bg-purple-500' },
    { label: 'Speakers', icon: '🎤', href: `/studio/${eventId}/speakers`, color: 'bg-orange-500' },
    { label: 'Check-in', icon: '📱', href: `/studio/${eventId}/checkin`, color: 'bg-emerald-500' },
    { label: 'Attendees', icon: '🎫', href: `/studio/${eventId}/attendees`, color: 'bg-blue-500' },
  ]

  const completedSteps = setupSteps.filter(s => s.completed).length
  const progress = (completedSteps / setupSteps.length) * 100

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Welcome back! 👋</h1>

      {/* Setup Progress */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Event Setup</h2>
            <span className="text-sm text-slate-500">
              {completedSteps} of {setupSteps.length} completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full mb-4">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {setupSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-3 py-2"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  {step.completed && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </div>
                {step.href ? (
                  <Link
                    href={step.href}
                    className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    {step.label}
                  </Link>
                ) : (
                  <span className={`text-sm ${step.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {step.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Check-in Stats */}
      {checkInStats && checkInStats.totalRegistrations > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Check-in Overview</h2>
              <Link
                href={`/studio/${eventId}/checkin`}
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                Open Scanner →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-3xl font-bold text-emerald-600">{checkInStats.checkedInCount}</div>
                <div className="text-sm text-emerald-700">Checked In</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl font-bold text-slate-600">{checkInStats.notCheckedInCount}</div>
                <div className="text-sm text-slate-700">Not Arrived</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{checkInStats.checkInRate}%</div>
                <div className="text-sm text-blue-700">Check-in Rate</div>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full h-3 bg-slate-100 rounded-full">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${checkInStats.checkInRate}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1 text-center">
                {checkInStats.checkedInCount} of {checkInStats.totalRegistrations} attendees checked in
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`${action.color} text-white rounded-xl p-4 hover:opacity-90 transition-opacity`}
          >
            <span className="text-3xl mb-2 block">{action.icon}</span>
            <span className="font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Mobile App Promo */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="text-3xl">📱</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Experience on mobile</h3>
              <p className="text-sm text-slate-500">
                Preview your event on the mobile app
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-emerald-600 border border-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors">
              Preview
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
