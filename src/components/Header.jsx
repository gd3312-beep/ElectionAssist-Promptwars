import React from 'react'
import { useAppContext } from '../context/AppContext'
import { Globe, Accessibility, Languages } from 'lucide-react'

export default function Header() {
  const { state, dispatch } = useAppContext()

  const toggleAccessibility = () => {
    dispatch({ type: 'TOGGLE_ACCESSIBILITY' })
  }

  const toggleLanguage = () => {
    const currentLang = state.user_language.startsWith('en') ? 'hi-IN' : 'en-US'
    dispatch({ type: 'SET_LANGUAGE', payload: currentLang })
  }

  const toggleSimpleMode = () => {
    dispatch({ type: 'SET_SIMPLE_MODE', payload: !state.simple_mode })
  }

  const handleLogout = () => {
    dispatch({ type: 'SET_USER_PROFILE', payload: null })
    dispatch({ type: 'SET_APP_VIEW', payload: 'landing' })
  }

  return (
    <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => dispatch({ type: 'SET_APP_VIEW', payload: 'landing' })}>
          <Globe color="var(--primary-color)" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)', fontWeight: 800 }}>ElectionAssist</h1>
        </div>
        
        {/* Context Visibility Badge */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'rgba(0,0,0,0.05)', 
          padding: '0.4rem 0.8rem', 
          borderRadius: 'var(--radius-xl)', 
          fontSize: '0.8rem',
          border: '1px solid var(--card-border)',
          fontWeight: 600
        }}>
          {state.user_stage === 'learning' && <span>📖 Learning Phase</span>}
          {state.user_stage === 'registered' && <span style={{ color: 'var(--accent-color)' }}>✅ Registered Voter</span>}
          {state.user_stage === 'at_polling_station' && <span style={{ color: 'var(--primary-color)' }}>📍 At Polling Booth</span>}
          {state.user_stage === 'voting' && <span style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger-color)', animation: 'pulse 1.5s infinite' }} />
            Currently Voting
          </span>}
          {state.user_stage === 'completed' && <span>🎉 Voting Completed</span>}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button onClick={toggleSimpleMode} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--card-border)', background: state.simple_mode ? 'var(--accent-color)' : 'var(--card-bg)', color: state.simple_mode ? 'white' : 'var(--text-primary)' }}>
          Simple Mode
        </button>

        <button onClick={toggleLanguage} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
          <Languages size={18} />
          {state.user_language.startsWith('en') ? 'English' : 'Local'}
        </button>

        <button onClick={toggleAccessibility} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--card-border)', background: state.accessibility_mode ? 'var(--primary-color)' : 'var(--card-bg)', color: state.accessibility_mode ? 'white' : 'var(--text-primary)' }}>
          <Accessibility size={18} />
          A11y
        </button>

        {state.user_profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem', paddingLeft: '1rem', borderLeft: '1px solid var(--card-border)' }}>
            <img src={state.user_profile.picture} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{state.user_profile.name.split(' ')[0]}</span>
            <button onClick={handleLogout} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)' }}>Exit</button>
          </div>
        )}
      </div>
    </header>
  )
}
