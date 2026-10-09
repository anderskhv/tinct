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
