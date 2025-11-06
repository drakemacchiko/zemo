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

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>
export type DrivingLicenseInput = z.infer<typeof drivingLicenseSchema>