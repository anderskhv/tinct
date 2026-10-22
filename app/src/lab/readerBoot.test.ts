import fs from 'fs'
import path from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CHAPTER_SHARDED_EDITION_IDS } from '../data/editionShardRegistry'
import { editionShardPath } from '../data/editionUrls'
import { BOOKS } from '../data/bookRegistry'
import { readerBootPrimaryExceptions } from '../../scripts/readerBootScript'
import {
  readerBootMarginPreview,
  LAB_THEME_PAPER,
  READER_BOOT_DEFAULT_FACE_URL,
  readerBootDeepLink,
  readerBootEink,
  readerBootHandoff,
  readerBootPreloads,
  readerBootTheme,
  readerBootProfile,
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
    expect(CHAPTER_SHARDED_EDITION_IDS).not.toContain('the-awakening-modern-en')
    const expected = preloads('the-awakening', 'modern-en', 3)
    expect(expected).toHaveLength(2)
    expect((await loaderRequests('the-awakening', 'modern-en', 3)).sort()).toEqual([...expected].sort())
  })

  it('a chapter-sharded edition: the manifest, the chapter window and patches', async () => {
    expect(CHAPTER_SHARDED_EDITION_IDS).toContain('moby-dick-modern-en')
    const expected = preloads('moby-dick', 'modern-en', 12)
    // Manifest, chapters 12 and 11, patches; chapter 13 is left to the loader.
    expect(expected).toHaveLength(4)
    const requested = await loaderRequests('moby-dick', 'modern-en', 12)
    expect(expected.every(url => requested.includes(url))).toBe(true)
    expect(requested.filter(url => !expected.includes(url))).toHaveLength(1)
  })

  it('never preloads past the last chapter (a 404 the loader would not make)', () => {
    const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../public/data/editions-chapters/moby-dick-modern-en/manifest.json'), 'utf8')) as { chapters: Array<{ number: number; path: string }> }
    const last = Math.max(...manifest.chapters.map(chapter => chapter.number))
    const published = new Set(manifest.chapters.map(chapter => chapter.path))
    const shards = preloads('moby-dick', 'modern-en', last).filter(url => /\/ch\d+\.json/.test(url))
    expect(shards.length).toBeGreaterThan(0)
    for (const url of shards) expect(published.has(url.match(/(ch\d+\.json)/)![1])).toBe(true)
  })

  it('a sharded first chapter has no chapter 0 to fetch', async () => {
    const expected = preloads('moby-dick', 'original-en', 1)
    expect(expected.some(url => url.includes('ch0000'))).toBe(false)
    const requested = await loaderRequests('moby-dick', 'original-en', 1)
    expect(expected.every(url => requested.includes(url))).toBe(true)
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

describe('readerBootDeepLink', () => {
  const exceptions = readerBootPrimaryExceptions()

  it('opens what the app opens for every published book\'s chapter link, or guesses nothing', async () => {
    const { readerHandoffFromUrlParams } = await import('./labReaderHandoff')
    let resolved = 0
    for (const book of BOOKS) {
      for (const search of [`?book=${book.id}&chapter=2`, `?book=${book.id}&edition=original-en&chapter=1`]) {
        const boot = readerBootDeepLink(search, exceptions)
        if (!boot) continue
        const app = readerHandoffFromUrlParams(new URLSearchParams(search))
        expect(app, search).not.toBeNull()
        expect({ bookId: boot.bookId, primaryEditionKey: boot.primaryEditionKey, chapterNumber: boot.chapterNumber }, search)
          .toEqual({ bookId: app!.bookId, primaryEditionKey: app!.primaryEditionKey, chapterNumber: app!.savedPlace?.chapterNumber })
        resolved += 1
      }
    }
    for (const key of ['bsb-en', 'kjv-en', 'web-en', 'webc-en']) {
      const search = `?book=bible&edition=${key}&chapter=3`
      const boot = readerBootDeepLink(search, exceptions)
      const app = readerHandoffFromUrlParams(new URLSearchParams(search))
      expect(boot, search).toEqual({ bookId: 'bible', primaryEditionKey: app!.primaryEditionKey, chapterNumber: 3 })
    }
    // Nearly every book's default is Modern English; the table names the rest.
    expect(resolved).toBeGreaterThan(BOOKS.length)
    expect(exceptions.bible).toBe('bsb-en')
    expect(Object.keys(exceptions).length).toBeLessThan(BOOKS.length / 4)
  })

  it('leaves to the app what it cannot know exactly', () => {
    expect(readerBootDeepLink('?book=odyssey&chapter=3', exceptions)).toEqual({ bookId: 'odyssey', primaryEditionKey: 'modern-en', chapterNumber: 3 })
    expect(readerBootDeepLink('?book=odyssey', exceptions)).toBeNull() // resumes the reader's own place
    expect(readerBootDeepLink('?book=odyssey&chapter=0', exceptions)).toBeNull()
    expect(readerBootDeepLink('?book=odyssey&chapter=x', exceptions)).toBeNull()
    expect(readerBootDeepLink('?book=odyssey&edition=modern-da&chapter=1', exceptions)).toBeNull()
    expect(readerBootDeepLink('?book=odyssey&chapter=1&modern=1', exceptions)).toBeNull()
    expect(readerBootDeepLink('?heldBook=gilgamesh&book=gilgamesh&chapter=1', exceptions)).toBeNull()
    expect(readerBootDeepLink('?book=pd-abc&chapter=1', exceptions)).toBeNull()
    expect(readerBootDeepLink('?book=../x&chapter=1', exceptions)).toBeNull()
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

  it('with the layout known, takes that profile\'s theme (a dark phone and a light desktop no longer leave the first frame white)', () => {
    expect(readerBootTheme(v2('dark', 'light'), false, false, 'phone')).toBe('dark')
    expect(readerBootTheme(v2('dark', 'light'), false, false, 'desktop')).toBe('light')
    expect(readerBootTheme(v2('system', 'book'), true, false, 'phone')).toBe('dark')
    expect(readerBootTheme(v2('system', 'book'), true, false, 'desktop')).toBe('book')
    // Version 1 has one appearance: the profile changes nothing.
    expect(readerBootTheme(JSON.stringify({ theme: 'book' }), true, false, 'phone')).toBe('book')
    expect(readerBootTheme(v2('dark', 'light'), false, true, 'phone')).toBeNull()
  })

  it('picks the profile by the app\'s own surface rule', () => {
    expect(readerBootProfile({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', innerWidth: 980 })).toBe('phone')
    expect(readerBootProfile({ innerWidth: 390, maxTouchPoints: 5, screenWidth: 390 })).toBe('phone')
    expect(readerBootProfile({ innerWidth: 1440, maxTouchPoints: 0, screenWidth: 1440, matchMediaPhone: false })).toBe('desktop')
    expect(readerBootProfile({ innerWidth: 800, matchMediaPhone: true })).toBe('phone')
  })

  it('leaves the page alone when the answer depends on the layout, the prefs are unreadable, or on e-ink', () => {
    expect(readerBootTheme(v2('dark', 'light'), false, false)).toBeNull()
    expect(readerBootTheme('{', false, false)).toBeNull()
    expect(readerBootTheme(v2('dark', 'dark'), false, true)).toBeNull()
  })

  it('paints LabApp’s own paper colours', () => {
    expect(LAB_THEME_PAPER).toEqual({ light: '#ece7db', book: '#e7dcc7', dark: '#171411' })
  })

  // The status bar of a home-screen app takes this colour, so it must be the
  // page's own paper, not a near match.
  it('matches the reader page’s paper in every theme', () => {
    const css = fs.readFileSync(path.join(__dirname, 'lab.css'), 'utf8')
    const paper = (selector: string) => css.match(new RegExp(`^${selector.replace(/\./g, '\\.')} \\{\\s*--lab-paper: (#[0-9a-f]{6});`, 'm'))?.[1]
    expect(paper('.lab')).toBe(LAB_THEME_PAPER.light)
    expect(paper('.lab.is-book-theme')).toBe(LAB_THEME_PAPER.book)
    expect(paper('.lab.is-night')).toBe(LAB_THEME_PAPER.dark)
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

describe('readerBootMarginPreview (round 3)', () => {
  const placed = (key: string) => JSON.stringify({ books: { frankenstein: { bookId: 'frankenstein', primaryEditionKey: key } } })
  const urls = (key: string, id = 'frankenstein') => [`/data/editions/${id}-${key}.json?v=v1`, `/api/edition-patches?bookId=${id}&editionKey=${key}`]
  const at = (search: string, o: { classic?: string; position?: string; prefs?: string } = {}, exceptions: Record<string, string> = {}) =>
    readerBootMarginPreview(search, key => ({ 'tinct:classic-reader': o.classic, 'tinct-lab-position': o.position } as Record<string, string | undefined>)[key] ?? null, o.prefs ?? null, exceptions, 'v1')
  it('the edition the preview will read, only when the boot can be sure', () => {
    expect(at('?book=frankenstein&margin=1')).toEqual(urls('modern-en'))
    // Launch (22 Oct 2026): margin view is the default, so a plain book link preloads it; margin=1 overrides the Classic reader.
    expect(at('?book=frankenstein')).toEqual(urls('modern-en'))
    expect(at('?book=frankenstein&margin=1', { classic: '1' })).toEqual(urls('modern-en'))
    expect(at('?book=frankenstein&margin=1', { position: placed('original-en') })).toEqual(urls('original-en'))
    expect(at('?book=frankenstein&margin=1', { prefs: JSON.stringify({ primaryEdition: 'modern-en' }) })).toEqual(urls('modern-en'))
    // Classic reader (the device's choice, or margin=0): nothing.
    expect(at('?book=frankenstein', { classic: '1' })).toEqual([])
    expect(at('?book=frankenstein&margin=0')).toEqual([])
    expect(at('?book=bible&margin=1', {}, readerBootPrimaryExceptions())).toEqual([])
    expect(at('?margin=1')).toEqual([])
    // In doubt: another chosen main edition, a book whose default is not Modern English, a place without a usable edition, unreadable storage.
    expect(at('?book=frankenstein&margin=1', { prefs: JSON.stringify({ version: 2, shared: { primaryEdition: 'original-en' } }) })).toEqual([])
    expect(at('?book=x-book&margin=1', {}, { 'x-book': 'original-en' })).toEqual([])
    expect(at('?book=frankenstein&margin=1', { position: placed('../x') })).toEqual([])
    expect(at('?book=frankenstein&margin=1', { position: JSON.stringify({ books: { frankenstein: {} } }) })).toEqual([])
    expect(at('?book=frankenstein&margin=1', { position: '{' })).toEqual([])
  })
})
