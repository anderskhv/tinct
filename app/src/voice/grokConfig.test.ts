import { describe, expect, it } from 'vitest'
import { GROK_VOICE, grokVoiceFor } from './grokConfig'
describe('shared Talk voices', () => {
  it('defaults to Helios and keeps Ara for the female preference', () => {
    expect(GROK_VOICE).toBe('helios')
    expect(grokVoiceFor('female')).toBe('ara')
    expect(grokVoiceFor('male')).toBe('helios')
  })
})
