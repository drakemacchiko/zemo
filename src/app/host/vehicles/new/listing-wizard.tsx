'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  X,
  AlertCircle
} from 'lucide-react'

// Types for form data
interface VehicleListingData {
  // Step 1: Vehicle Details
  vin?: string
  plateNumber: string
  registrationNumber?: string
  year: number | ''
  make: string
  model: string
  trim?: string
  engineNumber?: string
  chassisNumber?: string
  transmission: string
  fuelType: string
  seatingCapacity: number | ''
  numberOfDoors?: number | ''
  color: string
  currentMileage: number | ''
  
  // Step 2: Category & Features
  vehicleCategory?: string
  vehicleType: string
  features: string[]
  customFeatures?: string
  
  // Step 3: Location & Delivery
  locationAddress: string
  locationCity?: string
  locationProvince?: string
  locationPostalCode?: string
  locationLatitude: number | ''
  locationLongitude: number | ''
  hideExactLocation: boolean
  deliveryAvailable: boolean
  deliveryRadius?: number | ''
  deliveryFeePerKm?: number | ''
  airportDelivery: boolean
  airportDeliveryFee?: number | ''
  pickupInstructions?: string
  
  // Step 4: Availability & Scheduling
  alwaysAvailable: boolean
  advanceNoticeHours: number
  shortestTripDuration: number
  longestTripDuration?: number | ''
  instantBooking: boolean
  minRenterRating?: number | ''
  minRenterTrips?: number | ''
  
  // Step 5: Pricing
  dailyRate: number | ''
  hourlyRate?: number | ''
  weeklyDiscount?: number | ''
  monthlyDiscount?: number | ''
  weekendPricing?: number | ''
  securityDeposit: number | ''
  mileageAllowance?: number | ''
  extraMileageFee?: number | ''
  fuelPolicy?: string
  lateReturnFee?: number | ''
  cleaningFee?: number | ''
  
  // Step 6: Insurance
  insurancePolicyNumber?: string
  insuranceCoverage?: string
  
  // Step 7: Rules & Requirements
  minDriverAge: number
  minDrivingExperience: number
  additionalDriverFee?: number | ''
  smokingAllowed: boolean
  smokingFee?: number | ''
  petsAllowed: boolean
  petFee?: number | ''
  usageRestrictions: string[]
  customRules?: string
  
  // Step 10: Description
  title?: string
  description?: string
}

const STEPS = [
  { number: 1, title: 'Vehicle Details', required: true },
  { number: 2, title: 'Category & Features', required: true },
  { number: 3, title: 'Location & Delivery', required: true },
  { number: 4, title: 'Availability', required: true },
  { number: 5, title: 'Pricing', required: true },
  { number: 6, title: 'Insurance', required: true },
  { number: 7, title: 'Rules', required: true },
  { number: 8, title: 'Documents', required: true },
  { number: 9, title: 'Photos', required: true },
  { number: 10, title: 'Description', required: false },
  { number: 11, title: 'Review & Publish', required: true }
]

const POPULAR_MAKES = [
  'Toyota', 'Nissan', 'Honda', 'Mazda', 'Suzuki', 'Mitsubishi',
  'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet',
  'Hyundai', 'Kia', 'Peugeot', 'Renault', 'Isuzu', 'Other'
]

const VEHICLE_CATEGORIES = [
  'ECONOMY', 'COMPACT', 'MIDSIZE', 'FULL_SIZE', 'SUV',
  'LUXURY', 'SPORTS', 'VAN', 'TRUCK', 'ELECTRIC'
]

const STANDARD_FEATURES = [
  'Air conditioning', 'Bluetooth/AUX', 'Backup camera', 'Parking sensors',
  'GPS/Navigation', 'USB charger', 'Heated seats', 'Sunroof/Moonroof',
  'Leather seats', 'All-wheel drive', 'Keyless entry', 'Apple CarPlay/Android Auto',
  'Bike rack', 'Ski rack', 'Toll pass', 'Dash cam', 'Child seat available'
]

interface VehicleListingWizardProps {
  editMode?: boolean;
  vehicleId?: string;
  initialData?: any;
}

export default function VehicleListingWizard({ editMode = false, vehicleId, initialData }: VehicleListingWizardProps = {}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const [formData, setFormData] = useState<VehicleListingData>({
    // Default values
    plateNumber: '',
    year: '',
    make: '',
    model: '',
    transmission: '',
    fuelType: '',
    seatingCapacity: '',
    color: '',
    currentMileage: '',
    vehicleType: '',
    features: [],
    locationAddress: '',
    locationLatitude: '',
    locationLongitude: '',
    hideExactLocation: true,
    deliveryAvailable: false,
    airportDelivery: false,
    alwaysAvailable: true,
    advanceNoticeHours: 24,
    shortestTripDuration: 1,
    instantBooking: false,
    dailyRate: '',
    securityDeposit: '',
    minDriverAge: 21,
    minDrivingExperience: 2,
    smokingAllowed: false,
    petsAllowed: false,
    usageRestrictions: []
  })

  const saveDraft = useCallback(async () => {
    try {
      setSaving(true)
      localStorage.setItem('vehicleListingDraft', JSON.stringify(formData))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setSaving(false)
    }
  }, [formData])

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('vehicleListingDraft')
      if (draft) {
        const parsedDraft = JSON.parse(draft)
        setFormData(parsedDraft)
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
  }

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft()
    }, 30000)
    return () => clearInterval(interval)
  }, [formData, saveDraft])

  // Load draft on mount or initialize with edit data
  useEffect(() => {
    if (editMode && initialData) {
      // Map initial data to form structure
      setFormData({
        plateNumber: initialData.plateNumber || '',
        year: initialData.year || '',
        make: initialData.make || '',
        model: initialData.model || '',
        trim: initialData.trim,
        transmission: initialData.transmission || '',
        fuelType: initialData.fuelType || '',
        seatingCapacity: initialData.seatingCapacity || '',
        numberOfDoors: initialData.numberOfDoors,
        color: initialData.color || '',
        currentMileage: initialData.currentMileage || '',
        vin: initialData.vin,
        registrationNumber: initialData.registrationNumber,
        engineNumber: initialData.engineNumber,
        chassisNumber: initialData.chassisNumber,
        vehicleCategory: initialData.vehicleCategory,
        vehicleType: initialData.vehicleType || '',
        features: initialData.features || [],
        customFeatures: initialData.customFeatures,
        locationAddress: initialData.locationAddress || '',
        locationCity: initialData.locationCity,
        locationProvince: initialData.locationProvince,
        locationPostalCode: initialData.locationPostalCode,
        locationLatitude: initialData.locationLatitude || '',
        locationLongitude: initialData.locationLongitude || '',
        hideExactLocation: initialData.hideExactLocation !== false,
        deliveryAvailable: initialData.deliveryAvailable || false,
        deliveryRadius: initialData.deliveryRadius,
        deliveryFeePerKm: initialData.deliveryFeePerKm,
        airportDelivery: initialData.airportDelivery || false,
        airportDeliveryFee: initialData.airportDeliveryFee,
        pickupInstructions: initialData.pickupInstructions,
        alwaysAvailable: initialData.alwaysAvailable !== false,
        advanceNoticeHours: initialData.advanceNoticeHours || 24,
        shortestTripDuration: initialData.shortestTripDuration || 1,
        longestTripDuration: initialData.longestTripDuration,
        instantBooking: initialData.instantBooking || false,
        minRenterRating: initialData.minRenterRating,
        minRenterTrips: initialData.minRenterTrips,
        dailyRate: initialData.dailyRate || '',
        hourlyRate: initialData.hourlyRate,
        weeklyDiscount: initialData.weeklyDiscount,
        monthlyDiscount: initialData.monthlyDiscount,
        weekendPricing: initialData.weekendPricing,
        securityDeposit: initialData.securityDeposit || '',
        mileageAllowance: initialData.mileageAllowance,
        extraMileageFee: initialData.extraMileageFee,
        fuelPolicy: initialData.fuelPolicy,
        lateReturnFee: initialData.lateReturnFee,
        cleaningFee: initialData.cleaningFee,
        insurancePolicyNumber: initialData.insurancePolicyNumber,
        insuranceCoverage: initialData.insuranceCoverage,
        minDriverAge: initialData.minDriverAge || 21,
        minDrivingExperience: initialData.minDrivingExperience || 2,
        additionalDriverFee: initialData.additionalDriverFee,
        smokingAllowed: initialData.smokingAllowed || false,
        smokingFee: initialData.smokingFee,
        petsAllowed: initialData.petsAllowed || false,
        petFee: initialData.petFee,
        usageRestrictions: initialData.usageRestrictions || [],
        customRules: initialData.customRules,
        title: initialData.title,
        description: initialData.description,
      });
    } else {
      loadDraft();
    }
  }, [editMode, initialData])

  const clearDraft = () => {
    localStorage.removeItem('vehicleListingDraft')
  }

  const handleInputChange = (field: keyof VehicleListingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    setError('')
    
    switch (step) {
      case 1:
        if (!formData.plateNumber || !formData.make || !formData.model || 
            !formData.year || !formData.transmission || !formData.fuelType ||
            !formData.seatingCapacity || !formData.color || !formData.currentMileage) {
          setError('Please fill in all required fields')
          return false
        }
        break
      case 2:
        if (!formData.vehicleType) {
          setError('Please select a vehicle type')
          return false
        }
        break
      case 3:
        if (!formData.locationAddress) {
          setError('Please enter the vehicle location')
          return false
        }
        break
      case 5:
        if (!formData.dailyRate || !formData.securityDeposit) {
          setError('Please set daily rate and security deposit')
          return false
        }
        break
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1)
        window.scrollTo(0, 0)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const goToStep = (step: number) => {
    if (step <= currentStep || step === currentStep + 1) {
      setCurrentStep(step)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const url = editMode && vehicleId 
        ? `/api/vehicles/${vehicleId}` 
        : '/api/host/vehicles';
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${editMode ? 'update' : 'create'} vehicle listing`)
      }

      const data = await response.json()
      if (!editMode) {
        clearDraft()
      }
      router.push(`/host/vehicles/${editMode ? vehicleId : data.vehicle.id}`)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1VehicleDetails formData={formData} onChange={handleInputChange} />
      case 2:
        return <Step2CategoryFeatures formData={formData} onChange={handleInputChange} />
      case 3:
        return <Step3Location formData={formData} onChange={handleInputChange} />
      case 4:
        return <Step4Availability formData={formData} onChange={handleInputChange} />
      case 5:
        return <Step5Pricing formData={formData} onChange={handleInputChange} />
      case 6:
        return <Step6Insurance formData={formData} onChange={handleInputChange} />
      case 7:
        return <Step7Rules formData={formData} onChange={handleInputChange} />
      case 8:
        return <Step8Documents />
      case 9:
        return <Step9Photos />
      case 10:
        return <Step10Description formData={formData} onChange={handleInputChange} />
      case 11:
        return <Step11Review formData={formData} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{editMode ? 'Edit Vehicle' : 'List Your Vehicle'}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title || ''}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  {saving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
                </span>
              )}
              <button
                onClick={() => {
                  saveDraft()
                  router.push('/host/vehicles')
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => goToStep(step.number)}
                  disabled={step.number > currentStep + 1}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                    step.number < currentStep
                      ? 'bg-green-600 text-white'
                      : step.number === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  } ${step.number <= currentStep + 1 ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                >
                  {step.number < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`w-12 h-1 mx-2 ${step.number < currentStep ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map(step => (
              <div key={step.number} className="text-xs text-gray-600 w-10 text-center">
                {step.title.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </button>

            <button
              onClick={saveDraft}
              className="flex items-center px-6 py-2 text-blue-600 hover:text-blue-700"
            >
              <Save className="h-5 w-5 mr-2" />
              Save & Exit
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (editMode ? 'Saving...' : 'Publishing...') : (editMode ? 'Save Changes' : 'Publish Listing')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Step Components will be defined next
function Step1VehicleDetails({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Vehicle Details</h2>
        <p className="text-gray-600">Enter basic information about your vehicle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            VIN Number <span className="text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.vin || ''}
            onChange={(e) => onChange('vin', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter VIN"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Plate Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.plateNumber}
            onChange={(e) => onChange('plateNumber', e.target.value.toUpperCase())}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ABC 1234"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.year}
            onChange={(e) => onChange('year', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select year</option>
            {Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Make <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.make}
            onChange={(e) => onChange('make', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select make</option>
            {POPULAR_MAKES.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => onChange('model', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Corolla"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trim <span className="text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.trim || ''}
            onChange={(e) => onChange('trim', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., XLE, Sport"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transmission <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.transmission}
            onChange={(e) => onChange('transmission', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select transmission</option>
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuel Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.fuelType}
            onChange={(e) => onChange('fuelType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select fuel type</option>
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ELECTRIC">Electric</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seating Capacity <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.seatingCapacity}
            onChange={(e) => onChange('seatingCapacity', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select capacity</option>
            {[2, 4, 5, 6, 7, 8, 9].map(num => (
              <option key={num} value={num}>{num} seats</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Doors
          </label>
          <select
            value={formData.numberOfDoors || ''}
            onChange={(e) => onChange('numberOfDoors', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select doors</option>
            <option value="2">2 doors</option>
            <option value="4">4 doors</option>
            <option value="5">5 doors</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => onChange('color', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., White, Black, Silver"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Mileage (km) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.currentMileage}
            onChange={(e) => onChange('currentMileage', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            min="0"
            required
          />
        </div>
      </div>
    </div>
  )
}

function Step2CategoryFeatures({ formData, onChange }: any) {
  const toggleFeature = (feature: string) => {
    const currentFeatures = formData.features || []
    if (currentFeatures.includes(feature)) {
      onChange('features', currentFeatures.filter((f: string) => f !== feature))
    } else {
      onChange('features', [...currentFeatures, feature])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Category & Features</h2>
        <p className="text-gray-600">Help renters find your vehicle by selecting the right category and features</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vehicle Category
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {VEHICLE_CATEGORIES.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => onChange('vehicleCategory', category)}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                formData.vehicleCategory === category
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {category.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vehicle Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.vehicleType}
          onChange={(e) => onChange('vehicleType', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select type</option>
          <option value="SEDAN">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="HATCHBACK">Hatchback</option>
          <option value="PICKUP">Pickup</option>
          <option value="VAN">Van</option>
          <option value="COUPE">Coupe</option>
          <option value="CONVERTIBLE">Convertible</option>
          <option value="WAGON">Wagon</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Features (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STANDARD_FEATURES.map(feature => (
            <label key={feature} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.features?.includes(feature) || false}
                onChange={() => toggleFeature(feature)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">{feature}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Features <span className="text-gray-500">(Optional)</span>
        </label>
        <textarea
          value={formData.customFeatures || ''}
          onChange={(e) => onChange('customFeatures', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add any additional features not listed above"
        />
      </div>
    </div>
  )
}

// Continue with remaining step components...
// Due to length, I'll create them in separate files

function Step3Location({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Location & Delivery</h2>
        <p className="text-gray-600">Where can renters pick up your vehicle?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.locationAddress}
          onChange={(e) => onChange('locationAddress', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter address"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={formData.locationCity || ''}
            onChange={(e) => onChange('locationCity', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Lusaka"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
          <input
            type="text"
            value={formData.locationProvince || ''}
            onChange={(e) => onChange('locationProvince', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Lusaka"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
          <input
            type="text"
            value={formData.locationPostalCode || ''}
            onChange={(e) => onChange('locationPostalCode', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="10101"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.hideExactLocation}
          onChange={(e) => onChange('hideExactLocation', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-3 text-sm text-gray-700">
          Hide exact address until booking is confirmed (recommended)
        </label>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.deliveryAvailable}
              onChange={(e) => onChange('deliveryAvailable', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-3 text-sm text-gray-700">
              Offer delivery (deliver vehicle to renter)
            </label>
          </div>

          {formData.deliveryAvailable && (
            <div className="ml-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Radius (km)
                  </label>
                  <input
                    type="number"
                    value={formData.deliveryRadius || ''}
                    onChange={(e) => onChange('deliveryRadius', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee per km (ZMW)
                  </label>
                  <input
                    type="number"
                    value={formData.deliveryFeePerKm || ''}
                    onChange={(e) => onChange('deliveryFeePerKm', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.airportDelivery}
              onChange={(e) => onChange('airportDelivery', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-3 text-sm text-gray-700">
              Offer airport delivery/pickup
            </label>
          </div>

          {formData.airportDelivery && (
            <div className="ml-7">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Airport Delivery Fee (ZMW)
              </label>
              <input
                type="number"
                value={formData.airportDeliveryFee || ''}
                onChange={(e) => onChange('airportDeliveryFee', parseFloat(e.target.value))}
                className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
                min="0"
                step="0.01"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pickup Instructions <span className="text-gray-500">(Optional)</span>
        </label>
        <textarea
          value={formData.pickupInstructions || ''}
          onChange={(e) => onChange('pickupInstructions', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Where to meet, what to bring, parking instructions, etc."
        />
      </div>
    </div>
  )
}

// Placeholder components for remaining steps
function Step4Availability({ formData: _formData, onChange: _onChange }: any) {
  return <div className="text-center py-12 text-gray-500">Step 4: Availability & Scheduling (Component to be implemented)</div>
}

function Step5Pricing({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Pricing</h2>
        <p className="text-gray-600">Set competitive rates for your vehicle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Daily Rate (ZMW) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.dailyRate}
            onChange={(e) => onChange('dailyRate', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="200"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Security Deposit (ZMW) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.securityDeposit}
            onChange={(e) => onChange('securityDeposit', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="500"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>
    </div>
  )
}

function Step6Insurance({ formData: _formData, onChange: _onChange }: any) {
  return <div className="text-center py-12 text-gray-500">Step 6: Insurance & Protection (Component to be implemented)</div>
}

function Step7Rules({ formData: _formData, onChange: _onChange }: any) {
  return <div className="text-center py-12 text-gray-500">Step 7: Rules & Requirements (Component to be implemented)</div>
}

function Step8Documents() {
  return <div className="text-center py-12 text-gray-500">Step 8: Documents Upload (Component to be implemented)</div>
}

function Step9Photos() {
  return <div className="text-center py-12 text-gray-500">Step 9: Photos Upload (Component to be implemented)</div>
}

function Step10Description({ formData: _formData, onChange: _onChange }: any) {
  return <div className="text-center py-12 text-gray-500">Step 10: Description (Component to be implemented)</div>
}

function Step11Review({ formData: _formData }: any) {
  return <div className="text-center py-12 text-gray-500">Step 11: Review & Publish (Component to be implemented)</div>
}
