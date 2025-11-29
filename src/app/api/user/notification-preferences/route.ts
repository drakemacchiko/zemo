import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

/**
 * GET /api/user/notification-preferences
 * Get user's notification preferences
 */
export async function GET(request: NextRequest) {
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

    // Get user with notification preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        notificationPreference: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Default preferences if none exist
    const defaultPreferences = {
      bookingConfirmed: { inApp: true, email: true, push: true, sms: false },
      bookingCancelled: { inApp: true, email: true, push: true, sms: false },
      paymentSuccess: { inApp: true, email: true, push: false, sms: false },
      paymentFailed: { inApp: true, email: true, push: true, sms: false },
      messageReceived: { inApp: true, email: false, push: true, sms: false },
      documentRequired: { inApp: true, email: true, push: true, sms: false },
      vehicleApproved: { inApp: true, email: true, push: true, sms: false },
      systemAnnouncement: { inApp: true, email: false, push: false, sms: false },
      marketing: { inApp: false, email: false, push: false, sms: false },
    };

    const preferences = user.notificationPreference || defaultPreferences;

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/notification-preferences
 * Update user's notification preferences
 */
export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json(
        { success: false, error: 'Preferences are required' },
        { status: 400 }
      );
    }

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreference: preferences,
      },
      select: {
        id: true,
        notificationPreference: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: updatedUser.notificationPreference,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
