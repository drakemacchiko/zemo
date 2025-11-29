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

export class MTNMoMoService extends MobileMoneyService {
  private readonly isProduction: boolean;

  constructor() {
    super();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (!this.isProduction) {
        return this.simulatePayment(request);
      }

      throw new Error('Production MTN MoMo integration not implemented');
    } catch (error) {
      return {
        success: false,
        paymentId: PaymentUtils.generateTransactionId('MTN'),
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

      throw new Error('Production MTN MoMo refund not implemented');
    } catch (error) {
      return {
        success: false,
        refundId: PaymentUtils.generateTransactionId('MTNR'),
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

    throw new Error('Production MTN MoMo status check not implemented');
  }

  async holdFunds(request: HoldRequest): Promise<HoldResponse> {
    try {
      if (!this.isProduction) {
        return this.simulateHold(request);
      }

      throw new Error('Production MTN MoMo hold not implemented');
    } catch (error) {
      return {
        success: false,
        holdId: PaymentUtils.generateTransactionId('MTNH'),
        status: PaymentStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async releaseFunds(holdId: string): Promise<PaymentResponse> {
    if (!this.isProduction) {
      return this.simulateRelease(holdId);
    }

    throw new Error('Production MTN MoMo release not implemented');
  }

  async captureFunds(holdId: string, amount?: number): Promise<PaymentResponse> {
    if (!this.isProduction) {
      return this.simulateCapture(holdId, amount);
    }

    throw new Error('Production MTN MoMo capture not implemented');
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

      throw new Error('Production MTN MoMo mobile payment not implemented');
    } catch (error) {
      return {
        success: false,
        transactionId: PaymentUtils.generateTransactionId('MTN'),
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

    throw new Error('Production MTN MoMo status check not implemented');
  }

  // Sandbox simulation methods
  private async simulatePayment(_request: PaymentRequest): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 2000));

    const paymentId = PaymentUtils.generateTransactionId('MTN');

    // Simulate 88% success rate (slightly different from Airtel)
    const isSuccess = Math.random() > 0.12;

    if (isSuccess) {
      return {
        success: true,
        paymentId,
        providerTransactionId: `MTN${Date.now()}`,
        providerReference: `MTNMOMO-${paymentId}`,
        status: PaymentStatus.COMPLETED,
        message: 'Payment processed successfully via MTN Mobile Money',
      };
    } else {
      return {
        success: false,
        paymentId,
        status: PaymentStatus.FAILED,
        error: 'Transaction declined or insufficient balance',
      };
    }
  }

  private async simulateRefund(request: RefundRequest): Promise<RefundResponse> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const refundId = PaymentUtils.generateTransactionId('MTNR');

    // Simulate 93% success rate for refunds
    const isSuccess = Math.random() > 0.07;

    return {
      success: isSuccess,
      refundId,
      amount: request.amount || 100,
      status: isSuccess ? PaymentStatus.REFUNDED : PaymentStatus.FAILED,
      message: isSuccess ? 'Refund processed successfully' : 'Refund processing failed',
    };
  }

  private async simulateHold(_request: HoldRequest): Promise<HoldResponse> {
    await new Promise(resolve => setTimeout(resolve, 900 + Math.random() * 1500));

    const holdId = PaymentUtils.generateTransactionId('MTNH');

    // Simulate 82% success rate for holds
    const isSuccess = Math.random() > 0.18;

    if (isSuccess) {
      return {
        success: true,
        holdId,
        providerTransactionId: `MTNH${Date.now()}`,
        status: PaymentStatus.HELD,
        message: 'Funds authorization successful',
      };
    } else {
      return {
        success: false,
        holdId,
        status: PaymentStatus.FAILED,
        message: 'Authorization failed - please check balance',
      };
    }
  }

  private async simulateRelease(holdId: string): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      success: true,
      paymentId: holdId,
      status: PaymentStatus.RELEASED,
      message: 'Authorization released successfully',
    };
  }

  private async simulateCapture(holdId: string, amount?: number): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 700));

    return {
      success: true,
      paymentId: holdId,
      status: PaymentStatus.COMPLETED,
      message: `Payment captured ${amount ? PaymentUtils.formatAmount(amount) : 'successfully'}`,
    };
  }

  private async simulateMobilePayment(request: MobileMoneyRequest): Promise<MobileMoneyResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const transactionId = PaymentUtils.generateTransactionId('MTN');

    // Simulate success rate based on phone number patterns
    const normalizedPhone = PaymentUtils.normalizePhoneNumber(request.phoneNumber);
    const isSuccess = !normalizedPhone.includes('1111'); // Fail if phone contains 1111

    return {
      success: isSuccess,
      transactionId,
      providerReference: `MTN-${Date.now()}`,
      status: isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      message: isSuccess
        ? 'MTN Mobile Money payment initiated. Customer will receive USSD notification.'
        : 'Payment request failed. Verify phone number and account status.',
    };
  }

  private async simulateStatusCheck(id: string): Promise<PaymentStatusResponse> {
    await new Promise(resolve => setTimeout(resolve, 250));

    // Simulate different statuses based on ID patterns
    let status = PaymentStatus.COMPLETED;
    if (id.includes('PENDING')) status = PaymentStatus.PENDING;
    if (id.includes('FAILED')) status = PaymentStatus.FAILED;
    if (id.includes('PROCESSING')) status = PaymentStatus.PROCESSING;

    return {
      paymentId: id,
      status,
      amount: 50 + Math.random() * 2000,
      currency: 'ZMW',
      providerTransactionId: `MTN${Date.now()}`,
      processedAt: new Date(),
    };
  }
}
