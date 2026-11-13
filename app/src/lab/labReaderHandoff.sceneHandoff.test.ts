// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { consumeLabReaderHandoffForPage, releaseLabReaderHandoffForPage, sceneHandoffForPage } from './labReaderHandoff'

// A static scene page (/read/{bookId}/{scene}) hands over with a deep link and its action in the hash.
it('reads a scene page\'s action with its deep link, once, and takes both out of the address', () => {
  window.history.replaceState(null, '', '/reader?book=hamlet&chapter=8&edition=modern-en&paragraph=23&word=11&utm_source=google&gclid=abc#scene=explain&sel=23.11-23.22')
  const handoff = consumeLabReaderHandoffForPage()
  expect(handoff).toMatchObject({ bookId: 'hamlet', primaryEditionKey: 'modern-en', savedPlace: { chapterNumber: 8, paragraphIndex: 23, wordIndex: 11 } })
  expect(sceneHandoffForPage()).toEqual({ bookId: 'hamlet', chapterNumber: 8, action: 'explain', selection: { paragraphIndex: 23, wordIndex: 11, endParagraphIndex: 23, endWordIndex: 22 } })
  // Attribution stays; the link and the action leave, so a reload neither moves the place nor repeats the action.
  expect(window.location.pathname + window.location.search + window.location.hash).toBe('/reader?utm_source=google&gclid=abc')
  releaseLabReaderHandoffForPage(handoff)
  expect(consumeLabReaderHandoffForPage()).toBeNull()
  expect(sceneHandoffForPage()).toBeNull()
  releaseLabReaderHandoffForPage(null)
})

it('carries a typed question in the hash only', () => {
  window.history.replaceState(null, '', `/reader?book=hamlet&chapter=8&edition=modern-en#scene=ask&q=${encodeURIComponent('Is Hamlet mad, or pretending?')}`)
  const handoff = consumeLabReaderHandoffForPage()
  expect(sceneHandoffForPage()).toEqual({ bookId: 'hamlet', chapterNumber: 8, action: 'ask', question: 'Is Hamlet mad, or pretending?' })
  expect(window.location.search + window.location.hash).toBe('')
  releaseLabReaderHandoffForPage(handoff)
})

it('ignores a scene action without a deep link, and any other hash', () => {
  window.history.replaceState(null, '', '/reader#scene=primer')
  const none = consumeLabReaderHandoffForPage()
  expect(sceneHandoffForPage()).toBeNull()
  releaseLabReaderHandoffForPage(none)
  window.history.replaceState(null, '', '/reader?book=hamlet&chapter=8#top')
  const handoff = consumeLabReaderHandoffForPage()
  expect(sceneHandoffForPage()).toBeNull()
  expect(window.location.hash).toBe('#top')
  releaseLabReaderHandoffForPage(handoff)
})
