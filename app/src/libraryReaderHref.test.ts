import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { opensReader } from '../public/lab/library_2/reader-href.js'

// The Jungle Book, 20 Oct 2026: two readers tapped a book they were reading and went through
// the cover's opening back to the library with no word. The library followed whatever the
// reading engine answered, including its book-page fallback (/library?book=…&view=book-detail).
// Every open now follows only a reader address and otherwise says the book could not open.
const lib = (file: string) => fs.readFileSync(path.resolve(__dirname, '../public/lab/library_2', file), 'utf8')

describe('reader addresses the library follows', () => {
  it('accepts the reader and a reader\'s own book', () => {
    expect(opensReader('/reader')).toBe(true)
    expect(opensReader('/reader?userBook=0123456789abcdef01234567')).toBe(true)
    expect(opensReader('/lab/addbook/?userBook=0123456789abcdef01234567')).toBe(true)
  })
  it('refuses the book-page fallback and anything else', () => {
    expect(opensReader('/library?book=jungle-book&view=book-detail')).toBe(false)
    expect(opensReader('/library')).toBe(false)
    expect(opensReader('')).toBe(false)
    expect(opensReader(null)).toBe(false)
    expect(opensReader(undefined)).toBe(false)
    expect(opensReader('https://example.com/reader')).toBe(false)
  })
})

describe('every way into a book being read checks the answer', () => {
  it('My shelf and Currently reading cards go through the checked open', () => {
    const app = lib('app.js')
    expect(app).toContain("open.onclick=()=>openInReader({id:row.bookId});")
    expect(app).toContain('void openInReader(book);')
    expect(app).toContain("if(!opensReader(href))throw new Error('Reader unavailable');location.assign(href);")
    expect(app).toContain("notice('This book could not open. Please try again.')")
    // No unchecked hand-off is left: each readerDestination answer is tested before it is followed.
    expect(app).not.toMatch(/readerDestination\([^)]*\),new Promise\(r=>setTimeout\(r,240\)\)\]\);location\.assign\(href\)/)
    // Back from the reader (back-forward cache) can open a book again.
    expect(app).toContain('leaving=false;openingReader=false;')
  })
  it('the reading table without its shelf handler says so too', () => {
    const table = lib('reading-table.js')
    expect(table).toMatch(/if \(!demo && view\.api && !opensReader\(href\)\) \{[\s\S]*?options\.onError\?\.\('This book could not open\. Please try again\.'\);[\s\S]*?return;/)
  })
})
