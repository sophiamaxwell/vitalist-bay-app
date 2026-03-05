import Link from "next/link";
import { ArrowRight, Calendar, Users, Zap, Globe, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VB</span>
              </div>
              <span className="font-semibold text-gray-900">Vitalist Bay</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/studio"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/studio/events/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-full hover:bg-primary-600 transition-colors"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Create Unforgettable{" "}
              <span className="text-primary">Event Experiences</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The all-in-one platform for organizing conferences, exhibitions,
              and corporate events. Engage your audience like never before.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/studio/events/create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-medium rounded-full hover:bg-primary-600 transition-colors text-lg"
              >
                Create Your Event
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-700 font-medium rounded-full hover:border-gray-300 hover:bg-gray-50 transition-colors text-lg"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-50 rounded-full blur-3xl opacity-50" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Successful Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From registration to networking, we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Event Management",
                description:
                  "Create and manage sessions, speakers, and exhibitors with ease.",
                color: "bg-primary",
              },
              {
                icon: Users,
                title: "Attendee Networking",
                description:
                  "Enable meaningful connections between your attendees.",
                color: "bg-purple-500",
              },
              {
                icon: Globe,
                title: "Hybrid & Virtual",
                description:
                  "Support in-person, virtual, and hybrid event formats.",
                color: "bg-blue-500",
              },
              {
                icon: Zap,
                title: "Real-time Analytics",
                description:
                  "Track engagement and measure your event success.",
                color: "bg-orange-500",
              },
              {
                icon: CheckCircle,
                title: "Check-in & Badges",
                description:
                  "Streamline on-site check-in with QR codes and badge printing.",
                color: "bg-pink-500",
              },
              {
                icon: ArrowRight,
                title: "Communications",
                description:
                  "Send targeted emails and push notifications to attendees.",
                color: "bg-indigo-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200"
              >
                <div
                  className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center text-white mb-4`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary to-primary-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Create Your Next Event?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of event organizers who trust Vitalist Bay.
            </p>
            <Link
              href="/studio/events/create"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-medium rounded-full hover:bg-primary-50 transition-colors text-lg"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">VB</span>
              </div>
              <span className="text-sm text-gray-500">
                © 2026 Vitalist Bay. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-900">
                Terms
              </a>
              <a href="#" className="hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
