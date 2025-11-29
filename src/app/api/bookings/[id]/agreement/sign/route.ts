import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const bookingId = params.id;
    const body = await request.json();
    const { signatureData, signerType } = body; // signatureData is base64 image

    if (!signatureData || !signerType) {
      return NextResponse.json({ error: 'Missing signature data or signer type' }, { status: 400 });
    }

    // Fetch booking to verify user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify user is the correct signer
    if (signerType === 'host' && booking.vehicle.hostId !== userId) {
      return NextResponse.json({ error: 'Only host can sign as host' }, { status: 403 });
    }

    if (signerType === 'renter' && booking.userId !== userId) {
      return NextResponse.json({ error: 'Only renter can sign as renter' }, { status: 403 });
    }

    // Get or create rental agreement
    let agreement = await prisma.rentalAgreement.findUnique({
      where: { bookingId },
    });

    if (!agreement) {
      // Need to get booking to set required fields
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          vehicle: true,
        },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      agreement = await prisma.rentalAgreement.create({
        data: {
          bookingId,
          vehicleId: booking.vehicleId,
          hostId: booking.vehicle.hostId,
          renterId: booking.userId,
          agreementTemplate: 'STANDARD_V1',
          agreementContent: 'Agreement content to be generated',
          hostSigned: false,
          renterSigned: false,
          fullyExecuted: false,
        },
      });
    }

    // Get IP address and user agent
    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Prepare signature metadata
    const signatureMetadata = {
      signedAt: new Date().toISOString(),
      ipAddress,
      userAgent,
      signatureImage: signatureData, // Base64 encoded signature
    };

    // Update agreement based on signer type
    const updateData: any = {};

    if (signerType === 'host') {
      updateData.hostSigned = true;
      updateData.hostSignedAt = new Date();
      updateData.hostSignatureData = JSON.stringify(signatureMetadata);
    } else if (signerType === 'renter') {
      updateData.renterSigned = true;
      updateData.renterSignedAt = new Date();
      updateData.renterSignatureData = JSON.stringify(signatureMetadata);
    }

    // Check if agreement will be fully executed after this signature
    if (
      (signerType === 'host' && agreement.renterSigned) ||
      (signerType === 'renter' && agreement.hostSigned)
    ) {
      updateData.fullyExecuted = true;
      updateData.fullyExecutedAt = new Date();
    }

    // Update the agreement
    const updatedAgreement = await prisma.rentalAgreement.update({
      where: { id: agreement.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      agreement: updatedAgreement,
    });
  } catch (error) {
    console.error('Error signing agreement:', error);
    return NextResponse.json({ error: 'Failed to sign agreement' }, { status: 500 });
  }
}
