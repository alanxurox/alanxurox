# Personalized Meditation App MVP Plan
## "MindFlow" - AI-Powered Personalized Meditation Generator

---

## Executive Summary

Build a personalized meditation app using **Gemini 2.5 TTS** for voice synthesis and **Gemini 2.5 Flash/Pro** for agentic conversation, deployed on **Lovable** with **Supabase** backend.

**Key Innovation**: Real-time generated, personalized meditations that adapt to user's current emotional state, with scientifically-backed techniques.

---

## Technical Stack Validation

### ✅ Gemini TTS - CONFIRMED EXCELLENT FIT

Based on research, Gemini TTS is **ideal** for meditation apps:

| Feature | Capability | Meditation Relevance |
|---------|-----------|---------------------|
| **Pace Control** | Natural language prompts control speed | "Speak slowly with long pauses" |
| **Tone/Whisper** | Can whisper, adjust emotional tone | Calming, hypnotic delivery |
| **Voice Selection** | 30 HD voices, male/female | User preference |
| **Style Prompting** | Audio Profile + Scene + Director's Notes | "Warm, nurturing meditation guide" |
| **Multi-speaker** | Dialogue generation | Guided imagery with characters |
| **Languages** | 24 languages auto-detect | International accessibility |

**Meditation-Specific**: A [Google AI forum discussion](https://discuss.ai.google.dev/t/how-to-customize-gemini-2-0-flash-voice-for-hypnotic-slow-paced-guided-meditation-with-pauses/54097) specifically addresses "hypnotic, slow-paced guided meditation with pauses" - this is a validated use case.

**Recommended Models**:
- `gemini-2.5-flash-tts-preview` - For real-time/interactive meditations (low latency)
- `gemini-2.5-pro-tts-preview` - For pre-generated premium meditations (highest quality)

### ✅ Gemini Model for AI Agent - CONFIRMED

Use **Gemini 2.5 Flash** for:
- Conversational intake (mood, stress, situation)
- Meditation script generation
- Personalized recommendations
- Progress tracking insights

### ✅ Lovable Platform - CONFIRMED SUITABLE

- Perfect for MVP prototyping
- Supabase integration for user data/auth
- GitHub export for future scaling
- Credit-based pricing (plan for iteration budget)

---

## Evidence-Based Meditation Techniques

### Core Techniques to Include (MVP)

| Technique | Duration | Use Case | Scientific Backing |
|-----------|----------|----------|-------------------|
| **NSDR (Yoga Nidra)** | 10-30 min | Deep rest, energy restoration | Huberman Lab - restores dopamine, reduces cortisol |
| **Body Scan** | 5-15 min | Stress relief, body awareness | Increases parasympathetic activity |
| **Breath Work** | 3-10 min | Acute anxiety, grounding | 4-7-8, box breathing, physiological sigh |
| **Loving-Kindness** | 5-10 min | Emotional regulation, compassion | Strong research for depression/anxiety |
| **CBT-Informed** | 5-15 min | Cognitive reframing, rumination | MBIs perform comparably to CBT |

### Phase 2 Techniques (Post-MVP)

- Progressive Muscle Relaxation (PMR)
- Visualization/Guided Imagery
- Walking meditation prompts
- Sleep stories
- Journaling prompts with audio guidance

---

## MVP Feature Set

### 1. Agentic Intake System

**User Flow:**
```
App → "How are you feeling right now?"
     ↓
User → Voice or text response
     ↓
Gemini analyzes → Extracts: mood, stress level, physical state, time available
     ↓
AI recommends → "Based on your stress and limited time, I recommend
                 a 5-minute breathing exercise..."
```

**Intake Questions (Dynamic)**:
1. "How would you describe your mood right now?" (open-ended)
2. "On a scale of 1-10, how stressed do you feel?"
3. "Are you dealing with anything specific? (work, sleep, anxiety, etc.)"
4. "How much time do you have?" (3/5/10/15/20/30 min)
5. "Do you prefer guided voice or more silence with gentle cues?"

### 2. Personalization Engine

**User Preferences (Stored)**:
- Preferred voice (male/female/specific voice ID)
- Preferred pace (slower/normal/varied)
- Preferred techniques (favorites)
- Time of day patterns
- Trigger conditions (work stress, sleep, etc.)

**Session Personalization**:
- Name insertion in scripts
- Specific situation acknowledgment
- Previous session continuity ("Last time you worked on...")

### 3. Dynamic Meditation Generation

**Gemini Prompt Structure**:
```
SYSTEM: You are a meditation script writer. Generate a {duration}-minute
{technique} meditation for someone who is feeling {mood} and dealing with
{situation}.

Include:
- Warm opening acknowledging their state
- Gradual transition into practice
- Main technique body
- Gentle emergence
- Closing affirmation

Use second person ("you"), present tense. Include [PAUSE 3s], [PAUSE 5s]
markers for silence. Personalize with their name: {name}.
```

**TTS Voice Prompt**:
```
Voice Profile: Warm, calm, nurturing meditation guide
Pace: Slow and deliberate, with natural pauses between sentences
Tone: Gentle, reassuring, unhurried
Style: Speak as if guiding someone into deep relaxation
Breathing: Include natural breath pauses
```

### 4. Voice Customization

**Options for Users**:
- Voice gender: Male / Female / No preference
- Voice style: Warm / Professional / Gentle / Neutral
- Pace: Extra slow / Slow / Normal
- Background: Silence / Nature sounds / Ambient (if Lovable supports audio mixing)

### 5. Session Types (MVP)

| Type | When Recommended | Duration Options |
|------|-----------------|------------------|
| **Quick Calm** | High stress, limited time | 3-5 min |
| **Breath Reset** | Anxiety, overwhelm | 5-10 min |
| **Body Scan** | Physical tension, end of day | 10-15 min |
| **NSDR/Deep Rest** | Exhaustion, poor sleep | 15-30 min |
| **Sleep Prep** | Before bed | 10-20 min |

---

## Data Model (Supabase)

### Tables

```sql
-- Users table (via Supabase Auth)
users (
  id UUID PRIMARY KEY,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP
)

-- User preferences
user_preferences (
  user_id UUID REFERENCES users(id),
  preferred_voice TEXT, -- 'male', 'female', specific voice ID
  preferred_pace TEXT, -- 'slow', 'normal', 'extra_slow'
  preferred_techniques TEXT[], -- array of technique names
  default_duration INTEGER, -- minutes
  updated_at TIMESTAMP
)

-- Sessions
meditation_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  technique TEXT,
  duration_minutes INTEGER,
  mood_before INTEGER, -- 1-10
  mood_after INTEGER, -- 1-10 (optional feedback)
  stress_before INTEGER,
  stress_after INTEGER,
  situation_tags TEXT[],
  script_used TEXT, -- store generated script
  completed BOOLEAN,
  created_at TIMESTAMP
)

-- Saved favorites
saved_meditations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES meditation_sessions(id),
  name TEXT,
  created_at TIMESTAMP
)
```

---

## User Interface (Lovable)

### Screens

1. **Onboarding** (3 screens)
   - Welcome + value prop
   - Voice preference selection
   - First intake

2. **Home Dashboard**
   - Quick action buttons (Quick Calm, Sleep, Custom)
   - Recent sessions
   - Streak/consistency tracker

3. **Intake Flow**
   - Conversational UI (chat-like)
   - Mood slider
   - Time selector
   - Situation multi-select + free text

4. **Meditation Player**
   - Simple, distraction-free
   - Play/pause
   - Progress indicator
   - End early option

5. **Post-Session**
   - "How do you feel now?" (optional)
   - Save to favorites
   - Share (optional)

6. **Profile/Settings**
   - Voice preferences
   - Technique preferences
   - History/insights

---

## API Integration Architecture

### Lovable → Gemini Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Lovable   │────▶│  Supabase    │────▶│  Gemini     │
│   Frontend  │     │  Edge Func   │     │  API        │
└─────────────┘     └──────────────┘     └─────────────┘
      │                    │                    │
      │  User Input        │  Secure API Key    │  Generate Script
      │                    │  Rate Limiting     │  Generate Audio
      ▼                    ▼                    ▼
   Display ◀───────── Return ◀────────── Response
```

### Supabase Edge Functions Needed

1. **`/api/intake`** - Process user mood/stress input
2. **`/api/generate-meditation`** - Create personalized script
3. **`/api/synthesize-audio`** - Call Gemini TTS
4. **`/api/save-session`** - Log completed session

---

## MVP Scope Definition

### ✅ MVP (Week 1-2)

- [ ] User auth (Supabase)
- [ ] Basic intake flow (3-5 questions)
- [ ] 3 meditation types: Quick Calm, Breath Work, Body Scan
- [ ] Gemini script generation
- [ ] Gemini TTS audio generation
- [ ] Simple player UI
- [ ] Session history

### 🔄 Phase 2 (Week 3-4)

- [ ] Voice selection (male/female)
- [ ] NSDR/Yoga Nidra support
- [ ] Post-session mood tracking
- [ ] Insights dashboard
- [ ] Favorites system

### 🚀 Phase 3 (Future)

- [ ] Offline cached sessions
- [ ] Sleep stories
- [ ] Journaling integration
- [ ] Wearable integration (HRV, sleep data)
- [ ] Community features

---

## Gemini API Code Examples

### Script Generation (Gemini 2.5 Flash)

```javascript
// Supabase Edge Function
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY"));

export async function generateMeditationScript(params) {
  const { userName, mood, stressLevel, situation, duration, technique } = params;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert meditation guide trained in ${technique}.

    Create a ${duration}-minute meditation script for ${userName} who is:
    - Current mood: ${mood}
    - Stress level: ${stressLevel}/10
    - Dealing with: ${situation}

    Requirements:
    1. Open by acknowledging their current state with warmth
    2. Guide them through ${technique} technique
    3. Use second person ("you"), present tense
    4. Include timing markers: [PAUSE 3s], [PAUSE 5s], [PAUSE 10s]
    5. End with gentle emergence and positive affirmation
    6. Total speaking time should be ~${duration * 0.7} minutes (rest is pauses)

    Script:
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

### Audio Synthesis (Gemini TTS)

```javascript
// Using Gemini 2.5 Flash TTS
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function synthesizeMeditationAudio(script, voicePrefs) {
  const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY"));

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-tts-preview"
  });

  const voicePrompt = `
    Voice Profile: ${voicePrefs.gender === 'male' ? 'Calm male' : 'Warm female'} meditation guide
    Pace: ${voicePrefs.pace || 'Slow and deliberate'}
    Tone: Gentle, reassuring, peaceful
    Style: Speak as if guiding someone into deep relaxation

    Important:
    - Long pauses between sentences (2-3 seconds)
    - Extra long pauses where marked [PAUSE Xs]
    - Soft, almost whisper-like quality
    - Breathe naturally between phrases
  `;

  const result = await model.generateContent({
    contents: [{
      parts: [
        { text: voicePrompt },
        { text: script }
      ]
    }],
    generationConfig: {
      responseModality: "audio",
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voicePrefs.voiceId || "Zephyr" // calm, soothing voice
          }
        }
      }
    }
  });

  // Return audio data
  return result.response.candidates[0].content.parts[0].inlineData;
}
```

---

## Recommended Gemini Voices for Meditation

Based on Gemini's voice library, recommend testing:

| Voice | Character | Best For |
|-------|-----------|----------|
| **Zephyr** | Calm, ethereal | Body scan, sleep |
| **Puck** | Warm, friendly | Quick calm, beginners |
| **Charon** | Deep, grounded | NSDR, grounding |
| **Kore** | Gentle, nurturing | Loving-kindness |
| **Aoede** | Melodic, soothing | Breath work |

---

## Cost Estimation

### Gemini API

| API | Pricing | Est. Monthly (1000 users) |
|-----|---------|---------------------------|
| Gemini 2.5 Flash | $0.075/1M input, $0.30/1M output | ~$10-20 |
| Gemini 2.5 Flash TTS | ~$0.01-0.02/min audio | ~$100-200 |

### Lovable

- Free tier: 100 generations
- Pro: $20/month
- For MVP dev: ~$40-60

### Supabase

- Free tier: 500MB, 50K monthly active users
- Pro: $25/month

**Total MVP Cost**: ~$50-100/month during development

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| TTS quality not calming enough | Test extensively, use voice prompts, fallback to pre-recorded |
| API latency too high | Pre-generate popular sessions, cache scripts |
| Lovable limitations | Export to GitHub, continue in React/Next.js |
| User doesn't engage | Push notifications, streaks, gentle reminders |

---

## Success Metrics (MVP)

1. **Completion Rate**: >70% of started sessions completed
2. **Return Rate**: >40% use app again within 7 days
3. **Mood Improvement**: Average +1.5 point mood improvement post-session
4. **Generation Quality**: <5% sessions rated "poor"

---

## Next Steps

1. **Validate TTS Quality**: Create test meditation with Gemini TTS
2. **Setup Lovable Project**: Initialize with Supabase auth
3. **Build Intake Flow**: Conversational UI first
4. **Implement Core Generation**: Script + Audio pipeline
5. **Test with 5-10 Users**: Iterate on quality

---

## Sources & Research

- [Gemini TTS Documentation](https://ai.google.dev/gemini-api/docs/speech-generation)
- [Gemini 2.5 TTS Updates](https://blog.google/technology/developers/gemini-2-5-text-to-speech/)
- [Meditation Voice Customization Discussion](https://discuss.ai.google.dev/t/how-to-customize-gemini-2-0-flash-voice-for-hypnotic-slow-paced-guided-meditation-with-pauses/54097)
- [NSDR - Huberman Lab](https://www.hubermanlab.com/nsdr)
- [Body Scan Research](https://pubmed.ncbi.nlm.nih.gov/35538557/)
- [Mindfulness Interventions Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC8083197/)
- [Lovable Platform](https://lovable.dev)
