import { describe, test, expect } from '@jest/globals';
import {
  hasPermission,
  hasRole,
  parsePermissions,
  serializePermissions,
  type AdminPermission,
  type UserRole,
} from '@/lib/auth';

describe('Admin Core Functions', () => {
  describe('Role Hierarchy', () => {
    test('should correctly validate role hierarchy', () => {
      expect(hasRole('SUPER_ADMIN', 'ADMIN')).toBe(true);
      expect(hasRole('SUPER_ADMIN', 'HOST')).toBe(true);
      expect(hasRole('SUPER_ADMIN', 'USER')).toBe(true);
      expect(hasRole('ADMIN', 'HOST')).toBe(true);
      expect(hasRole('ADMIN', 'USER')).toBe(true);
      expect(hasRole('HOST', 'USER')).toBe(true);

      expect(hasRole('USER', 'ADMIN')).toBe(false);
      expect(hasRole('HOST', 'ADMIN')).toBe(false);
      expect(hasRole('ADMIN', 'SUPER_ADMIN')).toBe(false);
    });
  });

  describe('Permission System', () => {
    test('should correctly check permissions', () => {
      const adminPermissions: AdminPermission[] = [
        'VIEW_USERS',
        'MANAGE_VEHICLES',
        'VIEW_ANALYTICS',
      ];
      const superAdminPermissions: AdminPermission[] = ['SYSTEM_ADMIN'];

      expect(hasPermission(adminPermissions, 'VIEW_USERS')).toBe(true);
      expect(hasPermission(adminPermissions, 'MANAGE_VEHICLES')).toBe(true);
      expect(hasPermission(adminPermissions, 'SYSTEM_ADMIN')).toBe(false);

      // SYSTEM_ADMIN should grant all permissions
      expect(hasPermission(superAdminPermissions, 'VIEW_USERS')).toBe(true);
      expect(hasPermission(superAdminPermissions, 'MANAGE_VEHICLES')).toBe(true);
      expect(hasPermission(superAdminPermissions, 'SYSTEM_ADMIN')).toBe(true);
    });

    test('should handle empty permissions array', () => {
      const emptyPermissions: AdminPermission[] = [];

      expect(hasPermission(emptyPermissions, 'VIEW_USERS')).toBe(false);
      expect(hasPermission(emptyPermissions, 'SYSTEM_ADMIN')).toBe(false);
    });
  });

  describe('Permission Serialization', () => {
    test('should serialize and parse permissions correctly', () => {
      const permissions: AdminPermission[] = ['VIEW_USERS', 'MANAGE_VEHICLES', 'VIEW_ANALYTICS'];

      const serialized = serializePermissions(permissions);
      expect(serialized).toBe('["VIEW_USERS","MANAGE_VEHICLES","VIEW_ANALYTICS"]');

      const parsed = parsePermissions(serialized);
      expect(parsed).toEqual(permissions);
    });

    test('should handle null/undefined permissions', () => {
      expect(parsePermissions(null)).toEqual([]);
      expect(parsePermissions(undefined)).toEqual([]);
      expect(parsePermissions('')).toEqual([]);
    });

    test('should handle invalid JSON gracefully', () => {
      expect(parsePermissions('invalid-json')).toEqual([]);
      expect(parsePermissions('{"not": "array"}')).toEqual([]);
    });
  });

  describe('Role-based Permission Defaults', () => {
    test('USER role should have no admin permissions', () => {
      const userRole: UserRole = 'USER';
      expect(hasRole(userRole, 'ADMIN')).toBe(false);
      expect(hasRole(userRole, 'HOST')).toBe(false);
    });

    test('HOST role should have access to user-level features but not admin', () => {
      const hostRole: UserRole = 'HOST';
      expect(hasRole(hostRole, 'USER')).toBe(true);
      expect(hasRole(hostRole, 'ADMIN')).toBe(false);
    });

    test('ADMIN role should have access to most admin features', () => {
      const adminRole: UserRole = 'ADMIN';
      expect(hasRole(adminRole, 'USER')).toBe(true);
      expect(hasRole(adminRole, 'HOST')).toBe(true);
      expect(hasRole(adminRole, 'SUPER_ADMIN')).toBe(false);
    });

    test('SUPER_ADMIN role should have access to all features', () => {
      const superAdminRole: UserRole = 'SUPER_ADMIN';
      expect(hasRole(superAdminRole, 'USER')).toBe(true);
      expect(hasRole(superAdminRole, 'HOST')).toBe(true);
      expect(hasRole(superAdminRole, 'ADMIN')).toBe(true);
    });
  });
});
