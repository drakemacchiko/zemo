import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/admin/verify-all-vehicles
 * Admin utility to verify all pending vehicles
 */
export async function POST() {
  try {
    // Update all PENDING vehicles to VERIFIED
    const result = await prisma.vehicle.updateMany({
      where: {
        verificationStatus: 'PENDING'
      },
      data: {
        verificationStatus: 'VERIFIED'
      }
    });

    // Get updated vehicles
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        plateNumber: true,
        make: true,
        model: true,
        verificationStatus: true,
        availabilityStatus: true,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Verified ${result.count} vehicles`,
      updatedCount: result.count,
      vehicles: vehicles
    });

  } catch (error: any) {
    console.error('Error verifying vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to verify vehicles', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/verify-all-vehicles
 * Check current vehicle verification status
 */
export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        plateNumber: true,
        make: true,
        model: true,
        year: true,
        verificationStatus: true,
        availabilityStatus: true,
        isActive: true,
        host: {
          select: {
            email: true
          }
        }
      }
    });

    const stats = {
      total: vehicles.length,
      verified: vehicles.filter((v: any) => v.verificationStatus === 'VERIFIED').length,
      pending: vehicles.filter((v: any) => v.verificationStatus === 'PENDING').length,
      rejected: vehicles.filter((v: any) => v.verificationStatus === 'REJECTED').length,
      available: vehicles.filter((v: any) => v.availabilityStatus === 'AVAILABLE' && v.isActive).length
    };

    return NextResponse.json({
      success: true,
      stats,
      vehicles
    });

  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles', details: error.message },
      { status: 500 }
    );
  }
}
