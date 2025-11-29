import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  generateOTP,
  checkRateLimit,
} from '@/lib/auth';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';

describe('Auth Utilities', () => {
  describe('Password hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'Test123!@#';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    test('should verify password correctly', async () => {
      const password = 'Test123!@#';
      const hashedPassword = await hashPassword(password);

      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrongpassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT tokens', () => {
    const testPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
    };

    test('should generate tokens correctly', () => {
      const { accessToken, refreshToken } = generateTokens(testPayload);

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
    });

    test('should verify access token correctly', () => {
      const { accessToken } = generateTokens(testPayload);
      const decoded = verifyAccessToken(accessToken);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(testPayload.userId);
      expect(decoded?.email).toBe(testPayload.email);
    });

    test('should verify refresh token correctly', () => {
      const { refreshToken } = generateTokens(testPayload);
      const decoded = verifyRefreshToken(refreshToken);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(testPayload.userId);
      expect(decoded?.email).toBe(testPayload.email);
    });

    test('should return null for invalid tokens', () => {
      const invalidToken = 'invalid.token.here';

      const accessResult = verifyAccessToken(invalidToken);
      const refreshResult = verifyRefreshToken(invalidToken);

      expect(accessResult).toBeNull();
      expect(refreshResult).toBeNull();
    });
  });

  describe('OTP generation', () => {
    test('should generate 6-digit OTP', () => {
      const otp = generateOTP();

      expect(otp).toBeDefined();
      expect(otp.length).toBe(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    test('should generate different OTPs', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();

      // While theoretically possible to be the same, extremely unlikely
      expect(otp1).not.toBe(otp2);
    });
  });

  describe('Rate limiting', () => {
    const testIdentifier = 'test-ip-address';

    beforeEach(() => {
      // Clear rate limit store before each test
      // Note: In a real implementation, you'd want to expose a clear method
    });

    test('should allow requests within limit', () => {
      const result1 = checkRateLimit(testIdentifier, 3, 60000);
      const result2 = checkRateLimit(testIdentifier, 3, 60000);
      const result3 = checkRateLimit(testIdentifier, 3, 60000);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });

    test('should block requests over limit', () => {
      // Use up the limit
      checkRateLimit(testIdentifier + '2', 2, 60000);
      checkRateLimit(testIdentifier + '2', 2, 60000);

      // This should be blocked
      const result = checkRateLimit(testIdentifier + '2', 2, 60000);
      expect(result).toBe(false);
    });

    test('should reset after window expires', () => {
      const shortWindow = 100; // 100ms

      // Use up the limit
      checkRateLimit(testIdentifier + '3', 1, shortWindow);

      // Should be blocked immediately
      expect(checkRateLimit(testIdentifier + '3', 1, shortWindow)).toBe(false);

      // Wait for window to expire and test again
      return new Promise(resolve => {
        setTimeout(() => {
          const result = checkRateLimit(testIdentifier + '3', 1, shortWindow);
          expect(result).toBe(true);
          resolve(undefined);
        }, 150);
      });
    });
  });
});
