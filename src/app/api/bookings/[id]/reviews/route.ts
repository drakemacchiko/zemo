import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

/**
 * GET /api/bookings/[id]/reviews
 * Get reviews for a booking (both renter and host reviews)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    const reviews = await prisma.review.findMany({
      where: {
        bookingId,
        isVisible: true,
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
        reviewee: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error('Error fetching booking reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings/[id]/reviews
 * Submit a review for a booking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;
    const bookingId = params.id;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: {
          select: {
            id: true,
            hostId: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user is part of this booking
    const isRenter = booking.userId === userId;
    const isHost = booking.vehicle.hostId === userId;

    if (!isRenter && !isHost) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to review this booking' },
        { status: 403 }
      );
    }

    // Check if trip has ended
    if (booking.endDate > new Date()) {
      return NextResponse.json(
        { success: false, error: 'Cannot review until trip has ended' },
        { status: 400 }
      );
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        bookingId_reviewerId: {
          bookingId,
          reviewerId: userId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this booking' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      rating,
      cleanliness,
      communication,
      convenience,
      accuracy,
      title,
      comment,
      wouldRentAgain,
      vehicleCondition,
      followedRules,
      onTimeReturn,
      privateFeedback,
    } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate comment length
    if (!comment || comment.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: 'Review must be at least 50 characters' },
        { status: 400 }
      );
    }

    // Determine review type and reviewee
    const reviewType = isRenter ? 'RENTER_TO_HOST' : 'HOST_TO_RENTER';
    const revieweeId = isRenter ? booking.vehicle.hostId : booking.userId;
    const vehicleId = isRenter ? booking.vehicleId : null;

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        reviewerId: userId,
        revieweeId,
        vehicleId,
        reviewType,
        rating,
        cleanliness: cleanliness || null,
        communication: communication || null,
        convenience: convenience || null,
        accuracy: accuracy || null,
        title: title || null,
        comment: comment.trim(),
        wouldRentAgain: wouldRentAgain || null,
        vehicleCondition: vehicleCondition || null,
        followedRules: followedRules || null,
        onTimeReturn: onTimeReturn || null,
        privateFeedback: privateFeedback || null,
        isVisible: false, // Will be made visible when both parties review or after 14 days
      },
    });

    // Check if both parties have now reviewed
    const otherReview = await prisma.review.findUnique({
      where: {
        bookingId_reviewerId: {
          bookingId,
          reviewerId: revieweeId,
        },
      },
    });

    if (otherReview) {
      // Both parties have reviewed - make both visible
      await prisma.review.updateMany({
        where: { bookingId },
        data: {
          isVisible: true,
          madeVisibleAt: new Date(),
        },
      });

      // Update vehicle average rating
      if (vehicleId) {
        await updateVehicleRating(vehicleId);
      }
    }

    // TODO: Send notification to reviewee
    // TODO: Schedule auto-visibility after 14 days if only one review

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        id: review.id,
        isVisible: review.isVisible,
      },
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to update vehicle average rating
 */
async function updateVehicleRating(vehicleId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        vehicleId,
        isVisible: true,
        reviewType: 'RENTER_TO_HOST',
      },
      select: {
        rating: true,
      },
    });

    if (reviews.length > 0) {
      const averageRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        },
      });
    }
  } catch (error) {
    console.error('Error updating vehicle rating:', error);
  }
}
