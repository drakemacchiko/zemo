import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import { uploadToStorage, STORAGE_BUCKETS, isStorageConfigured, deleteFromStorage } from '@/lib/storage/supabase-storage'
import { generateUniqueFilename, optimizeImageServer } from '@/lib/storage/image-optimizer'

/**
 * POST /api/upload/profile-images
 * Upload user profile image (single image)
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
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      )
    }

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB for profile images

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP` },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 5MB` },
        { status: 400 }
      )
    }

    const userId = request.user.id

    // Get current user to check for existing profile photo
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: { profilePhoto: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    try {
      // Generate unique filename
      const filename = generateUniqueFilename(file.name)
      const storagePath = `${userId}/${filename}`

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Optimize image for profile (smaller size)
      const optimizedBuffer = await optimizeImageServer(buffer, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 90,
      })

      // Upload to Supabase Storage
      const { url, error } = await uploadToStorage(
        STORAGE_BUCKETS.PROFILE_IMAGES,
        storagePath,
        optimizedBuffer,
        file.type
      )

      if (error || !url) {
        console.error('Failed to upload profile image:', error)
        return NextResponse.json(
          { error: 'Failed to upload profile image' },
          { status: 500 }
        )
      }

      // Delete old profile photo from storage if exists
      if (user.profilePhoto && user.profilePhoto.includes('profile-images')) {
        try {
          // Extract path from URL
          const urlParts = user.profilePhoto.split('/profile-images/')
          if (urlParts.length > 1) {
            const oldPath = urlParts[1]
            await deleteFromStorage(STORAGE_BUCKETS.PROFILE_IMAGES, oldPath)
          }
        } catch (error) {
          console.warn('Failed to delete old profile photo:', error)
          // Continue anyway, don't fail the upload
        }
      }

      // Update user profile photo in database
      const updatedUser = await (prisma as any).user.update({
        where: { id: userId },
        data: { profilePhoto: url },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profilePhoto: true,
        },
      })

      return NextResponse.json(
        {
          message: 'Profile photo updated successfully',
          user: updatedUser,
        },
        { status: 200 }
      )
    } catch (error) {
      console.error('Profile image upload error:', error)
      return NextResponse.json(
        { error: 'Failed to process profile image' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Profile image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload profile image' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handlePost)
