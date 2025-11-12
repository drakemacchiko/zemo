// Service Worker Registration & Management
// Phase 11: PWA & Offline Features

export interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export async function registerServiceWorker(config?: ServiceWorkerConfig): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Check for updates on load and periodically
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            config?.onUpdate?.(registration);
          }
        });
      }
    });

    // Check for updates every hour
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    config?.onSuccess?.(registration);
  } catch (error) {
    config?.onError?.(error as Error);
  }
}

export function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(false);
  }

  return navigator.serviceWorker.ready
    .then(registration => registration.unregister())
    .catch(() => false);
}

// Update service worker
export async function updateServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();

    // Tell the service worker to skip waiting
    const waiting = registration.waiting;
    if (waiting) {
      waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  } catch (error) {
    console.error('Failed to update service worker:', error);
  }
}

// Check if app is running in standalone mode (installed PWA)
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Prompt user to install PWA
export function promptInstall(): void {
  if (typeof window === 'undefined') return;

  const deferredPrompt = (window as any).deferredPrompt;

  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      // User responded to the install prompt
      (window as any).deferredPrompt = null;
    });
  }
}

// Setup before install prompt listener
export function setupInstallPrompt(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;

    // Dispatch custom event that components can listen to
    window.dispatchEvent(new CustomEvent('canInstall'));
  });

  window.addEventListener('appinstalled', () => {
    (window as any).deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('appInstalled'));
  });
}

// Online/Offline status management
export class OnlineStatusManager {
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private isOnline: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.setupListeners();
    }
  }

  private setupListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.showNotification('Your internet connection has been restored.');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
      this.showNotification('You are currently offline. Some features may be limited.');
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  private showNotification(message: string): void {
    const notification = document.getElementById('offline-notification');
    if (notification) {
      const messageSpan = notification.querySelector('span:first-child');
      if (messageSpan) {
        messageSpan.textContent = message;
      }

      if (this.isOnline) {
        notification.classList.add('bg-green-600');
        notification.classList.remove('bg-zemo-gray-800');
        notification.classList.remove('translate-y-full');
        setTimeout(() => {
          notification.classList.add('translate-y-full');
        }, 3000);
      } else {
        notification.classList.add('bg-zemo-gray-800');
        notification.classList.remove('bg-green-600');
        notification.classList.remove('translate-y-full');
      }
    }
  }

  public subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getStatus(): boolean {
    return this.isOnline;
  }
}

// Export singleton
export const onlineStatus = new OnlineStatusManager();

// Cache important URLs for offline access
export async function cacheUrls(urls: string[]): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({
      type: 'CACHE_URLS',
      urls,
    });
  } catch (error) {
    console.error('Failed to cache URLs:', error);
  }
}
