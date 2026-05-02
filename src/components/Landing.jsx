import React, { useEffect, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { Mic, Compass, MapPin } from 'lucide-react'

export default function Landing() {
  const { state, dispatch } = useAppContext()
  const googleButtonRef = useRef(null)

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456789-placeholder.apps.googleusercontent.com',
        callback: handleCredentialResponse,
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline', size: 'large', shape: 'pill',
      })
    }
  }, [])

  const handleCredentialResponse = (response) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      dispatch({ type: 'SET_USER_PROFILE', payload: { name: payload.name, picture: payload.picture, email: payload.email } })
      dispatch({ type: 'SET_APP_VIEW', payload: 'chat' })
    } catch (e) {
      console.error('Failed to decode Google JWT', e)
    }
  }

  const startChat = () => dispatch({ type: 'SET_APP_VIEW', payload: 'chat' })

  return (
    <div
      className="glass-panel fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        gap: '2rem',
      }}
    >
      {/* Hero */}
      <div>
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🗳️</div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          margin: '0 0 0.75rem 0',
          background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1,
        }}>
          ElectionAssist
        </h1>
        <p style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
          color: 'var(--text-secondary)',
          maxWidth: '480px',
          lineHeight: 1.6,
        }}>
          Your calm, guided voting companion.<br />
          <strong style={{ color: 'var(--text-primary)' }}>Voice‑first · Step‑by‑step · All languages.</strong>
        </p>
      </div>

      {/* Google Sign In */}
      {!state.user_profile && (
        <div ref={googleButtonRef} style={{ minHeight: '44px' }} />
      )}

      {/* Voice CTA */}
      <div style={{
        background: 'rgba(79,70,229,0.08)',
        border: '1px solid rgba(79,70,229,0.35)',
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          🎙️ Tap the mic & describe your situation
        </p>
        <button
          onClick={startChat}
          aria-label="Start voice entry"
          className="action-btn"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 32px rgba(79,70,229,0.5)',
            animation: 'pulse-glow 2.5s infinite',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Mic size={36} />
        </button>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Or type your question below
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '420px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={startChat}
          className="action-btn"
          style={bigQuickBtn}
          aria-label="Start chat as guest"
        >
          {state.user_profile ? `👋 Continue as ${state.user_profile.name.split(' ')[0]}` : '💬 Start as Guest'}
        </button>

        <button
          onClick={() => dispatch({ type: 'SET_APP_VIEW', payload: 'guided' })}
          className="action-btn"
          style={{ ...quickBtn }}
          aria-label="Start Guided Mode"
        >
          <Compass size={18} /> Guided Mode
        </button>

        <button
          onClick={() => {
            dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'map' })
            startChat()
          }}
          className="action-btn"
          style={{ ...quickBtn }}
          aria-label="Find polling booth"
        >
          <MapPin size={18} /> Find Booth
        </button>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%   { box-shadow: 0 0 0 0   rgba(79,70,229,0.55); }
          70%  { box-shadow: 0 0 0 18px rgba(79,70,229,0);   }
          100% { box-shadow: 0 0 0 0   rgba(79,70,229,0);    }
        }
      `}</style>
    </div>
  )
}

const bigQuickBtn = {
  width: '100%',
  padding: '1rem',
  borderRadius: 'var(--radius-xl)',
  background: 'var(--primary-color)',
  color: 'white',
  fontSize: '1.05rem',
  fontWeight: 700,
  cursor: 'pointer',
  border: 'none',
}

const quickBtn = {
  flex: 1,
  padding: '0.75rem',
  borderRadius: 'var(--radius-lg)',
  background: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  color: 'var(--text-primary)',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  justifyContent: 'center',
}
