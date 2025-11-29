import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { isActive } = await request.json();
    const vehicleId = params.id;

    // Verify vehicle ownership
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { hostId: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    if (vehicle.hostId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update vehicle status
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      vehicle: {
        id: updatedVehicle.id,
        isActive: updatedVehicle.isActive,
      },
    });
  } catch (error) {
    console.error('Error updating vehicle status:', error);
    return NextResponse.json({ error: 'Failed to update vehicle status' }, { status: 500 });
  }
}
