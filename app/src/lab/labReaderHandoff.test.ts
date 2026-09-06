import { describe, expect, it, vi } from 'vitest'
import { LAB_READER_HANDOFF_KEY, consumeLabReaderHandoff, labReaderHandoffFromLocation, pendingLabSourceForHandoff, prefsFromLabReaderHandoff, prefsFromLabResumePlace } from './labReaderHandoff'
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
      savedPlace: { bookId: 'odyssey', chapterNumber: 2, page: 3, paragraphIndex: 4 },
    })
    const handoff = consumeLabReaderHandoff(storage)
    expect(storage.getItem).toHaveBeenCalledWith(LAB_READER_HANDOFF_KEY)
    expect(storage.removeItem).toHaveBeenCalledWith(LAB_READER_HANDOFF_KEY)
    expect(handoff).toMatchObject({ bookId: 'odyssey', savedPlace: { chapterNumber: 2 } })
    expect(consumeLabReaderHandoff(storage)).toBeNull()
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
    expect(prefs.compareOpen).toBe(false)
    expect(pending.bookId).toBe('ivan-ilyich')
    expect(pending.bookTitle).toBe('The Death of Ivan Ilyich')
    expect(pending.paragraphs).toEqual([])
  })

  it('restores the edition pair from the same book tuple used for position', () => {
    const prefs = prefsFromLabResumePlace(DEFAULT_LAB_PREFS, {
      bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 2, sequentialChapter: 2,
      paragraphIndex: 4, wordIndex: 7, pageIndex: 3,
      primaryEditionKey: 'original-en', compareEditionKey: 'modern-en', readerMode: 'compare',
      updatedAt: 100, deviceId: 'reader', rev: 2,
    })
    expect(prefs).toMatchObject({
      primaryEdition: 'original-en', compareEdition: 'modern-en', compareOpen: true,
    })
  })
})

describe('Lab reader handoff from the URL', () => {
  it('opens /read/{bookId} on the registry book with its first edition', () => {
    expect(labReaderHandoffFromLocation('/read/odyssey')).toEqual({ kind: 'open-reader', bookId: 'odyssey', primaryEditionKey: 'original-en' })
    expect(labReaderHandoffFromLocation('/read/odyssey/')).toMatchObject({ bookId: 'odyssey' })
  })

  it('honours a chapter in the path and the SEO tour-card chapter/edition query', () => {
    expect(labReaderHandoffFromLocation('/read/odyssey/3')).toMatchObject({ bookId: 'odyssey', primaryEditionKey: 'original-en', savedPlace: { bookId: 'odyssey', chapterNumber: 3 } })
    expect(labReaderHandoffFromLocation('/read/odyssey', '?chapter=2&edition=modern-en')).toMatchObject({ primaryEditionKey: 'modern-en', savedPlace: { chapterNumber: 2 } })
    expect(labReaderHandoffFromLocation('/read/odyssey', '?edition=bogus')).toMatchObject({ primaryEditionKey: 'original-en' })
  })

  it('returns nothing for unknown books and non-reader paths', () => {
    expect(labReaderHandoffFromLocation('/read/not-a-book')).toBeNull()
    expect(labReaderHandoffFromLocation('/read/odyssey/summary')).toBeNull()
    expect(labReaderHandoffFromLocation('/lab/reader')).toBeNull()
    expect(labReaderHandoffFromLocation('/classic')).toBeNull()
  })
})
