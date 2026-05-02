import React from 'react'
import { useAppContext } from '../context/AppContext'
import { Globe, Accessibility, Languages, BookOpen } from 'lucide-react'

export default function Header() {
  const { state, dispatch } = useAppContext()

  const toggleLanguage = () => {
    const currentLang = state.user_language.startsWith('en') ? 'hi-IN' : 'en-US'
    dispatch({ type: 'SET_LANGUAGE', payload: currentLang })
  }

  const toggleSimpleMode = () => {
    dispatch({ type: 'SET_SIMPLE_MODE', payload: !state.simple_mode })
  }

  const toggleAccessibility = () => {
    dispatch({ type: 'TOGGLE_ACCESSIBILITY' })
  }

  const handleLogout = () => {
    dispatch({ type: 'SET_USER_PROFILE', payload: null })
    dispatch({ type: 'SET_APP_VIEW', payload: 'landing' })
  }

  const stageConfig = {
    learning:          { label: 'Learning',    color: 'var(--text-secondary)',  dot: '#94a3b8', pulse: false },
    registered:        { label: 'Prepared',    color: 'var(--pending-color)',   dot: '#F59E0B', pulse: false },
    at_polling_station:{ label: 'At Booth',    color: 'var(--primary-color)',   dot: '#4F46E5', pulse: true  },
    voting:            { label: 'Voting Now',  color: 'var(--danger-color)',    dot: '#ef4444', pulse: true  },
    completed:         { label: 'Done! 🎉',    color: 'var(--accent-color)',    dot: '#22C55E', pulse: false },
  }
  const stage = stageConfig[state.user_stage] || stageConfig.learning

  const iconBtn = (onClick, icon, label, active = false) => (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.45rem 0.85rem',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--card-border)',
        background: active ? 'var(--primary-color)' : 'var(--card-bg)',
        color: active ? 'white' : 'var(--text-primary)',
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <header
      className="glass-panel"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.85rem 1.75rem',
        margin: '1rem 1rem 0 1rem',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      {/* LEFT: Brand + Stage Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
          onClick={() => dispatch({ type: 'SET_APP_VIEW', payload: 'landing' })}
        >
          <Globe color="var(--primary-color)" size={22} />
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '-0.5px' }}>
            ElectionAssist
          </span>
        </div>

        {/* Stage Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(0,0,0,0.15)',
          padding: '0.3rem 0.8rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--card-border)',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: stage.color,
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: stage.dot,
            animation: stage.pulse ? 'pulse 1.5s infinite' : 'none',
          }} />
          {stage.label}
        </div>
      </div>

      {/* RIGHT: Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {iconBtn(toggleSimpleMode, <BookOpen size={15} />, 'Easy Mode', state.simple_mode)}
        {iconBtn(toggleLanguage, <Languages size={15} />, state.user_language.startsWith('en') ? 'EN' : 'हि')}
        {iconBtn(toggleAccessibility, <Accessibility size={15} />, 'A11y', state.accessibility_mode)}

        {state.user_profile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginLeft: '0.25rem', paddingLeft: '0.75rem',
            borderLeft: '1px solid var(--card-border)',
          }}>
            <img src={state.user_profile.picture} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{state.user_profile.name.split(' ')[0]}</span>
            <button
              onClick={handleLogout}
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.15)', color: 'var(--danger-color)', cursor: 'pointer', border: 'none' }}
            >Exit</button>
          </div>
        )}
      </div>
    </header>
  )
}
