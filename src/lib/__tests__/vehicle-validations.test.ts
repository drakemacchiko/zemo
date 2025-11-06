import { describe, it, expect } from '@jest/globals'
import { vehicleCreateSchema, vehicleUpdateSchema, vehicleSearchSchema } from '@/lib/validations'

describe('Vehicle Validation Schemas', () => {
  describe('vehicleCreateSchema', () => {
    const validVehicleData = {
      plateNumber: 'ABC123ZM',
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'White',
      vehicleType: 'SEDAN',
      transmission: 'AUTOMATIC',
      fuelType: 'PETROL',
      seatingCapacity: 5,
      dailyRate: 150.0,
      securityDeposit: 1000.0,
      currentMileage: 50000,
      locationLatitude: -15.3875,
      locationLongitude: 28.3228,
      locationAddress: 'Lusaka, Zambia',
    } as const

    it('should accept valid vehicle data', () => {
      const result = vehicleCreateSchema.safeParse(validVehicleData)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const invalidData = { ...validVehicleData }
      delete (invalidData as any).plateNumber

      const result = vehicleCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid vehicle type', () => {
      const invalidData = {
        ...validVehicleData,
        vehicleType: 'INVALID_TYPE',
      }

      const result = vehicleCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid year', () => {
      const invalidData = {
        ...validVehicleData,
        year: 1800, // Too old
      }

      const result = vehicleCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative rates', () => {
      const invalidData = {
        ...validVehicleData,
        dailyRate: -10,
      }

      const result = vehicleCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid coordinates', () => {
      const invalidData = {
        ...validVehicleData,
        locationLatitude: 100, // Invalid latitude
      }

      const result = vehicleCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept optional fields', () => {
      const dataWithOptionals = {
        ...validVehicleData,
        engineNumber: 'ENG123456',
        chassisNumber: 'CHS789456',
        weeklyRate: 1000.0,
        monthlyRate: 4000.0,
        fuelTankCapacity: 50.0,
        features: ['Air Conditioning', 'Bluetooth'],
      }

      const result = vehicleCreateSchema.safeParse(dataWithOptionals)
      expect(result.success).toBe(true)
    })
  })

  describe('vehicleUpdateSchema', () => {
    it('should accept partial update data', () => {
      const updateData = {
        dailyRate: 175.0,
        color: 'Blue',
      }

      const result = vehicleUpdateSchema.safeParse(updateData)
      expect(result.success).toBe(true)
    })

    it('should reject plateNumber in update', () => {
      const updateData = {
        plateNumber: 'NEW123ZM', // Should not be updatable
        dailyRate: 175.0,
      }

      const result = vehicleUpdateSchema.safeParse(updateData)
      expect(result.success).toBe(true) // plateNumber is omitted from schema
      if (result.success) {
        expect(result.data).not.toHaveProperty('plateNumber')
      }
    })

    it('should accept empty update object', () => {
      const result = vehicleUpdateSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('vehicleSearchSchema', () => {
    it('should accept basic search parameters', () => {
      const searchData = {
        make: 'Toyota',
        vehicleType: 'SEDAN',
        minDailyRate: 100,
        maxDailyRate: 200,
      } as const

      const result = vehicleSearchSchema.safeParse(searchData)
      expect(result.success).toBe(true)
    })

    it('should apply default values', () => {
      const searchData = {}

      const result = vehicleSearchSchema.safeParse(searchData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
        expect(result.data.radius).toBe(50)
      }
    })

    it('should validate location coordinates', () => {
      const searchData = {
        locationLatitude: -15.3875,
        locationLongitude: 28.3228,
        radius: 25,
      }

      const result = vehicleSearchSchema.safeParse(searchData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid pagination values', () => {
      const searchData = {
        page: 0, // Invalid page
        limit: 100, // Exceeds max limit
      }

      const result = vehicleSearchSchema.safeParse(searchData)
      expect(result.success).toBe(false)
    })

    it('should accept all filter combinations', () => {
      const searchData = {
        make: 'Toyota',
        model: 'Corolla',
        vehicleType: 'SEDAN',
        transmission: 'AUTOMATIC',
        fuelType: 'PETROL',
        minDailyRate: 100,
        maxDailyRate: 300,
        minSeatingCapacity: 4,
        locationLatitude: -15.3875,
        locationLongitude: 28.3228,
        radius: 30,
        page: 2,
        limit: 10,
      } as const

      const result = vehicleSearchSchema.safeParse(searchData)
      expect(result.success).toBe(true)
    })
  })
})