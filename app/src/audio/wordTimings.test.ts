import { describe, expect, it } from 'vitest'
import {
  findWordAtTime,
  mergeWordSidecar,
  paragraphHasWords,
  parseAudioWords,
  parseWordSidecar,
  tokenizeParagraphWords,
  type AudioManifest,
} from './wordTimings'

const WORDS = [
  { text: 'Tell', start: 0.08, end: 0.28 },
  { text: 'me,', start: 0.30, end: 0.46 },
  { text: 'O', start: 0.50, end: 0.62 },
  { text: 'Muse.', start: 0.66, end: 1.05 },
]

describe('parseAudioWords', () => {
  it('accepts valid windows and rejects inverted ones', () => {
    expect(parseAudioWords(WORDS)?.length).toBe(4)
    expect(parseAudioWords([{ text: 'x', start: 1, end: 0.5 }])).toBeUndefined()
    expect(parseAudioWords([])).toBeUndefined()
  })
})

describe('findWordAtTime', () => {
  it('returns the last word whose start has been reached', () => {
    expect(findWordAtTime(WORDS, 0)).toBeNull()
    expect(findWordAtTime(WORDS, 0.2)).toBe(0)
    expect(findWordAtTime(WORDS, 0.4)).toBe(1)
    expect(findWordAtTime(WORDS, 0.48)).toBe(1)
    expect(findWordAtTime(WORDS, 0.7)).toBe(3)
    expect(findWordAtTime(WORDS, 1.4)).toBe(3)
  })

  it('returns null when words are missing', () => {
    expect(findWordAtTime(undefined, 0.2)).toBeNull()
    expect(paragraphHasWords({ paragraph: 0, duration: 1, file: 'p0.mp3' })).toBe(false)
  })
})

describe('tokenizeParagraphWords', () => {
  it('keeps punctuation on the source token', () => {
    const tokens = tokenizeParagraphWords('Tell me, O Muse.')
    expect(tokens.filter(t => t.isWord).map(t => t.text)).toEqual(['Tell', 'me,', 'O', 'Muse.'])
  })
})

describe('mergeWordSidecar', () => {
  const manifest: AudioManifest = {
    chapter: 1,
    title: 'Book 1',
    paragraphs: [
      { paragraph: 0, duration: 1.2, file: 'p0.mp3' },
      { paragraph: 1, duration: 2, file: 'p1.mp3', words: [{ text: 'kept', start: 0, end: 0.4 }] },
    ],
  }

  it('fills only paragraphs that lack words', () => {
    const sidecar = parseWordSidecar({
      chapter: 1,
      paragraphs: [
        { paragraph: 0, words: WORDS },
        { paragraph: 1, words: [{ text: 'nope', start: 0, end: 0.2 }] },
      ],
    })
    const merged = mergeWordSidecar(manifest, sidecar)
    expect(merged.paragraphs[0].words?.[0].text).toBe('Tell')
    expect(merged.paragraphs[1].words?.[0].text).toBe('kept')
  })
})
