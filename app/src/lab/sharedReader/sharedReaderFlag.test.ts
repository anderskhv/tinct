// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { marginPreviewMountForPage } from '../marginPreview/marginPreviewMount'
import { MARGIN_PREVIEW_KEY } from '../marginPreview/marginPreviewFlag'
import { readerHandoffFromUrlParams } from '../labReaderHandoff'
import { readerNamesNoBook } from '../continueLatest'
import { SHARED_READER_DEFAULT, sharedReaderContinueSearch, sharedReaderDestination, sharedReaderEnabled } from './sharedReaderFlag'
// @ts-expect-error -- public development bridge for the static Library module
import { sharedReaderEnabled as librarySharedReaderEnabled } from '../../../public/lab/shared-reader-activation.js'

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
  vi.restoreAllMocks()
})

it('uses one build default in React and Library with absolute URL overrides and no persisted preference', () => {
  const write = vi.spyOn(Storage.prototype, 'setItem')
  expect(librarySharedReaderEnabled).toBe(sharedReaderEnabled)
  expect(sharedReaderEnabled('')).toBe(SHARED_READER_DEFAULT)
  for (const enabled of [false, true]) {
    for (const search of ['', '?sharedReader=true', '?book=frankenstein', '?sharedReader'])
      expect(sharedReaderEnabled(search, enabled)).toBe(enabled)
    expect(sharedReaderEnabled('?book=frankenstein&sharedReader=0', enabled)).toBe(false)
    expect(sharedReaderEnabled('?book=frankenstein&sharedReader=1', enabled)).toBe(true)
    expect(sharedReaderEnabled('?book=frankenstein&margin=1&sharedReader=1', enabled)).toBe(true)
  }
  expect(write).not.toHaveBeenCalled()
})

it('keeps both private and existing margin parameters intact for chapter links and reload', () => {
  const search = '?book=frankenstein&edition=original-en&chapter=3&paragraph=4&word=8&margin=1&sharedReader=1'
  window.history.replaceState(null, '', `/reader${search}`)
  localStorage.setItem(MARGIN_PREVIEW_KEY, '1')
  sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'frankenstein' }))
  expect(sharedReaderEnabled(window.location.search)).toBe(true)
  expect(window.location.search).toBe(search)
  expect(localStorage.getItem(MARGIN_PREVIEW_KEY)).toBe('1')
  expect(sessionStorage.getItem('tinct:lab-reader-handoff')).not.toBeNull()
  const handoff = readerHandoffFromUrlParams(new URLSearchParams(window.location.search))
  expect(handoff?.savedPlace).toMatchObject({ bookId: 'frankenstein', chapterNumber: 3, paragraphIndex: 4, wordIndex: 8 })
  expect(readerNamesNoBook('/reader', sharedReaderContinueSearch(search), null)).toBe(false)
})

it('lets no-book Continue see only its existing keys and carries the switch through the redirect', () => {
  expect(sharedReaderContinueSearch('?sharedReader=1')).toBe('')
  expect(sharedReaderContinueSearch('?layout=desktop&sharedReader=1')).toBe('?layout=desktop')
  expect(readerNamesNoBook('/reader', sharedReaderContinueSearch('?layout=desktop&sharedReader=1'), null)).toBe(true)
  expect(sharedReaderContinueSearch('?book=frankenstein&sharedReader=1&margin=1')).toBe('?book=frankenstein&margin=1')
  expect(sharedReaderDestination('/reader?userBook=abcdef&pages=1#place')).toBe('/reader?userBook=abcdef&pages=1&sharedReader=1#place')
  expect(sharedReaderDestination('/reader?voiceTrial=mini')).toBe('/reader?voiceTrial=mini&sharedReader=1')
  expect(sharedReaderDestination('/library?book=frankenstein')).toBe('/library?book=frankenstein')
  expect(sharedReaderDestination('/lab/addbook/book?userBook=abcdef')).toBe('/lab/addbook/book?userBook=abcdef')
  expect(sharedReaderDestination('https://example.com/reader?book=frankenstein')).toBe('https://example.com/reader?book=frankenstein')
})

it('does not change the old sticky preview decision when the private switch is absent', () => {
  window.history.replaceState(null, '', '/reader?book=frankenstein&margin=1')
  expect(marginPreviewMountForPage(id => id === 'frankenstein', false)).toEqual({ mount: 'frame', bookId: 'frankenstein' })
  expect(localStorage.getItem(MARGIN_PREVIEW_KEY)).toBe('1')
})
