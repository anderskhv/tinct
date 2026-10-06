import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  alignSegmentsToTokens,
  alignmentKey,
  chunkNarrationText,
  DEFAULT_NARRATION_SETTINGS,
  NARRATION_CACHE_VERSION,
  NARRATION_CHUNKER_VERSION,
  NARRATION_SPOKEN_TEXT_VERSION,
  narrationReplayIdentity,
  sha256Hex,
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
  })

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

describe('devices stop replaying recordings made before the dash rules', () => {
  it('changes the replay identity with the spoken-text version', async () => {
    const voice = { provider: 'grok' as const, model: 'grok-tts-v1', voiceId: 'helios', settings: DEFAULT_NARRATION_SETTINGS }
    const before = await sha256Hex(JSON.stringify([NARRATION_CACHE_VERSION, NARRATION_CHUNKER_VERSION, 'grok', 'grok-tts-v1', 'helios', DEFAULT_NARRATION_SETTINGS]))
    expect(NARRATION_SPOKEN_TEXT_VERSION).toBe(2)
    expect(await narrationReplayIdentity(voice, 1)).toBe(before)
    expect(await narrationReplayIdentity(voice)).not.toBe(before)
    expect(await narrationReplayIdentity(voice)).toBe(await narrationReplayIdentity(voice))
  })
})
