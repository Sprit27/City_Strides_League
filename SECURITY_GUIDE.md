# Security Guide for City Strides League

## ✅ Your API Keys Are Safe!

**Important**: Firebase API keys in client-side code are **NOT a security risk**. This is by design.

### Why Firebase API Keys Can Be Public:

1. **They're meant to identify your Firebase project**, not authenticate users
2. **Real security comes from Firestore Security Rules** (see below)
3. **Google's official stance**: API keys can be safely included in code
4. Even if someone copies your API key, they can't do anything without proper authentication

Source: [Firebase Documentation](https://firebase.google.com/docs/projects/api-keys)

## 🔒 Real Security: Firestore Rules

Your data is protected by **Firestore Security Rules** (not API keys). I've created secure rules in `firestore.rules`.

### Deploy Security Rules:

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

### What the Rules Do:

#### Users Collection (`/users/{userId}`):
- ✅ Any authenticated user can READ (for leaderboard)
- ✅ Users can only CREATE/UPDATE their own profile
- ❌ Users cannot delete profiles
- ❌ Users cannot modify other users' data

#### Runs Collection (`/runs/{runId}`):
- ✅ Any authenticated user can READ (for history)
- ✅ Users can only CREATE runs with their own userId
- ❌ Users cannot update or delete runs
- ❌ Users cannot create runs for other users

### Test Your Rules:

In Firebase Console:
1. Go to Firestore Database
2. Click "Rules" tab
3. Copy contents from `firestore.rules`
4. Click "Publish"
5. Use the "Rules Playground" to test

## 🛡️ Additional Security Measures:

### 1. App Check (Recommended for Production)

Prevents unauthorized apps from accessing your Firebase:

```bash
# Enable in Firebase Console
# Project Settings → App Check → Register app
```

Then add to your code:

```typescript
// src/lib/firebase/clientApp.ts
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// After initializing app
if (typeof window !== 'undefined') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
    isTokenAutoRefreshEnabled: true
  });
}
```

### 2. Rate Limiting

Add to Firestore Rules to prevent abuse:

```javascript
// Limit writes per user
match /runs/{runId} {
  allow create: if isAuthenticated() 
                && request.resource.data.userId == request.auth.uid
                && request.time > resource.data.lastRun + duration.value(5, 'm'); // 5 min between runs
}
```

### 3. Domain Restrictions

In Firebase Console:
1. Go to Authentication → Settings → Authorized domains
2. Remove any domains you don't use
3. Only keep your production domain

### 4. Environment Variables

Your `.env` file should NOT be committed to Git:

```bash
# Check .gitignore includes:
.env
.env.local
.env*.local
```

For production, set environment variables in your hosting platform:
- **Vercel**: Project Settings → Environment Variables
- **Firebase Hosting**: Use `firebase functions:config:set`
- **Netlify**: Site Settings → Environment Variables

## 🚨 What to Actually Keep Secret:

These should NEVER be in client code:

- ❌ Firebase Admin SDK private keys
- ❌ Database passwords
- ❌ OAuth client secrets
- ❌ Payment API secret keys (Stripe secret key, etc.)
- ❌ Encryption keys

These are safe in client code:

- ✅ Firebase API keys (NEXT_PUBLIC_FIREBASE_*)
- ✅ Public OAuth client IDs
- ✅ Public Stripe/payment publishable keys
- ✅ Map API keys (with domain restrictions)

## 📋 Security Checklist:

- [ ] Deploy Firestore Security Rules
- [ ] Test rules in Firebase Console
- [ ] Enable Firebase Authentication
- [ ] Set up App Check (optional but recommended)
- [ ] Add domain restrictions in Firebase Console
- [ ] Don't commit `.env` to Git
- [ ] Set environment variables in hosting platform
- [ ] Enable 2FA on your Firebase account
- [ ] Regularly review Firebase Console → Usage & Billing

## 🔍 How to Verify Security:

1. **Try accessing data without auth**:
   - Open browser console
   - Try to read/write Firestore directly
   - Should be denied

2. **Try modifying another user's data**:
   - Login as User A
   - Try to update User B's profile
   - Should be denied

3. **Check Firebase Console logs**:
   - Look for unauthorized access attempts
   - Review security rule denials

## Summary:

✅ **Your current setup is safe** - API keys in `.env` are fine for Firebase
🔒 **Deploy the Firestore rules** - This is your real security layer
🛡️ **Consider App Check** - Extra protection for production
📊 **Monitor usage** - Watch for unusual activity in Firebase Console

Your app is secure as long as you deploy the Firestore Security Rules!
