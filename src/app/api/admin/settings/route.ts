import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

// GET /api/admin/settings - Get platform settings
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload || !['ADMIN', 'SUPER_ADMIN'].includes(payload.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get platform settings
    const settings = await prisma.platformSettings.findFirst();

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching platform settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform settings' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update platform settings
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload || !['ADMIN', 'SUPER_ADMIN'].includes(payload.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Get existing settings or create new
    let settings = await prisma.platformSettings.findFirst();

    if (settings) {
      // Update existing
      settings = await prisma.platformSettings.update({
        where: { id: settings.id },
        data: body,
      });
    } else {
      // Create new
      settings = await prisma.platformSettings.create({
        data: body,
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error updating platform settings:', error);
    return NextResponse.json(
      { error: 'Failed to update platform settings' },
      { status: 500 }
    );
  }
}
