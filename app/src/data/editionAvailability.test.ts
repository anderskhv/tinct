import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import manifest from './editionAvailability.json'
import { editionHold, isBookTemporarilyHeld } from './editionAvailability'
import { BOOKS, getBook } from './bookRegistry'
import { isBookDiscoverable, isEditionDiscoverable } from './audioAvailability'
import { defaultPrimaryEditionKey, defaultCompareEditionKey } from './editionDefaults'
import { migrateWithheldEdition } from './withheldEditions'
import { selectableLabEditions, migrateLabPrefsEditions, readLabPrefs } from '../lab/labPrefs'
import { createReaderHandoffIntent, getEditionSelectionViewModel, searchPreReaderBooks } from '../preReader/catalogue'

describe('temporary edition holds preserve identities and recovery', () => {
  it('pins every held asset to the bytes independently fetched from production', () => {
    expect(Object.keys(manifest.editions)).toHaveLength(16)
    for (const [key, evidence] of Object.entries(manifest.editions)) {
      const [bookId, editionKey] = key.split('/')
      expect(getBook(bookId)?.editions.some(e => e.key === editionKey), key).toBe(true)
      const bytes = readFileSync(new URL('../../public/data/editions/' + bookId + '-' + editionKey + '.json', import.meta.url))
      expect(createHash('sha256').update(bytes).digest('hex'), key).toBe(evidence.sha256)
      expect(migrateWithheldEdition(bookId, editionKey), key).toBe(editionKey)
    }
  })
  it('never offers a held edition in new defaults or settings, but retains saved handoffs exactly', () => {
    for (const key of Object.keys(manifest.editions)) {
      const [bookId, editionKey] = key.split('/')
      const book = getBook(bookId)!
      expect(selectableLabEditions(bookId, book.editions).some(e => e.key === editionKey)).toBe(false)
      expect(defaultPrimaryEditionKey(bookId, book.editions)).not.toBe(editionKey)
      expect(defaultCompareEditionKey(bookId, book.editions, 'original-en', book.year)).not.toBe(editionKey)
      const savedPlace = { bookId, chapterNumber: 2, paragraphIndex: 7, wordIndex: 3, page: 4 }
      const intent = createReaderHandoffIntent({ bookId, primaryEditionKey: editionKey, savedPlace })
      expect(intent?.primaryEditionKey).toBe(editionKey)
      expect(intent?.savedPlace).toEqual(savedPlace)
      const prefs = { ...readLabPrefs(), primaryEdition: editionKey, compareEdition: editionKey }
      expect(migrateLabPrefsEditions(prefs, bookId).primaryEdition).toBe(editionKey)
      const picker = getEditionSelectionViewModel(bookId)
      expect([...(picker?.humanEditions || []), ...(picker?.modernEditions || [])].some(e => e.key === editionKey)).toBe(false)
    }
  })
  it('hides whole books only when every registered edition is held', () => {
    for (const book of BOOKS) {
      expect(isBookTemporarilyHeld(book.id)).toBe(book.editions.every(e => Boolean(editionHold(book.id, e.key))))
    }
    expect(searchPreReaderBooks('Macbeth').some(book => book.id === 'macbeth')).toBe(false)
    expect(searchPreReaderBooks('As You Like It').some(book => book.id === 'as-you-like-it')).toBe(false)
    expect(isBookDiscoverable('jerusalem')).toBe(true)
    expect(isBookDiscoverable('faust-part-1')).toBe(true)
    expect(defaultPrimaryEditionKey('jerusalem', getBook('jerusalem')!.editions)).toBe('original-en')
    expect(defaultPrimaryEditionKey('faust-part-1', getBook('faust-part-1')!.editions)).toBe('original-de')
    expect(isEditionDiscoverable('faust-part-1', getBook('faust-part-1')!.editions[0])).toBe(true)
  })
})
