import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, reason } = await request.json();
    const documentId = params.id;

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (action === 'REJECT' && !reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Update document status
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: payload.userId,
        rejectionReason: action === 'REJECT' ? reason : null,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // TODO: Send email notification to user
    // await sendDocumentVerificationEmail(document);

    // Check if all required documents are approved
    if (action === 'APPROVE') {
      const requiredTypes = ['LICENSE', 'SELFIE'];
      const userDocuments = await prisma.document.findMany({
        where: {
          userId: document.userId,
          type: { in: requiredTypes },
        },
      });

      const allApproved = requiredTypes.every(type =>
        userDocuments.some((doc: any) => doc.type === type && doc.status === 'APPROVED')
      );

      if (allApproved) {
        // Update user verification status
        await prisma.user.update({
          where: { id: document.userId },
          data: { isVerified: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Document ${action.toLowerCase()}d successfully`,
      document,
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    return NextResponse.json(
      { error: 'Failed to verify document' },
      { status: 500 }
    );
  }
}
