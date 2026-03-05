'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        
        setRegistration(reg);
        console.log('Service Worker registered successfully');

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Check for updates on page visibility change
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            reg.update();
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    // Register after the page has loaded
    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
      return () => window.removeEventListener('load', registerServiceWorker);
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Tell the service worker to skip waiting
      registration.waiting.postMessage('skipWaiting');
      // Reload the page to use the new service worker
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <div className="max-w-md mx-auto bg-blue-600 text-white rounded-xl shadow-lg p-4 flex items-center gap-3">
        <RefreshCw className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Update available</p>
          <p className="text-xs text-blue-100">Refresh to get the latest version</p>
        </div>
        <button
          onClick={handleUpdate}
          className="px-3 py-1.5 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          Update
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-blue-500 rounded-lg transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
