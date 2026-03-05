'use client';

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  minDisplayTime?: number;
  children?: React.ReactNode;
}

export default function LoadingScreen({ minDisplayTime = 500, children }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMinTimeElapsed(true);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  useEffect(() => {
    if (hasMinTimeElapsed) {
      // Fade out animation
      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(fadeTimer);
    }
  }, [hasMinTimeElapsed]);

  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center transition-opacity duration-300 ${
          hasMinTimeElapsed ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* App Icon */}
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl">
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
              <path d="m9 16 2 2 4-4" />
            </svg>
          </div>
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/30 animate-ping" />
        </div>

        {/* App Name */}
        <h1 className="text-2xl font-bold text-white mb-2">Vitalist Bay</h1>
        <p className="text-gray-400 mb-8">Events</p>

        {/* Loading indicator */}
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
      {children}
    </>
  );
}

// Skeleton loader component for content
export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-700/50 rounded ${className}`} />
  );
}

// Content skeleton for pages
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <SkeletonLoader className="w-32 h-8" />
        <SkeletonLoader className="w-10 h-10 rounded-full" />
      </div>

      {/* Content skeletons */}
      <div className="space-y-4">
        <SkeletonLoader className="w-full h-48 rounded-xl" />
        <SkeletonLoader className="w-full h-32 rounded-xl" />
        <SkeletonLoader className="w-3/4 h-24 rounded-xl" />
      </div>
    </div>
  );
}
