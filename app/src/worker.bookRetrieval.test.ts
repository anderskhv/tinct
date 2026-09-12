import { beforeEach, describe, expect, it } from 'vitest'
import {
  createBookRetrieval,
  FIND_MAX_MATCHES,
  FIND_SCAN_CAP,
  findScanOrder,
  parseBookRef,
  parseReadingTrailChapters,
  READ_CHAPTER_MAX_CHARS,
  renderChapterForTool,
  resetBookRetrievalCache,
} from './worker/lib/bookRetrieval'

const BIBLE_SECTIONS = [{
  title: 'Old Testament',
  sections: [{
    title: 'Prophets',
    sections: [
      { title: 'Isaiah', chapters: Array.from({ length: 66 }, (_, i) => 680 + i) },
      { title: 'Jeremiah', chapters: Array.from({ length: 52 }, (_, i) => 746 + i) },
      { title: 'Lamentations', chapters: Array.from({ length: 5 }, (_, i) => 798 + i) },
    ],
  }],
}]

function assetsWith(input: {
  total: number
  sections?: unknown
  text?: (number: number) => string[] | null
  manifest?: boolean
  whole?: boolean
}) {
  const fetches: string[] = []
  const chapters = Array.from({ length: input.total }, (_, i) => ({ number: i + 1, title: `Chapter ${i + 1}` }))
  const assets = {
    fetch: async (request: Request) => {
      const path = new URL(request.url).pathname
      fetches.push(path)
      if (path.endsWith('/manifest.json')) {
        if (input.manifest === false) return new Response('nope', { status: 404 })
        return Response.json({ chapters, sections: input.sections })
      }
      if (path.startsWith('/data/editions/')) {
        if (!input.whole) return new Response('nope', { status: 404 })
        return Response.json({
          chapters: chapters.map(chapter => ({ ...chapter, paragraphs: input.text?.(chapter.number) ?? ['plain text'] })),
        })
      }
      const number = Number(path.match(/ch(\d{4})\.json$/)?.[1])
      const paragraphs = input.text ? input.text(number) : ['plain text']
      if (!paragraphs) return new Response('nope', { status: 404 })
      return Response.json({ number, title: `Chapter ${number}`, paragraphs })
    },
  }
  return { assets, fetches }
}

describe('book retrieval input parsing', () => {
  it('accepts only safe ids and integer chapters', () => {
    expect(parseBookRef({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 782 })).toEqual({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 782 })
    expect(parseBookRef({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: '782' })).toEqual({ bookId: 'bible', editionKey: 'kjv-en' })
    expect(parseBookRef({ bookId: '../etc', editionKey: 'kjv-en' })).toBeNull()
    expect(parseBookRef({ bookId: 'bible' })).toBeNull()
    expect(parseBookRef('bible')).toBeNull()
    expect(parseReadingTrailChapters([{ chapterNumber: 777 }, { chapterNumber: 777 }, { chapterNumber: 'x' }, 781, { chapterNumber: -1 }])).toEqual([777, 781])
    expect(parseReadingTrailChapters(Array.from({ length: 40 }, (_, i) => ({ chapterNumber: i + 1 })))).toHaveLength(10)
  })
})

describe('findScanOrder', () => {
  it('scans the current book section nearest-first, then the trail, then outward, under the cap', () => {
    const chapters = Array.from({ length: 1189 }, (_, i) => i + 1)
    const order = findScanOrder({ chapters, current: 782, trail: [12, 777], sections: BIBLE_SECTIONS })
    expect(order.length).toBeLessThanOrEqual(FIND_SCAN_CAP)
    // Current chapter, then the chapters the reader actually visited, then the
    // rest of the current biblical book outward. The trail goes before the
    // section: Jeremiah alone is 52 chapters and would otherwise fill the cap.
    expect(order.slice(0, 5)).toEqual([782, 777, 12, 781, 783])
    const jeremiah = new Set(Array.from({ length: 52 }, (_, i) => 746 + i))
    expect(order.slice(2).every(number => number === 12 || jeremiah.has(number))).toBe(true)
    expect(order.indexOf(12)).toBeLessThan(order.indexOf(780))
    expect(new Set(order).size).toBe(order.length)
  })

  it('ignores unknown chapters and works without sections', () => {
    const order = findScanOrder({ chapters: [1, 2, 3, 4, 5], current: 3, trail: [99], cap: 4 })
    expect(order).toEqual([3, 2, 4, 1])
  })
})

describe('read_chapter', () => {
  beforeEach(() => resetBookRetrievalCache())

  it('reads by number or exact label and trims long chapters with a note', async () => {
    const long = Array.from({ length: 40 }, (_, i) => `Paragraph ${i + 1} ${'lorem ipsum '.repeat(30)}`)
    const { assets, fetches } = assetsWith({ total: 10, text: () => long })
    const retrieval = createBookRetrieval({ assets, origin: 'https://tinct.app', book: { bookId: 'test-book', editionKey: 'orig-en', chapterNumber: 3 } })
    const byNumber = await retrieval.readChapter({ chapterNumber: 3 })
    expect(byNumber.isError).toBeUndefined()
    expect(byNumber.content.startsWith('Chapter 3 — Chapter 3')).toBe(true)
    expect(byNumber.content.length).toBeLessThanOrEqual(READ_CHAPTER_MAX_CHARS + 200)
    expect(byNumber.content).toContain('[Trimmed:')
    const byLabel = await retrieval.readChapter({ label: 'chapter 4' })
    expect(byLabel.isError).toBeUndefined()
    expect(byLabel.content).toContain('Chapter 4 — Chapter 4')
    // Second read of chapter 3 comes from the per-request cache.
    await retrieval.readChapter({ chapterNumber: 3 })
    expect(fetches.filter(path => path.endsWith('ch0003.json'))).toHaveLength(1)
    expect(renderChapterForTool({ number: 1, title: 'Genesis 1', paragraphs: ['a', 'b c d e', '   '] })).toBe('Chapter 1 — Genesis 1\n\n[1] a\n\n[2] b c d e')
  })

  it('rejects malformed input and unknown chapters without throwing', async () => {
    const { assets } = assetsWith({ total: 3 })
    const retrieval = createBookRetrieval({ assets, origin: 'https://tinct.app', book: { bookId: 'test-book', editionKey: 'orig-en' } })
    expect((await retrieval.readChapter(null)).isError).toBe(true)
    expect((await retrieval.readChapter({})).isError).toBe(true)
    expect((await retrieval.readChapter({ chapterNumber: 0 })).isError).toBe(true)
    expect((await retrieval.readChapter({ chapterNumber: 1.5 })).isError).toBe(true)
    expect((await retrieval.readChapter({ label: 'Nowhere 9' })).isError).toBe(true)
    const missing = await retrieval.readChapter({ chapterNumber: 9 })
    expect(missing.isError).toBe(true)
    expect(missing.content).toContain('3 chapters')
  })

  it('falls back to the whole-book edition file when the edition is not sharded', async () => {
    const { assets, fetches } = assetsWith({ total: 4, manifest: false, whole: true, text: number => [`Whole book chapter ${number}`] })
    const retrieval = createBookRetrieval({ assets, origin: 'https://tinct.app', book: { bookId: 'odyssey', editionKey: 'modern-da', chapterNumber: 2 } })
    const chapter = await retrieval.readChapter({ chapterNumber: 4 })
    expect(chapter.isError).toBeUndefined()
    expect(chapter.content).toContain('Whole book chapter 4')
    const found = JSON.parse((await retrieval.findInBook({ query: 'CHAPTER 3' })).content) as { matches: Array<{ chapterNumber: number }> }
    expect(found.matches.map(match => match.chapterNumber)).toEqual([3])
    expect(fetches).toEqual(['/data/editions-chapters/odyssey-modern-da/manifest.json', '/data/editions/odyssey-modern-da.json'])
  })
})

describe('find_in_book', () => {
  beforeEach(() => resetBookRetrievalCache())

  it('bounds the scan on a 1,189-chapter book and reports an incomplete search', async () => {
    const { assets, fetches } = assetsWith({ total: 1189, sections: BIBLE_SECTIONS, text: () => ['nothing to see here'] })
    const retrieval = createBookRetrieval({ assets, origin: 'https://tinct.app', book: { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 782 }, trailChapters: [777] })
    const result = JSON.parse((await retrieval.findInBook({ query: 'Zedekiah' })).content) as {
      matches: unknown[]
      scanned: { chapters: number; ofChapters: number; complete: boolean }
    }
    expect(result.matches).toEqual([])
    expect(result.scanned).toEqual({ chapters: FIND_SCAN_CAP, ofChapters: 1189, complete: false })
    expect(fetches.filter(path => /ch\d{4}\.json$/.test(path))).toHaveLength(FIND_SCAN_CAP)
  })

  it('stops at FIND_MAX_MATCHES, nearest chapters first, with paragraph snippets', async () => {
    const { assets, fetches } = assetsWith({
      total: 1189,
      sections: BIBLE_SECTIONS,
      text: number => (number >= 746 && number <= 797 ? [`¹ In Jeremiah ${number - 745} Zedekiah spoke.`, 'other'] : ['nothing']),
    })
    const retrieval = createBookRetrieval({ assets, origin: 'https://tinct.app', book: { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 782 } })
    const result = JSON.parse((await retrieval.findInBook({ query: 'zedekiah' })).content) as {
      matches: Array<{ chapterNumber: number; label: string; paragraph: number; text: string }>
      scanned: { complete: boolean }
    }
    expect(result.matches).toHaveLength(FIND_MAX_MATCHES)
    expect(result.matches.every(match => match.chapterNumber >= 746 && match.chapterNumber <= 797)).toBe(true)
    expect(result.matches.every(match => match.paragraph === 1 && match.text.includes('Zedekiah'))).toBe(true)
    expect(result.scanned.complete).toBe(true)
    expect(fetches.filter(path => /ch\d{4}\.json$/.test(path)).length).toBeLessThan(20)
  })

  it('rejects an empty or too-short query', async () => {
    const { assets } = assetsWith({ total: 3 })
    const retrieval = createBookRetrieval({ assets, origin: 'https://tinct.app', book: { bookId: 'test-book', editionKey: 'orig-en' } })
    expect((await retrieval.findInBook({})).isError).toBe(true)
    expect((await retrieval.findInBook({ query: 'a' })).isError).toBe(true)
    expect((await retrieval.findInBook({ query: 42 })).isError).toBe(true)
  })
})

/**
 * 2026-09-12 P0: the Bible's `modern-en` was withdrawn and its JSON deleted.
 * A reader still holding that key in their lab preferences sent it to
 * /api/chat, retrieval 404'd on every path, and the tool round died with
 * `The book text is not available right now.` — which collapsed the turn and
 * latched the Ask panel into "Ask is unavailable right now".
 */
describe('withheld and missing editions', () => {
  beforeEach(() => resetBookRetrievalCache())

  /** Serves only the edition ids listed; everything else 404s, as production does. */
  function assetsForEditions(available: string[], total = 5) {
    const fetches: string[] = []
    const chapters = Array.from({ length: total }, (_, i) => ({ number: i + 1, title: `Chapter ${i + 1}` }))
    const assets = {
      fetch: async (request: Request) => {
        const path = new URL(request.url).pathname
        fetches.push(path)
        const editionId = path.match(/\/data\/editions-chapters\/([^/]+)\//)?.[1]
          ?? path.match(/\/data\/editions\/([^/]+)\.json$/)?.[1]
        if (!editionId || !available.includes(editionId)) return new Response('nope', { status: 404 })
        if (path.endsWith('/manifest.json')) return Response.json({ chapters })
        const number = Number(path.match(/ch(\d{4})\.json$/)?.[1])
        return Response.json({ number, title: `Chapter ${number}`, paragraphs: [`${editionId} paragraph one`] })
      },
    }
    return { assets, fetches }
  }

  it('migrates a withheld edition key before it can reach retrieval', () => {
    expect(parseBookRef({ bookId: 'bible', editionKey: 'modern-en', chapterNumber: 1 }))
      .toEqual({ bookId: 'bible', editionKey: 'web-en', chapterNumber: 1 })
    expect(parseBookRef({ bookId: 'bible', editionKey: 'modern-da' })?.editionKey).toBe('web-en')
    // A published edition is untouched.
    expect(parseBookRef({ bookId: 'bible', editionKey: 'kjv-en' })?.editionKey).toBe('kjv-en')
    // The policy is per book: another book's modern-en is still its own.
    expect(parseBookRef({ bookId: 'odyssey', editionKey: 'modern-en' })?.editionKey).toBe('modern-en')
  })

  it('reads the successor edition when the requested one 404s', async () => {
    const { assets, fetches } = assetsForEditions(['bible-web-en'])
    const retrieval = createBookRetrieval({
      assets,
      origin: 'https://tinct.app',
      book: { bookId: 'bible', editionKey: 'modern-en', chapterNumber: 1 },
    })
    const outcome = await retrieval.readChapter({ chapter: '1' })
    expect(outcome.isError).toBeUndefined()
    expect(outcome.content).toContain('bible-web-en paragraph one')
    expect(fetches.some(path => path.includes('bible-modern-en'))).toBe(false)
  })

  it('falls back to an available edition when the key was never published', async () => {
    const { assets } = assetsForEditions(['bible-kjv-en'])
    const retrieval = createBookRetrieval({
      assets,
      origin: 'https://tinct.app',
      book: { bookId: 'bible', editionKey: 'made-up-en', chapterNumber: 2 },
    })
    const outcome = await retrieval.readChapter({ chapter: '2' })
    expect(outcome.isError).toBeUndefined()
    expect(outcome.content).toContain('bible-kjv-en paragraph one')
    expect(outcome.content).toContain('no longer available')
  })

  it('searches the fallback edition and says so in the result', async () => {
    const { assets } = assetsForEditions(['bible-kjv-en'])
    const retrieval = createBookRetrieval({
      assets,
      origin: 'https://tinct.app',
      book: { bookId: 'bible', editionKey: 'made-up-en', chapterNumber: 1 },
    })
    const outcome = await retrieval.findInBook({ query: 'paragraph one' })
    expect(outcome.isError).toBeUndefined()
    const result = JSON.parse(outcome.content) as { edition?: string; matches: unknown[] }
    expect(result.edition).toBe('kjv-en')
    expect(result.matches.length).toBeGreaterThan(0)
  })

  it('degrades without an error when no edition of the book can be read', async () => {
    const { assets } = assetsForEditions([])
    const retrieval = createBookRetrieval({
      assets,
      origin: 'https://tinct.app',
      book: { bookId: 'bible', editionKey: 'modern-en', chapterNumber: 1 },
    })
    const read = await retrieval.readChapter({ chapter: '1' })
    const find = await retrieval.findInBook({ query: 'anything' })
    // Not an error: an error result collapses the round and latches the panel.
    expect(read.isError).toBeUndefined()
    expect(find.isError).toBeUndefined()
    expect(read.content).toContain('could not')
    expect(find.content).toContain('could not')
  })
})
