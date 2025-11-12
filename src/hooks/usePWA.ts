// React Hooks for PWA & Offline Features
// Phase 11: PWA & Offline Features

'use client';

import { useState, useEffect, useCallback } from 'react';
import { onlineStatus } from '@/lib/service-worker';
import { offlineQueue } from '@/lib/offline-queue';
import { pushNotifications } from '@/lib/push-notifications';

// Hook to track online/offline status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(onlineStatus.getStatus());

    const unsubscribe = onlineStatus.subscribe((status) => {
      setIsOnline(status);
    });

    return unsubscribe;
  }, []);

  return isOnline;
}

// Hook to manage PWA installation
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
    );

    // Listen for install prompt
    const handleCanInstall = () => setCanInstall(true);
    const handleAppInstalled = () => {
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener('canInstall', handleCanInstall);
    window.addEventListener('appInstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('canInstall', handleCanInstall);
      window.removeEventListener('appInstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(() => {
    const deferredPrompt = (window as any).deferredPrompt;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          setCanInstall(false);
        }
        (window as any).deferredPrompt = null;
      });
    }
  }, []);

  return { canInstall, isInstalled, promptInstall };
}

// Hook to manage push notifications
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    setIsSupported(pushNotifications.isSupported());

    if (pushNotifications.isSupported()) {
      setPermission(Notification.permission);

      // Check if already subscribed
      pushNotifications.getSubscription().then((subscription) => {
        setIsSubscribed(!!subscription);
      });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const newPermission = await pushNotifications.requestPermission();
    setPermission(newPermission);
    return newPermission;
  }, []);

  const subscribe = useCallback(async (userId: string, token: string) => {
    const subscription = await pushNotifications.subscribe();

    if (subscription) {
      const success = await pushNotifications.sendSubscriptionToServer(
        subscription,
        userId,
        token
      );

      if (success) {
        setIsSubscribed(true);
        return true;
      }
    }

    return false;
  }, []);

  const unsubscribe = useCallback(async (token: string) => {
    const success = await pushNotifications.unsubscribe();

    if (success) {
      await pushNotifications.removeSubscriptionFromServer(token);
      setIsSubscribed(false);
    }

    return success;
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

// Hook to queue actions when offline
export function useOfflineQueue() {
  const isOnline = useOnlineStatus();

  const queueBooking = useCallback(
    async (bookingData: any, token: string) => {
      if (isOnline) {
        // Try to create booking immediately
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingData),
        });

        return response.ok;
      } else {
        // Queue for later
        await offlineQueue.queueBooking({
          data: bookingData,
          token,
          timestamp: Date.now(),
        });

        // Request background sync
        await offlineQueue.requestSync('sync-bookings');

        return true;
      }
    },
    [isOnline]
  );

  const queuePayment = useCallback(
    async (paymentData: any, token: string) => {
      if (isOnline) {
        // Try to process payment immediately
        const response = await fetch('/api/payments/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paymentData),
        });

        return response.ok;
      } else {
        // Queue for later
        await offlineQueue.queuePayment({
          data: paymentData,
          token,
          timestamp: Date.now(),
        });

        // Request background sync
        await offlineQueue.requestSync('sync-payments');

        return true;
      }
    },
    [isOnline]
  );

  const getQueuedBookings = useCallback(async () => {
    return await offlineQueue.getQueuedBookings();
  }, []);

  const getCachedBookings = useCallback(async () => {
    return await offlineQueue.getCachedBookings();
  }, []);

  return {
    isOnline,
    queueBooking,
    queuePayment,
    getQueuedBookings,
    getCachedBookings,
  };
}

// Hook to manage service worker updates
export function useServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const update = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  return { updateAvailable, update };
}
