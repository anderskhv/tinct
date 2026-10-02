import { describe, expect, it, vi } from 'vitest'

vi.mock('../services/supabase', () => ({ supabase: null }))
import { remoteVoiceChoice } from './useVoicePersonaSync'

describe('remoteVoiceChoice', () => {
  it('treats a voice stored without the chosen marker as the old default', () => {
    // Accounts created before 2026-10-01 carry Ara as if chosen.
    expect(remoteVoiceChoice({ voicePersona: 'female' })).toBeNull()
    expect(remoteVoiceChoice({ voicePersona: 'male' })).toBeNull()
  })

  it('follows a voice the reader picked, on any device', () => {
    expect(remoteVoiceChoice({ voicePersona: 'female', voicePersonaChosen: true })).toBe('female')
    expect(remoteVoiceChoice({ voicePersona: 'male', voicePersonaChosen: true })).toBe('male')
    expect(remoteVoiceChoice({ voicePersona: 'nobody', voicePersonaChosen: true })).toBeNull()
  })
})
