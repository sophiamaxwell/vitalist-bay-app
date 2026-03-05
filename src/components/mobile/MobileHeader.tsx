'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MobileHeaderProps {
  eventId: string
  eventName?: string
}

const menuItems = [
  { href: '', label: 'Home', icon: '🏠' },
  { href: '/agenda', label: 'Agenda', icon: '📅' },
  { href: '/speakers', label: 'Speakers', icon: '🎤' },
  { href: '/exhibitors', label: 'Exhibitors', icon: '🏢' },
  { href: '/attendees', label: 'Attendees', icon: '👥' },
  { href: '/my-schedule', label: 'My Schedule', icon: '⭐' },
  { href: '/my-ticket', label: 'My Ticket', icon: '🎫' },
  { href: '/register', label: 'Register', icon: '✍️', highlight: true },
]

export function MobileHeader({ eventId, eventName = 'Event' }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const baseUrl = `/events/${eventId}`

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="touch-target flex items-center justify-center -ml-2"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo / Event Name */}
          <Link href={baseUrl} className="flex items-center gap-2">
            <span className="text-lg font-bold text-emerald-500">Vitalist</span>
          </Link>

          {/* User Avatar */}
          <Link href="/profile" className="touch-target flex items-center justify-center -mr-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-medium">
              SM
            </div>
          </Link>
        </div>
      </header>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[99] md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[100] transform transition-transform duration-300 ease-out md:hidden',
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div>
            <div className="text-lg font-bold text-emerald-500">Vitalist Bay</div>
            <div className="text-xs text-slate-500">VB26 Conference</div>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="touch-target flex items-center justify-center"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-2">
          {menuItems.map((item) => {
            const href = `${baseUrl}${item.href}`
            const isActive = pathname === href || (item.href && pathname.startsWith(href))

            return (
              <Link
                key={item.href || 'home'}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors touch-interactive',
                  isActive
                    ? 'bg-emerald-50 text-emerald-600'
                    : item.highlight
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-medium">
              SM
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-900 truncate">Sophia Maxwell</div>
              <div className="text-sm text-slate-500 truncate">sophiamaxwell@longevitylist.com</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
