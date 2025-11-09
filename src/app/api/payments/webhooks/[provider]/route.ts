import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { webhookPayloadSchema } from '@/lib/payments/validations';

// Webhook signature verification
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// POST /api/payments/webhooks/[provider]
export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider.toUpperCase();
    const body = await request.text();
    const signature = request.headers.get('x-signature') || '';

    // Get webhook secret for provider
    let webhookSecret = '';
    switch (provider) {
      case 'AIRTEL_MONEY':
        webhookSecret = process.env.AIRTEL_MONEY_WEBHOOK_SECRET || 'airtel-secret';
        break;
      case 'MTN_MOMO':
        webhookSecret = process.env.MTN_MOMO_WEBHOOK_SECRET || 'mtn-secret';
        break;
      case 'STRIPE':
        webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'stripe-secret';
        break;
      case 'DPO':
        webhookSecret = process.env.DPO_WEBHOOK_SECRET || 'dpo-secret';
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported provider' },
          { status: 400 }
        );
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const webhookData = JSON.parse(body);
    const validatedPayload = webhookPayloadSchema.parse(webhookData);

    // Find the payment record
    const payment = await prisma.payment?.findFirst({
      where: {
        OR: [
          { id: validatedPayload.paymentId },
          { providerTransactionId: validatedPayload.paymentId }
        ]
      },
      include: {
        booking: true
      }
    });

    if (!payment) {
      console.error(`Payment not found: ${validatedPayload.paymentId}`);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    await prisma.payment?.update({
      where: { id: payment.id },
      data: {
        status: validatedPayload.status as any,
        processedAt: new Date(validatedPayload.timestamp),
        providerReference: validatedPayload.providerData.reference || payment.providerReference,
      }
    });

    // Update booking status if needed
    if (payment.booking && validatedPayload.status === 'COMPLETED') {
      if (payment.intent === 'PAYMENT') {
        await prisma.booking?.update({
          where: { id: payment.booking.id },
          data: {
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          }
        });
      }
    } else if (payment.booking && validatedPayload.status === 'FAILED') {
      await prisma.booking?.update({
        where: { id: payment.booking.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        }
      });
    }

    // Log webhook processing
    // Webhook processed successfully

    // Create transaction record for audit trail
    await prisma.transaction?.create({
      data: {
        paymentId: payment.id,
        amount: validatedPayload.amount,
        type: validatedPayload.eventType.includes('refund') ? 'REFUND' : 'CHARGE',
        status: validatedPayload.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
        providerTransactionId: validatedPayload.providerData.transactionId,
        providerReference: validatedPayload.providerData.reference,
        notes: `Webhook: ${validatedPayload.eventType}`,
      }
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: validatedPayload.status,
      processed: true
    });

  } catch (error) {
    console.error('Webhook processing error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid webhook payload', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// GET /api/payments/webhooks/[provider] - Webhook verification endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const challenge = request.nextUrl.searchParams.get('challenge');
  
  if (challenge) {
    // Return challenge for webhook verification (used by some providers)
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({
    provider: params.provider,
    status: 'active',
    timestamp: new Date().toISOString()
  });
}