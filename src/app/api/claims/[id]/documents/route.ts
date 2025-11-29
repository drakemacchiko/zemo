import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ClaimService } from '@/lib/insurance';
import { claimDocumentUploadSchema } from '@/lib/validations';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

// Simple authentication helper
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, user: null };
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);
  if (!payload) {
    return { success: false, user: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true },
  });

  if (!user) {
    return { success: false, user: null };
  }

  return { success: true, user };
}

// POST /api/claims/[id]/documents - Upload documents for a claim
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const claimId = params.id;

    // Verify user owns the claim
    await ClaimService.getClaimById(claimId, authResult.user.id);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate document type
    const validationResult = claimDocumentUploadSchema.safeParse({
      documentType,
      description: description || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF, DOC, DOCX' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileExtension = path.extname(file.name);
    const fileName = `claim-${claimId}-${timestamp}-${randomStr}${fileExtension}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'claims');
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create document record
    const documentUrl = `/uploads/claims/${fileName}`;

    const claimDocument = await prisma.claimDocument.create({
      data: {
        claimId,
        documentType: validationResult.data.documentType as any,
        fileName,
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        documentUrl,
        uploadedBy: authResult.user.id,
        description: validationResult.data.description || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: claimDocument,
        message: 'Document uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error uploading claim document:', error);

    if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

// GET /api/claims/[id]/documents - Get documents for a claim
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const claimId = params.id;

    // Verify user owns the claim
    await ClaimService.getClaimById(claimId, authResult.user.id);

    // Get documents
    const documents = await prisma.claimDocument.findMany({
      where: { claimId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error: any) {
    console.error('Error fetching claim documents:', error);

    if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
