/**
 * @file contextEngine.test.js
 * Tests for the context routing engine — validates panel navigation,
 * stage transitions, and keyword-based smart behaviours.
 */

import { describe, it, expect } from 'vitest'
import { processContext } from '../utils/contextEngine'

const baseState = {
  active_panel: 'timeline',
  user_stage: 'learning',
  app_view: 'chat',
}

describe('processContext()', () => {
  it('routes "requirements_inquiry" intent to checklist panel', () => {
    const { nextPanel } = processContext('requirements_inquiry', baseState, 'what documents do I need')
    expect(nextPanel).toBe('checklist')
  })

  it('routes "location_inquiry" intent to map panel', () => {
    const { nextPanel } = processContext('location_inquiry', baseState, 'where is my polling booth')
    expect(nextPanel).toBe('map')
  })

  it('routes "voting_process" intent to simulator panel', () => {
    const { nextPanel } = processContext('voting_process', baseState, 'how to vote')
    expect(nextPanel).toBe('simulator')
  })

  it('routes "candidates_inquiry" intent to candidates panel', () => {
    const { nextPanel } = processContext('candidates_inquiry', baseState, 'who is contesting')
    expect(nextPanel).toBe('candidates')
  })

  it('routes "timeline_inquiry" intent to timeline panel', () => {
    const { nextPanel } = processContext('timeline_inquiry', baseState, 'show me the timeline')
    expect(nextPanel).toBe('timeline')
  })

  it('routes "guided_mode_request" intent to guided app view', () => {
    const { nextAppView } = processContext('guided_mode_request', baseState, 'take me through it step by step')
    expect(nextAppView).toBe('guided')
  })

  it('advances stage from at_polling_station → voting on "what next"', () => {
    const state = { ...baseState, user_stage: 'at_polling_station', active_panel: 'map' }
    const { nextStage, nextPanel } = processContext('general_question', state, 'what next?')
    expect(nextStage).toBe('voting')
    expect(nextPanel).toBe('simulator')
  })

  it('advances stage from voting → completed on "what next"', () => {
    const state = { ...baseState, user_stage: 'voting', active_panel: 'simulator' }
    const { nextStage } = processContext('general_question', state, 'now what?')
    expect(nextStage).toBe('completed')
  })

  it('routes "where" keyword to map panel as fallback', () => {
    const { nextPanel } = processContext('general_question', baseState, 'where do I go?')
    expect(nextPanel).toBe('map')
  })

  it('routes "document" keyword to checklist as fallback', () => {
    const { nextPanel } = processContext('general_question', baseState, 'what are the document requirements?')
    expect(nextPanel).toBe('checklist')
  })

  it('routes "how" keyword to simulator as fallback', () => {
    const { nextPanel } = processContext('general_question', baseState, 'how does the process work?')
    expect(nextPanel).toBe('simulator')
  })

  it('returns current panel when no routing applies', () => {
    const { nextPanel } = processContext('general_question', baseState, 'hello')
    expect(nextPanel).toBe(baseState.active_panel)
  })

  it('always returns an object with required keys', () => {
    const result = processContext('general_question', baseState, 'test')
    expect(result).toHaveProperty('nextPanel')
    expect(result).toHaveProperty('nextStage')
    expect(result).toHaveProperty('nextAppView')
  })
})
