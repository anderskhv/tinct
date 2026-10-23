// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { notePdfOriginalPlace, readPdfOriginalPlace } from './pdfOriginalPlace'
const HEX = 'ab'.repeat(12)
afterEach(() => { localStorage.clear(); vi.restoreAllMocks() })

it('keeps the PDF revision and zoom, shares its new page, and removes a stale text spot', () => {
  localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: 'a' } }))
  localStorage.setItem(`tinct-addbook:pos:pdf:${HEX}`, JSON.stringify({ page: 3, frac: 0.5, at: 10, zoom: 1.2, rev: 4, chapterNumber: 2, paragraphIndex: 3, wordIndex: 4, converter: 3 }))
  expect(notePdfOriginalPlace(HEX, 'a', { page: 4, frac: 0.25 }, 20)).toBe(true)
  const stored = JSON.parse(localStorage.getItem(`tinct-addbook:pos:pdf:${HEX}`)!)
  expect(stored).toMatchObject({ page: 4, frac: 0.25, zoom: 1.2, rev: 4, edition: 'p', pages: 20 })
  expect(stored.chapterNumber).toBeUndefined()
  expect(readPdfOriginalPlace(HEX)).toEqual({ page: 4, frac: 0.25 })
  expect(notePdfOriginalPlace(HEX, 'a', { page: 4, frac: 0.26 }, 20)).toBe(false)
  expect(notePdfOriginalPlace(HEX, 'b', { page: 8, frac: 0.4 }, 20)).toBe(false)
})
