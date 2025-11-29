import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    select: { id: true, email: true },
  });

  if (!user) {
    return { success: false, user: null };
  }

  return { success: true, user };
}

// GET /api/insurance/policies - Get user's insurance policies
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {
      userId: authResult.user.id,
    };

    if (status) {
      where.status = status;
    }

    const [policies, total] = await Promise.all([
      prisma.insurancePolicy.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          insurance: true,
          booking: {
            include: {
              vehicle: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                  plateNumber: true,
                },
              },
            },
          },
          claims: {
            select: {
              id: true,
              claimNumber: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.insurancePolicy.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        policies,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching insurance policies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insurance policies' },
      { status: 500 }
    );
  }
}
