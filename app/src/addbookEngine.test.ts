// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Add a book's engine (public/lab/addbook/js/add-engine.js), shared by its PDF reader and the
// library's "Your own book" pop-up, and route.js, which makes /lab/addbook a PDF reader only.
const ADDBOOK = join(__dirname, '../public/lab/addbook')
const engineSource = readFileSync(join(ADDBOOK, 'js/add-engine.js'), 'utf8')
const routeSource = readFileSync(join(ADDBOOK, 'js/route.js'), 'utf8')

type Engine = {
  RIGHTS_COPY: string; RIGHTS_VERSION: string
  rightsConfirmed(): boolean; confirmRights(): void
  readFile(file: File): Promise<{ kind?: string; key?: string; bytes?: Uint8Array; error?: string }>
  removeBook(key: string, options?: { notify?: (text: string) => void }): Promise<boolean>
  preparePdf(file: File, key: string): Promise<{ href: string }>
  pdfHref(key: string): string
  library: { get(key: string): Promise<unknown>; remove(key: string): Promise<void> }
  cloud: { mine(): Map<string, { id: string }> }
}
const win = window as unknown as { TinctAddEngine?: Engine; TinctAI?: unknown }
function loadEngine(session: { userId: string | null; token?: string | null }, books: Record<string, unknown> = {}) {
  win.TinctAI = { session: () => ({ token: session.token ?? null, userId: session.userId }), books: { maxBytes: 50 * 1024 * 1024, ...books } }
  new Function(engineSource)()
  return win.TinctAddEngine!
}

describe('Add a book’s engine (add-engine.js)', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => { delete win.TinctAddEngine; delete win.TinctAI })

  it('reads a PDF or EPUB with its key (kind + the first 24 hex digits of its SHA-256) and refuses anything else, as Add a book did', async () => {
    const engine = loadEngine({ userId: 'u1' })
    const epub = await engine.readFile(new File(['PK book'], 'The Sovereign Child.epub', { type: 'application/epub+zip' }))
    expect(epub.kind).toBe('epub')
    expect(epub.key).toMatch(/^epub:[0-9a-f]{24}$/)
    expect((await engine.readFile(new File(['%PDF'], 'notes.PDF'))).key).toMatch(/^pdf:[0-9a-f]{24}$/)
    expect(await engine.readFile(new File(['x'], 'notes.txt'))).toEqual({ error: 'Choose a PDF or EPUB file.' })
    const big = new File(['x'], 'huge.pdf'); Object.defineProperty(big, 'size', { value: 301 * 1024 * 1024 })
    expect(await engine.readFile(big)).toEqual({ error: 'That file is larger than 300 MB, too big to open here.' })
  })

  it('asks the rights confirmation once per account, recording the same wording version under tinct-addbook:', () => {
    const engine = loadEngine({ userId: 'u1' })
    expect(engine.RIGHTS_COPY).toBe("I have the right to add this file and to read and listen to it in Tinct, including with its AI features. I'm responsible for what I upload and share (Terms §4).")
    expect(engine.rightsConfirmed()).toBe(false)
    engine.confirmRights()
    expect(engine.rightsConfirmed()).toBe(true)
    const record = JSON.parse(localStorage.getItem('tinct-addbook:rights:u1')!)
    expect(record.v).toBe(engine.RIGHTS_VERSION)
    expect(Date.parse(record.at)).toBeGreaterThan(0)
    // Another account on this browser is asked again; an older wording is asked again.
    win.TinctAI = { session: () => ({ token: null, userId: 'u2' }) }
    expect(engine.rightsConfirmed()).toBe(false)
    localStorage.setItem('tinct-addbook:rights:u2', JSON.stringify({ at: 'x', v: '2026-10-01' }))
    expect(engine.rightsConfirmed()).toBe(false)
  })

  it('deletes an own book from this device and the account, with its own place only', async () => {
    const remove = vi.fn(async () => {})
    const engine = loadEngine({ userId: 'u1', token: 't' }, { remove })
    engine.library.get = async () => ({ key: 'epub:aa', cloudId: 'cloud-1' })
    const removed: string[] = []
    engine.library.remove = async key => { removed.push(key) }
    localStorage.setItem('tinct-addbook:place:aa', '{"chapterNumber":3}')
    localStorage.setItem('tinct-addbook:place:bb', '{"chapterNumber":5}')
    localStorage.setItem('tinct-lab-position', '{"books":{}}')
    expect(await engine.removeBook('epub:aa')).toBe(true)
    expect(removed).toEqual(['epub:aa'])
    expect(remove).toHaveBeenCalledWith('cloud-1')
    expect(localStorage.getItem('tinct-addbook:place:aa')).toBeNull()
    // Every other book's place, and the reader's own positions, are untouched.
    expect(localStorage.getItem('tinct-addbook:place:bb')).toBe('{"chapterNumber":5}')
    expect(localStorage.getItem('tinct-lab-position')).toBe('{"books":{}}')
  })

  it('says so when the account copy could not be deleted', async () => {
    const engine = loadEngine({ userId: 'u1', token: 't' }, { remove: async () => { throw new Error('offline') } })
    engine.library.get = async () => ({ key: 'pdf:bb', cloudId: 'cloud-2' })
    engine.library.remove = async () => {}
    const notify = vi.fn()
    expect(await engine.removeBook('pdf:bb', { notify })).toBe(false)
    expect(notify).toHaveBeenCalledWith('Removed from this device, but not from your account. Try again.')
  })

  it('opens a kept PDF in Add a book’s PDF reader at its own address (?userBook=<hex>)', async () => {
    const engine = loadEngine({ userId: 'u1' })
    expect(engine.pdfHref('pdf:abc')).toBe('/lab/addbook/?userBook=abc')
    expect(await engine.preparePdf(new File(['%PDF'], 'a.pdf'), 'pdf:abc')).toEqual({ href: '/lab/addbook/?userBook=abc' })
  })
})

describe('/lab/addbook is no longer a destination (route.js)', () => {
  function route(search: string) {
    const replace = vi.fn()
    const root = document.createElement('html')
    new Function('location', 'document', routeSource)({ search, replace }, { documentElement: root })
    return { replace, route: root.dataset.route }
  }
  it('sends the start page, its file step and its #books shelf to My shelf in the library', () => {
    for (const search of ['', '?mode=file', '?q=meditations', '?work=pg2680']) expect(route(search).replace).toHaveBeenCalledWith('/library#my-shelf')
  })
  it('stays only as the PDF reader for one book (?userBook=, or an older ?open=) and for an older link’s handed-over file', () => {
    for (const search of ['?userBook=abcdef0123456789abcdef01', '?open=pdf%3Aabc', '?mode=file&handoff=1']) {
      const result = route(search)
      expect(result.replace).not.toHaveBeenCalled()
      expect(result.route).toBe('reader')
    }
  })
  it('loads before anything else draws, and the page has no start page left', () => {
    const html = readFileSync(join(ADDBOOK, 'index.html'), 'utf8')
    expect(html.indexOf('js/route.js')).toBeGreaterThan(0)
    expect(html.indexOf('js/route.js')).toBeLessThan(html.indexOf('<body'))
    expect(html).not.toContain('Your books')
    expect(html).not.toContain('Find a free book')
    expect(html).toContain('<main id="start" hidden></main>')
    expect(html.indexOf('js/add-engine.js')).toBeLessThan(html.indexOf('js/reader.js'))
  })
})

describe('Add a book’s classic scripts parse together', () => {
  // reader.js (the PDF viewer) shares one global script scope with add-engine.js: a name declared
  // twice (as `engine` once was: the add engine and the book switcher's loader) stops the page.
  it('reader.js, add-engine.js, pdf-scan.js, pdf-theme.js and route.js are valid scripts', () => {
    for (const file of ['js/reader.js', 'js/add-engine.js', 'js/pdf-scan.js', 'js/pdf-theme.js', 'js/route.js']) {
      expect(() => new Function(readFileSync(join(ADDBOOK, file), 'utf8')), file).not.toThrow()
    }
  })
  it('the source copy (addbooks/web/src) matches the installed scripts', () => {
    const SRC = join(__dirname, '../../addbooks/web/src')
    for (const file of ['js/reader.js', 'js/add-engine.js', 'js/route.js', 'js/start.js', 'js/pdf-scan.js', 'js/pdf-theme.js', 'css/reader.css']) {
      expect(readFileSync(join(SRC, file), 'utf8'), file).toBe(readFileSync(join(ADDBOOK, file), 'utf8'))
    }
  })
})
