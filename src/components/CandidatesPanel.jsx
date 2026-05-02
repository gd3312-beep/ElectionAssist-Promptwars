import React, { useEffect, useState } from 'react'
import { apiGetCandidates } from '../services/api'
import { Users, Loader } from 'lucide-react'

export default function CandidatesPanel() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGetCandidates()
      .then(data => { setCandidates(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="glass-panel fade-in" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <Users color="var(--primary-color)" size={22} />
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Candidates</h2>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: 'rgba(79,70,229,0.12)', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 700 }}>DEMO DATA</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <Loader size={16} className="spin" /> Loading candidates…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {candidates.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.9rem 1rem',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-xl)',
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(79,70,229,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                {c.symbol}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.party}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`.spin{animation:spin 1s linear infinite;}@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )
}
