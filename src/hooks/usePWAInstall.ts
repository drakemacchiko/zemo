'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAInstallState {
  isInstalled: boolean;
  canInstall: boolean;
  isStandalone: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  showPrompt: boolean;
}

const STORAGE_KEYS = {
  DISMISSED: 'pwa-prompt-dismissed',
  INSTALLED_AT: 'pwa-installed-at',
  VISIT_COUNT: 'pwa-visit-count',
  FIRST_VISIT: 'pwa-first-visit',
};

const DISMISS_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<PWAInstallState>({
    isInstalled: false,
    canInstall: false,
    isStandalone: false,
    platform: 'unknown',
    showPrompt: false,
  });

  // Detect platform
  const detectPlatform = useCallback((): 'ios' | 'android' | 'desktop' | 'unknown' => {
    if (typeof window === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    }
    if (/android/.test(userAgent)) {
      return 'android';
    }
    if (/windows|mac|linux/.test(userAgent)) {
      return 'desktop';
    }
    
    return 'unknown';
  }, []);

  // Check if running in standalone mode
  const checkStandalone = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = (navigator as any).standalone === true;
    
    return isStandalone || isIOS;
  }, []);

  // Track visits
  const trackVisit = useCallback(() => {
    try {
      const firstVisit = localStorage.getItem(STORAGE_KEYS.FIRST_VISIT);
      if (!firstVisit) {
        localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, Date.now().toString());
        localStorage.setItem(STORAGE_KEYS.VISIT_COUNT, '1');
      } else {
        const visitCount = parseInt(localStorage.getItem(STORAGE_KEYS.VISIT_COUNT) || '0');
        localStorage.setItem(STORAGE_KEYS.VISIT_COUNT, (visitCount + 1).toString());
      }
    } catch (error) {
      console.error('Failed to track visit:', error);
    }
  }, []);

  // Check if should show prompt
  const shouldShowPrompt = useCallback((): boolean => {
    try {
      // Don't show if already installed
      const installedAt = localStorage.getItem(STORAGE_KEYS.INSTALLED_AT);
      if (installedAt) return false;

      // Don't show if recently dismissed
      const dismissedAt = localStorage.getItem(STORAGE_KEYS.DISMISSED);
      if (dismissedAt) {
        const timeSinceDismissed = Date.now() - parseInt(dismissedAt);
        if (timeSinceDismissed < DISMISS_DURATION) {
          return false;
        }
      }

      // Show after 2 visits or if user has been on site for a while
      const visitCount = parseInt(localStorage.getItem(STORAGE_KEYS.VISIT_COUNT) || '0');
      const firstVisit = parseInt(localStorage.getItem(STORAGE_KEYS.FIRST_VISIT) || '0');
      const timeOnSite = Date.now() - firstVisit;
      
      return visitCount >= 2 || timeOnSite > 60000; // 60 seconds
    } catch (error) {
      console.error('Failed to check if should show prompt:', error);
      return false;
    }
  }, []);

  // Initialize
  useEffect(() => {
    const platform = detectPlatform();
    const isStandalone = checkStandalone();
    
    trackVisit();

    const installedAt = localStorage.getItem(STORAGE_KEYS.INSTALLED_AT);
    const isInstalled = isStandalone || !!installedAt;

    setInstallState((prev) => ({
      ...prev,
      platform,
      isStandalone,
      isInstalled,
      showPrompt: !isInstalled && shouldShowPrompt(),
    }));
  }, [detectPlatform, checkStandalone, trackVisit, shouldShowPrompt]);

  // Listen for beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      setInstallState((prev) => ({
        ...prev,
        canInstall: true,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Listen for appinstalled
  useEffect(() => {
    const handleAppInstalled = () => {
      // PWA installed successfully
      
      try {
        localStorage.setItem(STORAGE_KEYS.INSTALLED_AT, Date.now().toString());
      } catch (error) {
        console.error('Failed to save installation timestamp:', error);
      }

      setInstallState((prev) => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        showPrompt: false,
      }));
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Dismiss function
  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DISMISSED, Date.now().toString());
    } catch (error) {
      console.error('Failed to save dismissal:', error);
    }

    setInstallState((prev) => ({
      ...prev,
      showPrompt: false,
    }));
  }, []);

  // Install function
  const install = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('Install prompt not available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        // User accepted the install prompt
      } else {
        // User dismissed the install prompt
        dismiss();
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  }, [deferredPrompt, dismiss]);

  return {
    ...installState,
    install,
    dismiss,
  };
}
