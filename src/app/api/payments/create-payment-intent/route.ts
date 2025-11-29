import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import * as stripe from '@/lib/payment/stripe';
import * as flutterwave from '@/lib/payment/flutterwave';

const paymentIntentSchema = z.object({
  bookingId: z.string(),
  paymentType: z.enum(['BOOKING_PAYMENT', 'SECURITY_DEPOSIT']),
  provider: z.enum(['STRIPE', 'AIRTEL_MONEY', 'MTN_MOMO', 'ZAMTEL_KWACHA']),
  paymentMethodType: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_MONEY']),
  phoneNumber: z.string().optional(),
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
    const validatedData = paymentIntentSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        vehicle: true,
        user: { include: { profile: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify user is the renter
    if (booking.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - not booking owner' },
        { status: 403 }
      );
    }

    // Determine amount based on payment type
    const amount = validatedData.paymentType === 'BOOKING_PAYMENT'
      ? booking.totalAmount
      : booking.securityDeposit;

    const currency = 'ZMW';
    const customerName = user.profile
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user.email;

    let result;
    let providerRef: string | undefined;

    // Process based on provider
    if (validatedData.provider === 'STRIPE') {
      // Stripe for international payments
      const paymentData = {
        amount,
        currency: 'USD', // Stripe uses USD for international
        email: user.email,
        name: customerName,
        description: `${validatedData.paymentType === 'BOOKING_PAYMENT' ? 'Booking payment' : 'Security deposit'}`,
        metadata: {
          bookingId: booking.id,
          userId: user.id,
          paymentType: validatedData.paymentType,
        },
      };

      if (validatedData.paymentType === 'SECURITY_DEPOSIT') {
        result = await stripe.createDepositHold(paymentData);
      } else {
        result = await stripe.createPaymentIntent(paymentData);
      }

      if (result.success) {
        providerRef = result.paymentIntentId;
      }
    } else {
      // Flutterwave for Zambian mobile money
      const txRef = `ZEMO-${Date.now()}-${booking.id}`;
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}/payment-callback`;

      if (validatedData.paymentMethodType === 'MOBILE_MONEY') {
        if (!validatedData.phoneNumber) {
          return NextResponse.json(
            { error: 'Phone number required for mobile money' },
            { status: 400 }
          );
        }

        const network = validatedData.provider === 'MTN_MOMO' ? 'MTN'
          : validatedData.provider === 'AIRTEL_MONEY' ? 'AIRTEL'
          : 'ZAMTEL';

        result = await flutterwave.initializeMobileMoneyPayment({
          amount,
          currency,
          email: user.email,
          phone: validatedData.phoneNumber,
          name: customerName,
          txRef,
          redirectUrl,
          network,
        });
      } else {
        result = await flutterwave.initializeCardPayment({
          amount,
          currency,
          email: user.email,
          phone: validatedData.phoneNumber || '',
          name: customerName,
          txRef,
          redirectUrl,
        });
      }

      if (result.success) {
        providerRef = result.data?.data?.id || txRef;
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment initialization failed' },
        { status: 500 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: user.id,
        amount,
        currency,
        paymentType: validatedData.paymentType,
        provider: validatedData.provider,
        status: 'PENDING',
        intent: validatedData.paymentType === 'SECURITY_DEPOSIT' ? 'HOLD' : 'PAYMENT',
        providerReference: providerRef || null,
      },
    });

    // Return client secret or payment link
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      clientSecret: (result as any).clientSecret,
      paymentLink: (result as any).link,
      provider: validatedData.provider,
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    
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
