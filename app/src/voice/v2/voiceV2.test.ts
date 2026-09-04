import { describe, expect, it } from 'vitest'
import {
  directCompanionAnswer,
  isBenignRealtimeError,
  normalizeCompanionResult,
  VOICE_V2_FAILURE_LINE,
  VOICE_V2_FAILURE_NOTICE,
  VOICE_V2_STATUS_LABELS,
  voiceV2StatusLabel,
} from './voiceV2'

describe('voice v2 status vocabulary', () => {
  it('has exactly the five allowed user-facing states', () => {
    expect(Object.keys(VOICE_V2_STATUS_LABELS).sort()).toEqual(
      ['checking_text', 'connecting', 'listening', 'preparing_answer', 'speaking'],
    )
    expect(voiceV2StatusLabel('connecting')).toBe('Connecting')
    expect(voiceV2StatusLabel('listening')).toBe('Listening')
    expect(voiceV2StatusLabel('checking_text')).toBe('Checking text')
    expect(voiceV2StatusLabel('preparing_answer')).toBe('Preparing answer')
    expect(voiceV2StatusLabel('speaking')).toBe('Speaking')
    expect(voiceV2StatusLabel('idle')).toBeNull()
  })

  it('keeps the failure lines short, explicit, and free of cut-off narration', () => {
    expect(VOICE_V2_FAILURE_LINE).toMatch(/couldn't/i)
    expect(VOICE_V2_FAILURE_LINE).not.toMatch(/cut off|the answer I received|still working/i)
    expect(VOICE_V2_FAILURE_NOTICE).not.toMatch(/cut off/i)
  })
})

describe('voice v2 benign realtime errors', () => {
  it('ignores the echo of our own cancel and duplicate-create control events', () => {
    expect(isBenignRealtimeError('Cancellation failed: no active response found')).toBe(true)
    expect(isBenignRealtimeError('Conversation already has an active response in progress')).toBe(true)
    expect(isBenignRealtimeError('')).toBe(true)
    expect(isBenignRealtimeError(undefined)).toBe(true)
  })

  it('treats real provider failures as failures', () => {
    expect(isBenignRealtimeError('The server had an error while processing your request')).toBe(false)
    expect(isBenignRealtimeError('Rate limit reached')).toBe(false)
    expect(isBenignRealtimeError('invalid_request_error: instructions too long')).toBe(false)
  })
})

describe('voice v2 companion result', () => {
  it('normalizes the V1 string contract without changing its content', () => {
    expect(normalizeCompanionResult('Telemachus is being given a path.')).toEqual({
      status: 'completed',
      answer: 'Telemachus is being given a path.',
      attempts: 1,
      stopReason: null,
    })
    expect(normalizeCompanionResult('   ').status).toBe('failed')
    const structured = { status: 'failed' as const, answer: '', attempts: 2, stopReason: 'max_tokens', failureReason: 'incomplete' as const }
    expect(normalizeCompanionResult(structured)).toBe(structured)
  })

  it('strips praise and narrated process but leaves the substance alone', () => {
    expect(directCompanionAnswer('Great question! Telemachus is being given a path.'))
      .toBe('Telemachus is being given a path.')
    expect(directCompanionAnswer('Good question. Let me look at the passage. Athena is already beside him.'))
      .toBe('Athena is already beside him.')
    expect(directCompanionAnswer("I'm looking at this with you. The council is about homecoming."))
      .toBe('The council is about homecoming.')
    expect(directCompanionAnswer('Absolutely, the opening is about homecoming.'))
      .toBe('The opening is about homecoming.')
    expect(directCompanionAnswer('Athena is already beside him. Good question though.'))
      .toBe('Athena is already beside him. Good question though.')
    expect(directCompanionAnswer('')).toBe('')
  })
})
