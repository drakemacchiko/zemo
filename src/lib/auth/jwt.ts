import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'HOST' | 'RENTER';
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
}

/**
 * Verify and decode a JWT token
 * Returns the decoded payload if valid, null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Decode a JWT token without verifying
 * Useful for reading expired tokens or debugging
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token decode failed:', error);
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Refresh a token by generating a new one with the same payload
 */
export function refreshToken(oldToken: string): string | null {
  try {
    const decoded = verifyToken(oldToken);
    if (!decoded) return null;

    // Generate new token with same user info
    const { userId, email, role } = decoded;
    return generateToken({ userId, email, role });
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}
