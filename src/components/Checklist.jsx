import React from 'react'
import { useAppContext } from '../context/AppContext'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { trackEvent } from '../utils/analyticsHelper'

const TASKS = [
  { id: 'verify_reg',   emoji: '📋', label: 'Check Registration', required: true  },
  { id: 'locate_booth', emoji: '📍', label: 'Find Polling Booth',  required: true  },
  { id: 'id_proof',     emoji: '🪪', label: 'Photo ID Ready',      required: true  },
  { id: 'address_proof',emoji: '🏠', label: 'Address Proof',       required: false, firstTimeOnly: true },
  { id: 'ballot_review',emoji: '📰', label: 'Review Ballot',       required: false, firstTimeOnly: true },
]

export default function Checklist() {
  const { state, dispatch } = useAppContext()

  React.useEffect(() => {
    trackEvent('checklist_used', { timestamp: Date.now() })
  }, [])

  const tasks = TASKS.filter(t => !t.firstTimeOnly || state.first_time_voter)

  const getStatus = (task) => {
    if (state.checklist_status[task.id] !== undefined) return state.checklist_status[task.id]
    if (task.id === 'verify_reg')   return state.user_stage !== 'learning'
    if (task.id === 'locate_booth') return !!state.location
    return false
  }

  const tasksWithStatus = tasks.map(t => ({ ...t, done: getStatus(t) }))
  const allDone = tasksWithStatus.every(t => t.done)
  const completed = tasksWithStatus.filter(t => t.done).length
  const pct = Math.round((completed / tasksWithStatus.length) * 100)

  const toggle = (id) => dispatch({ type: 'TOGGLE_CHECKLIST_ITEM', payload: id })

  return (
    <div className="glass-panel scrollable" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem' }}>📋 Your Checklist</h2>
        {/* Progress bar */}
        <div style={{ background: 'var(--card-border)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: allDone
              ? 'var(--accent-color)'
              : 'linear-gradient(to right, var(--primary-color), var(--accent-color))',
            borderRadius: '999px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {completed}/{tasksWithStatus.length} complete · <strong style={{ color: allDone ? 'var(--accent-color)' : 'var(--pending-color)' }}>{pct}% ready</strong>
        </p>
      </div>

      {/* Ready Banner */}
      {allDone && (
        <div style={{
          background: 'rgba(34,197,94,0.12)',
          border: '1px solid var(--accent-color)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.6rem',
          alignItems: 'center',
        }}>
          <CheckCircle color="var(--accent-color)" size={22} />
          <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontSize: '1rem' }}>You are ready to vote!</span>
        </div>
      )}

      {/* First-time notice */}
      {state.first_time_voter && !allDone && (
        <div style={{
          background: 'rgba(79,70,229,0.1)',
          border: '1px solid var(--primary-color)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          fontSize: '0.85rem',
        }}>
          <AlertCircle color="var(--primary-color)" size={18} />
          First-time voter? We added extra steps for you.
        </div>
      )}

      {/* Task tiles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tasksWithStatus.map(task => (
          <button
            key={task.id}
            onClick={() => toggle(task.id)}
            aria-label={`Toggle: ${task.label}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.9rem 1.1rem',
              background: task.done ? 'rgba(34,197,94,0.08)' : 'var(--card-bg)',
              border: `1px solid ${task.done ? 'var(--accent-color)' : 'var(--card-border)'}`,
              borderRadius: 'var(--radius-xl)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              textAlign: 'left',
              width: '100%',
            }}
          >
            {/* Icon */}
            <div style={{
              width: '42px', height: '42px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem',
              background: task.done ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
              flexShrink: 0,
            }}>
              {task.emoji}
            </div>

            {/* Label */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 600,
                fontSize: '0.95rem',
                color: task.done ? 'var(--text-secondary)' : 'var(--text-primary)',
                textDecoration: task.done ? 'line-through' : 'none',
              }}>
                {task.label}
              </div>
              {task.required && !task.done && (
                <span style={{ fontSize: '0.7rem', color: 'var(--danger-color)', fontWeight: 700 }}>Required</span>
              )}
            </div>

            {/* Check indicator */}
            <CheckCircle
              size={22}
              color={task.done ? 'var(--accent-color)' : 'var(--card-border)'}
              style={{ flexShrink: 0 }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
