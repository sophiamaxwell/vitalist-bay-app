import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "@/components/auth";
import { ServiceWorkerRegistration, InstallPrompt, NetworkStatus } from "@/components/pwa";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#10b981',
};

export const metadata: Metadata = {
  title: "Vitalist Bay Events",
  description: "Event management platform for Vitalist Bay - discover events, network with attendees, and manage your conference experience",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VB Events",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "VB Events",
    "apple-mobile-web-app-title": "VB Events",
    "msapplication-TileColor": "#10b981",
    "msapplication-tap-highlight": "no",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-152x152.svg", sizes: "152x152", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* PWA splash screens for iOS */}
        <link
          rel="apple-touch-startup-image"
          href="/icons/icon-512x512.svg"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        {/* Preconnect for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* Prevent iOS double-tap zoom */}
        <style>{`
          * { touch-action: manipulation; }
          html { -webkit-text-size-adjust: 100%; }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased touch-manipulation min-h-screen overscroll-none`}
      >
        <ServiceWorkerRegistration />
        <NetworkStatus />
        <SessionProvider>
          {children}
        </SessionProvider>
        <InstallPrompt />
      </body>
    </html>
  );
}
