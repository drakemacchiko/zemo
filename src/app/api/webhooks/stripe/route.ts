import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as stripe from '@/lib/payment/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature
    const event = stripe.verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    if (!event) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Stripe webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;

      case 'charge.refunded':
        await handleRefundProcessed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    // Find payment by provider transaction ID
    const payment = await prisma.payment.findFirst({
      where: {
        providerTransactionId: paymentIntent.id,
      },
      include: {
        booking: {
          include: {
            vehicle: true,
          },
        },
      },
    });

    if (!payment) {
      console.error('Payment not found for intent:', paymentIntent.id);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    // Update booking if this is the main payment
    if (payment.paymentType === 'BOOKING_PAYMENT') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'CONFIRMED',
        },
      });

      // Create notifications
      await prisma.notification.create({
        data: {
          userId: payment.booking.vehicle.hostId,
          type: 'PAYMENT_SUCCESS',
          title: 'Payment Received',
          message: `Payment received for ${payment.booking.vehicle.make} ${payment.booking.vehicle.model}`,
        },
      });
    }

    console.log('Payment succeeded:', payment.id);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        providerTransactionId: paymentIntent.id,
      },
    });

    if (!payment) return;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: 'PAYMENT_FAILED',
        title: 'Payment Failed',
        message: 'Your payment could not be processed.',
      },
    });

    console.log('Payment failed:', payment.id);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handlePaymentCanceled(paymentIntent: any) {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        providerTransactionId: paymentIntent.id,
      },
    });

    if (!payment) return;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CANCELLED',
      },
    });

    console.log('Payment canceled:', payment.id);
  } catch (error) {
    console.error('Error handling payment canceled:', error);
  }
}

async function handleRefundProcessed(charge: any) {
  try {
    // Find original payment
    const originalPayment = await prisma.payment.findFirst({
      where: {
        providerTransactionId: charge.payment_intent,
      },
    });

    if (!originalPayment) return;

    // Update payment status
    await prisma.payment.update({
      where: { id: originalPayment.id },
      data: {
        status: 'REFUNDED',
      },
    });

    console.log('Refund processed for payment:', originalPayment.id);
  } catch (error) {
    console.error('Error handling refund:', error);
  }
}
