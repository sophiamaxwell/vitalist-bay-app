'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MobileHeader, MobileBottomNav } from '@/components/mobile'

interface EventLayoutProps {
  children: ReactNode
  params: { eventId: string }
}

const navItems = [
  { href: '', label: 'Home' },
  { href: '/attendees', label: 'Attendees' },
  { href: '/speakers', label: 'Speakers' },
  { href: '/exhibitors', label: 'Exhibitors' },
  { href: '/agenda', label: 'Agenda' },
  { href: '/my-schedule', label: 'My Schedule' },
  { href: '/register', label: 'Register', highlight: true },
]

export default function EventLayout({ children, params }: EventLayoutProps) {
  const pathname = usePathname()
  const baseUrl = `/events/${params.eventId}`

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header - Only shown on mobile */}
      <MobileHeader eventId={params.eventId} eventName="Vitalist Bay 2026" />

      {/* Desktop Top Navigation - Hidden on mobile */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 hidden md:block">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-emerald-500">
                Vitalist
              </Link>
              <span className="text-slate-300">›</span>
              <span className="text-sm text-slate-600">Vitalist Bay 2026</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors touch-target">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors touch-target">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative touch-target">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/profile" className="touch-target">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-medium">
                  SM
                </div>
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 px-4 h-12 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const href = `${baseUrl}${item.href}`
              const isActive = pathname === href || (item.href && pathname.startsWith(href))

              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors touch-target',
                    isActive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'highlight' in item && item.highlight
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content - Adjusted padding for mobile bottom nav */}
      <main className="max-w-7xl mx-auto py-6 px-4 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav eventId={params.eventId} />
    </div>
  )
}
