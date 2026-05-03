# 🗳️ ElectionAssist — AI Civic Guidance Platform

> **Live Demo:** https://electionassist-570282205129.us-central1.run.app

An AI-powered civic assistant that guides users through the entire voting journey — from registration to casting their vote — with voice interaction, multilingual support, and real-time step-by-step guidance.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **Hybrid AI System** | Smart Gemini-powered chat with a robust rule-based **fallback system** that works even when AI services are offline. |
| 🛡️ **Failure-Proof Guidance** | Built-in intelligence providing instructions like "Based on your current step..." regardless of connectivity. |
| 🧭 **Interactive Journey** | A clickable, visual timeline with stage-specific FAQs, key actions, and next steps for every phase of the election. |
| 👤 **User-Specific Persistence** | All state (stage, location, checklist) is stored securely in **localStorage** per user session. Refreshing never loses progress. |
| 🗺️ **Smart Map UI** | Polling booth finder with intelligent fallbacks and guided instructions if maps are unavailable. |
| 🧠 **Context-Aware Chat** | Recognizes queries like "what next" or "help me vote" and responds accurately based on your current journey stage. |
| 🎙️ **Voice-First Interaction** | Speak your questions; AI/System auto-responds with Text-to-Speech support. |
| 🧩 **Voter ID Simulation** | Real-feeling Voter ID application flow with live status tracking. |

---

## 🚀 Architecture

- **Frontend:** React 18 + Vite (State management via AppContext + useReducer)
- **Persistence:** LocalStorage (User-specific session isolation)
- **Intelligence:** Hybrid (Google Gemini 1.5 Flash Proxy + Rule-based Fallback Engine)
- **Styling:** Premium Glassmorphism UI (Vanilla CSS)
- **Security:** Zero-key client-side architecture (All keys handled via server-side environment variables)

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- A Google Gemini API Key ([Get one](https://aistudio.google.com/))

### Setup

```bash
# Clone the repository
git clone https://github.com/gd3312-beep/ElectionAssist-Promptwars.git
cd ElectionAssist-Promptwars

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Edit .env and add your API keys

# Start the dev server (Frontend + Backend)
npm run dev    # Starts Vite
npm start      # Starts Express Backend on :8080
```

---

## 🔐 Privacy & Security

- **No Key Exposure:** All API keys are handled server-side. They never appear in the client bundle, commit messages, or README.
- **Data Privacy:** User profiles and voting progress are stored **only in the browser's localStorage** and the minimal backend's volatile memory.
- **Simulation:** All government services are clearly labelled as **simulations** for educational purposes.

---

## 📄 License

MIT © 2026 ElectionAssist Team
