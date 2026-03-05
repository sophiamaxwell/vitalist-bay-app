'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowBanner(true);
        // Auto-hide after 3 seconds
        setTimeout(() => setShowBanner(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showBanner ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 py-2 ${
          isOnline ? 'bg-emerald-600' : 'bg-amber-600'
        }`}
      >
        <div className="flex items-center gap-2 text-white text-sm">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Back online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>You&apos;re offline - some features may be limited</span>
            </>
          )}
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
