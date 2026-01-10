# Technical Architecture: "Still Here" App

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE APPS                             │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   iOS App    │              │ Android App  │            │
│  │ (React Native)│              │(React Native)│            │
│  └──────┬───────┘              └──────┬───────┘            │
│         │                             │                     │
│         └──────────────┬──────────────┘                     │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │
                         │ HTTPS/REST API
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  FIREBASE BACKEND                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Firebase   │  │  Firestore   │  │   Cloud      │     │
│  │     Auth     │  │   Database   │  │  Functions   │     │
│  └──────────────┘  └──────────────┘  └──────┬───────┘     │
│                                              │              │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                         ┌─────────────────────┴──────────┐
                         │                                │
┌────────────────────────▼─────┐     ┌───────────────────▼────┐
│   EMAIL SERVICE              │     │  SCHEDULED JOBS        │
│   (SendGrid/Mailgun)         │     │  (Cloud Scheduler)     │
│   - Alert emails             │     │  - Daily check        │
│   - Transactional emails     │     │  - Alert triggers     │
└──────────────────────────────┘     └────────────────────────┘
```

---

## 📱 Frontend Architecture (React Native)

### Technology Stack

**Core Framework:**
```json
{
  "react-native": "0.73.x",
  "expo": "~50.0.0",
  "react": "18.2.x",
  "typescript": "^5.3.0"
}
```

**Key Dependencies:**
```json
{
  "navigation": "@react-navigation/native@^6.1.x",
  "state": "zustand@^4.5.x",
  "storage": "@react-native-async-storage/async-storage@^1.21.x",
  "notifications": "expo-notifications@~0.27.x",
  "firebase": "firebase@^10.7.x",
  "payments": "react-native-purchases@^7.x"
}
```

**Development Tools:**
```json
{
  "linting": "eslint@^8.x",
  "formatting": "prettier@^3.x",
  "testing": "jest@^29.x, @testing-library/react-native@^12.x"
}
```

---

### Folder Structure

```
still-here-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── ContactCard.tsx
│   │   └── CheckInButton.tsx
│   │
│   ├── screens/            # Main app screens
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── ContactsScreen.tsx
│   │   └── PaymentScreen.tsx
│   │
│   ├── navigation/         # Navigation config
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   │
│   ├── services/           # Business logic
│   │   ├── auth.service.ts
│   │   ├── checkin.service.ts
│   │   ├── notification.service.ts
│   │   ├── storage.service.ts
│   │   └── payment.service.ts
│   │
│   ├── store/              # State management (Zustand)
│   │   ├── authStore.ts
│   │   ├── checkinStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useCheckIn.ts
│   │   ├── useNotifications.ts
│   │   └── useContacts.ts
│   │
│   ├── utils/              # Helper functions
│   │   ├── date.utils.ts
│   │   ├── validation.utils.ts
│   │   └── constants.ts
│   │
│   ├── types/              # TypeScript types
│   │   ├── user.types.ts
│   │   ├── contact.types.ts
│   │   └── checkin.types.ts
│   │
│   └── config/             # App configuration
│       ├── firebase.config.ts
│       └── app.config.ts
│
├── assets/                 # Images, fonts, etc.
├── app.json               # Expo config
├── package.json
└── tsconfig.json
```

---

### Core Data Models (TypeScript)

```typescript
// src/types/user.types.ts
export interface User {
  id: string;
  email: string;
  createdAt: Date;
  isPaid: boolean;
  settings: UserSettings;
}

export interface UserSettings {
  reminderTime: string; // "09:00"
  alertThreshold: number; // days (default: 2)
  vacationMode: boolean;
  personalMessage: string;
  notificationsEnabled: boolean;
}

// src/types/contact.types.ts
export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  relationship: ContactRelationship;
  createdAt: Date;
}

export enum ContactRelationship {
  FAMILY = 'family',
  FRIEND = 'friend',
  NEIGHBOR = 'neighbor',
  COLLEAGUE = 'colleague',
  OTHER = 'other'
}

// src/types/checkin.types.ts
export interface CheckIn {
  id: string;
  userId: string;
  timestamp: Date;
  method: CheckInMethod;
}

export enum CheckInMethod {
  APP = 'app',
  WIDGET = 'widget',
  WATCH = 'watch'
}

export interface Alert {
  id: string;
  userId: string;
  sentAt: Date;
  contactsNotified: string[]; // contactIds
  reason: AlertReason;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export enum AlertReason {
  MISSED_CHECKIN = 'missed_checkin',
  MANUAL_TRIGGER = 'manual_trigger'
}
```

---

### State Management (Zustand)

```typescript
// src/store/checkinStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CheckInState {
  lastCheckIn: Date | null;
  streak: number;
  checkIns: CheckIn[];

  // Actions
  recordCheckIn: () => Promise<void>;
  loadCheckIns: () => Promise<void>;
  calculateStreak: () => number;
}

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      lastCheckIn: null,
      streak: 0,
      checkIns: [],

      recordCheckIn: async () => {
        const now = new Date();
        const newCheckIn: CheckIn = {
          id: generateId(),
          userId: getCurrentUserId(),
          timestamp: now,
          method: CheckInMethod.APP
        };

        // Update local state
        set({
          lastCheckIn: now,
          checkIns: [newCheckIn, ...get().checkIns],
          streak: get().calculateStreak() + 1
        });

        // Sync to Firebase
        await saveCheckInToFirebase(newCheckIn);
      },

      calculateStreak: () => {
        const checkIns = get().checkIns;
        if (!checkIns.length) return 0;

        let streak = 0;
        const today = startOfDay(new Date());

        for (let i = 0; i < checkIns.length; i++) {
          const checkInDate = startOfDay(checkIns[i].timestamp);
          const expectedDate = subDays(today, i);

          if (isSameDay(checkInDate, expectedDate)) {
            streak++;
          } else {
            break;
          }
        }

        return streak;
      },

      loadCheckIns: async () => {
        const checkIns = await fetchCheckInsFromFirebase();
        set({ checkIns, streak: get().calculateStreak() });
      }
    }),
    {
      name: 'checkin-storage',
      storage: AsyncStorage
    }
  )
);
```

---

## 🔥 Backend Architecture (Firebase)

### Firebase Services Used

1. **Firebase Authentication**
   - Email/password auth
   - Anonymous auth for free trial (optional)
   - User management

2. **Cloud Firestore (Database)**
   - Real-time NoSQL database
   - Offline persistence
   - Security rules

3. **Cloud Functions (Serverless)**
   - Email sending logic
   - Check-in monitoring
   - Alert triggers

4. **Cloud Scheduler**
   - Daily cron job to check for missed check-ins
   - Runs at 9:00 AM UTC daily

5. **Firebase Extensions**
   - Send Email via SendGrid (optional)

---

### Firestore Data Schema

```javascript
// Collection: users
users/{userId}
{
  email: string,
  createdAt: timestamp,
  isPaid: boolean,
  lastCheckIn: timestamp,
  streak: number,
  settings: {
    reminderTime: string,
    alertThreshold: number,
    vacationMode: boolean,
    personalMessage: string,
    notificationsEnabled: boolean
  }
}

// Collection: contacts
contacts/{contactId}
{
  userId: string,
  name: string,
  email: string,
  phone: string | null,
  relationship: string,
  createdAt: timestamp
}

// Collection: checkins
checkins/{checkInId}
{
  userId: string,
  timestamp: timestamp,
  method: string
}

// Collection: alerts
alerts/{alertId}
{
  userId: string,
  sentAt: timestamp,
  contactsNotified: array<string>,
  reason: string,
  resolved: boolean,
  resolvedAt: timestamp | null,
  resolvedBy: string | null
}

// Collection: payments (optional, for analytics)
payments/{paymentId}
{
  userId: string,
  amount: number,
  currency: string,
  platform: string, // 'ios' | 'android'
  transactionId: string,
  createdAt: timestamp
}
```

---

### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read, update, delete: if isOwner(userId);
      allow create: if isAuthenticated();
    }

    // Contacts collection
    match /contacts/{contactId} {
      allow read, write: if isOwner(resource.data.userId);
    }

    // Check-ins collection
    match /checkins/{checkInId} {
      allow read, create: if isOwner(resource.data.userId);
      allow update, delete: if false; // Check-ins are immutable
    }

    // Alerts collection (read-only for users, written by Cloud Functions)
    match /alerts/{alertId} {
      allow read: if isOwner(resource.data.userId);
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

---

### Cloud Functions

#### 1. Daily Check-In Monitor (Scheduled)

```typescript
// functions/src/checkMissedCheckIns.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendAlertEmail } from './email.service';

export const checkMissedCheckIns = functions.pubsub
  .schedule('0 9 * * *') // 9:00 AM UTC daily
  .timeZone('UTC')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();

    // Get all users not in vacation mode
    const usersSnapshot = await db.collection('users')
      .where('settings.vacationMode', '==', false)
      .get();

    const promises = usersSnapshot.docs.map(async (doc) => {
      const user = doc.data();
      const userId = doc.id;

      // Check if user has missed check-in threshold
      const alertThreshold = user.settings.alertThreshold || 2;
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - alertThreshold);

      const lastCheckIn = user.lastCheckIn?.toDate();

      if (!lastCheckIn || lastCheckIn < thresholdDate) {
        // User has missed check-in! Send alert.
        await sendAlert(userId, user, lastCheckIn);
      }
    });

    await Promise.all(promises);
    console.log(`Checked ${usersSnapshot.size} users for missed check-ins`);
  });

async function sendAlert(userId: string, user: any, lastCheckIn: Date | null) {
  const db = admin.firestore();

  // Get user's emergency contacts
  const contactsSnapshot = await db.collection('contacts')
    .where('userId', '==', userId)
    .get();

  const contacts = contactsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  if (!contacts.length) {
    console.warn(`User ${userId} has no emergency contacts`);
    return;
  }

  // Send email to each contact
  const emailPromises = contacts.map(contact =>
    sendAlertEmail({
      contactName: contact.name,
      contactEmail: contact.email,
      userName: user.email.split('@')[0], // Use email prefix as name
      lastCheckInDate: lastCheckIn,
      personalMessage: user.settings.personalMessage,
      userEmail: user.email,
      userPhone: contact.phone // If user provided to this contact
    })
  );

  await Promise.all(emailPromises);

  // Log alert in database
  await db.collection('alerts').add({
    userId,
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
    contactsNotified: contacts.map(c => c.id),
    reason: 'missed_checkin',
    resolved: false,
    resolvedAt: null,
    resolvedBy: null
  });

  console.log(`Sent alert for user ${userId} to ${contacts.length} contacts`);
}
```

---

#### 2. Email Service (SendGrid)

```typescript
// functions/src/email.service.ts
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface AlertEmailParams {
  contactName: string;
  contactEmail: string;
  userName: string;
  lastCheckInDate: Date | null;
  personalMessage?: string;
  userEmail?: string;
  userPhone?: string;
}

export async function sendAlertEmail(params: AlertEmailParams) {
  const {
    contactName,
    contactEmail,
    userName,
    lastCheckInDate,
    personalMessage,
    userEmail,
    userPhone
  } = params;

  const lastCheckInText = lastCheckInDate
    ? lastCheckInDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    : 'Unknown';

  const msg = {
    to: contactEmail,
    from: 'alerts@stillhereapp.com', // Verified sender
    subject: `[Still Here App] Check-in Alert for ${userName}`,
    text: `
Hi ${contactName},

This is an automated message from the Still Here app.

${userName} has not checked in for 2 consecutive days.
Last check-in: ${lastCheckInText}

This may be nothing, but they set you as an emergency contact in case they couldn't check in.

Please reach out to confirm they're okay:
${userEmail ? `Email: ${userEmail}` : ''}
${userPhone ? `Phone: ${userPhone}` : ''}

${personalMessage ? `\nPersonal message from ${userName}:\n"${personalMessage}"` : ''}

---
Sent by Still Here App
www.stillhereapp.com

[Report False Alarm] [Unsubscribe]
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4A90E2; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .alert-box { background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; }
    .contact-info { background: white; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    .button { display: inline-block; padding: 12px 24px; background: #4A90E2; color: white; text-decoration: none; border-radius: 4px; margin: 10px 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❤️ Still Here App</h1>
      <p>Check-in Alert</p>
    </div>
    <div class="content">
      <p>Hi ${contactName},</p>

      <div class="alert-box">
        <strong>⚠️ ${userName} has not checked in for 2 consecutive days.</strong><br>
        Last check-in: <strong>${lastCheckInText}</strong>
      </div>

      <p>This may be nothing, but they set you as an emergency contact in case they couldn't check in.</p>

      <p><strong>Please reach out to confirm they're okay:</strong></p>

      <div class="contact-info">
        ${userEmail ? `📧 Email: <a href="mailto:${userEmail}">${userEmail}</a><br>` : ''}
        ${userPhone ? `📞 Phone: <a href="tel:${userPhone}">${userPhone}</a>` : ''}
      </div>

      ${personalMessage ? `
        <div class="contact-info">
          <strong>Personal message from ${userName}:</strong><br>
          "${personalMessage}"
        </div>
      ` : ''}

      <div class="footer">
        <p>Sent by <a href="https://stillhereapp.com">Still Here App</a></p>
        <p><a href="#">Report False Alarm</a> | <a href="#">Unsubscribe</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`Alert email sent to ${contactEmail}`);
  } catch (error) {
    console.error(`Failed to send email to ${contactEmail}:`, error);
    throw error;
  }
}
```

---

#### 3. Check-In Handler (Callable Function)

```typescript
// functions/src/checkin.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const recordCheckIn = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const db = admin.firestore();

  const checkIn = {
    userId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    method: data.method || 'app'
  };

  // Add check-in record
  await db.collection('checkins').add(checkIn);

  // Update user's last check-in
  await db.collection('users').doc(userId).update({
    lastCheckIn: admin.firestore.FieldValue.serverTimestamp(),
    streak: admin.firestore.FieldValue.increment(1) // Simplified streak logic
  });

  return { success: true, timestamp: new Date().toISOString() };
});
```

---

## 📬 Push Notifications

### Notification Strategy

1. **Daily Check-In Reminder**
   - Scheduled locally on device
   - Time set by user (default 9 AM)
   - Does NOT require internet

2. **Streak Celebration** (Optional v2.0)
   - 7-day streak: "You're on a roll! 🔥"
   - 30-day streak: "One month strong! 💪"
   - 100-day streak: "You're legendary! 🏆"

---

### Implementation (Expo Notifications)

```typescript
// src/services/notification.service.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleDailyReminder(time: string) {
  // Cancel existing reminders
  await Notifications.cancelAllScheduledNotificationsAsync();

  const [hour, minute] = time.split(':').map(Number);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Still Here? ❤️",
      body: "Don't forget your daily check-in!",
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}

export async function sendCheckInConfirmation() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Checked In! ✅",
      body: "Your emergency contacts won't be notified.",
    },
    trigger: null, // Send immediately
  });
}
```

---

## 💳 Payment Integration

### RevenueCat (Recommended)

**Why RevenueCat:**
- Handles both iOS and Android
- Manages subscriptions AND one-time purchases
- Server-side receipt validation
- Analytics dashboard
- No backend code needed

```typescript
// src/services/payment.service.ts
import Purchases, { PurchasesPackage } from 'react-native-purchases';

const REVENUECAT_API_KEY = {
  ios: 'appl_xxxxxxxxxxxxx',
  android: 'goog_xxxxxxxxxxxxx'
};

export async function initializePurchases() {
  await Purchases.configure({
    apiKey: Platform.OS === 'ios' ? REVENUECAT_API_KEY.ios : REVENUECAT_API_KEY.android,
  });
}

export async function getAvailablePackages(): Promise<PurchasesPackage[]> {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages || [];
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    // Check if user has access to "premium" entitlement
    const isPaid = customerInfo.entitlements.active['premium'] !== undefined;

    // Update Firestore
    if (isPaid) {
      await updateUserPaidStatus(true);
    }

    return isPaid;
  } catch (error) {
    if (error.userCancelled) {
      console.log('User cancelled purchase');
    } else {
      console.error('Purchase error:', error);
    }
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    const isPaid = customerInfo.entitlements.active['premium'] !== undefined;

    if (isPaid) {
      await updateUserPaidStatus(true);
    }

    return isPaid;
  } catch (error) {
    console.error('Restore error:', error);
    return false;
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Jest)
- Utility functions (date calculations, validation)
- Store logic (streak calculation, check-in logic)
- Service functions (email formatting, notification scheduling)

### Integration Tests
- Firebase operations (CRUD)
- Payment flow (RevenueCat sandbox)
- Email sending (SendGrid test mode)

### E2E Tests (Detox - Optional)
- Onboarding flow
- Check-in flow
- Settings updates

### Manual Testing Checklist
- [ ] iOS device testing (iPhone)
- [ ] Android device testing (Pixel)
- [ ] Notification delivery
- [ ] Email delivery
- [ ] Payment flow (sandbox)
- [ ] Offline functionality
- [ ] App Store review guidelines compliance

---

## 🚀 Deployment Pipeline

### Environments

1. **Development**
   - Firebase project: `still-here-dev`
   - Expo development build
   - Test email addresses

2. **Staging**
   - Firebase project: `still-here-staging`
   - TestFlight (iOS) / Internal Testing (Android)
   - Real emails to test accounts

3. **Production**
   - Firebase project: `still-here-prod`
   - App Store / Google Play
   - Real users

---

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build app
        run: npx expo build:ios && npx expo build:android

      - name: Deploy Cloud Functions
        run: |
          cd functions
          npm ci
          npx firebase deploy --only functions --project still-here-prod
```

---

## 🔒 Security Considerations

### Data Encryption
- Firebase encrypts data at rest and in transit
- Use HTTPS for all API calls
- Store sensitive data (emails) with encryption

### Privacy
- No tracking pixels
- No third-party analytics (except App Store)
- Minimal data collection (email, check-ins only)
- GDPR-compliant data export/deletion

### Authentication
- Email/password only (no social login for privacy)
- Password requirements: 8+ characters
- Rate limiting on Cloud Functions

### Vulnerability Scanning
- Dependabot for npm package updates
- Regular security audits
- Penetration testing before launch

---

## 📊 Monitoring & Analytics

### Firebase Analytics (Minimal)
- App opens
- Check-ins completed
- Payments successful
- Crashes

### Custom Metrics
- Daily Active Users (DAU)
- Check-in completion rate
- Streak average
- Alert false positive rate

### Error Tracking
- Sentry (or Firebase Crashlytics)
- Email delivery failures
- Payment errors

---

## 📦 Third-Party Services Cost Estimate

| Service | Free Tier | Paid Tier | Expected Cost |
|---------|-----------|-----------|---------------|
| Firebase | 20K users/month | $25/month Blaze plan | $0-$50/month |
| SendGrid | 100 emails/day | $19.95/month (40K emails) | $0-$20/month |
| RevenueCat | Free for < $10K MRR | 1% of revenue | $0-$80/month |
| Expo | Free | $29/month (Team) | $0 initially |
| **Total** | | | **$0-$180/month** |

For 1,000 users: ~$20/month
For 10,000 users: ~$100/month
For 100,000 users: ~$500/month

---

## 🎯 Performance Targets

- App launch: < 2 seconds
- Check-in tap to confirmation: < 1 second
- Offline support: Check-in queued and synced when online
- Battery usage: < 1% per day (background tasks)
- App size: < 20 MB (both platforms)

---

## ✅ Development Checklist

### Phase 1: Setup (Week 1)
- [ ] Create Firebase project
- [ ] Setup React Native / Expo project
- [ ] Configure TypeScript
- [ ] Setup ESLint + Prettier
- [ ] Create Git repository
- [ ] Setup CI/CD pipeline

### Phase 2: Core Features (Week 2-3)
- [ ] Authentication (email/password)
- [ ] Check-in button + local storage
- [ ] Emergency contact management
- [ ] Settings screen
- [ ] Push notifications
- [ ] Firebase sync logic

### Phase 3: Backend (Week 3-4)
- [ ] Cloud Functions: check-in monitor
- [ ] Cloud Functions: email alerts
- [ ] SendGrid integration
- [ ] Firestore security rules
- [ ] Cloud Scheduler setup

### Phase 4: Polish (Week 4)
- [ ] Payment integration (RevenueCat)
- [ ] Onboarding flow
- [ ] UI/UX polish
- [ ] Error handling
- [ ] Offline support
- [ ] App icons + splash screen

### Phase 5: Testing (Week 5)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Beta testing (10 users)
- [ ] Bug fixes
- [ ] Performance optimization

### Phase 6: Deployment (Week 6)
- [ ] App Store submission (iOS)
- [ ] Google Play submission (Android)
- [ ] Production Firebase deployment
- [ ] Monitoring setup
- [ ] Marketing preparation

---

**Document Version:** 1.0
**Last Updated:** 2026-01-10
**Status:** Ready for implementation

---

## Next: Start Building! 🚀

Proceed to: `/src` folder creation and component development.
