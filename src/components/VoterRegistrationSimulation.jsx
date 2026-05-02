import React, { useState } from 'react'
import { CheckCircle, Upload, ArrowRight, User, MapPin } from 'lucide-react'

export default function VoterRegistrationSimulation({ onExit }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ name: '', dob: '', address: '' })

  const nextStep = () => setStep(s => s + 1)

  return (
    <div className="glass-panel fade-in" style={{ padding: '2.5rem', maxWidth: '500px', margin: 'auto', textAlign: 'center' }}>
      {step === 1 && (
        <div className="fade-in">
          <h2 style={{ color: 'var(--primary-color)' }}>Step 1: Basic Details</h2>
          <p style={{ color: 'var(--text-secondary)' }}>This is a simulated application process.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input 
              type="text" placeholder="Full Name" 
              style={inputStyle} 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <input 
              type="date" placeholder="Date of Birth" 
              style={inputStyle}
              value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}
            />
            <button onClick={nextStep} className="action-btn" style={btnStyle}>Next <ArrowRight size={18} /></button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in">
          <h2 style={{ color: 'var(--primary-color)' }}>Step 2: Upload Identity Proof</h2>
          <div style={{ 
            border: '2px dashed var(--card-border)', 
            padding: '3rem', 
            borderRadius: 'var(--radius-lg)',
            margin: '1.5rem 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--text-secondary)'
          }}>
            <Upload size={48} />
            <span>Select file or take a photo</span>
          </div>
          <button onClick={nextStep} className="action-btn" style={btnStyle}>Upload & Submit</button>
        </div>
      )}

      {step === 3 && (
        <div className="fade-in">
          <div style={{ marginBottom: '1.5rem' }}>
            <CheckCircle size={64} color="var(--accent-color)" style={{ margin: '0 auto' }} />
          </div>
          <h2 style={{ color: 'var(--accent-color)' }}>Application Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Thank you, {formData.name}. Your application for a Voter ID has been successfully simulated. 
            In a real scenario, this would be reviewed by election officials.
          </p>
          <button onClick={onExit} className="action-btn" style={{ ...btnStyle, background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>Return to Assistant</button>
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--card-border)',
  background: 'var(--card-bg)',
  color: 'var(--text-primary)',
  outline: 'none'
}

const btnStyle = {
  width: '100%',
  padding: '1rem',
  borderRadius: 'var(--radius-xl)',
  background: 'var(--primary-color)',
  color: 'white',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  marginTop: '1rem'
}
