// @vitest-environment jsdom

/**
 * The blocking boot script public/lab/library-boot.js (loaded from the head
 * of lab/index.html), run against jsdom: the panel the URL asks for, the
 * signed-in hint and the recap snapshot must be painted before any module
 * script has loaded.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LAB_LIBRARY_BOOT_KEY } from './labLibraryBoot'

const html = readFileSync(resolve(__dirname, '../../public/lab/index.html'), 'utf8')
const bootScript = readFileSync(resolve(__dirname, '../../public/lab/library-boot.js'), 'utf8')
const rootMarkup = html.slice(html.indexOf('<div id="tinct-onboarding-worlds-v5">'), html.indexOf('<script src="/lab/interaction-runtime.js'))

type BootState = { library: boolean; signedIn: boolean; user: { id: string; name: string | null; initial: string } | null; snapshot: { hero: { bookId: string; headline: string } | null } | null; returning: boolean }
type Boot = { state: BootState | null; bootState: (loc: { pathname: string; search: string }, cookie: string, storage: Storage, now?: number) => BootState; paint: (root: HTMLElement | null, state: BootState) => void; observe: (state: BootState) => void }

function runBoot(): Boot {
  document.documentElement.removeAttribute('data-lab-boot-view')
  document.documentElement.removeAttribute('data-lab-auth-hint')
  document.documentElement.removeAttribute('data-lab-boot-mode')
  new Function(bootScript)()
  return (window as Window & { __tinctLabBoot?: Boot }).__tinctLabBoot!
}

function mountRoot(): HTMLElement {
  document.body.innerHTML = rootMarkup
  return document.getElementById('tinct-onboarding-worlds-v5')!
}

const SESSION = JSON.stringify({ access_token: 'x', user: { id: 'user-a', email: 'anders@example.com', user_metadata: { full_name: 'Anders Hvelplund' } } })
const SNAPSHOT = { v: 1, at: Date.now() - 5_000, userId: 'user-a', readingNow: 2, finished: 0, hero: { bookId: 'bible', title: 'The Bible', chapterLabel: 'Proverbs 17', headline: 'You stopped in Proverbs 17', coverSrc: '/covers/bible.jpg', coverSrcSet: null, note: '12% read' } }

beforeEach(() => { history.replaceState(null, '', '/'); document.cookie = 'tinct_auth=; Max-Age=0; path=/'; localStorage.clear(); sessionStorage.clear(); document.body.innerHTML = '' })
afterEach(() => { localStorage.clear(); sessionStorage.clear(); document.body.innerHTML = '' })

const READER_ORIGIN_KEY = 'tinct:lab-reader-origin'
const leftReaderOn = (bookId: string, at = Date.now() - 20_000) => {
  sessionStorage.setItem(READER_ORIGIN_KEY, JSON.stringify({ v: 1, bookId, at }))
}

describe('lab/index.html boot script', () => {
  it('is a blocking classic script in <head>, before the panels (the production CSP forbids inline scripts)', () => {
    const tag = html.match(/<script src="\/lab\/library-boot\.js\?v=[\d-]+"><\/script>/)?.[0]
    expect(tag).toBeTruthy()
    expect(tag).not.toMatch(/\b(defer|async|type="module")/)
    expect(html.indexOf(tag!)).toBeLessThan(html.indexOf('<div id="tinct-onboarding-worlds-v5">'))
    expect(html).toContain('html[data-lab-boot-view="library"] #tinct-onboarding-worlds-v5 .tov5-view[data-view-panel="landing"] { display:none; }')
  })

  it('paints through the observer the moment the parser has inserted the library panel', async () => {
    localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', SESSION)
    localStorage.setItem(LAB_LIBRARY_BOOT_KEY, JSON.stringify(SNAPSHOT))
    const boot = runBoot()
    boot.observe(boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage))
    const root = mountRoot()
    await Promise.resolve()
    expect(root.querySelector('[data-reading-memory-recap]')?.getAttribute('data-boot-recap')).toBe('snapshot')
    expect(root.querySelector('.lib-pill')?.getAttribute('data-signed-in')).toBe('true')
  })

  it('asks for the library panel from the first frame on every library URL, and never on the landing URL', () => {
    const boot = runBoot()
    for (const loc of [{ pathname: '/lab/library', search: '' }, { pathname: '/library', search: '' }, { pathname: '/lab/', search: '?view=library&book=odyssey' }]) {
      expect(boot.bootState(loc, '', localStorage).library, loc.pathname + loc.search).toBe(true)
    }
    expect(boot.bootState({ pathname: '/lab/landing', search: '' }, '', localStorage).library).toBe(false)
    expect(boot.bootState({ pathname: '/lab/', search: '' }, '', localStorage).library).toBe(false)
    // jsdom's own location is "/": no attribute was stamped.
    expect(document.documentElement.getAttribute('data-lab-boot-view')).toBeNull()
  })

  it('reads the signed-in hint from the persisted session or the cookie, never from last-user-id', () => {
    const boot = runBoot()
    expect(boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage).signedIn).toBe(false)
    localStorage.setItem('tinct:last-user-id', 'user-a')
    expect(boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage).signedIn).toBe(false)
    expect(boot.bootState({ pathname: '/lab/library', search: '' }, 'tinct_auth=1', localStorage).signedIn).toBe(true)
    localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', SESSION)
    const state = boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage)
    expect(state.signedIn).toBe(true)
    expect(state.user).toEqual({ id: 'user-a', name: 'Anders', initial: 'A' })
  })

  it('stamps the hints on <html> for the paint-safe CSS when the device is signed in and returning', () => {
    localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', SESSION)
    localStorage.setItem(LAB_LIBRARY_BOOT_KEY, JSON.stringify(SNAPSHOT))
    runBoot()
    expect(document.documentElement.getAttribute('data-lab-auth-hint')).toBe('signed-in')
    expect(document.documentElement.getAttribute('data-lab-boot-mode')).toBe('returning')
  })

  it('paints the account and the cached recap for the same account, in the confirmed render\'s markup', () => {
    localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', SESSION)
    localStorage.setItem(LAB_LIBRARY_BOOT_KEY, JSON.stringify(SNAPSHOT))
    const boot = runBoot()
    const root = mountRoot()
    const state = boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage)
    boot.paint(root, state)
    const pill = root.querySelector<HTMLAnchorElement>('.lib-pill[data-lab-auth-link]')!
    expect(pill.getAttribute('data-signed-in')).toBe('true')
    expect(pill.getAttribute('data-auth-ready')).toBe('false')
    expect(pill.querySelector('.lib-acct-name')?.textContent).toBe('Anders')
    expect(pill.querySelector('.lib-acct-glyph')?.textContent).toBe('A')
    expect(pill.textContent).not.toContain('Sign in')
    expect(root.querySelector('.lib[data-library]')?.getAttribute('data-library-mode')).toBe('returning')
    const recap = root.querySelector<HTMLElement>('[data-reading-memory-recap]')!
    expect(recap.hidden).toBe(false)
    expect(recap.getAttribute('data-boot-recap')).toBe('snapshot')
    expect(recap.querySelector('[data-reading-now-section] .lib-cnt')?.textContent).toBe('2')
    expect(recap.querySelector('[data-now-shelf] .lib-now-item')?.getAttribute('data-now-book')).toBe('bible')
    expect(recap.querySelector('[data-now-caption] .lib-eyebrow')?.textContent).toBe('Last time you read · Proverbs 17')
    expect(recap.querySelector('[data-now-caption] .lib-h1')?.textContent).toBe('You stopped in Proverbs 17')
    expect(recap.querySelector('[data-now-caption] .lib-lede')?.textContent).toBe('The Bible')
    expect(recap.querySelector('[data-recap-continue]')?.getAttribute('data-recap-continue')).toBe('bible')
    expect(recap.querySelector('.lib-now-item .lib-cover img')?.getAttribute('src')).toBe('/covers/bible.jpg')
    expect(recap.querySelector('.lib-cta-note')?.textContent).toBe('12% read')
  })

  it('never paints another account\'s recap: a foreign snapshot gives the skeleton, a signed-out device its own', () => {
    localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', SESSION)
    localStorage.setItem(LAB_LIBRARY_BOOT_KEY, JSON.stringify({ ...SNAPSHOT, userId: 'user-b' }))
    localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { proverbs: { bookId: 'proverbs', sequentialChapter: 645 } } }))
    const boot = runBoot()
    const root = mountRoot()
    boot.paint(root, boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage))
    const recap = root.querySelector<HTMLElement>('[data-reading-memory-recap]')!
    expect(recap.hidden).toBe(false)
    expect(recap.getAttribute('data-boot-recap')).toBe('skeleton')
    expect(recap.textContent).not.toContain('Proverbs 17')

    localStorage.removeItem('sb-yazjyiqsxjystvpkyouk-auth-token')
    localStorage.setItem(LAB_LIBRARY_BOOT_KEY, JSON.stringify({ ...SNAPSHOT, userId: null }))
    const anonymousRoot = mountRoot()
    boot.paint(anonymousRoot, boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage))
    expect(anonymousRoot.querySelector('[data-reading-memory-recap]')?.getAttribute('data-boot-recap')).toBe('snapshot')
    expect(anonymousRoot.querySelector('.lib-pill')?.textContent).toBe('Sign in')
  })

  /**
   * The boot paint and the confirmed render must reserve the "so far" block
   * on exactly the same terms, or the page grows or shrinks three lines a
   * frame after it paints — which is the return-from-the-reader jump.
   */
  it('keeps the optional summary hidden until ready, and leaves it out coming back from the hero\'s reader', () => {
    localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', SESSION)
    localStorage.setItem(LAB_LIBRARY_BOOT_KEY, JSON.stringify(SNAPSHOT))
    const boot = runBoot()

    // Ordinary visit: the block is there, empty, disabled, three lines tall.
    let root = mountRoot()
    boot.paint(root, boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage))
    const block = root.querySelector<HTMLButtonElement>('[data-now-caption] .lib-recap-summary')!
    expect(block).toBeTruthy()
    expect(block.tagName).toBe('BUTTON')
    expect(block.disabled).toBe(true)
    expect(block.hidden).toBe(true)
    expect(block.querySelector('.lib-recap-summary-text')?.textContent).toBe('')
    expect(block.querySelector('.lib-recap-summary-more')?.textContent).toBe('')

    // Straight back out of the hero's own reader: no block at all.
    leftReaderOn('bible')
    root = mountRoot()
    boot.paint(root, boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage))
    expect(root.querySelector('[data-now-caption] .lib-recap-summary')).toBeNull()

    // Another book's reader: the hero is unaffected, so the block stays.
    leftReaderOn('odyssey')
    root = mountRoot()
    boot.paint(root, boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage))
    expect(root.querySelector('[data-now-caption] .lib-recap-summary')).toBeTruthy()

    // A marker written after the snapshot names the book the reader was last
    // in, whatever the stale snapshot says the hero is.
    leftReaderOn('odyssey', Date.now() - 1_000)
    localStorage.setItem(LAB_LIBRARY_BOOT_KEY, JSON.stringify({ ...SNAPSHOT, at: Date.now() - 60_000 }))
    root = mountRoot()
    boot.paint(root, boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage))
    expect(root.querySelector('[data-now-caption] .lib-recap-summary')).toBeNull()

    // An hour later the marker means nothing.
    localStorage.setItem(LAB_LIBRARY_BOOT_KEY, JSON.stringify(SNAPSHOT))
    leftReaderOn('bible', Date.now() - 61 * 60_000)
    root = mountRoot()
    boot.paint(root, boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage))
    expect(root.querySelector('[data-now-caption] .lib-recap-summary')).toBeTruthy()
  })

  it('leaves a new reader\'s library untouched, and the recap alone on the landing URL', () => {
    const boot = runBoot()
    const root = mountRoot()
    boot.paint(root, boot.bootState({ pathname: '/lab/library', search: '' }, '', localStorage))
    expect(root.querySelector<HTMLElement>('[data-reading-memory-recap]')?.hidden).toBe(true)
    expect(root.querySelector('.lib[data-library]')?.getAttribute('data-library-mode')).toBe('new')

    localStorage.setItem(LAB_LIBRARY_BOOT_KEY, JSON.stringify({ ...SNAPSHOT, userId: null }))
    const landing = mountRoot()
    boot.paint(landing, boot.bootState({ pathname: '/lab/landing', search: '' }, '', localStorage))
    expect(landing.querySelector<HTMLElement>('[data-reading-memory-recap]')?.hidden).toBe(true)
  })
})
