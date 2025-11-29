import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import * as stripe from '@/lib/payment/stripe';
import * as flutterwave from '@/lib/payment/flutterwave';

const refundSchema = z.object({
  paymentId: z.string(),
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
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
    const validatedData = refundSchema.parse(body);

    // Get payment
    const payment = await prisma.payment.findUnique({
      where: { id: validatedData.paymentId },
      include: {
        booking: {
          include: {
            vehicle: true,
            user: { include: { profile: true } },
          },
        },
        user: { include: { profile: true } },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify payment can be refunded
    if (payment.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment not completed, cannot refund' }, { status: 400 });
    }

    // Verify user is authorized (must be renter or host)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isRenter = payment.booking.userId === user.id;
    const isHost = payment.booking.vehicle.hostId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isRenter && !isHost && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to process refund' }, { status: 403 });
    }

    // Calculate refund amount based on cancellation policy
    const refundAmount = validatedData.amount || payment.amount;

    if (refundAmount > payment.amount) {
      return NextResponse.json({ error: 'Refund amount exceeds payment amount' }, { status: 400 });
    }

    // Process refund with payment provider
    let result;

    if (payment.provider === 'STRIPE') {
      result = await stripe.processRefund(
        payment.providerTransactionId || payment.providerReference || '',
        refundAmount
      );
    } else {
      // Flutterwave refund
      result = await flutterwave.processRefund(
        payment.providerTransactionId || payment.providerReference || '',
        refundAmount
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Refund processing failed' },
        { status: 500 }
      );
    }

    // Create refund payment record
    const refundPayment = await prisma.payment.create({
      data: {
        bookingId: payment.bookingId,
        userId: payment.userId,
        amount: refundAmount,
        currency: payment.currency,
        paymentType: refundAmount === payment.amount ? 'REFUND' : 'PARTIAL_REFUND',
        provider: payment.provider,
        status: 'COMPLETED',
        intent: 'REFUND',
        providerTransactionId: (result as any).refundId || (result as any).data?.id,
        providerReference: payment.id, // Reference original payment
        processedAt: new Date(),
      },
    });

    // Update original payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: refundAmount === payment.amount ? 'REFUNDED' : 'COMPLETED',
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'CANCELLED',
      },
    });

    // Create notifications
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: 'PAYMENT_SUCCESS',
        title: 'Refund Processed',
        message: `Your refund of ZMW ${refundAmount.toFixed(2)} has been processed`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: payment.booking.vehicle.hostId,
        type: 'BOOKING_CANCELLED',
        title: 'Booking Cancelled',
        message: `Booking for ${payment.booking.vehicle.make} ${payment.booking.vehicle.model} was cancelled`,
      },
    });

    return NextResponse.json({
      success: true,
      refund: {
        id: refundPayment.id,
        amount: refundAmount,
        currency: payment.currency,
        status: 'COMPLETED',
      },
    });
  } catch (error: any) {
    console.error('Refund payment error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
