import React, { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { generateResponse } from '../services/gemini'
import { speakText, startSpeechRecognition } from '../utils/speechHelper'
import { trackEvent } from '../utils/analyticsHelper'
import { Send, Mic, Volume2, Loader, HelpCircle, X, ChevronLeft, ChevronRight } from 'lucide-react'

const STEPS = [
  {
    id: 'learning',
    emoji: '📚',
    label: 'Step 1: Preparation',
    desc: "Learn about your local candidates. Make sure you have a valid photo ID (Driver's License, Passport, or Voter ID card).",
    tips: ['Check election date', 'Know your candidate', 'Keep your ID ready'],
    contextHint: 'preparation and documents needed to vote',
  },
  {
    id: 'registered',
    emoji: '🗂️',
    label: 'Step 2: Registration',
    desc: 'Verify your name is on the electoral roll. You can check online at the official election website or at your local election office.',
    tips: ['Verify voter roll online', 'Check polling station assigned', 'Note your voter ID number'],
    contextHint: 'voter registration and electoral roll verification',
  },
  {
    id: 'at_polling_station',
    emoji: '📍',
    label: 'Step 3: At the Polling Booth',
    desc: 'Arrive at your designated polling station. Show your photo ID to the polling officer. Wait in the queue patiently.',
    tips: ['Arrive early', 'Bring your photo ID', 'Follow officer instructions'],
    contextHint: 'arriving at the polling booth and showing ID',
  },
  {
    id: 'voting',
    emoji: '🗳️',
    label: 'Step 4: Casting Your Vote',
    desc: 'Enter the voting booth. Press the button next to your chosen candidate on the EVM, or mark your ballot paper. Do NOT take photos inside the booth.',
    tips: ['Vote in secret', 'Press button firmly on EVM', 'No photos inside booth'],
    contextHint: 'how to cast a vote on the EVM or ballot paper',
  },
  {
    id: 'completed',
    emoji: '✅',
    label: 'Step 5: Done!',
    desc: "You have successfully voted! Collect your ink mark as proof. Follow exit signs and encourage others to vote.",
    tips: ['Show ink mark proudly', 'Encourage others to vote', 'Await results peacefully'],
    contextHint: 'after voting and election results',
  },
]

export default function GuidedMode() {
  const { state, dispatch } = useAppContext()
  const [showHelp, setShowHelp] = useState(false)
  const [helpMessages, setHelpMessages] = useState([])
  const [helpInput, setHelpInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const helpEndRef = useRef(null)

  const currentIndex = STEPS.findIndex(s => s.id === state.user_stage)
  const idx = currentIndex >= 0 ? currentIndex : 0
  const currentStep = STEPS[idx]

  useEffect(() => {
    helpEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [helpMessages, isTyping])

  useEffect(() => {
    trackEvent('guided_mode_started', { timestamp: Date.now() })
  }, [])

  // Reset help messages when step changes
  useEffect(() => {
    setHelpMessages([])
  }, [idx])

  const goNext = () => {
    if (idx < STEPS.length - 1) dispatch({ type: 'SET_USER_STAGE', payload: STEPS[idx + 1].id })
  }
  const goPrev = () => {
    if (idx > 0) dispatch({ type: 'SET_USER_STAGE', payload: STEPS[idx - 1].id })
  }
  const goExit = () => dispatch({ type: 'SET_APP_VIEW', payload: 'chat' })

  const sendHelp = async (textOverride) => {
    const text = textOverride || helpInput
    if (!text.trim() || isTyping) return
    setHelpInput('')
    const userMsg = { role: 'user', text }
    setHelpMessages(m => [...m, userMsg])
    setIsTyping(true)
    try {
      // Inject step context into the state for Gemini
      const enrichedState = {
        ...state,
        last_intent: currentStep.contextHint,
        user_stage: currentStep.id,
      }
      const response = await generateResponse(text, enrichedState)
      setHelpMessages(m => [...m, { role: 'assistant', text: response.text }])
      speakText(response.text, state.user_language)
    } catch {
      setHelpMessages(m => [...m, { role: 'assistant', text: "I'm having trouble connecting. Please try again.", isWarning: true }])
    }
    setIsTyping(false)
  }

  const handleMic = () => {
    if (isListening) return
    setIsListening(true)
    startSpeechRecognition(
      state.user_language,
      (t) => { setIsListening(false); sendHelp(t) },
      () => setIsListening(false)
    )
  }

  return (
    <div
      className="glass-panel fade-in"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)' }}>
        <span style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '1rem' }}>🧭 Guided Mode</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowHelp(h => !h)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-xl)',
              background: showHelp ? 'var(--primary-color)' : 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              color: showHelp ? 'white' : 'var(--text-primary)',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <HelpCircle size={15} /> Ask for Help
          </button>
          <button
            onClick={goExit}
            style={{ padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-xl)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body: step + optional help panel side by side */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left: Step content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>

          {/* Step number dots */}
          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{
                width: i === idx ? '24px' : '8px', height: '8px', borderRadius: '4px',
                background: i < idx ? 'var(--accent-color)' : i === idx ? 'var(--primary-color)' : 'var(--card-border)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>

          {/* Emoji + title */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem', animation: 'fadeIn 0.3s ease' }}>
              {currentStep.emoji}
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)' }}>{currentStep.label}</h2>
          </div>

          {/* Description card */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '1.05rem',
            lineHeight: 1.7,
            textAlign: 'center',
          }}>
            {currentStep.desc}
          </div>

          {/* Tips */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {currentStep.tips.map(tip => (
              <span key={tip} style={{
                background: 'rgba(79,70,229,0.1)',
                border: '1px solid rgba(79,70,229,0.25)',
                padding: '0.35rem 0.8rem',
                borderRadius: 'var(--radius-xl)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--primary-color)',
              }}>
                ✓ {tip}
              </span>
            ))}
          </div>

          {/* Ask for help inline prompt (mobile) */}
          {!showHelp && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <button
                onClick={() => setShowHelp(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Have a question about this step?
              </button>
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={goPrev}
              disabled={idx === 0}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                color: idx === 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
                opacity: idx === 0 ? 0.45 : 1,
                cursor: idx === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontWeight: 600, fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
            >
              <ChevronLeft size={18} /> Previous
            </button>

            <button
              onClick={idx === STEPS.length - 1 ? goExit : goNext}
              style={{
                padding: '0.85rem 2rem',
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              {idx === STEPS.length - 1 ? '🎉 Finish' : <>Next <ChevronRight size={18} /></>}
            </button>
          </div>
        </div>

        {/* Right: Help Chat Panel */}
        {showHelp && (
          <div className="fade-in" style={{
            width: '320px',
            flexShrink: 0,
            borderLeft: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(0,0,0,0.15)',
          }}>
            {/* Help panel header */}
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary-color)' }}>
                🤖 Ask AI — {currentStep.label}
              </span>
              <button onClick={() => setShowHelp(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="scrollable" style={{ flex: 1, overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {helpMessages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                  Ask anything about <strong>{currentStep.label}</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    {[`What do I do at ${currentStep.label.replace(/Step \d+: /, '')}?`, 'What documents do I need?', 'What if I have a problem?'].map(q => (
                      <button key={q} onClick={() => sendHelp(q)} style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.25)', color: 'var(--primary-color)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-lg)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {helpMessages.map((msg, i) => (
                <div key={i} className="message-fade-in" style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '92%' }}>
                  <div style={{
                    background: msg.role === 'user' ? 'var(--primary-color)' : msg.isWarning ? 'rgba(239,68,68,0.15)' : 'var(--card-bg)',
                    color: msg.role === 'user' ? 'white' : msg.isWarning ? 'var(--danger-color)' : 'var(--text-primary)',
                    padding: '0.65rem 0.9rem',
                    borderRadius: msg.role === 'user' ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                    border: msg.role === 'assistant' && !msg.isWarning ? '1px solid var(--card-border)' : 'none',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.text}
                  </div>
                  {msg.role === 'assistant' && !msg.isWarning && (
                    <button onClick={() => speakText(msg.text, state.user_language)} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <Volume2 size={12} /> Listen
                    </button>
                  )}
                </div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  <Loader size={13} className="spin" /> Thinking…
                </div>
              )}
              <div ref={helpEndRef} />
            </div>

            {/* Help input */}
            <div style={{ padding: '0.65rem', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <button
                onClick={handleMic}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: isListening ? 'var(--danger-color)' : 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  color: isListening ? 'white' : 'var(--text-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', animation: isListening ? 'pulse 1.5s infinite' : 'none',
                }}
              >
                <Mic size={16} />
              </button>
              <input
                type="text"
                value={helpInput}
                onChange={e => setHelpInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendHelp()}
                placeholder="Ask about this step…"
                style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
              />
              <button
                onClick={() => sendHelp()}
                disabled={isTyping || !helpInput.trim()}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: isTyping || !helpInput.trim() ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                  border: 'none', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isTyping || !helpInput.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .message-fade-in { animation: fadeIn 0.25s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
