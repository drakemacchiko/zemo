import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ClaimService } from '@/lib/insurance'
import { 
  claimCreateSchema, 
  claimSearchSchema,
} from '@/lib/validations'

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

// POST /api/claims - Create a new claim
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = claimCreateSchema.safeParse(body);
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

    const claimData = validationResult.data;

    // Create claim using service
    const claim = await ClaimService.createClaim(
      claimData.policyId,
      authResult.user.id,
      {
        incidentDate: new Date(claimData.incidentDate),
        incidentLocation: claimData.incidentLocation,
        incidentDescription: claimData.incidentDescription,
        claimType: claimData.claimType,
        ...(claimData.estimatedDamageAmount && { estimatedDamageAmount: claimData.estimatedDamageAmount }),
        ...(claimData.policeReportNumber && { policeReportNumber: claimData.policeReportNumber }),
      }
    );

    return NextResponse.json({
      success: true,
      data: claim,
      message: 'Claim submitted successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating claim:', error);
    
    if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error.message.includes('not active') || error.message.includes('outside')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create claim' },
      { status: 500 }
    );
  }
}

// GET /api/claims - Get user's claims with optional filtering
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
    const queryData = {
      status: searchParams.get('status') || undefined,
      claimType: searchParams.get('claimType') || undefined,
      priority: searchParams.get('priority') || undefined,
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

    // Add user filter to only show user's claims
    const filters: any = {
      userId: authResult.user.id,
      page: searchData.page,
      limit: searchData.limit,
    };

    if (searchData.status) filters.status = searchData.status;
    if (searchData.claimType) filters.claimType = searchData.claimType;
    if (searchData.priority) filters.priority = searchData.priority;
    if (searchData.policyId) filters.policyId = searchData.policyId;
    if (searchData.startDate) filters.startDate = new Date(searchData.startDate);
    if (searchData.endDate) filters.endDate = new Date(searchData.endDate);

    // Search claims using service
    const result = await ClaimService.searchClaims(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}