import React, { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Chat from './components/Chat'
import Checklist from './components/Checklist'
import Timeline from './components/Timeline'
import MapView from './components/MapView'
import Simulator from './components/Simulator'
import Landing from './components/Landing'
import GuidedMode from './components/GuidedMode'
import { AppProvider, useAppContext } from './context/AppContext'

function AppContent() {
  const { state } = useAppContext()

  // Determine which right panel component to show based on state
  const renderRightPanel = () => {
    switch (state.active_panel) {
      case 'checklist':
        return <Checklist />
      case 'timeline':
        return <Timeline />
      case 'map':
        return <MapView />
      case 'simulator':
        return <Simulator />
      default:
        if (state.user_stage === 'learning') return <Timeline />
        if (state.first_time_voter) return <Checklist />
        return <Timeline />
    }
  }

  if (state.app_view === 'landing') {
    return (
      <div className="app-container" style={{ padding: '2rem' }}>
        <Landing />
      </div>
    )
  }

  if (state.app_view === 'guided') {
    return (
      <div className="app-container" style={{ padding: '2rem' }}>
        <GuidedMode />
      </div>
    )
  }

  return (
    <div className="app-container">
      <Header />
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
