// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { notePdfOriginalPlace, notePdfOriginalZoom, readPdfOriginalPlace, readPdfOriginalZoom } from './pdfOriginalPlace'
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

it('restores and keeps PDF page size on this device without changing page, revision or account place', () => {
  localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: 'a' } }))
  const key = `tinct-addbook:pos:pdf:${HEX}`
  localStorage.setItem(key, JSON.stringify({ page: 7, frac: 0.4, rev: 6, at: 100, zoom: 1.2 }))
  expect(readPdfOriginalZoom(HEX, 'a')).toBe(1.2)
  expect(readPdfOriginalZoom(HEX, 'b')).toBe(1)
  expect(notePdfOriginalZoom(HEX, 'a', 1.6)).toBe(true)
  expect(JSON.parse(localStorage.getItem(key)!)).toEqual({ page: 7, frac: 0.4, rev: 6, at: 100, zoom: 1.6 })
  expect(notePdfOriginalZoom(HEX, 'b', 2)).toBe(false)
  expect(notePdfOriginalZoom(HEX, 'a', Number.POSITIVE_INFINITY)).toBe(false)
  expect(notePdfOriginalZoom(HEX, 'a', 4)).toBe(false)
  expect(readPdfOriginalZoom(HEX, 'a')).toBe(1.6)
})

it('commits an unchanged visible spot on a view handoff so an older text tuple cannot win',()=>{
  localStorage.setItem('sb-test-auth-token',JSON.stringify({user:{id:'a'}}))
  const key=`tinct-addbook:pos:pdf:${HEX}`
  localStorage.setItem(key,JSON.stringify({page:4,frac:.6,at:10,rev:3,chapterNumber:1,paragraphIndex:8,wordIndex:3,converter:1}))
  expect(notePdfOriginalPlace(HEX,'a',{page:4,frac:.6},8,true)).toBe(true)
  const stored=JSON.parse(localStorage.getItem(key)!)
  expect(stored).toMatchObject({page:4,frac:.6,rev:3,pages:8,edition:'p'})
  expect(stored.at).toBeGreaterThan(10)
  expect(stored.paragraphIndex).toBeUndefined()
})
