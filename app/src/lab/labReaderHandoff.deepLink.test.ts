// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { consumeLabReaderHandoffForPage, releaseLabReaderHandoffForPage } from './labReaderHandoff'

it('opens a deep link once, then removes it from the address so a reload keeps the reader\'s place', () => {
  window.history.replaceState(null, '', '/reader?book=odyssey&edition=original-en&chapter=2&layout=phone#top')
  const handoff = consumeLabReaderHandoffForPage()
  expect(handoff).toMatchObject({ bookId: 'odyssey', savedPlace: { chapterNumber: 2 } })
  expect(window.location.pathname + window.location.search + window.location.hash).toBe('/reader?layout=phone#top')
  releaseLabReaderHandoffForPage(handoff)
  // The reload: no chapter in the address, so no hand-off overrides the saved place.
  expect(consumeLabReaderHandoffForPage()).toBeNull()
})

// Production QA 2026-10-09: /reader?book=<id> (the lifecycle emails' link) opened another book.
it('a book-only link opens that book at the place this device saved in it, else its first chapter', async () => {
  const { readerHandoffFromUrlParams } = await import('./labReaderHandoff')
  const { LAB_POSITION_STORAGE_KEY } = await import('./labPosition')
  const link = () => readerHandoffFromUrlParams(new URLSearchParams('book=frankenstein'))
  localStorage.removeItem(LAB_POSITION_STORAGE_KEY)
  expect(link()).toMatchObject({ bookId: 'frankenstein', resumeLatest: true, savedPlace: { chapterNumber: 1, paragraphIndex: 0 } })
  localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({ books: { frankenstein: { bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: 4, sequentialChapter: 4, paragraphIndex: 10, wordIndex: 3, pageIndex: 2, primaryEditionKey: 'original-en', updatedAt: Date.now(), deviceId: 'd', rev: 1 } }, finished: {} }))
  const handoff = link()
  expect(handoff).toMatchObject({ bookId: 'frankenstein', resumeLatest: true, primaryEditionKey: 'original-en', savedPlace: { chapterNumber: 4, paragraphIndex: 10, wordIndex: 3 } })
  expect(handoff?.startAtSavedPlace).toBeFalsy()
  localStorage.removeItem(LAB_POSITION_STORAGE_KEY)
})

// QA 2026-10-14: /reader?book=bible opened Genesis 1 at its start and wrote paragraph 0 over the
// reader's place. Bible places are kept per biblical book (genesis, psalms), never under `bible`.
it('a Bible-only link opens the reader\'s saved Bible place: the settled book, else the newest biblical pin', async () => {
  const { readerHandoffFromUrlParams } = await import('./labReaderHandoff')
  const { LAB_POSITION_STORAGE_KEY } = await import('./labPosition')
  const link = () => readerHandoffFromUrlParams(new URLSearchParams('book=bible'))
  const now = Date.now()
  const pin = (bookId: string, headerBook: string, chapterNumber: number, sequentialChapter: number, paragraphIndex: number, wordIndex: number, updatedAt: number) =>
    ({ bookId, headerBook, chapterNumber, sequentialChapter, paragraphIndex, wordIndex, primaryEditionKey: 'kjv-en', updatedAt, deviceId: 'd', rev: 1 })
  const store = (record: object) => localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({ finished: {}, ...record }))
  localStorage.removeItem(LAB_POSITION_STORAGE_KEY)
  expect(link()).toMatchObject({ bookId: 'bible', resumeLatest: true, savedPlace: { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 } })

  store({ books: { genesis: pin('genesis', 'Genesis', 1, 1, 13, 50, now - 1000) }, lastSettledBookId: 'genesis', lastSettledAt: now - 1000 })
  expect(link()).toMatchObject({ bookId: 'bible', resumeLatest: true, primaryEditionKey: 'kjv-en', savedPlace: { bookId: 'bible', chapterNumber: 1, paragraphIndex: 13, wordIndex: 50 } })

  // A short peek at Romans (newer, never settled) does not displace the settled Psalms place.
  store({
    books: {
      psalms: pin('psalms', 'Psalms', 23, 501, 3, 4, now - 5000),
      romans: pin('romans', 'Romans', 8, 1054, 1, 0, now - 1000),
      odyssey: { ...pin('odyssey', 'The Odyssey', 2, 2, 9, 9, now), primaryEditionKey: 'original-en' },
    },
    lastSettledBookId: 'psalms',
    lastSettledAt: now - 5000,
  })
  expect(link()?.savedPlace).toMatchObject({ chapterNumber: 501, paragraphIndex: 3, wordIndex: 4 })

  // Settled in another book: the newest biblical pin; never another book's chapter, nor an unregistered added book's.
  store({
    books: {
      psalms: pin('psalms', 'Psalms', 23, 501, 3, 4, now - 5000),
      romans: pin('romans', 'Romans', 8, 1054, 1, 0, now - 1000),
      odyssey: { ...pin('odyssey', 'The Odyssey', 2, 2, 9, 9, now), primaryEditionKey: 'original-en' },
      'pd-gut-12345': { ...pin('pd-gut-12345', 'An Added Book', 3, 3, 7, 7, now), primaryEditionKey: 'original-en' },
    },
    lastSettledBookId: 'odyssey',
    lastSettledAt: now,
  })
  expect(link()?.savedPlace).toMatchObject({ chapterNumber: 1054, paragraphIndex: 1, wordIndex: 0 })
  expect(readerHandoffFromUrlParams(new URLSearchParams('book=odyssey'))?.savedPlace).toMatchObject({ chapterNumber: 2, paragraphIndex: 9 })
  localStorage.removeItem(LAB_POSITION_STORAGE_KEY)
})
