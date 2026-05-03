import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { Info, HelpCircle, CheckCircle2, ArrowRightCircle } from 'lucide-react'

export default function Timeline() {
  const { state, dispatch } = useAppContext()
  const [selectedPhase, setSelectedPhase] = useState(null)

  const phases = [
    { 
      id: 'learning', 
      label: 'Preparation', 
      desc: 'Learn about candidates and rules',
      actions: ['Research local candidates', 'Check election dates', 'Watch educational videos'],
      faqs: [
        { q: 'Who is eligible to vote?', a: 'Any citizen above 18 years of age with a valid voter ID.' },
        { q: 'Where can I find candidate info?', a: 'Check the "Candidates" panel or official election portal.' }
      ]
    },
    { 
      id: 'registered', 
      label: 'Registration', 
      desc: 'Ensure you are on the voter list',
      actions: ['Verify name in Voter List', 'Apply for Voter ID if missing', 'Download Digital Voter Card'],
      faqs: [
        { q: 'What if my name is missing?', a: 'Submit Form 6 to the electoral officer immediately.' },
        { q: 'Is Aadhaar mandatory?', a: 'It helps, but other government IDs are also accepted.' }
      ]
    },
    { 
      id: 'at_polling_station', 
      label: 'Election Day', 
      desc: 'Arrive at your polling station',
      actions: ['Locate your booth on the map', 'Carry original Photo ID', 'Check booth timings'],
      faqs: [
        { q: 'What time do booths open?', a: 'Usually 7:00 AM to 6:00 PM.' },
        { q: 'Can I carry my phone inside?', a: 'No, mobile phones are usually prohibited inside the booth.' }
      ]
    },
    { 
      id: 'voting', 
      label: 'Casting Vote', 
      desc: 'Select candidates and submit ballot',
      actions: ['Verify ID with officer', 'Get index finger inked', 'Press candidate button on EVM', 'Verify VVPAT slip'],
      faqs: [
        { q: 'How do I use the EVM?', a: 'Press the blue button next to your candidate symbol.' },
        { q: 'What is VVPAT?', a: 'A slip that shows your vote for 7 seconds behind a glass screen.' }
      ]
    },
    { 
      id: 'completed', 
      label: 'Post-Election', 
      desc: 'Track results and governance',
      actions: ['Check result date', 'Share your "I Voted" selfie', 'Follow local governance updates'],
      faqs: [
        { q: 'When are results declared?', a: 'Check the official election timeline for the counting date.' },
        { q: 'How to report issues?', a: 'Use the official Election Commission helpline (1950).' }
      ]
    },
  ]

  const currentIndex = phases.findIndex(p => p.id === state.user_stage)
  const activePhase = selectedPhase || phases[currentIndex] || phases[0]

  return (
    <div className="glass-panel scrollable" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Voting Journey
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--card-border)' }}>
        {/* Progress Line */}
        <div style={{ position: 'absolute', left: '27px', top: '30px', bottom: '30px', width: '2px', background: 'var(--card-border)', zIndex: 0 }}></div>

        {phases.map((phase, index) => {
          const isPast = index < currentIndex
          const isActive = index === currentIndex
          const isSelected = activePhase.id === phase.id
          
          let markerBg = 'var(--card-bg)'
          let markerBorder = 'var(--text-secondary)'
          if (isPast) { markerBg = 'var(--accent-color)'; markerBorder = 'var(--accent-color)' }
          if (isActive) { markerBg = 'var(--primary-color)'; markerBorder = 'var(--primary-color)' }

          return (
            <div 
              key={phase.id} 
              onClick={() => setSelectedPhase(phase)}
              style={{ 
                display: 'flex', 
                gap: '1rem', 
                position: 'relative', 
                zIndex: 1, 
                cursor: 'pointer',
                opacity: isSelected || isActive ? 1 : 0.6,
                transform: isSelected ? 'translateX(5px)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                width: '26px', height: '26px', borderRadius: '50%', 
                background: markerBg, border: `2px solid ${markerBorder}`, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: 'white', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 
              }}>
                {isPast ? '✓' : index + 1}
              </div>
              <div style={{ paddingTop: '2px' }}>
                <h4 style={{ margin: 0, color: isSelected ? 'var(--primary-color)' : 'var(--text-primary)', fontSize: '0.95rem' }}>{phase.label}</h4>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Panel for Selected Stage */}
      <div className="fade-in" style={{ 
        flex: 1, background: 'rgba(79, 70, 229, 0.05)', 
        border: '1px solid var(--card-border)', 
        borderRadius: 'var(--radius-lg)', padding: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
          <Info size={18} />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{activePhase.label} Info</h3>
        </div>
        
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {activePhase.desc}
        </p>

        <div style={{ marginTop: '0.5rem' }}>
          <h5 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
            <CheckCircle2 size={14} color="var(--accent-color)" /> Key Actions
          </h5>
          <ul style={{ margin: 0, padding: '0 0 0 1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {activePhase.actions.map(action => <li key={action}>{action}</li>)}
          </ul>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <h5 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
            <HelpCircle size={14} color="var(--primary-color)" /> Common Questions
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {activePhase.faqs.map(faq => (
              <div key={faq.q} style={{ fontSize: '0.8rem', background: 'var(--card-bg)', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Q: {faq.q}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => dispatch({ type: 'SET_USER_STAGE', payload: activePhase.id })}
          style={{ 
            marginTop: 'auto', background: 'var(--primary-color)', 
            color: 'white', border: 'none', borderRadius: 'var(--radius-md)', 
            padding: '0.75rem', cursor: 'pointer', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            fontWeight: 'bold', fontSize: '0.9rem'
          }}
        >
          {state.user_stage === activePhase.id ? 'Current Stage' : 'Switch to this Stage'}
          <ArrowRightCircle size={16} />
        </button>
      </div>
    </div>
  )
}
