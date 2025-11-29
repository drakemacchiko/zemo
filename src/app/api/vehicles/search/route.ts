import { NextRequest, NextResponse } from 'next/server';
import { withPrismaRetry } from '@/lib/db';
import { z } from 'zod';

// Validation schema for search parameters
const searchSchema = z.object({
  // Location and radius
  latitude: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  longitude: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  radius: z.string().optional().transform(val => val ? parseInt(val) : 50), // Default 50km radius
  
  // Date availability
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  
  // Vehicle filters
  vehicleType: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  minSeating: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  maxSeating: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']).optional(),
  fuelType: z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']).optional(),
  
  // Price range
  minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  
  // Pagination
  cursor: z.string().optional(), // For cursor-based pagination
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 20), // Max 50, default 20
  
  // Sorting
  sortBy: z.enum(['price', 'distance', 'rating', 'newest', 'recommended']).optional().default('recommended'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

/**
 * Check vehicle availability for given date range
 */
async function checkAvailability(vehicleId: string, startDate?: Date, endDate?: Date): Promise<boolean> {
  if (!startDate || !endDate) {
    return true; // No date filter, assume available
  }
  
  const conflictingBookings = await withPrismaRetry((p) => p.booking.findFirst({
    where: {
      vehicleId: vehicleId,
      status: {
        in: ['CONFIRMED', 'ACTIVE']
      },
      OR: [
        {
          // Booking starts during requested period
          AND: [
            { startDate: { lte: endDate } },
            { startDate: { gte: startDate } }
          ]
        },
        {
          // Booking ends during requested period
          AND: [
            { endDate: { lte: endDate } },
            { endDate: { gte: startDate } }
          ]
        },
        {
          // Booking encompasses entire requested period
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: endDate } }
          ]
        }
      ]
    }
  }));
  
  return !conflictingBookings;
}

/**
 * GET /api/vehicles/search
 * Search vehicles with geo-radius, availability, and filters
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    // Validate search parameters
    const validatedParams = searchSchema.parse(params);
    
    const {
      latitude,
      longitude,
      radius,
      startDate,
      endDate,
      vehicleType,
      make,
      model,
      minSeating,
      maxSeating,
      transmission,
      fuelType,
      minPrice,
      maxPrice,
      cursor,
      limit,
      sortBy,
      sortOrder
    } = validatedParams;

    // Build where clause
    const where: any = {
      availabilityStatus: 'AVAILABLE',
      verificationStatus: {
        in: ['VERIFIED', 'PENDING'] // Allow both VERIFIED and PENDING for testing
      },
      isActive: true
    };

    // Vehicle type filter
    if (vehicleType) {
      where.vehicleType = vehicleType;
    }

    // Make and model filters
    if (make) {
      where.make = {
        contains: make,
        mode: 'insensitive'
      };
    }

    if (model) {
      where.model = {
        contains: model,
        mode: 'insensitive'
      };
    }

    // Seating capacity filters
    if (minSeating || maxSeating) {
      where.seatingCapacity = {};
      if (minSeating) where.seatingCapacity.gte = minSeating;
      if (maxSeating) where.seatingCapacity.lte = maxSeating;
    }

    // Transmission filter
    if (transmission) {
      where.transmission = transmission;
    }

    // Fuel type filter
    if (fuelType) {
      where.fuelType = fuelType;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.dailyRate = {};
      if (minPrice) where.dailyRate.gte = minPrice;
      if (maxPrice) where.dailyRate.lte = maxPrice;
    }

    // Cursor-based pagination
    if (cursor) {
      where.id = {
        gt: cursor
      };
    }

    // Get vehicles with basic filters first
      let vehicles = await withPrismaRetry((p) => p.vehicle.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        photos: {
          // Return a single primary photo (prefer `isPrimary`) regardless of `photoType`.
          take: 1,
          orderBy: {
            isPrimary: 'desc'
          },
          select: {
            photoUrl: true,
            isPrimary: true
          }
        },
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'ACTIVE']
            }
          },
          select: {
            startDate: true,
            endDate: true
          }
        }
      },
      take: limit + 1, // Take one more to check if there are more results
      orderBy: [
        { createdAt: 'desc' }
      ]
    }));

    // Apply geo-filtering if coordinates provided
    if (latitude && longitude) {
      vehicles = vehicles.filter((vehicle: any) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          vehicle.locationLatitude,
          vehicle.locationLongitude
        );
        return distance <= radius!;
      });
    }

    // Apply availability filtering
    if (startDate && endDate) {
      const availableVehicles = [];
      for (const vehicle of vehicles) {
        const isAvailable = await checkAvailability(vehicle.id, startDate, endDate);
        if (isAvailable) {
          availableVehicles.push(vehicle);
        }
      }
      vehicles = availableVehicles;
    }

    // Calculate distances and add to results
    const vehiclesWithDistance = vehicles.map((vehicle: any) => {
      let distance = null;
      if (latitude && longitude) {
        distance = calculateDistance(
          latitude,
          longitude,
          vehicle.locationLatitude,
          vehicle.locationLongitude
        );
      }

      // Extract the main photo safely (keep photos array for frontend compatibility)
      const mainPhoto = (vehicle.photos && vehicle.photos.length > 0 && vehicle.photos[0]) ? vehicle.photos[0].photoUrl : null;

      return {
        ...vehicle,
        distance: distance ? Math.round(distance * 10) / 10 : null, // Round to 1 decimal
        bookings: undefined, // Remove bookings from response for privacy
        mainPhoto: mainPhoto,
        // Preserve a small `photos` array (only the selected primary photo) so frontend listing UI can use `vehicle.photos` as before
        photos: vehicle.photos && vehicle.photos.length > 0 ? vehicle.photos : []
      };
    });

    // Apply sorting
    const sortedVehicles = [...vehiclesWithDistance];
    switch (sortBy) {
      case 'price':
        sortedVehicles.sort((a, b) => 
          sortOrder === 'asc' 
            ? a.dailyRate - b.dailyRate 
            : b.dailyRate - a.dailyRate
        );
        break;
      case 'distance':
        if (latitude && longitude) {
          sortedVehicles.sort((a, b) => {
            const distanceA = a.distance || Number.MAX_VALUE;
            const distanceB = b.distance || Number.MAX_VALUE;
            return sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA;
          });
        }
        break;
      case 'newest':
        sortedVehicles.sort((a, b) => 
          sortOrder === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'recommended':
        // Sort by multiple factors: rating (if available), distance, and trips completed
        sortedVehicles.sort((a, b) => {
          // Primary: Rating (higher is better)
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
          
          // Secondary: Distance (closer is better)
          if (latitude && longitude) {
            const distanceA = a.distance || Number.MAX_VALUE;
            const distanceB = b.distance || Number.MAX_VALUE;
            const distanceDiff = distanceA - distanceB;
            if (Math.abs(distanceDiff) > 1) return distanceDiff;
          }
          
          // Tertiary: Trips completed (more experience is better)
          return (b.tripsCompleted || 0) - (a.tripsCompleted || 0);
        });
        break;
      // TODO: Implement rating sort when rating system is added
    }

    // Check if there are more results (for pagination)
    const hasMore = sortedVehicles.length > limit;
    const results = hasMore ? sortedVehicles.slice(0, limit) : sortedVehicles;
    const nextCursor = hasMore ? results[results.length - 1]?.id : null;

    return NextResponse.json({
      vehicles: results,
      pagination: {
        hasMore,
        nextCursor,
        limit
      },
      filters: {
        total: results.length,
        radius: radius,
        dateRange: startDate && endDate ? { startDate, endDate } : null
      }
    });

  } catch (error) {
    console.error('Vehicle search error:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid search parameters',
        details: error.issues
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to search vehicles',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}