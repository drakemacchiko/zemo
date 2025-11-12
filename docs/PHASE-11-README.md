# Phase 11: PWA, Offline & Accessibility - Quick Start Guide

## 🚀 What's New in Phase 11

Phase 11 adds comprehensive offline support, PWA features, and accessibility improvements to ZEMO:

- **Service Worker**: Automatic caching for offline access
- **Background Sync**: Queue bookings/payments when offline
- **Push Notifications**: Real-time updates for users
- **Accessibility**: WCAG 2.1 AA compliance
- **Installable**: Add to home screen on mobile/desktop

## 📦 Installation

All dependencies should already be installed. If not:

```bash
npm install
```

## 🔧 Configuration

### 1. Generate VAPID Keys for Push Notifications

```bash
npx web-push generate-vapid-keys
```

### 2. Update Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-public-key>
VAPID_PRIVATE_KEY=<your-private-key>
VAPID_SUBJECT=mailto:support@zemo.zm
```

### 3. Create PWA Icons

Follow instructions in `public/icons/README.md` to create required icons:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

For quick testing, you can use placeholder icons or online generators like:
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/favicon-converter/

## 🧪 Testing

### Test Offline Functionality

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Open Browser DevTools**
   - Press F12
   - Go to Application tab
   - Check Service Workers section

3. **Verify Service Worker Registration**
   - Should see `sw.js` registered and activated
   - Check cache storage for `zemo-app-shell-v1`, `zemo-api-v1`

4. **Test Offline Mode**
   - Go to Network tab → Throttling → Offline
   - Navigate to homepage - should show cached content
   - Try creating a booking - should queue for later
   - Check Application → IndexedDB → ZemoOfflineDB

5. **Test Background Sync**
   - While offline, create a booking
   - Go back online (Throttling → No throttling)
   - Watch for sync notification
   - Verify booking created in database

### Test Push Notifications

1. **Enable Notifications**
   - Click "Enable Notifications" banner
   - Grant permission when prompted
   - Check Application → Storage → IndexedDB for subscription

2. **Test Notification (Manual)**
   - Open browser console
   - Run:
   ```javascript
   Notification.requestPermission().then(permission => {
     if (permission === 'granted') {
       navigator.serviceWorker.ready.then(registration => {
         registration.showNotification('Test Notification', {
           body: 'This is a test notification from ZEMO',
           icon: '/icons/icon-192x192.png'
         });
       });
     }
   });
   ```

### Test Accessibility

1. **Keyboard Navigation**
   - Use Tab key to navigate through page
   - Verify all interactive elements are reachable
   - Check for visible focus indicators
   - Test Enter/Space to activate buttons

2. **Screen Reader Test** (Optional)
   - Windows: Download NVDA (free)
   - macOS: Use built-in VoiceOver (Cmd+F5)
   - Navigate through app with screen reader active
   - Verify all content is announced correctly

3. **Color Contrast**
   - Run Lighthouse audit (see below)
   - Check color-contrast audit passes

### Run Lighthouse Audit

```bash
npm run lighthouse
```

**Expected Scores:**
- Performance: ≥75
- PWA: ≥80
- Accessibility: ≥90
- Best Practices: ≥85
- SEO: ≥85

## 🏗️ Development

### Service Worker Development

When developing the service worker:

1. **Enable "Update on reload"** in DevTools → Application → Service Workers
2. **Clear cache** between tests using DevTools → Application → Clear storage
3. **Check console** for service worker logs
4. **Use Incognito mode** to test fresh installations

### Debugging Offline Features

```javascript
// Check service worker state
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('State:', reg.active?.state);
  console.log('Scope:', reg.scope);
});

// List all caches
caches.keys().then(keys => console.log('Caches:', keys));

// Check IndexedDB
indexedDB.databases().then(dbs => console.log('Databases:', dbs));

// Check online status
console.log('Online:', navigator.onLine);
```

### Testing on Mobile Devices

1. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

2. **Access from mobile device** on same network:
   - Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Access: `http://192.168.x.x:3000`

3. **Install PWA on mobile:**
   - Android Chrome: "Add to Home screen"
   - iOS Safari: Share → "Add to Home Screen"

## 📱 PWA Features

### Install Prompt

The install prompt will show automatically when:
- User visits the site 2+ times
- At least 5 minutes between visits
- Site meets PWA criteria

You can also trigger it programmatically:
```javascript
// In any client component
import { usePWAInstall } from '@/hooks/usePWA';

const { canInstall, promptInstall } = usePWAInstall();

if (canInstall) {
  promptInstall();
}
```

### App Shortcuts

When installed, users can:
- Long-press app icon
- Access quick shortcuts:
  - Search Vehicles
  - My Bookings
  - List Vehicle

### Share Target

Users can share content to ZEMO:
- Share a vehicle listing
- Share booking details
- Share from other apps

## ♿ Accessibility Features

### Keyboard Shortcuts

- **Tab**: Navigate forward
- **Shift+Tab**: Navigate backward
- **Enter/Space**: Activate button/link
- **Escape**: Close modal/dialog
- **Arrow keys**: Navigate within components

### Screen Reader Support

- All images have alt text
- Forms have proper labels
- ARIA attributes for complex components
- Live regions for dynamic updates
- Skip to content link

### Focus Management

- Visible focus indicators
- Focus trap in modals
- Focus restoration on close
- Logical tab order

## 🚨 Troubleshooting

### Service Worker Not Registering

1. Check HTTPS (required for SW, except localhost)
2. Verify `public/sw.js` exists
3. Check browser console for errors
4. Try clearing cache and hard reload (Ctrl+Shift+R)

### Offline Mode Not Working

1. Verify service worker is activated
2. Check cache storage has content
3. Ensure network throttling is set correctly
4. Check browser console for fetch errors

### Push Notifications Not Working

1. Verify VAPID keys are set in .env.local
2. Check notification permission granted
3. Verify subscription stored in IndexedDB
4. Check browser supports push notifications

### Background Sync Not Triggering

1. Verify IndexedDB has queued items
2. Check service worker active
3. Try closing and reopening app
4. Check browser console for sync errors

### Accessibility Issues

1. Run Lighthouse audit for specific issues
2. Use axe DevTools for detailed analysis
3. Test with actual screen reader
4. Verify keyboard navigation works

## 📚 Additional Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## 🎯 Next Steps

After Phase 11, consider:

1. **Phase 12**: Production deployment & monitoring
2. **Analytics**: Track PWA installation and usage
3. **Advanced Features**: WebRTC for video calls, WebSockets for real-time
4. **Performance**: Further optimize for 2G/3G networks
5. **Testing**: End-to-end tests for offline scenarios

---

**Phase 11 Complete! 🎉**

Your ZEMO app now works offline, can be installed as a PWA, sends push notifications, and meets WCAG 2.1 AA accessibility standards.
