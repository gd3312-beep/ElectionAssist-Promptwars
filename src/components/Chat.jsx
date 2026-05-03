import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useAppContext } from '../context/AppContext'
import { getFallbackResponse } from '../utils/fallbackEngine'
import { processContext } from '../utils/contextEngine'
import { checkMisinformation } from '../utils/misinformationHelper'
import { speakText, startSpeechRecognition } from '../utils/speechHelper'
import { Send, Mic, Volume2 } from 'lucide-react'

const CHIPS = [
  { label: '🚀 What next?',       query: 'What should I do next?' },
  { label: '📍 Find booth',       query: 'Find polling booth near me' },
  { label: '📄 Documents needed', query: 'What documents do I need?' },
  { label: '🗳️ How to vote',      query: 'How does the voting process work?' },
  { label: '✏️ Apply Voter ID',   action: 'registration' },
]

// Thinking dots animation component
function ThinkingDots() {
  return (
    <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '1.2rem 1.2rem 1.2rem 0.25rem', boxShadow: 'var(--shadow-sm)' }}>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        .dot { width:7px; height:7px; border-radius:50%; background:var(--primary-color); opacity:0.7; animation:bounce 1.2s infinite; }
        .dot:nth-child(2){animation-delay:.15s}
        .dot:nth-child(3){animation-delay:.3s}
      `}</style>
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
    </div>
  )
}

export default function Chat() {
  const { state, dispatch } = useAppContext()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)

  const checkItems = ['id_proof', 'voter_id', 'address_proof']
  const completedCount = checkItems.filter(id => state.checklist_status[id]).length
  const readinessPct = Math.round((completedCount / checkItems.length) * 100)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages, isTyping])

  const handleSend = useCallback(async (textOverride) => {
    const textToSend = (textOverride || input).trim()
    if (!textToSend || isTyping) return
    setInput('')

    // Misinformation check
    const warning = checkMisinformation(textToSend)
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', text: textToSend } })
    if (warning) {
      dispatch({ type: 'ADD_MESSAGE', payload: { role: 'assistant', text: warning, isWarning: true } })
    }

    setIsTyping(true)

    // ── STEP 1: Generate fallback response IMMEDIATELY ────────────────────────
    const fallback = getFallbackResponse(textToSend, state)

    // Extract context changes from fallback
    const { nextPanel, nextStage, nextAppView } = processContext(
      fallback.extracted_intent || '',
      state,
      textToSend
    )

    // Apply panel/stage changes
    if (fallback.extracted_location) dispatch({ type: 'SET_LOCATION', payload: fallback.extracted_location })
    if (fallback.is_first_time) {
      dispatch({ type: 'SET_FIRST_TIME_VOTER', payload: true })
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'checklist' })
    }
    const panelToOpen = fallback.suggestedPanel || nextPanel
    if (panelToOpen && panelToOpen !== state.active_panel) dispatch({ type: 'SET_ACTIVE_PANEL', payload: panelToOpen })
    if (nextStage && nextStage !== state.user_stage) dispatch({ type: 'SET_USER_STAGE', payload: nextStage })
    if (nextAppView && nextAppView !== state.app_view) dispatch({ type: 'SET_APP_VIEW', payload: nextAppView })

    // ── STEP 2: Show fallback after a brief "thinking" delay ─────────────────
    // Small delay makes it feel considered, not instant/robotic
    await new Promise(r => setTimeout(r, 400))

    let finalText = fallback.text

    // ── STEP 3: Try Gemini in parallel — silently enhance if it works ─────────
    try {
      const { apiChat } = await import('../services/api.js')
      const { getFallbackResponse: _unused, ...rest } = await import('../utils/fallbackEngine.js')
      void _unused // suppress unused import warning

      const systemPrompt = `You are ElectionAssist, a helpful election assistant.
User Stage: ${state.user_stage}. First time voter: ${state.first_time_voter}. Location: ${state.location || 'Unknown'}.
Keep responses SHORT (under 120 words), step-by-step, and friendly.
Always start contextual answers with "Based on your current step..."
Return ONLY valid JSON: {"text":"...","extracted_intent":"...","extracted_location":null,"is_first_time":null}`

      const aiRes = await Promise.race([
        apiChat(textToSend, systemPrompt),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
      ])

      if (aiRes?.text && !aiRes?.error && aiRes.text.length > 20) {
        finalText = aiRes.text
        // Apply AI-provided location/first-time if available
        if (aiRes.extracted_location) dispatch({ type: 'SET_LOCATION', payload: aiRes.extracted_location })
        if (aiRes.is_first_time) dispatch({ type: 'SET_FIRST_TIME_VOTER', payload: true })
      }
    } catch {
      // Gemini unavailable — fallback already ready, silently continue
    }

    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'assistant', text: finalText } })
    setIsTyping(false)
    speakText(finalText, state.user_language)
  }, [input, isTyping, state, dispatch])

  const handleMicClick = () => {
    if (isListening) return
    setIsListening(true)
    startSpeechRecognition(
      state.user_language,
      (transcript) => { setIsListening(false); handleSend(transcript) },
      () => { setIsListening(false) }
    )
  }

  return (
    <div className="glass-panel fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Readiness Banner */}
      {readinessPct > 0 && (
        <div style={{
          padding: '0.45rem 1.25rem',
          background: readinessPct === 100 ? 'rgba(34,197,94,0.18)' : 'rgba(79,70,229,0.18)',
          borderBottom: `1px solid ${readinessPct === 100 ? 'var(--accent-color)' : 'var(--primary-color)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '0.8rem', fontWeight: 700,
          color: readinessPct === 100 ? 'var(--accent-color)' : 'var(--primary-color)',
        }}>
          <span>🎯 Voting Readiness</span>
          <span>{readinessPct === 100 ? '✅ Ready to vote!' : `${readinessPct}% — check your checklist`}</span>
        </div>
      )}

      {/* Messages */}
      <div className="scrollable" style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

        {state.messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {state.user_profile ? `Hi ${state.user_profile.name.split(' ')[0]}!` : 'Hello!'}
            </p>
            <p style={{ fontSize: '0.9rem', maxWidth: '280px', lineHeight: 1.6 }}>
              I'm your Election Assistant. Ask me anything about voting, or tap a quick action below.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1.5rem', maxWidth: '300px', margin: '1.5rem auto 0' }}>
              {[
                { emoji: '🗳️', label: "I'm a first-time voter",   q: "I'm a first-time voter" },
                { emoji: '📍', label: 'Find my polling booth',     q: 'Find polling booth near me' },
                { emoji: '📋', label: 'What documents do I need?', q: 'What documents do I need to vote?' },
              ].map(item => (
                <button key={item.q} onClick={() => handleSend(item.q)} style={{
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                  padding: '0.75rem 1rem', borderRadius: 'var(--radius-xl)',
                  color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem',
                  textAlign: 'left', transition: 'all 0.2s ease',
                }}>
                  <span>{item.emoji}</span> {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.messages.map((msg, idx) => (
          <div key={idx} className="message-fade-in" style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
            <div style={{
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))'
                : 'var(--card-bg)',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              padding: '0.85rem 1.1rem',
              borderRadius: msg.role === 'user' ? '1.2rem 1.2rem 0.25rem 1.2rem' : '1.2rem 1.2rem 1.2rem 0.25rem',
              border: msg.role === 'assistant' ? '1px solid var(--card-border)' : 'none',
              boxShadow: 'var(--shadow-sm)',
              fontSize: state.simple_mode ? '1.1rem' : '1rem',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.text}
            </div>
            {msg.role === 'assistant' && (
              <button onClick={() => speakText(msg.text, state.user_language)} aria-label="Listen to response"
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.25rem' }}>
                <Volume2 size={13} /> Listen
              </button>
            )}
          </div>
        ))}

        {isTyping && <ThinkingDots />}
        <div ref={messagesEndRef} />
      </div>

      {/* Chip Row */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: '0.45rem', padding: '0.5rem 1rem', overflowX: 'auto', borderTop: '1px solid var(--card-border)', whiteSpace: 'nowrap' }}>
        {CHIPS.map(chip => (
          <button key={chip.label}
            onClick={() => chip.action ? dispatch({ type: 'SET_APP_VIEW', payload: chip.action }) : handleSend(chip.query)}
            style={{
              background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.25)',
              color: 'var(--text-primary)', padding: '0.38rem 0.85rem',
              borderRadius: 'var(--radius-xl)', fontSize: '0.78rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0,
            }}>
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '0.6rem', alignItems: 'center', background: 'rgba(0,0,0,0.04)' }}>
        <button onClick={handleMicClick} aria-label={isListening ? 'Stop listening' : 'Start voice input'} style={{
          width: '46px', height: '46px', borderRadius: '50%',
          background: isListening ? 'var(--danger-color)' : 'var(--card-bg)',
          color: isListening ? 'white' : 'var(--text-primary)',
          border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease',
          animation: isListening ? 'pulse 1.5s infinite' : 'none',
        }}>
          <Mic size={20} />
        </button>

        <input type="text" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !isTyping && handleSend()}
          placeholder={isListening ? '🎙️ Listening…' : 'Ask anything about voting…'}
          disabled={isTyping}
          style={{
            flex: 1, padding: '0.75rem 1.1rem', borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--card-border)', background: 'var(--card-bg)',
            color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem',
          }}
        />

        <button onClick={() => handleSend()} disabled={isTyping || !input.trim()} aria-label="Send message" style={{
          width: '46px', height: '46px', borderRadius: '50%',
          background: isTyping || !input.trim() ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
          color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isTyping || !input.trim() ? 'not-allowed' : 'pointer',
          flexShrink: 0, transition: 'all 0.25s ease',
          boxShadow: isTyping || !input.trim() ? 'none' : '0 4px 14px rgba(79,70,229,0.4)',
        }}>
          <Send size={19} />
        </button>
      </div>

      <style>{`
        .message-fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  )
}
