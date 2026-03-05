'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface EventHomePageProps {
  params: { eventId: string }
}

export default function EventHomePage({ params }: EventHomePageProps) {
  const { eventId } = params

  const quickLinks = [
    {
      label: 'Attendees',
      icon: '👥',
      href: `/events/${eventId}/attendees`,
      color: 'bg-slate-400',
      description: 'Browse attendees',
    },
    {
      label: 'Speakers',
      icon: '🎤',
      href: `/events/${eventId}/speakers`,
      color: 'bg-orange-500',
      description: 'View speakers',
    },
    {
      label: 'Exhibitors',
      icon: '🏢',
      href: `/events/${eventId}/exhibitors`,
      color: 'bg-emerald-500',
      description: 'Browse exhibitors',
    },
    {
      label: 'Agenda',
      icon: '📋',
      href: `/events/${eventId}/agenda`,
      color: 'bg-purple-500',
      description: 'View sessions',
    },
    {
      label: 'My Schedule',
      icon: '📅',
      href: `/events/${eventId}/my-schedule`,
      color: 'bg-purple-600',
      description: 'Your personal schedule',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Banner */}
      <div className="relative h-64 rounded-xl overflow-hidden mb-8 bg-gradient-to-br from-emerald-400 to-teal-500">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">Vitalist Bay 2026</h1>
            <p className="text-lg opacity-90">The Future of Longevity</p>
          </div>
        </div>
        {/* Decorative shapes */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full" />
        <div className="absolute bottom-8 left-8 w-16 h-16 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-white/10 rounded-full" />
      </div>

      {/* Register CTA */}
      <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Ready to join?</h2>
            <p className="opacity-90">Secure your spot at Vitalist Bay 2026</p>
          </div>
          <Link href={`/events/${eventId}/register`}>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-emerald-600 hover:bg-emerald-50 border-0"
            >
              Register Now →
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`${link.color} text-white rounded-xl p-4 hover:opacity-90 transition-opacity text-center`}
          >
            <span className="text-3xl mb-2 block">{link.icon}</span>
            <span className="font-medium text-sm">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Event Info */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Vitalist Bay 2026</h2>
          <div className="space-y-3 text-slate-600">
            <div className="flex items-center gap-3">
              <span className="text-xl">📅</span>
              <span>April 3, 2026 - April 5, 2026</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🕐</span>
              <span>9:00 AM - 6:00 PM (PDT)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">📍</span>
              <span>San Francisco, CA</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-slate-600">
              Join us for the premier longevity science conference, bringing together
              researchers, entrepreneurs, and enthusiasts to explore the future of
              human healthspan and lifespan extension.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Card (Side) */}
      <div className="mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl font-semibold">
                SM
              </div>
              <div>
                <p className="font-semibold text-slate-900">Sophia Maxwell</p>
                <Link
                  href={`/events/${eventId}/profile`}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
