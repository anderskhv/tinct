import { describe, expect, it } from 'vitest'
import {
  followAtTime,
  followParagraphFromManifest,
  wordsFromManifestParagraph,
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

  it('stays at quiet paragraph-level when words are missing', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me, O Muse', { duration: 4, paragraph: 0 })
    expect(paragraph.words).toBeUndefined()
    expect(followAtTime([paragraph], 1.2)).toEqual({
      kind: 'paragraph',
      paragraphIndex: 0,
    })
  })

  it('does not invent word timings from a word count', () => {
    const text = 'Tell me O Muse of that ingenious hero'
    expect(wordsFromManifestParagraph({ duration: 8 })).toBeUndefined()
    expect(wordsFromManifestParagraph({ words: [] })).toBeUndefined()
    expect(wordsFromManifestParagraph({
      words: [{ text: 'Tell', start: Number.NaN, end: 1 }],
    })).toBeUndefined()

    const followed = followParagraphFromManifest(0, text, { duration: 8 })
    const target = followAtTime([followed], 2)
    expect(target.kind).toBe('paragraph')
    expect(target).not.toMatchObject({ kind: 'word' })
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

    expect(followAtTime(paragraphs, 1)).toEqual({ kind: 'paragraph', paragraphIndex: 0 })
    expect(followAtTime(paragraphs, 3.2)).toEqual({
      kind: 'word',
      paragraphIndex: 1,
      wordIndex: 1,
    })
  })
})
