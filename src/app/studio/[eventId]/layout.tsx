'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface StudioLayoutProps {
  children: ReactNode
  params: { eventId: string }
}

const navItems = [
  { href: '', label: 'Overview', icon: '🏠' },
  { href: '/sessions', label: 'Sessions', icon: '📋' },
  { href: '/speakers', label: 'Speakers', icon: '🎤' },
  { href: '/people', label: 'People', icon: '👥' },
  { href: '/exhibitors', label: 'Exhibitors', icon: '🏢' },
  { href: '/attendees', label: 'Attendees', icon: '🎫' },
  { href: '/checkin', label: 'Check-in', icon: '📱' },
]

export default function StudioLayout({ children, params }: StudioLayoutProps) {
  const pathname = usePathname()
  const baseUrl = `/studio/${params.eventId}`

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <Link href="/studio" className="text-xl font-bold text-slate-900">
              <span className="text-emerald-500">Vitalist</span> Studio
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-500">Free Trial</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/events/${params.eventId}`}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Preview event
            </Link>
            <button className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors">
              Publish event
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-56px)] sticky top-14">
          <div className="p-4 border-b border-slate-200">
            <Link href="/studio" className="text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-1">
              ← Back to events
            </Link>
            <h2 className="font-semibold text-slate-900 mt-3">Vitalist Bay 2026</h2>
            <p className="text-sm text-slate-500">April 3rd 2026, 9:00 am</p>
            <Link
              href={`/events/${params.eventId}`}
              className="text-sm text-emerald-600 hover:text-emerald-700 mt-1 inline-block"
            >
              Open event
            </Link>
          </div>

          {/* Search */}
          <div className="p-4">
            <input
              type="text"
              placeholder="Search within the event..."
              className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Navigation */}
          <nav className="px-2">
            {navItems.map((item) => {
              const href = `${baseUrl}${item.href}`
              const isActive = pathname === href || (item.href && pathname.startsWith(href))
              
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Content Section */}
          <div className="px-2 mt-4">
            <h3 className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Content
            </h3>
            {navItems.slice(1).map((item) => {
              const href = `${baseUrl}${item.href}`
              const isActive = pathname === href || (item.href && pathname.startsWith(href))
              
              return (
                <Link
                  key={`content-${item.href}`}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ml-4',
                    isActive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
