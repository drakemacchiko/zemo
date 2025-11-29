import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAdmin(request, 'MANAGE_VEHICLES');
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 });
  }

  try {
    const { availabilityStatus } = await request.json();
    const vehicleId = params.id;

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { availabilityStatus },
      include: {
        host: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json({ vehicle: updatedVehicle });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}
