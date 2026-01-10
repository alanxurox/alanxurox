# Firebase Backend Setup Guide

Complete guide to setting up Firebase backend for "Still Here" app.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase CLI: `npm install -g firebase-tools`
- Google account
- SendGrid account (for email alerts)

---

## 🚀 Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
Visit: https://console.firebase.google.com

### 1.2 Create New Project
```
Project Name: still-here-prod
Google Analytics: Enable (optional)
```

### 1.3 Create Additional Projects (Optional)
```
Development: still-here-dev
Staging: still-here-staging
```

---

## 🔧 Step 2: Configure Firebase Project

### 2.1 Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. (Optional) Enable **Anonymous** for free trial

### 2.2 Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create Database**
3. Choose location: `us-central1` (or closest to your users)
4. Start in **Production mode** (we'll deploy security rules)

### 2.3 Enable Cloud Functions

1. Go to **Functions**
2. Click **Get Started**
3. Upgrade to **Blaze Plan** (pay-as-you-go)
   - Required for Cloud Scheduler
   - Still free tier available

### 2.4 Enable Cloud Scheduler

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Select your Firebase project
3. Enable **Cloud Scheduler API**
4. Create App Engine app (required for Scheduler)
   - Region: `us-central` (or your choice)

---

## 💳 Step 3: Set Up SendGrid

### 3.1 Create SendGrid Account
Visit: https://signup.sendgrid.com

### 3.2 Verify Sender Email
1. Go to **Settings** → **Sender Authentication**
2. Verify domain: `stillhereapp.com`
   - Or verify single email: `alerts@stillhereapp.com`
3. Follow DNS verification steps

### 3.3 Create API Key
1. Go to **Settings** → **API Keys**
2. Create key with **Full Access**
3. Copy key (you'll need it later)

```bash
# Your SendGrid API key (SAVE THIS SECURELY)
SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📱 Step 4: Initialize Firebase in Your Project

### 4.1 Login to Firebase CLI
```bash
firebase login
```

### 4.2 Initialize Firebase in App Directory
```bash
cd still-here-app

# Initialize Firebase
firebase init

# Select:
☑ Firestore: Deploy rules and create indexes
☑ Functions: Configure Cloud Functions
☑ Hosting: Configure hosting (optional)
☑ Storage: Deploy storage rules

# Use existing project: still-here-prod
# TypeScript: Yes
# ESLint: Yes
# Install dependencies: Yes
```

### 4.3 Configure .firebaserc
```bash
cp .firebaserc.template .firebaserc

# Edit .firebaserc with your project IDs
{
  "projects": {
    "default": "still-here-prod",
    "dev": "still-here-dev",
    "staging": "still-here-staging"
  }
}
```

---

## 🔑 Step 5: Set Environment Variables

### 5.1 Set SendGrid API Key
```bash
# Set secret for production
firebase functions:secrets:set SENDGRID_API_KEY

# When prompted, paste your SendGrid API key
```

### 5.2 Verify Secrets
```bash
firebase functions:secrets:access SENDGRID_API_KEY
```

---

## 🏗️ Step 6: Build and Deploy Functions

### 6.1 Install Dependencies
```bash
cd functions
npm install
```

### 6.2 Build Functions
```bash
npm run build
```

### 6.3 Test Locally (Optional)
```bash
# Start Firebase emulators
npm run serve

# Emulator UI: http://localhost:4000
# Functions: http://localhost:5001
# Firestore: http://localhost:8080
```

### 6.4 Deploy to Production
```bash
# Deploy everything
cd ..
firebase deploy

# Or deploy specific services:
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## ⏰ Step 7: Set Up Cloud Scheduler

### 7.1 Verify Scheduled Function
After deploying, the `checkMissedCheckIns` function should automatically create a Cloud Scheduler job.

### 7.2 Manually Create Job (if needed)
```bash
# Go to Cloud Console → Cloud Scheduler
# Create job:
Name: check-missed-checkins
Frequency: 0 9 * * * (9:00 AM UTC daily)
Timezone: UTC
Target: Pub/Sub
Topic: firebase-schedule-checkMissedCheckIns-<region>
Payload: (leave empty)
```

### 7.3 Test Scheduled Function
```bash
# Manually trigger via Firebase Console
# Functions → checkMissedCheckIns → Test function
```

---

## 🔒 Step 8: Configure Security Rules

Security rules are already written in `firestore.rules`. Deploy them:

```bash
firebase deploy --only firestore:rules
```

### Verify Rules
1. Go to Firestore → Rules tab
2. Confirm rules are deployed
3. Run simulation tests in Firebase Console

---

## 📊 Step 9: Create Firestore Indexes

Indexes are defined in `firestore.indexes.json`. Deploy them:

```bash
firebase deploy --only firestore:indexes
```

### Manual Index Creation (if needed)
If you see "index required" errors, Firebase will provide a link to create the missing index.

---

## 🔗 Step 10: Connect Mobile App to Firebase

### 10.1 Register iOS App
1. Go to **Project Settings** → **Your apps**
2. Click **Add app** → iOS
3. Bundle ID: `com.stillhere.app`
4. Download `GoogleService-Info.plist`
5. Add to Xcode project

### 10.2 Register Android App
1. Click **Add app** → Android
2. Package name: `com.stillhere.app`
3. Download `google-services.json`
4. Place in `android/app/`

### 10.3 Install Firebase SDK in React Native
```bash
# Already installed via package.json
npm install firebase

# Or use React Native Firebase (recommended)
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
npm install @react-native-firebase/functions
```

### 10.4 Initialize Firebase in App
Create `src/config/firebase.config.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "still-here-prod.firebaseapp.com",
  projectId: "still-here-prod",
  storageBucket: "still-here-prod.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
```

**⚠️ IMPORTANT**: Get your actual config from Firebase Console → Project Settings → Your apps

---

## ✅ Step 11: Test the Backend

### 11.1 Test User Creation
```bash
# Create test user in Firebase Console
# Authentication → Users → Add user

Email: test@example.com
Password: testpassword123
```

### 11.2 Test Check-In Function
```typescript
// In your React Native app
import { httpsCallable } from 'firebase/functions';
import { functions } from './config/firebase.config';

const recordCheckIn = httpsCallable(functions, 'recordCheckIn');

async function testCheckIn() {
  try {
    const result = await recordCheckIn({ method: 'app' });
    console.log('Check-in success:', result.data);
  } catch (error) {
    console.error('Check-in error:', error);
  }
}
```

### 11.3 Test Missed Check-In Alert
```bash
# Option 1: Wait 48 hours (not practical)

# Option 2: Manually modify user's lastCheckIn in Firestore
# Set it to 3 days ago, then trigger scheduled function

# Option 3: Call manual trigger function
firebase functions:shell
> checkMissedCheckInsManual()
```

---

## 📈 Step 12: Monitor and Debug

### 12.1 View Function Logs
```bash
# Stream logs in terminal
firebase functions:log

# Or view in Firebase Console
# Functions → Logs tab
```

### 12.2 Monitor Function Performance
1. Go to **Functions** → **Dashboard**
2. Check:
   - Invocations count
   - Execution time
   - Error rate
   - Memory usage

### 12.3 Set Up Alerts
1. Go to **Alerting** in Firebase Console
2. Create alerts for:
   - Function errors > 5% error rate
   - Firestore read/write spikes
   - Budget alerts (if costs exceed $X)

---

## 💰 Step 13: Estimate Costs

### Firebase Pricing (Blaze Plan)

**Free Tier (Monthly):**
- Cloud Functions: 2M invocations, 400K GB-seconds
- Firestore: 50K reads, 20K writes, 20K deletes, 1GB storage
- Cloud Scheduler: 3 jobs free

**Paid Tier (After Free Tier):**
- Functions: $0.40 per million invocations
- Firestore: $0.06 per 100K reads, $0.18 per 100K writes
- Cloud Scheduler: $0.10 per job per month

**SendGrid Pricing:**
- Free: 100 emails/day
- Essentials: $19.95/month for 40K emails

**Estimated Monthly Costs:**
```
1,000 users:
- Functions: ~$5 (check-ins + scheduled job)
- Firestore: ~$5 (reads/writes)
- SendGrid: Free tier (if < 100 alerts/day)
Total: ~$10/month

10,000 users:
- Functions: ~$50
- Firestore: ~$50
- SendGrid: ~$20 (Essentials plan)
Total: ~$120/month

100,000 users:
- Functions: ~$500
- Firestore: ~$500
- SendGrid: ~$100
Total: ~$1,100/month
```

---

## 🛠️ Troubleshooting

### Issue: "Permission denied" errors
**Solution:** Deploy Firestore rules
```bash
firebase deploy --only firestore:rules
```

### Issue: "Index required" error
**Solution:** Click the link in the error message to auto-create the index, or:
```bash
firebase deploy --only firestore:indexes
```

### Issue: SendGrid emails not sending
**Solutions:**
1. Verify sender email in SendGrid
2. Check API key is set correctly:
   ```bash
   firebase functions:secrets:access SENDGRID_API_KEY
   ```
3. Check function logs for errors:
   ```bash
   firebase functions:log --only checkMissedCheckIns
   ```

### Issue: Scheduled function not running
**Solutions:**
1. Verify Cloud Scheduler is enabled in Google Cloud Console
2. Check job exists: Cloud Console → Cloud Scheduler
3. Manually trigger to test:
   ```bash
   firebase functions:shell
   > checkMissedCheckInsManual()
   ```
4. Check function logs for errors

### Issue: High Firebase costs
**Solutions:**
1. Enable offline persistence (reduce reads):
   ```typescript
   import { enableIndexedDbPersistence } from 'firebase/firestore';
   enableIndexedDbPersistence(db);
   ```
2. Use Firestore bundles for initial data
3. Implement client-side caching
4. Optimize queries (use indexes, limit results)

---

## 📚 Additional Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Cloud Functions Guide**: https://firebase.google.com/docs/functions
- **Firestore Security Rules**: https://firebase.google.com/docs/firestore/security/get-started
- **SendGrid API Docs**: https://docs.sendgrid.com/api-reference/mail-send/mail-send
- **React Native Firebase**: https://rnfirebase.io

---

## ✅ Deployment Checklist

### Before Launch:
- [ ] Firebase project created (prod + dev)
- [ ] Authentication enabled (email/password)
- [ ] Firestore database created
- [ ] Cloud Functions deployed
- [ ] Cloud Scheduler configured (9 AM UTC daily)
- [ ] SendGrid account verified
- [ ] SendGrid API key set as secret
- [ ] Security rules deployed
- [ ] Firestore indexes created
- [ ] Mobile apps registered (iOS + Android)
- [ ] Firebase SDK configured in React Native
- [ ] Test check-in function works
- [ ] Test email alert sends successfully
- [ ] Monitoring/alerts configured
- [ ] Cost estimates reviewed

### After Launch:
- [ ] Monitor function logs daily (first week)
- [ ] Check email deliverability rates
- [ ] Review Firebase usage/costs weekly
- [ ] Set up budget alerts
- [ ] Scale Firestore rules as needed
- [ ] Optimize queries based on real usage
- [ ] Add additional indexes if needed

---

## 🎯 Next Steps

1. Complete this setup guide
2. Test all functions thoroughly
3. Deploy to staging environment first
4. Run beta test with 10-50 users
5. Monitor for issues
6. Deploy to production
7. Launch app! 🚀

---

**Document Version:** 1.0
**Last Updated:** 2026-01-10
**Status:** Production-ready

Need help? Contact: tech@stillhereapp.com
