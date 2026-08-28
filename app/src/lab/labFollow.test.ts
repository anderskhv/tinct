import { describe, expect, it } from 'vitest'
import {
  followAtTime,
  followFromPlayback,
  followParagraphFromManifest,
  mergeSidecarWords,
  followDerivedLagSeconds,
  followTimeFromAudio,
  wordIndexAtTime,
  wordsFromManifestParagraph,
  wordsFromParagraphDuration,
  ensureDerivedWordTimes,
  DERIVED_SPEECH_SPAN,
} from './labFollow'

describe('lab word follow', () => {
  it('uses manifest words when they carry real start and end times', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me, O Muse', {
      duration: 2,
      words: [
        { text: 'Tell', start: 0, end: 0.4 },
        { text: 'me,', start: 0.4, end: 0.7 },
        { text: 'O', start: 0.7, end: 0.9 },
        { text: 'Muse', start: 0.9, end: 1.4 },
      ],
    })

    expect(paragraph.words).toHaveLength(4)
    expect(followAtTime([paragraph], 0.5)).toEqual({
      kind: 'word',
      paragraphIndex: 0,
      wordIndex: 1,
    })
  })

  it('derives proportional word times from paragraph duration when words.json is missing', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me, O Muse', { duration: 4, paragraph: 0 })
    expect(paragraph.words).toHaveLength(4)
    const unit = 4 * DERIVED_SPEECH_SPAN / 4
    expect(paragraph.words?.[0].text).toBe('Tell')
    expect(paragraph.words?.[0].start).toBeCloseTo(0)
    expect(paragraph.words?.[0].end).toBeCloseTo(unit)
    expect(paragraph.words?.[3]?.end).toBeCloseTo(4 * DERIVED_SPEECH_SPAN)
    expect(followAtTime([paragraph], 1.2)).toEqual({
      kind: 'word',
      paragraphIndex: 0,
      wordIndex: 1,
    })
  })

  it('does not treat a missing duration as a downloaded corpus', () => {
    const text = 'Tell me O Muse of that ingenious hero'
    expect(wordsFromManifestParagraph({ duration: 8 })).toBeUndefined()
    expect(wordsFromManifestParagraph({ words: [] })).toBeUndefined()
    expect(wordsFromManifestParagraph({
      words: [{ text: 'Tell', start: Number.NaN, end: 1 }],
    })).toBeUndefined()
    expect(wordsFromParagraphDuration(text, 0)).toBeUndefined()

    const followed = followParagraphFromManifest(0, text, { file: 'p0.mp3' })
    expect(followed.words).toBeUndefined()
    expect(followAtTime([followed], 2).kind).toBe('paragraph')
  })

  it('keeps manifest words and only derives when they are absent', () => {
    const text = '¹ In the beginning God created'
    const derived = wordsFromParagraphDuration(text, 8)
    expect(derived?.map(word => word.text)).toEqual(['¹', 'In', 'the', 'beginning', 'God', 'created'])
    expect(derived?.[0].end).toBeCloseTo(8 * DERIVED_SPEECH_SPAN / 6)
    const kept = ensureDerivedWordTimes({
      index: 0,
      text,
      duration: 8,
      words: [{ text: 'In', start: 0, end: 8 }],
    })
    expect(kept.words).toEqual([{ text: 'In', start: 0, end: 8 }])
  })

  it('walks later paragraphs using their own timings', () => {
    const paragraphs = [
      followParagraphFromManifest(0, 'First', { duration: 2 }),
      followParagraphFromManifest(1, 'Second with words', {
        duration: 3,
        words: [
          { text: 'Second', start: 0, end: 1 },
          { text: 'with', start: 1, end: 2 },
          { text: 'words', start: 2, end: 3 },
        ],
      }),
    ]

    expect(followAtTime(paragraphs, 1)).toEqual({ kind: 'word', paragraphIndex: 0, wordIndex: 0 })
    expect(followAtTime(paragraphs, 3.2)).toEqual({
      kind: 'word',
      paragraphIndex: 1,
      wordIndex: 1,
    })
  })

  it('follows the playing paragraph from audio currentTime, not a chapter clock', () => {
    const paragraphs = [
      followParagraphFromManifest(0, 'First', { duration: 4, file: 'p0.mp3' }),
      followParagraphFromManifest(1, 'Second with words', {
        duration: 3,
        file: 'p1.mp3',
        words: [
          { text: 'Second', start: 0, end: 1 },
          { text: 'with', start: 1, end: 2 },
          { text: 'words', start: 2, end: 3 },
        ],
      }),
    ]

    expect(followFromPlayback({ paragraphs, paragraphIndex: 0, currentTime: 2 })).toEqual({
      kind: 'word',
      paragraphIndex: 0,
      wordIndex: 0,
    })
    expect(followFromPlayback({ paragraphs, paragraphIndex: 1, currentTime: 1.2 })).toEqual({
      kind: 'word',
      paragraphIndex: 1,
      wordIndex: 1,
    })
  })

  it('uses sidecar words only when the manifest paragraph has none', () => {
    const paragraphs = [
      followParagraphFromManifest(0, 'Tell me', {
        duration: 2,
        file: 'p0.mp3',
        words: [{ text: 'Tell', start: 0, end: 0.8 }, { text: 'me', start: 0.8, end: 2 }],
      }),
      followParagraphFromManifest(1, 'So now', { file: 'p1.mp3' }),
    ]
    const merged = mergeSidecarWords(paragraphs, {
      chapter: 1,
      paragraphs: [
        { paragraph: 0, words: [{ text: 'NO', start: 0, end: 2 }] },
        { paragraph: 1, words: [{ text: 'So', start: 0, end: 1 }, { text: 'now', start: 1, end: 2 }] },
      ],
    })
    expect(merged[0].words?.[0].text).toBe('Tell')
    expect(merged[1].words).toEqual([
      { text: 'So', start: 0, end: 1 },
      { text: 'now', start: 1, end: 2 },
    ])
  })

  it('replaces even-split derived times with sidecar start times', () => {
    const text = 'In the beginning God created'
    const derived = followParagraphFromManifest(0, text, { duration: 25, file: 'p0.mp3' })
    expect(derived.words?.[2].text).toBe('beginning')
    const evenStart = 25 * DERIVED_SPEECH_SPAN / 5 * 2
    expect(derived.words?.[2].start).toBeCloseTo(evenStart)

    const merged = mergeSidecarWords([derived], {
      chapter: 1,
      paragraphs: [{
        paragraph: 0,
        file: 'p0.mp3',
        words: [
          { text: 'In', start: 0.05, end: 0.22 },
          { text: 'the', start: 0.22, end: 0.34 },
          { text: 'beginning', start: 0.34, end: 1.15 },
          { text: 'God', start: 1.15, end: 1.45 },
          { text: 'created', start: 1.45, end: 2.05 },
        ],
      }],
    })
    expect(merged[0].words?.[2]).toEqual({ text: 'beginning', start: 0.34, end: 1.15 })
    expect(followFromPlayback({ paragraphs: merged, paragraphIndex: 0, currentTime: 0.5 })).toEqual({
      kind: 'word',
      paragraphIndex: 0,
      wordIndex: 2,
    })
    expect(wordIndexAtTime(derived.words!, 0.5)).toBe(0)
  })
})

describe('wordIndexAtTime', () => {
  it('holds the last word across a timing gap instead of jumping to the start', () => {
    const words = [
      { text: 'Tell', start: 0.05, end: 0.55 },
      { text: 'me,', start: 0.55, end: 0.77 },
      { text: 'O', start: 1.03, end: 1.03 },
      { text: 'Muse,', start: 1.03, end: 1.35 },
    ]
    expect(wordIndexAtTime(words, 0.9)).toBe(1)
    expect(wordIndexAtTime(words, 1.1)).toBe(3)
    expect(wordIndexAtTime(words, 0.1)).toBe(0)
  })
})

describe('derived highlight lag from audio currentTime', () => {
  it('lags 0.20s at 1x and 0.275s at 1.5x for derived timings only', () => {
    expect(followDerivedLagSeconds(1)).toBeCloseTo(0.2)
    expect(followDerivedLagSeconds(1.5)).toBeCloseTo(0.275)
    expect(followDerivedLagSeconds(2)).toBeCloseTo(0.35)
    expect(followTimeFromAudio(0, 1)).toBe(0)
    expect(followTimeFromAudio(1.0, 1)).toBe(1)
    expect(followTimeFromAudio(1.0, 1, true)).toBeCloseTo(0.8)
    expect(followTimeFromAudio(1.0, 1.5, true)).toBeCloseTo(0.725)
  })

  it('does not lag real manifest word timings', () => {
    const words = [
      { text: 'In', start: 0, end: 0.4 },
      { text: 'the', start: 0.4, end: 0.7 },
      { text: 'beginning', start: 0.7, end: 1.3 },
      { text: 'God', start: 1.3, end: 1.7 },
    ]
    for (const rate of [1, 1.5]) {
      expect(wordIndexAtTime(words, followTimeFromAudio(0.45, rate))).toBe(1)
      expect(wordIndexAtTime(words, followTimeFromAudio(0.75, rate))).toBe(2)
    }
  })

  it('delays derived even-split highlights so they do not run ahead of speech', () => {
    const paragraph = followParagraphFromManifest(0, 'In the beginning God', { duration: 4, file: 'p0.mp3' })
    const words = paragraph.words!
    expect(wordIndexAtTime(words, followTimeFromAudio(2.0, 1, false))).toBe(2)
    expect(wordIndexAtTime(words, followTimeFromAudio(2.0, 1, true))).toBe(1)
  })
})
