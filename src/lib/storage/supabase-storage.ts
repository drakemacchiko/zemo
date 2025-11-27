import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

/**
 * Get or create Supabase client for storage operations
 */
export function getStorageClient(): SupabaseClient {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables.')
  }

  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }

  return supabaseClient
}

/**
 * Storage bucket names
 */
export const STORAGE_BUCKETS = {
  VEHICLE_IMAGES: 'vehicle-images',
  PROFILE_IMAGES: 'profile-images',
  DOCUMENTS: 'documents',
} as const

/**
 * Upload a file to Supabase Storage
 */
export async function uploadToStorage(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
): Promise<{ url: string; error?: string }> {
  try {
    const client = getStorageClient()

    // Upload file
    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return { url: '', error: uploadError.message }
    }

    // Get public URL
    const { data } = client.storage
      .from(bucket)
      .getPublicUrl(path)

    return { url: data.publicUrl }
  } catch (error) {
    console.error('Upload to storage failed:', error)
    return { url: '', error: 'Failed to upload file to storage' }
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromStorage(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getStorageClient()

    const { error } = await client.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Supabase delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete from storage failed:', error)
    return { success: false, error: 'Failed to delete file from storage' }
  }
}

/**
 * List files in a storage path
 */
export async function listFiles(
  bucket: string,
  path?: string
): Promise<{ files: any[]; error?: string }> {
  try {
    const client = getStorageClient()

    const { data, error } = await client.storage
      .from(bucket)
      .list(path)

    if (error) {
      console.error('Supabase list error:', error)
      return { files: [], error: error.message }
    }

    return { files: data || [] }
  } catch (error) {
    console.error('List files failed:', error)
    return { files: [], error: 'Failed to list files' }
  }
}

/**
 * Check if Supabase storage is properly configured
 */
export function isStorageConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/**
 * Initialize storage buckets (run this once during setup)
 * This function should be called from a setup script
 */
export async function initializeStorageBuckets() {
  try {
    const client = getStorageClient()

    // Create buckets if they don't exist
    const bucketsToCreate = [
      { name: STORAGE_BUCKETS.VEHICLE_IMAGES, public: true },
      { name: STORAGE_BUCKETS.PROFILE_IMAGES, public: true },
      { name: STORAGE_BUCKETS.DOCUMENTS, public: false },
    ]

    for (const bucketConfig of bucketsToCreate) {
      const { data: existingBuckets } = await client.storage.listBuckets()
      const bucketExists = existingBuckets?.some(b => b.name === bucketConfig.name)

      if (!bucketExists) {
        const { error } = await client.storage.createBucket(bucketConfig.name, {
          public: bucketConfig.public,
          fileSizeLimit: bucketConfig.name === STORAGE_BUCKETS.DOCUMENTS ? 15728640 : 10485760, // 15MB for docs, 10MB for images
        })

        if (error) {
          console.error(`Failed to create bucket ${bucketConfig.name}:`, error)
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to initialize storage buckets:', error)
    return { success: false, error }
  }
}
