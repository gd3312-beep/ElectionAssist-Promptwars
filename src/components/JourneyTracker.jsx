import React from 'react'
import { useAppContext } from '../context/AppContext'
import { CheckCircle } from 'lucide-react'

const stages = [
  { id: 'learning',           emoji: '📚', label: 'Registered'   },
  { id: 'registered',         emoji: '🗂️', label: 'Prepared'     },
  { id: 'at_polling_station', emoji: '📍', label: 'At Booth'     },
  { id: 'voting',             emoji: '🗳️', label: 'Voting'       },
  { id: 'completed',          emoji: '✅', label: 'Done!'         },
]

export default function JourneyTracker() {
  const { state } = useAppContext()
  const currentIndex = stages.findIndex(s => s.id === state.user_stage)

  return (
    <div
      className="glass-panel fade-in"
      style={{ padding: '1rem 1.5rem', overflowX: 'auto' }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        minWidth: '480px',
        gap: 0,
      }}>
        {stages.map((stage, idx) => {
          const isDone    = idx < currentIndex
          const isCurrent = idx === currentIndex
          const isPending = idx > currentIndex

          return (
            <React.Fragment key={stage.id}>
              {/* Step Node */}
              <div
                className="journey-step"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', minWidth: '72px' }}
              >
                {/* Circle */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  border: '2.5px solid',
                  borderColor: isDone ? 'var(--accent-color)' : isCurrent ? 'var(--primary-color)' : 'var(--card-border)',
                  background: isDone
                    ? 'rgba(34, 197, 94, 0.18)'
                    : isCurrent
                    ? 'rgba(79, 70, 229, 0.22)'
                    : 'rgba(255,255,255,0.04)',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(79,70,229,0.18)' : 'none',
                  animation: isCurrent ? 'pulse-border 2s infinite' : 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}>
                  {isDone ? <CheckCircle size={20} color="var(--accent-color)" /> : stage.emoji}
                </div>

                {/* Label */}
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: isCurrent ? 800 : 500,
                  color: isDone
                    ? 'var(--accent-color)'
                    : isCurrent
                    ? 'var(--primary-color)'
                    : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                }}>
                  {stage.label}
                </span>

                {/* Status dot */}
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isDone
                    ? 'var(--accent-color)'
                    : isCurrent
                    ? 'var(--pending-color)'
                    : 'rgba(255,255,255,0.15)',
                }} />
              </div>

              {/* Connector */}
              {idx < stages.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '3px',
                  borderRadius: '2px',
                  background: idx < currentIndex
                    ? 'linear-gradient(to right, var(--accent-color), var(--primary-color))'
                    : 'var(--card-border)',
                  marginBottom: '1.5rem',
                  transition: 'background 0.4s ease',
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
  )
}
