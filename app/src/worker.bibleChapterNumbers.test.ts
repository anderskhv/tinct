import { describe, expect, it, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { createBookRetrieval, parseBookRef, resetBookRetrievalCache, type AssetsBinding } from './worker/lib/bookRetrieval'

/**
 * 2026-09-12: a reader on Jeremiah 49 asked for a recap and was answered about
 * Lamentations 2 — five sequential chapters later. These tests pin the whole
 * numbering chain against the REAL shipped Bible manifest and shards, so any
 * offset introduced between the number the client sends and the shard the
 * Worker reads fails here rather than in front of a reader.
 *
 * The Bible is the only book where an offset is survivable: with 1,189
 * chapters a wrong index still lands on real text, so it reads as a confused
 * answer rather than an error.
 */
const EDITION_DIR = path.resolve(__dirname, '../public/data/editions-chapters/bible-web-en')

function shippedAssets(): AssetsBinding {
  return {
    fetch: async (request: Request) => {
      const pathname = new URL(request.url).pathname
      const prefix = '/data/editions-chapters/bible-web-en/'
      if (!pathname.startsWith(prefix)) return new Response('nope', { status: 404 })
      const file = path.join(EDITION_DIR, pathname.slice(prefix.length))
      if (!fs.existsSync(file)) return new Response('nope', { status: 404 })
      return new Response(fs.readFileSync(file, 'utf8'), { headers: { 'Content-Type': 'application/json' } })
    },
  }
}

const manifest = JSON.parse(fs.readFileSync(path.join(EDITION_DIR, 'manifest.json'), 'utf8')) as {
  chapters: Array<{ number: number; title: string; path: string }>
  sections?: unknown
}

describe('Bible chapter numbering', () => {
  beforeEach(() => resetBookRetrievalCache())

  it('numbers the manifest 1..N with no gaps and no duplicate entries', () => {
    const numbers = manifest.chapters.map(chapter => chapter.number)
    expect(numbers).toEqual(Array.from({ length: numbers.length }, (_, index) => index + 1))
    expect(new Set(manifest.chapters.map(chapter => chapter.path)).size).toBe(manifest.chapters.length)
  })

  it('keeps the landmark chapters where the reader sees them', () => {
    const titleOf = (number: number) => manifest.chapters.find(chapter => chapter.number === number)?.title
    expect(titleOf(1)).toBe('Genesis 1')
    expect(titleOf(794)).toBe('Jeremiah 49')
    expect(titleOf(799)).toBe('Lamentations 2')
    expect(titleOf(manifest.chapters.length)).toBe('Revelation 22')
  })

  // The reported failure was exactly this: ask about N, be answered about N+5.
  it.each([
    [1, 'Genesis 1'],
    [794, 'Jeremiah 49'],
    [799, 'Lamentations 2'],
    [1189, 'Revelation 22'],
  ])('read_chapter(%i) returns %s and nothing else', async (chapterNumber, title) => {
    const retrieval = createBookRetrieval({
      assets: shippedAssets(),
      origin: 'https://tinct.app',
      book: { bookId: 'bible', editionKey: 'web-en', chapterNumber },
    })
    const outcome = await retrieval.readChapter({ chapter: String(chapterNumber) })
    expect(outcome.isError).toBeUndefined()
    expect(outcome.content.startsWith(`Chapter ${chapterNumber} — ${title}`)).toBe(true)
  })

  it('resolves a chapter asked for by its label to the same number', async () => {
    const retrieval = createBookRetrieval({
      assets: shippedAssets(),
      origin: 'https://tinct.app',
      book: { bookId: 'bible', editionKey: 'web-en', chapterNumber: 794 },
    })
    const outcome = await retrieval.readChapter({ chapter: 'Jeremiah 49' })
    expect(outcome.content.startsWith('Chapter 794 — Jeremiah 49')).toBe(true)
  })

  it('does not invent a chapter past the end of the book', async () => {
    const retrieval = createBookRetrieval({
      assets: shippedAssets(),
      origin: 'https://tinct.app',
      book: { bookId: 'bible', editionKey: 'web-en', chapterNumber: 1189 },
    })
    const outcome = await retrieval.readChapter({ chapter: '1194' })
    expect(outcome.isError).toBe(true)
    expect(outcome.content).toContain('1189 chapters')
  })

  it('carries the chapter number through parseBookRef unchanged', () => {
    expect(parseBookRef({ bookId: 'bible', editionKey: 'web-en', chapterNumber: 794 }))
      .toEqual({ bookId: 'bible', editionKey: 'web-en', chapterNumber: 794 })
  })
})
