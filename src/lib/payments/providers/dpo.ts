import {
  CardPaymentService,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  PaymentStatusResponse,
  HoldResponse,
  TokenizeCardRequest,
  TokenizeCardResponse,
  PaymentStatus,
} from '../types';
import { PaymentUtils } from '../index';

export class DPOService extends CardPaymentService {
  private readonly isProduction: boolean;

  constructor() {
    super();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  async processPayment(): Promise<PaymentResponse> {
    if (!this.isProduction) {
      return this.simulatePayment();
    }

    throw new Error('Production DPO integration not implemented');
  }

  async refundPayment(request: RefundRequest): Promise<RefundResponse> {
    if (!this.isProduction) {
      return this.simulateRefund(request);
    }

    throw new Error('Production DPO refund not implemented');
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    if (!this.isProduction) {
      return this.simulateStatusCheck(paymentId);
    }

    throw new Error('Production DPO status check not implemented');
  }

  async holdFunds(): Promise<HoldResponse> {
    if (!this.isProduction) {
      return this.simulateHold();
    }

    throw new Error('Production DPO hold not implemented');
  }

  async releaseFunds(holdId: string): Promise<PaymentResponse> {
    if (!this.isProduction) {
      return this.simulateRelease(holdId);
    }

    throw new Error('Production DPO release not implemented');
  }

  async captureFunds(holdId: string, amount?: number): Promise<PaymentResponse> {
    if (!this.isProduction) {
      return this.simulateCapture(holdId, amount);
    }

    throw new Error('Production DPO capture not implemented');
  }

  async tokenizeCard(request: TokenizeCardRequest): Promise<TokenizeCardResponse> {
    if (!this.isProduction) {
      return this.simulateTokenization(request);
    }

    throw new Error('Production DPO tokenization not implemented');
  }

  async processCardPayment(): Promise<PaymentResponse> {
    return this.processPayment();
  }

  // Simplified sandbox methods
  private async simulatePayment(): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      success: true,
      paymentId: PaymentUtils.generateTransactionId('DPO'),
      providerTransactionId: `DPO${Date.now()}`,
      status: PaymentStatus.COMPLETED,
      message: 'DPO payment simulation successful',
    };
  }

  private async simulateRefund(request: RefundRequest): Promise<RefundResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      success: true,
      refundId: PaymentUtils.generateTransactionId('DPOR'),
      amount: request.amount || 100,
      status: PaymentStatus.REFUNDED,
      message: 'DPO refund simulation successful',
    };
  }

  private async simulateHold(): Promise<HoldResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      holdId: PaymentUtils.generateTransactionId('DPOH'),
      providerTransactionId: `DPOH${Date.now()}`,
      status: PaymentStatus.HELD,
      message: 'DPO hold simulation successful',
    };
  }

  private async simulateRelease(holdId: string): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      success: true,
      paymentId: holdId,
      status: PaymentStatus.RELEASED,
      message: 'DPO release simulation successful',
    };
  }

  private async simulateCapture(holdId: string, amount?: number): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      success: true,
      paymentId: holdId,
      status: PaymentStatus.COMPLETED,
      message: `DPO capture simulation ${amount ? 'for ' + PaymentUtils.formatAmount(amount) : 'successful'}`,
    };
  }

  private async simulateTokenization(request: TokenizeCardRequest): Promise<TokenizeCardResponse> {
    await new Promise(resolve => setTimeout(resolve, 700));

    const last4 = request.cardNumber.slice(-4);
    let brand = 'Unknown';
    const firstDigit = request.cardNumber.charAt(0);
    if (firstDigit === '4') brand = 'Visa';
    else if (firstDigit === '5') brand = 'Mastercard';

    return {
      success: true,
      token: `dpo_tok_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      last4,
      brand,
      expiryMonth: request.expiryMonth,
      expiryYear: request.expiryYear,
    };
  }

  private async simulateStatusCheck(id: string): Promise<PaymentStatusResponse> {
    await new Promise(resolve => setTimeout(resolve, 250));

    return {
      paymentId: id,
      status: PaymentStatus.COMPLETED,
      amount: 40 + Math.random() * 800,
      currency: 'ZMW',
      providerTransactionId: `DPO${Date.now()}`,
      processedAt: new Date(),
    };
  }
}
