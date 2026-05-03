import React, { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { generateChatResponse } from '../services/gemini'
import { processContext } from '../utils/contextEngine'
import { checkMisinformation } from '../utils/misinformationHelper'
import { speakText, startSpeechRecognition } from '../utils/speechHelper'
import { Send, Mic, Volume2, Loader } from 'lucide-react'

const CHIPS = [
  { label: '🚀 What next?',       query: 'What should I do next?' },
  { label: '📍 Find booth',       query: 'Find polling booth near me' },
  { label: '📄 Documents needed', query: 'What documents do I need?' },
  { label: '🗳️ How to vote',      query: 'How does the voting process work?' },
  { label: '✏️ Apply Voter ID',   action: 'registration' },
]

export default function Chat() {
  const { state, dispatch } = useAppContext()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)

  // Compute readiness from checklist keys matching new ids
  const checkItems = ['id_proof', 'voter_id', 'address_proof']
  const completedCount = checkItems.filter(id => state.checklist_status[id]).length
  const readinessPct = Math.round((completedCount / checkItems.length) * 100)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages, isTyping])

  const handleSend = async (textOverride) => {
    const textToSend = textOverride || input
    if (!textToSend.trim()) return
    setInput('')

    const warning = checkMisinformation(textToSend)
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', text: textToSend } })
    if (warning) {
      dispatch({ type: 'ADD_MESSAGE', payload: { role: 'assistant', text: warning, isWarning: true } })
    }

    setIsTyping(true)
    try {
      const response = await generateChatResponse(textToSend, state)
      const { nextPanel, nextStage, nextAppView } = processContext(response.extracted_intent || '', state, textToSend)

      // Apply context changes
      if (nextStage && nextStage !== state.user_stage) dispatch({ type: 'SET_USER_STAGE', payload: nextStage })
      if (nextPanel && nextPanel !== state.active_panel) dispatch({ type: 'SET_ACTIVE_PANEL', payload: nextPanel })
      if (nextAppView && nextAppView !== state.app_view) dispatch({ type: 'SET_APP_VIEW', payload: nextAppView })
      if (response.extracted_location) dispatch({ type: 'SET_LOCATION', payload: response.extracted_location })
      
      if (response.is_first_time) {
        dispatch({ type: 'SET_FIRST_TIME_VOTER', payload: true })
        dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'checklist' })
      }

      dispatch({ type: 'ADD_MESSAGE', payload: { 
        role: 'assistant', 
        text: response.text, 
        isFallback: response.isFallback 
      } })
      
      setIsTyping(false)
      speakText(response.text, state.user_language)
    } catch (error) {
      setIsTyping(false)
      dispatch({ type: 'ADD_MESSAGE', payload: { 
        role: 'assistant', 
        text: "AI is temporarily unavailable. I’ll guide you using built-in assistance.\n\n👉 Based on your current step, I recommend checking the Voting Journey panel for next steps.",
        isWarning: true 
      } })
    }
  }

  const handleMicClick = () => {
    if (isListening) return
    setIsListening(true)
    startSpeechRecognition(
      state.user_language,
      (transcript) => { setInput(transcript); setIsListening(false); handleSend(transcript) },
      (error) => { console.error('Speech Error:', error); setIsListening(false) }
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: readinessPct === 100 ? 'var(--accent-color)' : 'var(--primary-color)',
        }}>
          <span>🎯 Voting Readiness</span>
          <span>{readinessPct === 100 ? '✅ Ready to vote!' : `${readinessPct}% — check your checklist`}</span>
        </div>
      )}

      {/* Messages */}
      <div
        className="scrollable"
        style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
      >
        {state.messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {state.user_profile ? `Hi ${state.user_profile.name.split(' ')[0]}!` : 'Hello!'}
            </p>
            <p style={{ fontSize: '0.9rem', maxWidth: '280px', lineHeight: 1.6 }}>
              I&apos;m your Election Assistant. Ask me anything about voting, or tap a quick action below.
            </p>

            {/* Empty-state quick actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1.5rem', maxWidth: '300px', margin: '1.5rem auto 0' }}>
              {[
                { emoji: '🗳️', label: "I'm a first-time voter",  q: "I'm a first-time voter" },
                { emoji: '📍', label: 'Find my polling booth',    q: 'Where is my polling booth?' },
                { emoji: '📋', label: 'What documents do I need?', q: 'What documents do I need to vote?' },
              ].map(item => (
                <button
                  key={item.q}
                  onClick={() => handleSend(item.q)}
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-xl)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
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
                : msg.isWarning ? 'rgba(239,68,68,0.15)' : 'var(--card-bg)',
              color: msg.role === 'user' ? 'white' : msg.isWarning ? 'var(--danger-color)' : 'var(--text-primary)',
              padding: '0.85rem 1.1rem',
              borderRadius: msg.role === 'user' ? '1.2rem 1.2rem 0.25rem 1.2rem' : '1.2rem 1.2rem 1.2rem 0.25rem',
              border: msg.role === 'assistant' && !msg.isWarning ? '1px solid var(--card-border)' : msg.isWarning ? '1px solid rgba(239,68,68,0.3)' : 'none',
              boxShadow: 'var(--shadow-sm)',
              fontSize: state.simple_mode ? '1.1rem' : '1rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.text}
            </div>
            {msg.role === 'assistant' && !msg.isWarning && (
              <button
                onClick={() => speakText(msg.text, state.user_language)}
                aria-label="Listen to response"
                style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.25rem' }}
              >
                <Volume2 size={13} /> Listen
              </button>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Loader size={15} className="spin" />
            <span>Thinking…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chip Row */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: '0.45rem', padding: '0.5rem 1rem', overflowX: 'auto', borderTop: '1px solid var(--card-border)', whiteSpace: 'nowrap' }}>
        {CHIPS.map(chip => (
          <button
            key={chip.label}
            onClick={() => chip.action
              ? dispatch({ type: 'SET_APP_VIEW', payload: chip.action })
              : handleSend(chip.query)
            }
            style={{
              background: 'rgba(79,70,229,0.08)',
              border: '1px solid rgba(79,70,229,0.25)',
              color: 'var(--text-primary)',
              padding: '0.38rem 0.85rem',
              borderRadius: 'var(--radius-xl)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '0.6rem', alignItems: 'center', background: 'rgba(0,0,0,0.04)' }}>
        {/* Mic */}
        <button
          onClick={handleMicClick}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          style={{
            width: '46px', height: '46px',
            borderRadius: '50%',
            background: isListening ? 'var(--danger-color)' : 'var(--card-bg)',
            color: isListening ? 'white' : 'var(--text-primary)',
            border: '1px solid var(--card-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            animation: isListening ? 'pulse 1.5s infinite' : 'none',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          <Mic size={20} />
        </button>

        {/* Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? '🎙️ Listening…' : 'Describe your situation…'}
          disabled={isTyping}
          style={{
            flex: 1,
            padding: '0.75rem 1.1rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontSize: '0.95rem',
          }}
        />

        {/* Send */}
        <button
          onClick={() => handleSend()}
          disabled={isTyping || !input.trim()}
          aria-label="Send message"
          style={{
            width: '46px', height: '46px',
            borderRadius: '50%',
            background: isTyping || !input.trim() ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
            color: 'white',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isTyping || !input.trim() ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            transition: 'all 0.25s ease',
            boxShadow: isTyping || !input.trim() ? 'none' : '0 4px 14px rgba(79,70,229,0.4)',
          }}
        >
          <Send size={19} />
        </button>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .message-fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
