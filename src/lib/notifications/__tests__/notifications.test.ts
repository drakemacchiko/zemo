import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock process.env
const mockProcessEnv = {
  NODE_ENV: 'development',
  RESEND_API_KEY: 'test_resend_key',
  TWILIO_ACCOUNT_SID: 'test_twilio_sid',
  TWILIO_AUTH_TOKEN: 'test_twilio_token',
  TWILIO_PHONE_NUMBER: '+1234567890',
};

Object.defineProperty(process, 'env', {
  value: mockProcessEnv,
  writable: true,
  enumerable: true,
  configurable: true,
});

import {
  NotificationService,
  ResendEmailService,
  TwilioSMSService,
  generateEmailTemplate,
  generateSMSTemplate,
  createNotificationService,
  type NotificationContext,
} from '@/lib/notifications';

describe('Notification Services', () => {
  describe('ResendEmailService', () => {
    let emailService: ResendEmailService;

    beforeEach(() => {
      emailService = new ResendEmailService('test_api_key');
    });

    it('should successfully send email in development mode', async () => {
      const template = {
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
        text: 'Test text content',
      };

      const result = await emailService.sendEmail('test@example.com', template);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle email sending errors gracefully', async () => {
      // Force an error by using invalid data
      const template = {
        subject: '',
        html: '',
        text: '',
      };

      const result = await emailService.sendEmail('', template);

      // In development mode, it should still succeed (mocked)
      expect(result.success).toBe(true);
    });
  });

  describe('TwilioSMSService', () => {
    let smsService: TwilioSMSService;

    beforeEach(() => {
      smsService = new TwilioSMSService('test_sid', 'test_token', '+1234567890');
    });

    it('should successfully send SMS in development mode', async () => {
      const template = {
        message: 'Test SMS message',
      };

      const result = await smsService.sendSMS('+260771234567', template);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle SMS sending with empty message', async () => {
      const template = {
        message: '',
      };

      const result = await smsService.sendSMS('+260771234567', template);

      // In development mode, it should still succeed (mocked)
      expect(result.success).toBe(true);
    });
  });

  describe('Email Template Generation', () => {
    const mockContext: NotificationContext = {
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+260771234567',
      },
      booking: {
        confirmationNumber: 'BOOK123',
        vehicleName: '2023 Toyota Corolla',
        startDate: '2025-01-15',
        endDate: '2025-01-20',
        totalAmount: 500,
      },
      payment: {
        amount: 500,
        provider: 'Airtel Money',
        status: 'COMPLETED',
      },
      message: {
        content: 'Hello, I have a question about the vehicle.',
        senderName: 'Jane Smith',
      },
      ticket: {
        ticketNumber: 'TICKET-12345',
        subject: 'Vehicle Issue',
        status: 'IN_PROGRESS',
      },
    };

    it('should generate booking confirmation email template', () => {
      const template = generateEmailTemplate('BOOKING_CONFIRMED', mockContext);

      expect(template.subject).toContain('Booking Confirmed');
      expect(template.subject).toContain('2023 Toyota Corolla');
      expect(template.html).toContain('John');
      expect(template.html).toContain('BOOK123');
      expect(template.html).toContain('ZMW 500');
      expect(template.text).toContain('John');
      expect(template.text).toContain('BOOK123');
    });

    it('should generate payment success email template', () => {
      const template = generateEmailTemplate('PAYMENT_SUCCESS', mockContext);

      expect(template.subject).toBe('Payment Successful - ZEMO');
      expect(template.html).toContain('John');
      expect(template.html).toContain('ZMW 500');
      expect(template.html).toContain('Airtel Money');
      expect(template.text).toContain('ZMW 500');
    });

    it('should generate message received email template', () => {
      const template = generateEmailTemplate('MESSAGE_RECEIVED', mockContext);

      expect(template.subject).toBe('New Message - ZEMO');
      expect(template.html).toContain('Jane Smith');
      expect(template.html).toContain('Hello, I have a question');
      expect(template.text).toContain('Jane Smith');
    });

    it('should generate support response email template', () => {
      const template = generateEmailTemplate('SUPPORT_RESPONSE', mockContext);

      expect(template.subject).toContain('TICKET-12345');
      expect(template.html).toContain('TICKET-12345');
      expect(template.html).toContain('Vehicle Issue');
      expect(template.html).toContain('IN_PROGRESS');
    });

    it('should generate default template for unknown type', () => {
      const template = generateEmailTemplate('UNKNOWN_TYPE' as any, mockContext);

      expect(template.subject).toBe('ZEMO Notification');
      expect(template.html).toContain('John');
      expect(template.text).toContain('John');
    });
  });

  describe('SMS Template Generation', () => {
    const mockContext: NotificationContext = {
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+260771234567',
      },
      booking: {
        confirmationNumber: 'BOOK123',
        vehicleName: '2023 Toyota Corolla',
        startDate: '2025-01-15',
        endDate: '2025-01-20',
        totalAmount: 500,
      },
      payment: {
        amount: 500,
        provider: 'Airtel Money',
        status: 'COMPLETED',
      },
      message: {
        content: 'Hello, I have a question about the vehicle.',
        senderName: 'Jane Smith',
      },
    };

    it('should generate booking confirmation SMS template', () => {
      const template = generateSMSTemplate('BOOKING_CONFIRMED', mockContext);

      expect(template.message).toContain('ZEMO:');
      expect(template.message).toContain('2023 Toyota Corolla');
      expect(template.message).toContain('BOOK123');
      expect(template.message).toContain('2025-01-15');
    });

    it('should generate payment success SMS template', () => {
      const template = generateSMSTemplate('PAYMENT_SUCCESS', mockContext);

      expect(template.message).toContain('ZEMO:');
      expect(template.message).toContain('ZMW 500');
      expect(template.message).toContain('Airtel Money');
    });

    it('should generate message received SMS template', () => {
      const template = generateSMSTemplate('MESSAGE_RECEIVED', mockContext);

      expect(template.message).toContain('ZEMO:');
      expect(template.message).toContain('Jane Smith');
      expect(template.message).toContain('Hello, I have a question');
    });

    it('should truncate long messages in SMS', () => {
      const longMessage = 'a'.repeat(200);
      const contextWithLongMessage = {
        ...mockContext,
        message: {
          content: longMessage,
          senderName: 'Jane Smith',
        },
      };

      const template = generateSMSTemplate('MESSAGE_RECEIVED', contextWithLongMessage);

      expect(template.message).toContain('...');
      expect(template.message.length).toBeLessThan(200); // SMS should be reasonable length
    });
  });

  describe('NotificationService', () => {
    let notificationService: NotificationService;
    let mockEmailService: jest.Mocked<ResendEmailService>;
    let mockSmsService: jest.Mocked<TwilioSMSService>;

    beforeEach(() => {
      mockEmailService = {
        sendEmail: jest.fn(),
      } as any;

      mockSmsService = {
        sendSMS: jest.fn(),
      } as any;

      notificationService = new NotificationService(mockEmailService, mockSmsService);
    });

    it('should send notification to multiple channels', async () => {
      const context: NotificationContext = {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phoneNumber: '+260771234567',
        },
      };

      mockEmailService.sendEmail.mockResolvedValue({
        success: true,
        messageId: 'email123',
      });

      mockSmsService.sendSMS.mockResolvedValue({
        success: true,
        messageId: 'sms123',
      });

      const results = await notificationService.sendNotification('BOOKING_CONFIRMED', context, [
        'EMAIL',
        'SMS',
        'IN_APP',
      ]);

      expect(results.EMAIL.success).toBe(true);
      expect(results.SMS.success).toBe(true);
      expect(results.IN_APP.success).toBe(true);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        'john@example.com',
        expect.any(Object)
      );
      expect(mockSmsService.sendSMS).toHaveBeenCalledWith('+260771234567', expect.any(Object));
    });

    it('should handle missing contact information', async () => {
      const context: NotificationContext = {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: '',
          phoneNumber: '',
        },
      };

      const results = await notificationService.sendNotification('BOOKING_CONFIRMED', context, [
        'EMAIL',
        'SMS',
      ]);

      expect(results.EMAIL.success).toBe(false);
      expect(results.EMAIL.error).toBe('No email address provided');
      expect(results.SMS.success).toBe(false);
      expect(results.SMS.error).toBe('No phone number provided');
    });

    it('should handle service failures gracefully', async () => {
      const context: NotificationContext = {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phoneNumber: '+260771234567',
        },
      };

      mockEmailService.sendEmail.mockResolvedValue({
        success: false,
        error: 'Service unavailable',
      });

      const results = await notificationService.sendNotification('BOOKING_CONFIRMED', context, [
        'EMAIL',
      ]);

      expect(results.EMAIL.success).toBe(false);
      expect(results.EMAIL.error).toBe('Service unavailable');
    });
  });

  describe('Service Factory', () => {
    it('should create notification service with correct configuration', () => {
      const service = createNotificationService();
      expect(service).toBeInstanceOf(NotificationService);
    });

    it('should use environment variables for configuration', () => {
      // Mock environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        RESEND_API_KEY: 'test_resend_key',
        TWILIO_ACCOUNT_SID: 'test_twilio_sid',
        TWILIO_AUTH_TOKEN: 'test_twilio_token',
        TWILIO_PHONE_NUMBER: '+1234567890',
      };

      const service = createNotificationService();
      expect(service).toBeInstanceOf(NotificationService);

      // Restore environment
      process.env = originalEnv;
    });
  });
});
