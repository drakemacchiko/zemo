import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import { uploadToStorage, STORAGE_BUCKETS, isStorageConfigured } from '@/lib/storage/supabase-storage'
import { generateUniqueFilename, determinePhotoType, optimizeImageServer } from '@/lib/storage/image-optimizer'

/**
 * POST /api/upload/vehicle-images
 * Upload vehicle photos (up to 20 images)
 */
async function handlePost(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if storage is configured
    if (!isStorageConfigured()) {
      return NextResponse.json(
        { error: 'Storage service not configured. Please contact support.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const vehicleId = formData.get('vehicleId') as string
    const files = formData.getAll('photos') as File[]

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      )
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No photos provided' },
        { status: 400 }
      )
    }

    if (files.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 photos allowed per upload' },
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
        { error: 'Unauthorized - you do not own this vehicle' },
        { status: 403 }
      )
    }

    // Check total photo count
    const existingPhotosCount = await (prisma as any).vehiclePhoto.count({
      where: { vehicleId },
    })

    if (existingPhotosCount + files.length > 20) {
      return NextResponse.json(
        { error: `Vehicle already has ${existingPhotosCount} photos. Maximum 20 photos allowed per vehicle.` },
        { status: 400 }
      )
    }

    // Validate files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP` },
          { status: 400 }
        )
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum: 10MB` },
          { status: 400 }
        )
      }
    }

    const uploadedPhotos = []

    // Process and upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue

      try {
        // Generate unique filename
        const filename = generateUniqueFilename(file.name)
        const storagePath = `${vehicleId}/${filename}`

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Optimize image (basic - for production, install sharp)
        // Note: Currently returns original buffer, install sharp for actual optimization
        const optimizedBuffer = await optimizeImageServer(buffer, {
          maxWidth: 2000,
          quality: 85,
        })

        // Upload to Supabase Storage
        const { url, error } = await uploadToStorage(
          STORAGE_BUCKETS.VEHICLE_IMAGES,
          storagePath,
          optimizedBuffer,
          file.type
        )

        if (error || !url) {
          console.error(`Failed to upload ${file.name}:`, error)
          return NextResponse.json(
            { error: `Failed to upload photo: ${file.name}` },
            { status: 500 }
          )
        }

        // Determine photo type
        const photoType = determinePhotoType(file.name)

        // Determine if this should be the primary photo
        const isPrimary = existingPhotosCount === 0 && i === 0

        // Create photo record in database
        const photoRecord = await (prisma as any).vehiclePhoto.create({
          data: {
            vehicleId,
            photoUrl: url,
            photoType,
            isPrimary,
          },
        })

        uploadedPhotos.push(photoRecord)
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error)
        return NextResponse.json(
          { error: `Failed to process photo: ${file.name}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        message: `Successfully uploaded ${uploadedPhotos.length} photo(s)`,
        photos: uploadedPhotos,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Vehicle image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload vehicle images' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handlePost)
