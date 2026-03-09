# BhashaSethu — Full Project Reference

> **Live Hindi↔Kannada (+ 9 more Indian languages) translator PWA for Delhi visitors in Bangalore**
> Built with Next.js 14, Sarvam AI APIs, Tailwind CSS, Zustand

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Sarvam AI Integration](#4-sarvam-ai-integration)
5. [Directory Structure](#5-directory-structure)
6. [Data Models](#6-data-models)
7. [API Routes](#7-api-routes)
8. [Store Design (Zustand)](#8-store-design-zustand)
9. [Component Library](#9-component-library)
10. [Pages](#10-pages)
11. [Theming & Dark Mode](#11-theming--dark-mode)
12. [Server-Side Caching](#12-server-side-caching)
13. [Settings Persistence](#13-settings-persistence)
14. [Phrasebook Data](#14-phrasebook-data)
15. [PWA Setup](#15-pwa-setup)
16. [Known Bugs & Fixes](#16-known-bugs--fixes)
17. [Recreate Prompt](#17-recreate-prompt)

---

## 1. Project Overview

**BhashaSethu** ("Language Bridge" in Kannada) is a mobile-first Progressive Web App for travellers who speak Hindi visiting Bangalore. It provides:

- **Live voice translation**: speak → transcribe → translate → play back in target language
- **Phrasebook**: 60 pre-built phrases across 10 categories, with 11-language translations built in
- **Settings**: language pair picker, voice selector, theme toggle, user profile
- **Offline-ready**: PWA manifest + server-side audio/translation caching

Target use case: A Hindi-speaking tourist from Delhi can open the app, hold the mic, speak naturally in Hindi, and hear the phrase in Kannada for a local to understand — or browse the phrasebook for common situations (cab, shopping, food, hotel, emergency, domestic help, trades).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 (CSS-first config) |
| UI Components | shadcn/ui (only where needed) |
| State Management | Zustand with `persist` middleware |
| AI APIs | Sarvam AI (STT, Translation, TTS) |
| AI SDK | `sarvamai` npm package |
| Font | Poppins (via `next/font/google`) |
| Storage | Node.js `fs/promises` (server-side JSON + base64 .txt) |
| PWA | `public/manifest.json` + meta tags in `layout.tsx` |

---

## 3. Architecture

```
Browser (PWA)
  ├── Zustand Stores (client-side, localStorage persisted)
  │     ├── translatorStore  (languages, speaker, history)
  │     └── appStore         (theme, profile)
  │
  ├── ThemeProvider          (applies dark class to <html>)
  ├── SettingsSync           (syncs stores ↔ server settings.json)
  │
  └── Pages
        ├── /                 (Home — hero, feature cards, quick actions)
        ├── /translate        (Voice recorder + transcript + translation)
        ├── /phrasebook       (Category grid → phrase cards with TTS)
        └── /settings         (Language, voice, theme, profile)

Next.js API Routes
  ├── /api/transcribe        (POST: audio → Sarvam STT → text)
  ├── /api/translate         (POST: text → Sarvam translate → text)
  ├── /api/speak             (GET: cache check; POST: TTS with caching)
  ├── /api/phrase-translate  (POST: phrase translation with caching)
  └── /api/settings          (GET/POST: read/write data/settings.json)

Server Filesystem (data/)
  ├── settings.json          (user settings)
  ├── translations.json      (phrase translation cache)
  └── audio/                 (TTS audio cache, base64 .txt files)
```

---

## 4. Sarvam AI Integration

### API Key
Set in `.env.local`:
```
SARVAM_API_KEY=sk_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Models Used
| Task | Model | Endpoint |
|---|---|---|
| Speech-to-Text | `saaras:v3` | `sarvam.speechToText.transcribe()` |
| Translation | `mayura:v1` | `sarvam.translate.convert()` |
| Text-to-Speech | `bulbul:v3` | `sarvam.textToSpeech.convert()` |

### SDK Init (`src/lib/sarvam.ts`)
```typescript
import SarvamAI from "sarvamai";
export const sarvam = new SarvamAI({ apiSubscriptionKey: process.env.SARVAM_API_KEY! });
```

### CRITICAL: MIME Type Fix
The browser's `MediaRecorder` reports `audio/webm;codecs=opus` but Sarvam only accepts `audio/webm`. Strip codec params:
```typescript
const cleanMime = mimeType.split(";")[0]; // "audio/webm"
```
Apply this in **both** `useAudioRecorder.ts` (before sending) and `api/transcribe/route.ts` (before calling Sarvam).

### CRITICAL: Valid TTS Speakers (bulbul:v3)
Only these speakers work. Others return a 400 Validation Error.
```
Female: anushka, manisha, vidya, arushi, sonu, aashi, priya (default), tara, abhilasha, aditi, aarti
Male:   abhilash, karun, hitesh, arjun, amol, amartya, deva, meera (sic), vian, kiran
(+ 20+ more — see TTS_VOICES array in src/lib/sarvam.ts)
```
**Default speaker:** `priya` (female, works with all Indian languages)

### Supported Languages (11)
```typescript
export const SUPPORTED_LANGUAGES = [
  { code: "hi-IN", name: "Hindi",      flag: "🇮🇳", native: "हिन्दी"     },
  { code: "kn-IN", name: "Kannada",    flag: "🏔️",  native: "ಕನ್ನಡ"     },
  { code: "ta-IN", name: "Tamil",      flag: "🌺",  native: "தமிழ்"      },
  { code: "te-IN", name: "Telugu",     flag: "🎭",  native: "తెలుగు"     },
  { code: "ml-IN", name: "Malayalam",  flag: "🌴",  native: "മലയാളം"    },
  { code: "mr-IN", name: "Marathi",    flag: "🦁",  native: "मराठी"      },
  { code: "gu-IN", name: "Gujarati",   flag: "🎪",  native: "ગુજરાતી"   },
  { code: "pa-IN", name: "Punjabi",    flag: "🌾",  native: "ਪੰਜਾਬੀ"    },
  { code: "bn-IN", name: "Bengali",    flag: "🐟",  native: "বাংলা"      },
  { code: "od-IN", name: "Odia",       flag: "🏛️",  native: "ଓଡ଼ିଆ"     },
  { code: "en-IN", name: "English",    flag: "🇬🇧",  native: "English"   },
] as const;
```

### Audio Recording Pipeline
```
getUserMedia({ audio: true })
  → MediaRecorder (audio/webm or audio/mp4 on iOS)
  → chunks[] of Blob
  → new Blob(chunks, { type: cleanMime })
  → FormData { audio: blob, language: "hi-IN" }
  → POST /api/transcribe
  → Sarvam STT → transcript text
```

For animated waveform, use `AnalyserNode` + `requestAnimationFrame`:
```typescript
const analyser = audioCtx.createAnalyser();
source.connect(analyser);
// in RAF loop: analyser.getByteTimeDomainData(dataArray)
```

---

## 5. Directory Structure

```
local-guide/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons (192x192, 512x512)
├── data/                      # Server-side storage (gitignored)
│   ├── settings.json
│   ├── translations.json
│   └── audio/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (Poppins font, ThemeProvider, BottomNav)
│   │   ├── globals.css         # Tailwind imports, CSS vars
│   │   ├── page.tsx            # Home screen
│   │   ├── translate/
│   │   │   └── page.tsx        # Voice translator
│   │   ├── phrasebook/
│   │   │   └── page.tsx        # Phrasebook browser
│   │   ├── settings/
│   │   │   └── page.tsx        # Settings page
│   │   └── api/
│   │       ├── transcribe/route.ts
│   │       ├── translate/route.ts
│   │       ├── speak/route.ts
│   │       ├── phrase-translate/route.ts
│   │       └── settings/route.ts
│   ├── components/
│   │   ├── Header.tsx          # Shared header (compact nav or large title)
│   │   ├── BottomNav.tsx       # Fixed bottom navigation (3 tabs)
│   │   ├── ThemeProvider.tsx   # Applies dark class to <html>
│   │   └── SettingsSync.tsx    # Syncs Zustand ↔ server settings.json
│   ├── hooks/
│   │   ├── useTranslator.ts    # Main translation flow orchestrator
│   │   └── useAudioRecorder.ts # MediaRecorder + waveform analyser
│   ├── store/
│   │   ├── translatorStore.ts  # sourceLanguage, targetLanguage, speaker, history
│   │   └── appStore.ts         # theme, profile
│   ├── lib/
│   │   └── sarvam.ts           # Sarvam client, SUPPORTED_LANGUAGES, TTS_VOICES
│   └── data/
│       └── phrasebook.ts       # PHRASES (60), CATEGORY_META, phraseAudioFilename()
```

---

## 6. Data Models

### LanguageCode
```typescript
export type LanguageCode = "hi-IN" | "kn-IN" | "ta-IN" | "te-IN" | "ml-IN"
  | "mr-IN" | "gu-IN" | "pa-IN" | "bn-IN" | "od-IN" | "en-IN";
```

### VoiceId
```typescript
export type VoiceId = "priya" | "anushka" | "manisha" | /* ... all 38 voices */;
```

### Phrase
```typescript
export interface Phrase {
  id: string;                                        // e.g. "cab-001"
  english: string;                                   // source truth
  category: PhraseCategory;
  tags?: string[];
  translations: Partial<Record<LanguageCode, string>>; // pre-built translations
}
```

### PhraseCategory (10 types)
```typescript
export type PhraseCategory =
  | "cab" | "shopping" | "food" | "hotel" | "emergency"
  | "maid" | "cook" | "security" | "plumber" | "electrician";
```

### Profile
```typescript
interface Profile {
  name: string;
  avatar: string;   // emoji character
  city: string;
  phone: string;
}
```

---

## 7. API Routes

### POST /api/transcribe
- Body: `FormData { audio: Blob, language: string }`
- Strips codec params from MIME type
- Calls `sarvam.speechToText.transcribe({ file, model: "saaras:v3", languageCode })`
- Returns: `{ transcript: string }`

### POST /api/translate
- Body: `{ text, sourceLanguage, targetLanguage }`
- Calls `sarvam.translate.convert({ input: text, sourceLanguageCode, targetLanguageCode, model: "mayura:v1" })`
- Returns: `{ translation: string }`

### GET /api/speak?phraseId=&language=&speaker=
- Cache-only check: returns `{ audio: "<base64>" }` if found in `data/audio/`
- Returns 404 if not cached (client then POSTs to generate)

### POST /api/speak
- Body: `{ text, language, speaker, phraseId? }`
- Cache filename:
  - With phraseId: `phraseAudioFilename(phraseId, language, speaker)` → `"cab-001-hi-IN-priya.txt"`
  - Without: SHA256(`text::language::speaker`) + `.txt`
- On cache miss: calls `sarvam.textToSpeech.convert({ inputs: [{ text }], targetLanguageCode, speaker, model: "bulbul:v3" })`
- Saves base64 audio string to `data/audio/<filename>`
- Returns: `{ audio: "<base64>" }`

### POST /api/phrase-translate
- Body: `{ phraseId, text, from, to }`
- Cache key: `"${phraseId}::${to}"` in `data/translations.json`
- On cache hit: returns cached translation
- On cache miss: calls Sarvam translate, saves to JSON, returns translation

### GET /api/settings
- Reads `data/settings.json`, returns JSON object

### POST /api/settings
- Body: partial settings object
- Merges with existing, adds `updatedAt` timestamp, writes back

---

## 8. Store Design (Zustand)

### translatorStore (`src/store/translatorStore.ts`)
```typescript
interface TranslatorStore {
  sourceLanguage: LanguageCode;    // default: "hi-IN"
  targetLanguage: LanguageCode;    // default: "kn-IN"
  speaker: VoiceId;                // default: "priya"
  history: HistoryEntry[];         // max 50 entries
  setSourceLanguage: (lang: LanguageCode) => void;
  setTargetLanguage: (lang: LanguageCode) => void;
  setSpeaker: (speaker: VoiceId) => void;
  toggleLanguage: () => void;      // swaps source ↔ target
  addToHistory: (entry: HistoryEntry) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}
// persisted as "translator-store" in localStorage
```

### appStore (`src/store/appStore.ts`)
```typescript
interface AppStore {
  theme: "light" | "dark" | "system";    // default: "system"
  profile: Profile;                       // default: empty strings, avatar "🧑"
  setTheme: (theme: Theme) => void;
  setProfile: (patch: Partial<Profile>) => void;
}
// persisted as "app-store" in localStorage
```

---

## 9. Component Library

### `<Header>`
```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;           // if present → large title layout
  left?: React.ReactNode | false;  // false = no back button; undefined = default back button
  right?: React.ReactNode;
}
```
Two layouts:
- **Large** (has subtitle): full-width title + subtitle + right slot
- **Compact** (no subtitle): left | centered title | right (w-9 placeholder)

Back button calls `router.back()`. Dark mode: `dark:bg-gray-800`, `dark:text-white`.

Also exports `<SearchIcon>` SVG component.

### `<BottomNav>`
Three tabs: Translate (`/translate`), Phrases (`/phrasebook`), Settings (`/settings`).
- Active: teal `#00BFA5` (icon fill + text)
- Inactive light: `#9CA3AF`
- Inactive dark: `#4B5563`
- Container: `bg-white dark:bg-[#1C1C1E]`, `border-gray-100 dark:border-gray-800`
- SVG trick: render icon twice, toggle with `dark:hidden` / `hidden dark:inline`

### `<ThemeProvider>`
Client component that reads `theme` from `useAppStore` and applies/removes `.dark` on `document.documentElement`. In `"system"` mode, listens to `window.matchMedia("(prefers-color-scheme: dark)")`.

### `<SettingsSync>`
Invisible client component (`return null`). On mount: GETs `/api/settings` and hydrates both stores using a `hydrated` ref. On any store value change: debounced 800ms POST to `/api/settings`. The `hydrated` ref prevents saves before initial load completes.

---

## 10. Pages

### `/` — Home
- Hero card: app name + tagline + language display (from store via `getLangMeta()`)
- Quick action buttons: "Start Translating", "Browse Phrases"
- Feature cards: Live Voice, 11 Languages, Quick Phrases
- Profile avatar (emoji from `useAppStore`)
- Dark: `dark:bg-[#1C1C1E]` main, `dark:bg-[#0D2E28]` hero, inverted text

### `/translate` — Voice Translator
Two states:
1. **Idle**: mic button centered, language selector pills (swap button between)
2. **Recording**: animated waveform bars + stop button

After recording:
- Transcript card (source language text)
- Translation card (target language text) with speaker button
- Auto-plays TTS after translation completes

Dark mode throughout: `dark:bg-[#1C1C1E]`, `dark:bg-gray-800` cards, `dark:text-gray-400` labels.

### `/phrasebook` — Phrasebook
URL-driven state:
- `?cat=cab` — filter by category
- `?search=1` — show search bar

Category grid: 10 tiles (2-column) with emoji + color + count badge.
Phrase list per category: each card shows source text + target text (from translations map or fetched via `/api/phrase-translate`).
Play button: GET cache check first → POST if miss → play base64 audio.

Search: filters `phrase.translations[sourceLang]`, `phrase.translations[targetLang]`, `phrase.english` simultaneously. Results shown as flat list regardless of category.

### `/settings` — Settings
Sections:
1. **Profile**: emoji avatar picker (12 options), name/city/phone inputs
2. **Appearance**: 3-way theme toggle (☀️ Light / 🌙 Dark / ⚙️ Auto)
3. **Source Language**: grid of language pills (radio-style, teal active)
4. **Target Language**: same grid
5. **Voice**: horizontal scroll of voice pills with gender labels
All changes auto-save via `SettingsSync` debounce.

---

## 11. Theming & Dark Mode

### CSS Variables (`globals.css`)
```css
@layer base {
  :root {
    --background: #ffffff;
    --foreground: #1C1C1E;
  }
  .dark {
    --background: #1C1C1E;
    --foreground: #ffffff;
  }
}
```

### Font (`layout.tsx` + `globals.css`)
```typescript
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});
```
In `globals.css` (Tailwind v4 `@theme inline`):
```css
@theme inline {
  --font-sans: "Poppins", sans-serif;  /* hardcoded, not referencing --font-poppins var */
}
```
On `<body>`: `className={`${poppins.variable} antialiased bg-background text-foreground`}`

### Dark Mode Activation
`ThemeProvider` runs on client, reads Zustand `theme` value, and toggles:
```typescript
document.documentElement.classList.toggle("dark", isDark);
```

---

## 12. Server-Side Caching

All cache files live in `data/` (create this directory, add to `.gitignore`).

### Audio Cache
- Location: `data/audio/<filename>.txt`
- Content: raw base64 string (no data URI prefix)
- Filename strategies:
  - Phrase audio: `phraseAudioFilename(phraseId, language, speaker)` = `"${phraseId}-${language}-${speaker}.txt"`
  - Ad-hoc TTS: `SHA256("${text}::${language}::${speaker}") + ".txt"`
- Single source of truth: `phraseAudioFilename()` defined in `src/data/phrasebook.ts`, imported by both client (phrasebook page) and server (`api/speak`)

### Translation Cache
- Location: `data/translations.json`
- Structure: `{ "phraseId::targetLang": "translated text", ... }`
- Read: `JSON.parse(readFile)` with `{}` fallback
- Write: merge + `writeFile`

### Settings
- Location: `data/settings.json`
- Structure: `{ sourceLanguage, targetLanguage, speaker, theme, profile, updatedAt }`

---

## 13. Settings Persistence

Two-layer persistence:
1. **Client** (localStorage via Zustand persist): instant UI updates, survives page reload
2. **Server** (data/settings.json): survives browser data clear, shared across devices on same server

Load order on app start:
1. Zustand rehydrates from localStorage (immediate)
2. `SettingsSync` GETs `/api/settings` (async)
3. Server values overwrite client values (server is source of truth after first sync)

---

## 14. Phrasebook Data

### Categories (10)
| ID | Emoji | Label | Color |
|---|---|---|---|
| cab | 🚕 | Cab / Rickshaw | amber |
| shopping | 🛒 | Shopping | blue |
| food | 🍽️ | Food & Dining | orange |
| hotel | 🏨 | Hotel & Stay | purple |
| emergency | 🆘 | Emergency | red |
| maid | 🧹 | Household Help | green |
| cook | 👨‍🍳 | Cook / Chef | yellow |
| security | 🔒 | Security Guard | slate |
| plumber | 🔧 | Plumber | cyan |
| electrician | ⚡ | Electrician | violet |

### Phrases (60 total, 6 per category)
Each phrase has:
- Unique ID: `"${category}-00${n}"` (e.g., `"cab-001"`)
- English text (source truth)
- Translations pre-built for all 11 language codes

Example:
```typescript
{
  id: "cab-001",
  english: "Please take me to this address",
  category: "cab",
  translations: {
    "hi-IN": "कृपया मुझे इस पते पर ले चलें",
    "kn-IN": "ದಯವಿಟ್ಟು ನನ್ನನ್ನು ಈ ವಿಳಾಸಕ್ಕೆ ಕರೆದೊಯ್ಯಿ",
    "ta-IN": "தயவுசெய்து என்னை இந்த முகவரிக்கு அழைத்துச் செல்லுங்கள்",
    // ... 8 more languages
  }
}
```

---

## 15. PWA Setup

### `public/manifest.json`
```json
{
  "name": "BhashaSethu",
  "short_name": "BhashaSethu",
  "description": "Live Hindi↔Kannada translator for travellers",
  "start_url": "/translate",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#00BFA5",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Meta tags in `layout.tsx`
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#ffffff" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

---

## 16. Known Bugs & Fixes

### 1. MIME Type Rejection (Sarvam STT 400)
**Error:** `Invalid file type: audio/webm;codecs=opus`
**Fix:** Strip codec suffix before sending to Sarvam:
```typescript
const cleanMime = mimeType.split(";")[0]; // "audio/webm"
```
Apply in BOTH `useAudioRecorder.ts` and `api/transcribe/route.ts`.

### 2. Invalid TTS Speaker (400)
**Error:** `Speaker 'X' is not compatible with model bulbul:v3`
**Fix:** Use only validated speakers. Default to `"priya"`. Build `TTS_VOICES` array from Sarvam's error response speaker list.

### 3. TypeScript: `TextToSpeechSpeaker` type mismatch
**Error:** `Type 'string' is not assignable to type 'TextToSpeechSpeaker'`
**Fix:** Cast the call: `(sarvam.textToSpeech.convert as any)({ ... })`

### 4. Poppins CSS var not defined in `@theme inline`
**Error:** `--font-poppins is not defined`
**Fix:** In `@theme inline`, hardcode the font name instead of referencing the CSS var:
```css
--font-sans: "Poppins", sans-serif;  /* NOT: var(--font-poppins) */
```

### 5. Phrasebook shows hardcoded languages only
**Fix:** Change `Phrase.hindi`/`Phrase.kannada` to `Phrase.translations: Partial<Record<LanguageCode, string>>` map. Read via `phrase.translations[langCode]`.

---

## 17. Recreate Prompt

Use the following prompt to recreate the entire BhashaSethu project from scratch:

---

```
Build "BhashaSethu" — a mobile-first PWA for Hindi-speaking Delhi tourists visiting Bangalore to translate in real-time and browse phrasebooks.

## Tech Stack
- Next.js 14 (App Router, TypeScript strict)
- Tailwind CSS v4 (CSS-first, @theme inline in globals.css)
- Zustand with persist middleware
- sarvamai npm SDK (Sarvam AI)
- Font: Poppins (next/font/google, weights 400-900, --font-sans hardcoded in @theme)

## Environment
SARVAM_API_KEY in .env.local

## Sarvam AI Usage
- STT: sarvam.speechToText.transcribe({ file: Blob, model: "saaras:v3", languageCode })
  - CRITICAL: strip codec params from MIME type: mimeType.split(";")[0]
- Translation: sarvam.translate.convert({ input, sourceLanguageCode, targetLanguageCode, model: "mayura:v1" })
- TTS: (sarvam.textToSpeech.convert as any)({ inputs: [{ text }], targetLanguageCode, speaker, model: "bulbul:v3" })
  - Valid speakers (bulbul:v3): priya (default), anushka, manisha, vidya, arushi, abhilash, karun, hitesh, arjun, amol, and 28+ others
  - Default speaker: "priya"
  - Returns: { audios: [{ audioData: "<base64>" }] }

## Supported Languages (11)
hi-IN (Hindi), kn-IN (Kannada), ta-IN (Tamil), te-IN (Telugu), ml-IN (Malayalam),
mr-IN (Marathi), gu-IN (Gujarati), pa-IN (Punjabi), bn-IN (Bengali), od-IN (Odia), en-IN (English)

## Zustand Stores
1. translatorStore: sourceLanguage (hi-IN), targetLanguage (kn-IN), speaker (priya), history[]
   - toggleLanguage() swaps source ↔ target
   - history max 50 entries
   - persisted as "translator-store"
2. appStore: theme ("system"), profile { name, avatar (emoji), city, phone }
   - persisted as "app-store"

## API Routes (all in src/app/api/)
- POST /api/transcribe — FormData { audio, language } → { transcript }
- POST /api/translate — { text, sourceLanguage, targetLanguage } → { translation }
- GET  /api/speak?phraseId=&language=&speaker= — cache check → { audio: base64 } or 404
- POST /api/speak — { text, language, speaker, phraseId? } → { audio: base64 }
  - Cache in data/audio/ as base64 .txt files
  - Named cache: phraseId ? "${phraseId}-${language}-${speaker}.txt" : SHA256(text::lang::speaker)+".txt"
- POST /api/phrase-translate — { phraseId, text, from, to } → { translation }
  - Cache in data/translations.json as { "phraseId::targetLang": "text" }
- GET  /api/settings — reads data/settings.json
- POST /api/settings — merges patch into data/settings.json

## Components
- ThemeProvider: client component, reads appStore.theme, toggles .dark on document.documentElement
  System mode: listens to prefers-color-scheme MediaQueryList
- SettingsSync: invisible client component, on mount GETs /api/settings and hydrates stores,
  on any settings change debounced 800ms POST /api/settings. Use hydrated ref to prevent save-before-load.
- Header: two modes — large (title+subtitle) and compact (back|title|right)
  left=false hides back, left=undefined shows default back button using router.back()
- BottomNav: 3 tabs (Translate, Phrases, Settings), active=teal #00BFA5, inactive light=#9CA3AF dark=#4B5563
  SVG trick: render icon twice with dark:hidden/hidden dark:inline for theme-aware colors

## Pages
/ (Home): hero card, quick actions, feature cards, profile avatar from store
/translate: idle state (mic button + language pickers) + recording state (waveform + stop)
  After: transcript card + translation card + TTS play button
  AnalyserNode + requestAnimationFrame for animated waveform bars
/phrasebook: URL-driven (?cat=X, ?search=1), category grid (2-col), phrase cards with TTS
  GET cache check before POST for audio. getBuiltinText() reads phrase.translations[langCode].
/settings: profile (emoji picker + text inputs), theme toggle (3-way), language grids, voice pills

## Phrasebook Data (src/data/phrasebook.ts)
10 categories: cab, shopping, food, hotel, emergency, maid, cook, security, plumber, electrician
60 phrases (6 per category), each with translations: Partial<Record<LanguageCode, string>> for all 11 langs
phraseAudioFilename(phraseId, language, speaker): string — single source of truth for cache filenames

## Dark Mode
- globals.css: :root { --background: #fff; --foreground: #1C1C1E } .dark { inverted }
- Key dark classes: dark:bg-[#1C1C1E], dark:bg-gray-800, dark:text-white, dark:text-gray-400
- Hero: dark:bg-[#0D2E28]; feature cards: dark:bg-[#1A2333]

## PWA
public/manifest.json: name=BhashaSethu, start_url=/translate, display=standalone, theme_color=#00BFA5
layout.tsx head: manifest link + theme-color + mobile-web-app-capable + apple PWA metas

## Server Storage (data/ directory)
data/settings.json — user settings
data/translations.json — phrase translation cache
data/audio/ — TTS audio files (base64 .txt)
Create data/ dir; add to .gitignore. Use fs/promises readFile/writeFile with JSON.parse fallback {}.

## Key Conventions
- Use getLangMeta(code) from src/lib/sarvam.ts instead of hardcoded language names anywhere
- Speaker type: cast sarvam TTS call as any to avoid TextToSpeechSpeaker type errors
- MIME fix: strip ;codecs=... in BOTH useAudioRecorder.ts AND api/transcribe/route.ts
- phraseAudioFilename() imported from src/data/phrasebook.ts by BOTH phrasebook page AND api/speak route
- Settings load order: Zustand rehydrates from localStorage first, then SettingsSync overwrites from server
```

---

*End of BHASHASETHU.md*
