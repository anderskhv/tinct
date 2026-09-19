import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { LAB_POPULAR_BOOK_IDS } from '../preReader/catalogue'
import {
  NARRATION_CHUNK_MAX_CHARS,
  NARRATION_SCOPE_BOOK_IDS,
  chunkNarrationText,
  chunkNarrationTokens,
  isPilotScope,
  narrationTokens,
  paragraphWordsFromChunks,
} from './narrationCore'

describe('narration scope', () => {
  it('is the featured shelf, English editions, any chapter', () => {
    expect([...NARRATION_SCOPE_BOOK_IDS]).toEqual([...LAB_POPULAR_BOOK_IDS])
    expect(isPilotScope('odyssey', 'original-en', 1)).toBe(true)
    expect(isPilotScope('odyssey', 'modern-en', 24)).toBe(true)
    expect(isPilotScope('bible', 'kjv-en', 1189)).toBe(true)
    expect(isPilotScope('odyssey', 'modern-da', 1)).toBe(false)
    expect(isPilotScope('ulysses', 'original-en', 1)).toBe(false)
    expect(isPilotScope('odyssey', 'original-en', 0)).toBe(false)
  })
})

describe('chunkNarrationTokens', () => {
  const lengths = (chunks: ReturnType<typeof chunkNarrationTokens>) => chunks.map(chunk => chunk.text.length)

  it('tiles the tokens exactly once, in order', () => {
    const text = fs.readFileSync(path.resolve(__dirname, '../../public/data/editions/odyssey-original-en.json'), 'utf8')
    const paragraphs = (JSON.parse(text) as { chapters: Array<{ paragraphs: string[] }> }).chapters[0].paragraphs
    for (const paragraph of paragraphs) {
      const tokens = narrationTokens(paragraph)
      const chunks = chunkNarrationTokens(tokens)
      expect(chunks[0]?.wordFrom).toBe(0)
      expect(chunks[chunks.length - 1]?.wordTo).toBe(tokens.length)
      chunks.forEach((chunk, index) => {
        if (index > 0) expect(chunk.wordFrom).toBe(chunks[index - 1].wordTo)
        expect(chunk.text).toBe(tokens.slice(chunk.wordFrom, chunk.wordTo).join(' '))
        expect(chunk.text.length).toBeLessThanOrEqual(NARRATION_CHUNK_MAX_CHARS * 1.2)
      })
    }
  })

  it('cuts the long quoted speech into groups under the ceiling with no lone-word chunk', () => {
    const text = fs.readFileSync(path.resolve(__dirname, '../../public/data/editions/odyssey-original-en.json'), 'utf8')
    const p18 = (JSON.parse(text) as { chapters: Array<{ paragraphs: string[] }> }).chapters[0].paragraphs[18]
    const chunks = chunkNarrationText(p18)
    expect(chunks.length).toBeGreaterThanOrEqual(6)
    expect(Math.max(...lengths(chunks))).toBeLessThanOrEqual(NARRATION_CHUNK_MAX_CHARS)
    expect(Math.min(...lengths(chunks))).toBeGreaterThanOrEqual(40)
  })

  it('packs whole sentences and does not cut after abbreviations or initials', () => {
    const text = 'Mr. Darcy bowed. J. Alfred Prufrock did not. "Sir," said she. Nothing more.'
    const chunks = chunkNarrationText(text, 40)
    expect(chunks.map(chunk => chunk.text)).toEqual([
      'Mr. Darcy bowed.',
      'J. Alfred Prufrock did not.',
      '"Sir," said she. Nothing more.',
    ])
  })

  it('falls back to clause boundaries, then whole tokens, for an over-long sentence', () => {
    const clause = 'a sentence that runs on and on, with clauses; and more clauses, until it is far too long for one group.'
    const chunks = chunkNarrationText(clause, 40)
    expect(chunks.every(chunk => chunk.text.length <= 48)).toBe(true)
    expect(chunks.map(chunk => chunk.text).join(' ')).toBe(clause)
    const noBoundaries = 'word '.repeat(30).trim()
    const hard = chunkNarrationText(noBoundaries, 24)
    expect(hard.every(chunk => chunk.text.length <= 24)).toBe(true)
    expect(hard.map(chunk => chunk.text).join(' ')).toBe(noBoundaries)
  })

  it('keeps a short paragraph as a single chunk and empty text as none', () => {
    expect(chunkNarrationText('Tell me, O Muse.').length).toBe(1)
    expect(chunkNarrationText('')).toEqual([])
  })

  it('shifts chunk-local words into paragraph time', () => {
    const merged = paragraphWordsFromChunks([
      { duration: 2, words: [{ text: 'a', start: 0, end: 1 }, { text: 'b', start: 1, end: 2 }] },
      { duration: 1.5, words: [{ text: 'c', start: 0.2, end: 1.4 }] },
    ])
    expect(merged.duration).toBe(3.5)
    expect(merged.words[2]).toEqual({ text: 'c', start: 2.2, end: 3.4 })
  })
})
