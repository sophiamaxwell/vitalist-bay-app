import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Plus, Calendar, Users, ArrowRight, Zap, BookOpen, Headphones } from "lucide-react";

export const metadata = {
  title: "Dashboard | Vitalist Bay Studio",
  description: "Your Vitalist Bay event management dashboard",
};

async function getStats() {
  try {
    const [eventsCount, upcomingEvents] = await Promise.all([
      prisma.event.count(),
      prisma.event.findMany({
        where: {
          startDate: { gte: new Date() },
        },
        orderBy: { startDate: "asc" },
        take: 3,
        include: {
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      }),
    ]);
    return { eventsCount, upcomingEvents };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { eventsCount: 0, upcomingEvents: [] };
  }
}

export default async function StudioDashboardPage() {
  const { eventsCount, upcomingEvents } = await getStats();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your events
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-card p-4">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{eventsCount}</p>
              <p className="text-sm text-gray-500">Total Events</p>
            </div>
            <div className="bg-white rounded-xl shadow-card p-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Total Attendees</p>
            </div>
            <div className="bg-white rounded-xl shadow-card p-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {upcomingEvents.length}
              </p>
              <p className="text-sm text-gray-500">Upcoming</p>
            </div>
            <div className="bg-white rounded-xl shadow-card p-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Live Now</p>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-card">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Upcoming Events
                </h2>
                <Link
                  href="/studio/events"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingEvents.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No upcoming events</p>
                  <Link
                    href="/studio/events/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-600 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first event
                  </Link>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/studio/events/${event.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{
                            backgroundColor: event.primaryColor || "#00B894",
                          }}
                        >
                          {event.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {event.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(event.startDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {event._count.registrations}
                        </p>
                        <p className="text-xs text-gray-500">registrations</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Create Event CTA */}
          {eventsCount === 0 && (
            <div className="bg-gradient-to-br from-primary to-primary-600 rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-2">
                Ready to create your first event?
              </h2>
              <p className="text-primary-100 mb-4">
                Set up your event in minutes with our easy-to-use wizard.
              </p>
              <Link
                href="/studio/events/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary font-medium rounded-full hover:bg-primary-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/studio/events/create"
                className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 text-primary hover:bg-primary-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create Event</span>
              </Link>
              <Link
                href="/studio/events"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                <Calendar className="w-5 h-5" />
                <span>Manage Events</span>
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Getting Started Guide
              </a>
              <a
                href="#"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <Headphones className="w-4 h-4" />
                Contact Support
              </a>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Pro Tip
            </h3>
            <p className="text-sm text-gray-300">
              Enable networking features to let your attendees connect with each
              other and schedule meetings during your event.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
