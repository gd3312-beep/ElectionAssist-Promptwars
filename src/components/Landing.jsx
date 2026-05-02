import React, { useEffect, useRef } from 'react'
import { useAppContext } from '../context/AppContext'

export default function Landing() {
  const { state, dispatch } = useAppContext()
  const googleButtonRef = useRef(null)

  useEffect(() => {
    // Initialize Google Sign-In if available
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456789-placeholder.apps.googleusercontent.com',
        callback: handleCredentialResponse
      });
      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        { theme: 'outline', size: 'large', shape: 'pill' }
      );
    }
  }, []);

  const handleCredentialResponse = (response) => {
    // Decode JWT token (basic client side decode for UI purposes only)
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      dispatch({ 
        type: 'SET_USER_PROFILE', 
        payload: { name: payload.name, picture: payload.picture, email: payload.email } 
      });
      // Auto-start chat
      dispatch({ type: 'SET_APP_VIEW', payload: 'chat' });
    } catch (e) {
      console.error("Failed to decode Google JWT", e);
    }
  }

  return (
    <div className="glass-panel fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100%', 
      padding: '3rem', 
      textAlign: 'center',
      gap: '2rem'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', background: 'linear-gradient(to right, var(--primary-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ElectionAssist 2.0
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
          Your intelligent, context-aware civic guide. Navigate the election process with step-by-step assistance, voice interactions, and multilingual support.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
        
        {/* Google Sign In */}
        {!state.user_profile && (
          <div ref={googleButtonRef} style={{ minHeight: '40px' }}></div>
        )}

        <button 
          onClick={() => dispatch({ type: 'SET_APP_VIEW', payload: 'chat' })}
          className="action-btn"
          style={{ 
            width: '100%', 
            padding: '1rem', 
            borderRadius: 'var(--radius-xl)', 
            background: 'var(--primary-color)', 
            color: 'white', 
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}
        >
          {state.user_profile ? `Continue as ${state.user_profile.name.split(' ')[0]}` : 'Skip & Continue as Guest'}
        </button>

        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
          <button 
            onClick={() => {
               dispatch({ type: 'SET_APP_VIEW', payload: 'guided' })
            }}
            className="action-btn"
            style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-lg)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', transition: 'all 0.2s ease' }}
          >
            🧭 Guided Mode
          </button>
          <button 
            onClick={() => {
              dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'map' })
              dispatch({ type: 'SET_APP_VIEW', payload: 'chat' })
            }}
            className="action-btn"
            style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-lg)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', transition: 'all 0.2s ease' }}
          >
            📍 Find Booth
          </button>
        </div>
      </div>
    </div>
  )
}
