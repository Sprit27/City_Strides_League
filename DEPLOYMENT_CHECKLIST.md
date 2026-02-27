# Deployment Checklist

## Before Deploying:

### 1. Deploy Firestore Security Rules ⚠️ CRITICAL
```bash
firebase login
firebase init firestore  # Select your project
firebase deploy --only firestore:rules
```

### 2. Verify .env is Not in Git
```bash
git status
# Should NOT show .env file
```

### 3. Test Build Locally
```bash
npm run build
npm start
# Test at http://localhost:3000
```

## Deploy to Firebase Hosting:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting
# Choose:
# - Use existing project
# - Public directory: out
# - Configure as single-page app: No
# - Set up automatic builds: No

# Build for production
npm run build

# Deploy
firebase deploy --only hosting
```

## Deploy to Vercel (Alternative):

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Project Settings → Environment Variables
# Add all NEXT_PUBLIC_FIREBASE_* variables
```

## After Deployment:

### 1. Test PWA Installation
- [ ] Open deployed URL on Android Chrome
- [ ] Click "Install app" from menu
- [ ] Verify app installs correctly
- [ ] Test offline functionality

### 2. Test Authentication
- [ ] Register new user
- [ ] Login with existing user
- [ ] Verify user profile created in Firestore

### 3. Test Run Tracking
- [ ] Start a run
- [ ] Put phone in pocket (app in background)
- [ ] Walk/run for 2+ minutes
- [ ] Stop run
- [ ] Verify data saved to Firestore
- [ ] Check leaderboard updates

### 4. Security Verification
- [ ] Open browser console
- [ ] Try to access Firestore without auth (should fail)
- [ ] Login and try to modify another user's data (should fail)
- [ ] Check Firebase Console → Firestore → Rules tab

### 5. Set Up Weekly Reset (Optional)

Create Cloud Function for Sunday resets:

```bash
firebase init functions
# Choose TypeScript or JavaScript
```

Edit `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const resetWeeklyStats = functions.pubsub
  .schedule('0 0 * * 0') // Every Sunday at midnight UTC
  .timeZone('Your/Timezone') // e.g., 'America/New_York'
  .onRun(async (context) => {
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();
    
    const batch = db.batch();
    
    usersSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        'weeklyStats.distance': 0,
        'weeklyStats.avgSpeed': 0,
        'weeklyStats.pace': 0
      });
    });
    
    await batch.commit();
    console.log('Weekly stats reset completed');
    return null;
  });
```

Deploy:
```bash
firebase deploy --only functions
```

## Environment Variables Needed:

For your hosting platform, set these:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDrszL1_akAEdTrCc453Wq58G8HhJ_gNnk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-9984507916-37681.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-9984507916-37681
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-9984507916-37681.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=737269970834
NEXT_PUBLIC_FIREBASE_APP_ID=1:737269970834:web:26a6d9961d3ef2bf67b34b
```

## Monitoring:

### Firebase Console
- [ ] Check Firestore usage
- [ ] Monitor authentication activity
- [ ] Review security rule denials
- [ ] Check function logs (if using Cloud Functions)

### Performance
- [ ] Test app load time
- [ ] Check Lighthouse score
- [ ] Verify PWA score is 100

## Troubleshooting:

### App won't install
- Check manifest.json is accessible at /manifest.json
- Verify HTTPS is enabled (required for PWA)
- Check browser console for errors

### Tracking not working
- Verify location permissions granted
- Check if HTTPS is enabled (required for geolocation)
- Test on actual device, not emulator

### Data not saving
- Check Firestore rules are deployed
- Verify user is authenticated
- Check browser console for errors
- Review Firebase Console logs

## Quick Commands:

```bash
# Build and test locally
npm run build && npm start

# Deploy everything to Firebase
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only rules
firebase deploy --only firestore:rules

# Deploy only functions
firebase deploy --only functions

# View logs
firebase functions:log
```

## Success Criteria:

✅ App accessible via public URL
✅ PWA installable on Android
✅ Users can register/login
✅ Runs save to Firestore
✅ Leaderboard updates correctly
✅ Security rules prevent unauthorized access
✅ App works offline (cached assets)
✅ Background tracking works when installed

Your app is ready to deploy! 🚀
