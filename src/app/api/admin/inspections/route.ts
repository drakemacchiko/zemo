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
 * Check if user is admin - for now, check if email contains 'admin'
 * In production, this should be replaced with proper role-based auth
 */
function isAdmin(user: any): boolean {
  return user.email.toLowerCase().includes('admin') || user.email.toLowerCase().includes('@zemo.');
}

// Validation schemas
const inspectionResolveSchema = z.object({
  status: z.enum(['COMPLETED', 'ACKNOWLEDGED', 'DISPUTED', 'RESOLVED']),
  adminNotes: z.string().optional(),
  adjustedDamageScore: z.number().min(0).optional(),
  adjustedEstimatedCost: z.number().min(0).optional(),
  overrideCondition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).optional(),
});

/**
 * GET /api/admin/inspections - List all inspections needing admin review
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Build query filters
    const where: any = {};
    
    if (status && ['PENDING', 'COMPLETED', 'ACKNOWLEDGED', 'DISPUTED', 'RESOLVED'].includes(status)) {
      where.status = status;
    }
    
    if (type && ['PICKUP', 'RETURN'].includes(type)) {
      where.inspectionType = type;
    }

    // Get inspections with related data
    const inspections = await prisma.vehicleInspection.findMany({
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
        photos: true,
        damageItems: true,
      },
      orderBy: [
        { status: 'asc' }, // Pending first
        { createdAt: 'desc' },
      ],
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.vehicleInspection.count({ where });

    // Get pending deposit adjustments
    const pendingAdjustments = await prisma.depositAdjustment.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        booking: {
          include: {
            vehicle: {
              select: {
                plateNumber: true,
                make: true,
                model: true,
              },
            },
            user: {
              select: {
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
    });

    return NextResponse.json({
      inspections,
      pendingAdjustments,
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
    console.error('Admin inspections list error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve inspections',
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/inspections - Bulk actions on inspections
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, inspectionIds, ...actionData } = body;

    if (!action || !inspectionIds || !Array.isArray(inspectionIds)) {
      return NextResponse.json({
        error: 'Action and inspectionIds are required',
      }, { status: 400 });
    }

    const results = [];

    for (const inspectionId of inspectionIds) {
      try {
        switch (action) {
          case 'approve':
            await prisma.vehicleInspection.update({
              where: { id: inspectionId },
              data: {
                status: 'ACKNOWLEDGED',
                acknowledgedBy: user.id,
                acknowledgedAt: new Date(),
              },
            });
            results.push({ inspectionId, status: 'approved' });
            break;

          case 'dispute':
            await prisma.vehicleInspection.update({
              where: { id: inspectionId },
              data: {
                status: 'DISPUTED',
                disputeRaised: true,
              },
            });
            results.push({ inspectionId, status: 'disputed' });
            break;

          case 'resolve':
            const resolveData = inspectionResolveSchema.parse(actionData);
            const updateData: any = {
              status: resolveData.status,
              acknowledgedBy: user.id,
              acknowledgedAt: new Date(),
            };

            if (resolveData.adjustedDamageScore !== undefined) {
              updateData.damageScore = resolveData.adjustedDamageScore;
            }

            if (resolveData.adjustedEstimatedCost !== undefined) {
              updateData.estimatedRepairCost = resolveData.adjustedEstimatedCost;
            }

            if (resolveData.overrideCondition) {
              updateData.overallCondition = resolveData.overrideCondition;
            }

            await prisma.vehicleInspection.update({
              where: { id: inspectionId },
              data: updateData,
            });

            results.push({ inspectionId, status: 'resolved' });
            break;

          default:
            results.push({ 
              inspectionId, 
              status: 'error', 
              message: `Unknown action: ${action}` 
            });
        }
      } catch (error) {
        console.error(`Error processing inspection ${inspectionId}:`, error);
        results.push({ 
          inspectionId, 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({
      message: `Bulk action ${action} completed`,
      results,
    });

  } catch (error) {
    console.error('Admin bulk action error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.issues,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to perform bulk action',
    }, { status: 500 });
  }
}