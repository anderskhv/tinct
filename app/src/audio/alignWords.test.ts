import { describe, expect, it } from 'vitest'
import {
  alignParagraphWords,
  assertProductionAlignerBackend,
  mapAlignedWordsToSource,
  mergeWordsIntoManifest,
  sidecarFromManifest,
} from './alignWords'
import type { AudioManifest, AudioWord } from './wordTimings'

const SOURCE = 'Tell me, O Muse.'
const WHISPER: AudioWord[] = [
  { text: 'Tell', start: 0.08, end: 0.28 },
  { text: 'me', start: 0.30, end: 0.46 },
  { text: 'O', start: 0.50, end: 0.62 },
  { text: 'Muse', start: 0.66, end: 1.05 },
]

describe('assertProductionAlignerBackend', () => {
  it('rejects linear interpolation as a production path', () => {
    expect(() => assertProductionAlignerBackend('interpolate')).toThrow(/not a production path/)
    expect(() => assertProductionAlignerBackend('linear')).toThrow(/interpolation/)
    expect(() => assertProductionAlignerBackend('word-count')).toThrow(/forbidden/)
    expect(() => assertProductionAlignerBackend('whisper')).not.toThrow()
    expect(() => assertProductionAlignerBackend('fixture')).not.toThrow()
  })
})

describe('mapAlignedWordsToSource', () => {
  it('copies Whisper windows onto source tokens, including punctuation', () => {
    const mapped = mapAlignedWordsToSource(SOURCE, WHISPER)
    expect(mapped.map(w => w.text)).toEqual(['Tell', 'me,', 'O', 'Muse.'])
    expect(mapped[1].start).toBe(0.30)
    expect(mapped[3].end).toBe(1.05)
  })

  it('does not invent times for unmatched source words', () => {
    const mapped = mapAlignedWordsToSource(
      'Tell me, O Muse of Troy.',
      WHISPER,
    )
    expect(mapped.map(w => w.text)).toEqual(['Tell', 'me,', 'O', 'Muse'])
    expect(mapped.every(w => w.start < w.end)).toBe(true)
  })
})

describe('alignParagraphWords', () => {
  it('drops a paragraph when coverage is too low instead of interpolating', () => {
    expect(alignParagraphWords(SOURCE, [{ text: 'hello', start: 0, end: 0.2 }])).toEqual([])
  })

  it('keeps a high-coverage Whisper map', () => {
    expect(alignParagraphWords(SOURCE, WHISPER).length).toBe(4)
  })
})

describe('mergeWordsIntoManifest', () => {
  it('writes words onto matching paragraph entries and builds a sidecar', () => {
    const manifest: AudioManifest = {
      chapter: 1,
      title: 'Book 1',
      paragraphs: [
        { paragraph: -1, duration: 1, file: 'title.mp3' },
        { paragraph: 0, duration: 1.2, file: 'p0.mp3' },
      ],
    }
    const merged = mergeWordsIntoManifest(manifest, new Map([[0, alignParagraphWords(SOURCE, WHISPER)]]))
    expect(merged.paragraphs[0].words).toBeUndefined()
    expect(merged.paragraphs[1].words?.map(w => w.text)).toEqual(['Tell', 'me,', 'O', 'Muse.'])
    const sidecar = sidecarFromManifest(merged, { bookId: 'odyssey', editionKey: 'original-en' })
    expect(sidecar.paragraphs).toHaveLength(1)
    expect(sidecar.paragraphs[0].file).toBe('p0.mp3')
  })
})
