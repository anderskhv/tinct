import { describe, expect, it } from 'vitest'
import { GROK_VOICE, grokVoiceFor } from './grokConfig'
describe('shared Talk voices', () => {
  it('defaults to Ara and preserves Helios for the male preference', () => {
    expect(GROK_VOICE).toBe('ara')
    expect(grokVoiceFor('female')).toBe('ara')
    expect(grokVoiceFor('male')).toBe('helios')
  })
})
