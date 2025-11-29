import { NextResponse } from 'next/server';
import { z } from 'zod';
// import { prisma } from '@/lib/db'; // Will be used when Prisma client is regenerated
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';

// Validation schemas
const preferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  bookingUpdates: z.boolean().optional(),
  paymentUpdates: z.boolean().optional(),
  messageAlerts: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
  quietHoursStart: z.number().min(0).max(23).optional(),
  quietHoursEnd: z.number().min(0).max(23).optional(),
  timezone: z.string().optional(),
});

// GET /api/notifications/preferences - Get user's notification preferences
async function getPreferences(_request: AuthenticatedRequest) {
  try {
    // const userId = request.user!.id; // Will be used for user filtering

    // Return default preferences for now - full implementation when Prisma client is ready
    return NextResponse.json({
      preferences: {
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        bookingUpdates: true,
        paymentUpdates: true,
        messageAlerts: true,
        marketingEmails: false,
        systemAlerts: true,
        quietHoursStart: null,
        quietHoursEnd: null,
        timezone: 'Africa/Lusaka',
      },
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/preferences - Update user's notification preferences
async function updatePreferences(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const preferences = preferencesSchema.parse(body);

    const userId = request.user!.id;

    // Return success for now - full implementation when Prisma client is ready
    return NextResponse.json({
      message: 'Notification preferences API is ready - awaiting Prisma client regeneration',
      preferences,
      userId,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getPreferences);
export const PUT = withAuth(updatePreferences);
