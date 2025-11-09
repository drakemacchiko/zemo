import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { PaymentServiceFactory } from '@/lib/payments';

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

// GET /api/payments/[id]/status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const paymentId = params.id;

    // Find the payment record
    const payment = await prisma.payment?.findFirst({
      where: {
        id: paymentId,
        userId: authResult.user.id, // Ensure user owns this payment
      },
      include: {
        booking: {
          select: {
            id: true,
            confirmationNumber: true,
            status: true,
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get updated status from payment provider if needed
    let providerStatus = null;
    if (payment.providerTransactionId && payment.status === 'PROCESSING') {
      try {
        const paymentService = PaymentServiceFactory.getService(payment.provider as any);
        providerStatus = await paymentService.getPaymentStatus(payment.providerTransactionId);
        
        // Update local payment record if status changed
        if (providerStatus.status !== payment.status) {
          await prisma.payment?.update({
            where: { id: payment.id },
            data: {
              status: providerStatus.status as any,
              processedAt: providerStatus.processedAt || new Date(),
            }
          });
        }
      } catch (error) {
        console.error('Error checking provider status:', error);
        // Continue with local status if provider check fails
      }
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        status: providerStatus?.status || payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentType: payment.paymentType,
        provider: payment.provider,
        intent: payment.intent,
        providerTransactionId: payment.providerTransactionId,
        processedAt: payment.processedAt,
        failureReason: payment.failureReason,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
      booking: payment.booking,
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}