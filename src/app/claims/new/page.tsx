'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function NewClaimForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('bookingId', bookingId || '');
    formData.append('description', description);
    photos.forEach((photo, i) => formData.append(`photo${i}`, photo));

    try {
      await fetch('/api/claims', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      router.push('/bookings');
    } catch (err) {
      alert('Claim submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-6">File Insurance Claim</h1>
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block font-bold mb-2">Damage Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={6}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Describe the damage in detail..."
            />
          </div>
          <div>
            <label className="block font-bold mb-2">Photos of Damage</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={e => e.target.files && setPhotos(Array.from(e.target.files))}
              className="w-full"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || !description}
            className="w-full bg-zemo-yellow hover:bg-yellow-400 py-3 rounded-lg font-bold disabled:bg-gray-300"
          >
            {submitting ? 'Submitting...' : 'Submit Claim'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewClaimPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow mx-auto" />
            <p className="mt-4 text-gray-600">Loading claim form...</p>
          </div>
        </div>
      }
    >
      <NewClaimForm />
    </Suspense>
  );
}

