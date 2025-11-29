import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ClaimService } from '@/lib/insurance';
import { adminClaimActionSchema } from '@/lib/validations';

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
    select: { id: true, email: true },
  });

  if (!user) {
    return { success: false, user: null };
  }

  // TODO: Add proper admin role check when user roles are implemented
  // For now, we'll allow access to any authenticated user
  // In production, you should check if user.role === 'ADMIN' or similar

  return { success: true, user };
}

// GET /api/admin/claims/[id] - Get specific claim for admin
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate as admin
    const authResult = await authenticateAdmin(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const claimId = params.id;

    // Admin can view any claim (no user restriction)
    const claim = await ClaimService.getClaimById(claimId);

    return NextResponse.json({
      success: true,
      data: claim,
    });
  } catch (error: any) {
    console.error('Error fetching claim for admin:', error);

    if (error.message.includes('not found')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: 'Failed to fetch claim' }, { status: 500 });
  }
}

// PUT /api/admin/claims/[id] - Update claim status and admin actions
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate as admin
    const authResult = await authenticateAdmin(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const claimId = params.id;
    const body = await request.json();

    // Validate request body
    const validationResult = adminClaimActionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const actionData = validationResult.data;

    // Verify claim exists
    const existingClaim = await ClaimService.getClaimById(claimId);

    // Check for valid status transitions
    const validTransitions: Record<string, string[]> = {
      SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
      UNDER_REVIEW: ['INVESTIGATING', 'APPROVED', 'REJECTED'],
      INVESTIGATING: ['APPROVED', 'REJECTED', 'UNDER_REVIEW'],
      APPROVED: ['SETTLED', 'INVESTIGATING'],
      REJECTED: ['CLOSED'],
      SETTLED: ['CLOSED'],
      CLOSED: [], // Final status
    };

    if (!validTransitions[existingClaim.status]?.includes(actionData.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status transition from ${existingClaim.status} to ${actionData.status}`,
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: actionData.status,
    };

    if (actionData.reviewNotes) updateData.reviewNotes = actionData.reviewNotes;
    if (actionData.actualDamageAmount !== undefined)
      updateData.actualDamageAmount = actionData.actualDamageAmount;
    if (actionData.settlementAmount !== undefined)
      updateData.settlementAmount = actionData.settlementAmount;
    if (actionData.priority) updateData.priority = actionData.priority;

    // Update claim using service
    const updatedClaim = await ClaimService.updateClaim(claimId, updateData, authResult.user.id);

    // Log admin action for audit trail
    // TODO: Implement proper audit logging service
    // console.log(`Admin ${authResult.user.email} updated claim ${claimId}:`, {
    //   from: existingClaim.status,
    //   to: actionData.status,
    //   reviewNotes: actionData.reviewNotes,
    // });

    return NextResponse.json({
      success: true,
      data: updatedClaim,
      message: `Claim ${actionData.status.toLowerCase()} successfully`,
    });
  } catch (error: any) {
    console.error('Error updating claim by admin:', error);

    if (error.message.includes('not found')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: 'Failed to update claim' }, { status: 500 });
  }
}
