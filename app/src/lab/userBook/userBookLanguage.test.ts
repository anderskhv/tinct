import { describe, expect, it } from 'vitest'
import { hyphenLangForEdition, hyphenationBreaks, loadHyphenator } from '../labHyphenate'
import { looksEnglish, userBookLangAttribute, userBookLanguage } from './userBookLanguage'
import { userBookEditionKey, userBookEditions } from './userBookSource'
import { USER_EDITION_CONVERTER, USER_EDITION_FORMAT, type UserBookEdition } from './userEdition'

const ENGLISH = [
  'When a quantum system is measured, the textbooks say, a single, definite outcome was recorded and every other possibility simply vanished.',
  'Yet nothing in the equations suggests that a measurement appear in some privileged place; the universe contains every outcome that the mathematics allows.',
  'Explanations of this kind are bold conjectures about reality, and their value lies in how much they risk: a theory that forbids nothing explains nothing.',
]
const GERMAN = [
  'Wenn ein Quantensystem gemessen wird, sagen die Lehrbücher, wurde ein einziges, bestimmtes Ergebnis aufgezeichnet, und jede andere Möglichkeit verschwand einfach aus der Welt.',
  'Doch nichts in den Gleichungen selbst legt nahe, dass eine Messung an einem bevorzugten Ort erscheint; das Universum enthält jedes Ergebnis, das die Mathematik erlaubt.',
]
const DANISH = [
  'Når et kvantesystem bliver målt, siger lærebøgerne, at der blev registreret et enkelt og bestemt udfald, og at alle andre muligheder simpelthen forsvandt fra verden.',
  'Men intet i ligningerne selv antyder, at en måling finder sted på et privilegeret sted; universet rummer ethvert udfald, som matematikken tillader.',
]

function book(language: string, paragraphs = ENGLISH): UserBookEdition {
  return {
    format: USER_EDITION_FORMAT, converter: USER_EDITION_CONVERTER, title: `Bold Conjectures ${language || 'untagged'} ${paragraphs[0].slice(0, 8)}`,
    author: 'Test Author', language, droppedImages: 0,
    chapters: [{ number: 1, title: 'Measurement', paragraphs }],
  }
}

describe('an own book’s language', () => {
  it.each(['', 'en', 'en-GB', 'en_US', 'eng', 'EN', ' English ', 'und'])('reads English text tagged %j as English, with the phone hyphen plan', async (tag) => {
    const edition = book(tag)
    expect(userBookLanguage(edition)).toBe('en')
    expect(userBookLangAttribute(edition)).toBe('en')
    const key = userBookEditionKey(edition)
    expect(key).toBe('own-en')
    expect(userBookEditions(edition)[0]).toMatchObject({ key: 'own-en', language: 'en' })
    // The key is what the paginators and planner read the language from (LabNativePaginator).
    const lang = hyphenLangForEdition(key)
    expect(lang).toBe('en')
    await loadHyphenator(lang!)
    // "uni-verse" from Anders's screenshot (7 Oct 2026). ("recorded" the en-us
    // patterns leave whole, rec-ord/re-cord, in every book alike.)
    expect(hyphenationBreaks('universe,', lang!, true)).toEqual([3])
    expect(hyphenationBreaks('measurement', lang!, true)).toEqual([3, 7])
  })

  it('never hyphenates another language with English patterns', () => {
    for (const edition of [book('de', GERMAN), book('', GERMAN), book('fr', ENGLISH), book('es', ENGLISH)]) {
      expect(userBookLanguage(edition)).not.toBe('en')
      expect(hyphenLangForEdition(userBookEditionKey(edition))).toBeNull()
    }
    expect(userBookLangAttribute(book('de', GERMAN))).toBe('de')
    expect(userBookLangAttribute(book('ger', GERMAN))).toBe('de')
    // Untagged and not English: no language claimed, so no browser hyphenates it as English.
    expect(userBookLangAttribute(book('', GERMAN))).toBe('')
    expect(userBookLangAttribute(book('es', ENGLISH))).toBe('es')
  })

  it('keeps Danish as Danish', () => {
    expect(userBookEditionKey(book('da-DK', DANISH))).toBe('own-da')
    expect(userBookEditionKey(book('dan', DANISH))).toBe('own-da')
    // An untagged Danish book is not taken for English.
    expect(userBookEditionKey(book('', DANISH))).toBe('own')
  })

  it('needs enough text before calling an untagged book English', () => {
    expect(looksEnglish(['The end.'])).toBe(false)
    expect(looksEnglish(ENGLISH)).toBe(true)
    expect(looksEnglish(GERMAN)).toBe(false)
    expect(looksEnglish(DANISH)).toBe(false)
  })
})
