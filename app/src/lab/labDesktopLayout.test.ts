// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { clearLocalUserData } from '../services/storage'
import { defaultDesktopReaderLayout, initialDesktopReaderLayout, isIpadLandscape, readDesktopReaderLayout, storeDesktopReaderLayout } from './labDesktopLayout'
import { storeCompareView } from './labPrefs'

afterEach(() => { localStorage.clear(); vi.restoreAllMocks() })
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
const desktopMouse = { userAgent: MAC, platform: 'MacIntel', maxTouchPoints: 0, landscape: true }
const ipadLandscape = { userAgent: MAC, platform: 'MacIntel', maxTouchPoints: 5, landscape: true }
// Anders, 4 Nov 2026: Margin on the desktop for every kind of book; Two-page on an iPad in landscape.
it('defaults catalogue, EPUB, pasted text and PDF text to Margin on a desktop', () => {
  expect(initialDesktopReaderLayout({ bookId: 'frankenstein' })).toBe('margin')
  for (const kind of ['epub', 'text', 'pdf']) {
    expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind })).toBe('margin')
    expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind, device: desktopMouse })).toBe('margin')
  }
  expect(initialDesktopReaderLayout({ bookId: 'frankenstein', device: desktopMouse })).toBe('margin')
})
it('defaults an iPad in landscape to Two-page, whether it reports a Mac or an iPad user agent', () => {
  expect(initialDesktopReaderLayout({ bookId: 'frankenstein', device: ipadLandscape })).toBe('two-page')
  expect(isIpadLandscape(ipadLandscape)).toBe(true)
  expect(isIpadLandscape({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)', maxTouchPoints: 5, landscape: true })).toBe(true)
  expect(isIpadLandscape({ ...ipadLandscape, landscape: false })).toBe(false)
  expect(isIpadLandscape({ ...ipadLandscape, maxTouchPoints: 1 })).toBe(false)
  expect(isIpadLandscape({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', platform: 'Win32', maxTouchPoints: 10, landscape: true })).toBe(false)
  expect(defaultDesktopReaderLayout(desktopMouse)).toBe('margin')
  expect(defaultDesktopReaderLayout({})).toBe('margin')
})
it('keeps every explicit choice and link over the device default', () => {
  for (const device of [desktopMouse, ipadLandscape]) {
    for (const layout of ['margin', 'two-page', 'compare'] as const) {
      expect(initialDesktopReaderLayout({ bookId: 'x', search: `?view=${layout}`, device })).toBe(layout)
      storeDesktopReaderLayout('x', layout)
      expect(initialDesktopReaderLayout({ bookId: 'x', device })).toBe(layout)
    }
    localStorage.clear()
    expect(initialDesktopReaderLayout({ bookId: 'x', savedMode: 'compare', device })).toBe('compare')
    localStorage.setItem('tinct-addbook:epub-view:abc', JSON.stringify('text'))
    expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind: 'epub', device })).toBe('two-page')
    localStorage.setItem('tinct-addbook:epub-view:abc', JSON.stringify('margin'))
    expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind: 'epub', device })).toBe('margin')
    localStorage.clear()
  }
})
it('keeps each explicit layout per book and gives an explicit link precedence', () => {
  for (const layout of ['margin', 'two-page', 'compare'] as const) {
    storeDesktopReaderLayout('a', layout)
    expect(initialDesktopReaderLayout({ bookId: 'a' })).toBe(layout)
  }
  expect(initialDesktopReaderLayout({ bookId: 'b' })).toBe('margin')
  expect(initialDesktopReaderLayout({ bookId: 'a', search: '?view=two-page' })).toBe('two-page')
})
it('migrates legacy explicit choices without letting saved Compare override a newer choice', () => {
  storeCompareView('desktop', 'a', true)
  expect(initialDesktopReaderLayout({ bookId: 'a' })).toBe('compare')
  storeCompareView('desktop', 'a', false)
  expect(initialDesktopReaderLayout({ bookId: 'a', savedMode: 'compare' })).toBe('margin')
  localStorage.setItem('tinct-addbook:epub-view:abc', JSON.stringify('margin'))
  expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind: 'epub' })).toBe('margin')
  storeDesktopReaderLayout('own', 'two-page')
  expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind: 'epub' })).toBe('two-page')
})
it('rejects damaged preferences and clears book choices on sign-out', () => {
  localStorage.setItem('tinct:reader-desktop-layout', '{broken')
  expect(readDesktopReaderLayout('a')).toBeNull()
  storeDesktopReaderLayout('a', 'margin')
  expect(readDesktopReaderLayout('a')).toBe('margin')
  localStorage.removeItem('tinct:reader-desktop-layout')
  storeDesktopReaderLayout('a', 'margin')
  clearLocalUserData()
  expect(readDesktopReaderLayout('a')).toBeNull()
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw Error('blocked') })
  expect(initialDesktopReaderLayout({ bookId: 'a' })).toBe('margin')
  expect(() => storeDesktopReaderLayout('a', 'margin')).not.toThrow()
})
