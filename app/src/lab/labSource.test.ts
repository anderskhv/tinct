import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  bibleBookOpeningTitle,
  bibleFallbackSource,
  labHeaderLine,
  loadLabBookSource,
  loadLabSource,
  nextLabChapter,
  parseBibleChapterTitle,
  prevLabChapter,
  resetLabBibleManifestCache,
} from './labSource'

afterEach(() => {
  resetLabBibleManifestCache()
  vi.unstubAllGlobals()
})

describe('bible chapter identity', () => {
  it('parses Bible book + chapter for the Tinct header line', () => {
    expect(parseBibleChapterTitle('Genesis 1')).toEqual({ book: 'Genesis', chapter: '1' })
    expect(parseBibleChapterTitle('Song of Solomon 2')).toEqual({ book: 'Song of Solomon', chapter: '2' })
    expect(parseBibleChapterTitle('2 Samuel 7')).toEqual({ book: '2 Samuel', chapter: '7' })
    expect(parseBibleChapterTitle('Obadiah')).toEqual({ book: 'Obadiah', chapter: '1' })
    expect(labHeaderLine('Genesis', '1')).toBe('Genesis · 1')
  })

  it('walks the sequential 1189-chapter Bible list', () => {
    const chapters = [
      { number: 1, title: 'Genesis 1' },
      { number: 2, title: 'Genesis 2' },
      { number: 50, title: 'Genesis 50' },
      { number: 51, title: 'Exodus 1' },
      { number: 1189, title: 'Revelation 22' },
    ]
    expect(nextLabChapter(chapters, 1)).toBe(2)
    expect(nextLabChapter(chapters, 50)).toBe(51)
    expect(nextLabChapter(chapters, 1189)).toBeNull()
    expect(prevLabChapter(chapters, 2)).toBe(1)
    expect(prevLabChapter(chapters, 51)).toBe(50)
    expect(prevLabChapter(chapters, 1)).toBeNull()
  })

  it('identifies only chapter 1 as a Bible book opening', () => {
    const chapters = [
      { number: 1, title: 'Genesis 1' },
      { number: 2, title: 'Genesis 2' },
      { number: 51, title: 'Exodus 1' },
    ]
    expect(bibleBookOpeningTitle(chapters, 1)).toBe('Genesis')
    expect(bibleBookOpeningTitle(chapters, 2)).toBeNull()
    expect(bibleBookOpeningTitle(chapters, 51)).toBe('Exodus')
  })
})

describe('loadLabSource', () => {
  it('adapts a selected published book and compare edition without Bible fallback', async () => {
    vi.stubGlobal('__BUILD_VERSION__', 'dev')
    const requested: string[] = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      requested.push(url)
      if (url.includes('/api/edition-patches')) return new Response('[]', { status: 200 })
      if (url.includes('odyssey-original-en.json')) {
        return new Response(JSON.stringify({ chapters: [
          { number: 1, title: 'Book 1', paragraphs: ['Tell me, O Muse, of that ingenious hero.'] },
          { number: 2, title: 'Book 2', paragraphs: ['Now when the child of morning appeared.'] },
        ] }), { status: 200 })
      }
      if (url.includes('odyssey-modern-en.json')) {
        return new Response(JSON.stringify({ chapters: [
          { number: 1, title: 'Book 1', paragraphs: ['Tell me about the clever hero.'] },
          { number: 2, title: 'Book 2', paragraphs: ['When morning came.'] },
        ] }), { status: 200 })
      }
      if (url.includes('odyssey-threads.json')) return new Response('{"characters":[]}', { status: 200 })
      if (url.includes('audio-manifest')) return new Response('{}', { status: 404 })
      return new Response('{}', { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const source = await loadLabBookSource({
      bookId: 'odyssey',
      primaryEditionKey: 'original-en',
      compareEditionKey: 'modern-en',
      audioEditionKey: 'original-en',
      chapterNumber: 2,
    })

    expect(source.bookId).toBe('odyssey')
    expect(source.bookTitle).toBe('The Odyssey')
    expect(source.chapterNumber).toBe(2)
    expect(source.paragraphs[0]).toContain('child of morning')
    expect(source.compareParagraphs[0]).toContain('morning came')
    expect(requested.some(url => url.includes('bible-'))).toBe(false)
    expect(requested.some(url => url.includes('path=odyssey%2Foriginal-en%2Fch2'))).toBe(true)
  })

  it('loads production Bible Genesis 1 and the chapter list', async () => {
    const manifest = {
      chapters: [
        { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
        { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
      ],
      sections: [
        { title: 'Old Testament', sections: [{ title: 'The Pentateuch', sections: [{ title: 'Genesis', chapters: [1, 2] }] }] },
      ],
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('bible-kjv-en/manifest.json')) {
        return { ok: true, json: async () => manifest }
      }
      if (url.includes('bible-kjv-en/ch0001.json')) {
        return { ok: true, json: async () => ({ number: 1, title: 'Genesis 1', paragraphs: ['In the beginning God created the heaven and the earth.'] }) }
      }
      if (url.includes('bible-modern-en/ch0001.json')) {
        return { ok: true, json: async () => ({ paragraphs: ['At the start God made the sky and the land.'] }) }
      }
      if (url.includes('bible-threads.json')) {
        return { ok: true, json: async () => ({ characters: [] }) }
      }
      if (url.includes('audio-manifest')) {
        return { ok: true, json: async () => ({ chapter: 1, paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 4 }] }) }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)

    const source = await loadLabSource(1)
    expect(source.bookTitle).toBe('The Bible')
    expect(source.headerBook).toBe('Genesis')
    expect(source.headerChapter).toBe('1')
    expect(source.chapterLabel).toBe('Genesis 1')
    expect(source.chapterNumber).toBe(1)
    expect(source.paragraphs[0]).toContain('In the beginning')
    expect(source.compareParagraphs[0]).toContain('At the start')
    expect(source.chapters).toHaveLength(2)
    expect(source.sections?.[0]?.title).toBe('Old Testament')
    expect(source.followParagraphs[0]?.file).toBe('p0.mp3')
    expect(source.followParagraphs[0]?.words).toBeUndefined()
  })

  it('falls back to Genesis without inventing a new Bible product', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })))
    const source = await loadLabSource(1)
    expect(source.headerBook).toBe('Genesis')
    expect(source.headerChapter).toBe('1')
    expect(bibleFallbackSource().bookTitle).toBe('The Bible')
  })
})
