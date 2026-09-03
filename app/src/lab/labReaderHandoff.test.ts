import { describe, expect, it, vi } from 'vitest'
import { LAB_READER_HANDOFF_KEY, consumeLabReaderHandoff, pendingLabSourceForHandoff, prefsFromLabReaderHandoff } from './labReaderHandoff'
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
})
