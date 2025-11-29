import { PaymentProvider } from './types';
import { PaymentService, MobileMoneyService, CardPaymentService } from './types';
import { AirtelMoneyService } from './providers/airtel-money';
import { MTNMoMoService } from './providers/mtn-momo';
import { ZamtelKwachaService } from './providers/zamtel-kwacha';
import { StripeService } from './providers/stripe';
import { DPOService } from './providers/dpo';

export class PaymentServiceFactory {
  private static services: Map<PaymentProvider, PaymentService> = new Map();

  static getService(provider: PaymentProvider): PaymentService {
    if (!this.services.has(provider)) {
      this.services.set(provider, this.createService(provider));
    }

    const service = this.services.get(provider);
    if (!service) {
      throw new Error(`Payment service not available for provider: ${provider}`);
    }

    return service;
  }

  static getMobileMoneyService(provider: PaymentProvider): MobileMoneyService {
    const service = this.getService(provider);
    if (!(service instanceof MobileMoneyService)) {
      throw new Error(`Provider ${provider} is not a mobile money service`);
    }
    return service;
  }

  static getCardPaymentService(provider: PaymentProvider): CardPaymentService {
    const service = this.getService(provider);
    if (!(service instanceof CardPaymentService)) {
      throw new Error(`Provider ${provider} is not a card payment service`);
    }
    return service;
  }

  private static createService(provider: PaymentProvider): PaymentService {
    switch (provider) {
      case PaymentProvider.AIRTEL_MONEY:
        return new AirtelMoneyService();
      case PaymentProvider.MTN_MOMO:
        return new MTNMoMoService();
      case PaymentProvider.ZAMTEL_KWACHA:
        return new ZamtelKwachaService();
      case PaymentProvider.STRIPE:
        return new StripeService();
      case PaymentProvider.DPO:
        return new DPOService();
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }

  static getSupportedProviders(): PaymentProvider[] {
    return Object.values(PaymentProvider);
  }

  static isMobileMoneyProvider(provider: PaymentProvider): boolean {
    return [
      PaymentProvider.AIRTEL_MONEY,
      PaymentProvider.MTN_MOMO,
      PaymentProvider.ZAMTEL_KWACHA,
    ].includes(provider);
  }

  static isCardPaymentProvider(provider: PaymentProvider): boolean {
    return [PaymentProvider.STRIPE, PaymentProvider.DPO].includes(provider);
  }
}

// Payment utilities
export class PaymentUtils {
  static generateTransactionId(prefix: string = 'ZEMO'): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  static formatAmount(amount: number, currency: string = 'ZMW'): string {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  static validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 1000000; // Max 1M ZMW
  }

  static validatePhoneNumber(phoneNumber: string): boolean {
    // Zambian phone number validation
    const zambianPhoneRegex = /^(\+260|0)?[7-9][0-9]{8}$/;
    return zambianPhoneRegex.test(phoneNumber);
  }

  static normalizePhoneNumber(phoneNumber: string): string {
    // Normalize to international format
    let normalized = phoneNumber.replace(/\s+/g, '');
    if (normalized.startsWith('0')) {
      normalized = '+260' + normalized.substring(1);
    } else if (!normalized.startsWith('+260')) {
      normalized = '+260' + normalized;
    }
    return normalized;
  }

  static calculateServiceFee(amount: number, provider: PaymentProvider): number {
    // Service fee calculation based on provider
    const feeRates = {
      [PaymentProvider.AIRTEL_MONEY]: 0.015, // 1.5%
      [PaymentProvider.MTN_MOMO]: 0.015, // 1.5%
      [PaymentProvider.ZAMTEL_KWACHA]: 0.02, // 2%
      [PaymentProvider.STRIPE]: 0.029, // 2.9%
      [PaymentProvider.DPO]: 0.025, // 2.5%
    };

    const rate = feeRates[provider] || 0.02;
    return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
  }
}

export * from './types';
export * from './providers/airtel-money';
export * from './providers/mtn-momo';
export * from './providers/zamtel-kwacha';
export * from './providers/stripe';
export * from './providers/dpo';
