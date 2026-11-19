import { describe, expect, it } from 'vitest'
import { getBook } from '../data/bookRegistry'
import { OFFERED_DANISH_EDITIONS } from '../data/editionAvailability'
import {
  DEFAULT_NARRATION_SETTINGS,
  alignmentKey,
  chunkNarrationText,
  chunkNarrationTokens,
  isPilotScope,
  narrationCacheIdentity,
  narrationLanguage,
  narrationTokens,
  speakableText,
} from './narrationCore'

/**
 * Danish narration (Anders, 2026-11-06, after a Grok sample in Danish): the
 * offered Danish editions are narrated by streaming in Danish. Before that
 * they were text-only by design; this file pins the new contract.
 */
describe('narration language', () => {
  it('is Danish for exactly the offered Danish editions, English for *-en, and nothing else', () => {
    for (const key of OFFERED_DANISH_EDITIONS) {
      const [bookId, editionKey] = key.split('/')
      expect(narrationLanguage(bookId, editionKey), key).toBe('da')
      expect(isPilotScope(bookId, editionKey, 1), key).toBe(true)
      // The registry agrees: the allowlist only names Danish-language editions.
      expect(getBook(bookId)?.editions.find(edition => edition.key === editionKey)?.language, key).toBe('da')
    }
    expect(narrationLanguage('to-the-lighthouse', 'modern-en')).toBe('en')
    expect(narrationLanguage('master-and-margarita', 'original-ru')).toBeNull()
    // A Danish edition that is not offered stays unnarrated.
    expect(narrationLanguage('odyssey', 'modern-da')).toBeNull()
    expect(isPilotScope('odyssey', 'modern-da', 1)).toBe(false)
  })
})

describe('Danish cache identity', () => {
  const base = { provider: 'grok' as const, model: 'grok-tts-v1', voiceId: 'ara', text: 'Hamlet.', settings: DEFAULT_NARRATION_SETTINGS }
  it('keeps every English recording at the address it was made under', async () => {
    const legacy = await narrationCacheIdentity(base)
    expect((await narrationCacheIdentity({ ...base, language: 'en' })).hash).toBe(legacy.hash)
    expect(legacy.document).not.toContain('language')
  })
  it('never addresses Danish audio as English audio, even for the same characters', async () => {
    const en = await narrationCacheIdentity({ ...base, language: 'en' })
    const da = await narrationCacheIdentity({ ...base, language: 'da' })
    expect(da.hash).not.toBe(en.hash)
    expect(da.textHash).toBe(en.textHash)
  })
})

describe('Danish sentence groups', () => {
  // Over 300 characters, so the chunker has to cut it: where it cuts is the point.
  // Its only sentence ends are before »…« and before Ø, which the English rules do not see.
  const dialogue = 'Han stod længe ved vinduet og så ud over haven, hvor vinden bøjede græsset, og hvor børnene for en time siden havde leget, mens hans kone, som altid, sad med strikketøjet i lyset fra lampen og talte om vejret i morgen. '
    + '»Men du må stå op med lærken, hvis vi skal nå båden, for den venter ikke på nogen, heller ikke på hr. Ramsay,« sagde hun og så på ham. '
    + 'Ønsket var enkelt nok.'
  it('ends sentences at closing guillemets and before Æ, Ø and Å', () => {
    const chunks = chunkNarrationText(dialogue, undefined, 'da')
    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks) expect(chunk.text.length).toBeLessThanOrEqual(300 * 1.2)
    // Every Danish cut falls on a sentence end, never inside one.
    for (const chunk of chunks.slice(0, -1)) expect(chunk.text).toMatch(/[.!?…][«‹]?$/)
    expect(chunks[1].text.startsWith('»Men du må')).toBe(true)
    // `hr.` is a title, not a sentence end.
    expect(chunks.some(chunk => /hr\. Ramsay/.test(chunk.text))).toBe(true)
    // The English rules would have cut this Danish paragraph inside a sentence.
    expect(chunkNarrationText(dialogue).slice(0, -1).some(chunk => !/[.!?…][«‹]?$/.test(chunk.text))).toBe(true)
  })
  it('tiles the paragraph exactly, like the English chunker', () => {
    const tokens = narrationTokens(dialogue)
    const chunks = chunkNarrationTokens(tokens, undefined, 'da')
    expect(chunks[0].wordFrom).toBe(0)
    expect(chunks[chunks.length - 1].wordTo).toBe(tokens.length)
    for (let i = 1; i < chunks.length; i++) expect(chunks[i].wordFrom).toBe(chunks[i - 1].wordTo)
    expect(chunks.every(chunk => chunk.legacyText === undefined)).toBe(true)
  })
  it('leaves English chunking exactly as it was', () => {
    const english = chunkNarrationText(dialogue)
    expect(chunkNarrationText(dialogue, undefined, 'en')).toEqual(english)
  })
  it('reads a numeric range with the Danish word, and the follow key matches it', () => {
    expect(speakableText('(1478–1507)', 'da')).toBe('(1478 til 1507)')
    expect(speakableText('(1478–1507)')).toBe('(1478 to 1507)')
    expect(alignmentKey('1502–1503.', 'da')).toBe(['1502', 'til', '1503'].map(word => alignmentKey(word)).join(''))
  })
})
