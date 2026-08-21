import { describe, expect, it } from 'vitest'
import { labAfterTalk, labStatusLine, labVisibleChrome, labVoicePhaseLabel } from './labChrome'

describe('lab chrome states', () => {
  it('keeps one status line per state', () => {
    expect(labStatusLine('reading', 'Book 1')).toBe('Reading · Book 1')
    expect(labStatusLine('hearing', 'Book 1')).toBe('Hearing · Book 1')
    expect(labStatusLine('talking', 'Book 1')).toBe('Talking · tap × to stop')
    expect(labStatusLine('talking', 'Book 1', 'desktop')).toBe('Talking · tap × to stop')
    expect(labStatusLine('talking', 'Book 1', 'phone')).toBe('Talking · tap the circle to stop')
  })

  it('shows Reading when the book is peeked over Hearing', () => {
    expect(labVisibleChrome('hearing', true)).toBe('reading')
    expect(labVisibleChrome('hearing', false)).toBe('hearing')
    expect(labVisibleChrome('talking', false)).toBe('talking')
  })

  it('returns Talk to Hearing only when that is where they came from', () => {
    expect(labAfterTalk('hearing')).toBe('hearing')
    expect(labAfterTalk('reading')).toBe('reading')
  })

  it('overlays Starting / Listening / Speaking on the living circle', () => {
    expect(labVoicePhaseLabel('connecting')).toBe('Starting')
    expect(labVoicePhaseLabel('listening')).toBe('Listening')
    expect(labVoicePhaseLabel('speaking')).toBe('Speaking')
    expect(labVoicePhaseLabel('idle')).toBeNull()
  })
})
