# 🗳️ ElectionAssist — Your Smart Voting Guide

> **Live Demo:** [https://electionassist-570282205129.us-central1.run.app](https://electionassist-570282205129.us-central1.run.app)

**ElectionAssist** is an intelligent, context-aware civic assistant built for the **Prompt Wars Virtual (Google x Hack2Skill)** hackathon. It guides citizens through the entire Indian election process — from registration to casting their vote — ensuring a smooth, accessible, and highly reliable experience.

## 🎯 Chosen Vertical
**Election Process Education**
Our platform directly addresses the need for clear, step-by-step guidance to help voters navigate the complexities of the electoral process.

## 🧠 Architecture: The Fallback-First Intelligence
To guarantee 100% uptime and a flawless user experience, ElectionAssist employs a **Hybrid AI Architecture**:

1. **Primary Intelligence (Local Fallback Engine):** A robust, rule-based NLP engine running entirely in the browser. It detects user intents (e.g., "what next", "documents", "location") and provides instant, context-aware guidance. Every contextual response is explicitly anchored with **"Based on your current step..."**. This ensures the app works flawlessly and intelligently even without internet access or API keys.
2. **Secondary Intelligence (Gemini Optional):** When available, Google Gemini 2.0 Flash is used in the background to silently enhance responses. If Gemini times out or is unavailable, the app seamlessly serves the local response with **zero error messages** shown to the user.

## ⚖️ Evaluation Criteria Alignment

### 1. Decision-Making Logic (Context Engine)
Our core logic (`src/utils/contextEngine.js` and `fallbackEngine.js`) doesn't just answer questions; it drives the user journey.
- **Intent Detection:** Keywords map user queries to specific actions (e.g., "where" triggers location services, "how to" triggers the voting simulator).
- **State Mutability:** Responses directly alter the user's `active_panel` and `user_stage`. For example, asking about documents automatically opens the Checklist panel.

### 2. Testing Strategy (Fallback Validation)
The application is rigorously designed to be tested entirely offline or without API keys.
- **Deterministic Offline Testing:** Disabling network connections or removing API keys guarantees the fallback engine takes over. Queries like "I am at polling booth", "what next?", or "documents needed" will always yield deterministic, stage-appropriate guidance.
- **Zero-Error Tolerance:** We have explicitly purged all user-facing errors. If a service fails, the system defaults to: *"I will guide you based on your current situation."*

### 3. Accessibility Features
Inclusive design is fundamental to civic tech:
- **ARIA Labeling:** All interactive elements utilize proper ARIA tags for screen readers.
- **Multimodal Input:** Voice-to-text integration allows users to speak their queries, while Text-to-Speech reads the guidance aloud.
- **"Easy Mode":** A toggle that significantly increases font sizes and simplifies terminology for low-literacy users.
- **High Contrast Support:** Specialized CSS variables ensure readability for visually impaired users.

### 4. Google Services Integration
- **Gemini 2.0 Flash:** Used as an asynchronous, non-blocking enhancement layer for chat.
- **Google Maps Embed API:** Integrated into the Polling Booth Finder, complete with graceful deep-link fallbacks if keys are absent.

### 5. Efficiency & Performance
- **Ultra-Lightweight Bundle:** The entire project remains under 10MB by utilizing pure React and Vanilla CSS over heavy component libraries.
- **Storage:** Uses browser `localStorage` to isolate user context and persist journeys without requiring a heavy backend database.

## 🚀 Setup & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gd3312-beep/ElectionAssist-Promptwars.git
   cd ElectionAssist-Promptwars
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup (Optional):**
   Copy `.env.example` to `.env`. The app works perfectly without keys, but you can add your Gemini and Google Maps keys for enhanced features.

4. **Run the Application:**
   ```bash
   npm run dev
   ```

## 🔐 Security Note
**No API keys are exposed in the client-side code.** All sensitive credentials are managed via server-side environment variables or injected securely during deployment.

---
*Built with ❤️ for #BuildwithAI and #PromptWarsVirtual*