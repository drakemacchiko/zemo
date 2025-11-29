import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// POST /api/notifications/subscribe - Subscribe to push notifications
async function handleSubscribe(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { subscription } = body as { subscription: PushSubscriptionData };

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    const userId = request.user!.id;

    // Store or update push subscription in database
    // Note: You'll need to add a PushSubscription model to your schema
    await prisma.$executeRaw`
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at, updated_at)
      VALUES (${userId}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth}, NOW(), NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        endpoint = ${subscription.endpoint},
        p256dh = ${subscription.keys.p256dh},
        auth = ${subscription.keys.auth},
        updated_at = NOW()
    `;

    return NextResponse.json({
      message: 'Successfully subscribed to push notifications',
    });
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to push notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/unsubscribe - Unsubscribe from push notifications
async function handleUnsubscribe(request: AuthenticatedRequest) {
  try {
    const userId = request.user!.id;

    // Remove push subscription from database
    await prisma.$executeRaw`
      DELETE FROM push_subscriptions WHERE user_id = ${userId}
    `;

    return NextResponse.json({
      message: 'Successfully unsubscribed from push notifications',
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from push notifications' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  const url = new URL(request.url);

  if (url.pathname.endsWith('/subscribe')) {
    return handleSubscribe(request);
  } else if (url.pathname.endsWith('/unsubscribe')) {
    return handleUnsubscribe(request);
  }

  return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 });
});
