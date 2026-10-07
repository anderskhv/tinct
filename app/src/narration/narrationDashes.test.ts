import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  alignSegmentsToTokens,
  alignmentKey,
  chunkNarrationText,
  DEFAULT_NARRATION_SETTINGS,
  legacySpokenText,
  narrationCacheIdentity,
  narrationChunkTextCandidates,
  narrationTokens,
  speakableText,
  spokenText,
} from './narrationCore'

/** Spoken text of a whole displayed paragraph, as the provider receives it. */
const speak = (paragraph: string) => spokenText(narrationTokens(paragraph))

const EDITIONS = path.resolve(__dirname, '../../public/data/editions')
function paragraphs(file: string): string[] {
  const data = JSON.parse(fs.readFileSync(path.join(EDITIONS, file), 'utf8')) as { chapters: Array<{ paragraphs: string[] }> }
  return data.chapters.flatMap(chapter => chapter.paragraphs).filter((item): item is string => typeof item === 'string')
}
function find(file: string, needle: string): string {
  const found = paragraphs(file).find(paragraph => paragraph.includes(needle))
  if (!found) throw new Error(`${file} no longer contains ${needle}`)
  return found
}

describe('narration never speaks dashes', () => {
  it('reads an elided year as the number and the following pause (Frankenstein, Letter 1)', () => {
    expect(speak(find('frankenstein-original-en.json', '17—.'))).toBe('St. Petersburgh, Dec. 11th, 17.')
    expect(speak(find('frankenstein-modern-en.json', 'December 11th, 17—.'))).toBe('St. Petersburgh, December 11th, 17.')
    expect(speak('Archangel, March 28th, 17—.')).toBe('Archangel, March 28th, 17.')
  })

  it('turns em dashes, en dashes and double hyphens between words into a comma pause', () => {
    expect(speak('the twentieth of March, 1888—I was returning')).toBe('the twentieth of March, 1888, I was returning')
    expect(speak('a pilot-boat—No. 43—the best in the harbour.”')).toBe('a pilot-boat, No. 43, the best in the harbour.”')
    expect(speak('because he was cowardly and abject -- quite the contrary.')).toBe('because he was cowardly and abject, quite the contrary.')
    expect(speak('read his books--that would be what she would like')).toBe('read his books, that would be what she would like')
    expect(speak('the comparison – and it is a fair one – holds')).toBe('the comparison, and it is a fair one, holds')
  })

  it('lets punctuation already in the sentence carry the pause', () => {
    expect(speak('“Ah, Mr.—Mr. Fogg!” cried she')).toBe('“Ah, Mr. Mr. Fogg!” cried she')
    expect(speak('“I! But I—”')).toBe('“I! But I”')
    expect(speak('sing praises to the Lord—')).toBe('sing praises to the Lord')
    expect(speak('“—and then?”')).toBe('“and then?”')
    expect(speak('The trouble with dolls, papa"--and she put her head on one side')).toBe('The trouble with dolls, papa", and she put her head on one side')
    expect(speak('as she said it--"the trouble with dolls is')).toBe('as she said it, "the trouble with dolls is')
  })

  it('reads blank names and elided places as a short pause, never "dash" or "blank"', () => {
    expect(speak(find('frankenstein-original-en.json', 'the town of ——'))).toContain('the town of, from the place')
    expect(speak(find('great-expectations-original-en.json', 'By G——'))).toBe('“By G, it’s Death!”')
    expect(speak(find('brothers-karamazov-original-en.json', 'brother’s ——,'))).toContain('of your brother’s, I can’t repeat')
    expect(speak(find('crime-and-punishment-original-en.json', 'province of R----.'))).toContain('province of R. He turned')
    expect(speak(find('crime-and-punishment-original-en.json', 'K---- Boulevard'))).toContain('the K, Boulevard')
    expect(speak(find('jane-eyre-original-en.json', 'A.D. ——,'))).toContain('A.D., by Naomi')
    expect(speak('I saw Mr. ——. He bowed.')).toBe('I saw Mr. He bowed.')
    expect(speak('Lowton, ——shire.')).toBe('Lowton, shire.')
  })

  it('reads numeric ranges as "to"', () => {
    expect(speak(find('democracy-in-america-modern-en.json', '(1820–1830)'))).toContain('(1820 to 1830)')
    expect(speak(find('leviathan-modern-en.json', 'Matthew 23:2–3'))).toContain('(Matthew 23:2 to 3)')
    expect(speak(find('democracy-in-america-modern-en.json', 'pp. 135-190.'))).toContain('pp. 135 to 190.')
    expect(speak('The war of 1914–1918 ended.')).toBe('The war of 1914 to 1918 ended.')
    expect(speak('in the years 1820 – 1830')).toBe('in the years 1820 to 1830')
  })

  it('keeps hyphenated words intact', () => {
    expect(speak('a well-known, grown-up, twenty-one-year-old Captain-General')).toBe('a well-known, grown-up, twenty-one-year-old Captain-General')
    expect(speak('twenty-one—or so')).toBe('twenty-one, or so')
  })

  // Chunks four whole editions: seconds of work, so it gets more than the default 5 s.
  it('never leaves a dash or a doubled pause in any featured opening', () => {
    for (const file of ['frankenstein-original-en.json', 'frankenstein-modern-en.json', 'jane-eyre-original-en.json', 'crime-and-punishment-original-en.json']) {
      for (const paragraph of paragraphs(file)) {
        for (const chunk of chunkNarrationText(paragraph)) {
          expect(chunk.text).not.toMatch(/[‒–—―⸺⸻]|--|(?:^|\s)-(?:\s|$)/)
          expect(chunk.text).not.toMatch(/,\s*,|\s[,.;:!?]/)
          expect(chunk.text).not.toMatch(//)
        }
      }
    }
  }, 30_000)

  it('a paragraph of only dashes has nothing to say', () => {
    expect(chunkNarrationText('———————')).toEqual([])
    expect(speakableText('—— --')).toBe('')
  })
})

describe('dash rewriting keeps word timings aligned', () => {
  it('maps the three spoken words of a range back onto the one painted token', () => {
    expect(alignmentKey('1914–1918,')).toBe('1914to1918')
    const tokens = narrationTokens('From 1914–1918 it raged.')
    expect(spokenText(tokens)).toBe('From 1914 to 1918 it raged.')
    const heard = ['From', '1914', 'to', '1918', 'it', 'raged.'].map((text, index) => ({ text, start: index, end: index + 0.9 }))
    const { words, alignment } = alignSegmentsToTokens(tokens, heard)
    expect(alignment.matchRatio).toBe(1)
    expect(words[1]).toEqual({ text: '1914–1918', start: 1, end: 3.9 })
  })

  it('maps "word, word" back onto a dash-joined token and keeps the elided year timed', () => {
    const tokens = narrationTokens('St. Petersburgh, Dec. 11th, 17—. Mr. Fogg—the traveller.')
    const spoken = spokenText(tokens).split(' ')
    expect(spoken).toEqual(['St.', 'Petersburgh,', 'Dec.', '11th,', '17.', 'Mr.', 'Fogg,', 'the', 'traveller.'])
    const heard = spoken.map((text, index) => ({ text, start: index, end: index + 0.9 }))
    const { words, alignment } = alignSegmentsToTokens(tokens, heard)
    expect(alignment.matchRatio).toBe(1)
    expect(words.find(word => word.text === '17—.')).toEqual({ text: '17—.', start: 4, end: 4.9 })
    expect(words.find(word => word.text === 'Fogg—the')).toEqual({ text: 'Fogg—the', start: 6, end: 7.9 })
  })
})

describe('recordings made before the dash rules stay reachable', () => {
  const voice = { provider: 'grok' as const, model: 'grok-tts-v1', voiceId: 'helios', settings: DEFAULT_NARRATION_SETTINGS }
  /** What the narrator was sent before the dash rules (the code as of 2026-10-05). */
  const before = (tokens: string[]) => tokens.filter(token => !/^[⁰¹²³⁴⁵⁶⁷⁸⁹]+$/.test(token)).map(token => token.replace(/[[\]]/g, '')).filter(Boolean).join(' ')

  it('offers the pre-rules recording of a dashed chunk after today\'s, by the identity it was recorded under', async () => {
    const paragraph = find('frankenstein-original-en.json', '17—.')
    const tokens = narrationTokens(paragraph)
    const [chunk] = chunkNarrationText(paragraph)
    expect(chunk.text).not.toContain('—')
    expect(chunk.legacyText).toBe(before(tokens.slice(chunk.wordFrom, chunk.wordTo)))
    expect(chunk.legacyText).toBe(legacySpokenText(tokens, chunk.wordFrom, chunk.wordTo))
    const candidates = await narrationChunkTextCandidates(chunk, voice)
    expect(candidates.map(candidate => candidate.legacy)).toEqual([false, true])
    expect(candidates[0].hash).toBe((await narrationCacheIdentity({ ...voice, text: chunk.text })).hash)
    expect(candidates[1]).toEqual({ legacy: true, text: chunk.legacyText, hash: (await narrationCacheIdentity({ ...voice, text: chunk.legacyText! })).hash })
  })

  it('leaves a chunk the rules do not change with its single identity', async () => {
    const [chunk] = chunkNarrationText('A well-known, twenty-one-year-old traveller arrived.')
    expect(chunk.legacyText).toBeUndefined()
    const candidates = await narrationChunkTextCandidates(chunk, voice)
    expect(candidates).toEqual([{ legacy: false, text: chunk.text, hash: (await narrationCacheIdentity({ ...voice, text: chunk.text })).hash }])
  })

  it('differs from today\'s text only by the dash rules, so edited words never reach an old recording', async () => {
    const original = 'St. Petersburgh, Dec. 11th, 17—. You will rejoice to hear it.'
    const edited = 'St. Petersburgh, Dec. 12th, 17—. You will rejoice to hear it.'
    const [a] = chunkNarrationText(original)
    const [b] = chunkNarrationText(edited)
    expect(speakableText(a.legacyText!)).toBe(a.text)
    const old = new Set((await narrationChunkTextCandidates(a, voice)).map(candidate => candidate.hash))
    for (const candidate of await narrationChunkTextCandidates(b, voice)) expect(old.has(candidate.hash)).toBe(false)
  })

  it('falls back only for chunks the rules changed, and only to that chunk read with its dashes', () => {
    let chunks = 0
    let dashed = 0
    for (const paragraph of paragraphs('frankenstein-original-en.json')) {
      for (const chunk of chunkNarrationText(paragraph)) {
        chunks += 1
        if (chunk.legacyText !== undefined) {
          dashed += 1
          expect(speakableText(chunk.legacyText)).toBe(chunk.text)
        }
      }
    }
    expect(dashed).toBeGreaterThan(0)
    expect(dashed).toBeLessThan(chunks)
  })
})
