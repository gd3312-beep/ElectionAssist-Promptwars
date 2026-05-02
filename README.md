# 🗳️ ElectionAssist — AI Civic Guidance Platform

> **Live Demo:** https://electionassist-570282205129.us-central1.run.app

An AI-powered civic assistant that guides users through the entire voting journey — from registration to casting their vote — with voice interaction, multilingual support, and real-time step-by-step guidance.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Chat (Gemini 1.5 Flash)** | Context-aware responses via a secure server-side proxy |
| 🧭 **Voting Journey Tracker** | Visual step-by-step progress: Registered → At Booth → Voted |
| 🎮 **Guided Mode + Inline Help** | Step-by-step wizard with AI chat assistant at every step |
| 📋 **Smart Checklist** | Personalized document checklist with readiness score (%) |
| 🗺️ **Polling Booth Map** | Google Maps embed with estimated distance & travel time |
| 🎙️ **Voice-First Interaction** | Speak your question; AI auto-responds |
| 🔊 **Text-to-Speech** | AI reads responses aloud |
| 👤 **Sign Up + Backend Login** | Simulated authentication with email/phone stored in a lightweight backend |
| ✏️ **Voter ID Service** | Real-feeling Voter ID application flow with status tracking |
| 🗳️ **Candidate Info** | Real-time fetch of contesting candidates |
| 🌐 **Multilingual** | Toggle between English and regional languages |
| 🧠 **Easy Mode** | Larger fonts, simpler AI language for low-literacy users |

---

## 🚀 Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express (Minimalist <100 lines)
- **AI:** Google Gemini 1.5 Flash (Server-side proxy for security)
- **Maps:** Google Maps Embed API
- **Styling:** Vanilla CSS with Glassmorphism design
- **Deployment:** Google Cloud Run (Dockerized Express server serving static React dist)

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

## 🐳 Docker & Cloud Run Deployment

The app uses a Node.js/Express server to serve both the API and the React frontend.

### Security Note
**DO NOT hardcode API keys in the Dockerfile.** Doing so will cause Google to automatically disable your keys for security. Always pass them as environment variables during deployment.

### Deployment Command

```bash
# Deploy to Cloud Run
gcloud run deploy electionassist \
  --source . \
  --project YOUR_PROJECT_ID \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=your_new_key_here" \
  --set-build-env-vars="VITE_GEMINI_API_KEY=your_new_key_here,VITE_GOOGLE_MAPS_API_KEY=your_maps_key,VITE_GOOGLE_CLIENT_ID=your_client_id" \
  --quiet
```

---

## 🏗️ Project Structure

```
├── server/
│   └── index.js                  # Minimal Express backend (API + Static server)
├── src/
│   ├── components/
│   │   ├── Chat.jsx              # Main AI chat interface
│   │   ├── CandidatesPanel.jsx   # Card list of contesting candidates
│   │   ├── VoterRegistrationSimulation.jsx # Voter ID application service
│   │   └── ...
│   ├── services/
│   │   ├── api.js                # Frontend client for the Express backend
│   │   └── gemini.js             # AI logic (proxies to backend)
│   └── ...
└── Dockerfile                    # Multi-stage build (Vite build -> Express server)
```

---

## 🔐 Privacy & Safety

- User profiles and applications are stored in **server-side memory** (reset on restart for demo purposes).
- API keys are handled server-side to prevent browser exposure.
- All government services are clearly labelled as **simulations**.

---

## 📄 License

MIT © 2026 ElectionAssist Team
