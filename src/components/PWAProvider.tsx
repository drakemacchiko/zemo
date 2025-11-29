// PWA Provider Component
// Phase 11: PWA & Offline Features

'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker, setupInstallPrompt } from '@/lib/service-worker';
import { offlineQueue } from '@/lib/offline-queue';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Initialize offline queue
    offlineQueue.init().catch(console.error);

    // Setup install prompt
    setupInstallPrompt();

    // Register service worker - only in production
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      registerServiceWorker({
        onUpdate: () => {
          setUpdateAvailable(true);
        },
        onSuccess: () => {
          // Service worker registered successfully
        },
        onError: error => {
          console.warn('Service worker registration failed:', error);
        },
      });
    }

    // Clean old cached data periodically
    const cleanupInterval = setInterval(
      () => {
        offlineQueue.clearOldCache().catch(console.error);
      },
      24 * 60 * 60 * 1000
    ); // Once per day

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  return (
    <>
      {children}

      {/* Update notification */}
      {updateAvailable && (
        <div
          className="fixed bottom-20 left-4 right-4 p-4 bg-zemo-yellow text-zemo-black 
                     rounded-zemo shadow-zemo-lg z-50 animate-slide-up"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-sub-heading text-sm">A new version of ZEMO is available!</p>
              <p className="text-xs mt-1 opacity-80">Update now to get the latest features.</p>
            </div>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-zemo-black text-white rounded-zemo text-sm font-sub-heading 
                         hover:bg-opacity-90 transition-all"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </>
  );
}
