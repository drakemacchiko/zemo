import { describe, test, expect, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { 
  requireAdmin, 
  getUserWithPermissions, 
  hasPermission, 
  hasRole,
  type AdminPermission 
} from '@/lib/auth'
import { prisma } from '@/lib/db'

// Set up environment variables for testing
process.env.JWT_SECRET = 'test-secret-key'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key'

// Mock the database
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }
}))

describe('Admin Authentication & RBAC', () => {
  const mockedPrisma = prisma as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Role Hierarchy', () => {
    test('should correctly validate role hierarchy', () => {
      expect(hasRole('SUPER_ADMIN', 'ADMIN')).toBe(true)
      expect(hasRole('SUPER_ADMIN', 'HOST')).toBe(true)
      expect(hasRole('SUPER_ADMIN', 'USER')).toBe(true)
      expect(hasRole('ADMIN', 'HOST')).toBe(true)
      expect(hasRole('ADMIN', 'USER')).toBe(true)
      expect(hasRole('HOST', 'USER')).toBe(true)
      
      expect(hasRole('USER', 'ADMIN')).toBe(false)
      expect(hasRole('HOST', 'ADMIN')).toBe(false)
      expect(hasRole('ADMIN', 'SUPER_ADMIN')).toBe(false)
    })
  })

  describe('Permission System', () => {
    test('should correctly check permissions', () => {
      const adminPermissions: AdminPermission[] = ['VIEW_USERS', 'MANAGE_VEHICLES', 'VIEW_ANALYTICS']
      const superAdminPermissions: AdminPermission[] = ['SYSTEM_ADMIN']

      expect(hasPermission(adminPermissions, 'VIEW_USERS')).toBe(true)
      expect(hasPermission(adminPermissions, 'MANAGE_VEHICLES')).toBe(true)
      expect(hasPermission(adminPermissions, 'SYSTEM_ADMIN')).toBe(false)

      // SYSTEM_ADMIN should grant all permissions
      expect(hasPermission(superAdminPermissions, 'VIEW_USERS')).toBe(true)
      expect(hasPermission(superAdminPermissions, 'MANAGE_VEHICLES')).toBe(true)
      expect(hasPermission(superAdminPermissions, 'SYSTEM_ADMIN')).toBe(true)
    })
  })

  describe('getUserWithPermissions', () => {
    test('should return user with parsed permissions', async () => {
      const mockUser = {
        id: 'user1',
        email: 'admin@test.com',
        role: 'ADMIN',
        permissions: JSON.stringify(['VIEW_USERS', 'MANAGE_VEHICLES']),
        mfaEnabled: false,
        lastLoginAt: new Date(),
        isActive: true,
        profile: {
          firstName: 'Admin',
          lastName: 'User'
        }
      }

      mockedPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await getUserWithPermissions('user1')

      expect(result).toEqual({
        ...mockUser,
        firstName: 'Admin',
        lastName: 'User',
        permissions: ['VIEW_USERS', 'MANAGE_VEHICLES']
      })
    })

    test('should return null for non-existent user', async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null)

      const result = await getUserWithPermissions('nonexistent')

      expect(result).toBeNull()
    })

    test('should handle users without profile', async () => {
      const mockUser = {
        id: 'user1',
        email: 'admin@test.com',
        role: 'ADMIN',
        permissions: null,
        mfaEnabled: false,
        lastLoginAt: new Date(),
        isActive: true,
        profile: null
      }

      mockedPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await getUserWithPermissions('user1')

      expect(result).toEqual({
        ...mockUser,
        firstName: '',
        lastName: '',
        permissions: []
      })
    })
  })

  describe('requireAdmin', () => {
    test('should return error for missing token', async () => {
      const request = new NextRequest('http://localhost/api/admin/test')

      const result = await requireAdmin(request, 'VIEW_USERS')

      expect(result.error).toBe('Authentication required')
      expect(result.status).toBe(401)
    })

    test('should return error for invalid token', async () => {
      const request = new NextRequest('http://localhost/api/admin/test', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      })

      const result = await requireAdmin(request, 'VIEW_USERS')

      expect(result.error).toBe('Invalid or expired token')
      expect(result.status).toBe(401)
    })

    test('should return error for non-admin user', async () => {
      // Mock a valid token but non-admin user
      const mockUser = {
        id: 'user1',
        email: 'user@test.com',
        role: 'USER',
        permissions: null,
        mfaEnabled: false,
        lastLoginAt: new Date(),
        isActive: true,
        profile: {
          firstName: 'Regular',
          lastName: 'User'
        }
      }

      mockedPrisma.user.findUnique.mockResolvedValue(mockUser)

      // Create a valid JWT token for testing
      const jwt = require('jsonwebtoken')
      const token = jwt.sign(
        { userId: 'user1', email: 'user@test.com' },
        process.env.JWT_SECRET || 'test-secret'
      )

      const request = new NextRequest('http://localhost/api/admin/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await requireAdmin(request, 'VIEW_USERS')

      expect(result.error).toBe('Admin access required')
      expect(result.status).toBe(403)
    })

    test('should return error for admin without required permission', async () => {
      const mockUser = {
        id: 'admin1',
        email: 'admin@test.com',
        role: 'ADMIN',
        permissions: JSON.stringify(['VIEW_VEHICLES']), // Missing VIEW_USERS permission
        mfaEnabled: false,
        lastLoginAt: new Date(),
        isActive: true,
        profile: {
          firstName: 'Admin',
          lastName: 'User'
        }
      }

      mockedPrisma.user.findUnique.mockResolvedValue(mockUser)

      const jwt = require('jsonwebtoken')
      const token = jwt.sign(
        { userId: 'admin1', email: 'admin@test.com' },
        process.env.JWT_SECRET || 'test-secret'
      )

      const request = new NextRequest('http://localhost/api/admin/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await requireAdmin(request, 'VIEW_USERS')

      expect(result.error).toBe('Permission required: VIEW_USERS')
      expect(result.status).toBe(403)
    })

    test('should succeed for admin with required permission', async () => {
      const mockUser = {
        id: 'admin1',
        email: 'admin@test.com',
        role: 'ADMIN',
        permissions: JSON.stringify(['VIEW_USERS', 'MANAGE_VEHICLES']),
        mfaEnabled: false,
        lastLoginAt: new Date(),
        isActive: true,
        profile: {
          firstName: 'Admin',
          lastName: 'User'
        }
      }

      mockedPrisma.user.findUnique.mockResolvedValue(mockUser)

      const jwt = require('jsonwebtoken')
      const token = jwt.sign(
        { userId: 'admin1', email: 'admin@test.com' },
        process.env.JWT_SECRET || 'test-secret'
      )

      const request = new NextRequest('http://localhost/api/admin/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await requireAdmin(request, 'VIEW_USERS')

      expect(result.error).toBeNull()
      expect(result.user).toBeDefined()
      expect(result.user?.id).toBe('admin1')
    })

    test('should succeed for super admin with system permissions', async () => {
      const mockUser = {
        id: 'superadmin1',
        email: 'superadmin@test.com',
        role: 'SUPER_ADMIN',
        permissions: JSON.stringify(['SYSTEM_ADMIN']),
        mfaEnabled: false,
        lastLoginAt: new Date(),
        isActive: true,
        profile: {
          firstName: 'Super',
          lastName: 'Admin'
        }
      }

      mockedPrisma.user.findUnique.mockResolvedValue(mockUser)

      const jwt = require('jsonwebtoken')
      const token = jwt.sign(
        { userId: 'superadmin1', email: 'superadmin@test.com' },
        process.env.JWT_SECRET || 'test-secret'
      )

      const request = new NextRequest('http://localhost/api/admin/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await requireAdmin(request, 'MANAGE_USERS')

      expect(result.error).toBeNull()
      expect(result.user).toBeDefined()
      expect(result.user?.permissions).toContain('SYSTEM_ADMIN')
    })
  })
})