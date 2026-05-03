import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { CheckCircle, X } from 'lucide-react'

const stages = [
  {
    id: 'learning',
    emoji: '📚',
    label: 'Registered',
    modalTitle: 'Preparation Phase',
    actions: ['Verify your name on voter roll', 'Check election date', 'Research candidates'],
    faqs: [
      { q: 'Am I eligible to vote?', a: 'Yes, if you are 18+ and a registered Indian citizen.' },
      { q: 'How do I check my registration?', a: 'Visit voters.eci.gov.in and search by name.' },
    ],
    tip: '💡 Most issues happen because voters don\'t verify their name on the roll in advance!',
  },
  {
    id: 'registered',
    emoji: '🗂️',
    label: 'Prepared',
    modalTitle: 'Getting Ready',
    actions: ['Download your Voter ID slip', 'Find your polling booth address', 'Prepare your documents'],
    faqs: [
      { q: 'What ID do I need?', a: 'Voter ID card + one Photo ID (Aadhaar / PAN / Passport).' },
      { q: 'Can I use a digital Voter ID?', a: 'Yes! The e-EPIC is officially accepted.' },
    ],
    tip: '💡 Screenshot your booth address the night before so you don\'t need internet on Election Day.',
  },
  {
    id: 'at_polling_station',
    emoji: '📍',
    label: 'At Booth',
    modalTitle: 'At the Polling Station',
    actions: ['Show Photo ID at entrance', 'Join the correct queue', 'Sign the voter register', 'Get your finger inked'],
    faqs: [
      { q: 'Can I carry my phone?', a: 'No. Mobile phones are not allowed inside the voting booth.' },
      { q: 'What if my name is missing from register?', a: 'Contact the presiding officer immediately with your ID.' },
    ],
    tip: '💡 Arrive before 5 PM — even if you are in the queue when it closes, you are allowed to vote.',
  },
  {
    id: 'voting',
    emoji: '🗳️',
    label: 'Voting',
    modalTitle: 'Casting Your Vote',
    actions: ['Find your candidate on the EVM', 'Press the blue button firmly', 'Wait for the long beep', 'Check the VVPAT slip'],
    faqs: [
      { q: 'What if I press the wrong button?', a: 'You cannot undo an EVM vote. Think carefully before pressing.' },
      { q: 'What is VVPAT?', a: 'A paper slip visible for 7 seconds showing your candidate\'s name and symbol.' },
    ],
    tip: '💡 The entire voting process inside the booth takes less than 2 minutes!',
  },
  {
    id: 'completed',
    emoji: '✅',
    label: 'Done!',
    modalTitle: 'You Voted! 🎉',
    actions: ['Share your "I Voted!" selfie with the ink mark', 'Follow results on official ECI website', 'Report any issues to ECI helpline: 1950'],
    faqs: [
      { q: 'When are results declared?', a: 'Usually 1-2 days after polling day on eci.gov.in.' },
      { q: 'My ink faded quickly — is my vote valid?', a: 'Yes! The ink fading doesn\'t affect vote validity.' },
    ],
    tip: '💡 Thank you for participating in democracy! 🇮🇳',
  },
]

export default function JourneyTracker() {
  const { state, dispatch } = useAppContext()
  const [activeModal, setActiveModal] = useState(null)
  const currentIndex = stages.findIndex(s => s.id === state.user_stage)

  return (
    <>
      <div className="glass-panel fade-in" style={{ padding: '1rem 1.5rem', overflowX: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: '480px', gap: 0 }}>
          {stages.map((stage, idx) => {
            const isDone    = idx < currentIndex
            const isCurrent = idx === currentIndex

            return (
              <React.Fragment key={stage.id}>
                {/* Step Node */}
                <button
                  onClick={() => setActiveModal(stage)}
                  title={`Click to learn about: ${stage.modalTitle}`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '0.35rem', minWidth: '72px', background: 'none', border: 'none',
                    cursor: 'pointer', padding: '0.25rem', borderRadius: 'var(--radius-md)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', border: '2.5px solid',
                    borderColor: isDone ? 'var(--accent-color)' : isCurrent ? 'var(--primary-color)' : 'var(--card-border)',
                    background: isDone ? 'rgba(34,197,94,0.18)' : isCurrent ? 'rgba(79,70,229,0.22)' : 'rgba(255,255,255,0.04)',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(79,70,229,0.18)' : 'none',
                    animation: isCurrent ? 'pulse-border 2s infinite' : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    {isDone ? <CheckCircle size={20} color="var(--accent-color)" /> : stage.emoji}
                  </div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: isCurrent ? 800 : 500,
                    color: isDone ? 'var(--accent-color)' : isCurrent ? 'var(--primary-color)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                  }}>
                    {stage.label}
                  </span>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: isDone ? 'var(--accent-color)' : isCurrent ? 'var(--pending-color)' : 'rgba(255,255,255,0.15)',
                  }} />
                </button>

                {/* Connector */}
                {idx < stages.length - 1 && (
                  <div style={{
                    flex: 1, height: '3px', borderRadius: '2px',
                    background: idx < currentIndex
                      ? 'linear-gradient(to right, var(--accent-color), var(--primary-color))'
                      : 'var(--card-border)',
                    marginBottom: '1.5rem', transition: 'background 0.4s ease',
                  }} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        <style>{`
          @keyframes pulse-border {
            0%   { box-shadow: 0 0 0 0 rgba(79,70,229,0.4); }
            70%  { box-shadow: 0 0 0 8px rgba(79,70,229,0); }
            100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); }
          }
        `}</style>
      </div>

      {/* Stage Detail Modal */}
      {activeModal && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem', animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--app-bg)', border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-lg)', padding: '1.75rem',
              maxWidth: '480px', width: '100%',
              boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
              maxHeight: '85vh', overflowY: 'auto',
              animation: 'slideUp 0.2s ease',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{activeModal.emoji}</span>
                {activeModal.modalTitle}
              </h2>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            {/* Key Actions */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.6rem 0', color: 'var(--primary-color)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📌 What to do at this stage
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {activeModal.actions.map((action, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.5rem 0.75rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', flexShrink: 0 }}>Step {i + 1}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.6rem 0', color: 'var(--primary-color)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ❓ Common Questions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeModal.faqs.map((faq, i) => (
                  <div key={i} style={{ padding: '0.65rem 0.85rem', background: 'rgba(79,70,229,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(79,70,229,0.15)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Q: {faq.q}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {activeModal.tip}
            </div>

            {/* Set as Current Stage */}
            <button
              onClick={() => {
                dispatch({ type: 'SET_USER_STAGE', payload: activeModal.id })
                setActiveModal(null)
              }}
              style={{
                marginTop: '1.25rem', width: '100%', padding: '0.85rem',
                background: state.user_stage === activeModal.id
                  ? 'rgba(34,197,94,0.15)'
                  : 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                color: state.user_stage === activeModal.id ? 'var(--accent-color)' : 'white',
                border: state.user_stage === activeModal.id ? '1px solid var(--accent-color)' : 'none',
                borderRadius: 'var(--radius-xl)', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.95rem',
                transition: 'all 0.2s ease',
              }}
            >
              {state.user_stage === activeModal.id ? '✅ This is your current stage' : `Set stage to "${activeModal.label}"`}
            </button>
          </div>

          <style>{`
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}
    </>
  )
}
