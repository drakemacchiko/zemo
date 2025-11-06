'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Photo {
  id: string
  photoUrl: string
  photoType: string
  isPrimary: boolean
}

interface VehiclePhotosPageProps {
  params: { id: string }
}

export default function VehiclePhotosPage({ params }: VehiclePhotosPageProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const vehicleId = params.id

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      
      if (!isValidType) {
        setError(`Invalid file type: ${file.name}. Please use JPEG, PNG, or WebP.`)
        return false
      }
      
      if (!isValidSize) {
        setError(`File too large: ${file.name}. Maximum size is 10MB.`)
        return false
      }
      
      return true
    })

    if (validFiles.length + photos.length > 20) {
      setError('Maximum 20 photos allowed per vehicle.')
      return
    }

    setSelectedFiles(validFiles)
    setError('')
  }

  const uploadPhotos = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setError('')

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('photos', file)
      })

      const response = await fetch(`/api/vehicles/${vehicleId}/photos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setPhotos(prev => [...prev, ...data.photos])
        setSelectedFiles([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setError(data.error || 'Failed to upload photos')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload photos. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const finishAndContinue = () => {
    router.push('/host')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Upload Vehicle Photos</h1>
            <p className="text-gray-600">
              Add photos to showcase your vehicle. The first photo will be your primary listing image.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="text-gray-400 text-6xl mb-4">📸</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select Photos to Upload
              </h3>
              <p className="text-gray-600 mb-4">
                Choose up to 20 photos (JPEG, PNG, WebP - max 10MB each)
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-zemo-yellow hover:bg-yellow-400 text-zemo-black font-bold px-6 py-2 rounded-lg transition-colors"
              >
                Choose Photos
              </button>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Selected Photos ({selectedFiles.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeSelectedFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {file.name}
                      </p>
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-zemo-yellow text-zemo-black text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={uploadPhotos}
                    disabled={uploading}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photos`}
                  </button>
                </div>
              </div>
            )}

            {/* Uploaded Photos */}
            {photos.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Uploaded Photos ({photos.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={photo.id} className="relative">
                      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <Image
                          src={photo.photoUrl}
                          alt={`Vehicle photo ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {photo.isPrimary && (
                        <span className="absolute top-2 left-2 bg-zemo-yellow text-zemo-black text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {photo.photoType.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Photo Tips:</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Take photos in good lighting (natural daylight works best)</li>
                <li>• Include exterior shots from all angles (front, rear, sides)</li>
                <li>• Add interior photos showing seats, dashboard, and features</li>
                <li>• Ensure the vehicle is clean and presentable</li>
                <li>• The first photo you upload will be your main listing image</li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="border-t pt-6 flex items-center justify-between">
              <button
                onClick={() => router.push('/host')}
                className="text-gray-600 hover:text-gray-800"
              >
                Skip for Now
              </button>
              <button
                onClick={finishAndContinue}
                className="bg-zemo-yellow hover:bg-yellow-400 text-zemo-black font-bold px-6 py-2 rounded-lg transition-colors"
              >
                {photos.length > 0 ? 'Finish & Go to Dashboard' : 'Skip & Go to Dashboard'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}