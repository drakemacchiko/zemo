import { z } from 'zod';

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Phone number validation (Zambian format)
export const phoneSchema = z
  .string()
  .regex(/^(\+260|0)[1-9]\d{8}$/, 'Invalid Zambian phone number format');

// Registration schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: passwordSchema,
  phoneNumber: phoneSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// OTP verification schema
export const verifyOtpSchema = z.object({
  phoneNumber: phoneSchema,
  otpCode: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(50).optional(),
});

// Document upload schema
export const documentUploadSchema = z.object({
  documentType: z.enum(['PROFILE_PICTURE', 'DRIVING_LICENSE', 'NATIONAL_ID']),
});

// Driving license schema
export const drivingLicenseSchema = z.object({
  licenseNumber: z.string().min(1, 'License number is required'),
  issueDate: z.string().datetime('Invalid issue date'),
  expiryDate: z.string().datetime('Invalid expiry date'),
  licenseClass: z.string().min(1, 'License class is required'),
});

// Vehicle schemas
export const vehicleCreateSchema = z.object({
  plateNumber: z.string().min(1, 'Plate number is required').max(20, 'Plate number too long'),
  engineNumber: z.string().optional(),
  chassisNumber: z.string().optional(),
  make: z.string().min(1, 'Make is required').max(50, 'Make too long'),
  model: z.string().min(1, 'Model is required').max(50, 'Model too long'),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1, 'Invalid year'),
  color: z.string().min(1, 'Color is required').max(30, 'Color too long'),
  vehicleType: z.enum([
    'SEDAN',
    'SUV',
    'HATCHBACK',
    'PICKUP',
    'VAN',
    'COUPE',
    'CONVERTIBLE',
    'WAGON',
  ]),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']),
  fuelType: z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']),
  seatingCapacity: z.number().int().min(1).max(50, 'Invalid seating capacity'),
  dailyRate: z.number().positive('Daily rate must be positive'),
  weeklyRate: z.number().positive('Weekly rate must be positive').optional(),
  monthlyRate: z.number().positive('Monthly rate must be positive').optional(),
  // Allow zero security deposit (hosts may set 0)
  securityDeposit: z.number().min(0, 'Security deposit must be 0 or greater'),
  currentMileage: z.number().int().min(0, 'Mileage cannot be negative'),
  fuelTankCapacity: z.number().positive('Fuel tank capacity must be positive').optional(),
  locationLatitude: z.number().min(-90).max(90, 'Invalid latitude'),
  locationLongitude: z.number().min(-180).max(180, 'Invalid longitude'),
  locationAddress: z.string().min(1, 'Location address is required').max(200, 'Address too long'),
  features: z.array(z.string()).optional(),
});

export const vehicleUpdateSchema = vehicleCreateSchema.partial().omit({ plateNumber: true });

export const vehicleSearchSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  vehicleType: z
    .enum(['SEDAN', 'SUV', 'HATCHBACK', 'PICKUP', 'VAN', 'COUPE', 'CONVERTIBLE', 'WAGON'])
    .optional(),
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
});

export const vehicleDocumentSchema = z.object({
  documentType: z.enum(['LOGBOOK', 'INSURANCE', 'ROAD_TAX', 'INSPECTION']),
  documentNumber: z.string().optional(),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  documentUrl: z.string().url('Invalid document URL'),
});

export const vehiclePhotoSchema = z.object({
  photoUrl: z.string().url('Invalid photo URL'),
  photoType: z.enum([
    'EXTERIOR_FRONT',
    'EXTERIOR_REAR',
    'EXTERIOR_LEFT',
    'EXTERIOR_RIGHT',
    'INTERIOR_FRONT',
    'INTERIOR_REAR',
    'DASHBOARD',
    'ENGINE',
    'OTHER',
  ]),
  isPrimary: z.boolean().default(false),
});

export const vehiclePhotoUploadSchema = z.object({
  photos: z
    .array(vehiclePhotoSchema)
    .min(1, 'At least one photo is required')
    .max(20, 'Maximum 20 photos allowed'),
});

export const adminVehicleActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().optional(),
});

// Booking schemas
export const bookingCreateSchema = z
  .object({
    vehicleId: z.string().cuid('Invalid vehicle ID'),
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date'),
    pickupLocation: z.string().max(200, 'Pickup location too long').optional(),
    dropoffLocation: z.string().max(200, 'Dropoff location too long').optional(),
    specialRequests: z.string().max(500, 'Special requests too long').optional(),
    insuranceId: z.string().cuid('Invalid insurance ID').optional(),
    insuranceCoverageAmount: z
      .number()
      .positive('Insurance coverage amount must be positive')
      .optional(),
  })
  .refine(
    data => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const now = new Date();

      // Start date must be in the future (at least 1 hour from now)
      if (start <= new Date(now.getTime() + 60 * 60 * 1000)) {
        return false;
      }

      // End date must be after start date
      if (end <= start) {
        return false;
      }

      // Maximum booking duration (90 days)
      const maxDuration = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
      if (end.getTime() - start.getTime() > maxDuration) {
        return false;
      }

      // If insuranceId is provided, coverageAmount should also be provided
      if (data.insuranceId && !data.insuranceCoverageAmount) {
        return false;
      }

      return true;
    },
    {
      message:
        'Invalid booking data. Check dates, duration (max 90 days), and insurance requirements.',
    }
  );

export const bookingUpdateSchema = z
  .object({
    startDate: z.string().datetime('Invalid start date').optional(),
    endDate: z.string().datetime('Invalid end date').optional(),
    pickupLocation: z.string().max(200, 'Pickup location too long').optional(),
    dropoffLocation: z.string().max(200, 'Dropoff location too long').optional(),
    specialRequests: z.string().max(500, 'Special requests too long').optional(),
    status: z
      .enum(['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'])
      .optional(),
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        if (end <= start) {
          return false;
        }

        // Maximum booking duration (90 days)
        const maxDuration = 90 * 24 * 60 * 60 * 1000;
        if (end.getTime() - start.getTime() > maxDuration) {
          return false;
        }
      }

      return true;
    },
    {
      message:
        'Invalid booking dates. End date must be after start date and maximum duration is 90 days.',
    }
  );

export const bookingSearchSchema = z.object({
  status: z
    .enum(['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'])
    .optional(),
  vehicleId: z.string().cuid().optional(),
  hostId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export const availabilityCheckSchema = z
  .object({
    vehicleId: z.string().cuid('Invalid vehicle ID'),
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date'),
  })
  .refine(
    data => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      return end > start;
    },
    {
      message: 'End date must be after start date',
    }
  );

// Insurance schemas
export const insuranceProductSchema = z.object({
  name: z.string().min(1, 'Insurance name is required').max(100, 'Insurance name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  coverageType: z.enum(['BASIC', 'COMPREHENSIVE', 'PREMIUM']),
  maxCoverageAmount: z.number().positive('Maximum coverage amount must be positive'),
  deductibleAmount: z.number().min(0, 'Deductible amount cannot be negative'),
  accidentCoverage: z.boolean().default(true),
  theftCoverage: z.boolean().default(false),
  vandalismCoverage: z.boolean().default(false),
  naturalDisasterCoverage: z.boolean().default(false),
  thirdPartyCoverage: z.boolean().default(true),
  dailyRate: z.number().positive('Daily rate must be positive'),
  weeklyRate: z.number().positive('Weekly rate must be positive').optional(),
  monthlyRate: z.number().positive('Monthly rate must be positive').optional(),
  insuranceProvider: z.string().min(1, 'Insurance provider is required').default('ZEMO_PARTNER'),
  policyTermsUrl: z.string().url('Invalid policy terms URL').optional(),
});

export const insuranceSelectionSchema = z.object({
  insuranceId: z.string().cuid('Invalid insurance ID'),
  coverageAmount: z.number().positive('Coverage amount must be positive').optional(),
});

export const policyCreateSchema = z.object({
  bookingId: z.string().cuid('Invalid booking ID'),
  insuranceId: z.string().cuid('Invalid insurance ID'),
  coverageAmount: z.number().positive('Coverage amount must be positive'),
});

// Claims schemas
export const claimCreateSchema = z
  .object({
    policyId: z.string().cuid('Invalid policy ID'),
    incidentDate: z.string().datetime('Invalid incident date'),
    incidentLocation: z
      .string()
      .min(1, 'Incident location is required')
      .max(200, 'Incident location too long'),
    incidentDescription: z
      .string()
      .min(10, 'Incident description must be at least 10 characters')
      .max(1000, 'Incident description too long'),
    claimType: z.enum([
      'ACCIDENT',
      'THEFT',
      'VANDALISM',
      'NATURAL_DISASTER',
      'MECHANICAL',
      'THIRD_PARTY',
    ]),
    estimatedDamageAmount: z
      .number()
      .positive('Estimated damage amount must be positive')
      .optional(),
    policeReportNumber: z.string().max(50, 'Police report number too long').optional(),
  })
  .refine(
    data => {
      const incidentDate = new Date(data.incidentDate);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Incident date cannot be in the future
      if (incidentDate > now) {
        return false;
      }

      // Incident date cannot be more than 30 days ago
      if (incidentDate < thirtyDaysAgo) {
        return false;
      }

      return true;
    },
    {
      message: 'Incident date must be within the last 30 days and cannot be in the future',
    }
  );

export const claimUpdateSchema = z.object({
  incidentDescription: z
    .string()
    .min(10, 'Incident description must be at least 10 characters')
    .max(1000, 'Incident description too long')
    .optional(),
  estimatedDamageAmount: z.number().positive('Estimated damage amount must be positive').optional(),
  actualDamageAmount: z.number().positive('Actual damage amount must be positive').optional(),
  policeReportNumber: z.string().max(50, 'Police report number too long').optional(),
  status: z
    .enum([
      'SUBMITTED',
      'UNDER_REVIEW',
      'INVESTIGATING',
      'APPROVED',
      'REJECTED',
      'SETTLED',
      'CLOSED',
    ])
    .optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
});

export const adminClaimActionSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'INVESTIGATING', 'APPROVED', 'REJECTED', 'SETTLED', 'CLOSED']),
  reviewNotes: z.string().max(1000, 'Review notes too long').optional(),
  actualDamageAmount: z.number().positive('Actual damage amount must be positive').optional(),
  settlementAmount: z.number().positive('Settlement amount must be positive').optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
});

export const claimDocumentUploadSchema = z.object({
  documentType: z.enum([
    'PHOTOS',
    'POLICE_REPORT',
    'MEDICAL_REPORT',
    'REPAIR_INVOICE',
    'RECEIPT',
    'WITNESS_STATEMENT',
    'OTHER',
  ]),
  description: z.string().max(200, 'Description too long').optional(),
});

export const claimSearchSchema = z.object({
  status: z
    .enum([
      'SUBMITTED',
      'UNDER_REVIEW',
      'INVESTIGATING',
      'APPROVED',
      'REJECTED',
      'SETTLED',
      'CLOSED',
    ])
    .optional(),
  claimType: z
    .enum(['ACCIDENT', 'THEFT', 'VANDALISM', 'NATURAL_DISASTER', 'MECHANICAL', 'THIRD_PARTY'])
    .optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  userId: z.string().cuid().optional(),
  policyId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type DrivingLicenseInput = z.infer<typeof drivingLicenseSchema>;
export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;
export type VehicleSearchInput = z.infer<typeof vehicleSearchSchema>;
export type VehicleDocumentInput = z.infer<typeof vehicleDocumentSchema>;
export type VehiclePhotoInput = z.infer<typeof vehiclePhotoSchema>;
export type VehiclePhotoUploadInput = z.infer<typeof vehiclePhotoUploadSchema>;
export type AdminVehicleActionInput = z.infer<typeof adminVehicleActionSchema>;
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;
export type BookingSearchInput = z.infer<typeof bookingSearchSchema>;
export type AvailabilityCheckInput = z.infer<typeof availabilityCheckSchema>;
export type InsuranceProductInput = z.infer<typeof insuranceProductSchema>;
export type InsuranceSelectionInput = z.infer<typeof insuranceSelectionSchema>;
export type PolicyCreateInput = z.infer<typeof policyCreateSchema>;
export type ClaimCreateInput = z.infer<typeof claimCreateSchema>;
export type ClaimUpdateInput = z.infer<typeof claimUpdateSchema>;
export type AdminClaimActionInput = z.infer<typeof adminClaimActionSchema>;
export type ClaimDocumentUploadInput = z.infer<typeof claimDocumentUploadSchema>;
export type ClaimSearchInput = z.infer<typeof claimSearchSchema>;
