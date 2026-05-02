import React from 'react'
import { useAppContext } from '../context/AppContext'

export default function GuidedMode() {
  const { state, dispatch } = useAppContext()

  const steps = [
    { id: 'learning', label: 'Step 1: Preparation', desc: "Learn about your local candidates and ensure you have valid ID (e.g., Driver's License, Passport)." },
    { id: 'registered', label: 'Step 2: Registration', desc: 'Verify your name is on the electoral roll. If not, register online or at your local office.' },
    { id: 'at_polling_station', label: 'Step 3: Polling Booth', desc: 'Arrive at your designated polling station. Hand your ID to the polling officer for verification.' },
    { id: 'voting', label: 'Step 4: Casting Vote', desc: 'Proceed to the voting compartment. Select your candidate on the machine or ballot paper. Do not take photos.' },
    { id: 'completed', label: 'Step 5: Completed', desc: 'You have successfully voted! Follow exit signs and await results.' },
  ]

  const currentIndex = steps.findIndex(s => s.id === state.user_stage)
  const currentStep = steps[currentIndex >= 0 ? currentIndex : 0]

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      dispatch({ type: 'SET_USER_STAGE', payload: steps[currentIndex + 1].id })
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      dispatch({ type: 'SET_USER_STAGE', payload: steps[currentIndex - 1].id })
    }
  }

  const handleExit = () => {
    dispatch({ type: 'SET_APP_VIEW', payload: 'chat' })
  }

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '3rem', position: 'relative', justifyContent: 'center' }}>
      
      <button 
        onClick={handleExit}
        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-xl)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
      >
        ✕ Exit Guided Mode
      </button>

      <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>{currentStep.label}</h2>
        
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-xl)', padding: '2rem', marginBottom: '2rem', boxShadow: 'var(--shadow-lg)' }}>
          <p style={{ fontSize: '1.25rem', lineHeight: '1.6', margin: 0 }}>
            {currentStep.desc}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: currentIndex === 0 ? 'var(--text-secondary)' : 'var(--text-primary)', opacity: currentIndex === 0 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {steps.map((s, idx) => (
              <div key={s.id} style={{ width: '10px', height: '10px', borderRadius: '50%', background: idx === currentIndex ? 'var(--primary-color)' : 'var(--card-border)' }} />
            ))}
          </div>

          <button 
            onClick={currentIndex === steps.length - 1 ? handleExit : handleNext}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--primary-color)', border: 'none', color: 'white', fontWeight: 'bold' }}
          >
            {currentIndex === steps.length - 1 ? 'Finish ✓' : 'Next Step →'}
          </button>
        </div>
      </div>
    </div>
  )
}
