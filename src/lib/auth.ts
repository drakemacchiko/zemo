import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './db'

export type UserRole = 'USER' | 'HOST' | 'ADMIN' | 'SUPER_ADMIN'

export type AdminPermission = 
  | 'VIEW_USERS'
  | 'MANAGE_USERS' 
  | 'VIEW_VEHICLES'
  | 'MANAGE_VEHICLES'
  | 'VIEW_BOOKINGS'
  | 'MANAGE_BOOKINGS'
  | 'VIEW_CLAIMS'
  | 'MANAGE_CLAIMS'
  | 'VIEW_PAYMENTS'
  | 'MANAGE_PAYMENTS'
  | 'VIEW_ANALYTICS'
  | 'SYSTEM_ADMIN'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets must be defined in environment variables')
}

export interface JWTPayload {
  userId: string
  email: string
  role?: UserRole
  permissions?: AdminPermission[]
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

// Admin role and permission helpers
export const DEFAULT_ADMIN_PERMISSIONS: Record<UserRole, AdminPermission[]> = {
  USER: [],
  HOST: [],
  ADMIN: [
    'VIEW_USERS', 'VIEW_VEHICLES', 'MANAGE_VEHICLES', 
    'VIEW_BOOKINGS', 'MANAGE_BOOKINGS', 'VIEW_CLAIMS', 
    'MANAGE_CLAIMS', 'VIEW_PAYMENTS', 'VIEW_ANALYTICS'
  ],
  SUPER_ADMIN: [
    'VIEW_USERS', 'MANAGE_USERS', 'VIEW_VEHICLES', 'MANAGE_VEHICLES',
    'VIEW_BOOKINGS', 'MANAGE_BOOKINGS', 'VIEW_CLAIMS', 'MANAGE_CLAIMS',
    'VIEW_PAYMENTS', 'MANAGE_PAYMENTS', 'VIEW_ANALYTICS', 'SYSTEM_ADMIN'
  ]
}

export function parsePermissions(permissionsStr?: string | null): AdminPermission[] {
  if (!permissionsStr) return []
  try {
    const parsed = JSON.parse(permissionsStr)
    return Array.isArray(parsed) ? parsed as AdminPermission[] : []
  } catch {
    return []
  }
}

export function serializePermissions(permissions: AdminPermission[]): string {
  return JSON.stringify(permissions)
}

export function hasPermission(userPermissions: AdminPermission[], requiredPermission: AdminPermission): boolean {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('SYSTEM_ADMIN')
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    USER: 0,
    HOST: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3
  }
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Get user with roles and permissions
export async function getUserWithPermissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      permissions: true,
      mfaEnabled: true,
      lastLoginAt: true,
      isActive: true,
      profile: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  })
  
  if (!user) return null
  
  const permissions = parsePermissions(user.permissions)
  return { 
    ...user, 
    firstName: user.profile?.firstName || '',
    lastName: user.profile?.lastName || '',
    permissions 
  }
}

// Simple auth verification helper
export async function verifyAuth(request: NextRequest) {
  const token = extractTokenFromRequest(request)
  if (!token) {
    return { authenticated: false, userId: null, error: 'Authentication required' }
  }
  
  const payload = verifyAccessToken(token)
  if (!payload) {
    return { authenticated: false, userId: null, error: 'Invalid or expired token' }
  }
  
  return { authenticated: true, userId: payload.userId, payload }
}

// Admin authentication middleware
export async function requireAdmin(request: NextRequest, requiredPermission?: AdminPermission) {
  const token = extractTokenFromRequest(request)
  if (!token) {
    return { error: 'Authentication required', status: 401 }
  }
  
  const payload = verifyAccessToken(token)
  if (!payload) {
    return { error: 'Invalid or expired token', status: 401 }
  }
  
  const user = await getUserWithPermissions(payload.userId)
  if (!user) {
    return { error: 'User not found', status: 404 }
  }
  
  if (!hasRole(user.role, 'ADMIN')) {
    return { error: 'Admin access required', status: 403 }
  }
  
  if (requiredPermission && !hasPermission(user.permissions, requiredPermission)) {
    return { error: `Permission required: ${requiredPermission}`, status: 403 }
  }
  
  return { user, error: null }
}

// MFA token generation and verification (simplified)
export function generateMFASecret(): string {
  // In production, use a proper TOTP library like otplib
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function verifyMFAToken(_secret: string, token: string): boolean {
  // Simplified verification - in production, use proper TOTP verification
  // For now, accept any 6-digit number for development
  return /^\d{6}$/.test(token)
}

export function generateBackupCodes(): string[] {
  const codes = []
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase())
  }
  return codes
}