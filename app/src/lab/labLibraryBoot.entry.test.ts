import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  LAB_RESUME_WINDOW_MS,
  isLabEntryPath,
  labEntryTarget,
  labLastReadAt,
} from './labLibraryBoot'

const NOW = 1_760_000_000_000

function storage(entries: Record<string, string>) {
  return {
    getItem: (key: string) => (key in entries ? entries[key] : null),
    setItem: () => {},
    removeItem: () => {},
    key: (index: number) => Object.keys(entries)[index] ?? null,
    get length() { return Object.keys(entries).length },
  }
}

describe('lab entry: a signed-in reader never sees the landing page', () => {
  it('only treats the bare entry paths as an entry', () => {
    expect(isLabEntryPath('/lab')).toBe(true)
    expect(isLabEntryPath('/lab/')).toBe(true)
    expect(isLabEntryPath('/lab/landing')).toBe(true)
    expect(isLabEntryPath('/')).toBe(true)
    expect(isLabEntryPath('/lab/library')).toBe(false)
    expect(isLabEntryPath('/lab/reader')).toBe(false)
    expect(isLabEntryPath('/lab', '?view=landing')).toBe(false)
    expect(isLabEntryPath('/lab/landing', '?book=odyssey')).toBe(false)
  })

  it('sends a signed-out reader to the landing page, as before', () => {
    expect(labEntryTarget({ pathname: '/lab', signedIn: false, lastReadAt: NOW, now: NOW })).toBe('landing')
    expect(labEntryTarget({ pathname: '/lab/landing', signedIn: false, lastReadAt: null, now: NOW })).toBe('landing')
  })

  it('sends a signed-in reader who read inside the window straight into the reader', () => {
    expect(labEntryTarget({ pathname: '/lab', signedIn: true, lastReadAt: NOW - 60_000, now: NOW })).toBe('reader')
    expect(labEntryTarget({ pathname: '/lab/landing', signedIn: true, lastReadAt: NOW - LAB_RESUME_WINDOW_MS + 1, now: NOW })).toBe('reader')
  })

  it('sends a signed-in reader whose reading is older than the window to the library', () => {
    expect(labEntryTarget({ pathname: '/lab', signedIn: true, lastReadAt: NOW - LAB_RESUME_WINDOW_MS - 1, now: NOW })).toBe('library')
    expect(labEntryTarget({ pathname: '/lab/', signedIn: true, lastReadAt: NOW - 30 * 24 * 60 * 60 * 1000, now: NOW })).toBe('library')
  })

  it('treats the boundary itself as inside the window', () => {
    expect(labEntryTarget({ pathname: '/lab', signedIn: true, lastReadAt: NOW - LAB_RESUME_WINDOW_MS, now: NOW })).toBe('reader')
  })

  it('sends a signed-in reader with no reading — or no timestamp — to the library', () => {
    expect(labEntryTarget({ pathname: '/lab', signedIn: true, lastReadAt: null, now: NOW })).toBe('library')
    expect(labEntryTarget({ pathname: '/lab', signedIn: true, lastReadAt: Number.NaN, now: NOW })).toBe('library')
    expect(labEntryTarget({ pathname: '/lab', signedIn: true, lastReadAt: 0, now: NOW })).toBe('library')
  })

  it('leaves an explicit route alone', () => {
    expect(labEntryTarget({ pathname: '/lab/library', signedIn: true, lastReadAt: NOW, now: NOW })).toBeNull()
    expect(labEntryTarget({ pathname: '/lab', search: '?book=odyssey&view=book-detail', signedIn: true, lastReadAt: NOW, now: NOW })).toBeNull()
  })

  it('reads the newest reading moment out of the position record and the memory mirror', () => {
    expect(labLastReadAt(storage({}))).toBeNull()
    expect(labLastReadAt(storage({ 'tinct-lab-position': 'not json' }))).toBeNull()
    expect(labLastReadAt(storage({
      'tinct-lab-position': JSON.stringify({ books: { odyssey: { updatedAt: NOW - 5000 } }, lastSettledAt: NOW - 9000 }),
    }))).toBe(NOW - 5000)
    expect(labLastReadAt(storage({
      'tinct-lab-position': JSON.stringify({ books: { odyssey: { updatedAt: NOW - 5000 } } }),
      'tinct:reading-memory': JSON.stringify({ sessions: { a: { lastActiveAt: NOW - 100 } } }),
    }))).toBe(NOW - 100)
  })
})

describe('the blocking boot script agrees with the module', () => {
  const source = readFileSync(resolve(process.cwd(), 'public/lab/library-boot.js'), 'utf8')

  function runBoot(pathname: string, cookie: string, entries: Record<string, string>, now = NOW, session: Record<string, string> = {}) {
    const replaced: string[] = []
    const attributes: Record<string, string> = {}
    const fakeWindow: Record<string, unknown> = { localStorage: storage(entries), sessionStorage: storage(session) }
    const fakeDocument = {
      cookie,
      documentElement: { setAttribute: (name: string, value: string) => { attributes[name] = value } },
      getElementById: () => null,
      addEventListener: () => {},
    }
    const fakeLocation = { pathname, search: '', replace: (url: string) => replaced.push(url) }
    const rewritten: string[] = []
    const fakeHistory = { state: null, replaceState: (_s: unknown, _t: string, url: string) => rewritten.push(url) }
    const run = new Function('window', 'document', 'location', 'history', 'Date', 'MutationObserver', source)
    run(fakeWindow, fakeDocument, fakeLocation, fakeHistory, { now: () => now }, undefined)
    const boot = fakeWindow.__tinctLabBoot as { state: { entry: string | null }; RESUME_WINDOW_MS: number }
    return { entry: boot.state.entry, window: boot.RESUME_WINDOW_MS, replaced, rewritten, attributes }
  }

  it('paints the world the landing parked, before the parser reaches the panels', () => {
    expect(runBoot('/lab', 'tinct_auth=1', readLongAgo, NOW, { 'tinct:lab-landing-world': 'pride' }).attributes['data-lib-world']).toBe('pride')
    // No landing visited yet, or a value that is not one of ours: the world
    // the landing opens on.
    expect(runBoot('/lab', 'tinct_auth=1', readLongAgo).attributes['data-lib-world']).toBe('odyssey')
    expect(runBoot('/lab', 'tinct_auth=1', readLongAgo, NOW, { 'tinct:lab-landing-world': 'meditations' }).attributes['data-lib-world']).toBe('odyssey')
  })

  const readRecently = { 'tinct-lab-position': JSON.stringify({ books: { odyssey: { updatedAt: NOW - 1000 } } }) }
  const readLongAgo = { 'tinct-lab-position': JSON.stringify({ books: { odyssey: { updatedAt: NOW - LAB_RESUME_WINDOW_MS - 1 } } }) }

  it('uses the same window as the module', () => {
    expect(runBoot('/lab', '', readRecently).window).toBe(LAB_RESUME_WINDOW_MS)
  })

  it('leaves a signed-out reader on the landing page', () => {
    const result = runBoot('/lab', '', readRecently)
    expect(result.entry).toBe('landing')
    expect(result.replaced).toEqual([])
    expect(result.rewritten).toEqual([])
  })

  it('replaces the entry with the reader for a signed-in reader who read within the window', () => {
    const result = runBoot('/lab/landing', 'tinct_auth=1', readRecently)
    expect(result.entry).toBe('reader')
    expect(result.replaced).toEqual(['/reader'])
    // Nothing was painted before the redirect.
    expect(result.attributes['data-lab-boot-view']).toBeUndefined()
  })

  it('rewrites the entry to the library when the reading is older than the window', () => {
    const result = runBoot('/lab', 'tinct_auth=1', readLongAgo)
    expect(result.entry).toBe('library')
    expect(result.replaced).toEqual([])
    expect(result.rewritten).toEqual(['/library'])
    expect(result.attributes['data-lab-boot-view']).toBe('library')
  })

  it('rewrites the entry to the library when there is no reading at all', () => {
    const result = runBoot('/lab', 'tinct_auth=1', {})
    expect(result.entry).toBe('library')
    expect(result.rewritten).toEqual(['/library'])
  })
})
