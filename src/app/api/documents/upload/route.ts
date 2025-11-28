import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth'

// Do not initialize Supabase at module scope to avoid build-time env requirements

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const category = formData.get('category') as string // 'host' or 'renter'
    const vehicleId = formData.get('vehicleId') as string | null

    if (!file || !documentType || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and PDF allowed' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${category}/${userId}/${documentType}/${timestamp}_${sanitizedFileName}`

    // Upload to Supabase Storage if env is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const fileBuffer = await file.arrayBuffer()
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase env not configured; skipping upload')
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 500 }
      )
    }
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 31536000) // 1 year in seconds

    if (!urlData?.signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: 500 }
      )
    }

    // Save document metadata to database
    // TODO: Create Document model in Prisma schema
    // For now, we'll just return the upload info
    const documentRecord = {
      userId,
      documentType,
      category,
      vehicleId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storagePath: filePath,
      url: urlData.signedUrl,
      uploadedAt: new Date(),
      verified: false
    }

    // TODO: Save to database when Document model is created
    // await prisma.document.create({ data: documentRecord })

    return NextResponse.json({
      success: true,
      document: documentRecord
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // TODO: Fetch from database when Document model is created
    // const userId = decoded.userId
    // const category = searchParams.get('category')
    // const vehicleId = searchParams.get('vehicleId')

    // TODO: Fetch from database when Document model is created
    // For now, return empty array
    // const where: any = { userId }
    // if (category) where.category = category
    // if (vehicleId) where.vehicleId = vehicleId
    
    // const documents = await prisma.document.findMany({
    //   where,
    //   orderBy: { uploadedAt: 'desc' }
    // })

    return NextResponse.json({
      documents: []
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
