// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { LAB_PREFS_KEY, initialLabCompareView, readStoredCompareView, storeCompareView } from './labPrefs'
import { emptyLabPositionState } from './labPosition'
import { writeLabPositionLocal } from './labPositionStore'

afterEach(() => {
  cleanup()
  try { localStorage.clear() } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

const MAIN = 'Main wording begins here and continues through the main passage.'
const COMPARE = 'Compare wording starts here and continues through the comparison passage.'

function withCompareEdition() {
  localStorage.setItem(LAB_PREFS_KEY, JSON.stringify({
    version: 2,
    shared: { primaryEdition: 'kjv-en', compareEdition: 'web-en', audioEdition: 'kjv-en', audioSpeed: 1, compareOpen: true },
    phone: {},
    desktop: {},
    seenOnce: {},
  }))
}

function renderLayout(layout: 'phone' | 'desktop') {
  return render(
    <LabApp
      pathname={`/lab/${layout}`}
      authToken={null}
      source={{ ...fallbackLabSource(), paragraphs: [MAIN], compareParagraphs: [COMPARE] }}
    />,
  )
}

const compareActive = () => screen.getByTestId('lab-root').getAttribute('data-compare-active')
const showCompareSwitch = () => {
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-editions'))
  return screen.getByTestId('lab-v2-show-compare')
}

describe('Compare view default (Anders, 2026-10-14)', () => {
  it('is on for a phone and off for a desktop, in a book this device has no place for', () => {
    expect(initialLabCompareView({ profile: 'phone', stored: null, savedMode: null })).toBe(true)
    expect(initialLabCompareView({ profile: 'desktop', stored: null, savedMode: null })).toBe(false)
  })

  it('lets the reader’s own choice for the book win in either layout', () => {
    expect(initialLabCompareView({ profile: 'phone', stored: false, savedMode: null })).toBe(false)
    expect(initialLabCompareView({ profile: 'desktop', stored: true, savedMode: null })).toBe(true)
    expect(initialLabCompareView({ profile: 'phone', stored: false, savedMode: 'compare' })).toBe(false)
  })

  it('keeps a book already read in the view its saved place was left in', () => {
    expect(initialLabCompareView({ profile: 'phone', stored: null, savedMode: 'read' })).toBe(false)
    expect(initialLabCompareView({ profile: 'desktop', stored: null, savedMode: 'compare' })).toBe(true)
  })

  it('opens a new book on a phone with Show compare on, the place still the main version’s', () => {
    withCompareEdition()
    renderLayout('phone')
    expect(compareActive()).toBe('true')
    expect(screen.getByTestId('lab-root').getAttribute('data-place')).toBe('0:0')
    expect(screen.getByTestId('lab-root').getAttribute('data-reader-edition')).toBe('web-en')
    expect(showCompareSwitch().getAttribute('aria-checked')).toBe('true')
  })

  it('opens a new book on a desktop with Show compare off', () => {
    withCompareEdition()
    renderLayout('desktop')
    expect(compareActive()).toBe('false')
    expect(showCompareSwitch().getAttribute('aria-checked')).toBe('false')
  })

  it('remembers a phone reader turning it off for the book, and opens the book that way again', () => {
    withCompareEdition()
    const first = renderLayout('phone')
    fireEvent.click(showCompareSwitch())
    expect(compareActive()).toBe('false')
    expect(readStoredCompareView('phone', 'bible')).toBe(false)
    first.unmount()
    renderLayout('phone')
    expect(compareActive()).toBe('false')
    expect(showCompareSwitch().getAttribute('aria-checked')).toBe('false')
  })

  it('remembers a desktop reader turning it on for the book', () => {
    withCompareEdition()
    storeCompareView('desktop', 'bible', true)
    renderLayout('desktop')
    expect(compareActive()).toBe('true')
  })

  it('leaves a phone reader with a place in the book reading the main version', () => {
    withCompareEdition()
    writeLabPositionLocal({
      ...emptyLabPositionState('lab'),
      books: { genesis: { bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 0, wordIndex: 0, readerMode: 'read', updatedAt: 1, deviceId: 'lab', rev: 1 } },
    })
    renderLayout('phone')
    expect(compareActive()).toBe('false')
  })

  it('reopens a book on a desktop in Compare when its saved place was left there', () => {
    withCompareEdition()
    writeLabPositionLocal({
      ...emptyLabPositionState('lab'),
      books: { genesis: { bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 0, wordIndex: 0, readerMode: 'compare', updatedAt: 1, deviceId: 'lab', rev: 1 } },
    })
    renderLayout('desktop')
    expect(compareActive()).toBe('true')
  })

  it('stays off when the reader chose no compare edition', () => {
    localStorage.setItem(LAB_PREFS_KEY, JSON.stringify({
      version: 2,
      shared: { primaryEdition: 'kjv-en', compareEdition: 'web-en', audioEdition: 'kjv-en', audioSpeed: 1, compareOpen: false, compareChosen: true },
      phone: {},
      desktop: {},
      seenOnce: {},
    }))
    renderLayout('phone')
    expect(compareActive()).toBe('false')
    expect(screen.getByTestId('lab-root').getAttribute('data-reader-edition')).toBe('kjv-en')
  })
})
