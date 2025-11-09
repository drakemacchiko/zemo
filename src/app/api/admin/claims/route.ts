import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ClaimService } from '@/lib/insurance'
import { claimSearchSchema } from '@/lib/validations'

// Simple authentication helper with admin check
async function authenticateAdmin(request: NextRequest) {
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

  // TODO: Add proper admin role check when user roles are implemented
  // For now, we'll allow access to any authenticated user
  // In production, you should check if user.role === 'ADMIN' or similar

  return { success: true, user };
}

// GET /api/admin/claims - Get all claims for admin review
export async function GET(request: NextRequest) {
  try {
    // Authenticate as admin
    const authResult = await authenticateAdmin(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const queryData = {
      status: searchParams.get('status') || undefined,
      claimType: searchParams.get('claimType') || undefined,
      priority: searchParams.get('priority') || undefined,
      userId: searchParams.get('userId') || undefined,
      policyId: searchParams.get('policyId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    // Validate query parameters
    const validationResult = claimSearchSchema.safeParse(queryData);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const searchData = validationResult.data;

    // Admin can search all claims (no user filter)
    const filters: any = {
      page: searchData.page,
      limit: searchData.limit,
    };

    if (searchData.status) filters.status = searchData.status;
    if (searchData.claimType) filters.claimType = searchData.claimType;
    if (searchData.priority) filters.priority = searchData.priority;
    if (searchData.userId) filters.userId = searchData.userId;
    if (searchData.policyId) filters.policyId = searchData.policyId;
    if (searchData.startDate) filters.startDate = new Date(searchData.startDate);
    if (searchData.endDate) filters.endDate = new Date(searchData.endDate);

    // Search claims using service
    const result = await ClaimService.searchClaims(filters);

    // Add statistics for admin dashboard
    const statsPromises = [
      prisma.claim.count({ where: { status: 'SUBMITTED' } }),
      prisma.claim.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.claim.count({ where: { status: 'INVESTIGATING' } }),
      prisma.claim.count({ where: { priority: 'URGENT' } }),
    ];

    const [submittedCount, underReviewCount, investigatingCount, urgentCount] = await Promise.all(statsPromises);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        statistics: {
          submitted: submittedCount,
          underReview: underReviewCount,
          investigating: investigatingCount,
          urgent: urgentCount,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching claims for admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}