/**
 * Google Maps Loader
 * Utility to load Google Maps JavaScript API
 */

let isLoading = false;
let isLoaded = false;
const callbacks: Array<() => void> = [];

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (isLoaded) {
      resolve();
      return;
    }

    // Currently loading, add to callback queue
    if (isLoading) {
      callbacks.push(resolve);
      return;
    }

    isLoading = true;

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Global callback
    (window as any).initGoogleMaps = () => {
      isLoaded = true;
      isLoading = false;
      
      // Call original resolve
      resolve();
      
      // Call all queued callbacks
      callbacks.forEach(callback => callback());
      callbacks.length = 0;
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });
}

export function isGoogleMapsLoaded(): boolean {
  return isLoaded && typeof (window as any).google !== 'undefined';
}

/**
 * Get coordinates from address using Google Geocoding
 */
export async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
  formattedAddress: string;
} | null> {
  if (!isGoogleMapsLoaded()) {
    console.error('Google Maps not loaded');
    return null;
  }

  const geocoder = new (window as any).google.maps.Geocoder();

  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
          formattedAddress: results[0].formatted_address,
        });
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Get address from coordinates using Google Reverse Geocoding
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!isGoogleMapsLoaded()) {
    console.error('Google Maps not loaded');
    return null;
  }

  const geocoder = new (window as any).google.maps.Geocoder();

  return new Promise((resolve) => {
    geocoder.geocode(
      { location: { lat, lng } },
      (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve(null);
        }
      }
    );
  });
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`;
  }
  return `${km.toFixed(1)} km away`;
}
