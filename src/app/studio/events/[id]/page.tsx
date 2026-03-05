import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Globe,
  Settings,
  Eye,
  ExternalLink,
  CheckCircle2,
  Circle,
  Mic,
  Building,
  Send,
  BarChart3,
} from "lucide-react";

interface EventPageProps {
  params: { id: string };
}

async function getEvent(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true,
            eventSessions: true,
            speakers: true,
            exhibitors: true,
          },
        },
      },
    });
    return event;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export default async function EventDashboardPage({ params }: EventPageProps) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  // Setup checklist items
  const checklist = [
    {
      id: "cover",
      label: "Add an event cover",
      completed: !!event.banner,
      href: `/studio/events/${event.id}/settings`,
    },
    {
      id: "branding",
      label: "Brand the event with your colors",
      completed: event.primaryColor !== "#00B894",
      href: `/studio/events/${event.id}/settings`,
    },
    {
      id: "session",
      label: "Create a session",
      completed: event._count.eventSessions > 0,
      href: `/studio/events/${event.id}/sessions`,
    },
    {
      id: "speaker",
      label: "Add speakers",
      completed: event._count.speakers > 0,
      href: `/studio/events/${event.id}/speakers`,
    },
    {
      id: "publish",
      label: "Publish the event",
      completed: event.isPublished,
      href: `/studio/events/${event.id}/settings`,
    },
  ];

  const completedSteps = checklist.filter((item) => item.completed).length;
  const progressPercent = (completedSteps / checklist.length) * 100;

  // Quick action cards
  const quickActions = [
    {
      title: "Sessions",
      description: "Create and manage your agenda",
      icon: Calendar,
      href: `/studio/events/${event.id}/sessions`,
      count: event._count.eventSessions,
      color: "bg-purple-500",
    },
    {
      title: "Speakers",
      description: "Manage your speakers",
      icon: Mic,
      href: `/studio/events/${event.id}/speakers`,
      count: event._count.speakers,
      color: "bg-orange-500",
    },
    {
      title: "Exhibitors",
      description: "Manage exhibitors & sponsors",
      icon: Building,
      href: `/studio/events/${event.id}/exhibitors`,
      count: event._count.exhibitors,
      color: "bg-primary",
    },
    {
      title: "Attendees",
      description: "View registrations",
      icon: Users,
      href: `/studio/events/${event.id}/attendees`,
      count: event._count.registrations,
      color: "bg-blue-500",
    },
    {
      title: "Communications",
      description: "Send emails & notifications",
      icon: Send,
      href: `/studio/events/${event.id}/communications`,
      color: "bg-pink-500",
    },
    {
      title: "Analytics",
      description: "View event insights",
      icon: BarChart3,
      href: `/studio/events/${event.id}/analytics`,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/studio/events"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {event.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {formatDate(event.startDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/events/${event.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
                <ExternalLink className="w-3 h-3" />
              </Link>
              {event.isPublished ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 text-green-700 bg-green-100 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  Published
                </span>
              ) : (
                <button className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white font-medium rounded-full hover:bg-primary-600 transition-colors">
                  Publish Event
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Welcome to your event dashboard! 👋
              </h2>
              <p className="text-gray-600 mb-6">
                Let&apos;s get your event ready. Complete the setup checklist below
                to make your event shine.
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Setup progress</span>
                  <span className="font-medium text-primary">
                    {completedSteps}/{checklist.length} complete
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-3">
                {checklist.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      item.completed
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span
                      className={
                        item.completed ? "line-through text-green-600" : ""
                      }
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group bg-white rounded-xl shadow-card p-4 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${action.color} text-white flex items-center justify-center mb-3`}
                  >
                    <action.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {action.description}
                  </p>
                  {action.count !== undefined && (
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {action.count}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(event.startDate)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(event.startDate)} –{" "}
                      {formatDateTime(event.endDate)}
                    </p>
                  </div>
                </div>

                {event.venue && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {event.venue}
                      </p>
                      <p className="text-sm text-gray-500">
                        {[event.address, event.city, event.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                {event.virtualUrl && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Virtual Event
                      </p>
                      <a
                        href={event.virtualUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {event.virtualUrl}
                      </a>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <Link
                    href={`/studio/events/${event.id}/settings`}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Settings className="w-4 h-4" />
                    Event Settings
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {event._count.registrations}
                  </p>
                  <p className="text-xs text-gray-500">Registrations</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {event._count.eventSessions}
                  </p>
                  <p className="text-xs text-gray-500">Sessions</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {event._count.speakers}
                  </p>
                  <p className="text-xs text-gray-500">Speakers</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {event._count.exhibitors}
                  </p>
                  <p className="text-xs text-gray-500">Exhibitors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
