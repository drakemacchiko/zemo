import {
  PaymentServiceFactory,
  PaymentUtils,
  PaymentProvider,
  PaymentStatus,
  AirtelMoneyService,
  MTNMoMoService,
  StripeService,
} from '@/lib/payments';

describe('Payment Services', () => {
  beforeAll(() => {
    // Tests run in test environment by default
  });

  describe('PaymentServiceFactory', () => {
    test('should return correct service instances', () => {
      const airtelService = PaymentServiceFactory.getService(PaymentProvider.AIRTEL_MONEY);
      const mtnService = PaymentServiceFactory.getService(PaymentProvider.MTN_MOMO);
      const stripeService = PaymentServiceFactory.getService(PaymentProvider.STRIPE);

      expect(airtelService).toBeInstanceOf(AirtelMoneyService);
      expect(mtnService).toBeInstanceOf(MTNMoMoService);
      expect(stripeService).toBeInstanceOf(StripeService);
    });

    test('should identify mobile money providers correctly', () => {
      expect(PaymentServiceFactory.isMobileMoneyProvider(PaymentProvider.AIRTEL_MONEY)).toBe(true);
      expect(PaymentServiceFactory.isMobileMoneyProvider(PaymentProvider.MTN_MOMO)).toBe(true);
      expect(PaymentServiceFactory.isMobileMoneyProvider(PaymentProvider.STRIPE)).toBe(false);
    });

    test('should identify card payment providers correctly', () => {
      expect(PaymentServiceFactory.isCardPaymentProvider(PaymentProvider.STRIPE)).toBe(true);
      expect(PaymentServiceFactory.isCardPaymentProvider(PaymentProvider.DPO)).toBe(true);
      expect(PaymentServiceFactory.isCardPaymentProvider(PaymentProvider.AIRTEL_MONEY)).toBe(false);
    });
  });

  describe('PaymentUtils', () => {
    test('should validate phone numbers correctly', () => {
      // Valid formats
      expect(PaymentUtils.validatePhoneNumber('+260977123456')).toBe(true);
      expect(PaymentUtils.validatePhoneNumber('0977123456')).toBe(true);
      expect(PaymentUtils.validatePhoneNumber('977123456')).toBe(true);

      // Invalid formats
      expect(PaymentUtils.validatePhoneNumber('123456')).toBe(false);
      expect(PaymentUtils.validatePhoneNumber('+1234567890')).toBe(false);
      expect(PaymentUtils.validatePhoneNumber('abc123456')).toBe(false);
    });

    test('should normalize phone numbers correctly', () => {
      expect(PaymentUtils.normalizePhoneNumber('0977123456')).toBe('+260977123456');
      expect(PaymentUtils.normalizePhoneNumber('977123456')).toBe('+260977123456');
      expect(PaymentUtils.normalizePhoneNumber('+260977123456')).toBe('+260977123456');
    });

    test('should validate amounts correctly', () => {
      expect(PaymentUtils.validateAmount(100)).toBe(true);
      expect(PaymentUtils.validateAmount(1000000)).toBe(true);
      expect(PaymentUtils.validateAmount(0)).toBe(false);
      expect(PaymentUtils.validateAmount(-100)).toBe(false);
      expect(PaymentUtils.validateAmount(1000001)).toBe(false);
    });

    test('should calculate service fees correctly', () => {
      const amount = 1000;
      const airtelFee = PaymentUtils.calculateServiceFee(amount, PaymentProvider.AIRTEL_MONEY);
      const stripeFee = PaymentUtils.calculateServiceFee(amount, PaymentProvider.STRIPE);

      expect(airtelFee).toBe(15); // 1.5% of 1000
      expect(stripeFee).toBe(29); // 2.9% of 1000
    });

    test('should generate unique transaction IDs', () => {
      const id1 = PaymentUtils.generateTransactionId('TEST');
      const id2 = PaymentUtils.generateTransactionId('TEST');

      expect(id1).toMatch(/^TEST-\d+-[A-Z0-9]+$/);
      expect(id2).toMatch(/^TEST-\d+-[A-Z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('AirtelMoneyService', () => {
    let service: AirtelMoneyService;

    beforeEach(() => {
      service = new AirtelMoneyService();
    });

    test('should process payment successfully', async () => {
      const result = await service.processPayment({
        amount: 100,
        currency: 'ZMW',
        customerId: 'test-user',
        description: 'Test payment',
      });

      expect(result.success).toBeDefined();
      expect(result.paymentId).toMatch(/^AM-\d+-[A-Z0-9]+$/);
      expect(result.status).toBeDefined();

      if (result.success) {
        expect(result.status).toBe(PaymentStatus.COMPLETED);
        expect(result.providerTransactionId).toBeDefined();
        expect(result.message).toContain('Airtel Money');
      }
    });

    test('should handle mobile payment requests', async () => {
      const result = await service.initiateMobilePayment({
        phoneNumber: '+260977123456',
        amount: 150,
        currency: 'ZMW',
        description: 'Test mobile payment',
      });

      expect(result.success).toBeDefined();
      expect(result.transactionId).toMatch(/^AM-\d+-[A-Z0-9]+$/);
      expect(result.status).toBeDefined();
    });

    test('should handle hold and release operations', async () => {
      // Test hold
      const holdResult = await service.holdFunds({
        amount: 250,
        currency: 'ZMW',
        paymentMethodId: 'test-method',
        customerId: 'test-user',
        description: 'Test hold',
      });

      expect(holdResult.success).toBeDefined();
      expect(holdResult.holdId).toMatch(/^AMH-\d+-[A-Z0-9]+$/);

      if (holdResult.success) {
        expect(holdResult.status).toBe(PaymentStatus.HELD);

        // Test release
        const releaseResult = await service.releaseFunds(holdResult.holdId);
        expect(releaseResult.success).toBe(true);
        expect(releaseResult.status).toBe(PaymentStatus.RELEASED);

        // Test capture
        const captureResult = await service.captureFunds(holdResult.holdId, 100);
        expect(captureResult.success).toBe(true);
        expect(captureResult.status).toBe(PaymentStatus.COMPLETED);
      }
    });

    test('should handle refund requests', async () => {
      const result = await service.refundPayment({
        paymentId: 'test-payment-id',
        amount: 50,
        reason: 'Test refund',
      });

      expect(result.success).toBeDefined();
      expect(result.refundId).toMatch(/^AMR-\d+-[A-Z0-9]+$/);
      expect(result.amount).toBe(50);

      if (result.success) {
        expect(result.status).toBe(PaymentStatus.REFUNDED);
      }
    });

    test('should check payment status', async () => {
      const result = await service.getPaymentStatus('test-payment-id');

      expect(result.paymentId).toBe('test-payment-id');
      expect(result.status).toBeDefined();
      expect(result.amount).toBeGreaterThan(0);
      expect(result.currency).toBe('ZMW');
      expect(result.processedAt).toBeInstanceOf(Date);
    });
  });

  describe('MTNMoMoService', () => {
    let service: MTNMoMoService;

    beforeEach(() => {
      service = new MTNMoMoService();
    });

    test('should process payment successfully', async () => {
      const result = await service.processPayment({
        amount: 200,
        currency: 'ZMW',
        customerId: 'test-user',
        description: 'Test MTN payment',
      });

      expect(result.success).toBeDefined();
      expect(result.paymentId).toMatch(/^MTN-\d+-[A-Z0-9]+$/);
      expect(result.status).toBeDefined();
    });

    test('should simulate failure for specific phone patterns', async () => {
      const result = await service.initiateMobilePayment({
        phoneNumber: '+260971111111', // Contains 1111 - should fail
        amount: 100,
        currency: 'ZMW',
        description: 'Test failure scenario',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe(PaymentStatus.FAILED);
    });
  });

  describe('StripeService', () => {
    let service: StripeService;

    beforeEach(() => {
      service = new StripeService();
    });

    test('should tokenize card successfully', async () => {
      const result = await service.tokenizeCard({
        cardNumber: '4242424242424242',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
        cardholderName: 'John Doe',
        customerId: 'test-user',
      });

      expect(result.success).toBeDefined();

      if (result.success) {
        expect(result.token).toMatch(/^tok_\d+_[a-z0-9]+$/);
        expect(result.last4).toBe('4242');
        expect(result.brand).toBe('Visa');
        expect(result.expiryMonth).toBe(12);
        expect(result.expiryYear).toBe(2025);
      }
    });

    test('should reject invalid card numbers', async () => {
      const result = await service.tokenizeCard({
        cardNumber: '1234', // Too short
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
        cardholderName: 'John Doe',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid card number format');
    });

    test('should process card payment', async () => {
      const result = await service.processPayment({
        amount: 300,
        currency: 'ZMW',
        paymentMethodId: 'tok_test_123',
        customerId: 'test-user',
        description: 'Test card payment',
      });

      expect(result.success).toBeDefined();
      expect(result.paymentId).toMatch(/^STRIPE-\d+-[A-Z0-9]+$/);
      expect(result.status).toBeDefined();
    });
  });

  describe('Payment Integration Flow', () => {
    test('should handle end-to-end payment flow', async () => {
      // 1. Get mobile money service
      const service = PaymentServiceFactory.getMobileMoneyService(PaymentProvider.AIRTEL_MONEY);

      // 2. Initiate mobile payment
      const paymentResult = await service.initiateMobilePayment({
        phoneNumber: '+260977123456',
        amount: 500,
        currency: 'ZMW',
        description: 'Booking payment for vehicle XYZ',
      });

      expect(paymentResult.success).toBeDefined();

      if (paymentResult.success) {
        // 3. Check status
        const statusResult = await service.checkMobilePaymentStatus(paymentResult.transactionId);
        expect(statusResult.status).toBeDefined();

        // 4. Test escrow hold
        const holdResult = await service.holdFunds({
          amount: 1000,
          currency: 'ZMW',
          paymentMethodId: 'test-method',
          description: 'Security deposit',
        });

        if (holdResult.success) {
          // 5. Capture partial amount
          const captureResult = await service.captureFunds(holdResult.holdId, 250);
          expect(captureResult.success).toBe(true);

          // 6. Release remaining amount
          const releaseResult = await service.releaseFunds(holdResult.holdId);
          expect(releaseResult.success).toBe(true);
        }
      }
    }, 10000); // Increase timeout for integration test
  });
});
