import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth';
import { z } from 'zod';

/**
 * Verify authentication token and return user info
 */
async function verifyAuthToken(request: NextRequest) {
  const token = extractTokenFromRequest(request);
  
  if (!token) {
    return null;
  }
  
  const payload = verifyAccessToken(token);
  if (!payload) {
    return null;
  }
  
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { 
      id: true, 
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
        }
      }
    }
  });
  
  return user;
}

/**
 * Check if user is admin
 */
function isAdmin(user: any): boolean {
  return user.email.toLowerCase().includes('admin') || user.email.toLowerCase().includes('@zemo.');
}

// Validation schemas
const adjustmentActionSchema = z.object({
  status: z.enum(['APPROVED', 'PROCESSED', 'RESOLVED']),
  justification: z.string().optional(),
  adjustedAmount: z.number().min(0).optional(),
});

/**
 * GET /api/admin/deposit-adjustments - List all deposit adjustments
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Build query filters
    const where: any = {};
    
    if (status && ['PENDING', 'CALCULATED', 'APPROVED', 'PROCESSED', 'DISPUTED', 'RESOLVED'].includes(status)) {
      where.status = status;
    }

    // Get deposit adjustments with related data
    const adjustments = await prisma.depositAdjustment.findMany({
      where,
      include: {
        booking: {
          include: {
            vehicle: {
              select: {
                id: true,
                plateNumber: true,
                make: true,
                model: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // Pending first
        { createdAt: 'desc' },
      ],
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.depositAdjustment.count({ where });

    return NextResponse.json({
      adjustments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: offset + limit < totalCount,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Admin deposit adjustments list error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve deposit adjustments',
    }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/deposit-adjustments/:id - Update deposit adjustment status
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const adjustmentId = pathParts[pathParts.length - 1];

    if (!adjustmentId) {
      return NextResponse.json({ error: 'Adjustment ID required' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = adjustmentActionSchema.parse(body);

    // Get existing adjustment
    const existingAdjustment = await prisma.depositAdjustment.findUnique({
      where: { id: adjustmentId },
      include: {
        booking: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingAdjustment) {
      return NextResponse.json({ error: 'Deposit adjustment not found' }, { status: 404 });
    }

    if (existingAdjustment.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Can only modify pending adjustments' 
      }, { status: 400 });
    }

    // Update the adjustment
    const updateData: any = {
      status: validatedData.status,
      adjustmentAmount: validatedData.adjustedAmount || existingAdjustment.adjustmentAmount,
      processedBy: user.id,
      processedAt: new Date(),
    };

    if (validatedData.justification !== undefined) {
      updateData.justification = validatedData.justification;
    }

    const updatedAdjustment = await prisma.depositAdjustment.update({
      where: { id: adjustmentId },
      data: updateData,
      include: {
        booking: {
          include: {
            user: true,
            vehicle: true,
          },
        },
      },
    });

    // If approved or processed, handle the actual deposit adjustment
    if (validatedData.status === 'APPROVED' || validatedData.status === 'PROCESSED') {
      const finalAmount = validatedData.adjustedAmount || existingAdjustment.adjustmentAmount;
      
      // Update the booking's deposit status
      await prisma.booking.update({
        where: { id: existingAdjustment.bookingId },
        data: {
          status: 'COMPLETED',
        },
      });

      // Create a payment transaction for the refund/charge
      await prisma.payment.create({
        data: {
          bookingId: existingAdjustment.bookingId,
          userId: existingAdjustment.booking.userId,
          amount: Math.abs(finalAmount),
          currency: 'ZMW',
          paymentType: finalAmount < 0 ? 'DAMAGE_CHARGE' : 'REFUND',
          status: 'PENDING',
          provider: 'AIRTEL_MONEY',
          intent: finalAmount < 0 ? 'PAYMENT' : 'REFUND',
        },
      });
    }

    return NextResponse.json({
      message: 'Deposit adjustment processed successfully',
      adjustment: updatedAdjustment,
    });

  } catch (error) {
    console.error('Admin deposit adjustment update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.issues,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to update deposit adjustment',
    }, { status: 500 });
  }
}