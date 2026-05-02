import React, { useState } from 'react'
import { CheckCircle, Upload, ArrowRight, Loader } from 'lucide-react'
import { apiApplyVoterId } from '../services/api'

export default function VoterRegistrationSimulation({ onExit }) {
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [appId, setAppId]     = useState(null)
  const [formData, setFormData] = useState({ name: '', dob: '' })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await apiApplyVoterId(formData)
      setAppId(res.applicationId)
      localStorage.setItem('voterAppId', res.applicationId)
    } catch {
      setAppId('LOCAL-DEMO')
    }
    setLoading(false)
    setStep(3)
  }

  return (
    <div className="glass-panel fade-in" style={{ padding: '2.5rem', maxWidth: '500px', margin: 'auto', textAlign: 'center' }}>
      {step === 1 && (
        <div className="fade-in">
          <h2 style={{ color: 'var(--primary-color)' }}>Step 1: Basic Details</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            🔒 Simulated process — no real data is stored permanently.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input
              type="text" placeholder="Full Name"
              style={inputStyle}
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="date"
              style={inputStyle}
              value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })}
            />
            <button
              onClick={() => setStep(2)}
              disabled={!formData.name}
              className="action-btn"
              style={btnStyle}
            >
              Next <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in">
          <h2 style={{ color: 'var(--primary-color)' }}>Step 2: Upload Identity Proof</h2>
          <div style={{ border: '2px dashed var(--card-border)', padding: '3rem', borderRadius: 'var(--radius-lg)', margin: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <Upload size={48} />
            <span>Select file or take a photo</span>
            <span style={{ fontSize: '0.75rem' }}>(Simulated — no upload required)</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="action-btn"
            style={btnStyle}
          >
            {loading ? <><Loader size={18} className="spin" /> Submitting…</> : 'Submit Application'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="fade-in">
          <CheckCircle size={64} color="var(--accent-color)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--accent-color)' }}>Application Submitted!</h2>
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid var(--accent-color)', borderRadius: 'var(--radius-xl)', padding: '1rem', margin: '1rem 0' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Application ID</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-color)', letterSpacing: '1px' }}>{appId}</div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Status: <strong style={{ color: 'var(--pending-color)' }}>⏳ Processing</strong> — will auto-approve in ~45 sec (demo)
          </p>
          <button onClick={onExit} className="action-btn" style={{ ...btnStyle, background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>
            Return to Assistant
          </button>
        </div>
      )}

      <style>{`.spin{animation:spin 1s linear infinite;}@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--card-border)',
  background: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none',
}
const btnStyle = {
  width: '100%', padding: '1rem',
  borderRadius: 'var(--radius-xl)',
  background: 'var(--primary-color)', color: 'white',
  fontWeight: 'bold', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', border: 'none', cursor: 'pointer',
}
