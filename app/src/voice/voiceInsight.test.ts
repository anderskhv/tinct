import { expect, it } from 'vitest'
import { INSIGHT_VOICE_EXPERIMENT, INSIGHT_REASONED_EXPERIMENT, CURRENT_VOICE_EXPERIMENT, experimentInstructions, parseVoiceExperiment } from './voiceLab'
it('keeps reference and explanation continuity without importing the old brevity policy', () => {
  const original = 'OLD POLICY: one to three sentences\nReader reference: {"book":"Example","text":"$&"}\nRecent conversation (reference only): [{"content":"Earlier explanation"}]'
  const result = experimentInstructions(INSIGHT_VOICE_EXPERIMENT, original, { bookTitle: 'Example', chapterLabel: 'One', bookAuthor: 'Author' })
  expect(result).toContain('Earlier explanation')
  expect(result).toContain('$&')
  expect(result).not.toContain('OLD POLICY')
  expect(result).not.toContain('{{')
})
it('falls back to the supplied passage if a reference block is unavailable', () => {
  const result = experimentInstructions(INSIGHT_VOICE_EXPERIMENT, 'legacy policy', { bookTitle: 'Example', chapterLabel: 'One', bookAuthor: 'Author', currentParagraph: 'A concrete detail.' })
  expect(result).toContain('A concrete detail.')
  expect(result).not.toContain('legacy policy')
})
it('preserves the baseline and supplies distinct valid insight comparisons', () => {
  expect(CURRENT_VOICE_EXPERIMENT.label).toBe('Current')
  for (const preset of [INSIGHT_VOICE_EXPERIMENT, INSIGHT_REASONED_EXPERIMENT]) expect(parseVoiceExperiment(preset)).toEqual(preset)
  expect(INSIGHT_VOICE_EXPERIMENT.frontend).toContain('You can offer a grounded interpretation')
  expect(INSIGHT_REASONED_EXPERIMENT.frontend).not.toContain('You can offer a grounded interpretation')
  expect(INSIGHT_REASONED_EXPERIMENT.frontend).toContain('Any new substantive interpretation')
  expect(INSIGHT_REASONED_EXPERIMENT.frontend).not.toContain('\\n')
})
