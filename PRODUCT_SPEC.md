# Product Specification: "Still Here" App

## 🎯 Executive Summary

**Product Name:** "Still Here" (working title)
**Tagline:** "The simplest way to make sure someone notices."
**Category:** Health & Safety / Lifestyle
**Platform:** iOS & Android (React Native)
**Pricing:** $7.99 one-time payment (no subscriptions)
**Target Launch:** Q1 2026

**Elevator Pitch:**
Living alone? "Still Here" is a dead-simple safety net. Check in daily. Miss two days? We email your emergency contact. That's it. No GPS tracking. No subscriptions. No BS. Just peace of mind for $7.99.

---

## 📊 Market Opportunity

- **44M+ people** living alone in US/UK alone
- **Loneliness epidemic** recognized as public health crisis
- **Atomized society** = growing anxiety about dying unnoticed
- **Subscription fatigue** = opportunity for one-time payment model
- **Privacy concerns** = opportunity for minimal-data app

**Target Demographics:**
1. Young professionals (25-40) living alone in cities
2. Digital nomads and remote workers
3. International students far from family
4. Neurodivergent adults who may struggle with routine contact
5. Elderly adults maintaining independence (but NOT primary focus)
6. People with chronic health conditions living alone

---

## 🎨 Product Name Options

### Final Recommendations (in order):

1. **"Still Here"** ⭐ RECOMMENDED
   - Simple, direct, reassuring
   - Less morbid than "Are You Dead Yet?"
   - Positive framing vs. negative
   - Easy to say, remember, search
   - App Store friendly

2. **"Check Pulse"**
   - Medical humor angle
   - Younger demographic appeal
   - Slightly more edgy

3. **"Still Breathing"**
   - Similar to "Still Here" but more visceral
   - Could be too dark

4. **"Not Dead Yet"**
   - Monty Python reference (generational)
   - Humorous but might limit audience

**DECISION: "Still Here"**
- Most versatile for marketing
- Works across all demographics
- App Store compliant
- Room for brand evolution

---

## ⚡ Core Features (MVP v1.0)

### Principle: EXTREME SIMPLICITY
*"We do ONE thing. We do it perfectly. Nothing else."*

---

### 1. **Daily Check-In**

**User Flow:**
1. Open app
2. Tap giant "Still Here" button
3. See confirmation message
4. Exit app

**Behavior:**
- Button changes color on tap (green glow)
- Show last check-in timestamp
- Show streak counter (gamification)
- Push notification reminder at chosen time (default: 9 AM)

**What We DON'T Do:**
- ❌ No location tracking
- ❌ No activity monitoring
- ❌ No fall detection
- ❌ No photo sharing
- ❌ No social features

---

### 2. **Emergency Contact Setup**

**Onboarding Flow:**
1. Add 1-3 emergency contacts
2. Enter their email addresses
3. Optionally add phone numbers (for SMS, paid feature later)
4. Write optional personal message

**Contact Form Fields:**
- Name (required)
- Email (required)
- Relationship (dropdown: Family, Friend, Neighbor, Colleague, Other)
- Phone (optional, for future SMS feature)

**What We DON'T Do:**
- ❌ No access to phone contacts (privacy)
- ❌ No social media integration
- ❌ No automatic contact sync

---

### 3. **Automated Alert System**

**Trigger Logic:**
```
IF user hasn't checked in for 48 hours (2 days)
THEN send email to emergency contacts at 9 AM on Day 3
```

**Email Template:**
```
Subject: [Still Here App] Check-in Alert for [User Name]

Hi [Contact Name],

This is an automated message from the Still Here app.

[User Name] has not checked in for 2 consecutive days (last check-in: [Date/Time]).

This may be nothing, but they set you as an emergency contact in case they couldn't check in.

Please reach out to confirm they're okay:
- Email: [if provided]
- Phone: [if provided]
- Address: [if provided]

[Optional personal message from user]

---
Sent by Still Here App
www.stillhereapp.com
[Unsubscribe] [Report False Alarm]
```

**Alert Settings:**
- User can customize missed check-in threshold (1-7 days)
- User can set quiet hours (no reminders)
- User can snooze check-ins (vacation mode)

**What We DON'T Do:**
- ❌ No automatic 911/EMS calls (liability nightmare)
- ❌ No third-party wellness check services
- ❌ No geofencing or GPS alerts

---

### 4. **Settings & Preferences**

**Minimal Settings Menu:**
- **Check-in Reminder:** Time of day (default 9 AM)
- **Alert Threshold:** Days before alert sent (default 2)
- **Vacation Mode:** Pause check-ins temporarily
- **Emergency Contacts:** Edit contact list
- **Personal Message:** Customize alert message
- **Account:** Email, password, delete account

**What We DON'T Do:**
- ❌ No complex customization
- ❌ No themes or UI tweaks
- ❌ No integrations with other apps

---

## 🏗️ Technical Architecture

### Technology Stack

**Frontend:**
- **React Native** (iOS + Android from single codebase)
  - Expo framework for rapid development
  - React Navigation for routing
  - AsyncStorage for local data
  - Push notifications (Expo Notifications)

**Backend:**
- **Firebase** (Google) for speed to market
  - Firestore: User data, contacts, check-in logs
  - Firebase Auth: Email/password authentication
  - Cloud Functions: Email sending logic
  - Cloud Scheduler: Daily check-in monitoring
- **Alternative:** Supabase (if prefer open-source)

**Email Service:**
- **SendGrid** or **Mailgun** (via Firebase Functions)
  - Reliable delivery
  - Email templates
  - Bounce handling

**Payment:**
- **Apple In-App Purchase** (iOS)
- **Google Play Billing** (Android)
- One-time payment unlock

**Analytics:**
- **Minimal tracking:**
  - App opens
  - Check-ins completed
  - Alerts sent
  - NO user behavior tracking
  - NO third-party analytics (privacy)

---

### Data Model

**Users Table:**
```javascript
{
  userId: string (UUID),
  email: string,
  createdAt: timestamp,
  isPaid: boolean,
  lastCheckIn: timestamp,
  streak: number,
  settings: {
    reminderTime: string (HH:MM),
    alertThreshold: number (days),
    vacationMode: boolean,
    personalMessage: string
  }
}
```

**Contacts Table:**
```javascript
{
  contactId: string (UUID),
  userId: string (foreign key),
  name: string,
  email: string,
  phone: string (optional),
  relationship: string,
  createdAt: timestamp
}
```

**CheckIns Table:**
```javascript
{
  checkInId: string (UUID),
  userId: string (foreign key),
  timestamp: timestamp,
  method: string (app, widget, etc.)
}
```

**Alerts Table:**
```javascript
{
  alertId: string (UUID),
  userId: string (foreign key),
  sentAt: timestamp,
  contactsNotified: array<contactId>,
  reason: string (missed_checkin),
  resolved: boolean,
  resolvedAt: timestamp
}
```

---

### Security & Privacy

**Data Protection:**
- End-to-end encryption for personal messages
- GDPR compliant (EU users)
- CCPA compliant (California users)
- No data selling, ever
- No ads, ever

**User Rights:**
- Export all data (JSON)
- Delete account permanently
- Clear check-in history

**Permissions Required:**
- Push notifications (for reminders)
- That's it. NO location, contacts, camera, etc.

---

## 💰 Business Model

### Pricing Strategy

**One-Time Payment:** $7.99 USD
- No subscriptions
- No recurring fees
- Lifetime access
- All future updates included

**Rationale:**
1. Aligns with user interests (no dark patterns)
2. Differentiates from free/freemium competitors
3. Signals privacy-first approach
4. Reduces support burden (no billing issues)
5. Higher perceived value than $0.99/month subscription

**Revenue Projections:**
- Conservative: 10,000 users in Year 1 = $79,900
- Moderate: 50,000 users in Year 1 = $399,500
- Optimistic: 100,000 users in Year 1 = $799,000

**Future Upsells (v2.0+):**
- SMS alerts: $4.99 one-time add-on
- Wellness check service: $9.99 one-time add-on
- Family plan (5 users): $29.99 one-time

---

## 📱 User Experience Design

### Design Principles

1. **Brutally Simple:** One button. One function. No confusion.
2. **Reassuring:** Calm colors, friendly copy, no anxiety-inducing UI
3. **Fast:** App opens in <1 second, check-in happens in <2 seconds
4. **Accessible:** Large touch targets, high contrast, screen reader support

---

### Screen Flow

**1. Onboarding (First Launch)**
```
Screen 1: Welcome
- "Living alone? We've got your back."
- [Continue]

Screen 2: How It Works
- ✓ Check in daily
- ✓ We watch for missed check-ins
- ✓ Alert your emergency contacts if needed
- [Got It]

Screen 3: Add Emergency Contact
- "Who should we notify?"
- Name, Email, Relationship
- [Add Another] [Continue]

Screen 4: Set Reminder
- "When should we remind you?"
- Time picker (default 9 AM)
- [Continue]

Screen 5: Purchase
- "One-time payment. No subscriptions."
- $7.99 - Lifetime Access
- [Buy Now]

Screen 6: All Set!
- "You're protected. Tap 'Still Here' daily."
- [Start Check-In]
```

**2. Main Screen (Daily Use)**
```
┌─────────────────────────────┐
│   [Settings]                │
│                             │
│        STILL HERE           │
│                             │
│     [Large Button]          │
│      "Tap to Check In"      │
│                             │
│  Last check-in: Today 9:15 AM│
│  Streak: 47 days 🔥         │
│                             │
│  Next reminder: Tomorrow 9 AM│
│                             │
└─────────────────────────────┘
```

**3. Settings Screen**
```
┌─────────────────────────────┐
│  ← Settings                 │
│                             │
│  Emergency Contacts         │
│  > Mom (mom@email.com)      │
│  > Best Friend              │
│  [+ Add Contact]            │
│                             │
│  Check-In Reminder          │
│  > Daily at 9:00 AM         │
│                             │
│  Alert Settings             │
│  > Send alert after 2 days  │
│                             │
│  Vacation Mode              │
│  > [Toggle Off]             │
│                             │
│  Account                    │
│  > My Information           │
│  > Privacy Policy           │
│  > Delete Account           │
│                             │
└─────────────────────────────┘
```

---

### Visual Design

**Color Palette:**
- Primary: Calming blue (#4A90E2)
- Accent: Warm green (#7ED321) for check-in button
- Background: Off-white (#F9F9F9)
- Text: Dark gray (#333333)
- Error: Soft red (#E74C3C) - rarely used

**Typography:**
- Headings: SF Pro / Roboto (system fonts)
- Body: System default (accessibility)
- Size: 18pt minimum (readability)

**Iconography:**
- Minimal, friendly icons
- No skull imagery (too dark)
- Heart icon for app logo
- Checkmark for successful check-ins

---

## 🚀 Go-to-Market Strategy

### Phase 1: Stealth Build (Weeks 1-4)
- Build MVP in React Native
- Test with 10 beta users (friends/family)
- Submit to App Store / Google Play

### Phase 2: Soft Launch (Weeks 5-6)
- Launch on Product Hunt
- Post in relevant subreddits (r/solotravel, r/digitalnomad, r/living_alone)
- Reach out to micro-influencers in "living alone" niche

### Phase 3: Viral Push (Weeks 7-8)
- **PR Angle:** "This $8 app does what 'Life Alert' does for $30/month"
- **Controversy Angle:** "Is this app morbid or necessary?"
- Pitch to:
  - BuzzFeed ("This App Will Text Your Mom If You Die")
  - Vice ("The Existential Dread App")
  - TechCrunch (if they bite)
  - Gizmodo, Lifehacker

### Phase 4: Community Growth (Ongoing)
- TikTok: "POV: You live alone and forgot to check in" videos
- Instagram: User testimonials, streak celebrations
- Email newsletter: Safety tips, loneliness discussion

---

### Marketing Messaging

**For Young Professionals:**
> "You moved to the city to chase your dreams. But who checks on you? For $8, someone will."

**For Digital Nomads:**
> "Traveling the world solo? Your mom worries. Give her peace of mind for less than a hostel bed."

**For Neurodivergent Individuals:**
> "Executive dysfunction is real. Forget to text your family back? We've got you."

**For Seniors:**
> "Life Alert costs $30/month. This costs $8 once. It's 2026. Do the math."

---

### Viral Hooks

1. **The Morbid Hook:**
   - "What if you died and no one noticed for weeks?"
   - Tap into existential fear

2. **The Financial Hook:**
   - "$8 vs. $30/month Life Alert subscription"
   - Show savings over time

3. **The Privacy Hook:**
   - "No GPS tracking. No data selling. Just a check-in button."
   - Appeal to privacy-conscious users

4. **The Simplicity Hook:**
   - "One button. That's the entire app."
   - Show side-by-side with competitor bloatware

5. **The Social Proof Hook:**
   - "44 million Americans live alone. How many will die before someone notices?"
   - Use statistics for urgency

---

## 📈 Success Metrics (KPIs)

### Launch Metrics (First 30 Days)
- **Downloads:** 10,000+ (organic + paid)
- **Conversion Rate:** 20% (downloads → purchases)
- **Revenue:** $16,000+ ($7.99 × 2,000 paying users)
- **Retention:** 80% daily check-in rate
- **Alerts Sent:** <10 (hopefully none are real emergencies)

### Long-Term Metrics (Year 1)
- **Total Users:** 50,000-100,000
- **Revenue:** $400K-$800K
- **Daily Active Users:** 70%+
- **Streak Avg:** 60+ days
- **App Store Rating:** 4.5+ stars
- **Churn:** <5% (deleted accounts)

### Qualitative Metrics
- Press mentions (10+ publications)
- User testimonials ("This app saved my life")
- Community engagement (TikTok, Reddit)

---

## ⚠️ Risks & Mitigation

### Risk 1: Liability (Someone Dies)
**Mitigation:**
- Clear disclaimer: "Not a medical alert system"
- Terms of Service: No liability for failures
- Insurance: General liability policy
- User agreement: "Contacts may not respond"

### Risk 2: App Store Rejection
**Mitigation:**
- Follow all Apple/Google guidelines
- No misleading medical claims
- Clear privacy policy
- Avoid controversial branding in screenshots

### Risk 3: Email Deliverability
**Mitigation:**
- Use reputable email service (SendGrid)
- SPF/DKIM authentication
- Test emails across providers
- SMS backup option (future)

### Risk 4: Low Conversion Rate
**Mitigation:**
- Free trial period (7 days) before payment
- Social proof (testimonials, press)
- Lower price to $4.99 if needed

### Risk 5: Competitors Copy
**Mitigation:**
- Move fast (first-mover advantage)
- Build brand loyalty early
- Focus on simplicity (hard to copy culture)

---

## 🛠️ Development Roadmap

### MVP v1.0 (Weeks 1-4)
- [ ] React Native app skeleton
- [ ] Firebase setup (auth, database)
- [ ] Check-in button + local storage
- [ ] Emergency contact management
- [ ] Push notifications
- [ ] Email alert system
- [ ] Payment integration (IAP)
- [ ] Settings screen
- [ ] Onboarding flow
- [ ] Beta testing (10 users)

### v1.1 - Post-Launch Fixes (Week 5-6)
- [ ] Bug fixes from user feedback
- [ ] Performance optimization
- [ ] Analytics integration
- [ ] A/B test onboarding flow

### v2.0 - Premium Features (Month 3-4)
- [ ] SMS alerts (paid add-on)
- [ ] Widget for home screen check-ins
- [ ] Apple Watch app
- [ ] Vacation mode (auto-pause)
- [ ] Custom alert messages
- [ ] Check-in history view

### v3.0 - Community Features (Month 6+)
- [ ] Share your streak on social media
- [ ] "Wellness Wednesday" newsletter
- [ ] Community forum (Reddit-style)
- [ ] Partner with mental health organizations

---

## 👥 Team & Resources

### Minimum Viable Team
- **1 Full-Stack Developer** (React Native + Firebase)
- **1 Designer** (UI/UX for 5 screens)
- **1 Marketer** (PR, social media, community)

### Budget (Bootstrap)
- Development: $10,000 (freelance or sweat equity)
- Design: $2,000 (contract designer)
- Infrastructure: $500/year (Firebase, SendGrid, domain)
- Legal: $2,000 (LLC, ToS, privacy policy)
- Marketing: $5,000 (Product Hunt, influencer outreach)
- **Total:** $19,500

### Timeline
- **Week 1-2:** Design & architecture
- **Week 3-4:** Core development
- **Week 5:** Beta testing
- **Week 6:** App Store submission
- **Week 7-8:** Marketing push
- **Month 3+:** Iterate based on feedback

---

## 🎯 Success Criteria (Kill Points)

### When to Pivot:
- <1,000 downloads in first 30 days
- <10% conversion rate (downloads → purchases)
- <50% daily check-in rate (users don't use it)
- Major legal/liability issue

### When to Double Down:
- 10,000+ downloads in first 30 days
- 20%+ conversion rate
- Press coverage in 3+ major outlets
- User testimonials ("This saved my life")
- App Store featuring

---

## 📄 Legal & Compliance

### Required Documents
1. **Privacy Policy:** GDPR/CCPA compliant
2. **Terms of Service:** Liability disclaimers
3. **End User License Agreement (EULA)**
4. **Cookie Policy** (if web version)

### Disclaimers (App Store Description)
> "Still Here is NOT a medical alert system. It does not monitor your health, detect falls, or contact emergency services. It is a simple check-in tool that notifies your chosen contacts if you miss your daily check-ins. Your emergency contacts may not respond immediately. Do not rely on this app for medical emergencies. Call 911 in emergencies."

---

## 🌍 Localization (Future)

### Phase 1: English Markets
- United States
- United Kingdom
- Canada
- Australia

### Phase 2: European Markets
- Germany ("Noch Hier")
- France ("Toujours Là")
- Spain ("Todavía Aquí")

### Phase 3: Asian Markets
- Japan (huge aging population)
- South Korea (high solo-living rates)
- China (partner with "死了么" team?)

---

## ✅ Next Steps (Action Items)

1. **Approve product name:** "Still Here" (or propose alternative)
2. **Finalize MVP scope:** Confirm features above
3. **Set up development environment:** React Native + Firebase
4. **Design mockups:** 5 core screens
5. **Build MVP:** 4-week sprint
6. **Beta test:** 10 users, 1 week
7. **Submit to app stores:** iOS + Android
8. **Plan launch:** Product Hunt, PR, social media
9. **Monitor & iterate:** User feedback, analytics

---

## 📞 Contact & Resources

- **Project Repo:** [GitHub Link]
- **Design Files:** [Figma Link]
- **Marketing Assets:** [Google Drive Link]
- **Launch Checklist:** [Notion Link]

---

**Document Version:** 1.0
**Last Updated:** 2026-01-10
**Status:** Ready for development

---

Let's build something that matters. Let's make sure people are noticed. Let's launch "Still Here."
