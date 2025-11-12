'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PickupInspectionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [photos, setPhotos] = useState<File[]>([])
  const [mileage, setMileage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)])
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const token = localStorage.getItem('accessToken')
    const formData = new FormData()
    formData.append('mileage', mileage)
    photos.forEach((photo, i) => formData.append(`photo${i}`, photo))

    try {
      await fetch(`/api/bookings/${params.id}/pickup`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      router.push(`/bookings/${params.id}`)
    } catch (err) {
      alert('Inspection failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-6">Pickup Inspection</h1>
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block font-bold mb-2">Vehicle Photos</label>
            <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="w-full" />
            <p className="text-sm text-gray-600 mt-1">{photos.length} photos selected</p>
          </div>
          <div>
            <label className="block font-bold mb-2">Mileage (km)</label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || photos.length === 0 || !mileage}
            className="w-full bg-zemo-yellow hover:bg-yellow-400 py-3 rounded-lg font-bold disabled:bg-gray-300"
          >
            {submitting ? 'Submitting...' : 'Complete Pickup'}
          </button>
        </div>
      </div>
    </div>
  )
}
