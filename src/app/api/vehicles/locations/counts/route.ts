import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/vehicles/locations/counts
// Returns vehicle counts for popular locations in Zambia
export async function GET() {
  try {
    // Define popular location coordinates (approximate bounds)
    const locations = {
      lusaka: {
        lat: -15.4167,
        lng: 28.2833,
        radius: 0.5, // ~50km
      },
      airport: {
        lat: -15.3308,
        lng: 28.4526,
        radius: 0.3, // ~30km
      },
      livingstone: {
        lat: -17.8419,
        lng: 25.8544,
        radius: 0.5,
      },
      kitwe: {
        lat: -12.8024,
        lng: 28.2134,
        radius: 0.5,
      },
      ndola: {
        lat: -12.9587,
        lng: 28.6366,
        radius: 0.5,
      },
      kabwe: {
        lat: -14.4469,
        lng: 28.4464,
        radius: 0.5,
      },
    };

    const locationCounts: Record<string, number> = {};

    // Count vehicles near each location
    for (const [slug, coords] of Object.entries(locations)) {
      const count = await prisma.vehicle.count({
        where: {
          listingStatus: 'ACTIVE',
          isActive: true,
          locationLatitude: {
            gte: coords.lat - coords.radius,
            lte: coords.lat + coords.radius,
          },
          locationLongitude: {
            gte: coords.lng - coords.radius,
            lte: coords.lng + coords.radius,
          },
        },
      });

      locationCounts[slug] = count;
    }

    return NextResponse.json(locationCounts);
  } catch (error) {
    console.error('Error fetching location counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location counts' },
      { status: 500 }
    );
  }
}
