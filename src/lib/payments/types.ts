// Payment service types and interfaces

export interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethodId?: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  providerTransactionId?: string;
  providerReference?: string;
  status: PaymentStatus;
  message?: string;
  error?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number; // If not provided, full refund
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId: string;
  amount: number;
  status: PaymentStatus;
  message?: string;
  error?: string;
}

export interface HoldRequest {
  amount: number;
  currency: string;
  paymentMethodId: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface HoldResponse {
  success: boolean;
  holdId: string;
  providerTransactionId?: string;
  status: PaymentStatus;
  message?: string;
  error?: string;
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  providerTransactionId?: string;
  processedAt?: Date;
  failureReason?: string;
}

export interface TokenizeCardRequest {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
  customerId?: string;
}

export interface TokenizeCardResponse {
  success: boolean;
  token: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  error?: string;
}

export interface MobileMoneyRequest {
  phoneNumber: string;
  amount: number;
  currency: string;
  description?: string;
  customerId?: string;
  metadata?: Record<string, any>;
}

export interface MobileMoneyResponse {
  success: boolean;
  transactionId: string;
  providerReference: string;
  status: PaymentStatus;
  message?: string;
  error?: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
}

export enum PaymentProvider {
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  MTN_MOMO = 'MTN_MOMO',
  ZAMTEL_KWACHA = 'ZAMTEL_KWACHA',
  STRIPE = 'STRIPE',
  DPO = 'DPO',
}

export abstract class PaymentService {
  abstract processPayment(request: PaymentRequest): Promise<PaymentResponse>;
  abstract refundPayment(request: RefundRequest): Promise<RefundResponse>;
  abstract getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse>;
  abstract holdFunds(request: HoldRequest): Promise<HoldResponse>;
  abstract releaseFunds(holdId: string): Promise<PaymentResponse>;
  abstract captureFunds(holdId: string, amount?: number): Promise<PaymentResponse>;
}

export abstract class MobileMoneyService extends PaymentService {
  abstract initiateMobilePayment(request: MobileMoneyRequest): Promise<MobileMoneyResponse>;
  abstract checkMobilePaymentStatus(transactionId: string): Promise<PaymentStatusResponse>;
}

export abstract class CardPaymentService extends PaymentService {
  abstract tokenizeCard(request: TokenizeCardRequest): Promise<TokenizeCardResponse>;
  abstract processCardPayment(request: PaymentRequest): Promise<PaymentResponse>;
}

export interface WebhookPayload {
  eventType: string;
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  timestamp: string;
  signature: string;
  providerData: Record<string, any>;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  payload?: any;
  error?: string;
}
