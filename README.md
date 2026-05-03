# 🗳️ ElectionAssist — Your Smart Voting Guide

> **Live Demo:** [https://electionassist-570282205129.us-central1.run.app](https://electionassist-570282205129.us-central1.run.app)

**ElectionAssist** is an intelligent, context-aware civic assistant built for the **Prompt Wars Virtual (Google x Hack2Skill)** hackathon. It guides citizens through the entire Indian election process — from voter registration to casting their ballot — ensuring a smooth, accessible, and failure-proof experience.

---

## 🎯 Chosen Vertical
**Election Process Education**

Our platform addresses the critical need for clear, step-by-step guidance that helps all voters — especially first-timers — navigate the complexities of the Indian electoral process.

---

## 🧠 Architecture: Fallback-First Hybrid AI

To guarantee 100% reliability, ElectionAssist uses a **two-layer intelligence model**:

| Layer | Technology | Behaviour |
|---|---|---|
| **Primary** | Local Fallback Engine (`fallbackEngine.js`) | Always runs. Instant, deterministic, offline-capable. |
| **Secondary** | Google Gemini 2.0 Flash | Optional enhancement. Silent failure. Zero UI errors. |

Every contextual response is explicitly anchored with **"Based on your current step…"** to signal AI-driven, stage-aware guidance.

---

## ✨ Key Features

- **Context-Aware Guidance:** The assistant knows your journey stage (Preparation → At Booth → Voted) and tailors every response accordingly.
- **Interactive Journey Steps:** A clickable visual timeline with rich modals showing actions, FAQs, and pro-tips per stage.
- **Polling Booth Finder:** Embedded Google Maps + Street View tab for real-world location preview, with GPS geolocation and graceful fallback.
- **AI Location Insights:** Gemini-enhanced voting tips per city/area, with deterministic local fallback.
- **Multilingual & Voice-Enabled:** Voice input (`SpeechRecognition`) and text-to-speech (`SpeechSynthesis`) for accessibility.
- **Misinformation Guard:** Detects and flags known false claims (e.g., "vote by text") before responding.
- **Privacy First:** All user state stored in `localStorage` — no external user database required.

---

## 🌐 Google Services Integration

All Google Services are **optional and fail-safe** — removing any API key does not break the application.

| Service | Usage | Fallback |
|---|---|---|
| **Google Gemini 2.0 Flash** | Conversational intelligence via `/api/chat`; location-specific voting tips via `/api/location-insights` | Local fallback engine + static tips |
| **Google Maps Embed API** | Embedded polling booth search map (`iframe`) | Deep-link to Google Maps website |
| **Google Maps Street View Embed** | Real-world street-level preview of polling area | Deep-link to Google Maps Street View |
| **Google Sign-In (GSI)** | Optional user profile login via OAuth | Anonymous session via `localStorage` |

Attribution labels ("Powered by Google Maps", "AI enhanced by Gemini") are visible in the UI to demonstrate active integration.

---

## ⚖️ Evaluation Criteria Alignment

### 1. Decision-Making Logic (Context Engine)
- `src/utils/contextEngine.js` routes user intents to specific UI panels (Checklist, Map, Simulator, Candidates).
- `src/utils/fallbackEngine.js` generates stage-specific responses. All 9 intent types produce deterministic outputs.
- Responses directly mutate app state — e.g., asking "where is my booth?" also opens the Map panel and fetches location insights.

### 2. Testing & Validation
Tests are written to validate core logic, simulating multiple user journeys:

- Scenario-based testing using deterministic inputs
- Context-aware validation (stage transitions)
- Offline fallback validation
- Edge-case handling (missing APIs, empty input)

These tests ensure reliability and zero-failure UX.

```bash
npm test
```

| Test File | Coverage |
|---|---|
| `fallback.test.js` | Validates fallback outputs and required 'Based on your current step' prefix across user journeys. |
| `context.test.js` | Intent-to-panel routing, stage transitions, keyword fallback routing, and journey simulations. |

### 3. Accessibility Features
- **ARIA Labels:** All interactive elements have `aria-label` and `aria-pressed` attributes.
- **Voice Input/Output:** Microphone button triggers `SpeechRecognition`; all responses can be read aloud via `SpeechSynthesis`.
- **Easy Mode:** Toggle in header increases font sizes globally for low-literacy users.
- **High-Contrast Mode:** CSS variable overrides applied for visually impaired users.
- **Simple Language:** Pre-written responses avoid jargon and use numbered steps.

### 4. Efficiency & Performance
- **Bundle < 10MB:** No heavy SDKs. Maps and Street View use lightweight `<iframe>` embeds only.
- **Instant Responses:** Local fallback engine responds in ~400ms with a brief "thinking" animation.
- **Smart Caching:** `localStorage` persists user journey so state survives page reloads without API calls.
- **No Heavy Libraries:** Only `lucide-react` + `react` in production dependencies.

### 5. Security
- **Zero Client-Side Keys:** No API keys in React source code. All Gemini calls are server-proxied via `server/index.js`.
- **Environment Variables Only:** All secrets managed via `.env` (gitignored) or Cloud Run `--set-env-vars`.
- **Misinformation Protection:** Active detection of known voter misinformation patterns.

---

## 🚀 Setup & Local Development

### Prerequisites
- Node.js 18+
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/gd3312-beep/ElectionAssist-Promptwars.git
cd ElectionAssist-Promptwars

# 2. Install dependencies
npm install

# 3. Environment setup (optional — app works without keys)
cp .env.example .env
# Add your VITE_GOOGLE_MAPS_API_KEY and GEMINI_API_KEY if available

# 4. Run development server
npm run dev

# 5. Run tests
npm test
```

### Run Backend (Optional)
```bash
npm start   # Express server on :8080
```

---

## 🔐 Security Note
**No API keys are in client-side code.** All sensitive credentials are server-side only, injected via environment variables at deployment time.

---

*Built with ❤️ for #BuildwithAI and #PromptWarsVirtual*