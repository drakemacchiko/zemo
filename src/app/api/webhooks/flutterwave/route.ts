import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as flutterwave from '@/lib/payment/flutterwave';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('verif-hash');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = flutterwave.verifyWebhookSignature(body, signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle different event types
    switch (body.event) {
      case 'charge.completed':
        await handleChargeCompleted(body.data);
        break;

      case 'charge.failed':
        await handleChargeFailed(body.data);
        break;

      case 'transfer.completed':
        await handleTransferCompleted(body.data);
        break;

      default:
        // Unhandled event type - could be logged to monitoring service
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Flutterwave webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleChargeCompleted(data: any) {
  try {
    // Find payment by provider transaction ID
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ providerTransactionId: data.id.toString() }, { providerReference: data.tx_ref }],
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
      console.error('Payment not found for transaction:', data.id);
      return;
    }

    // Verify amount matches
    if (data.amount !== payment.amount) {
      console.error('Amount mismatch:', data.amount, payment.amount);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        providerTransactionId: data.id.toString(),
        processedAt: new Date(),
      },
    });

    // Update booking if this is main payment
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
          message: `Payment of ZMW ${payment.amount.toFixed(2)} received for ${payment.booking.vehicle.make} ${payment.booking.vehicle.model}`,
        },
      });

      await prisma.notification.create({
        data: {
          userId: payment.userId,
          type: 'BOOKING_CONFIRMED',
          title: 'Booking Confirmed',
          message: `Your booking for ${payment.booking.vehicle.make} ${payment.booking.vehicle.model} is confirmed!`,
        },
      });
    }
  } catch (error) {
    console.error('Error handling charge completed:', error);
  }
}

async function handleChargeFailed(data: any) {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ providerTransactionId: data.id.toString() }, { providerReference: data.tx_ref }],
      },
    });

    if (!payment) return;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failureReason: data.processor_response || 'Payment failed',
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: 'PAYMENT_FAILED',
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please try again.',
      },
    });
  } catch (error) {
    console.error('Error handling charge failed:', error);
  }
}

async function handleTransferCompleted(_data: any) {
  try {
    // Handle payout to host
    // Add logic for tracking payouts to hosts
  } catch (error) {
    console.error('Error handling transfer:', error);
  }
}
