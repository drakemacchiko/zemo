/**
 * Initialize Supabase Storage Buckets
 * Run this script once after setting up Supabase credentials
 * 
 * Usage: node scripts/setup-supabase-storage.js
 */

const { initializeStorageBuckets } = require('../src/lib/storage/supabase-storage')

async function main() {
  console.log('🚀 Initializing Supabase Storage Buckets...\n')

  try {
    const result = await initializeStorageBuckets()

    if (result.success) {
      console.log('\n✅ Supabase storage buckets initialized successfully!')
      console.log('\nBuckets created:')
      console.log('  - vehicle-images (public)')
      console.log('  - profile-images (public)')
      console.log('  - documents (private)')
      console.log('\n✨ Your storage is ready for uploads!')
    } else {
      console.error('\n❌ Failed to initialize storage buckets')
      console.error('Error:', result.error)
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Error initializing storage:', error)
    console.error('\nPlease make sure:')
    console.error('  1. SUPABASE_URL is set in your environment')
    console.error('  2. SUPABASE_SERVICE_ROLE_KEY is set in your environment')
    console.error('  3. Your Supabase project is accessible')
    process.exit(1)
  }
}

main()
