import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import * as stripe from '@/lib/payment/stripe';
import * as flutterwave from '@/lib/payment/flutterwave';

const confirmPaymentSchema = z.object({
  paymentId: z.string(),
  providerTransactionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = confirmPaymentSchema.parse(body);

    // Get payment
    const payment = await prisma.payment.findUnique({
      where: { id: validatedData.paymentId },
      include: {
        booking: {
          include: {
            vehicle: { include: { host: true } },
            user: true,
          },
        },
        user: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify user owns this payment
    if (payment.userId !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify payment with provider
    let verified = false;

    if (payment.provider === 'STRIPE') {
      const result = await stripe.getPaymentIntent(
        validatedData.providerTransactionId || payment.providerReference || ''
      );

      if (result.success && result.data?.status === 'succeeded') {
        verified = true;
      }
    } else {
      // Flutterwave verification
      const result = await flutterwave.verifyPayment(
        validatedData.providerTransactionId || payment.providerReference || ''
      );

      if (result.success && result.status === 'successful') {
        verified = true;
      }
    }

    if (!verified) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        providerTransactionId: validatedData.providerTransactionId || payment.providerReference,
        processedAt: new Date(),
      },
    });

    // Update booking status if this is the main payment
    if (payment.paymentType === 'BOOKING_PAYMENT') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: payment.booking.status === 'PENDING' ? 'CONFIRMED' : payment.booking.status,
        },
      });

      // Create notification for host
      await prisma.notification.create({
        data: {
          userId: payment.booking.vehicle.hostId,
          type: 'PAYMENT_SUCCESS',
          title: 'Payment Received',
          message: `You received ZMW ${payment.amount.toFixed(2)} for ${payment.booking.vehicle.make} ${payment.booking.vehicle.model}`,
        },
      });

      // Create notification for renter
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          type: 'BOOKING_CONFIRMED',
          title: 'Booking Confirmed',
          message: `Your booking for ${payment.booking.vehicle.make} ${payment.booking.vehicle.model} is confirmed!`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: 'COMPLETED',
        amount: payment.amount,
        currency: payment.currency,
      },
      booking: {
        id: payment.bookingId,
        status: payment.booking.status,
        confirmationNumber: payment.booking.confirmationNumber,
      },
    });
  } catch (error: any) {
    console.error('Confirm payment error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
