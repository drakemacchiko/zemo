'use client';

import { useEffect, useState } from 'react';
import { loadGoogleMapsScript } from '@/lib/maps';

export default function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('Google Maps API key not found. Location features will be limited.');
      setLoaded(true); // Continue without Maps
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        setLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load Google Maps:', err);
        setError('Failed to load map services');
        setLoaded(true); // Continue even if Maps fails
      });
  }, []);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error(error);
    // Continue rendering even with error - app should work without Maps
  }

  return <>{children}</>;
}
