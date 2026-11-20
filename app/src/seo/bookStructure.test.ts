import { describe, expect, it } from 'vitest'
import { chapterPositions, curlyQuotes, structureFacts } from './bookStructure'

describe('structure facts (docs/seo-brief-2026-11-19.md §2, §4)', () => {
  it('counts chapters within their own group, in the book\'s own units', () => {
    const labels = new Map([[1, 'Part 1, Chapter 1'], [2, 'Part 1, Chapter 2'], [3, 'Part 2, Chapter 1'], [4, 'Epilogue, Chapter 1'], [5, 'Epilogue, Chapter 2']])
    expect(chapterPositions(labels).get(2)).toEqual({ label: 'Part 1, Chapter 2', of: 2 })
    expect(chapterPositions(labels).get(3)).toEqual({ label: 'Part 2, Chapter 1', of: null })
    expect(structureFacts(labels.values()).pill).toBe('2 parts + epilogue · 5 chapters')
  })

  it('places a named last chapter by its number ("Chapter 38, Conclusion" is Chapter 38 of 38)', () => {
    const labels = new Map([[1, 'Chapter 1'], [2, 'Chapter 2'], [3, 'Chapter 3, Conclusion']])
    expect(chapterPositions(labels).get(3)).toEqual({ label: 'Chapter 3', of: 3 })
    expect(structureFacts(labels.values())).toEqual({ pill: '3 chapters', units: '3 chapters' })
  })

  it('reads acts and scenes', () => {
    const labels = new Map([[1, 'Act 1, Scene 1'], [2, 'Act 1, Scene 2'], [3, 'Act 2, Scene 1']])
    expect(structureFacts(labels.values()).pill).toBe('2 acts · 3 scenes')
    expect(chapterPositions(labels).get(2)).toEqual({ label: 'Act 1, Scene 2', of: 2 })
  })
})

describe('curly quotes', () => {
  it.each([
    ['"What does Bessie say I have done?" I asked.', '“What does Bessie say I have done?” I asked.'],
    ["I'll be killed if—\"", 'I’ll be killed if—”'],
    ['"Oh, Aunt!—"Silence!"', '“Oh, Aunt!—“Silence!”'],
    ["'Tis now struck twelve.", '’Tis now struck twelve.'],
    ["She said 'no' twice.", 'She said ‘no’ twice.'],
    ['Already “curly”.', 'Already “curly”.'],
  ])('%s', (input, output) => expect(curlyQuotes(input)).toBe(output))
})
