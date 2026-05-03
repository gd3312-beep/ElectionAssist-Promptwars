import React, { Suspense, lazy } from 'react'
import './App.css'
import Header from './components/Header'
import Chat from './components/Chat'
import Checklist from './components/Checklist'
import Timeline from './components/Timeline'
const MapView = lazy(() => import('./components/MapView'))
import Simulator from './components/Simulator'
import Landing from './components/Landing'
import GuidedMode from './components/GuidedMode'
import JourneyTracker from './components/JourneyTracker'
import VoterRegistrationSimulation from './components/VoterRegistrationSimulation'
import CandidatesPanel from './components/CandidatesPanel'
import { AppProvider, useAppContext } from './context/AppContext'

function AppContent() {
  const { state, dispatch } = useAppContext()

  // Determine which right panel component to show based on state
  const renderRightPanel = () => {
    switch (state.active_panel) {
      case 'checklist':
        return <Checklist />
      case 'timeline':
        return <Timeline />
      case 'map':
        return (
          <Suspense fallback={<div style={{ padding: '1rem' }}>Loading Map...</div>}>
            <MapView />
          </Suspense>
        )
      case 'simulator':
        return <Simulator />
      case 'candidates':
        return <CandidatesPanel />
      default:
        if (state.user_stage === 'learning') return <Timeline />
        if (state.first_time_voter) return <Checklist />
        return <Timeline />
    }
  }

  if (state.app_view === 'landing') {
    return (
      <div className="app-container" style={{ padding: '1.5rem', justifyContent: 'center' }}>
        <Landing />
      </div>
    )
  }

  if (state.app_view === 'guided') {
    return (
      <div className="app-container" style={{ padding: '1.5rem' }}>
        <GuidedMode />
      </div>
    )
  }

  if (state.app_view === 'registration') {
    return (
      <div className="app-container" style={{ padding: '1.5rem', alignItems: 'center', justifyContent: 'center' }}>
        <VoterRegistrationSimulation onExit={() => dispatch({ type: 'SET_APP_VIEW', payload: 'chat' })} />
      </div>
    )
  }

  return (
    <div className="app-container">
      <Header />
      <div style={{ padding: '0.75rem 1rem 0 1rem' }}>
        <JourneyTracker />
      </div>
      <main className="main-content">
        <section className="left-panel">
          <Chat />
        </section>
        <section className="right-panel">
          {renderRightPanel()}
        </section>
      </main>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
