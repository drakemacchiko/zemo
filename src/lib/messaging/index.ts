import crypto from 'crypto';

// Content moderation types
export interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  flags: string[];
  suggestedAction: 'allow' | 'review' | 'block';
}

export interface BlockedUser {
  userId: string;
  blockedUserId: string;
  reason?: string;
  createdAt: Date;
}

// Message encryption utilities
export class MessageEncryption {
  private static keyLength = 32;
  private static ivLength = 16;

  /**
   * Encrypt a message with a shared secret
   */
  static encrypt(message: string, secret: string): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    try {
      // Create a key from the secret
      const key = crypto.scryptSync(secret, 'salt', this.keyLength);
      
      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher (simplified for compatibility)
      const cipher = crypto.createCipher('aes-256-cbc', key.toString('hex'));
      
      // Encrypt the message
      let encrypted = cipher.update(message, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Generate authentication tag (simplified)
      const tag = crypto.createHmac('sha256', key).update(encrypted).digest('hex').substring(0, 32);
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt a message with a shared secret
   */
  static decrypt(encryptedData: {
    encrypted: string;
    iv: string;
    tag: string;
  }, secret: string): string {
    try {
      // Create a key from the secret
      const key = crypto.scryptSync(secret, 'salt', this.keyLength);
      
      // Convert hex strings back to buffers (iv not needed for simple cipher)
      
      // Create decipher (simplified for compatibility)
      const decipher = crypto.createDecipher('aes-256-cbc', key.toString('hex'));
      
      // Verify tag (simplified)
      const expectedTag = crypto.createHmac('sha256', key).update(encryptedData.encrypted).digest('hex').substring(0, 32);
      if (expectedTag !== encryptedData.tag) {
        throw new Error('Authentication tag verification failed');
      }
      
      // Decrypt the message
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a unique conversation encryption key
   */
  static generateConversationKey(userId1: string, userId2: string, bookingId?: string): string {
    // Create a deterministic key based on user IDs and optional booking
    const keyData = [userId1, userId2].sort().join(':');
    const fullData = bookingId ? `${keyData}:${bookingId}` : keyData;
    
    return crypto.createHash('sha256').update(fullData).digest('hex');
  }
}

// Content moderation service
export class ContentModerationService {
  private static profanityList = [
    // Basic profanity filtering - in production, use a comprehensive service
    'spam', 'scam', 'fraud', 'fake'
  ];

  private static suspiciousPatterns = [
    /\b\d{16}\b/, // Credit card numbers
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN-like patterns
    /bank\s*account/i,
    /password/i,
    /login\s*details/i
  ];

  /**
   * Moderate message content
   */
  static moderateContent(content: string): ModerationResult {
    const flags: string[] = [];
    let confidence = 1.0;
    let isAppropriate = true;

    // Check for profanity
    const lowerContent = content.toLowerCase();
    for (const word of this.profanityList) {
      if (lowerContent.includes(word)) {
        flags.push('profanity');
        confidence = Math.min(confidence, 0.7);
        break;
      }
    }

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        flags.push('suspicious_content');
        confidence = Math.min(confidence, 0.5);
        isAppropriate = false;
        break;
      }
    }

    // Check message length
    if (content.length > 2000) {
      flags.push('too_long');
      confidence = Math.min(confidence, 0.8);
    }

    // Determine suggested action
    let suggestedAction: 'allow' | 'review' | 'block' = 'allow';
    
    if (!isAppropriate) {
      suggestedAction = 'block';
    } else if (flags.length > 0) {
      suggestedAction = 'review';
    }

    return {
      isAppropriate,
      confidence,
      flags,
      suggestedAction
    };
  }

  /**
   * Check if a user can send messages (not blocked, rate limited, etc.)
   */
  static async canUserSendMessage(userId: string, targetUserId: string): Promise<{
    canSend: boolean;
    reason?: string;
  }> {
    try {
      // TODO: Implement actual blocking and rate limiting checks
      // For now, simulate basic checks
      
      if (userId === targetUserId) {
        return {
          canSend: false,
          reason: 'Cannot send messages to yourself'
        };
      }

      // In production, this would check:
      // 1. If target user has blocked sender
      // 2. If sender is rate limited
      // 3. If sender's account is in good standing
      // 4. If conversation is archived/deleted

      return { canSend: true };
    } catch (error) {
      return {
        canSend: false,
        reason: 'Unable to verify message permissions'
      };
    }
  }
}

// Privacy controls
export class PrivacyManager {
  /**
   * Check if user has blocked another user
   */
  static async isUserBlocked(_userId: string, _targetUserId: string): Promise<boolean> {
    try {
      // TODO: Implement with actual database check
      // For now, return false (no blocks)
      return false;
    } catch (error) {
      console.error('Error checking user block status:', error);
      return false;
    }
  }

  /**
   * Block a user
   */
  static async blockUser(_userId: string, _targetUserId: string, _reason?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (_userId === _targetUserId) {
        return {
          success: false,
          error: 'Cannot block yourself'
        };
      }

      // TODO: Implement with actual database operations
      // For now, simulate success
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Unblock a user
   */
  static async unblockUser(_userId: string, _targetUserId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // TODO: Implement with actual database operations
      // For now, simulate success
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get list of users blocked by a user
   */
  static async getBlockedUsers(_userId: string): Promise<BlockedUser[]> {
    try {
      // TODO: Implement with actual database query
      // For now, return empty list
      
      return [];
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }
  }

  /**
   * Sanitize message content for display
   */
  static sanitizeMessage(content: string): string {
    // Remove potentially harmful content
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim();
  }
}

// Rate limiting for messaging
export class MessageRateLimit {
  private static limits = {
    messagesPerMinute: 10,
    messagesPerHour: 100,
    messagesPerDay: 500
  };

  /**
   * Check if user is within rate limits for sending messages
   */
  static async checkRateLimit(_userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    limitType?: string;
  }> {
    try {
      // TODO: Implement with Redis or database-based rate limiting
      // For now, simulate allowing all messages
      
      return {
        allowed: true,
        remaining: this.limits.messagesPerMinute - 1,
        resetTime: new Date(Date.now() + 60 * 1000) // Reset in 1 minute
      };
    } catch (error) {
      console.error('Error checking message rate limit:', error);
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + 60 * 1000),
        limitType: 'error'
      };
    }
  }

  /**
   * Record a message send for rate limiting
   */
  static async recordMessageSent(_userId: string): Promise<void> {
    try {
      // TODO: Implement with Redis or database recording
      // For now, no-op
    } catch (error) {
      console.error('Error recording message send:', error);
    }
  }
}

// Utility functions
export function generateConversationId(userId1: string, userId2: string, bookingId?: string): string {
  const sortedIds = [userId1, userId2].sort();
  const baseId = sortedIds.join('-');
  return bookingId ? `${baseId}-${bookingId}` : baseId;
}

export function formatMessageForNotification(content: string, maxLength = 100): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength - 3) + '...';
}

export function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.toLowerCase();
    return /\.(jpg|jpeg|png|gif|webp)$/.test(pathname);
  } catch {
    return false;
  }
}

export function isValidDocumentUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.toLowerCase();
    return /\.(pdf|doc|docx|txt|rtf)$/.test(pathname);
  } catch {
    return false;
  }
}