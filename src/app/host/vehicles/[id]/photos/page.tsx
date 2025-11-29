'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader, { UploadedImage } from '@/components/upload/ImageUploader';

interface VehiclePhotosPageProps {
  params: { id: string };
}

export default function VehiclePhotosPage({ params }: VehiclePhotosPageProps) {
  const router = useRouter();
  const [existingPhotos, setExistingPhotos] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);

  const vehicleId = params.id;

  // Fetch existing photos
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/vehicles/${vehicleId}/photos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setExistingPhotos(
            data.photos.map((photo: any) => ({
              id: photo.id,
              url: photo.photoUrl,
              type: photo.photoType,
              isPrimary: photo.isPrimary,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [vehicleId, router]);

  const handleUploadComplete = (newPhotos: UploadedImage[]) => {
    setExistingPhotos(prev => [...prev, ...newPhotos]);
  };

  const finishAndContinue = () => {
    router.push('/host');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Upload Vehicle Photos</h1>
            <p className="text-gray-600">
              Add photos to showcase your vehicle. The first photo will be your primary listing
              image.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : (
              <ImageUploader
                vehicleId={vehicleId}
                existingImages={existingPhotos}
                onUploadComplete={handleUploadComplete}
                maxImages={20}
                maxSizeMB={10}
              />
            )}

            {/* Navigation */}
            {!loading && (
              <div className="border-t pt-6 flex items-center justify-between">
                <button
                  onClick={() => router.push('/host')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Skip for Now
                </button>
                <button
                  onClick={finishAndContinue}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-lg transition-colors"
                >
                  {existingPhotos.length > 0
                    ? 'Finish & Go to Dashboard'
                    : 'Skip & Go to Dashboard'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
