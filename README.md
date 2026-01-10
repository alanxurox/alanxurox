# Still Here - Safety Check-In App

> Daily check-in app for people living alone. Western adaptation of China's viral "死了么" (Are You Dead Yet?) app.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-50.0-000020)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

---

## 📖 Project Overview

**Still Here** is a mobile safety app designed for the 44+ million Americans living alone. Users check in daily with a single button tap. If they miss check-ins for 2 consecutive days, the app automatically notifies their emergency contacts via email.

### Inspiration

This project was inspired by China's "死了么" (Are You Dead Yet?) app, which went viral in January 2025 for addressing solo-living anxiety with extreme simplicity: one button, one function, zero complexity.

### Key Features

- ✅ **One-Tap Check-In**: Giant button interface, 2-second daily task
- 📧 **Automated Alerts**: Email emergency contacts after 2 missed days
- 🔒 **Privacy-First**: No GPS tracking, no data selling, no ads
- 💰 **One-Time Payment**: $7.99 once (no subscriptions)
- 📊 **Streak Tracking**: Gamified motivation to maintain consistency
- 🏖️ **Vacation Mode**: Pause alerts during travel
- ⚙️ **Customizable**: Reminder time, alert threshold, personal messages

---

## 🎯 Market Positioning

| Feature | Still Here | Life Alert | Snug Safety | Dead Man's Switch Apps |
|---------|-----------|------------|-------------|----------------------|
| **Price** | $7.99 once | $30/month | Free (ads/data) | $15/month |
| **Target** | Everyone | Seniors | Seniors | Tech users |
| **Privacy** | No tracking | Unknown | Data collection | Varies |
| **Complexity** | 1 button | Complex | Medium | High |
| **Stigma** | None | "I've fallen" | Senior-focused | Morbid naming |

**Competitive Advantage:**
1. Lowest one-time cost (vs. subscriptions)
2. Multi-generational appeal (not senior-only)
3. Extreme simplicity (inspired by "死了么")
4. Privacy-first (no GPS, no ads)
5. Viral marketing potential (provocative but tasteful)

---

## 🏗️ Technical Architecture

### Tech Stack

**Frontend:**
- React Native 0.73 (Expo framework)
- TypeScript 5.3
- Zustand (state management)
- React Navigation 6.x
- date-fns (date utilities)

**Backend:**
- Firebase Authentication
- Cloud Firestore (database)
- Cloud Functions (serverless)
- Cloud Scheduler (cron jobs)
- SendGrid (email delivery)

**Payments:**
- Apple In-App Purchase (iOS)
- Google Play Billing (Android)
- RevenueCat (unified billing & analytics)

### Project Structure

```
still-here-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── CheckInButton.tsx
│   │   └── ContactCard.tsx
│   │
│   ├── screens/             # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── ContactsScreen.tsx
│   │   └── SettingsScreen.tsx
│   │
│   ├── navigation/          # Navigation setup
│   │   └── AppNavigator.tsx
│   │
│   ├── store/               # State management (Zustand)
│   │   ├── checkinStore.ts
│   │   ├── contactsStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── user.types.ts
│   │   ├── contact.types.ts
│   │   └── checkin.types.ts
│   │
│   └── utils/               # Helper functions
│       ├── constants.ts
│       ├── date.utils.ts
│       └── validation.utils.ts
│
├── functions/               # Firebase Cloud Functions (TODO)
│   ├── src/
│   │   ├── checkMissedCheckIns.ts
│   │   └── email.service.ts
│   └── package.json
│
├── docs/                    # Documentation
│   ├── COMPETITOR_ANALYSIS.md
│   ├── PRODUCT_SPEC.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── GO_TO_MARKET_STRATEGY.md
│   └── APP_STORE_LISTING.md
│
└── README.md (this file)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- iOS: macOS with Xcode 14+
- Android: Android Studio
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/still-here-app.git
cd still-here-app

# Navigate to app directory
cd still-here-app

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web (for testing):**
```bash
npm run web
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# SendGrid
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=alerts@stillhereapp.com

# RevenueCat
REVENUECAT_API_KEY_IOS=your_ios_key
REVENUECAT_API_KEY_ANDROID=your_android_key
```

### Firebase Setup

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Deploy Cloud Functions:
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

---

## 📱 Building for Production

### iOS

```bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android

```bash
# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

---

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests (Optional)

```bash
npm run test:e2e
```

### Manual Testing Checklist

- [ ] Check-in button tap (success state)
- [ ] Streak calculation (daily increments)
- [ ] Emergency contact CRUD operations
- [ ] Settings updates (reminder time, alert threshold)
- [ ] Vacation mode toggle
- [ ] Push notification delivery
- [ ] Email alert sending (after 2 missed days)
- [ ] Payment flow (sandbox)
- [ ] Offline functionality
- [ ] Data persistence

---

## 📊 Key Metrics

### Success Criteria (Month 1)

- [ ] 10,000 downloads
- [ ] $16,000 revenue (2,000 paying users @ $7.99)
- [ ] 70% daily check-in rate
- [ ] 4.5+ App Store rating
- [ ] 5+ press mentions

### Current Status

- Downloads: [TBD]
- Revenue: [TBD]
- DAU: [TBD]
- Rating: [TBD]

---

## 🛣️ Roadmap

### v1.0 (Launch - Current)
- [x] Core check-in functionality
- [x] Emergency contact management
- [x] Email alerts
- [x] Basic settings
- [ ] Payment integration
- [ ] App Store submission

### v1.1 (Month 2)
- [ ] Push notifications (daily reminders)
- [ ] Home screen widget (iOS/Android)
- [ ] Improved onboarding
- [ ] Bug fixes from launch feedback

### v2.0 (Month 3-4)
- [ ] SMS alerts (paid add-on)
- [ ] Apple Watch app
- [ ] Check-in history view
- [ ] Wellness Wednesday newsletter
- [ ] Social sharing (streak milestones)

### v3.0 (Month 6+)
- [ ] Community features
- [ ] International expansion (UK, Canada, Australia)
- [ ] Localization (German, Spanish, French)
- [ ] Partner integrations (ADHD orgs, senior care)

---

## 📄 Documentation

Comprehensive documentation available in `/docs`:

1. **[COMPETITOR_ANALYSIS.md](./COMPETITOR_ANALYSIS.md)**
   - Market research on 8 competitors
   - Feature comparison matrix
   - Differentiation opportunities

2. **[PRODUCT_SPEC.md](./PRODUCT_SPEC.md)**
   - Full product requirements
   - User flows and wireframes
   - Business model details

3. **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)**
   - System architecture diagrams
   - Data models and schemas
   - API documentation
   - Security considerations

4. **[GO_TO_MARKET_STRATEGY.md](./GO_TO_MARKET_STRATEGY.md)**
   - Launch plan (4-phase strategy)
   - Marketing campaigns
   - Content calendar
   - PR outreach templates

5. **[APP_STORE_LISTING.md](./APP_STORE_LISTING.md)**
   - App Store descriptions
   - Screenshots & preview video scripts
   - Keywords & ASO strategy

---

## 🤝 Contributing

This is currently a closed-source commercial project. If you're interested in collaboration, please reach out to [support@stillhereapp.com](mailto:support@stillhereapp.com).

---

## 📝 License

Proprietary. © 2026 Still Here, Inc. All rights reserved.

---

## 🙏 Acknowledgments

- Inspired by China's "死了么" (Are You Dead Yet?) app
- Built in response to the loneliness epidemic affecting 44M+ Americans
- Designed for simplicity, privacy, and peace of mind

---

## 📧 Contact

- **Website:** [stillhereapp.com](https://stillhereapp.com)
- **Support:** [support@stillhereapp.com](mailto:support@stillhereapp.com)
- **Twitter:** [@stillhereapp](https://twitter.com/stillhereapp)
- **Instagram:** [@stillhereapp](https://instagram.com/stillhereapp)

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/still-here-app?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/still-here-app?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/yourusername/still-here-app?style=social)

---

**Make sure someone notices.**

Still Here - 2026
