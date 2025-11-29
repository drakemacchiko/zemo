import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import * as stripe from '@/lib/payment/stripe';

const releaseDepositSchema = z.object({
  paymentId: z.string(),
  captureAmount: z.number().positive().optional(), // If capturing for damage
});

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = releaseDepositSchema.parse(body);

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
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Verify this is a security deposit
    if (payment.paymentType !== 'SECURITY_DEPOSIT') {
      return NextResponse.json(
        { error: 'Payment is not a security deposit' },
        { status: 400 }
      );
    }

    // Verify user is the host
    if (payment.booking.vehicle.hostId !== payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be vehicle host' },
        { status: 403 }
      );
    }

    // Verify booking has ended
    const now = new Date();
    if (payment.booking.endDate > now) {
      return NextResponse.json(
        { error: 'Cannot release deposit - trip not ended' },
        { status: 400 }
      );
    }

    let result;

    if (validatedData.captureAmount) {
      // Capture partial amount for damages
      if (payment.provider === 'STRIPE') {
        result = await stripe.captureHeldPayment(
          payment.providerTransactionId || '',
          validatedData.captureAmount
        );
      } else {
        return NextResponse.json(
          { error: 'Partial capture not supported for this provider' },
          { status: 400 }
        );
      }

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to capture deposit' },
          { status: 500 }
        );
      }

      // Create damage charge payment record
      await prisma.payment.create({
        data: {
          bookingId: payment.bookingId,
          userId: payment.userId,
          amount: validatedData.captureAmount,
          currency: payment.currency,
          paymentType: 'DAMAGE_CHARGE',
          provider: payment.provider,
          status: 'COMPLETED',
          intent: 'PAYMENT',
          providerTransactionId: (result as any).data?.id,
          providerReference: payment.id,
          processedAt: new Date(),
        },
      });

      // Update original deposit status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
        },
      });

      // Notify renter of damage charge
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          type: 'PAYMENT_SUCCESS',
          title: 'Damage Charge Applied',
          message: `A damage charge of ZMW ${validatedData.captureAmount.toFixed(2)} was applied to your security deposit`,
        },
      });
    } else {
      // Release full deposit (no damages)
      if (payment.provider === 'STRIPE') {
        result = await stripe.releaseHeldPayment(
          payment.providerTransactionId || ''
        );
      } else {
        // For Flutterwave, mark as released (funds weren't actually held)
        result = { success: true };
      }

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to release deposit' },
          { status: 500 }
        );
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'RELEASED',
        },
      });

      // Notify renter deposit is released
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          type: 'PAYMENT_SUCCESS',
          title: 'Security Deposit Released',
          message: `Your security deposit of ZMW ${payment.amount.toFixed(2)} has been released`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      deposit: {
        id: payment.id,
        status: validatedData.captureAmount ? 'COMPLETED' : 'RELEASED',
        amount: payment.amount,
        captured: validatedData.captureAmount || 0,
        released: validatedData.captureAmount 
          ? payment.amount - validatedData.captureAmount 
          : payment.amount,
      },
    });
  } catch (error: any) {
    console.error('Release deposit error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
