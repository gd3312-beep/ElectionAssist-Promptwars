/**
 * @file misinformationHelper.test.js
 * Tests for the misinformation detection utility — ensures known
 * false claims are flagged and valid queries pass through cleanly.
 */

import { describe, it, expect } from 'vitest'
import { checkMisinformation } from '../utils/misinformationHelper'

describe('checkMisinformation()', () => {
  it('flags "vote by text" as misinformation', () => {
    const result = checkMisinformation('Can I vote by text message?')
    expect(result).not.toBeNull()
    expect(result).toMatch(/text message/i)
  })

  it('flags "text to vote" as misinformation', () => {
    const result = checkMisinformation('I heard you can text to vote now.')
    expect(result).not.toBeNull()
  })

  it('flags "sms voting" as misinformation', () => {
    const result = checkMisinformation('Is sms voting allowed this election?')
    expect(result).not.toBeNull()
  })

  it('flags "election cancelled" as misinformation', () => {
    const result = checkMisinformation('I heard the election cancelled today.')
    expect(result).not.toBeNull()
    expect(result).toMatch(/election board/i)
  })

  it('flags "postponed election" as misinformation', () => {
    const result = checkMisinformation('Postponed election news is spreading.')
    expect(result).not.toBeNull()
  })

  it('flags "vote twice" as misinformation', () => {
    const result = checkMisinformation('Can I vote twice in two different booths?')
    expect(result).not.toBeNull()
  })

  it('flags "vote online" as misinformation', () => {
    const result = checkMisinformation('Is vote online available this year?')
    expect(result).not.toBeNull()
  })

  it('returns null for legitimate election queries', () => {
    const validQueries = [
      'Where is my polling booth?',
      'What documents do I need?',
      'How do I cast my vote?',
      'When does voting close?',
      'I am a first time voter',
      '',
    ]
    validQueries.forEach((query) => {
      expect(checkMisinformation(query)).toBeNull()
    })
  })

  it('is case-insensitive in detection', () => {
    expect(checkMisinformation('VOTE BY TEXT')).not.toBeNull()
    expect(checkMisinformation('Vote By Text')).not.toBeNull()
  })

  it('returns a string warning when misinformation is detected', () => {
    const result = checkMisinformation('vote by text')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(10)
  })
})
