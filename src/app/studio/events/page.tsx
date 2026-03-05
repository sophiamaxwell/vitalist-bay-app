import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = 'force-dynamic'
import { Plus, Calendar, Users, MapPin, Globe } from "lucide-react";

export const metadata = {
  title: "Events | Vitalist Bay Studio",
  description: "Manage your events on Vitalist Bay",
};

async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            registrations: true,
            eventSessions: true,
            speakers: true,
          },
        },
      },
    });
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Events</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage your events
              </p>
            </div>
            <Link
              href="/studio/events/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-primary-600 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {events.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No events yet
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first event to start engaging with your audience and
              managing registrations.
            </p>
            <Link
              href="/studio/events/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/studio/events/${event.id}`}
                className="group bg-white rounded-xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Event Banner */}
                <div
                  className="h-32 bg-gradient-to-br from-primary to-primary-600 relative"
                  style={
                    event.banner
                      ? { backgroundImage: `url(${event.banner})`, backgroundSize: "cover" }
                      : {}
                  }
                >
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        event.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {event.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Format Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/90 text-gray-700 flex items-center gap-1">
                      {event.format === "VIRTUAL" ? (
                        <Globe className="w-3 h-3" />
                      ) : event.format === "HYBRID" ? (
                        <>
                          <MapPin className="w-3 h-3" />
                          <Globe className="w-3 h-3" />
                        </>
                      ) : (
                        <MapPin className="w-3 h-3" />
                      )}
                      {event.format.replace("_", "-")}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors mb-1 line-clamp-1">
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {formatDate(event.startDate)}
                    {event.startDate.toDateString() !==
                      event.endDate.toDateString() && (
                      <> – {formatDate(event.endDate)}</>
                    )}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event._count.registrations}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {event._count.eventSessions}
                    </span>
                  </div>

                  {/* Location */}
                  {event.venue && (
                    <p className="text-sm text-gray-400 mt-2 flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {event.venue}
                      {event.city && `, ${event.city}`}
                    </p>
                  )}
                </div>
              </Link>
            ))}

            {/* Create New Event Card */}
            <Link
              href="/studio/events/create"
              className="group bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary-50 transition-all duration-200 flex flex-col items-center justify-center min-h-[240px]"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-primary" />
              </div>
              <span className="text-gray-500 group-hover:text-primary font-medium">
                Create New Event
              </span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
