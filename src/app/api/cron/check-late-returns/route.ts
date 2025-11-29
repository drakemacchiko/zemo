import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cron/check-late-returns - Cron job to check for late returns
// This should be called every hour by a cron service (Vercel Cron, etc.)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const gracePeriodMinutes = 30;
    const gracePeriodEnd = new Date(now.getTime() - gracePeriodMinutes * 60 * 1000);

    // Find active bookings that should have ended
    const lateBookings = await prisma.booking.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: gracePeriodEnd, // More than 30 minutes overdue
        },
      },
      include: {
        vehicle: true,
        user: {
          include: {
            profile: true,
          },
        },
        lateReturns: true,
      },
    });

    const processedLateReturns = [];

    for (const booking of lateBookings) {
      // Check if late return already detected
      const existingLateReturn = booking.lateReturns.find(
        lr => lr.status !== 'RESOLVED' && lr.status !== 'RETURNED'
      );

      if (existingLateReturn) {
        // Update hours late
        const hoursLate = Math.ceil(
          (now.getTime() - new Date(booking.endDate).getTime()) / (1000 * 60 * 60)
        );

        await prisma.lateReturn.update({
          where: { id: existingLateReturn.id },
          data: {
            hoursLate,
          },
        });

        processedLateReturns.push({
          bookingId: booking.id,
          action: 'updated',
          hoursLate,
        });
      } else {
        // Calculate hours late
        const hoursLate = Math.ceil(
          (now.getTime() - new Date(booking.endDate).getTime()) / (1000 * 60 * 60)
        );

        // Get late fee from vehicle or use default
        const hourlyLateFee = booking.vehicle.lateReturnFee || 50; // ZMW 50 per hour default
        const dailyRate = booking.dailyRate;

        // Cap late fees at daily rate after 4 hours
        let totalLateFee = hourlyLateFee * hoursLate;
        let capped = false;

        if (hoursLate >= 4) {
          totalLateFee = Math.min(totalLateFee, dailyRate);
          capped = true;
        }

        // Create late return record
        const lateReturn = await prisma.lateReturn.create({
          data: {
            bookingId: booking.id,
            originalEndDate: booking.endDate,
            hoursLate,
            hourlyLateFee,
            dailyRate,
            totalLateFee,
            capped,
            status: 'DETECTED',
          },
        });

        // Update status to notified
        await prisma.lateReturn.update({
          where: { id: lateReturn.id },
          data: {
            status: 'NOTIFIED',
          },
        });

        // Send notification to renter
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: 'LATE_RETURN',
            title: 'Late Return - Fees Apply',
            message: `Your trip with ${booking.vehicle.make} ${booking.vehicle.model} is ${hoursLate} hour(s) overdue. Late fees of ZMW ${totalLateFee.toFixed(2)} will be charged. Please return the vehicle immediately.`,
            actionUrl: `/bookings/${booking.id}`,
            bookingId: booking.id,
          },
        });

        // Send notification to host
        await prisma.notification.create({
          data: {
            userId: booking.hostId,
            type: 'LATE_RETURN',
            title: 'Late Return Detected',
            message: `${booking.user.profile?.firstName || 'The renter'} has not returned your ${booking.vehicle.make} ${booking.vehicle.model}. The vehicle is ${hoursLate} hour(s) overdue.`,
            actionUrl: `/bookings/${booking.id}`,
            bookingId: booking.id,
          },
        });

        processedLateReturns.push({
          bookingId: booking.id,
          action: 'created',
          hoursLate,
          totalLateFee,
        });
      }

      // Escalate if more than 24 hours late
      const hoursLate = Math.ceil(
        (now.getTime() - new Date(booking.endDate).getTime()) / (1000 * 60 * 60)
      );

      if (hoursLate >= 24) {
        const lateReturn = booking.lateReturns[0] || existingLateReturn;

        if (lateReturn && !lateReturn.escalated) {
          await prisma.lateReturn.update({
            where: { id: lateReturn.id },
            data: {
              status: 'ESCALATED',
              escalated: true,
              escalatedAt: now,
              escalationNotes: `Vehicle is ${hoursLate} hours overdue. Escalated to support team.`,
            },
          });

          // Send urgent notifications
          await prisma.notification.create({
            data: {
              userId: booking.userId,
              type: 'LATE_RETURN',
              title: 'URGENT: Vehicle Still Not Returned',
              message: `Your rental is ${hoursLate} hours overdue. This matter has been escalated. Please contact support immediately at support@zemo.com or return the vehicle now.`,
              actionUrl: `/bookings/${booking.id}`,
              bookingId: booking.id,
            },
          });

          await prisma.notification.create({
            data: {
              userId: booking.hostId,
              type: 'LATE_RETURN',
              title: 'Late Return Escalated',
              message: `The late return for your ${booking.vehicle.make} ${booking.vehicle.model} has been escalated to our support team. We're working to resolve this.`,
              actionUrl: `/bookings/${booking.id}`,
              bookingId: booking.id,
            },
          });

          processedLateReturns.push({
            bookingId: booking.id,
            action: 'escalated',
            hoursLate,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedLateReturns.length} late returns`,
      data: {
        processedCount: processedLateReturns.length,
        lateReturns: processedLateReturns,
      },
    });
  } catch (error) {
    console.error('Check late returns error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check late returns' },
      { status: 500 }
    );
  }
}
