// Offline Queue Manager - IndexedDB utilities for offline operations
// Phase 11: PWA & Offline Features

export interface QueuedBooking {
  id?: number;
  data: {
    vehicleId: string;
    startDate: string;
    endDate: string;
    insuranceOptionId?: string;
  };
  token: string;
  timestamp: number;
}

export interface QueuedPayment {
  id?: number;
  data: {
    bookingId: string;
    amount: number;
    provider: string;
    phoneNumber: string;
  };
  token: string;
  timestamp: number;
}

export interface QueuedMessage {
  id?: number;
  data: {
    conversationId: string;
    content: string;
  };
  token: string;
  timestamp: number;
}

export interface CachedBooking {
  id: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  vehicle?: any;
  cachedAt: number;
}

class OfflineQueueManager {
  private dbName = 'ZemoOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('queuedBookings')) {
          db.createObjectStore('queuedBookings', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('queuedPayments')) {
          db.createObjectStore('queuedPayments', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('queuedMessages')) {
          db.createObjectStore('queuedMessages', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('cachedBookings')) {
          db.createObjectStore('cachedBookings', { keyPath: 'id' });
        }
      };
    });
  }

  // Queue booking for later sync
  async queueBooking(booking: Omit<QueuedBooking, 'id'>): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queuedBookings'], 'readwrite');
      const store = transaction.objectStore('queuedBookings');
      const request = store.add(booking);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all queued bookings
  async getQueuedBookings(): Promise<QueuedBooking[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queuedBookings'], 'readonly');
      const store = transaction.objectStore('queuedBookings');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove queued booking
  async removeQueuedBooking(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queuedBookings'], 'readwrite');
      const store = transaction.objectStore('queuedBookings');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Queue payment for later sync
  async queuePayment(payment: Omit<QueuedPayment, 'id'>): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queuedPayments'], 'readwrite');
      const store = transaction.objectStore('queuedPayments');
      const request = store.add(payment);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  // Queue message for later sync
  async queueMessage(message: Omit<QueuedMessage, 'id'>): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queuedMessages'], 'readwrite');
      const store = transaction.objectStore('queuedMessages');
      const request = store.add(message);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  // Cache booking for offline viewing
  async cacheBooking(booking: CachedBooking): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedBookings'], 'readwrite');
      const store = transaction.objectStore('cachedBookings');
      const request = store.put({ ...booking, cachedAt: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get all cached bookings
  async getCachedBookings(): Promise<CachedBooking[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedBookings'], 'readonly');
      const store = transaction.objectStore('cachedBookings');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached booking by ID
  async getCachedBooking(id: string): Promise<CachedBooking | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedBookings'], 'readonly');
      const store = transaction.objectStore('cachedBookings');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear old cached data (older than 7 days)
  async clearOldCache(): Promise<void> {
    if (!this.db) await this.init();

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedBookings'], 'readwrite');
      const store = transaction.objectStore('cachedBookings');
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const booking = cursor.value as CachedBooking;
          if (booking.cachedAt < sevenDaysAgo) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Request background sync
  async requestSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore - Background Sync API not fully typed
        await registration.sync.register(tag);
      } catch (error) {
        // Background sync not supported or failed
      }
    }
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueManager();

// Initialize on module load
if (typeof window !== 'undefined') {
  offlineQueue.init().catch(console.error);
}
