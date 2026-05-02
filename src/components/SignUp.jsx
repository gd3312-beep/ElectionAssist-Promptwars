import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { User, Mail, Phone, MapPin, ArrowRight, CheckCircle } from 'lucide-react'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand',
  'West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry',
]

export default function SignUp({ onBack }) {
  const { dispatch } = useAppContext()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', state: '', firstTime: false })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())                  e.name  = 'Please enter your name'
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email = 'Enter a valid email'
    if (!form.phone.match(/^\d{10}$/))      e.phone = '10-digit phone number required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleStep1 = () => {
    if (validate()) setStep(2)
  }

  const handleSubmit = () => {
    if (!form.state) { setErrors({ state: 'Please select your state' }); return }
    const profile = {
      name:      form.name.trim(),
      email:     form.email.trim(),
      phone:     form.phone.trim(),
      state:     form.state,
      picture:   `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=4F46E5&color=fff&size=128`,
      firstTime: form.firstTime,
      authType:  'local',
    }
    dispatch({ type: 'SET_USER_PROFILE', payload: profile })
    if (form.firstTime) {
      dispatch({ type: 'SET_FIRST_TIME_VOTER', payload: true })
      dispatch({ type: 'SET_ACTIVE_PANEL',     payload: 'checklist' })
    }
    if (form.state) dispatch({ type: 'SET_LOCATION', payload: form.state })
    setDone(true)
    setTimeout(() => dispatch({ type: 'SET_APP_VIEW', payload: 'chat' }), 2000)
  }

  if (done) return (
    <div className="glass-panel fade-in" style={outerStyle}>
      <CheckCircle size={64} color="var(--accent-color)" style={{ margin: '0 auto 1rem' }} />
      <h2 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>Welcome, {form.name.split(' ')[0]}!</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Profile saved locally. Taking you to your assistant…</p>
    </div>
  )

  return (
    <div className="glass-panel fade-in" style={outerStyle}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗳️</div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)' }}>Create Your Profile</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
          Stored only on this device · No account required
        </p>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            width: s <= step ? '32px' : '8px',
            height: '8px',
            borderRadius: '4px',
            background: s <= step ? 'var(--primary-color)' : 'var(--card-border)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {step === 1 && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Name */}
          <Field
            icon={<User size={16} />}
            label="Full Name"
            error={errors.name}
          >
            <input
              type="text"
              placeholder="e.g. Priya Sharma"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              style={inputStyle(errors.name)}
            />
          </Field>

          {/* Email */}
          <Field icon={<Mail size={16} />} label="Email Address" error={errors.email}>
            <input
              type="email"
              placeholder="e.g. priya@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              style={inputStyle(errors.email)}
            />
          </Field>

          {/* Phone */}
          <Field icon={<Phone size={16} />} label="Phone Number" error={errors.phone}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ ...inputStyle(errors.phone), width: '60px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                +91
              </span>
              <input
                type="tel"
                placeholder="10-digit number"
                value={form.phone}
                onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                style={{ ...inputStyle(errors.phone), flex: 1 }}
              />
            </div>
          </Field>

          <button onClick={handleStep1} className="action-btn" style={submitBtn}>
            Next <ArrowRight size={18} />
          </button>

          <button onClick={onBack} style={backBtn}>← Back to Sign In</button>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* State */}
          <Field icon={<MapPin size={16} />} label="Your State" error={errors.state}>
            <select
              value={form.state}
              onChange={e => set('state', e.target.value)}
              style={{ ...inputStyle(errors.state), appearance: 'none' }}
            >
              <option value="">Select your state…</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          {/* First-time voter */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '1rem',
            borderRadius: 'var(--radius-xl)',
            border: `1px solid ${form.firstTime ? 'var(--primary-color)' : 'var(--card-border)'}`,
            background: form.firstTime ? 'rgba(79,70,229,0.1)' : 'var(--card-bg)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            <input
              type="checkbox"
              checked={form.firstTime}
              onChange={e => set('firstTime', e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>🗳️ First-time voter</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>We'll give you extra guidance</div>
            </div>
          </label>

          {/* Privacy note */}
          <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
            🔒 Your details are stored only in your browser. Nothing is sent to any server.
          </div>

          <button onClick={handleSubmit} className="action-btn" style={submitBtn}>
            <CheckCircle size={18} /> Create Profile
          </button>

          <button onClick={() => setStep(1)} style={backBtn}>← Edit Details</button>
        </div>
      )}
    </div>
  )
}

function Field({ icon, label, error, children }) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
        {icon} {label}
      </label>
      {children}
      {error && <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: 'var(--danger-color)' }}>{error}</p>}
    </div>
  )
}

const outerStyle = {
  display: 'flex',
  flexDirection: 'column',
  padding: '2.5rem 2rem',
  maxWidth: '440px',
  width: '100%',
  margin: 'auto',
}

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '0.8rem 1rem',
  borderRadius: 'var(--radius-lg)',
  border: `1px solid ${hasError ? 'var(--danger-color)' : 'var(--card-border)'}`,
  background: 'var(--card-bg)',
  color: 'var(--text-primary)',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
})

const submitBtn = {
  padding: '1rem',
  borderRadius: 'var(--radius-xl)',
  background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
  color: 'white',
  fontWeight: 700,
  fontSize: '1rem',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  marginTop: '0.5rem',
}

const backBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  fontSize: '0.82rem',
  cursor: 'pointer',
  textAlign: 'center',
  padding: '0.25rem',
}
