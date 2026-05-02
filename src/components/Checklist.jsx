import React from 'react'
import { useAppContext } from '../context/AppContext'
import { FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function Checklist() {
  const { state } = useAppContext()

  const defaultTasks = [
    { id: 1, title: 'Verify Registration Status', required: true, done: state.user_stage !== 'learning' },
    { id: 2, title: 'Locate Polling Booth', required: true, done: !!state.location },
    { id: 3, title: 'Bring Valid Photo ID', required: true, done: false },
  ]

  const firstTimeTasks = [
    { id: 4, title: 'Proof of Address (Utility bill, etc.)', required: true, done: false },
    { id: 5, title: 'Review Ballot Preview', required: false, done: false },
  ]

  const tasks = state.first_time_voter ? [...defaultTasks, ...firstTimeTasks] : defaultTasks

  // Map tasks to their checked status in state, falling back to default 'done' logic
  const tasksWithStatus = tasks.map(task => ({
    ...task,
    done: state.checklist_status[task.id] !== undefined ? state.checklist_status[task.id] : task.done
  }))

  const allDone = tasksWithStatus.every(t => t.done)

  const handleToggle = (taskId) => {
    dispatch({ type: 'TOGGLE_CHECKLIST_ITEM', payload: taskId })
  }

  return (
    <div className="glass-panel scrollable" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <FileText color="var(--primary-color)" size={28} />
        <h2 style={{ margin: 0 }}>Your Personalized Checklist</h2>
      </div>

      {allDone && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-color)', padding: '1rem', borderRadius: 'var(--radius-xl)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle color="var(--accent-color)" size={24} />
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>You are ready to vote ✅</span>
        </div>
      )}

      {state.first_time_voter && !allDone && (
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary-color)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <AlertCircle color="var(--primary-color)" />
          <span>We've added extra requirements since you are a first-time voter.</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasksWithStatus.map(task => (
          <div 
            key={task.id} 
            onClick={() => handleToggle(task.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: task.done ? 'rgba(0,0,0,0.05)' : 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-xl)', cursor: 'pointer', transition: 'all 0.2s ease' }}
          >
            <div style={{ flexShrink: 0 }}>
              <CheckCircle color={task.done ? 'var(--accent-color)' : 'var(--text-secondary)'} size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: task.done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none' }}>
                {task.title}
              </div>
              {task.required && !task.done && <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Required</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
