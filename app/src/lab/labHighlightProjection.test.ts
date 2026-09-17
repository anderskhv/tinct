import { describe, it, expect } from 'vitest'
import { projectHighlight } from './labHighlightProjection'
const mark = { id: 'one', bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 939, paragraphIndex: 0, fromWord: 1, endParagraphIndex: 0, toWord: 4, color: 'gold' as const }
describe('edition-independent highlight passages', () => {
  it('uses verse identity despite changed wording and paragraph breaks', () => {
    const result = projectHighlight(mark, ['¹ He saith thus. ² Another verse.'], ['¹ He says these words to them.', '² Other words.'])
    expect(result).toMatchObject({ id: 'one', paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 7 })
  })
  it('preserves a unique exact partial quote', () => {
    expect(projectHighlight(mark, ['¹ He saith thus.'], ['Intro.', '¹ He saith thus. More.'])).toMatchObject({ paragraphIndex: 1, fromWord: 1, toWord: 4 })
  })
  it('does not guess offsets for unrelated or missing target passages', () => {
    expect(projectHighlight(mark, ['¹ He saith thus.'], ['² Something else.'])).toBeNull()
    expect(projectHighlight(mark, ['one two three four'], ['five six seven eight'])).toBeNull()
  })
})

it('uses an explicitly aligned paragraph rather than guessing translated word boundaries', () => {
 expect(projectHighlight(mark, ['one two three four'], ['different wording here'], true)).toMatchObject({ fromWord: 0, toWord: 3 })
 expect(projectHighlight(mark, ['one two three four'], ['different wording here'], false)).toBeNull()
})
