import { 
  registerSchema, 
  loginSchema, 
  verifyOtpSchema, 
  profileUpdateSchema,
  documentUploadSchema,
  drivingLicenseSchema
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    const validData = {
      email: 'test@example.com',
      password: 'Test123!@#',
      phoneNumber: '+260971234567',
      firstName: 'John',
      lastName: 'Doe'
    }

    test('should accept valid registration data', () => {
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid email', () => {
      const invalidData = { ...validData, email: 'invalid-email' }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (result.error) {
        expect(result.error.issues[0]?.message).toContain('Invalid email format')
      }
    })

    test('should reject weak password', () => {
      const invalidData = { ...validData, password: 'weak' }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject invalid phone number', () => {
      const invalidData = { ...validData, phoneNumber: '123456' }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (result.error) {
        expect(result.error.issues[0]?.message).toContain('Invalid Zambian phone number format')
      }
    })

    test('should accept valid Zambian phone number formats', () => {
      const formats = ['+260971234567', '0971234567']
      
      formats.forEach(phoneNumber => {
        const data = { ...validData, phoneNumber }
        const result = registerSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    test('should reject empty required fields', () => {
      const requiredFields = ['email', 'password', 'phoneNumber', 'firstName', 'lastName']
      
      requiredFields.forEach(field => {
        const invalidData = { ...validData, [field]: '' }
        const result = registerSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('loginSchema', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123'
    }

    test('should accept valid login data', () => {
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid email', () => {
      const invalidData = { ...validData, email: 'not-an-email' }
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject empty password', () => {
      const invalidData = { ...validData, password: '' }
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('verifyOtpSchema', () => {
    const validData = {
      phoneNumber: '+260971234567',
      otpCode: '123456'
    }

    test('should accept valid OTP data', () => {
      const result = verifyOtpSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid phone number', () => {
      const invalidData = { ...validData, phoneNumber: 'invalid' }
      const result = verifyOtpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject invalid OTP length', () => {
      const invalidData = { ...validData, otpCode: '123' }
      const result = verifyOtpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (result.error) {
        expect(result.error.issues[0]?.message).toContain('OTP must be 6 digits')
      }
    })

    test('should reject non-numeric OTP', () => {
      const invalidData = { ...validData, otpCode: 'abcdef' }
      const result = verifyOtpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('profileUpdateSchema', () => {
    test('should accept valid profile update data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date().toISOString(),
        address: '123 Main St',
        city: 'Lusaka'
      }
      
      const result = profileUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should accept partial data (all fields optional)', () => {
      const partialData = { firstName: 'John' }
      const result = profileUpdateSchema.safeParse(partialData)
      expect(result.success).toBe(true)
    })

    test('should reject overly long fields', () => {
      const longString = 'a'.repeat(300)
      const invalidData = { address: longString }
      const result = profileUpdateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('documentUploadSchema', () => {
    test('should accept valid document types', () => {
      const validTypes = ['PROFILE_PICTURE', 'DRIVING_LICENSE', 'NATIONAL_ID']
      
      validTypes.forEach(documentType => {
        const result = documentUploadSchema.safeParse({ documentType })
        expect(result.success).toBe(true)
      })
    })

    test('should reject invalid document type', () => {
      const result = documentUploadSchema.safeParse({ documentType: 'INVALID_TYPE' })
      expect(result.success).toBe(false)
    })
  })

  describe('drivingLicenseSchema', () => {
    const validData = {
      licenseNumber: 'ZM123456789',
      issueDate: new Date('2020-01-01').toISOString(),
      expiryDate: new Date('2025-01-01').toISOString(),
      licenseClass: 'B'
    }

    test('should accept valid driving license data', () => {
      const result = drivingLicenseSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject empty required fields', () => {
      const requiredFields = ['licenseNumber', 'issueDate', 'expiryDate', 'licenseClass']
      
      requiredFields.forEach(field => {
        const invalidData = { ...validData, [field]: '' }
        const result = drivingLicenseSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    test('should reject invalid date formats', () => {
      const invalidData = { ...validData, issueDate: 'not-a-date' }
      const result = drivingLicenseSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})