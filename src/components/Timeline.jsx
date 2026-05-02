import React from 'react'
import { useAppContext } from '../context/AppContext'

export default function Timeline() {
  const { state } = useAppContext()

  const phases = [
    { id: 'learning', label: 'Preparation', desc: 'Learn about candidates and rules' },
    { id: 'registered', label: 'Registration', desc: 'Ensure you are on the voter list' },
    { id: 'at_polling_station', label: 'Election Day', desc: 'Arrive at your polling station' },
    { id: 'voting', label: 'Casting Vote', desc: 'Select candidates and submit ballot' },
    { id: 'completed', label: 'Post-Election', desc: 'Track results and governance' },
  ]

  const currentIndex = phases.findIndex(p => p.id === state.user_stage)

  return (
    <div className="glass-panel scrollable" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ margin: '0 0 2rem 0' }}>Election Timeline</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
        {/* Vertical line connector */}
        <div style={{ position: 'absolute', left: '15px', top: '20px', bottom: '20px', width: '2px', background: 'var(--card-border)', zIndex: 0 }}></div>

        {phases.map((phase, index) => {
          const isPast = index < currentIndex
          const isActive = index === currentIndex
          
          let markerBg = 'var(--card-bg)'
          let markerBorder = 'var(--text-secondary)'
          if (isPast) { markerBg = 'var(--accent-color)'; markerBorder = 'var(--accent-color)' }
          if (isActive) { markerBg = 'var(--primary-color)'; markerBorder = 'var(--primary-color)' }

          return (
            <div key={phase.id} style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1, opacity: (isPast || isActive) ? 1 : 0.6 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: markerBg, border: `2px solid ${markerBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
                {isPast ? '✓' : index + 1}
              </div>
              <div style={{ paddingTop: '4px' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', color: isActive ? 'var(--primary-color)' : 'var(--text-primary)' }}>{phase.label}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{phase.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
