import { z } from 'zod'

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// Phone number validation (Zambian format)
export const phoneSchema = z
  .string()
  .regex(/^(\+260|0)[1-9]\d{8}$/, 'Invalid Zambian phone number format')

// Registration schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: passwordSchema,
  phoneNumber: phoneSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
})

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// OTP verification schema
export const verifyOtpSchema = z.object({
  phoneNumber: phoneSchema,
  otpCode: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
})

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(50).optional(),
})

// Document upload schema
export const documentUploadSchema = z.object({
  documentType: z.enum(['PROFILE_PICTURE', 'DRIVING_LICENSE', 'NATIONAL_ID']),
})

// Driving license schema
export const drivingLicenseSchema = z.object({
  licenseNumber: z.string().min(1, 'License number is required'),
  issueDate: z.string().datetime('Invalid issue date'),
  expiryDate: z.string().datetime('Invalid expiry date'),
  licenseClass: z.string().min(1, 'License class is required'),
})

// Vehicle schemas
export const vehicleCreateSchema = z.object({
  plateNumber: z.string().min(1, 'Plate number is required').max(20, 'Plate number too long'),
  engineNumber: z.string().optional(),
  chassisNumber: z.string().optional(),
  make: z.string().min(1, 'Make is required').max(50, 'Make too long'),
  model: z.string().min(1, 'Model is required').max(50, 'Model too long'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1, 'Invalid year'),
  color: z.string().min(1, 'Color is required').max(30, 'Color too long'),
  vehicleType: z.enum(['SEDAN', 'SUV', 'HATCHBACK', 'PICKUP', 'VAN', 'COUPE', 'CONVERTIBLE', 'WAGON']),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']),
  fuelType: z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']),
  seatingCapacity: z.number().int().min(1).max(50, 'Invalid seating capacity'),
  dailyRate: z.number().positive('Daily rate must be positive'),
  weeklyRate: z.number().positive('Weekly rate must be positive').optional(),
  monthlyRate: z.number().positive('Monthly rate must be positive').optional(),
  securityDeposit: z.number().positive('Security deposit must be positive'),
  currentMileage: z.number().int().min(0, 'Mileage cannot be negative'),
  fuelTankCapacity: z.number().positive('Fuel tank capacity must be positive').optional(),
  locationLatitude: z.number().min(-90).max(90, 'Invalid latitude'),
  locationLongitude: z.number().min(-180).max(180, 'Invalid longitude'),
  locationAddress: z.string().min(1, 'Location address is required').max(200, 'Address too long'),
  features: z.array(z.string()).optional(),
})

export const vehicleUpdateSchema = vehicleCreateSchema.partial().omit({ plateNumber: true })

export const vehicleSearchSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  vehicleType: z.enum(['SEDAN', 'SUV', 'HATCHBACK', 'PICKUP', 'VAN', 'COUPE', 'CONVERTIBLE', 'WAGON']).optional(),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']).optional(),
  fuelType: z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']).optional(),
  minDailyRate: z.number().positive().optional(),
  maxDailyRate: z.number().positive().optional(),
  minSeatingCapacity: z.number().int().min(1).optional(),
  locationLatitude: z.number().min(-90).max(90).optional(),
  locationLongitude: z.number().min(-180).max(180).optional(),
  radius: z.number().positive().default(50), // Default 50km radius
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})

export const vehicleDocumentSchema = z.object({
  documentType: z.enum(['LOGBOOK', 'INSURANCE', 'ROAD_TAX', 'INSPECTION']),
  documentNumber: z.string().optional(),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  documentUrl: z.string().url('Invalid document URL'),
})

export const vehiclePhotoSchema = z.object({
  photoUrl: z.string().url('Invalid photo URL'),
  photoType: z.enum(['EXTERIOR_FRONT', 'EXTERIOR_REAR', 'EXTERIOR_LEFT', 'EXTERIOR_RIGHT', 'INTERIOR_FRONT', 'INTERIOR_REAR', 'DASHBOARD', 'ENGINE', 'OTHER']),
  isPrimary: z.boolean().default(false),
})

export const vehiclePhotoUploadSchema = z.object({
  photos: z.array(vehiclePhotoSchema).min(1, 'At least one photo is required').max(20, 'Maximum 20 photos allowed'),
})

export const adminVehicleActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().optional(),
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>
export type DrivingLicenseInput = z.infer<typeof drivingLicenseSchema>
export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>
export type VehicleSearchInput = z.infer<typeof vehicleSearchSchema>
export type VehicleDocumentInput = z.infer<typeof vehicleDocumentSchema>
export type VehiclePhotoInput = z.infer<typeof vehiclePhotoSchema>
export type VehiclePhotoUploadInput = z.infer<typeof vehiclePhotoUploadSchema>
export type AdminVehicleActionInput = z.infer<typeof adminVehicleActionSchema>