import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

// GET /api/vehicles/[id]/extras - Get all extras for a vehicle
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const vehicleId = params.id;

    // Verify vehicle ownership
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    if (vehicle.hostId !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all extras for this vehicle
    const extras = await prisma.vehicleExtra.findMany({
      where: { vehicleId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ extras });
  } catch (error) {
    console.error('Error fetching extras:', error);
    return NextResponse.json({ error: 'Failed to fetch extras' }, { status: 500 });
  }
}

// POST /api/vehicles/[id]/extras - Create a new extra
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const vehicleId = params.id;

    // Verify vehicle ownership
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    if (vehicle.hostId !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, priceType, price, available, quantity, photoUrl } = body;

    // Validation
    if (!name || !priceType || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['PER_DAY', 'FLAT_FEE', 'PER_KM'].includes(priceType)) {
      return NextResponse.json({ error: 'Invalid price type' }, { status: 400 });
    }

    // Create the extra
    const extra = await prisma.vehicleExtra.create({
      data: {
        vehicleId,
        name,
        description: description || null,
        priceType,
        price: parseFloat(price),
        available: available !== false,
        quantity: quantity || 1,
        photoUrl: photoUrl || null,
      },
    });

    return NextResponse.json({ extra }, { status: 201 });
  } catch (error) {
    console.error('Error creating extra:', error);
    return NextResponse.json({ error: 'Failed to create extra' }, { status: 500 });
  }
}
