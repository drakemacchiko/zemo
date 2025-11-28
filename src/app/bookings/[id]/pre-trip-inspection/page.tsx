'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Fuel,
  Gauge,
  Car,
  Shield
} from 'lucide-react'

interface ChecklistItem {
  id: string
  category: string
  item: string
  condition: 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED' | null
  notes: string
  photos: string[]
}

const INSPECTION_CHECKLIST = [
  {
    category: 'Exterior',
    items: [
      'Front bumper',
      'Rear bumper',
      'Hood',
      'Roof',
      'Trunk/Tailgate',
      'Driver side doors',
      'Passenger side doors',
      'Side mirrors',
      'Windshield',
      'Windows',
      'Headlights',
      'Taillights',
      'Wheels/Rims',
      'Tires condition',
      'Body panels'
    ]
  },
  {
    category: 'Interior',
    items: [
      'Dashboard',
      'Steering wheel',
      'Seats (front)',
      'Seats (rear)',
      'Seat belts',
      'Floor mats',
      'Carpets',
      'Center console',
      'Door panels',
      'Headliner',
      'Mirrors (rearview)',
      'Air vents',
      'Cleanliness'
    ]
  },
  {
    category: 'Functional',
    items: [
      'Engine starts',
      'Brakes',
      'Steering',
      'Acceleration',
      'Air conditioning',
      'Heater',
      'Radio/Infotainment',
      'Power windows',
      'Door locks',
      'Horn',
      'Wipers',
      'All lights working',
      'Warning lights'
    ]
  },
  {
    category: 'Safety & Equipment',
    items: [
      'Spare tire',
      'Jack and tools',
      'First aid kit',
      'Fire extinguisher',
      'Warning triangle',
      'Registration documents',
      'Insurance documents',
      'Owner\'s manual'
    ]
  }
]

export default function PreTripInspectionPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userRole] = useState<'HOST' | 'RENTER'>('RENTER')

  // Inspection data
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [fuelLevel, setFuelLevel] = useState(50)
  const [odometerReading, setOdometerReading] = useState('')
  const [overallCondition, setOverallCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('GOOD')
  const [damageNotes, setDamageNotes] = useState('')
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([])

  const fetchBookingAndInspection = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      // Fetch booking details
      // const bookingRes = await fetch(`/api/bookings/${bookingId}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })

      // Fetch booking details (not storing in state)
      // Determine user role - TODO: Get from token or booking data

      // Determine user role
      // TODO: Get current user ID from token decode or context

      // Fetch existing inspection
      const inspectionRes = await fetch(
        `/api/bookings/${bookingId}/inspection?type=PRE_TRIP`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (inspectionRes.ok) {
        const data = await inspectionRes.json()
        if (data.inspections && data.inspections.length > 0) {
          const inspection = data.inspections[0]
          // Load existing data
          if (inspection.checklistItems) {
            setChecklist(JSON.parse(inspection.checklistItems))
          }
          if (inspection.fuelLevel) {
            setFuelLevel(inspection.fuelLevel)
          }
          if (inspection.odometerReading) {
            setOdometerReading(inspection.odometerReading.toString())
          }
          if (inspection.overallCondition) {
            setOverallCondition(inspection.overallCondition)
          }
          if (inspection.damageNotes) {
            setDamageNotes(inspection.damageNotes)
          }
          if (inspection.photos) {
            setVehiclePhotos(JSON.parse(inspection.photos))
          }
        }
      }

      // Initialize checklist if empty
      if (checklist.length === 0) {
        const initialChecklist: ChecklistItem[] = []
        INSPECTION_CHECKLIST.forEach(category => {
          category.items.forEach(item => {
            initialChecklist.push({
              id: `${category.category}-${item}`.replace(/\s/g, '-'),
              category: category.category,
              item,
              condition: null,
              notes: '',
              photos: []
            })
          })
        })
        setChecklist(initialChecklist)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [bookingId, checklist.length, router])

  useEffect(() => {
    fetchBookingAndInspection()
  }, [fetchBookingAndInspection])

  const updateChecklistItem = (id: string, field: string, value: any) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemId?: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // TODO: Upload to Supabase Storage
    // For now, use base64 encoding for demo
    const file = files[0]
    if (!file) return
    
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      
      if (itemId) {
        // Add photo to specific checklist item
        updateChecklistItem(itemId, 'photos', [
          ...checklist.find(item => item.id === itemId)?.photos || [],
          base64
        ])
      } else {
        // Add to general vehicle photos
        setVehiclePhotos(prev => [...prev, base64])
      }
    }
    
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const token = localStorage.getItem('accessToken')

      const response = await fetch(`/api/bookings/${bookingId}/inspection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          inspectionType: 'PRE_TRIP',
          inspectorRole: userRole,
          checklistItems: checklist,
          photos: vehiclePhotos,
          fuelLevel,
          odometerReading: parseInt(odometerReading),
          damageNotes,
          overallCondition
        })
      })

      if (response.ok) {
        alert('Pre-trip inspection saved successfully!')
        router.push(`/host/bookings/${bookingId}`)
      } else {
        alert('Failed to save inspection')
      }
    } catch (error) {
      console.error('Error submitting inspection:', error)
      alert('Failed to save inspection')
    } finally {
      setSubmitting(false)
    }
  }

  const getCompletionPercentage = () => {
    const totalItems = checklist.length
    const completedItems = checklist.filter(item => item.condition !== null).length
    return Math.round((completedItems / totalItems) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading inspection form...</p>
        </div>
      </div>
    )
  }

  const completionPercentage = getCompletionPercentage()

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pre-Trip Inspection</h1>
              <p className="text-gray-600 mt-1">
                Document vehicle condition before trip starts
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{completionPercentage}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Critical Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Fuel className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Fuel Level</h3>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={fuelLevel}
              onChange={(e) => setFuelLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Empty</span>
              <span className="font-bold text-lg text-blue-600">{fuelLevel}%</span>
              <span>Full</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Gauge className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Odometer</h3>
            </div>
            <input
              type="number"
              value={odometerReading}
              onChange={(e) => setOdometerReading(e.target.value)}
              placeholder="Enter reading"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 mt-2">kilometers</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Overall Condition</h3>
            </div>
            <select
              value={overallCondition}
              onChange={(e) => setOverallCondition(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>
          </div>
        </div>

        {/* Vehicle Photos */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Photos</h3>
          <p className="text-sm text-gray-600 mb-4">
            Take photos of all angles: front, rear, both sides, interior, dashboard
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {vehiclePhotos.map((photo, index) => (
              <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={`Vehicle ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <label className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
            <Camera className="h-5 w-5" />
            <span>Add Photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handlePhotoUpload(e)}
              className="hidden"
            />
          </label>
        </div>

        {/* Inspection Checklist */}
        {INSPECTION_CHECKLIST.map((section) => (
          <div key={section.category} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Car className="h-6 w-6 text-blue-600" />
              <span>{section.category}</span>
            </h3>

            <div className="space-y-4">
              {section.items.map((item) => {
                const checklistItem = checklist.find(
                  ci => ci.category === section.category && ci.item === item
                )
                if (!checklistItem) return null

                return (
                  <div key={checklistItem.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-medium text-gray-900">{item}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateChecklistItem(checklistItem.id, 'condition', 'GOOD')}
                          className={`p-2 rounded-lg ${
                            checklistItem.condition === 'GOOD'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          title="Good"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateChecklistItem(checklistItem.id, 'condition', 'FAIR')}
                          className={`p-2 rounded-lg ${
                            checklistItem.condition === 'FAIR'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          title="Fair"
                        >
                          <AlertTriangle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateChecklistItem(checklistItem.id, 'condition', 'DAMAGED')}
                          className={`p-2 rounded-lg ${
                            checklistItem.condition === 'DAMAGED'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          title="Damaged"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {checklistItem.condition && checklistItem.condition !== 'GOOD' && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={checklistItem.notes}
                          onChange={(e) =>
                            updateChecklistItem(checklistItem.id, 'notes', e.target.value)
                          }
                          placeholder="Describe the issue or damage..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="flex items-center space-x-2 text-sm text-blue-600 cursor-pointer">
                          <Camera className="h-4 w-4" />
                          <span>Add photo of damage</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e, checklistItem.id)}
                            className="hidden"
                          />
                        </label>
                        {checklistItem.photos.length > 0 && (
                          <div className="flex space-x-2">
                            {checklistItem.photos.map((photo, idx) => (
                              <div key={idx} className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={photo} alt={`Damage ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Additional Notes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h3>
          <textarea
            value={damageNotes}
            onChange={(e) => setDamageNotes(e.target.value)}
            placeholder="Any additional observations or concerns..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || completionPercentage < 100}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Complete Inspection</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
