import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets must be defined in environment variables')
}

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT tokens
export function generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
  
  return { accessToken, refreshToken }
}

// Verify access token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Extract token from request
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

// Generate OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Mock SMS sender (logs to console in development)
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`📱 SMS to ${phoneNumber}: ${message}`)
    return true
  }
  
  // TODO: Implement Twilio integration for production
  // const client = twilio(accountSid, authToken);
  // await client.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: phoneNumber
  // });
  
  throw new Error('SMS sending not implemented for production. Please configure Twilio.')
}

// Rate limiting store (in-memory for development)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)
  
  if (!record) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxAttempts) {
    return false
  }
  
  record.count++
  return true
}