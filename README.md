# 🗳️ ElectionAssist — Your Smart Voting Guide

> **Live Demo:** [https://electionassist-570282205129.us-central1.run.app](https://electionassist-570282205129.us-central1.run.app)

**ElectionAssist** is an intelligent, context-aware civic assistant built for the **Prompt Wars Virtual (Google x Hack2Skill)** hackathon. It guides citizens through the entire Indian election process — from registration to casting their vote — ensuring a smooth, accessible, and highly reliable experience.

## 🎯 Chosen Vertical
**Election Process Education**
Our platform directly addresses the need for clear, step-by-step guidance to help voters navigate the complexities of the electoral process.

## 🧠 Architecture: The Fallback-First Intelligence
To guarantee 100% uptime and a flawless user experience, ElectionAssist employs a **Hybrid AI Architecture**:

1. **Primary Intelligence (Local Fallback Engine):** A robust, rule-based NLP engine running entirely in the browser. It detects user intents (e.g., "what next", "documents", "location") and provides instant, context-aware guidance ("Based on your current step..."). **This ensures the app works flawlessly even without internet access or API keys.**
2. **Secondary Intelligence (Gemini Optional):** When available, Google Gemini 2.0 Flash is used in the background to silently enhance responses. If Gemini times out or is unavailable, the app seamlessly serves the local response with zero error messages shown to the user.

## ✨ Key Features

- **Context-Aware Guidance:** The assistant knows your current stage (e.g., "Preparation" vs. "At the Booth") and tailors its advice accordingly.
- **Interactive Journey Steps:** A visual timeline tracks your progress. Clicking any step reveals key actions, FAQs, and pro-tips for that stage.
- **Smart Polling Booth Finder:** A map interface that accepts manual location input, uses browser geolocation, and gracefully falls back to Google Maps deep-links if API keys are missing.
- **Multilingual & Voice-Enabled:** Supports voice input and text-to-speech, catering to diverse linguistic needs and improving accessibility.
- **Zero API Key Dependency:** The application is fully functional and intelligent out-of-the-box, without requiring any external AI or Map APIs.
- **Privacy First:** All user state (stage, location, checklist) is stored securely in the browser's `localStorage`.

## 🛠️ Technical Implementation & Assumptions
- **Frontend:** React 18 + Vite. The bundle is lightweight (<10MB) and highly performant.
- **Backend (Optional):** A minimal Express server (`server/index.js`) is included to safely proxy Gemini requests and serve the built React app.
- **Assumptions:** We assume users may have intermittent connectivity. Therefore, the core guidance logic is bundled locally, and error messages are suppressed in favor of helpful fallbacks.

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
   # Terminal 1: Start the frontend development server
   npm run dev

   # Terminal 2: Start the backend server (optional)
   npm start
   ```

## 🔐 Security Note
**No API keys are exposed in the client-side code.** All sensitive credentials are managed via server-side environment variables or injected securely during deployment.

---
*Built with ❤️ for #BuildwithAI and #PromptWarsVirtual*
