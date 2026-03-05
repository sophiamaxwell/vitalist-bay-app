'use client';

import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  // If we're back online, show a different message
  if (isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <RefreshCw className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            You&apos;re Back Online!
          </h1>
          <p className="text-gray-400 mb-8">
            Your connection has been restored. Click below to continue.
          </p>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Animated offline icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center relative">
          <WifiOff className="w-12 h-12 text-gray-400" />
          <div className="absolute inset-0 rounded-full border-2 border-gray-600 animate-ping opacity-20" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          You&apos;re Offline
        </h1>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          It looks like you&apos;ve lost your internet connection. 
          Some features may not be available until you&apos;re back online.
        </p>

        {/* Cached content info */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-8 text-left">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Available offline:
          </h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Previously viewed events
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Your saved tickets
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Cached profile data
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
        </div>

        {/* Tips */}
        <p className="text-xs text-gray-500 mt-8">
          Tip: Enable airplane mode then disable it to reset your connection
        </p>
      </div>
    </div>
  );
}
