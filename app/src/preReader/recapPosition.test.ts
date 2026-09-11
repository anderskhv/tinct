import { describe, expect, it } from 'vitest'
import { chapterProgress, includesPreviousChapter, positionLine } from './recapPosition'

describe('chapterProgress', () => {
  it('is finished only when the records say so, never from a fraction', () => {
    expect(chapterProgress({ paragraphIndex: 5, paragraphCount: 6, finished: true })).toBe('finished')
    expect(chapterProgress({ paragraphIndex: 5, paragraphCount: 6, finished: false })).toBe('near-end')
    expect(chapterProgress({ paragraphIndex: 0, paragraphCount: 6, finished: true })).toBe('finished')
  })

  it('reads a six-paragraph Bible chapter as start / middle / near the end', () => {
    // Proverbs 17 in the KJV edition has 6 paragraphs.
    expect(chapterProgress({ paragraphIndex: 0, paragraphCount: 6, finished: false })).toBe('start')
    expect(chapterProgress({ paragraphIndex: 1, paragraphCount: 6, finished: false })).toBe('middle')
    expect(chapterProgress({ paragraphIndex: 3, paragraphCount: 6, finished: false })).toBe('middle')
    expect(chapterProgress({ paragraphIndex: 4, paragraphCount: 6, finished: false })).toBe('near-end')
    expect(chapterProgress({ paragraphIndex: 5, paragraphCount: 6, finished: false })).toBe('near-end')
  })

  it('reads a long novel chapter by read-through fraction', () => {
    expect(chapterProgress({ paragraphIndex: 4, paragraphCount: 40, finished: false })).toBe('start')
    expect(chapterProgress({ paragraphIndex: 9, paragraphCount: 40, finished: false })).toBe('start')
    expect(chapterProgress({ paragraphIndex: 10, paragraphCount: 40, finished: false })).toBe('middle')
    expect(chapterProgress({ paragraphIndex: 31, paragraphCount: 40, finished: false })).toBe('middle')
    expect(chapterProgress({ paragraphIndex: 32, paragraphCount: 40, finished: false })).toBe('near-end')
    expect(chapterProgress({ paragraphIndex: 39, paragraphCount: 40, finished: false })).toBe('near-end')
  })

  it('claims only start or middle when the chapter length is unknown or tiny', () => {
    expect(chapterProgress({ paragraphIndex: 0, paragraphCount: null, finished: false })).toBe('start')
    expect(chapterProgress({ paragraphIndex: 7, paragraphCount: null, finished: false })).toBe('middle')
    expect(chapterProgress({ paragraphIndex: 0, paragraphCount: 1, finished: false })).toBe('middle')
    expect(chapterProgress({ paragraphIndex: 0, paragraphCount: 2, finished: false })).toBe('start')
    expect(chapterProgress({ paragraphIndex: 1, paragraphCount: 2, finished: false })).toBe('middle')
  })

  it('tolerates out-of-range and non-finite paragraph indexes', () => {
    expect(chapterProgress({ paragraphIndex: 99, paragraphCount: 6, finished: false })).toBe('near-end')
    expect(chapterProgress({ paragraphIndex: -3, paragraphCount: 6, finished: false })).toBe('start')
    expect(chapterProgress({ paragraphIndex: Number.NaN, paragraphCount: 6, finished: false })).toBe('start')
    expect(chapterProgress({ paragraphIndex: 3, paragraphCount: Number.NaN, finished: false })).toBe('middle')
  })
})

describe('positionLine', () => {
  it('names the place the way a person would say it', () => {
    expect(positionLine('start', 'Proverbs 18')).toBe('You’re at the start of Proverbs 18')
    expect(positionLine('middle', 'Proverbs 17')).toBe('You’re in the middle of Proverbs 17')
    expect(positionLine('near-end', 'Proverbs 17')).toBe('You’re near the end of Proverbs 17')
    expect(positionLine('finished', 'Proverbs 17')).toBe('You finished Proverbs 17')
    expect(positionLine('middle', 'Chapter 1')).toBe('You’re in the middle of Chapter 1')
  })
})

describe('includesPreviousChapter', () => {
  it('never reaches back before the first chapter or into an unfinished one', () => {
    expect(includesPreviousChapter({ chapterNumber: 1, progress: 'start', previousChapterFinished: true, sameSitting: true })).toBe(false)
    expect(includesPreviousChapter({ chapterNumber: 18, progress: 'start', previousChapterFinished: false, sameSitting: true })).toBe(false)
  })

  it('reaches back when the reader has barely begun this chapter or read both in one sitting', () => {
    expect(includesPreviousChapter({ chapterNumber: 18, progress: 'start', previousChapterFinished: true, sameSitting: false })).toBe(true)
    expect(includesPreviousChapter({ chapterNumber: 18, progress: 'middle', previousChapterFinished: true, sameSitting: true })).toBe(true)
    expect(includesPreviousChapter({ chapterNumber: 18, progress: 'middle', previousChapterFinished: true, sameSitting: false })).toBe(false)
    expect(includesPreviousChapter({ chapterNumber: 18, progress: 'finished', previousChapterFinished: true, sameSitting: false })).toBe(false)
  })
})
