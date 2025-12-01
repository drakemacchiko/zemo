import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/vehicles/categories/counts
// Returns vehicle counts for each category
export async function GET() {
  try {
    // Get counts grouped by category
    const counts = await prisma.vehicle.groupBy({
      by: ['vehicleCategory'],
      _count: {
        id: true,
      },
      where: {
        listingStatus: 'ACTIVE', // Only count active vehicles
        isActive: true,
      },
    });

    // Transform to simple object
    const categoryCounts = counts.reduce(
      (acc: Record<string, number>, item: any) => {
        if (item.vehicleCategory) {
          acc[item.vehicleCategory.toLowerCase()] = item._count.id;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // Add default counts for categories with 0 vehicles
    const allCategories = [
      'economy',
      'suv',
      'luxury',
      'pickup',
      'van',
      'sports',
      'electric',
      'long-term',
    ];

    allCategories.forEach((category) => {
      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
      }
    });

    return NextResponse.json(categoryCounts);
  } catch (error) {
    console.error('Error fetching category counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category counts' },
      { status: 500 }
    );
  }
}
