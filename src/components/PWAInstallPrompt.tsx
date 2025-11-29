'use client';

import { useState, useEffect } from 'react';
import { X, Download, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 30 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show instructions after 30 seconds
    if (isIOSDevice) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) return;

    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <>
      {/* Main Install Prompt */}
      {!showIOSInstructions && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50 animate-slide-up">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Install ZEMO App</h3>
              <p className="text-sm text-gray-600">Get faster access and a better experience</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-600" />
              <span>Faster loading and smoother performance</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-600" />
              <span>Work offline and sync later</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-600" />
              <span>Instant notifications for bookings</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-green-600" />
              <span>Easy access from your home screen</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleInstallClick}
              className="flex-1 px-4 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Install Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Install on iOS</h3>
              <button
                onClick={() => {
                  setShowIOSInstructions(false);
                  setShowPrompt(false);
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold">
                  1
                </div>
                <div>
                  <p className="text-gray-700">
                    Tap the <strong>Share</strong> button in Safari
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                    </svg>
                    <span>(Square with arrow pointing up)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold">
                  2
                </div>
                <div>
                  <p className="text-gray-700">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold">
                  3
                </div>
                <div>
                  <p className="text-gray-700">
                    Tap <strong>"Add"</strong> in the top right corner
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSInstructions(false);
                setShowPrompt(false);
                localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
              }}
              className="w-full px-4 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
