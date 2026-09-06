import { describe, expect, it } from 'vitest'
import { classifyVoiceUtterance, shouldHonorModelEnd, shouldHonorModelResume } from './intents'

describe('voice intents: a bare yes is not a resume', () => {
  it('classifies affirmatives as no intent so the model cannot resume or navigate from them', () => {
    for (const text of ['Yes!!', 'yes', 'ok', 'sure', 'yes please', 'go ahead']) {
      expect(classifyVoiceUtterance(text), text).toBe('none')
    }
    expect(shouldHonorModelResume(classifyVoiceUtterance('Yes!!'))).toBe(false)
    expect(shouldHonorModelEnd(classifyVoiceUtterance('Yes!!'))).toBe(false)
  })

  it('still honours an explicit resume', () => {
    expect(classifyVoiceUtterance('resume the audiobook')).toBe('resume_audiobook')
    expect(shouldHonorModelResume('resume_audiobook')).toBe(true)
    expect(classifyVoiceUtterance("let's talk about this")).toBe('open_conversation')
  })
})
