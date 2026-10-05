import { describe, expect, it, vi } from 'vitest'
import { LAB_READER_HANDOFF_KEY, consumeLabReaderHandoff, pendingLabSourceForHandoff, prefsFromLabReaderHandoff, prefsFromLabResumePlace, readerHandoffFromUrlParams } from './labReaderHandoff'
import { DEFAULT_LAB_PREFS } from './labPrefs'

function storageWith(value: unknown) {
  let raw = JSON.stringify(value)
  return {
    getItem: vi.fn(() => raw),
    removeItem: vi.fn(() => { raw = '' }),
  }
}

describe('Lab reader handoff', () => {
  it('atomically consumes and validates a published-book selection', () => {
    const storage = storageWith({
      kind: 'open-reader',
      bookId: 'odyssey',
      primaryEditionKey: 'original-en',
      compareEditionKey: 'modern-en',
      savedPlace: { bookId: 'odyssey', chapterNumber: 2, page: 3, paragraphIndex: 4, wordIndex: 7 },
    })
    const handoff = consumeLabReaderHandoff(storage)
    expect(storage.getItem).toHaveBeenCalledWith(LAB_READER_HANDOFF_KEY)
    expect(storage.removeItem).toHaveBeenCalledWith(LAB_READER_HANDOFF_KEY)
    expect(handoff).toMatchObject({ bookId: 'odyssey', savedPlace: { chapterNumber: 2, paragraphIndex: 4, wordIndex: 7 } })
    expect(consumeLabReaderHandoff(storage)).toBeNull()
  })

  it('preserves a validated one-use page-start flag only with its saved place', () => {
    const handoff = consumeLabReaderHandoff(storageWith({
      kind: 'open-reader',
      bookId: 'notes-from-underground',
      primaryEditionKey: 'original-en',
      savedPlace: { bookId: 'notes-from-underground', chapterNumber: 1, paragraphIndex: 1, wordIndex: 0 },
      startAtSavedPlace: true,
    }))
    expect(handoff).toMatchObject({ startAtSavedPlace: true, savedPlace: { paragraphIndex: 1, wordIndex: 0 } })

    const withoutPlace = consumeLabReaderHandoff(storageWith({
      kind: 'open-reader', bookId: 'notes-from-underground', primaryEditionKey: 'original-en', startAtSavedPlace: true,
    }))
    expect(withoutPlace).not.toHaveProperty('startAtSavedPlace')
  })

  it('consumes but rejects invalid editions and cross-book saved places', () => {
    const invalidEdition = storageWith({ kind: 'open-reader', bookId: 'odyssey', primaryEditionKey: 'missing' })
    expect(consumeLabReaderHandoff(invalidEdition)).toBeNull()
    expect(invalidEdition.removeItem).toHaveBeenCalled()

    const crossBook = storageWith({
      kind: 'open-reader', bookId: 'odyssey', primaryEditionKey: 'original-en',
      savedPlace: { bookId: 'bible', chapterNumber: 1 },
    })
    expect(consumeLabReaderHandoff(crossBook)).toBeNull()
  })

  it('derives edition prefs and a book-correct loading shell without old Bible text', () => {
    const handoff = consumeLabReaderHandoff(storageWith({
      kind: 'open-reader', bookId: 'ivan-ilyich', primaryEditionKey: 'original-en',
      savedPlace: { bookId: 'ivan-ilyich', chapterNumber: 3 },
    }))!
    const prefs = prefsFromLabReaderHandoff(DEFAULT_LAB_PREFS, handoff)
    const pending = pendingLabSourceForHandoff(handoff)
    expect(prefs.primaryEdition).toBe('original-en')
    // Compare is on by default, paired with the book's other edition.
    expect(prefs).toMatchObject({ compareOpen: true, compareEdition: 'modern-en' })
    // A reader who chose None keeps None.
    expect(prefsFromLabReaderHandoff({ ...DEFAULT_LAB_PREFS, compareOpen: false, compareChosen: true }, handoff).compareOpen).toBe(false)
    expect(pending.bookId).toBe('ivan-ilyich')
    expect(pending.bookTitle).toBe('The Death of Ivan Ilyich')
    expect(pending.paragraphs).toEqual([])
  })

  it('keeps Compare enabled when a library handoff omits a second edition', () => {
    const handoff = consumeLabReaderHandoff(storageWith({
      kind: 'open-reader', bookId: 'odyssey', primaryEditionKey: 'original-en',
    }))!
    expect(prefsFromLabReaderHandoff({ ...DEFAULT_LAB_PREFS, compareOpen: true }, handoff).compareOpen).toBe(true)
  })

  it('keeps Compare enabled when an older saved position has no edition pair', () => {
    const prefs = prefsFromLabResumePlace({ ...DEFAULT_LAB_PREFS, compareOpen: true }, {
      bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 2, sequentialChapter: 2,
      paragraphIndex: 4, wordIndex: 7, pageIndex: 3, primaryEditionKey: 'original-en',
      updatedAt: 100, deviceId: 'reader', rev: 2,
    })
    expect(prefs.compareOpen).toBe(true)
  })

  it('restores the edition pair from the same book tuple used for position', () => {
    const prefs = prefsFromLabResumePlace({ ...DEFAULT_LAB_PREFS, compareOpen: true }, {
      bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 2, sequentialChapter: 2,
      paragraphIndex: 4, wordIndex: 7, pageIndex: 3,
      primaryEditionKey: 'original-en', compareEditionKey: 'modern-en', readerMode: 'compare',
      updatedAt: 100, deviceId: 'reader', rev: 2,
    })
    expect(prefs).toMatchObject({
      primaryEdition: 'original-en', compareEdition: 'modern-en', compareOpen: true,
    })
  })
  it('does not revive Compare from an old position after choosing None', () => {
    const prefs = prefsFromLabResumePlace({ ...DEFAULT_LAB_PREFS, compareOpen: false, compareChosen: true }, {
      bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 2, sequentialChapter: 2,
      paragraphIndex: 4, wordIndex: 7, pageIndex: 3,
      primaryEditionKey: 'original-en', compareEditionKey: 'modern-en', readerMode: 'compare',
      updatedAt: 100, deviceId: 'reader', rev: 2,
    })
    expect(prefs.compareOpen).toBe(false)
  })

})

it('retains an explicit audiobook when returning to a saved book without a new audio choice', () => {
  const handoff = consumeLabReaderHandoff(storageWith({ kind: 'open-reader', bookId: 'the-histories', primaryEditionKey: 'modern-en', savedPlace: { bookId: 'the-histories', chapterNumber: 2, paragraphIndex: 1 } }))
  const prefs = prefsFromLabReaderHandoff({ ...DEFAULT_LAB_PREFS, audioEdition: 'original-en', audioFollowsPrimary: false }, handoff)
  expect(prefs).toMatchObject({ primaryEdition: 'modern-en', audioEdition: 'original-en', audioFollowsPrimary: false })
  expect(handoff?.savedPlace).toMatchObject({ chapterNumber: 2, paragraphIndex: 1 })
})

describe('Reader URL deep link (/reader?book=&edition=&chapter=)', () => {
  const link = (query: string) => readerHandoffFromUrlParams(new URLSearchParams(query))

  it('opens the named chapter and edition, starting at that chapter even over a saved place', () => {
    expect(link('book=odyssey&edition=modern-en&chapter=3')).toMatchObject({
      bookId: 'odyssey',
      primaryEditionKey: 'modern-en',
      startAtSavedPlace: true,
      savedPlace: { bookId: 'odyssey', chapterNumber: 3, paragraphIndex: 0 },
    })
  })

  it('without an edition opens the new-reader default: Modern English with the original in Compare', () => {
    const handoff = link('book=werther&chapter=1')
    expect(handoff).toMatchObject({ primaryEditionKey: 'modern-en', compareEditionKey: 'original-en' })
    expect(prefsFromLabReaderHandoff({ ...DEFAULT_LAB_PREFS, compareOpen: false }, handoff)).toMatchObject({ primaryEdition: 'modern-en', compareEdition: 'original-en', compareOpen: true })
  })

  it('is not a handoff without a chapter, so saved positions are never overridden', () => {
    expect(link('book=odyssey&edition=original-en')).toBeNull()
  })

  it('rejects unknown books, editions and malformed chapters', () => {
    expect(link('book=nope&chapter=1')).toBeNull()
    expect(link('book=odyssey&edition=nope&chapter=1')).toMatchObject({ primaryEditionKey: 'original-en', savedPlace: { chapterNumber: 1 } })
    expect(link('book=odyssey&chapter=0')).toBeNull()
    expect(link('book=odyssey&chapter=abc')).toBeNull()
    expect(link('chapter=2')).toBeNull()
    expect(readerHandoffFromUrlParams(null)).toBeNull()
  })
})

describe('Compare on by default for every entry point (Anders, 2026-10-06)', () => {
  const place = { bookId: 'frankenstein', chapterNumber: 6, paragraphIndex: 0, wordIndex: 0 }
  const handoff = (extra: Record<string, unknown> = {}) => consumeLabReaderHandoff(storageWith({ kind: 'open-reader', bookId: 'frankenstein', primaryEditionKey: 'modern-en', savedPlace: place, ...extra }))!

  it('a library entry without a pair opens AI text with the human edition in Compare', () => {
    expect(prefsFromLabReaderHandoff(DEFAULT_LAB_PREFS, handoff())).toMatchObject({ primaryEdition: 'modern-en', compareEdition: 'original-en', compareOpen: true })
  })

  it('a default pair does not undo a reader’s earlier None', () => {
    const none = { ...DEFAULT_LAB_PREFS, compareOpen: false, compareChosen: true }
    expect(prefsFromLabReaderHandoff(none, handoff({ compareEditionKey: 'original-en' })).compareOpen).toBe(false)
  })

  it('an explicit pick in the introduction is the reader’s new choice: None, or an edition', () => {
    const none = prefsFromLabReaderHandoff(DEFAULT_LAB_PREFS, handoff({ compareChosen: true }))
    expect(none).toMatchObject({ compareOpen: false, compareChosen: true })
    const on = prefsFromLabReaderHandoff({ ...DEFAULT_LAB_PREFS, compareOpen: false, compareChosen: true }, handoff({ compareEditionKey: 'original-en', compareChosen: true }))
    expect(on).toMatchObject({ compareOpen: true, compareEdition: 'original-en', compareChosen: true })
  })

  it('a saved place without a pair resumes with the book’s default pair', () => {
    const prefs = prefsFromLabResumePlace({ ...DEFAULT_LAB_PREFS, compareEdition: 'kjv-en' }, {
      bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: 6, sequentialChapter: 6,
      paragraphIndex: 0, wordIndex: 0, pageIndex: 0, primaryEditionKey: 'modern-en',
      updatedAt: 100, deviceId: 'reader', rev: 2,
    })
    expect(prefs).toMatchObject({ primaryEdition: 'modern-en', compareEdition: 'original-en', compareOpen: true })
  })

  it('a book with no second edition to compare keeps Compare off', () => {
    const fear = consumeLabReaderHandoff(storageWith({ kind: 'open-reader', bookId: 'fear-and-trembling', primaryEditionKey: 'modern-en' }))
    expect(fear).not.toBeNull()
    expect(prefsFromLabReaderHandoff(DEFAULT_LAB_PREFS, fear).compareOpen).toBe(false)
  })
})
