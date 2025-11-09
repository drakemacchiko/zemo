import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { PaymentServiceFactory, PaymentUtils, PaymentProvider } from '@/lib/payments';
import { 
  paymentCreateSchema, 
  holdRequestSchema
} from '@/lib/payments/validations';

// Simple authentication helper
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, user: null };
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);
  if (!payload) {
    return { success: false, user: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true }
  });

  if (!user) {
    return { success: false, user: null };
  }

  return { success: true, user };
}

// POST /api/payments/process
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Determine payment type and validate accordingly
    let validatedData;

    if (body.intent === 'HOLD') {
      // Security deposit hold
      validatedData = holdRequestSchema.parse(body);
      
      // Verify booking exists and belongs to user
      const booking = await prisma.booking.findFirst({
        where: {
          id: validatedData.bookingId,
          userId: authResult.user.id,
          status: 'PENDING'
        },
        include: {
          vehicle: true
        }
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found or not eligible for payment' },
          { status: 404 }
        );
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          bookingId: validatedData.bookingId,
          userId: authResult.user.id,
          amount: validatedData.amount,
          currency: validatedData.currency,
          paymentType: 'SECURITY_DEPOSIT',
          provider: validatedData.provider,
          status: 'PENDING',
          intent: 'HOLD',
          paymentMethodId: validatedData.paymentMethodId,
        }
      });

      // Process the hold with payment service
      const paymentService = PaymentServiceFactory.getService(validatedData.provider as PaymentProvider);
      const holdResult = await paymentService.holdFunds({
        amount: validatedData.amount,
        currency: validatedData.currency,
        paymentMethodId: validatedData.paymentMethodId || '',
        customerId: authResult.user.id,
        description: `Security deposit for booking ${booking.confirmationNumber}`,
        metadata: {
          bookingId: booking.id,
          userId: authResult.user.id,
          vehicleId: booking.vehicleId,
        }
      });

      // Update payment record with result
      const updateData: any = {
        status: holdResult.success ? 'HELD' : 'FAILED',
      };
      
      if (holdResult.providerTransactionId) {
        updateData.providerTransactionId = holdResult.providerTransactionId;
      }
      
      if (holdResult.error) {
        updateData.failureReason = holdResult.error;
      }
      
      if (holdResult.success) {
        updateData.processedAt = new Date();
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: updateData
      });

      if (holdResult.success) {
        // Update booking status to confirmed if hold successful
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          }
        });
      }

      return NextResponse.json({
        success: holdResult.success,
        payment: {
          id: updatedPayment.id,
          status: updatedPayment.status,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
          provider: updatedPayment.provider,
        },
        message: holdResult.message || (holdResult.success ? 'Security deposit hold successful' : 'Security deposit hold failed'),
        error: holdResult.error,
      });

    } else {
      // Regular payment
      validatedData = paymentCreateSchema.parse(body);

      // Verify booking exists and belongs to user
      const booking = await prisma.booking.findFirst({
        where: {
          id: validatedData.bookingId,
          userId: authResult.user.id,
          status: { in: ['PENDING', 'CONFIRMED'] }
        },
        include: {
          vehicle: true
        }
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found or not eligible for payment' },
          { status: 404 }
        );
      }

      // Create payment record
      const paymentData: any = {
        bookingId: validatedData.bookingId,
        userId: authResult.user.id,
        amount: validatedData.amount,
        currency: validatedData.currency,
        paymentType: validatedData.paymentType,
        provider: validatedData.provider,
        status: 'PENDING',
        intent: validatedData.intent,
      };
      
      if (validatedData.paymentMethodId) {
        paymentData.paymentMethodId = validatedData.paymentMethodId;
      }

      const payment = await prisma.payment.create({
        data: paymentData
      });

      // Process the payment with payment service
      const paymentService = PaymentServiceFactory.getService(validatedData.provider as PaymentProvider);
      
      // Ensure paymentMethodId is provided for payment processing
      if (!validatedData.paymentMethodId) {
        return NextResponse.json(
          { error: 'Payment method ID is required for payment processing' },
          { status: 400 }
        );
      }
      
      const paymentResult = await paymentService.processPayment({
        amount: validatedData.amount,
        currency: validatedData.currency,
        paymentMethodId: validatedData.paymentMethodId,
        customerId: authResult.user.id,
        description: `Payment for booking ${booking.confirmationNumber}`,
        metadata: validatedData.metadata || {
          bookingId: booking.id,
          userId: authResult.user.id,
          vehicleId: booking.vehicleId,
        }
      });

      // Update payment record with result
      const paymentUpdateData: any = {
        status: paymentResult.success ? 'COMPLETED' : 'FAILED',
      };
      
      if (paymentResult.providerTransactionId) {
        paymentUpdateData.providerTransactionId = paymentResult.providerTransactionId;
      }
      
      if (paymentResult.providerReference) {
        paymentUpdateData.providerReference = paymentResult.providerReference;
      }
      
      if (paymentResult.error) {
        paymentUpdateData.failureReason = paymentResult.error;
      }
      
      if (paymentResult.success) {
        paymentUpdateData.processedAt = new Date();
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: paymentUpdateData
      });

      if (paymentResult.success && validatedData.paymentType === 'BOOKING_PAYMENT') {
        // Update booking status to confirmed if payment successful
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          }
        });
      }

      return NextResponse.json({
        success: paymentResult.success,
        payment: {
          id: updatedPayment.id,
          status: updatedPayment.status,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
          provider: updatedPayment.provider,
        },
        message: paymentResult.message || (paymentResult.success ? 'Payment processed successfully' : 'Payment processing failed'),
        error: paymentResult.error,
      });
    }

  } catch (error) {
    console.error('Payment processing error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/payments/process (for supported providers info)
export async function GET() {
  try {
    const supportedProviders = PaymentServiceFactory.getSupportedProviders();
    
    const providerInfo = supportedProviders.map(provider => ({
      provider,
      type: PaymentServiceFactory.isMobileMoneyProvider(provider) ? 'mobile_money' : 'card',
      serviceFee: PaymentUtils.calculateServiceFee(100, provider), // Fee rate for 100 ZMW
    }));

    return NextResponse.json({
      supportedProviders: providerInfo,
      currency: 'ZMW',
      maxAmount: 1000000, // 1M ZMW
      minAmount: 1, // 1 ZMW
    });
  } catch (error) {
    console.error('Get payment info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}