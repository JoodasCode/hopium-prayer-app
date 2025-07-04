# PWA Implementation Plan for Lopi Prayer App

## Overview
This document outlines the complete PWA implementation strategy for Lopi, optimized for the deployment path: **PWA → TWA (Android) → iOS App**.

## Current Status
- ✅ **Foundation**: Next.js 14 with App Router
- ✅ **UI Framework**: Tailwind CSS + Shadcn/UI
- ✅ **Real-time Features**: Prayer times, location services
- ✅ **Database**: Supabase with comprehensive schema
- ❌ **PWA Features**: Not yet implemented (planned)

## Phase 1: Core PWA Implementation (Week 1)

### 1.1 Web App Manifest
**Priority: Critical**

```json
// public/manifest.json
{
  "name": "Lopi - Islamic Prayer Tracker",
  "short_name": "Lopi",
  "description": "Track prayers, build consistency, deepen spiritual connection",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#8B5CF6",
  "orientation": "portrait-primary",
  "categories": ["lifestyle", "productivity", "health"],
  "lang": "en-US",
  "dir": "ltr",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile-dashboard.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/mobile-prayers.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### 1.2 Service Worker Implementation
**Priority: Critical**

Install dependencies:
```bash
npm install workbox-webpack-plugin workbox-window
```

Create service worker with Workbox:
```javascript
// public/sw.js
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSync } from 'workbox-background-sync';
import { Queue } from 'workbox-background-sync';

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache prayer times API responses
registerRoute(
  ({ url }) => url.pathname.includes('/api/prayer-times'),
  new NetworkFirst({
    cacheName: 'prayer-times-cache',
    networkTimeoutSeconds: 10,
  })
);

// Cache Supabase API calls
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-cache',
    networkTimeoutSeconds: 5,
  })
);

// Cache static assets
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
  })
);

// Background sync for prayer logging
const bgSyncQueue = new Queue('prayer-sync', {
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
      } catch (error) {
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  },
});

// Listen for prayer logging requests
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/prayers') && event.request.method === 'POST') {
    if (!navigator.onLine) {
      bgSyncQueue.pushRequest({ request: event.request });
    }
  }
});
```

### 1.3 Next.js PWA Configuration
Update `next.config.js`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\/api\/prayer-times/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'prayer-times-cache',
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
});
```

## Phase 2: TWA-Optimized Features (Week 2)

### 2.1 Android TWA Preparation
**Priority: High**

Key considerations for TWA:
- **Splash Screen**: Matches Android app launch experience
- **Status Bar**: Proper theming for Android
- **Navigation**: Hardware back button support
- **Permissions**: Camera, location, notifications

Update manifest for TWA:
```json
{
  "display_override": ["window-controls-overlay", "standalone"],
  "theme_color": "#8B5CF6",
  "background_color": "#ffffff",
  "shortcuts": [
    {
      "name": "Quick Prayer Log",
      "short_name": "Log Prayer",
      "description": "Quickly log a completed prayer",
      "url": "/dashboard?quick-log=true",
      "icons": [{ "src": "/icons/shortcut-prayer.png", "sizes": "96x96" }]
    },
    {
      "name": "Prayer Times",
      "short_name": "Times",
      "description": "View today's prayer times",
      "url": "/dashboard?view=times",
      "icons": [{ "src": "/icons/shortcut-times.png", "sizes": "96x96" }]
    }
  ]
}
```

### 2.2 Hardware Integration
**Priority: Medium**

```typescript
// src/hooks/useDeviceFeatures.ts
export function useDeviceFeatures() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [canVibrate, setCanVibrate] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Detect if running as PWA/TWA
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );

    // Check device capabilities
    setCanVibrate('vibrate' in navigator);
    setCanShare('share' in navigator);
  }, []);

  const vibrate = (pattern: number | number[]) => {
    if (canVibrate) {
      navigator.vibrate(pattern);
    }
  };

  const share = async (data: ShareData) => {
    if (canShare) {
      try {
        await navigator.share(data);
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  return { isStandalone, canVibrate, canShare, vibrate, share };
}
```

### 2.3 Offline-First Architecture
**Priority: High**

```typescript
// src/lib/offlineStorage.ts
import { openDB, DBSchema } from 'idb';

interface LopiDB extends DBSchema {
  prayers: {
    key: string;
    value: {
      id: string;
      userId: string;
      prayerName: string;
      date: string;
      completed: boolean;
      focusLevel?: number;
      synced: boolean;
      createdAt: string;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

export const db = openDB<LopiDB>('lopi-db', 1, {
  upgrade(db) {
    db.createObjectStore('prayers', { keyPath: 'id' });
    db.createObjectStore('settings', { keyPath: 'key' });
  },
});

export async function savePrayerOffline(prayer: any) {
  const database = await db;
  await database.put('prayers', { ...prayer, synced: false });
}

export async function syncPendingPrayers() {
  const database = await db;
  const unsyncedPrayers = await database.getAll('prayers');
  
  for (const prayer of unsyncedPrayers.filter(p => !p.synced)) {
    try {
      // Sync with Supabase
      await syncPrayerToSupabase(prayer);
      await database.put('prayers', { ...prayer, synced: true });
    } catch (error) {
      console.error('Sync failed for prayer:', prayer.id, error);
    }
  }
}
```

## Phase 3: iOS App Optimization (Week 3)

### 3.1 iOS-Specific Considerations
**Priority: High for iOS launch**

Key differences for iOS:
- **Safari PWA limitations**: No push notifications, limited storage
- **App Store guidelines**: Must provide native-like experience
- **Capacitor integration**: For native iOS features

Install Capacitor:
```bash
npm install @capacitor/core @capacitor/ios
npx cap init lopi com.lopi.app
npx cap add ios
```

### 3.2 Native iOS Features
```typescript
// src/hooks/useNativeFeatures.ts
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export function useNativeFeatures() {
  const isNative = Capacitor.isNativePlatform();
  
  const scheduleNotification = async (title: string, body: string, date: Date) => {
    if (isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: date },
          },
        ],
      });
    } else {
      // Fallback for PWA
      if ('serviceWorker' in navigator && 'Notification' in window) {
        // Use service worker notifications
      }
    }
  };

  return { isNative, scheduleNotification };
}
```

## Phase 4: Performance & App Store Optimization (Week 4)

### 4.1 Performance Optimization
**Priority: Critical**

```typescript
// src/lib/performance.ts
export function optimizeForAppStores() {
  // Lazy load heavy components
  const LazyInsights = lazy(() => import('@/components/insights/InsightsPage'));
  const LazyCalendar = lazy(() => import('@/components/calendar/CalendarPage'));
  
  // Preload critical resources
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = '/api/prayer-times';
    document.head.appendChild(link);
  }, []);
  
  // Optimize images
  const optimizedImages = {
    dashboard: '/images/dashboard-hero.webp',
    onboarding: '/images/onboarding-bg.webp',
  };
  
  return { LazyInsights, LazyCalendar, optimizedImages };
}
```

### 4.2 App Store Assets
**Priority: High**

Required assets for TWA and iOS:
- **Icons**: 72x72 to 512x512 (maskable and regular)
- **Screenshots**: iPhone and Android formats
- **Splash screens**: Various device sizes
- **App Store descriptions**: Optimized for search

### 4.3 Analytics & Monitoring
```typescript
// src/lib/analytics.ts
export function trackPWAMetrics() {
  // Track PWA installation
  window.addEventListener('beforeinstallprompt', (e) => {
    // Analytics: PWA install prompt shown
  });
  
  // Track app launch source
  const launchSource = window.matchMedia('(display-mode: standalone)').matches
    ? 'pwa'
    : 'browser';
    
  // Track performance metrics
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        // Track load times
      }
    }
  });
  
  observer.observe({ entryTypes: ['navigation'] });
}
```

## Implementation Timeline

### Week 1: PWA Foundation
- [ ] Create manifest.json with all required fields
- [ ] Implement service worker with Workbox
- [ ] Add offline prayer logging capability
- [ ] Create PWA installation prompt
- [ ] Test PWA functionality across browsers

### Week 2: TWA Preparation
- [ ] Optimize for Android TWA conversion
- [ ] Add hardware back button support
- [ ] Implement Android-specific features
- [ ] Create app shortcuts
- [ ] Test TWA build and deployment

### Week 3: iOS Optimization
- [ ] Set up Capacitor for iOS
- [ ] Implement native iOS features
- [ ] Add iOS-specific optimizations
- [ ] Create iOS app store assets
- [ ] Test iOS app build

### Week 4: Launch Preparation
- [ ] Performance optimization
- [ ] App store asset creation
- [ ] Analytics implementation
- [ ] Final testing across all platforms
- [ ] Documentation and deployment guides

## Technical Considerations

### PWA → TWA Conversion
- **Bubblewrap**: Google's tool for TWA generation
- **Play Store**: Direct PWA publishing now available
- **Asset optimization**: Ensure all assets are properly sized

### iOS App Store Requirements
- **Native wrapper**: Capacitor or similar required
- **App Store guidelines**: Must provide substantial native functionality
- **Review process**: Prepare for Apple's review requirements

### Performance Targets
- **First Contentful Paint**: < 2 seconds
- **Largest Contentful Paint**: < 4 seconds
- **Time to Interactive**: < 5 seconds
- **Lighthouse Score**: 90+ across all categories

## Success Metrics

### PWA Metrics
- Installation rate: Target 15%+
- Return rate: Target 60%+
- Offline usage: Track functionality
- Performance scores: Lighthouse 90+

### App Store Metrics
- TWA conversion rate: Target 80%+
- iOS app approval: First submission
- User retention: 7-day 40%+, 30-day 20%+
- App store ratings: Target 4.5+ stars

## Risk Mitigation

### Technical Risks
- **iOS PWA limitations**: Have Capacitor fallback ready
- **Service worker complexity**: Implement progressive enhancement
- **Offline sync conflicts**: Robust conflict resolution

### App Store Risks
- **Rejection risk**: Ensure native functionality is substantial
- **Policy changes**: Stay updated with platform policies
- **Performance issues**: Continuous monitoring and optimization

## Next Steps

1. **Immediate**: Begin PWA manifest and service worker implementation
2. **Week 1**: Complete core PWA functionality
3. **Week 2**: Start TWA optimization
4. **Week 3**: Begin iOS preparation
5. **Week 4**: Final optimization and launch preparation

This plan ensures Lopi is optimized for the entire deployment pipeline from PWA to native app stores, with proper consideration for each platform's unique requirements and constraints. 