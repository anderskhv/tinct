import { JSDOM } from 'jsdom'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { buildReaderBootScript } from '../../scripts/readerBootScript'
import { CHAPTER_SHARDED_EDITION_IDS } from '../data/editionShardRegistry'
import { READER_BOOT_DEFAULT_FACE_URL, readerBootHandoff, readerBootPreloads } from './readerBoot'

// The shipped artifact, not the module: the script the build puts in <head>.
let script = ''
let fileName = ''
beforeAll(() => {
  const built = buildReaderBootScript('v-test')
  script = built.source
  fileName = built.fileName
})

// esbuild cannot run inside a jsdom test environment, so the page is a
// separate JSDOM window that evaluates the built script like a browser would.
let dom: JSDOM
let window: JSDOM['window']
let document: Document
let sessionStorage: Storage
let localStorage: Storage
function page(path = '/reader') {
  dom = new JSDOM('<!doctype html><html lang="en" data-theme="light"><head></head><body></body></html>', { url: `https://tinct.test${path}`, runScripts: 'outside-only' })
  window = dom.window
  document = window.document
  sessionStorage = window.sessionStorage
  localStorage = window.localStorage
}
function runBootScript() {
  window.eval(script)
}

const preloads = () => [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"]')]
const HANDOFF = JSON.stringify({ kind: 'open-reader', resumeLatest: true, bookId: 'moby-dick', primaryEditionKey: 'modern-en', savedPlace: { bookId: 'moby-dick', chapterNumber: 12, page: 0, paragraphIndex: 3, wordIndex: 0 } })

beforeEach(() => page())

describe('reader boot script', () => {
  it('is a small content-hashed classic script, never an index-* bundle', () => {
    expect(fileName).toMatch(/^assets\/reader-boot-[0-9a-f]{10}\.js$/)
    expect(script).not.toMatch(/\bimport\b|\bexport\b/)
    // Owner-scoped resume adds under 1 KB; keep the synchronous head script bounded.
    expect(script.length).toBeLessThan(8500)
  })

  it('preloads the handoff’s opening text and leaves the handoff for the app', () => {
    sessionStorage.setItem('tinct:lab-reader-handoff', HANDOFF)
    runBootScript()
    const expected = readerBootPreloads(readerBootHandoff(HANDOFF)!, { version: 'v-test', shardedEditionIds: CHAPTER_SHARDED_EDITION_IDS })
    const fetches = preloads().filter(link => link.as === 'fetch')
    expect(fetches.map(link => link.getAttribute('href'))).toEqual(expected)
    // Reused by fetch() only with the same mode and credentials.
    for (const link of fetches) expect(link.crossOrigin).toBe('anonymous')
    expect(sessionStorage.getItem('tinct:lab-reader-handoff')).toBe(HANDOFF)
  })

  it('the compact boot table preserves every registered shard identity', () => {
    for (const id of CHAPTER_SHARDED_EDITION_IDS) {
      const match = id.match(/^(.*)-((?:original|modern|kjv|web|webc|bsb)-[a-z]+)$/)!
      page()
      const handoff = { kind: 'open-reader', bookId: match[1], primaryEditionKey: match[2], savedPlace: { chapterNumber: 1 } }
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify(handoff))
      runBootScript()
      const expected = readerBootPreloads(readerBootHandoff(JSON.stringify(handoff))!, { version: 'v-test', shardedEditionIds: CHAPTER_SHARDED_EDITION_IDS })
      expect(preloads().filter(link => link.as === 'fetch').map(link => link.getAttribute('href')), id).toEqual(expected)
      dom.window.close()
    }
  })

  it('preloads a chapter deep link’s opening text, as the app will open it', () => {
    page('/reader?book=odyssey&chapter=3')
    runBootScript()
    const expected = readerBootPreloads({ bookId: 'odyssey', primaryEditionKey: 'modern-en', chapterNumber: 3 }, { version: 'v-test', shardedEditionIds: CHAPTER_SHARDED_EDITION_IDS })
    expect(preloads().filter(link => link.as === 'fetch').map(link => link.getAttribute('href'))).toEqual(expected)
    page('/reader?book=bible&chapter=1')
    runBootScript()
    expect(preloads().filter(link => link.as === 'fetch').map(link => link.getAttribute('href'))).toEqual(
      readerBootPreloads({ bookId: 'bible', primaryEditionKey: 'bsb-en', chapterNumber: 1 }, { version: 'v-test', shardedEditionIds: CHAPTER_SHARDED_EDITION_IDS }),
    )
  })

  it('preloads the margin preview’s whole edition and its patches (round 3), not for the book reader', () => {
    page('/reader?book=war-and-peace&margin=1')
    runBootScript()
    expect(preloads().filter(link => link.as === 'fetch').map(link => link.getAttribute('href'))).toEqual([
      '/data/editions/war-and-peace-modern-en.json?v=v-test', '/api/edition-patches?bookId=war-and-peace&editionKey=modern-en',
    ])
    page('/reader?book=war-and-peace')
    runBootScript()
    expect(preloads().filter(link => link.as === 'fetch')).toEqual([])
    page('/reader?book=war-and-peace&margin=0')
    localStorage.setItem('tinct:margin-preview', '1')
    runBootScript()
    expect(preloads().filter(link => link.as === 'fetch')).toEqual([])
  })

  it('a library handoff wins over the address', () => {
    page('/reader?book=odyssey&chapter=3')
    sessionStorage.setItem('tinct:lab-reader-handoff', HANDOFF)
    runBootScript()
    const expected = readerBootPreloads(readerBootHandoff(HANDOFF)!, { version: 'v-test', shardedEditionIds: CHAPTER_SHARDED_EDITION_IDS })
    expect(preloads().filter(link => link.as === 'fetch').map(link => link.getAttribute('href'))).toEqual(expected)
  })

  it('starts a saved chapter before the app executes without writing position or overriding a link', () => {
    const saved = JSON.stringify({ owner: 'reader-a', lastSettledBookId: 'bible', books: { bible: { bookId: 'bible', primaryEditionKey: 'webc-en', chapterNumber: 42 } } })
    const seed = (owner = 'reader-a') => {
      localStorage.setItem('tinct-lab-position', saved)
      localStorage.setItem('sb-test-auth-token', JSON.stringify({ access_token: 'synthetic', expires_at: Date.now() / 1000 + 3600, user: { id: owner } }))
    }
    seed(); runBootScript()
    expect(preloads().filter(link => link.as === 'fetch').map(link => link.getAttribute('href'))).toEqual(readerBootPreloads({ bookId: 'bible', primaryEditionKey: 'webc-en', chapterNumber: 42 }, { version: 'v-test', shardedEditionIds: CHAPTER_SHARDED_EDITION_IDS }))
    expect(localStorage.getItem('tinct-lab-position')).toBe(saved)
    expect(sessionStorage.length).toBe(0)
    page(); seed('reader-b'); runBootScript()
    expect(preloads().filter(link => link.as === 'fetch')).toHaveLength(0)
    for (const path of ['/reader?book=bible', '/reader?userBook=private', '/reader?heldBook=odyssey']) {
      page(path); seed(); runBootScript()
      expect(preloads().filter(link => link.as === 'fetch')).toHaveLength(0)
    }
    page(); seed(); localStorage.removeItem('sb-test-auth-token'); runBootScript()
    expect(preloads().filter(link => link.as === 'fetch')).toHaveLength(0)
  })

  it('preloads the default reading face', () => {
    runBootScript()
    const font = preloads().find(link => link.as === 'font')
    expect(font?.getAttribute('href')).toBe(READER_BOOT_DEFAULT_FACE_URL)
    expect(font?.type).toBe('font/woff2')
  })

  it('paints the stored paper before the app runs', () => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ version: 2, shared: {}, phone: { theme: 'dark' }, desktop: { theme: 'dark' } }))
    runBootScript()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.style.backgroundColor).toBe('rgb(23, 20, 17)')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('does nothing outside the reader, or with unusable storage', () => {
    sessionStorage.setItem('tinct:lab-reader-handoff', HANDOFF)
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'dark' }))
    const handoff = sessionStorage.getItem('tinct:lab-reader-handoff')!
    const prefs = localStorage.getItem('tinct-lab-prefs')!
    page('/admin/metrics')
    sessionStorage.setItem('tinct:lab-reader-handoff', handoff)
    localStorage.setItem('tinct-lab-prefs', prefs)
    runBootScript()
    expect(preloads()).toHaveLength(0)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    page()
    sessionStorage.setItem('tinct:lab-reader-handoff', '{not json')
    localStorage.setItem('tinct-lab-prefs', '{not json')
    expect(() => runBootScript()).not.toThrow()
    expect(preloads()).toHaveLength(0)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('starts the signed-in cloud position read with a still-valid stored token, and only then', async () => {
    const calls: Array<{ url: string; auth: string | null }> = []
    const install = () => {
      ;(window as unknown as { fetch: unknown }).fetch = async (url: string, init?: { headers?: Record<string, string> }) => {
        calls.push({ url, auth: init?.headers?.Authorization ?? null })
        return { ok: true, json: async () => ({ books: {} }) }
      }
    }
    const now = Math.floor(Date.now() / 1000)
    install()
    localStorage.setItem('sb-abc123-auth-token', JSON.stringify({ access_token: 'tok', expires_at: now + 3600 }))
    runBootScript()
    expect(calls).toEqual([{ url: '/api/lab-position', auth: 'Bearer tok' }])
    const slot = (window as unknown as Record<string, { token: string; body: Promise<unknown> }>).__tinctPositionPrefetch
    expect(slot.token).toBe('tok')
    expect(await slot.body).toEqual({ books: {} })

    // An expiring token is left to the app's own refresh; a guest has none.
    for (const stored of [JSON.stringify({ access_token: 'old', expires_at: now + 30 }), null]) {
      page(); install(); calls.length = 0
      if (stored) localStorage.setItem('sb-abc123-auth-token', stored)
      runBootScript()
      expect(calls).toEqual([])
      expect((window as unknown as Record<string, unknown>).__tinctPositionPrefetch).toBeUndefined()
    }
  })
})
