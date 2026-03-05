'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share, Plus, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandalone);

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if previously dismissed (with expiry)
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setDismissed(true);
      } else {
        localStorage.removeItem('pwa-install-dismissed');
      }
    }

    // Listen for beforeinstallprompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show our custom prompt after a delay
      setTimeout(() => {
        if (!isInStandalone && !dismissed) {
          setShowPrompt(true);
        }
      }, 3000); // Show after 3 seconds on the page
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show the prompt after a delay if not standalone
    if (isIOSDevice && !isInStandalone && !dismissed) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the native install prompt
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already standalone, dismissed, or no prompt available (and not iOS)
  if (isStandalone || dismissed || (!showPrompt)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-md mx-auto bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Install App</h3>
              <p className="text-sm text-gray-400">Add to home screen</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-300 mb-4">
            Install Vitalist Bay Events for quick access, offline support, and a native app experience.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-gray-700/50 rounded-lg">
              <div className="text-lg mb-1">⚡</div>
              <div className="text-xs text-gray-400">Fast</div>
            </div>
            <div className="text-center p-2 bg-gray-700/50 rounded-lg">
              <div className="text-lg mb-1">📴</div>
              <div className="text-xs text-gray-400">Offline</div>
            </div>
            <div className="text-center p-2 bg-gray-700/50 rounded-lg">
              <div className="text-lg mb-1">🔔</div>
              <div className="text-xs text-gray-400">Notifs</div>
            </div>
          </div>

          {/* iOS Instructions */}
          {isIOS ? (
            <div className="bg-gray-700/50 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-300 mb-2">To install on iOS:</p>
              <ol className="text-sm text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">1</span>
                  Tap <Share className="w-4 h-4 inline mx-1" /> Share
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">2</span>
                  Tap <Plus className="w-4 h-4 inline mx-1" /> Add to Home Screen
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">3</span>
                  Tap Add
                </li>
              </ol>
            </div>
          ) : (
            /* Install button for Android/Chrome */
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
            >
              <Download className="w-5 h-5" />
              Install Now
            </button>
          )}

          {/* Dismiss link */}
          <button
            onClick={handleDismiss}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-400 mt-3"
          >
            Not now
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
