// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { clearLocalUserData } from '../services/storage'
import { initialDesktopReaderLayout, readDesktopReaderLayout, storeDesktopReaderLayout } from './labDesktopLayout'
import { storeCompareView } from './labPrefs'

afterEach(() => { localStorage.clear(); vi.restoreAllMocks() })
it('defaults catalogue, EPUB and pasted text to Two-page, and PDF text to Margin', () => {
  expect(initialDesktopReaderLayout({ bookId: 'frankenstein' })).toBe('two-page')
  expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind: 'epub' })).toBe('two-page')
  expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind: 'text' })).toBe('two-page')
  expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind: 'pdf' })).toBe('margin')
})
it('keeps each explicit layout per book and gives an explicit link precedence', () => {
  for (const layout of ['margin', 'two-page', 'compare'] as const) {
    storeDesktopReaderLayout('a', layout)
    expect(initialDesktopReaderLayout({ bookId: 'a' })).toBe(layout)
  }
  expect(initialDesktopReaderLayout({ bookId: 'b' })).toBe('two-page')
  expect(initialDesktopReaderLayout({ bookId: 'a', search: '?view=margin' })).toBe('margin')
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
  expect(initialDesktopReaderLayout({ bookId: 'a' })).toBe('two-page')
  expect(() => storeDesktopReaderLayout('a', 'margin')).not.toThrow()
})
