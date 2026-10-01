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
