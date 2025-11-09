import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ClaimService } from '@/lib/insurance'
import { claimUpdateSchema } from '@/lib/validations'

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

// GET /api/claims/[id] - Get specific claim
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const claimId = params.id;

    // Get claim using service
    const claim = await ClaimService.getClaimById(claimId, authResult.user.id);

    return NextResponse.json({
      success: true,
      data: claim,
    });

  } catch (error: any) {
    console.error('Error fetching claim:', error);
    
    if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch claim' },
      { status: 500 }
    );
  }
}

// PUT /api/claims/[id] - Update claim (limited fields for users)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const claimId = params.id;
    const body = await request.json();
    
    // Validate request body
    const validationResult = claimUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Check if user owns the claim
    const existingClaim = await ClaimService.getClaimById(claimId, authResult.user.id);
    
    // Users can only update certain fields and only if claim is still SUBMITTED
    if (existingClaim.status !== 'SUBMITTED') {
      return NextResponse.json(
        { success: false, error: 'Claim cannot be modified after it has been reviewed' },
        { status: 403 }
      );
    }

    // Filter allowed fields for user updates
    const allowedUpdates: any = {};
    if (updateData.incidentDescription) allowedUpdates.incidentDescription = updateData.incidentDescription;
    if (updateData.estimatedDamageAmount) allowedUpdates.estimatedDamageAmount = updateData.estimatedDamageAmount;
    if (updateData.policeReportNumber) allowedUpdates.policeReportNumber = updateData.policeReportNumber;

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update claim using service
    const updatedClaim = await ClaimService.updateClaim(claimId, allowedUpdates);

    return NextResponse.json({
      success: true,
      data: updatedClaim,
      message: 'Claim updated successfully',
    });

  } catch (error: any) {
    console.error('Error updating claim:', error);
    
    if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update claim' },
      { status: 500 }
    );
  }
}