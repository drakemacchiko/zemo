/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST as registerPost } from '@/app/api/auth/register/route'
import { POST as loginPost } from '@/app/api/auth/login/route'
import { POST as verifyPhonePost } from '@/app/api/auth/verify-phone/route'
import { GET as meGet } from '@/app/api/auth/me/route'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Mock auth utilities
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  verifyPassword: jest.fn().mockResolvedValue(true),
  generateTokens: jest.fn().mockReturnValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  }),
  verifyAccessToken: jest.fn().mockReturnValue({
    userId: 'test-user-id',
    email: 'test@example.com',
  }),
  generateOTP: jest.fn().mockReturnValue('123456'),
  sendSMS: jest.fn().mockResolvedValue(true),
  checkRateLimit: jest.fn().mockReturnValue(true),
}))

// Mock environment
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' })

describe('Auth API Integration Tests', () => {
  const { prisma } = require('@/lib/db')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'Test123!@#',
      phoneNumber: '+260971234567',
      firstName: 'John',
      lastName: 'Doe',
    }

    test('should register user successfully', async () => {
      // Mock database responses
      prisma.user.findFirst.mockResolvedValue(null) // No existing user
      prisma.user.create.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        phoneNumber: '+260971234567',
        phoneVerified: false,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validRegisterData),
      })

      const response = await registerPost(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toContain('Registration successful')
      expect(data.user).toBeDefined()
      expect(data.tokens).toBeDefined()
      expect(prisma.user.create).toHaveBeenCalled()
    })

    test('should reject existing user', async () => {
      // Mock existing user
      prisma.user.findFirst.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validRegisterData),
      })

      const response = await registerPost(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('already exists')
    })

    test('should validate input data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
        phoneNumber: 'invalid',
        firstName: '',
        lastName: '',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await registerPost(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid input data')
    })
  })

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'Test123!@#',
    }

    test('should login user successfully', async () => {
      // Mock user in database
      prisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        phoneVerified: true,
        emailVerified: true,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
        drivingLicense: null,
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(validLoginData),
      })

      const response = await loginPost(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Login successful')
      expect(data.user).toBeDefined()
      expect(data.tokens).toBeDefined()
    })

    test('should reject invalid credentials', async () => {
      // Mock user not found
      prisma.user.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(validLoginData),
      })

      const response = await loginPost(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
    })
  })

  describe('POST /api/auth/verify-phone', () => {
    const validOtpData = {
      phoneNumber: '+260971234567',
      otpCode: '123456',
    }

    test('should verify phone successfully', async () => {
      // Mock user with valid OTP
      prisma.user.findFirst.mockResolvedValue({
        id: 'test-user-id',
        phoneVerified: false,
        otpCode: '123456',
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      })

      const request = new NextRequest('http://localhost:3000/api/auth/verify-phone', {
        method: 'POST',
        body: JSON.stringify(validOtpData),
      })

      const response = await verifyPhonePost(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toContain('verified successfully')
      expect(data.phoneVerified).toBe(true)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        data: {
          phoneVerified: true,
          otpCode: null,
          otpExpiry: null,
        },
      })
    })

    test('should reject expired OTP', async () => {
      // Mock user with expired OTP
      prisma.user.findFirst.mockResolvedValue({
        id: 'test-user-id',
        phoneVerified: false,
        otpCode: '123456',
        otpExpiry: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      })

      const request = new NextRequest('http://localhost:3000/api/auth/verify-phone', {
        method: 'POST',
        body: JSON.stringify(validOtpData),
      })

      const response = await verifyPhonePost(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('expired')
    })

    test('should reject invalid OTP', async () => {
      // Mock user with different OTP
      prisma.user.findFirst.mockResolvedValue({
        id: 'test-user-id',
        phoneVerified: false,
        otpCode: '654321',
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      })

      const request = new NextRequest('http://localhost:3000/api/auth/verify-phone', {
        method: 'POST',
        body: JSON.stringify(validOtpData),
      })

      const response = await verifyPhonePost(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid OTP')
    })
  })

  describe('GET /api/auth/me', () => {
    test('should return user data for authenticated request', async () => {
      // Mock authenticated user
      prisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        phoneNumber: '+260971234567',
        phoneVerified: true,
        emailVerified: true,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          kycStatus: 'PENDING',
        },
        drivingLicense: null,
      })

      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      })

      const response = await meGet(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe('test@example.com')
      expect(data.user.profile).toBeDefined()
    })

    test('should reject unauthenticated request', async () => {
      // Mock invalid token verification
      const { verifyAccessToken } = require('@/lib/auth')
      verifyAccessToken.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      })

      const response = await meGet(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Invalid or expired token')
    })
  })
})