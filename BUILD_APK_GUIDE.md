# Building APK for City Strides League

## What Changed:

Your app is now a **Progressive Web App (PWA)** that can:
- Be installed as a native app on Android
- Run in background during tracking
- Work offline (cached assets)
- No wake lock needed (better battery life)

## How to Install on Android:

### Method 1: Direct Install (Easiest)
1. Deploy your app to a hosting service (Firebase, Vercel, Netlify)
2. Open the URL in Chrome on Android
3. Tap the menu (⋮) → "Install app" or "Add to Home Screen"
4. The app installs like a native app!

### Method 2: Build APK with TWA (Trusted Web Activity)

#### Using Bubblewrap (Recommended):
```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize TWA project
bubblewrap init --manifest https://your-deployed-url.com/manifest.json

# Build APK
bubblewrap build

# The APK will be in ./app-release-signed.apk
```

#### Using PWABuilder:
1. Go to https://www.pwabuilder.com/
2. Enter your deployed app URL
3. Click "Build My PWA"
4. Download the Android APK
5. Install on your phone

## Testing Locally:

```bash
# Build production version
npm run build

# Start production server
npm start

# Open on your phone's browser at http://your-ip:3000
# Then install via browser menu
```

## Key Features Now Working:

✅ Background GPS tracking (no screen-on needed)
✅ Data persists during run (saved every 10 seconds)
✅ Auto-restore if app closes mid-run
✅ Saves to Firestore only when you stop
✅ Updates leaderboard with best weekly stats
✅ Better battery efficiency

## Run Logic:

- **During Run**: Data saved to localStorage every 10 seconds
- **On Stop**: 
  - Calculates final stats (distance, speed, pace)
  - Saves to Firestore
  - Updates your weekly stats (keeps best values)
  - Clears localStorage
  - Refreshes leaderboard

## Weekly Reset:

You'll need to set up a Cloud Function to reset stats every Sunday:

```javascript
// Firebase Cloud Function (to be added)
exports.resetWeeklyStats = functions.pubsub
  .schedule('0 0 * * 0') // Every Sunday at midnight
  .onRun(async (context) => {
    const users = await admin.firestore().collection('users').get();
    const batch = admin.firestore().batch();
    
    users.forEach(doc => {
      batch.update(doc.ref, {
        'weeklyStats.distance': 0,
        'weeklyStats.avgSpeed': 0,
        'weeklyStats.pace': 0
      });
    });
    
    await batch.commit();
  });
```

## Next Steps:

1. Deploy your app to get a public URL
2. Test PWA install on your Android phone
3. If you need a real APK file, use Bubblewrap or PWABuilder
4. Set up the weekly reset Cloud Function
