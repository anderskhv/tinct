import { describe, expect, it } from 'vitest'
import { alignSegmentsToTokens, chunkNarrationTokens, narrationTokens } from '../narration/narrationCore'
import { alignTimedWordsToText, wordsFromManifestParagraph } from './labFollow'
import { followPlayingClip, type LabAudioClip } from './labListen'

/**
 * Timings the Worker stores for a sentence group (own books and Tinct books
 * alike): one per token of the *spoken* text, which rewrites dashes. A
 * recording made since the dash rules must still paint word by word.
 */
function serverChunk(paragraph: string, language: 'en' | 'da' = 'en') {
  const tokens = narrationTokens(paragraph)
  const [chunk] = chunkNarrationTokens(tokens, undefined, language)
  const spoken = chunk.text.split(' ')
  const segments = spoken.map((text, index) => ({ text: text.replace(/[^\p{L}\p{N}']/gu, ''), start: index * 0.4, end: index * 0.4 + 0.3 }))
  const { words } = alignSegmentsToTokens(spoken, segments, spoken.length * 0.4)
  return { tokens, chunk, words }
}

describe('narration timings for text with dashes', () => {
  it.each([
    'The child—so the books say—needs nothing.',
    'He went—and then she stayed.',
    'It was a — very — strange day.',
    '“—and so it ends,” she said.',
  ])('maps spoken timings back onto every painted word: %s', paragraph => {
    const { tokens, chunk, words } = serverChunk(paragraph)
    const chunkText = tokens.slice(chunk.wordFrom, chunk.wordTo).join(' ')
    const aligned = alignTimedWordsToText(chunkText, wordsFromManifestParagraph({ words } as never))
    expect(aligned).toBeDefined()
    expect(aligned!.map(word => word.text)).toEqual(tokens.slice(chunk.wordFrom, chunk.wordTo))
    for (let index = 1; index < aligned!.length; index += 1) expect(aligned![index].start).toBeGreaterThanOrEqual(aligned![index - 1].start)
  })

  it('a dash-joined word spans both spoken words', () => {
    const { tokens, chunk, words } = serverChunk('He went—and then she stayed.')
    const aligned = alignTimedWordsToText(tokens.slice(chunk.wordFrom, chunk.wordTo).join(' '), wordsFromManifestParagraph({ words } as never))!
    expect(aligned[1]).toMatchObject({ text: 'went—and', start: words![1].start, end: words![2].end })
  })

  it('no paragraph-bar fallback when the chunk has timings: the follow is word by word from the first word', () => {
    const paragraph = 'The child—so the books say—needs nothing.'
    const { tokens, chunk, words } = serverChunk(paragraph)
    const clipWords = alignTimedWordsToText(tokens.slice(chunk.wordFrom, chunk.wordTo).join(' '), wordsFromManifestParagraph({ words } as never))
    const clip: LabAudioClip = {
      kind: 'paragraph', index: 0, file: 'narration-p0-c0.mp3', url: '/api/narration/own/audio?x=1', duration: 4, words: clipWords,
      chunk: { index: 0, count: 1, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo },
      narration: { textHash: 'h', ready: true },
    } as LabAudioClip
    const first = followPlayingClip([{ index: 0, text: paragraph }], clip, 0)
    expect(first).toEqual({ kind: 'word', paragraphIndex: 0, wordIndex: 0 })
    const later = followPlayingClip([{ index: 0, text: paragraph }], clip, 2.1)
    expect(later.kind).toBe('word')
  })

  it('timings for different words are still refused', () => {
    const { words } = serverChunk('He went—and then she stayed.')
    expect(alignTimedWordsToText('She left and then he stayed.', wordsFromManifestParagraph({ words } as never))).toBeUndefined()
  })

  // Danish narration (2026-11-06): a range is spoken "1478 til 1507", not "to".
  it.each([
    ['Danish', 'da', 'Han levede (1478–1507) i Firenze.', 'til'],
    ['English', 'en', 'He lived (1478–1507) in Florence.', 'to'],
  ] as const)('maps a %s numeric range back onto its painted token', (_name, language, paragraph, word) => {
    const { tokens, chunk, words } = serverChunk(paragraph, language)
    expect(chunk.text).toContain(`1478 ${word} 1507`)
    const aligned = alignTimedWordsToText(tokens.slice(chunk.wordFrom, chunk.wordTo).join(' '), wordsFromManifestParagraph({ words } as never))
    expect(aligned!.map(item => item.text)).toEqual(tokens)
    expect(aligned![2]).toMatchObject({ text: '(1478–1507)', start: words![2].start, end: words![4].end })
  })
})
