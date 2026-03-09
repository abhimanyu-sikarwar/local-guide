# BhashaSethu (भाषा सेतु) — Product Requirements Document

**Version:** 1.0
**Date:** 2026-03-09
**Author:** Product & Engineering Lead
**Tagline:** Speak Hindi. Be understood in Bangalore.

---

## 1. Overview & Problem Statement

### The Problem

Every year, millions of Hindi-speaking visitors from North India (primarily Delhi, UP, Rajasthan) travel to Bengaluru for work, tourism, or transit. Bengaluru's working population — auto drivers, street vendors, shopkeepers, hotel staff — predominantly speaks Kannada and Tamil, with limited Hindi proficiency.

The language barrier creates real friction:
- Negotiating auto fares becomes a game of gestures and calculators
- Ordering food is guesswork
- Emergencies are terrifying when you cannot communicate
- Visitors feel isolated, overcharged, or lost

Existing solutions fail this use case:
- **Google Translate** requires typing, doesn't work well for conversational Kannada, and has no offline mode for phrases
- **Human translators / tour guides** are expensive and unavailable on-demand
- **Learning Kannada** is a multi-month investment for a 3-day trip

### The Solution

BhashaSethu is a mobile-first Progressive Web App (PWA) that acts as a real-time voice interpreter. A Delhi visitor holds a button, speaks Hindi, and within seconds hears the Kannada translation spoken aloud — ready to play to the person they're talking to. The reverse flow is equally seamless: a Kannada speaker can respond, and the app translates back to Hindi.

The app is powered by Sarvam AI's Indian-language-native APIs (saaras:v3 for STT, mayura:v1 for translation, bulbul:v3 for TTS) — purpose-built for Indic languages, far outperforming generic multilingual models on colloquial Indian speech.

---

## 2. Target Users

### Primary User: The Delhi Visitor

**Profile:**
- Age: 22–55
- Occupation: Business traveller, tourist, student, government employee on transfer
- Tech comfort: Comfortable with WhatsApp, Swiggy, Google Maps — not a power user
- Device: Android mid-range phone (Redmi, Realme, Samsung M-series); occasionally iPhone
- Connectivity: Variable — 4G in city, patchy in outskirts, hotel WiFi

**Jobs to be done:**
- Negotiate auto/cab fares without being overcharged
- Order food at a local Udupi restaurant
- Ask for directions from a local
- Handle emergencies (medical, theft, lost) with strangers who don't speak Hindi
- Shop at local markets and bargain

**Frustrations with current solutions:**
- Typing is slow when facing a person
- Google Translate's Kannada voice sounds robotic and is often wrong for colloquial speech
- No app is designed specifically for the Hindi ↔ Kannada corridor

### Secondary User: Kannada Locals (Reverse Flow)

Auto drivers, shopkeepers, and hotel staff who interact with Hindi-speaking visitors daily. They benefit from the reverse flow — tapping the language switch and speaking Kannada to get a Hindi translation the visitor can understand.

---

## 3. Core User Journeys

### Journey 1: Negotiating an Auto Fare (Primary Flow)

1. User opens BhashaSethu on their phone
2. App is on Translate screen with Hindi → Kannada direction set
3. User holds the microphone button and says: "Koramangala 6th Block jaana hai, kitna loge?"
4. User releases the button
5. App transcribes Hindi speech → "Koramangala 6th Block jaana hai, kitna loge?"
6. Transcript displayed on screen
7. App translates → "ಕೋರಮಂಗಲ 6ನೇ ಬ್ಲಾಕ್ ಹೋಗಬೇಕು, ಎಷ್ಟು ತಗೋತೀರಾ?"
8. Kannada translation plays aloud via speaker
9. Auto driver hears the Kannada and quotes a fare in Kannada
10. User taps language switch (now Kannada → Hindi)
11. Auto driver holds button, speaks Kannada
12. App translates and plays Hindi response aloud

**Total time for step 3–8:** Target < 5 seconds on 4G.

### Journey 2: Ordering Food at a Local Restaurant

1. User opens Phrasebook tab
2. Taps "Food" category
3. Sees phrase: "Yeh spicy hai?" / "ಇದು ಖಾರವಾ?"
4. Taps the speaker icon on the phrase card
5. Kannada audio plays immediately (pre-cached)
6. Server responds; user taps the reverse-flow phrase if needed

**Total time for step 4–5:** Target < 1 second (cached audio).

### Journey 3: Emergency Situation

1. User is lost, panicking
2. Opens Quick Cards panel (always accessible via bottom sheet)
3. Sees Emergency shortcut or taps Phrasebook → Emergency tab (red-styled, always last)
4. Taps "Mujhe kho gaya hun" → "ನಾನು ದಾರಿ ತಪ್ಪಿದ್ದೇನೆ" (I am lost)
5. Audio plays immediately
6. User can also tap "Police bulao" → "ಪೊಲೀಸ್ ಕರೆಯಿರಿ" instantly

**Key:** Emergency phrases must work fully offline with cached audio.

---

## 4. Feature List with Priority

### P0 — Must Have at Launch

| ID | Feature | Description |
|----|---------|-------------|
| F-01 | Live Voice Translator | Hold-to-speak → STT → Translate → TTS pipeline |
| F-02 | Hindi → Kannada direction | Primary language pair |
| F-03 | Kannada → Hindi direction | Reverse flow |
| F-04 | Language toggle | One-tap switch between directions |
| F-05 | Phrasebook — Cab/Auto | 9+ pre-translated phrases for transport |
| F-06 | Phrasebook — Emergency | 5+ emergency phrases, offline-capable |
| F-07 | Phrase audio playback | One-tap TTS for any phrasebook phrase |
| F-08 | Quick Cards | 6 most-used phrases always accessible |
| F-09 | Mobile-responsive UI | Works on 375px+ viewport, one-handed use |

### P1 — High Value, Ship in First 4 Sprints

| ID | Feature | Description |
|----|---------|-------------|
| F-10 | Phrasebook — Shopping | 6+ phrases for market/retail scenarios |
| F-11 | Phrasebook — Food | 6+ phrases for restaurant/food stalls |
| F-12 | Phrasebook — Hotel | 5+ phrases for accommodation |
| F-13 | Translation History | Last 10 translations, replayable |
| F-14 | PWA — Installable | Add to home screen on Android Chrome |
| F-15 | Offline Phrasebook | Cached audio for all phrases |
| F-16 | Text Mode | Type Hindi/Kannada, get translation + audio |
| F-17 | Settings Screen | Gender, language prefs, text size |

### P2 — Nice to Have, Future Sprints

| ID | Feature | Description |
|----|---------|-------------|
| F-18 | Romanized text | Show pronunciation guide for non-script readers |
| F-19 | Custom Quick Cards | User picks their own 6 favourites |
| F-20 | Streaming STT | WebSocket-based real-time transcription |
| F-21 | Share phrase | WhatsApp/copy button on any translation |
| F-22 | More language pairs | Tamil ↔ Hindi, Telugu ↔ Hindi |
| F-23 | Favourites | Star phrases across categories |

---

## 5. Sarvam AI Integration Architecture

### Pipeline Overview

```
[User speaks]
    → MediaRecorder (Web Audio API) captures 16kHz WAV
    → POST /api/transcribe (Next.js route)
        → Sarvam saaras:v3 STT
        → Returns { transcript: string, language: "hi-IN" }
    → POST /api/translate (Next.js route)
        → Sarvam mayura:v1
        → source: "hi-IN", target: "kn-IN", mode: "modern-colloquial"
        → Returns { translatedText: string }
    → POST /api/speak (Next.js route)
        → Sarvam bulbul:v3 TTS
        → speaker: "pavithra" (Kannada female) or "arjun" (male)
        → Returns { audio: base64, sampleRate: 22050 }
    → Web Audio API decodes and plays audio
[Kannada plays through speaker]
```

### API Routes

#### POST /api/transcribe
- **Input:** `multipart/form-data` — `audio` (blob, WAV 16kHz) + `language` (hi-IN | kn-IN)
- **Sarvam call:** `client.speechToText.transcribe({ file, model: "saaras:v3", mode: "transcribe" })`
- **Output:** `{ transcript: string, language: string }`
- **Errors:** 400 (missing audio), 500 (Sarvam API failure), 408 (timeout > 10s)

#### POST /api/translate
- **Input:** `{ text: string, from: "hi-IN"|"kn-IN", to: "hi-IN"|"kn-IN", mode?: string }`
- **Sarvam call:** `client.text.translate({ input, source_language_code, target_language_code, mode: "modern-colloquial" })`
- **Output:** `{ translatedText: string }`
- **Notes:** Default mode is "modern-colloquial" for natural street-level speech

#### POST /api/speak
- **Input:** `{ text: string, language: "hi-IN"|"kn-IN", gender?: "Male"|"Female" }`
- **Speaker selection:**
  - Kannada Female → "pavithra"
  - Kannada Male → "arjun"
  - Hindi Female → "vidya"
  - Hindi Male → "shubh"
- **Sarvam call:** `client.textToSpeech.convert({ text, target_language_code, speaker, model: "bulbul:v3", pace: 1.0, speech_sample_rate: 22050 })`
- **Output:** `{ audio: string (base64), sampleRate: 22050 }`

### Client Initialization

```typescript
// /src/lib/sarvam.ts
import SarvamAI from 'sarvamai';

export const sarvamClient = new SarvamAI({
  apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});
```

### Latency Budget (Target: < 5s end-to-end on 4G)

| Step | Target Latency |
|------|---------------|
| Audio capture + encode | ~200ms |
| STT (saaras:v3) | ~800ms |
| Translation (mayura:v1) | ~400ms |
| TTS (bulbul:v3) | ~1200ms |
| Audio decode + play start | ~100ms |
| **Total** | **~2.7s** |

---

## 6. Phrasebook Content

### Cab / Auto (9 phrases)

| Hindi | Kannada | English Meaning |
|-------|---------|-----------------|
| Kitna lagega? | ಎಷ್ಟಾಗುತ್ತೆ? | How much will it cost? |
| Meter se chaloge? | ಮೀಟರ್ ಪ್ರಕಾರ ಹೋಗ್ತೀರಾ? | Will you go by meter? |
| Seedha jao | ನೇರ ಹೋಗಿ | Go straight |
| Yahaan rokna | ಇಲ್ಲಿ ನಿಲ್ಲಿ | Stop here |
| Left / Right lo | ಎಡಕ್ಕೆ / ಬಲಕ್ಕೆ | Turn left / right |
| Traffic mein hun | ಟ್ರಾಫಿಕ್ ಇದ್ದೀನಿ | I'm stuck in traffic |
| AC chalao | AC ಹಾಕಿ | Turn on the AC |
| UPI lete ho? | UPI ತಗೋತೀರಾ? | Do you accept UPI? |
| Receipt dena | ರಸೀದಿ ಕೊಡಿ | Please give me a receipt |

### Shopping (8 phrases)

| Hindi | Kannada | English Meaning |
|-------|---------|-----------------|
| Kitna hai? | ಎಷ್ಟು? | How much is this? |
| Thoda sasta karo | ಸ್ವಲ್ಪ ಕಮ್ಮಿ ಮಾಡಿ | Please give a discount |
| Yeh size hai? | ಈ ಸೈಜ್ ಇದೆಯಾ? | Is this size available? |
| Bag doge? | ಚೀಲ ಕೊಡ್ತೀರಾ? | Will you give a carry bag? |
| Return policy kya hai? | ರಿಟರ್ನ್ ಪಾಲಿಸಿ ಏನು? | What is the return policy? |
| Card lete ho? | ಕಾರ್ಡ್ ತಗೋತೀರಾ? | Do you accept card? |
| Ek aur dikhao | ಇನ್ನೊಂದು ತೋರಿ | Show me another one |
| Yeh nahin chahiye | ಇದು ಬೇಡ | I don't want this |

### Food (8 phrases)

| Hindi | Kannada | English Meaning |
|-------|---------|-----------------|
| Yeh spicy hai? | ಇದು ಖಾರವಾ? | Is this spicy? |
| Vegetarian hai? | ಶಾಖಾಹಾರಿ ಇದೆಯಾ? | Is it vegetarian? |
| Paani dena | ನೀರು ಕೊಡಿ | Please give water |
| Bill please | ಬಿಲ್ ಕೊಡಿ | Give me the bill |
| Thoda aur chahiye | ಇನ್ನು ಸ್ವಲ್ಪ ಕೊಡಿ | Give me a little more |
| Takeaway ho sakta hai? | ಪ್ಯಾಕ್ ಮಾಡ್ತೀರಾ? | Can you pack this? |
| Bahut achha tha | ತುಂಬಾ ಚೆನ್ನಾಗಿತ್ತು | It was very good |
| Menu dikhao | ಮೆನು ತೋರಿ | Show me the menu |

### Hotel / Accommodation (7 phrases)

| Hindi | Kannada | English Meaning |
|-------|---------|-----------------|
| Check-in kab hai? | ಚೆಕ್-ಇನ್ ಯಾವಾಗ? | When is check-in? |
| Room ready hai? | ರೂಮ್ ರೆಡಿ ಇದೆಯಾ? | Is the room ready? |
| WiFi password kya hai? | WiFi ಪಾಸ್ವರ್ಡ್ ಏನು? | What is the WiFi password? |
| Extra towel chahiye | ಹೆಚ್ಚುವರಿ ಟವೆಲ್ ಬೇಕು | I need an extra towel |
| AC kaam nahi kar raha | AC ಕೆಲಸ ಮಾಡ್ತಿಲ್ಲ | The AC is not working |
| Late checkout ho sakta hai? | ತಡ ಚೆಕ್-ಔಟ್ ಆಗ್ತಾ? | Can I have a late checkout? |
| Khana room mein milega? | ರೂಮ್ ಸರ್ವಿಸ್ ಇದೆಯಾ? | Is room service available? |

### Emergency (8 phrases)

| Hindi | Kannada | English Meaning |
|-------|---------|-----------------|
| Mujhe doctor chahiye | ನನಗೆ ಡಾಕ್ಟರ್ ಬೇಕು | I need a doctor |
| Police bulao | ಪೊಲೀಸ್ ಕರೆಯಿರಿ | Call the police |
| Mera purse chori hua | ನನ್ನ ಪರ್ಸ್ ಕಳ್ಳತನ ಆಯ್ತು | My purse/wallet was stolen |
| Mujhe kho gaya hun | ನಾನು ದಾರಿ ತಪ್ಪಿದ್ದೇನೆ | I am lost |
| Ambulance bulao | ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ | Call an ambulance |
| Mujhe madad chahiye | ನನಗೆ ಸಹಾಯ ಬೇಕು | I need help |
| Aspatal kahan hai? | ಆಸ್ಪತ್ರೆ ಎಲ್ಲಿದೆ? | Where is the hospital? |
| Mera phone kho gaya | ನನ್ನ ಫೋನ್ ಕಳೆದಿದೆ | My phone is lost |

---

## 7. Screen-by-Screen Description

### Screen 1: Translate (Home)

**Route:** `/`

**Layout:**
```
┌─────────────────────────────┐
│  BhashaSethu                │  ← Header / app name
├─────────────────────────────┤
│  [Hindi 🇮🇳]  ⇄  [Kannada]  │  ← Language toggle bar
├─────────────────────────────┤
│                             │
│   ┌──────────────────────┐  │
│   │  Transcript          │  │  ← Source text bubble (empty initially)
│   │  (Hindi text here)   │  │
│   └──────────────────────┘  │
│                             │
│   ┌──────────────────────┐  │
│   │  Translation         │  │  ← Target text bubble
│   │  (Kannada text here) │  │
│   └──────────────────────┘  │
│                             │
│         ●●●●●●●●            │  ← Audio waveform (while recording)
│                             │
│      ┌──────────┐           │
│      │   🎙️    │           │  ← Hold-to-speak button (large, centered)
│      │  HOLD   │           │     Min 72px touch target
│      └──────────┘           │
│                             │
│  Status: Ready to translate │  ← Status line
├─────────────────────────────┤
│  🎙️ Translate │ 📖 Phrases │ 🕐 History │ ⚙️ Settings │  ← Bottom nav
└─────────────────────────────┘
```

**States:**
- Idle: Button shows "Hold to speak", prompt text visible
- Recording: Waveform animates, button turns red with pulse
- Transcribing: Skeleton loader in transcript bubble
- Translating: Transcript shown, skeleton in translation bubble
- Speaking: Translation shown, animated speaker icon
- Error: Toast notification with retry button

### Screen 2: Phrasebook

**Route:** `/phrasebook`

**Layout:**
```
┌─────────────────────────────┐
│  Phrasebook                 │
├─────────────────────────────┤
│ 🚕 Cab │ 🛍️ Shop │ 🍽️ Food │ 🏨 Hotel │ 🆘 SOS │  ← Category tabs
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │ Kitna lagega?         │  │  ← Hindi (large, primary)
│  │ ಎಷ್ಟಾಗುತ್ತೆ?         │  │  ← Kannada (below)
│  │ "How much?"      [▶️] │  │  ← English hint + speaker button
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Meter se chaloge?     │  │
│  │ ಮೀಟರ್ ಪ್ರಕಾರ ಹೋಗ್ತೀರಾ? │  │
│  │ "Go by meter?"   [▶️] │  │
│  └───────────────────────┘  │
│  ... (scrollable)           │
├─────────────────────────────┤
│  🎙️  │  📖  │  🕐  │  ⚙️   │
└─────────────────────────────┘
```

**Interactions:**
- Tap phrase card → plays TTS audio (cached after first load)
- Long press → copy Kannada text to clipboard
- Emergency tab: red background cards, SOS icon prominent

### Screen 3: Quick Cards (Bottom Sheet)

**Accessible from:** Translate screen via upward swipe or dedicated button

**Layout:**
```
┌─────────────────────────────┐
│  ≡  Quick Cards             │  ← Drag handle
├─────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  │
│  │Kitna    │  │Yahaan   │  │
│  │lagega?  │  │rokna    │  │
│  │ ಎಷ್ಟು  │  │ ಇಲ್ಲಿ   │  │
│  └─────────┘  └─────────┘  │
│  ┌─────────┐  ┌─────────┐  │
│  │Seedha   │  │UPI      │  │
│  │jao      │  │lete ho? │  │
│  │ ನೇರ ಹೋಗಿ│  │ UPI    │  │
│  └─────────┘  └─────────┘  │
│  ┌─────────┐  ┌─────────┐  │
│  │Theek hai│  │Dhanya-  │  │
│  │         │  │vaad     │  │
│  │  ಸರಿ   │  │ ಧನ್ಯವಾದ │  │
│  └─────────┘  └─────────┘  │
└─────────────────────────────┘
```

### Screen 4: History

**Route:** `/history`

**Layout:**
```
┌─────────────────────────────┐
│  Translation History   [🗑️] │
├─────────────────────────────┤
│  Today                      │
│  ┌───────────────────────┐  │
│  │ 3:42 PM               │  │
│  │ Kitna lagega?         │  │
│  │ → ಎಷ್ಟಾಗುತ್ತೆ?       │  │
│  │                  [▶️] │  │
│  └───────────────────────┘  │
│  (swipe left to delete)     │
│  ... more entries ...       │
├─────────────────────────────┤
│  🎙️  │  📖  │  🕐  │  ⚙️   │
└─────────────────────────────┘
```

### Screen 5: Settings

**Route:** `/settings`

**Options:**
- Speaker Gender: Male / Female (affects TTS voice)
- Default Source Language: Hindi / Kannada
- Auto-play Translation: Toggle
- Text Size: Small / Medium / Large
- About: Version, Sarvam AI attribution, GitHub link

---

## 8. Tech Stack Decisions

### Why Next.js 14 App Router?

- Server-side API routes to keep `SARVAM_API_KEY` secure (never exposed to client)
- App Router enables streaming responses for future streaming TTS
- SSG for phrasebook page (fast initial load)
- Easy PWA setup with next-pwa

### Why shadcn/ui?

- Unstyled primitives — easier to customize for large touch targets required on mobile
- Accessible by default (ARIA labels, keyboard nav)
- Tailwind-native — no CSS-in-JS overhead

### Why Zustand?

- Lightweight (< 1KB) vs Redux Toolkit overhead
- Simple API for audio state, language direction, history
- Built-in localStorage persistence via `zustand/middleware`

### Why Web Audio API + MediaRecorder?

- MediaRecorder: cross-browser audio capture without external deps
- Web Audio API: low-latency decode and playback of base64 audio
- Avoids large audio libraries (howler.js etc.)

### Why sarvamai npm package?

- Official Sarvam SDK — handles auth, retries, and type safety
- Keeps API calls clean vs raw fetch calls
- Future streaming STT support via WebSocket client

---

## 9. Sprint Plan

### Sprint 1: Foundation + STT (Weeks 1–2)

**Goal:** Working project skeleton + voice recording + STT → text on screen

| Task | Description | Estimate |
|------|-------------|----------|
| S1-1 | Project setup — Next.js + shadcn/ui + sarvamai SDK | 4h |
| S1-2 | Microphone permission + audio recording hook | 6h |
| S1-3 | Sarvam STT integration — speech to text | 8h |
| S1-4 | Translation API route — Hindi ↔ Kannada | 4h |
| S1-5 | TTS API route — text to speech | 6h |

**Sprint 1 Definition of Done:** User can speak Hindi into the browser and see a Kannada transcript on screen.

### Sprint 2: Translation + TTS Pipeline (Weeks 3–4)

**Goal:** Full end-to-end pipeline working; main translator screen complete

| Task | Description | Estimate |
|------|-------------|----------|
| S2-1 | Full pipeline hook — speak → transcribe → translate → play | 10h |
| S2-2 | Main translator screen UI | 8h |
| S2-3 | Audio playback hook | 4h |
| S2-4 | Language direction store + toggle | 4h |

**Sprint 2 Definition of Done:** User speaks Hindi, app plays Kannada audio. Full pipeline working end-to-end.

### Sprint 3: Phrasebook + Quick Cards (Weeks 5–6)

**Goal:** Phrasebook with all categories, quick cards, history

| Task | Description | Estimate |
|------|-------------|----------|
| S3-1 | Phrasebook data — all categories | 4h |
| S3-2 | Phrasebook screen UI | 8h |
| S3-3 | Quick Cards widget | 6h |
| S3-4 | Translation history screen | 4h |

**Sprint 3 Definition of Done:** Phrasebook browsable and playable; quick cards functional; history shown.

### Sprint 4: Polish + PWA (Weeks 7–8)

**Goal:** PWA installable, offline phrases working, production-ready

| Task | Description | Estimate |
|------|-------------|----------|
| S4-1 | App navigation — bottom nav bar | 4h |
| S4-2 | Settings screen | 4h |
| S4-3 | PWA setup + offline phrases | 8h |
| S4-4 | Loading states, error handling, toast notifications | 6h |
| S4-5 | Performance optimization + mobile testing | 6h |

**Sprint 4 Definition of Done:** App installable on Android Chrome, phrasebook works offline, Lighthouse PWA score >= 80.

---

## 10. Non-Functional Requirements

### Performance
- Full STT → Translate → TTS pipeline: **< 5 seconds** on 4G (target 2.7s)
- Phrasebook phrase audio playback: **< 1 second** (cached)
- App first contentful paint: **< 2 seconds** on 4G
- Time to interactive: **< 3 seconds**

### Offline Capability
- Phrasebook content (text): always available (static data, bundled)
- Phrasebook audio: cached on first app load via service worker
- Live Translator: degrades gracefully — shows clear "No internet" message
- Emergency phrases: must work fully offline, prioritized for cache

### Mobile-First Design
- Minimum viewport: 375px (iPhone SE)
- All touch targets: minimum 48px × 48px (Google Material guidelines)
- One-handed operation: critical controls in thumb zone (bottom 40% of screen)
- No horizontal scroll on any screen
- Tested on: Android Chrome (primary), Safari iOS, Samsung Internet

### Accessibility
- WCAG 2.1 AA compliance
- All buttons have ARIA labels
- Text contrast ratio >= 4.5:1
- Screen reader compatible (VoiceOver / TalkBack)
- Font sizes: minimum 16px body, 20px+ for primary language display

### Security
- `SARVAM_API_KEY` never exposed to client — all Sarvam API calls go through Next.js API routes
- No user data stored server-side — all history in localStorage
- No account/login required — fully anonymous use

### Reliability
- API timeout: 10 seconds per request, with retry up to 2 times
- Graceful degradation: if STT fails, show text input fallback
- Error messages in Hindi (primary user's language)

### Internationalisation
- UI language: English (accessible to both Hindi and Kannada speakers)
- Display text in both Devanagari (Hindi) and Kannada script
- Romanized fallback for users unfamiliar with scripts

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Pipeline success rate | > 95% on 4G |
| Full pipeline latency (p50) | < 3 seconds |
| Full pipeline latency (p95) | < 6 seconds |
| Phrasebook audio cache hit rate | > 90% after first load |
| PWA install rate (of sessions > 2 min) | > 20% |
| Session length | > 3 minutes (indicates real usage) |
| Phrases played per session | > 3 |

---

## 12. Open Questions

1. **Streaming TTS:** Sarvam supports streaming TTS via `/text-to-speech/stream` — should we implement this for lower perceived latency? Tradeoff: complexity vs UX gain.
2. **Streaming STT:** WebSocket-based live transcription (saaras:v3 streaming) would allow real-time feedback while speaking. Scope for Sprint 3 or future?
3. **Speaker gender toggle:** Should gender preference be per-language (e.g., female Kannada voice, male Hindi voice) or a single global setting?
4. **Analytics:** What telemetry to collect? Phrase usage counts and pipeline latency are valuable for optimization but require privacy consideration.
5. **Domain/hosting:** Vercel (natural for Next.js) or self-hosted? PWA install requires HTTPS.
