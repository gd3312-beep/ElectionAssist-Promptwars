import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { Mic, Compass, MapPin, UserPlus, LogIn } from 'lucide-react'
import SignUp from './SignUp'

export default function Landing() {
  const { state, dispatch } = useAppContext()
  const googleButtonRef = useRef(null)
  const [showSignUp, setShowSignUp] = useState(false)

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
      dispatch({ type: 'SET_USER_PROFILE', payload: { name: payload.name, picture: payload.picture, email: payload.email, authType: 'google' } })
      dispatch({ type: 'SET_APP_VIEW', payload: 'chat' })
    } catch (e) {
      console.error('Failed to decode Google JWT', e)
    }
  }

  const startChat = () => dispatch({ type: 'SET_APP_VIEW', payload: 'chat' })

  // If user chose sign-up form, render it inline
  if (showSignUp) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', justifyContent: 'center' }}>
        <SignUp onBack={() => setShowSignUp(false)} />
      </div>
    )
  }

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
        gap: '1.75rem',
        overflowY: 'auto',
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
        <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.6 }}>
          Your calm, guided voting companion.<br />
          <strong style={{ color: 'var(--text-primary)' }}>Voice‑first · Step‑by‑step · All languages.</strong>
        </p>
      </div>

      {/* Auth Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '380px', alignItems: 'center' }}>
        {/* Sign Up with email/phone */}
        <button
          onClick={() => setShowSignUp(true)}
          className="action-btn"
          aria-label="Sign up with email and phone"
          style={{
            width: '100%',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
          }}
        >
          <UserPlus size={20} /> Sign Up with Email / Phone
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
        </div>

        {/* Google Sign In */}
        {!state.user_profile && (
          <div ref={googleButtonRef} style={{ minHeight: '44px' }} />
        )}

        {/* Guest */}
        <button
          onClick={startChat}
          aria-label="Continue as guest"
          style={{
            background: 'none',
            border: '1px solid var(--card-border)',
            color: 'var(--text-secondary)',
            padding: '0.65rem 1.5rem',
            borderRadius: 'var(--radius-xl)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
          }}
        >
          <LogIn size={16} />
          {state.user_profile ? `Continue as ${state.user_profile.name.split(' ')[0]}` : 'Skip · Continue as Guest'}
        </button>
      </div>

      {/* Voice CTA */}
      <div style={{
        background: 'rgba(79,70,229,0.08)',
        border: '1px solid rgba(79,70,229,0.3)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.85rem',
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          🎙️ Or just tap the mic and speak
        </p>
        <button
          onClick={startChat}
          aria-label="Start voice entry"
          className="action-btn"
          style={{
            width: '70px', height: '70px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse-glow 2.5s infinite',
            boxShadow: '0 0 24px rgba(79,70,229,0.45)',
          }}
        >
          <Mic size={32} />
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '420px' }}>
        <button
          onClick={() => dispatch({ type: 'SET_APP_VIEW', payload: 'guided' })}
          className="action-btn"
          style={quickBtn}
          aria-label="Guided Mode"
        >
          <Compass size={17} /> Guided Mode
        </button>
        <button
          onClick={() => { dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'map' }); startChat() }}
          className="action-btn"
          style={quickBtn}
          aria-label="Find polling booth"
        >
          <MapPin size={17} /> Find Booth
        </button>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%   { box-shadow: 0 0 0 0   rgba(79,70,229,0.55); }
          70%  { box-shadow: 0 0 0 16px rgba(79,70,229,0);   }
          100% { box-shadow: 0 0 0 0   rgba(79,70,229,0);    }
        }
      `}</style>
    </div>
  )
}

const quickBtn = {
  flex: 1,
  minWidth: '140px',
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-lg)',
  background: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  color: 'var(--text-primary)',
  fontWeight: 600,
  fontSize: '0.88rem',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center',
}
