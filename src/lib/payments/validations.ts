import { z } from 'zod';

// Enums matching the database schema
export const PaymentTypeSchema = z.enum([
  'BOOKING_PAYMENT',
  'SECURITY_DEPOSIT',
  'REFUND',
  'PARTIAL_REFUND',
  'DAMAGE_CHARGE',
]);

export const PaymentProviderSchema = z.enum([
  'AIRTEL_MONEY',
  'MTN_MOMO',
  'ZAMTEL_KWACHA',
  'STRIPE',
  'DPO',
]);

export const PaymentStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
  'HELD',
  'RELEASED',
]);

export const PaymentIntentSchema = z.enum([
  'PAYMENT',
  'HOLD',
  'REFUND',
]);

export const PaymentMethodTypeSchema = z.enum([
  'MOBILE_MONEY',
  'CREDIT_CARD',
  'DEBIT_CARD',
]);

// Payment request validation
export const paymentCreateSchema = z.object({
  bookingId: z.string().cuid('Invalid booking ID'),
  amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too large'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('ZMW'),
  paymentType: PaymentTypeSchema,
  provider: PaymentProviderSchema,
  intent: PaymentIntentSchema.default('PAYMENT'),
  paymentMethodId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const mobileMoneyPaymentSchema = z.object({
  phoneNumber: z.string()
    .regex(/^(\+260|0)?[7-9][0-9]{8}$/, 'Invalid Zambian phone number format'),
  amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too large'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('ZMW'),
  provider: z.enum(['AIRTEL_MONEY', 'MTN_MOMO', 'ZAMTEL_KWACHA']),
  description: z.string().max(200, 'Description too long').optional(),
  customerId: z.string().optional(),
});

export const cardPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too large'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('ZMW'),
  provider: z.enum(['STRIPE', 'DPO']),
  paymentMethodId: z.string().min(1, 'Payment method ID required'),
  description: z.string().max(200, 'Description too long').optional(),
  customerId: z.string().optional(),
});

export const cardTokenizationSchema = z.object({
  cardNumber: z.string()
    .regex(/^[0-9]{13,19}$/, 'Invalid card number format')
    .transform(val => val.replace(/\s/g, '')), // Remove spaces
  expiryMonth: z.number().int().min(1).max(12),
  expiryYear: z.number().int().min(new Date().getFullYear()).max(new Date().getFullYear() + 20),
  cvv: z.string().regex(/^[0-9]{3,4}$/, 'Invalid CVV format'),
  cardholderName: z.string().min(2, 'Cardholder name required').max(100, 'Name too long'),
  customerId: z.string().optional(),
});

export const refundRequestSchema = z.object({
  paymentId: z.string().cuid('Invalid payment ID'),
  amount: z.number().positive('Amount must be positive').optional(), // If not provided, full refund
  reason: z.string().max(500, 'Reason too long').optional(),
});

export const holdRequestSchema = z.object({
  bookingId: z.string().cuid('Invalid booking ID'),
  amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too large'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('ZMW'),
  provider: PaymentProviderSchema,
  paymentMethodId: z.string().min(1, 'Payment method ID required'),
  description: z.string().max(200, 'Description too long').optional(),
  customerId: z.string().optional(),
});

export const paymentMethodCreateSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  type: PaymentMethodTypeSchema,
  provider: PaymentProviderSchema,
  token: z.string().min(1, 'Token required'),
  last4: z.string().length(4, 'Last 4 digits must be 4 characters').optional(),
  brand: z.string().max(50, 'Brand name too long').optional(),
  expiryMonth: z.number().int().min(1).max(12).optional(),
  expiryYear: z.number().int().min(new Date().getFullYear()).optional(),
  phoneNumber: z.string()
    .regex(/^(\+260|0)?[7-9][0-9]{8}$/, 'Invalid phone number format')
    .optional(),
  accountName: z.string().max(100, 'Account name too long').optional(),
  isDefault: z.boolean().default(false),
});

export const paymentStatusUpdateSchema = z.object({
  status: PaymentStatusSchema,
  providerTransactionId: z.string().optional(),
  providerReference: z.string().optional(),
  failureReason: z.string().max(500, 'Failure reason too long').optional(),
  processedAt: z.date().optional(),
});

export const webhookPayloadSchema = z.object({
  eventType: z.string().min(1, 'Event type required'),
  paymentId: z.string().cuid('Invalid payment ID'),
  status: PaymentStatusSchema,
  amount: z.number(),
  currency: z.string().length(3),
  timestamp: z.string().datetime('Invalid timestamp format'),
  signature: z.string().min(1, 'Signature required'),
  providerData: z.record(z.string(), z.any()),
});

// Payment search and filtering
export const paymentSearchSchema = z.object({
  userId: z.string().cuid().optional(),
  bookingId: z.string().cuid().optional(),
  status: PaymentStatusSchema.optional(),
  provider: PaymentProviderSchema.optional(),
  paymentType: PaymentTypeSchema.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Type exports for use in API routes
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type MobileMoneyPaymentInput = z.infer<typeof mobileMoneyPaymentSchema>;
export type CardPaymentInput = z.infer<typeof cardPaymentSchema>;
export type CardTokenizationInput = z.infer<typeof cardTokenizationSchema>;
export type RefundRequestInput = z.infer<typeof refundRequestSchema>;
export type HoldRequestInput = z.infer<typeof holdRequestSchema>;
export type PaymentMethodCreateInput = z.infer<typeof paymentMethodCreateSchema>;
export type PaymentStatusUpdateInput = z.infer<typeof paymentStatusUpdateSchema>;
export type WebhookPayloadInput = z.infer<typeof webhookPayloadSchema>;
export type PaymentSearchInput = z.infer<typeof paymentSearchSchema>;