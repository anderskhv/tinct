import { expect, it } from 'vitest'
import { CURRENT_VOICE_EXPERIMENT, LIGHT_VOICE_EXPERIMENT, experimentInstructions, parseVoiceExperiment } from './voiceLab'
it('restricts model choices and bounds editable prompts', () => {
  expect(parseVoiceExperiment(CURRENT_VOICE_EXPERIMENT)).toEqual(CURRENT_VOICE_EXPERIMENT)
  expect(parseVoiceExperiment({ ...CURRENT_VOICE_EXPERIMENT, model: 'anything' })).toBeNull()
  expect(parseVoiceExperiment({ ...CURRENT_VOICE_EXPERIMENT, frontend: 'x'.repeat(16001) })).toBeNull()
})
it('keeps the current prompt exact and lighter context free of backend instructions', () => {
  const context = { bookTitle: 'Odyssey', bookAuthor: 'Homer', chapterLabel: 'Book 6', currentParagraph: '$& passage', nearbyParagraphs: ['$& passage'], visibleText: 'OLD FULL PROMPT' }
  expect(experimentInstructions(CURRENT_VOICE_EXPERIMENT, 'production', context)).toBe('production')
  const light = experimentInstructions(LIGHT_VOICE_EXPERIMENT, 'production', context)
  expect(light).toContain('$& passage')
  expect(light).not.toContain('OLD FULL PROMPT')
  expect(light).not.toContain('production')
})
it('uses Sol and a quiet Live prompt for current defaults and light tests', () => {
  expect(CURRENT_VOICE_EXPERIMENT.model).toBe('gpt-5.6-sol')
  expect(LIGHT_VOICE_EXPERIMENT.model).toBe('gpt-5.6-sol')
  expect(CURRENT_VOICE_EXPERIMENT.frontend).toContain('Use no vocal backchannels')
  expect(CURRENT_VOICE_EXPERIMENT.frontend).toContain('Answer only the latest question')
})
