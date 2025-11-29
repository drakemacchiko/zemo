import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/vehicles/[id]/reviews
 * Get reviews for a vehicle with rating breakdown
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const skip = (page - 1) * limit;

    // Get all visible reviews for this vehicle
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: {
          vehicleId,
          isVisible: true,
          reviewType: 'RENTER_TO_HOST',
        },
        include: {
          reviewer: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          vehicleId,
          isVisible: true,
          reviewType: 'RENTER_TO_HOST',
        },
      }),
    ]);

    // Calculate rating statistics
    const allReviews = await prisma.review.findMany({
      where: {
        vehicleId,
        isVisible: true,
        reviewType: 'RENTER_TO_HOST',
      },
      select: {
        rating: true,
        cleanliness: true,
        communication: true,
        convenience: true,
        accuracy: true,
      },
    });

    const stats = {
      averageRating: 0,
      totalReviews: allReviews.length,
      categoryRatings: {
        cleanliness: 0,
        communication: 0,
        convenience: 0,
        accuracy: 0,
      },
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };

    if (allReviews.length > 0) {
      // Calculate average ratings
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      stats.averageRating = totalRating / allReviews.length;

      // Category averages
      const withCleanliness = allReviews.filter((r) => r.cleanliness !== null);
      const withCommunication = allReviews.filter((r) => r.communication !== null);
      const withConvenience = allReviews.filter((r) => r.convenience !== null);
      const withAccuracy = allReviews.filter((r) => r.accuracy !== null);

      if (withCleanliness.length > 0) {
        stats.categoryRatings.cleanliness =
          withCleanliness.reduce((sum, r) => sum + (r.cleanliness || 0), 0) /
          withCleanliness.length;
      }

      if (withCommunication.length > 0) {
        stats.categoryRatings.communication =
          withCommunication.reduce((sum, r) => sum + (r.communication || 0), 0) /
          withCommunication.length;
      }

      if (withConvenience.length > 0) {
        stats.categoryRatings.convenience =
          withConvenience.reduce((sum, r) => sum + (r.convenience || 0), 0) /
          withConvenience.length;
      }

      if (withAccuracy.length > 0) {
        stats.categoryRatings.accuracy =
          withAccuracy.reduce((sum, r) => sum + (r.accuracy || 0), 0) /
          withAccuracy.length;
      }

      // Rating distribution
      allReviews.forEach((review) => {
        const roundedRating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
        stats.ratingDistribution[roundedRating]++;
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      reviews,
      stats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching vehicle reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
