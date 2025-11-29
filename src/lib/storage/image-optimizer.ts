/**
 * Image Optimizer Utility
 * Handles image validation, resizing, and optimization
 * Note: This uses browser Canvas API on client-side
 * For server-side, install 'sharp' package for production use
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface OptimizedImage {
  buffer: Buffer;
  contentType: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Validate image file
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 10MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate document file
 */
export function validateDocument(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 15 * 1024 * 1024; // 15MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: PDF, JPEG, PNG`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 15MB`,
    };
  }

  return { valid: true };
}

/**
 * Generate unique filename with UUID-like random string
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const sanitizedName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars
    .substring(0, 30); // Limit length

  return `${timestamp}-${randomStr}-${sanitizedName}.${extension}`;
}

/**
 * Client-side image optimization using Canvas API
 * This runs in the browser before upload
 */
export async function optimizeImageClient(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const { maxWidth = 2000, maxHeight = 2000, quality = 0.85, format = 'jpeg' } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Server-side image optimization
 * Note: For production, install 'sharp' package
 * This is a placeholder that returns the original buffer
 */
export async function optimizeImageServer(
  buffer: Buffer,
  _options: ImageOptimizationOptions = {}
): Promise<Buffer> {
  // TODO: Install sharp for production
  // const sharp = require('sharp')
  // const { maxWidth = 2000, quality = 85, format = 'jpeg' } = _options
  //
  // return await sharp(buffer)
  //   .resize(maxWidth, null, { withoutEnlargement: true })
  //   .jpeg({ quality })
  //   .toBuffer()

  // For now, return original buffer
  console.warn('Image optimization skipped: Install sharp package for production');
  return buffer;
}

/**
 * Get image dimensions from buffer
 */
export async function getImageDimensions(
  _buffer: Buffer
): Promise<{ width: number; height: number } | null> {
  // This would require sharp or similar library
  // For now, return null
  return null;
}

/**
 * Determine photo type from filename
 */
export function determinePhotoType(filename: string): string {
  const name = filename.toLowerCase();

  if (name.includes('front') || name.includes('exterior_front')) {
    return 'EXTERIOR_FRONT';
  }
  if (name.includes('rear') || name.includes('back')) {
    return 'EXTERIOR_REAR';
  }
  if (name.includes('left') || name.includes('side_left')) {
    return 'EXTERIOR_LEFT';
  }
  if (name.includes('right') || name.includes('side_right')) {
    return 'EXTERIOR_RIGHT';
  }
  if (name.includes('interior') || name.includes('inside')) {
    return 'INTERIOR_FRONT';
  }
  if (name.includes('dashboard') || name.includes('dash')) {
    return 'DASHBOARD';
  }
  if (name.includes('engine')) {
    return 'ENGINE';
  }

  return 'OTHER';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
