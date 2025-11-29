import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { documentUploadSchema } from '@/lib/validations';
import { prisma } from '@/lib/db';

async function handler(request: AuthenticatedRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate document type
    const validatedData = documentUploadSchema.parse({ documentType });

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'documents');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${request.user!.id}_${validatedData.documentType}_${timestamp}.${extension}`;
    const filepath = join(uploadDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/documents/${filename}`;

    // Update user profile with document URL

    if (validatedData.documentType === 'PROFILE_PICTURE') {
      await prisma.userProfile.update({
        where: { userId: request.user!.id },
        data: { profilePictureUrl: fileUrl },
      });
    } else {
      // Store in kycDocuments JSON field
      const user = await prisma.user.findUnique({
        where: { id: request.user!.id },
        include: { profile: true },
      });

      const currentDocs = (user?.profile?.kycDocuments as any) || {};
      currentDocs[validatedData.documentType] = {
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
        filename: file.name,
      };

      await prisma.userProfile.update({
        where: { userId: request.user!.id },
        data: { kycDocuments: currentDocs },
      });
    }

    return NextResponse.json({
      message: 'Document uploaded successfully',
      documentType: validatedData.documentType,
      url: fileUrl,
    });
  } catch (error) {
    console.error('Document upload error:', error);

    if (error instanceof Error && error.message.includes('Validation')) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
