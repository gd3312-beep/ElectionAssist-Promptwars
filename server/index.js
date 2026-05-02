import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { GoogleGenerativeAI } from '@google/generative-ai'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json())

// ── In-memory stores (safe for demo) ────────────────────────────────────────
const users = {}
const applications = {}

// ── Gemini AI (server-side — no browser key restriction issues) ──────────────
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
const ai = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null

// ── Mock candidate data ──────────────────────────────────────────────────────
const CANDIDATES = [
  { name: 'Priya Sharma',  party: 'National Progress Party', symbol: '🌟', votes: null },
  { name: 'Rahul Verma',   party: 'Democratic Alliance',     symbol: '🌿', votes: null },
  { name: 'Sunita Patel',  party: "People's Voice",          symbol: '✊', votes: null },
  { name: 'Arjun Singh',   party: 'Unity Front',             symbol: '🤝', votes: null },
]

// ── Routes ───────────────────────────────────────────────────────────────────

// POST /api/login
app.post('/api/login', (req, res) => {
  const { phone, email, name } = req.body
  if (!phone && !email) return res.status(400).json({ error: 'Phone or email required' })
  const userId = 'U-' + Date.now().toString(36).toUpperCase()
  users[userId] = { phone, email, name, createdAt: new Date().toISOString() }
  res.json({ userId, success: true })
})

// POST /api/apply-voter-id
app.post('/api/apply-voter-id', (req, res) => {
  const appId = 'APP-' + Date.now().toString(36).toUpperCase()
  applications[appId] = { ...req.body, status: 'Processing', createdAt: new Date().toISOString() }
  // Auto-approve after 45 seconds (demo effect)
  setTimeout(() => { if (applications[appId]) applications[appId].status = 'Approved' }, 45000)
  res.json({ applicationId: appId, status: 'Processing', success: true })
})

// GET /api/application/:id
app.get('/api/application/:id', (req, res) => {
  const application = applications[req.params.id]
  if (!application) return res.status(404).json({ error: 'Application not found' })
  res.json({ applicationId: req.params.id, status: application.status, name: application.name })
})

// GET /api/candidates
app.get('/api/candidates', (_req, res) => res.json(CANDIDATES))

// POST /api/chat — proxies Gemini; keeps API key off the browser
app.post('/api/chat', async (req, res) => {
  if (!ai) return res.status(503).json({ text: 'AI service not configured on server.', intent: 'error' })
  const { message, systemPrompt } = req.body
  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    })
    const result = await model.generateContent(message)
    const raw = result.response.text()
    res.json(JSON.parse(raw))
  } catch (e) {
    console.error('Gemini error:', e.message)
    res.status(500).json({ text: `AI error: ${e.message}`, intent: 'error' })
  }
})

// ── Serve React app (catch-all) ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../dist')))
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`ElectionAssist server on :${PORT}`))
