'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VehicleListingWizard from '../../new/listing-wizard';

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchVehicle = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/vehicles/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicle');
      }

      const data = await response.json();
      setVehicle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Vehicle not found'}</p>
          <button
            onClick={() => router.push('/host/vehicles')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Editing Mode:</strong> You're updating an existing vehicle listing. Some fields like VIN and license plate may be locked if already verified.
            </p>
          </div>
        </div>
      </div>
      
      <VehicleListingWizard 
        editMode
        vehicleId={params.id as string}
        initialData={vehicle}
      />
    </div>
  );
}
