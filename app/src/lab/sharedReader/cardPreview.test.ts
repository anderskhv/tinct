import { expect, it } from 'vitest'
import { answerLead, clampWords, foldedPreview } from './cardPreview'

/** Anders, 3 Nov 2026: folded cards showed a follow-up's "The document doesn't discuss this…", cut mid-word. */
const turns = [
  { role: 'user', content: 'when did ethiopia become christian - before the colonisers?' },
  { role: 'assistant', content: 'Yes, long before. The kingdom of Aksum adopted Christianity around 330 AD.\n\nThat makes Ethiopia one of the oldest Christian states.' },
  { role: 'user', content: 'did christianity spread from there or only via colonisers?' },
  { role: 'assistant', content: 'The document doesn\'t discuss this. From general knowledge, Christianity reached much of Africa well before European colonisers, though Ethiopia was only one of several routes.' },
]

it('folds an Ask to its first question, its first answer\'s bottom line whole, and its follow-ups', () => {
  expect(foldedPreview('ask', turns)).toEqual({ preview: 'Yes, long before.', previewQuestion: 'when did ethiopia become christian - before the colonisers?', previewMore: 1 })
})

it('names no question for an action card, and counts only questions after the first answer', () => {
  expect(foldedPreview('explain', [{ role: 'user', content: 'The selected passage.' }, { role: 'assistant', content: '**Metzger counts copies.** He compares them.' }])).toEqual({ preview: 'Metzger counts copies.' })
  expect(foldedPreview('explain', [{ role: 'assistant', content: 'One sentence only.' }, { role: 'user', content: 'Why?' }, { role: 'assistant', content: 'Because.' }]).previewMore).toBe(1)
  expect(foldedPreview('ask', [])).toEqual({ preview: '' })
  // A note has no answer: it folds to its own words.
  expect(foldedPreview('margin-note', [{ role: 'user', content: 'Check this against Bruce.' }])).toEqual({ preview: 'Check this against Bruce.' })
})

it('takes the bottom line as plain text and cuts a long one at a word, with an ellipsis', () => {
  expect(answerLead('## A heading line\n\nBody.')).toBe('A heading line')
  expect(answerLead('- *First* point. Second.')).toBe('First point.')
  const long = 'word '.repeat(80).trim()
  const cut = clampWords(long, 50)
  expect(cut.endsWith('word…')).toBe(true)
  expect(cut.length).toBeLessThanOrEqual(51)
  expect(clampWords('Short.', 50)).toBe('Short.')
})
