const webpush = require('web-push');

// Generate VAPID keys for push notifications
const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n=== VAPID Keys Generated ===\n');
console.log('Add these to your .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log('\n============================\n');
