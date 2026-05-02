import React, { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { generateChatResponse } from '../services/gemini'
import { processContext } from '../utils/contextEngine'
import { checkMisinformation } from '../utils/misinformationHelper'
import { speakText, startSpeechRecognition } from '../utils/speechHelper'
import { Send, Mic, Volume2, Loader } from 'lucide-react'

export default function Chat() {
  const { state, dispatch } = useAppContext()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [state.messages, isTyping])

  const handleSend = async (textOverride) => {
    const textToSend = textOverride || input
    if (!textToSend.trim()) return

    // Clear input
    setInput('')

    // 1. Check Misinformation locally
    const warning = checkMisinformation(textToSend)

    // 2. Add user message
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', text: textToSend } })
    
    if (warning) {
      dispatch({ type: 'ADD_MESSAGE', payload: { role: 'assistant', text: warning, isWarning: true } })
    }

    setIsTyping(true)
    try {
      // 3. Call Gemini
      const response = await generateChatResponse(textToSend, state)
      
      // 4. Update Context Engine
      const { nextPanel, nextStage, nextAppView } = processContext(response.extracted_intent || '', state, textToSend)

      dispatch({ type: 'SET_USER_STAGE', payload: nextStage })
      if (nextPanel) {
        dispatch({ type: 'SET_ACTIVE_PANEL', payload: nextPanel })
      }
      if (nextAppView && nextAppView !== state.app_view) {
        dispatch({ type: 'SET_APP_VIEW', payload: nextAppView })
      }
      if (response.extracted_location) {
        dispatch({ type: 'SET_LOCATION', payload: response.extracted_location })
      }
      if (response.is_first_time) {
         dispatch({ type: 'SET_FIRST_TIME_VOTER', payload: true })
         dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'checklist' })
      }

      // 5. Add assistant response
      dispatch({ type: 'ADD_MESSAGE', payload: { role: 'assistant', text: response.text } })
      setIsTyping(false)
      
      // Auto-read response if speech was recently used
      speakText(response.text, state.user_language)
    } catch (error) {
      console.error("Gemini Error:", error)
      dispatch({ type: 'ADD_MESSAGE', payload: { role: 'assistant', text: "I'm having trouble connecting right now. Please try again in a moment.", isWarning: true } })
      setIsTyping(false)
    }
  }

  const handleMicClick = () => {
    if (isListening) return;
    setIsListening(true)
    startSpeechRecognition(
      state.user_language,
      (transcript) => {
        setInput(transcript)
        setIsListening(false)
        handleSend(transcript) // auto send after recognizing
      },
      (error) => {
        console.error("Speech Error:", error)
        setIsListening(false)
      }
    )
  }

  return (
    <div className="glass-panel fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Messages Area */}
      <div className="scrollable" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {state.messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 'auto', marginBottom: 'auto' }}>
            <p>Hello! I am your Election Assistant.</p>
            <p>How can I help you participate in the upcoming election?</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
              <button onClick={() => handleSend("I'm a first-time voter")} style={quickBtnStyle}>First-time voter</button>
              <button onClick={() => handleSend("Where is my polling booth?")} style={quickBtnStyle}>Find polling booth</button>
              <button onClick={() => handleSend("What are the voting steps?")} style={quickBtnStyle}>Voting steps</button>
            </div>
          </div>
        )}

        {state.messages.map((msg, idx) => (
          <div key={idx} className="message-fade-in" style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{ 
              background: msg.role === 'user' ? 'var(--primary-color)' : (msg.isWarning ? 'var(--danger-color)' : 'var(--card-bg)'),
              color: msg.role === 'user' ? 'white' : (msg.isWarning ? 'white' : 'var(--text-primary)'),
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              border: msg.role === 'assistant' && !msg.isWarning ? '1px solid var(--card-border)' : 'none',
              boxShadow: 'var(--shadow-sm)',
              fontSize: '1.05rem',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
            {msg.role === 'assistant' && !msg.isWarning && (
              <button onClick={() => speakText(msg.text, state.user_language)} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Volume2 size={14} /> Listen
              </button>
            )}
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Loader size={16} className="spin" /> Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.02)' }}>
        <button onClick={handleMicClick} style={{ padding: '0.75rem', borderRadius: '50%', background: isListening ? 'var(--danger-color)' : 'var(--card-bg)', color: isListening ? 'white' : 'var(--text-primary)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: isListening ? 'pulse 1.5s infinite' : 'none' }}>
          <Mic size={20} />
        </button>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe your situation..."
          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none' }}
        />
        <button 
          onClick={() => handleSend()} 
          disabled={isTyping || !input.trim()}
          style={{ 
            padding: '0.75rem', 
            borderRadius: '50%', 
            background: isTyping || !input.trim() ? 'var(--text-secondary)' : 'var(--primary-color)', 
            color: 'white', 
            border: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: isTyping || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Send size={20} />
        </button>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .message-fade-in {
          animation: fadeIn 0.3s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

const quickBtnStyle = {
  background: 'var(--card-bg)',
  border: '1px solid var(--primary-color)',
  color: 'var(--primary-color)',
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius-xl)',
  fontSize: '0.85rem'
}
