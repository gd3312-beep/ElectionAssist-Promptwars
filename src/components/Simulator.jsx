import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { Fingerprint, CheckSquare, Send } from 'lucide-react'

export default function Simulator() {
  const { state, dispatch } = useAppContext()
  const [step, setStep] = useState(1) // 1: ID Verification, 2: Ballot, 3: Confirmation
  
  const handleNext = () => {
    if (step < 3) setStep(step + 1)
    if (step === 2) {
       // Just simulated voting
       dispatch({ type: 'SET_USER_STAGE', payload: 'completed' })
    }
  }

  return (
    <div className="glass-panel scrollable" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ margin: '0 0 1.5rem 0' }}>Voting Simulator</h2>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, height: '6px', background: s <= step ? 'var(--primary-color)' : 'var(--card-border)', borderRadius: '3px' }}></div>
        ))}
      </div>

      {step === 1 && (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <Fingerprint size={64} color="var(--primary-color)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>Step 1: ID Verification</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Present your valid photo ID to the election official.</p>
          <button onClick={handleNext} style={{ background: 'var(--primary-color)', color: 'white', padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 500 }}>
            Simulate Verification
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ padding: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
             <CheckSquare size={28} color="var(--primary-color)" />
             <h3 style={{ margin: 0 }}>Step 2: Cast Your Ballot</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Select your preferred candidates on the machine or paper ballot.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <input type="radio" name="candidate" style={{ transform: 'scale(1.5)' }} />
              <div>
                <strong style={{ display: 'block' }}>Candidate A</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Party X</span>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <input type="radio" name="candidate" style={{ transform: 'scale(1.5)' }} />
              <div>
                <strong style={{ display: 'block' }}>Candidate B</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Party Y</span>
              </div>
            </label>
          </div>

          <button onClick={handleNext} style={{ background: 'var(--primary-color)', color: 'white', padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 500, width: '100%', marginTop: '2rem' }}>
            Submit Ballot
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <Send size={64} color="var(--accent-color)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: 'var(--accent-color)' }}>Vote Cast Successfully!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Thank you for participating in democracy. Your stage is now "completed".</p>
          <button onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'timeline' })} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', fontSize: '1rem' }}>
            Return to Timeline
          </button>
        </div>
      )}

    </div>
  )
}
