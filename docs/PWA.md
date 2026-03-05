# PWA Configuration - Vitalist Bay Events

## Overview
This Next.js app is configured as a Progressive Web App (PWA) for native-like mobile experience without App Store distribution.

## Features

### ✅ Installable
- Web App Manifest configured for "Add to Home Screen"
- Works on iOS (Safari) and Android (Chrome)
- Custom install prompt with iOS-specific instructions
- Standalone display mode (no browser chrome)

### ✅ Offline Support
- Service Worker with network-first strategy
- Offline fallback page
- Static assets cached for instant loading
- Graceful degradation when offline

### ✅ Push Notifications (Ready)
- Service Worker configured for push notifications
- Notification click handling
- Background sync capability

### ✅ Mobile Optimized
- Touch-friendly 44px minimum touch targets
- Safe area insets for notched devices
- Touch manipulation to eliminate 300ms delay
- Hardware-accelerated animations
- Native-like feedback on interactions

## File Structure

```
public/
├── manifest.json          # Web App Manifest
├── sw.js                  # Service Worker
└── icons/
    ├── icon-72x72.svg
    ├── icon-96x96.svg
    ├── icon-128x128.svg
    ├── icon-144x144.svg
    ├── icon-152x152.svg
    ├── icon-192x192.svg
    ├── icon-384x384.svg
    ├── icon-512x512.svg
    └── screenshot-*.svg

src/
├── app/
│   ├── layout.tsx         # PWA meta tags + components
│   └── offline/
│       └── page.tsx       # Offline fallback page
└── components/
    └── pwa/
        ├── index.ts
        ├── InstallPrompt.tsx
        ├── ServiceWorkerRegistration.tsx
        ├── LoadingScreen.tsx
        ├── NetworkStatus.tsx
        └── MobileNavigation.tsx
```

## Configuration Files Modified

### next.config.mjs
- Service Worker headers
- Manifest caching headers
- Image optimization for mobile

### src/app/layout.tsx
- PWA meta tags
- Apple Web App configuration
- Service Worker registration
- Install prompt component
- Network status indicator

### src/app/globals.css
- Touch optimizations
- Safe area support
- Mobile navigation styles
- PWA-specific animations

## Testing PWA

### Local Development
```bash
npm run build
npm run start
```
Then open http://localhost:3000 in Chrome and check:
1. DevTools → Application → Manifest
2. DevTools → Application → Service Workers

### Testing Install Prompt
1. Open in mobile Chrome/Safari
2. Wait 3-5 seconds for install prompt
3. Or use DevTools → Application → Manifest → "Install"

### Testing Offline
1. DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Refresh page - should see offline fallback

### iOS Testing
1. Open in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Open from home screen (standalone mode)

## Production Recommendations

### Icons
The current icons are SVG placeholders. For production:
1. Create 512x512 PNG master icon
2. Use a tool like [PWA Asset Generator](https://github.com/nicholasio/pwa-asset-generator)
3. Replace SVG icons with PNG versions

### Service Worker Updates
The service worker uses `skipWaiting` by default. For more control:
1. Show update notification (already implemented)
2. User confirms update
3. Page refreshes with new version

### Push Notifications
To enable push notifications:
1. Set up a push notification service (e.g., Firebase Cloud Messaging)
2. Request notification permission from users
3. Send VAPID public key to service worker
4. Subscribe users to push notifications

### Analytics
Track PWA-specific metrics:
- Install rate
- Standalone usage
- Offline usage
- Push notification engagement

## Mobile Navigation

Include `<MobileNavigation />` component in pages where you want bottom navigation:

```tsx
import { MobileNavigation } from '@/components/pwa';

export default function Layout({ children }) {
  return (
    <div>
      {children}
      <MobileNavigation />
    </div>
  );
}
```

## Safe Areas

For pages with fixed headers/footers, use safe area CSS variables:

```css
.header {
  padding-top: env(safe-area-inset-top);
}

.footer {
  padding-bottom: env(safe-area-inset-bottom);
}
```

Or use the CSS classes:
- `.ios-status-bar-padding`
- `.fixed-top-safe`
- `.fixed-bottom-safe`

## Troubleshooting

### Service Worker not registering
- Ensure running on HTTPS (or localhost)
- Check browser console for errors
- Verify sw.js is accessible at /sw.js

### Install prompt not showing
- Must be served over HTTPS
- Need valid manifest.json
- Page must be visited twice
- Some browsers have cooldown periods

### Offline not working
- Clear cache and re-register service worker
- Check Network tab for cached resources
- Verify PRECACHE_ASSETS in sw.js

## Browser Support
- Chrome/Edge: Full support
- Safari iOS 15+: Full support (with some limitations)
- Firefox: Partial support (no install prompt)
- Samsung Internet: Full support
