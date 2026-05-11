import { describe, expect, it } from 'vitest'
import { nextAudioSpeed } from './useAudioSpeed'

describe('nextAudioSpeed', () => {
  it('cycles through the supported speed options in order', () => {
    expect(nextAudioSpeed(0.75)).toBe(1)
    expect(nextAudioSpeed(1)).toBe(1.25)
    expect(nextAudioSpeed(1.25)).toBe(1.5)
    expect(nextAudioSpeed(1.5)).toBe(2)
    expect(nextAudioSpeed(2)).toBe(0.75)
  })

  it('uses the persisted speed value, not a transient audio element rate', () => {
    // Regression: the disclaimer temporarily sets the shared <audio> element
    // to 1x. If the UI says 2x, the next click must wrap from 2x to 0.75x,
    // not from the DOM element's temporary 1x to 1.25x.
    expect(nextAudioSpeed(2)).toBe(0.75)
  })
})
