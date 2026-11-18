import { describe, expect, it } from 'vitest'
import { cardInMargin } from './marginPreviewCards'

// Anders, 2 Nov 2026: a definition joins the margin only once the reader has written on it.
describe('which saved cards keep a place in the margin', () => {
  const answer = { role: 'assistant' }, asked = { role: 'user' }
  it('leaves out a definition that was only looked up', () => {
    expect(cardInMargin('define', [answer])).toBe(false)
    // saved with the question the reader never typed (cardQuestion), then the answer
    expect(cardInMargin('define', [asked, answer])).toBe(false)
  })
  it('keeps a definition the reader followed up on', () => {
    expect(cardInMargin('define', [answer, asked])).toBe(true)
    expect(cardInMargin('define', [asked, answer, asked, answer])).toBe(true)
  })
  it('keeps every other card as before', () => {
    for (const kind of ['ask', 'explain', 'simplify', 'quiz', 'recap', 'primer', 'catchup', 'note']) expect(cardInMargin(kind, [answer])).toBe(true)
  })
})
