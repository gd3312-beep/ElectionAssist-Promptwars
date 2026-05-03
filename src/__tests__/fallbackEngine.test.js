/**
 * @file fallbackEngine.test.js
 * Tests for the core local AI engine — validates intent detection,
 * context-aware responses, location extraction, and fallback guarantees.
 */

import { describe, it, expect } from 'vitest'
import { detectIntent, getFallbackResponse } from '../utils/fallbackEngine'

// ─── detectIntent ─────────────────────────────────────────────────────────────

describe('detectIntent()', () => {
  it('detects "what_next" intent from common queries', () => {
    expect(detectIntent('what next?')).toBe('what_next')
    expect(detectIntent('What should I do now?')).toBe('what_next')
    expect(detectIntent('guide me')).toBe('what_next')
    expect(detectIntent('help me')).toBe('what_next')
  })

  it('detects "documents" intent from document-related queries', () => {
    expect(detectIntent('what documents do I need?')).toBe('documents')
    expect(detectIntent('what should I bring?')).toBe('documents')
    expect(detectIntent('do I need my aadhaar?')).toBe('documents')
    expect(detectIntent('is voter id enough?')).toBe('documents')
  })

  it('detects "location" intent from booth/map queries', () => {
    expect(detectIntent('where is my polling booth?')).toBe('location')
    expect(detectIntent('find the nearest polling station')).toBe('location')
    expect(detectIntent('near me')).toBe('location')
    expect(detectIntent('show me the map')).toBe('location')
  })

  it('detects "how_to_vote" intent from voting process queries', () => {
    expect(detectIntent('how to vote?')).toBe('how_to_vote')
    expect(detectIntent('how does the EVM machine work?')).toBe('how_to_vote')
    expect(detectIntent('how do I cast my ballot?')).toBe('how_to_vote')
    expect(detectIntent('which button to press?')).toBe('how_to_vote')
  })

  it('detects "first_time" intent for new voters', () => {
    expect(detectIntent('I am a first time voter')).toBe('first_time')
    expect(detectIntent('I never voted before')).toBe('first_time')
    expect(detectIntent('I am a new voter')).toBe('first_time')
  })

  it('detects "registration" intent', () => {
    expect(detectIntent('how do I register?')).toBe('registration')
    expect(detectIntent('how to fill form 6')).toBe('registration')
    expect(detectIntent('am I enrolled in the voter list?')).toBe('registration')
  })

  it('detects "candidates" intent', () => {
    expect(detectIntent('who is contesting the election?')).toBe('candidates')
    expect(detectIntent('which candidate should I vote for?')).toBe('candidates')
    expect(detectIntent('what is the party manifesto?')).toBe('candidates')
  })

  it('detects "time" intent for timing queries', () => {
    expect(detectIntent('what time does the booth open?')).toBe('time')
    expect(detectIntent('when does voting close?')).toBe('time')
    expect(detectIntent('what are the polling hours?')).toBe('time')
  })

  it('returns "general" for unrecognised queries', () => {
    expect(detectIntent('hello')).toBe('general')
    expect(detectIntent('thanks')).toBe('general')
    expect(detectIntent('')).toBe('general')
  })
})

// ─── getFallbackResponse ───────────────────────────────────────────────────────

describe('getFallbackResponse()', () => {
  const baseState = {
    user_stage: 'learning',
    first_time_voter: false,
    location: '',
  }

  it('always returns a non-empty text string', () => {
    const queries = [
      'what next?',
      'where is my booth?',
      'what documents?',
      'how to vote?',
      'I am a first time voter',
      'hello',
      '',
    ]
    queries.forEach((q) => {
      const result = getFallbackResponse(q, baseState)
      expect(result.text).toBeTruthy()
      expect(typeof result.text).toBe('string')
    })
  })

  it('all contextual responses start with "Based on your current step"', () => {
    const contextualQueries = [
      'what next?',
      'what documents do I need?',
      'where is my booth?',
      'how to vote?',
      'I never voted before',
      'how do I register?',
      'who is the candidate?',
      'when does voting close?',
    ]
    contextualQueries.forEach((q) => {
      const { text } = getFallbackResponse(q, baseState)
      expect(text).toMatch(/^Based on your current step/)
    })
  })

  it('returns correct suggestedPanel for location queries', () => {
    const result = getFallbackResponse('where is my polling booth?', baseState)
    expect(result.suggestedPanel).toBe('map')
  })

  it('returns correct suggestedPanel for document queries', () => {
    const result = getFallbackResponse('what documents do I need?', baseState)
    expect(result.suggestedPanel).toBe('checklist')
  })

  it('returns correct suggestedPanel for how-to-vote queries', () => {
    const result = getFallbackResponse('how to vote?', baseState)
    expect(result.suggestedPanel).toBe('simulator')
  })

  it('returns correct suggestedPanel for candidate queries', () => {
    const result = getFallbackResponse('who is contesting?', baseState)
    expect(result.suggestedPanel).toBe('candidates')
  })

  it('extracts location from natural language', () => {
    const result = getFallbackResponse('I am in Mumbai', {
      ...baseState,
      location: '',
    })
    expect(result.extracted_location).toBe('Mumbai')
  })

  it('detects first-time voter mentions', () => {
    const result = getFallbackResponse('I am a first time voter', baseState)
    expect(result.is_first_time).toBe(true)
  })

  it('gives stage-specific guidance for at_polling_station stage', () => {
    const state = { ...baseState, user_stage: 'at_polling_station' }
    const result = getFallbackResponse('what next?', state)
    expect(result.text).toContain('booth')
  })

  it('gives stage-specific guidance for voting stage', () => {
    const state = { ...baseState, user_stage: 'voting' }
    const result = getFallbackResponse('what next?', state)
    expect(result.text).toContain('EVM')
  })

  it('gives completion guidance for completed stage', () => {
    const state = { ...baseState, user_stage: 'completed' }
    const result = getFallbackResponse('what next?', state)
    expect(result.text).toContain('voted')
  })

  it('includes first-time voter tip when user is first-time voter', () => {
    const state = { ...baseState, first_time_voter: true, user_stage: 'learning' }
    const result = getFallbackResponse('what next?', state)
    expect(result.text).toContain('first-time voter')
  })

  it('personalises location response when location is set', () => {
    const state = { ...baseState, location: 'Delhi' }
    const result = getFallbackResponse('where is my booth?', state)
    expect(result.text).toContain('Delhi')
  })

  it('always returns a valid intent enum via extracted_intent', () => {
    const validEnums = [
      'general_question',
      'requirements_inquiry',
      'location_inquiry',
      'voting_process',
      'candidates_inquiry',
      'timeline_inquiry',
    ]
    const result = getFallbackResponse('what documents?', baseState)
    expect(validEnums).toContain(result.extracted_intent)
  })
})
