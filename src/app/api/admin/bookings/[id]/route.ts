import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAdmin(request, 'MANAGE_BOOKINGS');
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 });
  }

  try {
    const { status } = await request.json();
    const bookingId = params.id;

    const updateData: any = { status };

    if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    } else if (status === 'CANCELLED' || status === 'REJECTED') {
      updateData.cancelledAt = new Date();
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
            plateNumber: true,
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
