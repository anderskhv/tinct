import fs from 'fs'
import path from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CHAPTER_SHARDED_EDITION_IDS } from '../data/editionShardRegistry'
import { editionShardPath } from '../data/editionUrls'
import {
  LAB_THEME_PAPER,
  READER_BOOT_DEFAULT_FACE_URL,
  readerBootEink,
  readerBootHandoff,
  readerBootPreloads,
  readerBootTheme,
  readerBootUsesDefaultFace,
} from './readerBoot'

// Characters that must be percent-encoded, so a builder that forgot to
// encode the version would produce a different URL from the loader.
const VERSION = 'b1 x/y'
const handoff = (bookId: string, primaryEditionKey: string, chapterNumber?: number) => JSON.stringify({
  kind: 'open-reader',
  resumeLatest: true,
  bookId,
  primaryEditionKey,
  savedPlace: chapterNumber === undefined ? undefined : { bookId, chapterNumber, page: 0, paragraphIndex: 0, wordIndex: 0 },
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('readerBootHandoff', () => {
  it('reads the book, edition and chapter the library hands over', () => {
    expect(readerBootHandoff(handoff('frankenstein', 'modern-en', 3))).toEqual({ bookId: 'frankenstein', primaryEditionKey: 'modern-en', chapterNumber: 3 })
    expect(readerBootHandoff(handoff('frankenstein', 'modern-en'))?.chapterNumber).toBe(1)
  })

  it('ignores anything that is not a well-formed open-reader handoff', () => {
    expect(readerBootHandoff(null)).toBeNull()
    expect(readerBootHandoff('{')).toBeNull()
    expect(readerBootHandoff(JSON.stringify({ kind: 'other', bookId: 'frankenstein', primaryEditionKey: 'modern-en' }))).toBeNull()
    expect(readerBootHandoff(handoff('../etc', 'modern-en', 1))).toBeNull()
    expect(readerBootHandoff(handoff('frankenstein', 'modern-en?x=1', 1))).toBeNull()
    expect(readerBootHandoff(handoff('frankenstein', 'modern-en', 0))?.chapterNumber).toBe(1)
    expect(readerBootHandoff(handoff('frankenstein', 'modern-en', 2.5))?.chapterNumber).toBe(1)
  })
})

/**
 * The preload is only worth anything if the loader asks for exactly the same
 * URLs; a differing byte is a second download. Run the real loader against a
 * fake network and compare what it fetched for the opening chapter.
 */
describe('readerBootPreloads matches the loader byte for byte', () => {
  function textRequests(requested: string[]): string[] {
    return [...new Set(requested.filter(url => /^\/data\/editions(-chapters)?\//.test(url) || url.startsWith('/api/edition-patches'))
      .filter(url => !/-(threads|lines)\.json/.test(url)))]
  }

  function network(requested: string[]) {
    return vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      requested.push(url)
      const json = (value: unknown) => new Response(JSON.stringify(value), { status: 200 })
      if (url.startsWith('/api/edition-patches')) return json([])
      const shard = url.match(/^\/data\/editions-chapters\/([a-z0-9-]+?)-((?:original|modern|bsb|kjv|web)-[a-z]{2})\/(manifest|ch(\d{4}))\.json/)
      if (shard) {
        const [, bookId, editionKey, file, number] = shard
        if (file === 'manifest') {
          const chapters = Array.from({ length: 30 }, (_, index) => ({ number: index + 1, title: `Chapter ${index + 1}`, path: editionShardPath(index + 1), paragraphCount: 1 }))
          return json({ format: 'tinct-edition-chapters-v1', bookId, editionKey, chapters })
        }
        return json({ paragraphs: [`Paragraph of chapter ${Number(number)}.`] })
      }
      if (/^\/data\/editions\/[a-z0-9-]+-(original|modern)-en\.json/.test(url)) {
        return json({ chapters: Array.from({ length: 6 }, (_, index) => ({ number: index + 1, title: `Chapter ${index + 1}`, paragraphs: [`Text ${index + 1}.`] })) })
      }
      return new Response('{}', { status: 404 })
    })
  }

  async function loaderRequests(bookId: string, primaryEditionKey: string, chapterNumber: number): Promise<string[]> {
    vi.stubGlobal('__BUILD_VERSION__', VERSION)
    const requested: string[] = []
    vi.stubGlobal('fetch', network(requested))
    const { loadLabBookSource } = await import('./labSource')
    // The reader's first load: reading first, no Compare.
    const source = await loadLabBookSource({ bookId, primaryEditionKey, chapterNumber, readingFirst: true })
    expect(source.chapterNumber).toBe(chapterNumber)
    return textRequests(requested)
  }

  const preloads = (bookId: string, key: string, chapter: number) => readerBootPreloads(
    readerBootHandoff(handoff(bookId, key, chapter))!,
    { version: VERSION, shardedEditionIds: CHAPTER_SHARDED_EDITION_IDS },
  )

  it('a whole-book edition: the edition JSON and its patches', async () => {
    expect(CHAPTER_SHARDED_EDITION_IDS).not.toContain('frankenstein-modern-en')
    const expected = preloads('frankenstein', 'modern-en', 3)
    expect(expected).toHaveLength(2)
    expect((await loaderRequests('frankenstein', 'modern-en', 3)).sort()).toEqual([...expected].sort())
  })

  it('a chapter-sharded edition: the manifest, the chapter window and patches', async () => {
    expect(CHAPTER_SHARDED_EDITION_IDS).toContain('moby-dick-modern-en')
    const expected = preloads('moby-dick', 'modern-en', 12)
    expect(expected).toHaveLength(5)
    expect((await loaderRequests('moby-dick', 'modern-en', 12)).sort()).toEqual([...expected].sort())
  })

  it('a sharded first chapter has no chapter 0 to fetch', async () => {
    const expected = preloads('moby-dick', 'original-en', 1)
    expect(expected.some(url => url.includes('ch0000'))).toBe(false)
    expect((await loaderRequests('moby-dick', 'original-en', 1)).sort()).toEqual([...expected].sort())
  })

  it('the Bible: its manifest and the one chapter', async () => {
    const expected = preloads('bible', 'bsb-en', 19)
    expect(expected).toHaveLength(2)
    expect((await loaderRequests('bible', 'bsb-en', 19)).sort()).toEqual([...expected].sort())
  })

  it('guesses nothing when the reader switched the chapter window off', () => {
    const plan = readerBootHandoff(handoff('moby-dick', 'modern-en', 12))!
    expect(readerBootPreloads(plan, { version: VERSION, shardedEditionIds: CHAPTER_SHARDED_EDITION_IDS, shardWindowDisabled: true })).toEqual([])
  })

  it('every published chapter manifest names its chapters as the preload does', () => {
    const root = path.resolve(__dirname, '../../public/data/editions-chapters')
    for (const directory of fs.readdirSync(root)) {
      const file = path.join(root, directory, 'manifest.json')
      if (!fs.existsSync(file)) continue
      const manifest = JSON.parse(fs.readFileSync(file, 'utf8')) as { chapters: Array<{ number: number; path: string }> }
      for (const chapter of manifest.chapters) expect(chapter.path, `${directory} ${chapter.number}`).toBe(editionShardPath(chapter.number))
    }
  })
})

describe('readerBootTheme', () => {
  const v2 = (phone: unknown, desktop: unknown) => JSON.stringify({ version: 2, shared: {}, phone: { theme: phone }, desktop: { theme: desktop } })

  it('resolves the stored theme when both layouts agree', () => {
    expect(readerBootTheme(v2('dark', 'dark'), false, false)).toBe('dark')
    expect(readerBootTheme(v2('book', 'book'), true, false)).toBe('book')
    expect(readerBootTheme(v2('system', 'dark'), true, false)).toBe('dark')
    expect(readerBootTheme(v2('system', 'system'), false, false)).toBe('light')
  })

  it('a new reader follows the system', () => {
    expect(readerBootTheme(null, true, false)).toBe('dark')
    expect(readerBootTheme(null, false, false)).toBe('light')
  })

  it('reads the version 1 flat shape', () => {
    expect(readerBootTheme(JSON.stringify({ darkMode: true }), false, false)).toBe('dark')
    expect(readerBootTheme(JSON.stringify({ theme: 'book' }), true, false)).toBe('book')
  })

  it('leaves the page alone when the answer depends on the layout, the prefs are unreadable, or on e-ink', () => {
    expect(readerBootTheme(v2('dark', 'light'), false, false)).toBeNull()
    expect(readerBootTheme('{', false, false)).toBeNull()
    expect(readerBootTheme(v2('dark', 'dark'), false, true)).toBeNull()
  })

  it('paints LabApp’s own paper colours', () => {
    expect(LAB_THEME_PAPER).toEqual({ light: '#f2eee4', book: '#e7dcc7', dark: '#171411' })
  })
})

describe('reading face and e-ink', () => {
  it('preloads Literata only for readers who read in it everywhere', () => {
    expect(readerBootUsesDefaultFace(null)).toBe(true)
    expect(readerBootUsesDefaultFace(JSON.stringify({ version: 2, shared: {}, phone: { fontFamily: null }, desktop: { fontFamily: 'literata' } }))).toBe(true)
    expect(readerBootUsesDefaultFace(JSON.stringify({ version: 2, shared: {}, phone: {}, desktop: { fontFamily: 'garamond' } }))).toBe(false)
    expect(readerBootUsesDefaultFace(JSON.stringify({ fontFamily: 'baskerville' }))).toBe(false)
  })

  it('names the regular Literata face of the font stylesheet', () => {
    const css = fs.readFileSync(path.resolve(__dirname, '../../public/fonts/tinct-fonts.css'), 'utf8')
    const face = css.match(/@font-face\s*{[^}]*}/g)!.find(block => block.includes(READER_BOOT_DEFAULT_FACE_URL))
    expect(face).toMatch(/font-family:\s*'Literata'/)
    expect(face).toMatch(/font-style:\s*normal/)
    expect(fs.existsSync(path.resolve(__dirname, '../../public', READER_BOOT_DEFAULT_FACE_URL.slice(1)))).toBe(true)
  })

  it('reads the e-ink profile as display-profile.js does', () => {
    expect(readerBootEink('', 'eink')).toBe(true)
    expect(readerBootEink('?eink=0', 'eink')).toBe(false)
    expect(readerBootEink('?eink=1', null)).toBe(true)
    expect(readerBootEink('', 'normal')).toBe(false)
  })
})
