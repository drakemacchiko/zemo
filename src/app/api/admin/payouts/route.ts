import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request, 'VIEW_PAYMENTS');
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // TODO: Implement payouts model and logic
    // For now, return empty array
    const payouts: any[] = [];

    return NextResponse.json({ payouts });
  } catch (error) {
    console.error('Admin payouts API error:', error);
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 });
  }
}
