/**
 * Stripe Payment Integration
 * Handles international card payments
 */

import Stripe from 'stripe';

// Lazy initialization of Stripe to avoid build errors
let stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });
  }
  if (!stripe) {
    throw new Error('Stripe not configured');
  }
  return stripe;
}

export interface StripePaymentData {
  amount: number;
  currency: string;
  email: string;
  name: string;
  description: string;
  metadata?: Record<string, string>;
}

/**
 * Create payment intent for card payment
 */
export async function createPaymentIntent(data: StripePaymentData) {
  try {
    const client = getStripeClient();
    const paymentIntent = await client.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency.toLowerCase(),
      description: data.description,
      receipt_email: data.email,
      metadata: {
        customer_name: data.name,
        ...data.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    console.error('Stripe payment intent error:', error);
    return {
      success: false,
      error: error.message || 'Payment intent creation failed',
    };
  }
}

/**
 * Create payment intent for security deposit (with hold)
 */
export async function createDepositHold(data: StripePaymentData) {
  try {
    const client = getStripeClient();
    const paymentIntent = await client.paymentIntents.create({
      amount: Math.round(data.amount * 100),
      currency: data.currency.toLowerCase(),
      description: `Security deposit hold - ${data.description}`,
      receipt_email: data.email,
      capture_method: 'manual', // Don't capture immediately - just authorize
      metadata: {
        customer_name: data.name,
        type: 'security_deposit',
        ...data.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    console.error('Stripe deposit hold error:', error);
    return {
      success: false,
      error: error.message || 'Deposit hold creation failed',
    };
  }
}

/**
 * Capture held payment (for damage charges)
 */
export async function captureHeldPayment(paymentIntentId: string, amount?: number) {
  try {
    const captureData: any = {};
    if (amount) {
      captureData.amount_to_capture = Math.round(amount * 100);
    }

    const client = getStripeClient();
    const paymentIntent = await client.paymentIntents.capture(
      paymentIntentId,
      captureData
    );

    return {
      success: true,
      data: paymentIntent,
    };
  } catch (error: any) {
    console.error('Stripe capture error:', error);
    return {
      success: false,
      error: error.message || 'Payment capture failed',
    };
  }
}

/**
 * Release held payment (cancel authorization)
 */
export async function releaseHeldPayment(paymentIntentId: string) {
  try {
    const client = getStripeClient();
    const paymentIntent = await client.paymentIntents.cancel(paymentIntentId);

    return {
      success: true,
      data: paymentIntent,
    };
  } catch (error: any) {
    console.error('Stripe release error:', error);
    return {
      success: false,
      error: error.message || 'Payment release failed',
    };
  }
}

/**
 * Process refund
 */
export async function processRefund(paymentIntentId: string, amount?: number) {
  try {
    const refundData: any = {
      payment_intent: paymentIntentId,
    };
    
    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const client = getStripeClient();
    const refund = await client.refunds.create(refundData);

    return {
      success: true,
      data: refund,
      refundId: refund.id,
    };
  } catch (error: any) {
    console.error('Stripe refund error:', error);
    return {
      success: false,
      error: error.message || 'Refund processing failed',
    };
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    const client = getStripeClient();
    return client.webhooks.constructEvent(payload, signature, secret);
  } catch (error: any) {
    console.error('Stripe webhook verification error:', error);
    return null;
  }
}

/**
 * Retrieve payment intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const client = getStripeClient();
    const paymentIntent = await client.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      data: paymentIntent,
    };
  } catch (error: any) {
    console.error('Stripe retrieve error:', error);
    return {
      success: false,
      error: error.message || 'Payment intent retrieval failed',
    };
  }
}
