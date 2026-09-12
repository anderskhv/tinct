import { describe, expect, it } from 'vitest'
import { PRE_READER_CATALOGUE, getBookDetailViewModel, getEditionSelectionViewModel } from './catalogue'
import { BOOKS } from '../data/bookRegistry'
import { isEditionWithheld } from '../data/withheldEditions'
import { bibleEditions, selectableLabEditions } from '../lab/labPrefs'

/**
 * 2026-09-11 withdrew the Bible's `modern-en` and `modern-da` and deleted their
 * JSON. Anything that still OFFERS one hands the reader an edition that 404s —
 * and writes the dead key into their stored preferences, which is what then
 * reached /api/chat and killed in-book retrieval. Nothing selectable may name
 * a withheld edition.
 */
describe('withheld editions are never offered', () => {
  const withheld = [
    { bookId: 'bible', editionKey: 'modern-en' },
    { bookId: 'bible', editionKey: 'modern-da' },
  ]

  it('names exactly the editions this test is guarding', () => {
    for (const entry of withheld) expect(isEditionWithheld(entry.bookId, entry.editionKey)).toBe(true)
  })

  it('keeps them out of the registry itself', () => {
    const bible = BOOKS.find(book => book.id === 'bible')!
    expect(bible.editions.map(edition => edition.key).sort()).toEqual(['kjv-en', 'web-en'])
  })

  it('keeps them out of the built catalogue, for every book', () => {
    for (const book of PRE_READER_CATALOGUE.books) {
      for (const edition of book.editions) {
        expect(isEditionWithheld(book.id, edition.key), `${book.id}/${edition.key}`).toBe(false)
      }
    }
  })

  it('keeps them out of the book page and its edition picker', () => {
    const detail = getBookDetailViewModel('bible')!
    expect(detail.book.editions.map(edition => edition.key).sort()).toEqual(['kjv-en', 'web-en'])

    const selection = getEditionSelectionViewModel('bible')!
    const offered = [
      ...selection.humanEditions,
      ...selection.modernEditions,
      ...(selection.compareEditions ?? []),
      selection.selected,
    ].filter(Boolean)
    expect(offered.length).toBeGreaterThan(0)
    for (const edition of offered) {
      expect(isEditionWithheld('bible', edition.key), edition.key).toBe(false)
    }
  })

  it('keeps them out of the lab reader’s version switcher and Compare selector', () => {
    // Both read the same list; `bookEditions` in LabApp is this function.
    expect(bibleEditions().map(edition => edition.key).sort()).toEqual(['kjv-en', 'web-en'])

    const stale = [
      { key: 'kjv-en', language: 'en', style: 'kjv', label: 'King James Version (1611)', aligned: true },
      { key: 'modern-en', language: 'en', style: 'modern', label: 'Modern English', aligned: true },
      { key: 'web-en', language: 'en', style: 'web', label: 'World English Bible', aligned: true },
    ] as Parameters<typeof selectableLabEditions>[1]
    expect(selectableLabEditions('bible', stale).map(edition => edition.key)).toEqual(['kjv-en', 'web-en'])
    // Another book's modern-en is its own and stays.
    expect(selectableLabEditions('odyssey', stale).map(edition => edition.key)).toEqual(['kjv-en', 'modern-en', 'web-en'])
  })

  it('returns a stable array so reader dependency arrays do not churn', () => {
    // A fresh array per call re-ran the lab source loader on every render and
    // turned one Bible page load into ~1,300 repeat audio-manifest fetches.
    expect(bibleEditions()).toBe(bibleEditions())
    const untouched = [{ key: 'original-en', language: 'en', style: 'original', label: 'Original', aligned: true }] as Parameters<typeof selectableLabEditions>[1]
    expect(selectableLabEditions('odyssey', untouched)).toBe(untouched)
  })
})
