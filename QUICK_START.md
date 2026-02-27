# Quick Start Guide

## 🚀 Deploy Your App (3 Steps):

### Step 1: Deploy Security Rules (CRITICAL!)
```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### Step 2: Build Your App
```bash
npm run build
```

### Step 3: Deploy
```bash
# Option A: Firebase Hosting
firebase deploy --only hosting

# Option B: Vercel
vercel
```

## 📱 Install on Android:

1. Open your deployed URL in Chrome
2. Tap menu (⋮) → "Install app"
3. Done! App runs like native app

## 🔒 Security Status:

✅ API keys are safe (they're meant to be public)
✅ Security rules protect your data
✅ Users can only modify their own data
✅ Authentication required for all operations

## 📚 Documentation:

- **Security concerns?** → Read `API_KEY_SAFETY_EXPLAINED.md`
- **Deploying?** → Read `DEPLOYMENT_CHECKLIST.md`
- **Building APK?** → Read `BUILD_APK_GUIDE.md`
- **PWA features?** → Read `PWA_CONVERSION_SUMMARY.md`
- **Full security guide?** → Read `SECURITY_GUIDE.md`

## ⚡ Key Features:

- ✅ Installable as native Android app
- ✅ Background GPS tracking (no screen-on needed)
- ✅ Auto-saves run data every 10 seconds
- ✅ Syncs to Firestore when run stops
- ✅ Updates leaderboard with best weekly stats
- ✅ Works offline (cached assets)
- ✅ Secure (Firestore rules protect data)

## 🧪 Test Your App:

```bash
# Local testing
npm run dev

# Production build test
npm run build && npm start

# Deploy to staging
firebase hosting:channel:deploy staging
```

## 📊 Monitor:

- Firebase Console: https://console.firebase.google.com
- Check Firestore usage
- Review authentication logs
- Monitor security rule denials

## 🆘 Troubleshooting:

**App won't install?**
- Must be HTTPS (required for PWA)
- Check manifest.json is accessible

**Tracking not working?**
- Grant location permissions
- Must be HTTPS (required for geolocation)
- Test on real device, not emulator

**Data not saving?**
- Deploy security rules first!
- Check user is authenticated
- Check browser console for errors

## 🎯 Next Steps:

1. Deploy security rules
2. Deploy app to hosting
3. Test on Android phone
4. Set up weekly reset Cloud Function (optional)
5. Monitor usage in Firebase Console

Your app is ready! 🏃‍♂️
