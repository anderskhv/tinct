import { beforeAll, describe, expect, it } from 'vitest'
import {
  HYPHEN_MIN_HEAD,
  HYPHEN_MIN_TAIL,
  __resetHyphenatorsForTest,
  hyphenLangForEdition,
  hyphenationBreaks,
  hyphenatorReady,
  loadHyphenator,
  longestBreakWithin,
} from './labHyphenate'

/** Render a token with a break applied, the way a page edge shows it. */
function split(token: string, at: number): string {
  return `${token.slice(0, at)}-|${token.slice(at)}`
}

describe('hyphenLangForEdition', () => {
  it.each([
    ['original-en', 'en'],
    ['modern-en', 'en'],
    ['modern-da', 'da'],
  ])('reads %s as %s', (key, lang) => {
    expect(hyphenLangForEdition(key)).toBe(lang)
  })

  it.each([[null], [undefined], [''], ['modern-fr'], ['threads']])('declines to guess for %s', (key) => {
    expect(hyphenLangForEdition(key as string | null)).toBeNull()
  })
})

describe('before the patterns load', () => {
  it('offers no breaks rather than guessing', () => {
    __resetHyphenatorsForTest()
    expect(hyphenatorReady('en')).toBe(false)
    expect(hyphenationBreaks('multitudes', 'en')).toEqual([])
    expect(longestBreakWithin('multitudes', 'en', 6)).toBeNull()
  })
})

describe('English breaks', () => {
  beforeAll(async () => { await loadHyphenator('en') })

  it('loads its patterns', () => {
    expect(hyphenatorReady('en')).toBe(true)
  })

  it('breaks the word that started this: multitudes', () => {
    const points = hyphenationBreaks('multitudes', 'en')
    expect(points.map(at => split('multitudes', at))).toEqual(['mul-|titudes', 'multi-|tudes'])
  })

  it('breaks a word the reader can already see hyphenated inside a line', () => {
    expect(hyphenationBreaks('conspired', 'en').map(at => split('conspired', at))).toEqual(['con-|spired'])
  })

  it('never strands a single letter before the hyphen or fewer than three after', () => {
    for (const word of ['abundance', 'Israel', 'evening', 'understanding', 'firmament']) {
      for (const at of hyphenationBreaks(word, 'en')) {
        expect(at).toBeGreaterThanOrEqual(HYPHEN_MIN_HEAD)
        expect(word.length - at).toBeGreaterThanOrEqual(HYPHEN_MIN_TAIL)
      }
    }
  })

  it.each(['I', 'the', 'and', 'God', 'said'])('leaves the short word %s whole', (word) => {
    expect(hyphenationBreaks(word, 'en')).toEqual([])
  })

  it.each(['well-known', 'to-morrow', 'Beth\u2010shemesh', 'mother-in-law'])(
    'leaves %s alone: a discretionary hyphen beside a real one changes what the book says',
    (word) => { expect(hyphenationBreaks(word, 'en')).toEqual([]) },
  )

  it('still breaks a long name with no hyphen in it', () => {
    expect(hyphenationBreaks('Nebuchadnezzar', 'en').length).toBeGreaterThan(0)
  })

  it('refuses any token carrying a digit, so a verse marker is never broken', () => {
    expect(hyphenationBreaks('11', 'en')).toEqual([])
    expect(hyphenationBreaks('Genesis1', 'en')).toEqual([])
  })

  it('counts offsets against the whole token when it opens with punctuation', () => {
    // The offsets have to index the token as rendered, quote and all, or the
    // page edge would cut in the wrong place.
    const token = '“multitudes'
    expect(hyphenationBreaks(token, 'en').map(at => split(token, at)))
      .toEqual(['“mul-|titudes', '“multi-|tudes'])
  })

  it('keeps an apostrophised word in one piece it can still break', () => {
    expect(hyphenationBreaks("heaven's", 'en').every(at => at > 0)).toBe(true)
  })
})

describe('Danish breaks', () => {
  beforeAll(async () => { await loadHyphenator('da') })

  it('uses Danish patterns, not English ones', () => {
    expect(hyphenationBreaks('forsamlingen', 'da').map(at => split('forsamlingen', at)))
      .toEqual(['for-|samlingen', 'forsam-|lingen', 'forsamlin-|gen'])
  })

  it('breaks everyday Danish correctly', () => {
    expect(hyphenationBreaks('mennesker', 'da').map(at => split('mennesker', at)))
      .toEqual(['men-|nesker', 'menne-|sker'])
  })
})

describe('longestBreakWithin', () => {
  beforeAll(async () => { await loadHyphenator('en') })

  it('takes the most that fits the free space', () => {
    // "multi-" fits in 6 characters; "mul-" would waste the line.
    expect(longestBreakWithin('multitudes', 'en', 6)).toBe(5)
  })

  it('falls back to a shorter break when the space is tight', () => {
    expect(longestBreakWithin('multitudes', 'en', 4)).toBe(3)
  })

  it('returns null when nothing fits, so the page just breaks between words', () => {
    expect(longestBreakWithin('multitudes', 'en', 2)).toBeNull()
  })
})

describe('switching reading language while patterns are in flight', () => {
  it('never applies one language’s patterns to another’s text', async () => {
    __resetHyphenatorsForTest()
    // English starts loading; the reader switches to Danish before it lands.
    const englishLoad = loadHyphenator('en')
    expect(hyphenatorReady('da')).toBe(false)
    // While only English is (about to be) ready, Danish text gets NO breaks —
    // the lookup is per language, so English rules cannot reach Danish words.
    await englishLoad
    expect(hyphenatorReady('en')).toBe(true)
    expect(hyphenatorReady('da')).toBe(false)
    expect(hyphenationBreaks('forsamlingen', 'da')).toEqual([])

    await loadHyphenator('da')
    // Danish patterns now break a Danish word; the English set, asked the same
    // question, has nothing to say about it. Proof the two never cross.
    expect(hyphenationBreaks('k\u00e6rlighed', 'da').length).toBeGreaterThan(0)
    expect(hyphenationBreaks('k\u00e6rlighed', 'en')).toEqual([])
    expect(hyphenationBreaks('mennesker', 'da'))
      .not.toEqual(hyphenationBreaks('mennesker', 'en'))
  })

  it('switching back and forth loads each language once and keeps both correct', async () => {
    __resetHyphenatorsForTest()
    await Promise.all([loadHyphenator('en'), loadHyphenator('da'), loadHyphenator('en')])
    expect(hyphenatorReady('en')).toBe(true)
    expect(hyphenatorReady('da')).toBe(true)
    expect(hyphenationBreaks('multitudes', 'en').length).toBeGreaterThan(0)
    expect(hyphenationBreaks('mennesker', 'da').length).toBeGreaterThan(0)
  })

  it('a language with no patterns yields no breaks rather than the wrong ones', async () => {
    __resetHyphenatorsForTest()
    await loadHyphenator('en')
    // An edition whose key names no supported language never hyphenates.
    expect(hyphenLangForEdition('modern-fr')).toBeNull()
  })
})
