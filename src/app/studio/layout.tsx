import Link from "next/link";
import { Calendar, Home, Settings, User } from "lucide-react";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/studio" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VB</span>
              </div>
              <span className="font-semibold hidden sm:block">
                Vitalist Bay Studio
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              <Link
                href="/studio"
                className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/studio/events"
                className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Events</span>
              </Link>
              <Link
                href="/studio/settings"
                className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                Free Trial
              </span>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}
    </div>
  );
}
