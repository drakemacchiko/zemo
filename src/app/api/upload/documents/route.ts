import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import { uploadToStorage, STORAGE_BUCKETS, isStorageConfigured } from '@/lib/storage/supabase-storage'
import { generateUniqueFilename } from '@/lib/storage/image-optimizer'

/**
 * POST /api/upload/documents
 * Upload user documents (ID, license, etc.)
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
    const file = formData.get('document') as File
    const documentType = formData.get('documentType') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No document provided' },
        { status: 400 }
      )
    }

    if (!documentType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      )
    }

    // Validate document type
    const validDocTypes = ['PROFILE_PICTURE', 'DRIVING_LICENSE', 'NATIONAL_ID', 'VEHICLE_DOCUMENT']
    if (!validDocTypes.includes(documentType)) {
      return NextResponse.json(
        { error: `Invalid document type: ${documentType}` },
        { status: 400 }
      )
    }

    // Validate file
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ]
    const maxSize = 15 * 1024 * 1024 // 15MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: PDF, JPEG, PNG` },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 15MB` },
        { status: 400 }
      )
    }

    const userId = request.user.id

    try {
      // Generate unique filename
      const filename = generateUniqueFilename(file.name)
      const storagePath = `${userId}/${documentType.toLowerCase()}/${filename}`

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload to Supabase Storage (private bucket)
      const { url, error } = await uploadToStorage(
        STORAGE_BUCKETS.DOCUMENTS,
        storagePath,
        buffer,
        file.type
      )

      if (error || !url) {
        console.error('Failed to upload document:', error)
        return NextResponse.json(
          { error: 'Failed to upload document' },
          { status: 500 }
        )
      }

      // Create document record in database
      const documentRecord = await (prisma as any).document.create({
        data: {
          userId,
          documentType,
          documentUrl: url,
          verificationStatus: 'PENDING',
        },
      })

      return NextResponse.json(
        {
          message: 'Document uploaded successfully',
          document: documentRecord,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Document upload error:', error)
      return NextResponse.json(
        { error: 'Failed to process document' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handlePost)
