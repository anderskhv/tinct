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
    expect(order.slice(0, 5)).toEqual([782, 781, 783, 780, 784])
    const jeremiah = new Set(Array.from({ length: 52 }, (_, i) => 746 + i))
    expect(order.slice(0, 52).every(number => jeremiah.has(number))).toBe(true)
    expect(order[52]).toBe(12)
    expect(order.indexOf(12)).toBeLessThan(order.indexOf(798))
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
