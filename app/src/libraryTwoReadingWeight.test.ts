import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The library's reading engine (/lab/library-2-reading.js) is fetched with a returning reader's
// library page, before the desk can show. Its static imports pulled in the whole book registry
// (nativeBooks.ts for the Android app, publicBooks.ts for readers' added books): 44 KB over the
// wire and 158 KB of script to parse on every visit, for a function that does nothing on the web
// and one that matters only when an added (pd-…) book opens (2026-10-21, check-library-speed.mjs).
const source = readFileSync(resolve(__dirname, 'libraryTwoReading.ts'), 'utf8')
const staticImports = [...source.matchAll(/^import\s[^;]*?from\s+'([^']+)'/gm)].map(match => match[1])

describe('the library reading engine stays light', () => {
  it('does not import the book registry statically', () => {
    for (const heavy of ['./utils/nativeBooks', './utils/publicBooks', './data/bookRegistry', './preReader/catalogue']) expect(staticImports).not.toContain(heavy)
  })

  it('loads the app\'s books only inside the app, and an added book\'s registry only for that book', () => {
    expect(source).toContain("isNativeCapacitor() ? import('./utils/nativeBooks') : null")
    expect(source).toContain("if (isPublicBookId(bookId)) await (await import('./utils/publicBooks')).ensurePublicBook(bookId)")
  })
})
