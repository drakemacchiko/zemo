// Accessible UI Components
// Phase 11: PWA & Accessibility

'use client';

import { useState, useEffect } from 'react';
import { usePWAInstall, usePushNotifications } from '@/hooks/usePWA';
import { announceToScreenReader } from '@/lib/accessibility';

// Install PWA Banner
export function InstallPWABanner() {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  if (!canInstall || isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = () => {
    promptInstall();
    announceToScreenReader('Installing ZEMO app', 'polite');
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    announceToScreenReader('Install banner dismissed', 'polite');
  };

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 
                 bg-zemo-yellow text-zemo-black p-4 rounded-zemo shadow-zemo-lg z-50"
      role="dialog"
      aria-labelledby="install-banner-title"
      aria-describedby="install-banner-desc"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 id="install-banner-title" className="font-sub-heading text-lg mb-1">
            Install ZEMO App
          </h3>
          <p id="install-banner-desc" className="text-sm opacity-90">
            Install ZEMO on your device for quick access and offline features.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zemo-black hover:opacity-70 transition-opacity"
          aria-label="Dismiss install banner"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleInstall}
          className="flex-1 bg-zemo-black text-white px-4 py-2 rounded-zemo 
                     font-sub-heading hover:bg-opacity-90 transition-all
                     focus:outline-none focus:ring-2 focus:ring-zemo-black focus:ring-offset-2"
        >
          Install Now
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 rounded-zemo font-sub-heading hover:bg-black hover:bg-opacity-10 
                     transition-all focus:outline-none focus:ring-2 focus:ring-zemo-black focus:ring-offset-2"
        >
          Not Now
        </button>
      </div>
    </div>
  );
}

// Push Notification Prompt
export function PushNotificationPrompt({ userId, token }: { userId?: string; token?: string }) {
  const { isSupported, permission, isSubscribed, subscribe } = usePushNotifications();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('push-notification-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  if (!isSupported || permission === 'denied' || isSubscribed || isDismissed || !userId || !token) {
    return null;
  }

  const handleSubscribe = async () => {
    setIsLoading(true);
    announceToScreenReader('Subscribing to notifications', 'polite');

    const success = await subscribe(userId, token);

    if (success) {
      announceToScreenReader('Successfully subscribed to notifications', 'polite');
    } else {
      announceToScreenReader('Failed to subscribe to notifications', 'assertive');
    }

    setIsLoading(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('push-notification-dismissed', 'true');
    announceToScreenReader('Notification prompt dismissed', 'polite');
  };

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 
                 bg-white border-2 border-zemo-yellow p-4 rounded-zemo shadow-zemo-lg z-50"
      role="dialog"
      aria-labelledby="notification-prompt-title"
      aria-describedby="notification-prompt-desc"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 id="notification-prompt-title" className="font-sub-heading text-lg mb-1">
            Enable Notifications
          </h3>
          <p id="notification-prompt-desc" className="text-sm text-gray-600">
            Get notified about booking confirmations, messages, and important updates.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Dismiss notification prompt"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="flex-1 bg-zemo-yellow text-zemo-black px-4 py-2 rounded-zemo 
                     font-sub-heading hover:bg-opacity-90 transition-all
                     focus:outline-none focus:ring-2 focus:ring-zemo-yellow focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
          aria-busy={isLoading}
        >
          {isLoading ? 'Enabling...' : 'Enable'}
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 rounded-zemo font-sub-heading hover:bg-gray-100 
                     transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          Later
        </button>
      </div>
    </div>
  );
}

// Offline Queue Status
export function OfflineQueueStatus() {
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkQueue = async () => {
      const db = await openDB();
      const tx = db.transaction(['queuedBookings', 'queuedPayments'], 'readonly');
      const bookingsStore = tx.objectStore('queuedBookings');
      const paymentsStore = tx.objectStore('queuedPayments');
      
      const bookingsRequest = bookingsStore.count();
      const paymentsRequest = paymentsStore.count();
      
      bookingsRequest.onsuccess = () => {
        paymentsRequest.onsuccess = () => {
          setQueueCount(bookingsRequest.result + paymentsRequest.result);
        };
      };
    };

    checkQueue();

    const interval = setInterval(checkQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  if (queueCount === 0) return null;

  return (
    <div
      className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 
                 bg-blue-500 text-white p-3 rounded-zemo shadow-zemo-lg z-40"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="animate-pulse">⏳</span>
        <span>
          {queueCount} {queueCount === 1 ? 'action' : 'actions'} queued. Will sync when online.
        </span>
      </div>
    </div>
  );
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ZemoOfflineDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
