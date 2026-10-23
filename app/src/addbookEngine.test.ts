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
  forgetBookHere(hex: string, storages?: Storage[]): number
  preparePdf(file: File, key: string): Promise<{ href: string }>
  pdfHref(key: string): string
  library: { get(key: string): Promise<unknown>; remove(key: string): Promise<void>; touch(key: string, patch: object): Promise<void> }
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

  it('deleting a book forgets every key this device keeps for it, and no other book\'s (20 Oct 2026: the privacy notice says they go)', async () => {
    const engine = loadEngine({ userId: 'u1' })
    const hex = 'a1b2c3d4e5f60718293a4b5c', other = 'ffffffffffffffffffffffff'
    for (const k of [`pos:epub:${hex}`, `hl:epub:${hex}`, `cards:epub:${hex}`, `chat:epub:${hex}`, `primer:epub:${hex}:outline-1`, `catchup:epub:${hex}:1-3`, `epub-view:${hex}`, `place:${hex}`, `pos:epub:${other}`]) localStorage.setItem('tinct-addbook:' + k, '1')
    localStorage.setItem('tinct:library-2-table:u1', JSON.stringify([{ key: 'epub:' + hex }]))
    localStorage.setItem('tinct:library-2-first-paint', 'other books only')
    sessionStorage.setItem('tinct-addbook:pos:epub:' + hex, '1')
    await engine.removeBook('epub:' + hex)
    const keys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)]
    expect(keys.filter(k => k.includes(hex))).toEqual([])
    expect(localStorage.getItem('tinct:library-2-table:u1')).toBeNull()
    expect(localStorage.getItem('tinct-addbook:pos:epub:' + other)).toBe('1')
    expect(localStorage.getItem('tinct:library-2-first-paint')).toBe('other books only')
    expect(engine.forgetBookHere('not-a-book')).toBe(0)
  })

  it('does not remove another account’s same-hash local text marks or unassigned legacy marks', () => {
    const engine = loadEngine({ userId: 'u1' })
    const hex = 'a'.repeat(24)
    for (const owner of ['u1', 'u2']) for (const kind of ['local', 'sync', 'adopted']) localStorage.setItem(`tinct-addbook:text-marks-${kind}:${owner}:${hex}`, owner)
    localStorage.setItem(`tinct-addbook:text-marks-owner:${hex}`, 'u2')
    localStorage.setItem(`tinct-addbook:text-marks-unassigned:${hex}`, 'legacy')
    for (const owner of ['u1','u2']) for (const kind of ['annotations','migrated']) localStorage.setItem(`tinct-addbook:legacy-epub-${kind}:${owner}:${hex}`,owner)
    localStorage.setItem(`tinct-addbook:legacy-epub-owner:${hex}`,'u2')
    engine.forgetBookHere(hex)
    expect(localStorage.getItem(`tinct-addbook:text-marks-local:u1:${hex}`)).toBeNull()
    expect(localStorage.getItem(`tinct-addbook:text-marks-sync:u1:${hex}`)).toBeNull()
    expect(localStorage.getItem(`tinct-addbook:text-marks-adopted:u1:${hex}`)).toBeNull()
    expect(localStorage.getItem(`tinct-addbook:text-marks-local:u2:${hex}`)).toBe('u2')
    expect(localStorage.getItem(`tinct-addbook:text-marks-sync:u2:${hex}`)).toBe('u2')
    expect(localStorage.getItem(`tinct-addbook:text-marks-adopted:u2:${hex}`)).toBe('u2')
    expect(localStorage.getItem(`tinct-addbook:text-marks-owner:${hex}`)).toBe('u2')
    expect(localStorage.getItem(`tinct-addbook:text-marks-unassigned:${hex}`)).toBe('legacy')
    expect(localStorage.getItem(`tinct-addbook:legacy-epub-annotations:u1:${hex}`)).toBeNull()
    expect(localStorage.getItem(`tinct-addbook:legacy-epub-migrated:u1:${hex}`)).toBeNull()
    expect(localStorage.getItem(`tinct-addbook:legacy-epub-annotations:u2:${hex}`)).toBe('u2')
    expect(localStorage.getItem(`tinct-addbook:legacy-epub-migrated:u2:${hex}`)).toBe('u2')
    expect(localStorage.getItem(`tinct-addbook:legacy-epub-owner:${hex}`)).toBe('u2')
  })
  it('removes verified active-owner React marks but keeps other books and foreign backups', () => {
    const engine=loadEngine({userId:'u1'}),hex='a'.repeat(24),mine={id:'mine',bookId:'userbook-'+hex},other={id:'other',bookId:'frankenstein'}
    localStorage.setItem('tinct-lab-highlights',JSON.stringify([mine,other]))
    localStorage.setItem(`tinct-addbook:text-marks-owner:${hex}`,'u1')
    localStorage.setItem(`tinct-addbook:text-marks-local:u1:${hex}`,JSON.stringify([mine]))
    localStorage.setItem(`tinct-addbook:text-marks-local:u2:${hex}`,'other-account')
    engine.forgetBookHere(hex)
    expect(JSON.parse(localStorage.getItem('tinct-lab-highlights')||'[]')).toEqual([other])
    expect(localStorage.getItem(`tinct-addbook:text-marks-local:u2:${hex}`)).toBe('other-account')
  })

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

  // Android file managers and cloud apps hand an EPUB over as application/octet-stream, sometimes
  // with no extension; Windows may give no type. The file's own bytes decide.
  it('knows an EPUB or a PDF by its bytes when the type is empty or octet-stream and the name says nothing', async () => {
    const engine = loadEngine({ userId: 'u1' })
    const enc = (text: string) => new TextEncoder().encode(text)
    const zipEntry = (name: string, body: string) => {
      const header = new Uint8Array(30); header.set([0x50, 0x4b, 0x03, 0x04]); header[26] = name.length
      return [header, enc(name), enc(body)]
    }
    const epubBytes = new Blob([...zipEntry('mimetype', 'application/epub+zip'), ...zipEntry('META-INF/container.xml', '<container/>')])
    for (const [name, type] of [['book.epub', 'application/octet-stream'], ['document:1234', 'application/octet-stream'], ['download', ''], ['book.EPUB', '']] as const) {
      const read = await engine.readFile(new File([epubBytes], name, { type }))
      expect(read.kind, `${name} ${type}`).toBe('epub')
      expect(read.key).toMatch(/^epub:[0-9a-f]{24}$/)
    }
    // A ZIP whose first entry is not "mimetype" but which holds META-INF/container.xml.
    const loose = new File([new Blob([...zipEntry('OEBPS/a.xhtml', '<p/>'), ...zipEntry('META-INF/container.xml', '<container/>')])], 'shared-file', { type: 'application/octet-stream' })
    expect((await engine.readFile(loose)).kind).toBe('epub')
    // A PDF with no name to go by (pdf.js is not on this page, so the %PDF check alone decides).
    expect((await engine.readFile(new File(['%PDF-1.7\n'], 'scan', { type: 'application/octet-stream' }))).key).toMatch(/^pdf:[0-9a-f]{24}$/)
    expect((await engine.readFile(new File(['%PDF-1.4'], '', { type: '' }))).kind).toBe('pdf')
    // Other bytes, an ordinary ZIP and a photo are still refused.
    expect(await engine.readFile(new File(['hello'], 'notes', { type: 'application/octet-stream' }))).toEqual({ error: 'Choose a PDF or EPUB file.' })
    expect(await engine.readFile(new File([new Blob(zipEntry('photos/a.jpg', 'x'))], 'archive', { type: 'application/octet-stream' }))).toEqual({ error: 'Choose a PDF or EPUB file.' })
    expect(await engine.readFile(new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], 'IMG_1.jpg', { type: 'image/jpeg' }))).toEqual({ error: 'Choose a PDF or EPUB file.' })
  })

  it('says so when the device cannot hand the file over (a cloud file not downloaded), instead of failing silently', async () => {
    const engine = loadEngine({ userId: 'u1' })
    const unreadable = new File(['%PDF'], 'lecture.pdf', { type: 'application/pdf' })
    Object.defineProperty(unreadable, 'slice', { value: () => ({ arrayBuffer: async () => { throw new DOMException('The requested file could not be read', 'NotReadableError') } }) })
    expect(await engine.readFile(unreadable)).toEqual({ error: 'This file could not be read from this device. If it is stored in the cloud, download it first, then choose it again.' })
    const halfway = new File(['%PDF'], 'lecture.pdf', { type: 'application/pdf' })
    Object.defineProperty(halfway, 'arrayBuffer', { value: async () => { throw new DOMException('The requested file could not be read', 'NotReadableError') } })
    expect(await engine.readFile(halfway)).toEqual({ error: 'This file could not be read from this device. If it is stored in the cloud, download it first, then choose it again.' })
  })

  // QA #359: a file named .pdf that is not a PDF landed on My shelf as a book that could not open.
  it('refuses a ".pdf" that is not a PDF before it is kept, in the PDF reader’s own words', async () => {
    const engine = loadEngine({ userId: 'u1' })
    expect(await engine.readFile(new File(['<html>not a pdf</html>'], 'notes.pdf'))).toEqual({ error: 'This file could not be opened as a PDF. Choose another file.' })
  })

  // QA #359: an upload that failed for any reason but a full account said nothing.
  it('says why the account copy was not saved, in the words the reader already has', async () => {
    const save = async (failure: unknown) => {
      const engine = loadEngine({ userId: 'u1', token: 't' }, { upload: async () => { throw failure } })
      engine.library.touch = async () => {}
      const notify = vi.fn()
      await (engine as unknown as { saveToAccount: (key: string, file: Blob, meta: object, options: object) => Promise<void> }).saveToAccount('pdf:aa', new Blob(['%PDF-1.4']), { kind: 'pdf' }, { notify })
      return notify.mock.calls.map(c => c[0])
    }
    expect(await save(Object.assign(new Error('x'), { code: 'account_full' }))).toEqual(['Kept on this device only: your account’s storage for books is full.'])
    expect(await save(Object.assign(new Error('x'), { code: 'offline' }))).toEqual(['No connection. Check your internet and try again.'])
    expect(await save(Object.assign(new Error('x'), { code: 'Unauthorized', status: 401 }))).toEqual(['Your Tinct sign-in has expired. Sign in again on tinct.app, then try again.'])
    expect(await save(Object.assign(new Error('x'), { code: 'file_too_large', status: 413 }))).toEqual(['Kept on this device only: files over 50 MB are not saved to your account.'])
  })

  it('says a PDF refused for any other reason (busy, rate-limited, a refused type) is kept here and saved on its next open', async () => {
    const save = async (failure: unknown, kind = 'pdf') => {
      const engine = loadEngine({ userId: 'u1', token: 't' }, { upload: async () => { throw failure } })
      engine.library.touch = async () => {}
      const notify = vi.fn()
      await (engine as unknown as { saveToAccount: (key: string, file: Blob, meta: object, options: object) => Promise<void> }).saveToAccount(kind + ':aa', new Blob(['%PDF-1.4']), { kind }, { notify })
      return notify.mock.calls.map(c => c[0])
    }
    const kept = 'Kept on this device only: it could not be saved to your account. It will be saved the next time you open it.'
    for (const failure of [{ code: 'busy', status: 503 }, { code: 'rate_limited', status: 429 }, { code: 'unsupported_type', status: 415 }, { code: 'failed', status: 500 }]) {
      expect(await save(Object.assign(new Error('x'), failure)), failure.code).toEqual([kept])
    }
    // A full account keeps its own words.
    expect(await save(Object.assign(new Error('x'), { code: 'account_full', status: 413 }))).toEqual(['Kept on this device only: your account’s storage for books is full.'])
  })

  describe('the account copy’s cover', () => {
    type Covers = { blob(url: string): Promise<Blob | null>; save(key: string): Promise<boolean> }
    const COVER = 'data:image/jpeg;base64,AAAA'
    const HEX = 'ab'.repeat(12)
    function withCover(record: Record<string, unknown> | null, remote: Record<string, unknown> | null) {
      const putCover = vi.fn(async (hex: string) => `/api/user-books/covers/${hex}?v=k1`)
      const upload = vi.fn(async () => ({ id: 'c'.repeat(32), sha256: HEX + '0'.repeat(40), type: 'epub', cover: null }))
      const engine = loadEngine({ userId: 'u1', token: 't' }, { putCover, upload }) as Engine & { covers: Covers; saveToAccount: (key: string, file: Blob, meta: object, options?: object) => Promise<void>; library: { touch(key: string, patch: object): Promise<void> } }
      engine.library.get = async () => record
      engine.library.touch = async () => {}
      engine.covers.blob = vi.fn(async () => new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: 'image/webp' }))
      if (remote) engine.cloud.mine().set(`epub:${HEX}`, remote as { id: string })
      return { engine, putCover, upload }
    }

    it('sends the small copy of the book’s cover when a book is added and saved to the account', async () => {
      const { engine, putCover, upload } = withCover({ key: `epub:${HEX}`, cover: COVER, coverV: 2 }, null)
      await engine.saveToAccount(`epub:${HEX}`, new Blob(['PK']), { kind: 'epub' }, { quiet: true })
      expect(upload).toHaveBeenCalledTimes(1)
      expect(engine.covers.blob).toHaveBeenCalledWith(COVER)
      expect(putCover).toHaveBeenCalledWith(HEX, expect.any(Blob))
    })

    it('sends it for a book already in the account without one (backfill on its next open), and never twice', async () => {
      const remote = { id: 'c'.repeat(32), cover: null }
      const { engine, putCover, upload } = withCover({ key: `epub:${HEX}`, cover: COVER, coverV: 2 }, remote)
      await engine.saveToAccount(`epub:${HEX}`, new Blob(['PK']), { kind: 'epub' }, { quiet: true })
      expect(upload).not.toHaveBeenCalled()
      expect(putCover).toHaveBeenCalledTimes(1)
      expect(await engine.covers.save(`epub:${HEX}`)).toBe(false)
      expect(putCover).toHaveBeenCalledTimes(1)
    })

    it('sends nothing when the account copy has a cover, the book has none here, or only the old thumbnail', async () => {
      for (const [record, remote] of [
        [{ cover: COVER, coverV: 2 }, { id: 'x', cover: `/api/user-books/covers/${HEX}?v=k0` }],
        [{ cover: null, coverV: 2 }, { id: 'x', cover: null }],
        [{ cover: COVER }, { id: 'x', cover: null }],
        [{ cover: 'javascript:alert(1)', coverV: 2 }, { id: 'x', cover: null }],
      ] as const) {
        const { engine, putCover } = withCover({ key: `epub:${HEX}`, ...record }, { ...remote })
        expect(await engine.covers.save(`epub:${HEX}`)).toBe(false)
        expect(putCover).not.toHaveBeenCalled()
      }
    })

    it('keeps reading when the cover cannot be sent', async () => {
      const { engine, putCover } = withCover({ key: `epub:${HEX}`, cover: COVER, coverV: 2 }, { id: 'x', cover: null })
      putCover.mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'rate_limited' }))
      expect(await engine.covers.save(`epub:${HEX}`)).toBe(false)
      // Tried again later (the next open or listing).
      expect(await engine.covers.save(`epub:${HEX}`)).toBe(true)
    })

    it('the PDF reader sends a PDF’s first-page cover once it is drawn (reader.js)', () => {
      const reader = readFileSync(join(ADDBOOK, 'js/reader.js'), 'utf8')
      expect(reader).toMatch(/library\.touch\(key, \{ cover: canvas\.toDataURL[^\n]+\n[^\n]+\n\s+await engine\.covers\?\.save\(key\)/)
    })
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
})
