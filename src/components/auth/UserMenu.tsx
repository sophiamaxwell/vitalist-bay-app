'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (status === 'loading') {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
      >
        Sign In
      </Link>
    )
  }

  const initials = session.user.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : session.user.email?.[0].toUpperCase() || '?'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full"
      >
        {session.user.avatar ? (
          <img
            src={session.user.avatar}
            alt={session.user.name || 'User'}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-medium text-sm">
            {initials}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.user.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
              {session.user.role}
            </span>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              My Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Settings
            </Link>
            {(session.user.role === 'ADMIN' || session.user.role === 'ORGANIZER') && (
              <Link
                href="/studio"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Organizer Studio
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
