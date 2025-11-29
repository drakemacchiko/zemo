/**
 * Flutterwave Payment Integration
 * Handles mobile money (Airtel, MTN) and card payments for Zambian users
 */

const Flutterwave = require('flutterwave-node-v3');

// Lazy initialization of Flutterwave to avoid build errors
let flw: any = null;

function getFlutterwaveClient() {
  if (!flw && process.env.FLUTTERWAVE_PUBLIC_KEY && process.env.FLUTTERWAVE_SECRET_KEY) {
    flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);
  }
  return flw;
}

export interface FlutterwavePaymentData {
  amount: number;
  currency: string;
  email: string;
  phone: string;
  name: string;
  txRef: string;
  redirectUrl: string;
}

export interface MobileMoneyPaymentData extends FlutterwavePaymentData {
  network: 'MTN' | 'AIRTEL' | 'ZAMTEL';
}

/**
 * Initialize card payment
 */
export async function initializeCardPayment(data: FlutterwavePaymentData) {
  try {
    const payload = {
      tx_ref: data.txRef,
      amount: data.amount,
      currency: data.currency,
      redirect_url: data.redirectUrl,
      customer: {
        email: data.email,
        phonenumber: data.phone,
        name: data.name,
      },
      customizations: {
        title: 'ZEMO Car Rental',
        description: 'Car rental payment',
        logo: 'https://zemo.com/logo.png',
      },
    };

    const client = getFlutterwaveClient();
    if (!client) {
      return { success: false, error: 'Payment service not configured' };
    }
    const response = await client.Charge.card(payload);
    return {
      success: true,
      data: response,
      link: response.data?.link,
    };
  } catch (error: any) {
    console.error('Flutterwave card payment error:', error);
    return {
      success: false,
      error: error.message || 'Payment initialization failed',
    };
  }
}

/**
 * Initialize mobile money payment (MTN, Airtel, Zamtel)
 */
export async function initializeMobileMoneyPayment(data: MobileMoneyPaymentData) {
  try {
    const payload = {
      tx_ref: data.txRef,
      amount: data.amount,
      currency: data.currency,
      email: data.email,
      phone_number: data.phone,
      fullname: data.name,
      network: data.network,
    };

    const client = getFlutterwaveClient();
    if (!client) {
      return { success: false, error: 'Payment service not configured' };
    }
    const response = await client.MobileMoney.zambia(payload);
    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Flutterwave mobile money error:', error);
    return {
      success: false,
      error: error.message || 'Mobile money payment failed',
    };
  }
}

/**
 * Verify payment transaction
 */
export async function verifyPayment(transactionId: string) {
  try {
    const client = getFlutterwaveClient();
    if (!client) {
      return { success: false, error: 'Payment service not configured' };
    }
    const response = await client.Transaction.verify({ id: transactionId });

    if (response.data.status === 'successful' && response.data.amount >= 1) {
      return {
        success: true,
        data: response.data,
        status: 'successful',
      };
    } else {
      return {
        success: false,
        status: response.data.status,
        message: 'Payment verification failed',
      };
    }
  } catch (error: any) {
    console.error('Flutterwave verification error:', error);
    return {
      success: false,
      error: error.message || 'Payment verification failed',
    };
  }
}

/**
 * Process refund
 */
export async function processRefund(transactionId: string, amount?: number) {
  try {
    const client = getFlutterwaveClient();
    if (!client) {
      return { success: false, error: 'Payment service not configured' };
    }
    const payload = {
      id: transactionId,
      ...(amount && { amount }),
    };

    const response = await client.Transaction.refund(payload);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Flutterwave refund error:', error);
    return {
      success: false,
      error: error.message || 'Refund processing failed',
    };
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: any, signature: string): boolean {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha256', process.env.FLUTTERWAVE_SECRET_HASH || '')
    .update(JSON.stringify(payload))
    .digest('hex');

  return hash === signature;
}
