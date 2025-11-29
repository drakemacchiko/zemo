import {
  MobileMoneyService,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  PaymentStatusResponse,
  HoldRequest,
  HoldResponse,
  MobileMoneyRequest,
  MobileMoneyResponse,
  PaymentStatus,
} from '../types';
import { PaymentUtils } from '../index';

export class AirtelMoneyService extends MobileMoneyService {
  private readonly isProduction: boolean;

  constructor() {
    super();
    this.isProduction = process.env.NODE_ENV === 'production';

    // Store API credentials for future production use
    const apiKey = process.env.AIRTEL_MONEY_API_KEY || 'sandbox_key';
    const baseUrl = this.isProduction
      ? 'https://api.airtel.co.zm/v1'
      : 'https://sandbox-api.airtel.co.zm/v1';

    // In production, these would be used for actual API calls
    if (this.isProduction && apiKey && baseUrl) {
      // Production configuration ready
    }
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In sandbox mode, simulate payment processing
      if (!this.isProduction) {
        return this.simulatePayment(request);
      }

      // Production implementation would go here
      throw new Error('Production Airtel Money integration not implemented');
    } catch (error) {
      return {
        success: false,
        paymentId: PaymentUtils.generateTransactionId('AM'),
        status: PaymentStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async refundPayment(request: RefundRequest): Promise<RefundResponse> {
    try {
      if (!this.isProduction) {
        return this.simulateRefund(request);
      }

      throw new Error('Production Airtel Money refund not implemented');
    } catch (error) {
      return {
        success: false,
        refundId: PaymentUtils.generateTransactionId('AMR'),
        amount: 0,
        status: PaymentStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    if (!this.isProduction) {
      return this.simulateStatusCheck(paymentId);
    }

    throw new Error('Production Airtel Money status check not implemented');
  }

  async holdFunds(request: HoldRequest): Promise<HoldResponse> {
    try {
      if (!this.isProduction) {
        return this.simulateHold(request);
      }

      throw new Error('Production Airtel Money hold not implemented');
    } catch (error) {
      return {
        success: false,
        holdId: PaymentUtils.generateTransactionId('AMH'),
        status: PaymentStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async releaseFunds(holdId: string): Promise<PaymentResponse> {
    if (!this.isProduction) {
      return this.simulateRelease(holdId);
    }

    throw new Error('Production Airtel Money release not implemented');
  }

  async captureFunds(holdId: string, amount?: number): Promise<PaymentResponse> {
    if (!this.isProduction) {
      return this.simulateCapture(holdId, amount);
    }

    throw new Error('Production Airtel Money capture not implemented');
  }

  async initiateMobilePayment(request: MobileMoneyRequest): Promise<MobileMoneyResponse> {
    try {
      if (!PaymentUtils.validatePhoneNumber(request.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      if (!PaymentUtils.validateAmount(request.amount)) {
        throw new Error('Invalid amount');
      }

      if (!this.isProduction) {
        return this.simulateMobilePayment(request);
      }

      // Production API call would go here
      throw new Error('Production Airtel Money mobile payment not implemented');
    } catch (error) {
      return {
        success: false,
        transactionId: PaymentUtils.generateTransactionId('AM'),
        providerReference: '',
        status: PaymentStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkMobilePaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    if (!this.isProduction) {
      return this.simulateStatusCheck(transactionId);
    }

    throw new Error('Production Airtel Money status check not implemented');
  }

  // Sandbox simulation methods
  private async simulatePayment(_request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const paymentId = PaymentUtils.generateTransactionId('AM');

    // Simulate success rate (90% success)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return {
        success: true,
        paymentId,
        providerTransactionId: `AM${Date.now()}`,
        providerReference: `AIRTEL-${paymentId}`,
        status: PaymentStatus.COMPLETED,
        message: 'Payment processed successfully via Airtel Money',
      };
    } else {
      return {
        success: false,
        paymentId,
        status: PaymentStatus.FAILED,
        error: 'Insufficient balance or payment declined',
      };
    }
  }

  private async simulateRefund(request: RefundRequest): Promise<RefundResponse> {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const refundId = PaymentUtils.generateTransactionId('AMR');

    // Simulate 95% success rate for refunds
    const isSuccess = Math.random() > 0.05;

    return {
      success: isSuccess,
      refundId,
      amount: request.amount || 100, // Default amount for simulation
      status: isSuccess ? PaymentStatus.REFUNDED : PaymentStatus.FAILED,
      message: isSuccess ? 'Refund processed successfully' : 'Refund failed',
    };
  }

  private async simulateHold(_request: HoldRequest): Promise<HoldResponse> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const holdId = PaymentUtils.generateTransactionId('AMH');

    // Simulate 85% success rate for holds
    const isSuccess = Math.random() > 0.15;

    if (isSuccess) {
      return {
        success: true,
        holdId,
        providerTransactionId: `AMH${Date.now()}`,
        status: PaymentStatus.HELD,
        message: 'Funds held successfully',
      };
    } else {
      return {
        success: false,
        holdId,
        status: PaymentStatus.FAILED,
        message: 'Hold failed - insufficient balance',
      };
    }
  }

  private async simulateRelease(holdId: string): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      paymentId: holdId,
      status: PaymentStatus.RELEASED,
      message: 'Funds released successfully',
    };
  }

  private async simulateCapture(holdId: string, amount?: number): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      success: true,
      paymentId: holdId,
      status: PaymentStatus.COMPLETED,
      message: `Captured ${amount ? PaymentUtils.formatAmount(amount) : 'full amount'} successfully`,
    };
  }

  private async simulateMobilePayment(request: MobileMoneyRequest): Promise<MobileMoneyResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

    const transactionId = PaymentUtils.generateTransactionId('AM');

    // Simulate success rate based on phone number (for testing)
    const normalizedPhone = PaymentUtils.normalizePhoneNumber(request.phoneNumber);
    const isSuccess = !normalizedPhone.endsWith('0000'); // Fail if phone ends with 0000

    return {
      success: isSuccess,
      transactionId,
      providerReference: `AIRTEL-${Date.now()}`,
      status: isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      message: isSuccess
        ? 'Mobile payment initiated successfully. Customer will receive USSD prompt.'
        : 'Payment failed. Please check phone number and balance.',
    };
  }

  private async simulateStatusCheck(id: string): Promise<PaymentStatusResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simulate different statuses based on ID patterns
    let status = PaymentStatus.COMPLETED;
    if (id.includes('PENDING')) status = PaymentStatus.PENDING;
    if (id.includes('FAILED')) status = PaymentStatus.FAILED;
    if (id.includes('HELD')) status = PaymentStatus.HELD;

    return {
      paymentId: id,
      status,
      amount: 100 + Math.random() * 1000, // Random amount for simulation
      currency: 'ZMW',
      providerTransactionId: `AM${Date.now()}`,
      processedAt: new Date(),
    };
  }
}
