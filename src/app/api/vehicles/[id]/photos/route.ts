import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// POST /api/vehicles/[id]/photos - Upload vehicle photos
async function handlePost(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const vehicleId = pathSegments[pathSegments.indexOf('vehicles') + 1]

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      )
    }

    // Verify vehicle ownership
    const vehicle = await (prisma as any).vehicle.findUnique({
      where: { id: vehicleId },
      select: { hostId: true, id: true },
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    if (vehicle.hostId !== request.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - not vehicle owner' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('photos') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No photos provided' },
        { status: 400 }
      )
    }

    if (files.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 photos allowed' },
        { status: 400 }
      )
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB per file

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP` },
          { status: 400 }
        )
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size: 10MB` },
          { status: 400 }
        )
      }
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'vehicles', vehicleId)
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create upload directory:', error)
    }

    const uploadedPhotos = []

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue
      
      const timestamp = Date.now()
      const filename = `${timestamp}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filepath = join(uploadDir, filename)
      const webPath = `/uploads/vehicles/${vehicleId}/${filename}`

      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // Determine photo type based on filename or position
        let photoType = 'OTHER'
        const lowercaseName = file.name.toLowerCase()
        
        if (lowercaseName.includes('front') || lowercaseName.includes('exterior_front')) {
          photoType = 'EXTERIOR_FRONT'
        } else if (lowercaseName.includes('rear') || lowercaseName.includes('back')) {
          photoType = 'EXTERIOR_REAR'
        } else if (lowercaseName.includes('left') || lowercaseName.includes('side_left')) {
          photoType = 'EXTERIOR_LEFT'
        } else if (lowercaseName.includes('right') || lowercaseName.includes('side_right')) {
          photoType = 'EXTERIOR_RIGHT'
        } else if (lowercaseName.includes('interior') || lowercaseName.includes('inside')) {
          photoType = 'INTERIOR_FRONT'
        } else if (lowercaseName.includes('dashboard') || lowercaseName.includes('dash')) {
          photoType = 'DASHBOARD'
        } else if (lowercaseName.includes('engine')) {
          photoType = 'ENGINE'
        }

        // Create photo record
        const photoRecord = await (prisma as any).vehiclePhoto.create({
          data: {
            vehicleId,
            photoUrl: webPath,
            photoType,
            isPrimary: i === 0, // First photo is primary by default
          },
        })

        uploadedPhotos.push(photoRecord)
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error)
        return NextResponse.json(
          { error: `Failed to upload photo: ${file.name}` },
          { status: 500 }
        )
      }
    }

    // If this is the first photo upload, set the vehicle as having photos
    if (uploadedPhotos.length > 0) {
      const existingPhotosCount = await (prisma as any).vehiclePhoto.count({
        where: { vehicleId },
      })

      // If this was the first photo upload, we might want to update vehicle status
      if (existingPhotosCount === uploadedPhotos.length) {
        // This means these were the first photos - could trigger verification workflow
      }
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadedPhotos.length} photos`,
      photos: uploadedPhotos,
    }, { status: 201 })

  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    )
  }
}

// GET /api/vehicles/[id]/photos - Get vehicle photos
async function handleGet(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const vehicleId = pathSegments[pathSegments.indexOf('vehicles') + 1]

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      )
    }

    // Check if vehicle exists and is accessible
    const vehicle = await (prisma as any).vehicle.findUnique({
      where: { id: vehicleId },
      select: { 
        id: true, 
        hostId: true, 
        isActive: true, 
        verificationStatus: true 
      },
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Only show photos for active and verified vehicles (unless owner)
    const isOwner = request.user?.id === vehicle.hostId
    if (!isOwner && (!vehicle.isActive || vehicle.verificationStatus !== 'VERIFIED')) {
      return NextResponse.json(
        { error: 'Vehicle not available' },
        { status: 404 }
      )
    }

    const photos = await (prisma as any).vehiclePhoto.findMany({
      where: { vehicleId },
      orderBy: [
        { isPrimary: 'desc' },
        { uploadDate: 'desc' },
      ],
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Photos fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handlePost)
export const GET = withAuth(handleGet, { requireAuth: false })