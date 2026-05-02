import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext()

const initialState = {
  user_stage: 'learning', // learning | registered | at_polling_station | voting | completed
  first_time_voter: false,
  location: '',
  last_intent: '',
  active_panel: 'timeline', // timeline | checklist | map | simulator
  accessibility_mode: false,
  user_language: navigator.language || 'en-US',
  messages: [],
  user_profile: null, // { name, picture, email }
  simple_mode: false,
  app_view: 'landing', // landing | chat | guided
  checklist_status: {} // e.g. { 'id_proof': true }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER_STAGE':
      return { ...state, user_stage: action.payload }
    case 'SET_FIRST_TIME_VOTER':
      return { ...state, first_time_voter: action.payload }
    case 'SET_LOCATION':
      return { ...state, location: action.payload }
    case 'SET_LAST_INTENT':
      return { ...state, last_intent: action.payload }
    case 'SET_ACTIVE_PANEL':
      return { ...state, active_panel: action.payload }
    case 'TOGGLE_ACCESSIBILITY':
      return { ...state, accessibility_mode: !state.accessibility_mode }
    case 'SET_LANGUAGE':
      return { ...state, user_language: action.payload }
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] }
    case 'SET_USER_PROFILE':
      return { ...state, user_profile: action.payload }
    case 'SET_SIMPLE_MODE':
      return { ...state, simple_mode: action.payload }
    case 'SET_APP_VIEW':
      return { ...state, app_view: action.payload }
    case 'TOGGLE_CHECKLIST_ITEM':
      return { 
        ...state, 
        checklist_status: { 
          ...state.checklist_status, 
          [action.payload]: !state.checklist_status[action.payload] 
        } 
      }
    case 'LOAD_STATE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('electionAssistState')
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(saved) })
      }
    } catch (e) {
      console.error("Failed to load state", e)
    }
  }, [])

  // Save to localStorage on change (except messages to save space, or limit them)
  useEffect(() => {
    const stateToSave = { ...state, messages: state.messages.slice(-20) } // Keep last 20 msgs
    localStorage.setItem('electionAssistState', JSON.stringify(stateToSave))
    
    // Apply accessibility theme
    if (state.accessibility_mode) {
      document.documentElement.setAttribute('data-accessibility', 'high-contrast')
    } else {
      document.documentElement.removeAttribute('data-accessibility')
    }

    // Easy Mode: larger text
    if (state.simple_mode) {
      document.documentElement.setAttribute('data-easy', 'true')
    } else {
      document.documentElement.removeAttribute('data-easy')
    }
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
