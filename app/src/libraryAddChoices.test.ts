// @vitest-environment jsdom
// "Add your own" (approved mockup, Anders 9 Nov 2026: "3 options, upload, insert link, paste text… no extra
// links, keep it clean"): the three choices (public/lab/library_2/add-choices.js) and where each one goes in
// the library's pop-up (add-to-tinct.js) and the signed-out add sheet (own-start.js).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../public/lab/wait-ring.js'
// @ts-expect-error -- plain browser module of the library page
import * as choices from '../public/lab/library_2/add-choices.js'
// @ts-expect-error -- plain browser module of the library page
import * as add from '../public/lab/library_2/add-to-tinct.js'
// @ts-expect-error -- plain browser module of the library page
import { openOwnStart, closeOwnStart } from '../public/lab/library_2/own-start.js'

/** The handoff's IndexedDB (file-handoff.js), in memory: jsdom has none. */
function memoryIndexedDb() {
  const rows = new Map<string, unknown>()
  const request = <T>(result?: T) => ({ result } as { result?: T; onsuccess?: () => void; onerror?: () => void; onupgradeneeded?: () => void })
  const db = {
    close() {},
    createObjectStore() {},
    transaction() {
      const tx: { oncomplete?: () => void; onerror?: () => void; onabort?: () => void; objectStore: () => unknown } = {
        objectStore: () => ({
          put: (value: unknown, key: string) => { rows.set(key, structuredClone(value)); return request(key) },
          get: (key: string) => request(rows.get(key)),
          delete: (key: string) => { rows.delete(key); return request(undefined) },
        }),
      }
      setTimeout(() => tx.oncomplete?.())
      return tx
    },
  }
  return { rows, api: { open: () => { const r = request(db); setTimeout(() => { r.onupgradeneeded?.(); r.onsuccess?.() }); return r } } }
}

const dialog = () => document.querySelector('[data-testid="own-file-dialog"]') as HTMLElement
const box = () => dialog().querySelector('.own-file-dialog') as HTMLElement
const tap = (root: Element, choice: string) => (root.querySelector(`.add-choice[data-choice="${choice}"]`) as HTMLButtonElement).click()
const typeLink = (root: Element, value: string) => {
  const input = root.querySelector('.add-link__input') as HTMLInputElement
  input.value = value; input.dispatchEvent(new Event('input'))
  return input
}
const submit = (root: Element) => (root.querySelector('.add-link__add') as HTMLButtonElement).click()
const pasteInto = (target: Element, plain: string, html = '') => {
  const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & { clipboardData?: { getData(type: string): string } }
  Object.defineProperty(event, 'clipboardData', { value: { getData: (kind: string) => (kind === 'text/html' ? html : kind === 'text/plain' ? plain : '') } })
  target.dispatchEvent(event)
  return event
}

describe('the three choices', () => {
  it('are Upload, Insert link and Paste text, each with its one short line, in that order', () => {
    expect(choices.ADD_TITLE).toBe('Add your own')
    expect(choices.CHOICES).toEqual([
      { id: 'upload', label: 'Upload', line: 'PDF, EPUB, text' },
      { id: 'link', label: 'Insert link', line: 'An article online' },
      { id: 'paste', label: 'Paste text', line: 'Any text you copied' },
    ])
  })

  it('draws one button per handled choice, named by its label and described by its line; a tap runs only its own handler', () => {
    const upload = vi.fn(), link = vi.fn(), paste = vi.fn()
    const list = choices.choiceList({ upload, link, paste })
    document.body.append(list)
    const buttons = [...list.querySelectorAll('button')] as HTMLButtonElement[]
    expect(buttons.map(b => b.dataset.choice)).toEqual(['upload', 'link', 'paste'])
    for (const b of buttons) {
      expect(b.type).toBe('button')
      expect(document.getElementById(b.getAttribute('aria-labelledby')!)?.className).toBe('add-choice__label')
      expect(document.getElementById(b.getAttribute('aria-describedby')!)?.className).toBe('add-choice__line')
      expect(b.querySelector('svg[aria-hidden="true"] path')).not.toBeNull()
    }
    buttons[1].click()
    expect([upload.mock.calls.length, link.mock.calls.length, paste.mock.calls.length]).toEqual([0, 1, 0])
    // A choice with no handler (Insert link and Paste text where the shared reader is off) is left out.
    expect([...choices.choiceList({ upload }).querySelectorAll('button')].map(b => (b as HTMLElement).dataset.choice)).toEqual(['upload'])
    list.remove()
  })

  it('routes files: none, one (the one-file path) or several (the queue)', () => {
    expect(choices.filesRoute([])).toBe('none')
    expect(choices.filesRoute(null)).toBe('none')
    expect(choices.filesRoute([new File(['a'], 'a.pdf')])).toBe('one')
    expect(choices.filesRoute([new File(['a'], 'a.pdf'), new File(['b'], 'b.epub')])).toBe('several')
  })

  it('reads the link field: a web address (https:// added when left out), else why not', () => {
    expect(choices.linkInput('https://news.example.org/a?b=1')).toEqual({ url: 'https://news.example.org/a?b=1' })
    expect(choices.linkInput('  news.example.org/2026/otters ')).toEqual({ url: 'https://news.example.org/2026/otters' })
    expect(choices.linkInput('www.example.org')).toEqual({ url: 'https://www.example.org/' })
    expect(choices.linkInput('')).toEqual({ error: '' })
    for (const bad of ['otters', 'two words.com', 'ftp://example.org/x', 'javascript:alert(1)', 'https://localhost/', 'mailto:a@b.org'])
      expect(choices.linkInput(bad)).toEqual({ error: choices.LINK_COPY.invalid })
  })

  it('takes a paste that is one link and nothing else as a link', () => {
    expect(choices.pastedLink({ plain: 'https://example.org/a' })).toBe('https://example.org/a')
    expect(choices.pastedLink({ plain: '', text: 'https://example.org/a' })).toBe('https://example.org/a')
    expect(choices.pastedLink({ plain: 'Read https://example.org/a' })).toBe('')
  })

  it('the link form: Add disabled while empty, a wrong address says why, a right one is handed on', () => {
    const onSubmit = vi.fn()
    const form = choices.linkForm({ onSubmit })
    document.body.append(form.el)
    expect(form.el.querySelector('label')?.textContent).toBe('Link to an article')
    expect(form.input.type).toBe('url')
    expect(form.add.textContent).toBe('Add')
    expect(form.add.disabled).toBe(true)
    typeLink(form.el, 'otters')
    submit(form.el)
    expect(form.alert.textContent).toBe(choices.LINK_COPY.invalid)
    expect(onSubmit).not.toHaveBeenCalled()
    typeLink(form.el, 'news.example.org/otters')
    expect(form.alert.textContent).toBe('')
    submit(form.el)
    expect(onSubmit).toHaveBeenCalledWith('https://news.example.org/otters')
    form.busy(true)
    expect(form.add.disabled).toBe(true)
    form.el.remove()
  })
})

describe('the library pop-up, signed in', () => {
  const key = 'c'.repeat(24)
  let fetchImpl: ReturnType<typeof vi.fn>
  function openDialog({ importReply = { kind: 'html', url: 'https://news.example.org/otters', siteName: 'The Northern Ledger', title: 'The quiet return of the river otter', author: 'Maren Holt', html: '<p>' + 'Otters are back on the river. '.repeat(20) + '</p>' } as Record<string, unknown>, importStatus = 200 } = {}) {
    window.history.replaceState(null, '', '/library?sharedReader=1')
    document.documentElement.classList.add('signed-in')
    const upload = vi.fn(async () => ({ id: 'book-id', sha256: key + 'c'.repeat(40) }))
    fetchImpl = vi.fn(async () => new Response(JSON.stringify(importReply), { status: importStatus, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchImpl)
    vi.stubGlobal('TinctAI', { books: { upload }, session: () => ({ token: 'token' }) })
    const engine = { rightsConfirmed: () => true, readFile: async () => ({ key: 'epub:' + key, bytes: new Uint8Array([1]) }), keepFile: async () => true, library: { touch: vi.fn() }, prepareEpub: async () => ({}), cloud: { mine: () => new Map() }, store: { get: () => null }, accountId: () => 'owner' }
    const go = vi.fn()
    const layer = add.openFileDialog({ engine: async () => engine, go })
    return { go, upload, layer }
  }
  afterEach(() => { add.closeFileDialog(); vi.unstubAllGlobals(); document.body.replaceChildren(); document.documentElement.classList.remove('signed-in'); window.history.replaceState(null, '', '/') })

  it('opens on the three choices under "Add your own" and nothing else', () => {
    openDialog()
    expect(box().dataset.step).toBe('choose')
    expect(box().classList.contains('add-own')).toBe(true)
    expect(dialog().querySelector('h2')?.textContent).toBe('Add your own')
    expect([...dialog().querySelectorAll('.own-file-content > *')].map(e => e.className)).toEqual(['add-choices'])
    expect(document.activeElement).toBe(dialog().querySelector('.add-choice[data-choice="upload"]'))
  })

  it('Upload opens the file picker, which takes several files', () => {
    openDialog()
    const input = dialog().querySelector('input[type=file]') as HTMLInputElement
    const picker = vi.spyOn(input, 'click').mockImplementation(() => {})
    tap(dialog(), 'upload')
    expect(picker).toHaveBeenCalledTimes(1)
    expect(input.multiple).toBe(true)
    expect(box().dataset.step).toBe('choose')
  })

  it('Insert link: its own step with a back chevron, then the article imported and opened in the reader', async () => {
    const { go, upload } = openDialog()
    tap(dialog(), 'link')
    expect(box().dataset.step).toBe('link')
    expect(dialog().querySelector('h2')?.textContent).toBe('Insert link')
    const back = dialog().querySelector('.tui-dialog__head .add-own-back') as HTMLButtonElement
    expect(back.getAttribute('aria-label')).toBe('Back')
    expect(back.nextElementSibling?.tagName).toBe('H2')
    expect(document.activeElement).toBe(dialog().querySelector('.add-link__input'))
    back.click()
    expect(box().dataset.step).toBe('choose')
    expect(dialog().querySelector('.add-own-back')).toBeNull()
    tap(dialog(), 'link')
    typeLink(dialog(), 'https://news.example.org/otters')
    submit(dialog())
    await vi.waitFor(() => expect(go).toHaveBeenCalledWith('/reader?userBook=' + key + '&sharedReader=1'))
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(fetchImpl.mock.calls[0][0]).toBe('/api/import-article')
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({ url: 'https://news.example.org/otters' })
    expect(upload).toHaveBeenCalledTimes(1)
    expect(upload.mock.calls[0][1]).toMatchObject({ kind: 'epub', title: 'The quiet return of the river otter', author: 'Maren Holt' })
  })

  it('Insert link: a link to a PDF is downloaded by Tinct and opened as a chosen file, through the rights step (11 Nov 2026)', async () => {
    window.history.replaceState(null, '', '/library?sharedReader=1')
    document.documentElement.classList.add('signed-in')
    const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])
    fetchImpl = vi.fn(async (path: string) => path === '/api/import-article'
      ? new Response(JSON.stringify({ error: 'This link is a PDF. Download it and add it as a book.', code: 'pdf' }), { status: 415, headers: { 'content-type': 'application/json' } })
      : new Response(pdf, { headers: { 'content-type': 'application/pdf', 'x-file-name': encodeURIComponent('Variational Bayes.pdf'), 'x-file-url': encodeURIComponent('https://papers.example.org/vb.pdf') } }))
    vi.stubGlobal('fetch', fetchImpl)
    vi.stubGlobal('TinctAI', { books: { upload: vi.fn() }, session: () => ({ token: 'token' }) })
    let rights = false
    const read = vi.fn(async (file: File) => ({ key: 'pdf:' + key, kind: 'pdf', bytes: new Uint8Array(await file.arrayBuffer()), name: file.name }))
    const preparePdf = vi.fn(async () => ({ href: '/reader?userBook=' + key + '&sharedReader=1' }))
    const engine = { RIGHTS_COPY: 'I may read this file.', rightsConfirmed: () => rights, confirmRights: () => { rights = true }, readFile: read, keepFile: async () => true, preparePdf, prepareEpub: async () => ({}), library: { touch: vi.fn() }, cloud: { mine: () => new Map() }, store: { get: () => null }, accountId: () => 'owner' }
    const go = vi.fn()
    add.openFileDialog({ engine: async () => engine, go, assessPdf: async () => null })
    tap(dialog(), 'link')
    typeLink(dialog(), 'https://papers.example.org/vb.pdf')
    submit(dialog())
    // The same rights confirmation as a chosen file.
    await vi.waitFor(() => expect(box().dataset.step).toBe('rights'))
    expect(dialog().querySelector('.own-file-rights-intro strong')?.textContent).toBe('Variational Bayes.pdf')
    const check = dialog().querySelector('.own-file-rights-box') as HTMLInputElement
    check.checked = true; check.dispatchEvent(new Event('change'))
    ;(dialog().querySelector('.own-file-continue') as HTMLButtonElement).click()
    await vi.waitFor(() => expect(go).toHaveBeenCalledWith('/reader?userBook=' + key + '&sharedReader=1'))
    expect(fetchImpl.mock.calls.map(call => call[0])).toEqual(['/api/import-article', '/api/import-file'])
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body)).toEqual({ url: 'https://papers.example.org/vb.pdf' })
    const file = read.mock.calls[0][0] as File
    expect([file.name, file.type, file.size]).toEqual(['Variational Bayes.pdf', 'application/pdf', pdf.length])
    expect(preparePdf).toHaveBeenCalledTimes(1)
  })

  it('Insert link: a linked file that cannot be fetched comes back with its own reason and the link kept', async () => {
    window.history.replaceState(null, '', '/library?sharedReader=1')
    document.documentElement.classList.add('signed-in')
    fetchImpl = vi.fn(async (path: string) => path === '/api/import-article'
      ? new Response(JSON.stringify({ error: 'x', code: 'pdf' }), { status: 415, headers: { 'content-type': 'application/json' } })
      : new Response(JSON.stringify({ error: 'This file is larger than 50 MB, the limit for your own books.', code: 'too_large' }), { status: 413, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchImpl)
    vi.stubGlobal('TinctAI', { books: { upload: vi.fn() }, session: () => ({ token: 'token' }) })
    const go = vi.fn()
    add.openFileDialog({ engine: async () => ({ readFile: vi.fn() }), go })
    tap(dialog(), 'link')
    typeLink(dialog(), 'https://example.org/huge.pdf')
    submit(dialog())
    await vi.waitFor(() => expect(dialog().querySelector('.own-link-error')?.textContent).toBe('This file is larger than 50 MB, the limit for your own books.'))
    expect((dialog().querySelector('.add-link__input') as HTMLInputElement).value).toBe('https://example.org/huge.pdf')
    expect(go).not.toHaveBeenCalled()
  })

  it('Insert link: a page with no text comes back with the reason and the link still in the field; nothing is uploaded', async () => {
    const reason = 'This page didn’t share its text. Paste the article text instead.'
    const { go, upload } = openDialog({ importReply: { error: reason, code: 'no_text' }, importStatus: 422 })
    tap(dialog(), 'link')
    typeLink(dialog(), 'https://app.example.org/read/1')
    submit(dialog())
    await vi.waitFor(() => expect(dialog().querySelector('.own-link-error')?.textContent).toBe(reason))
    expect(box().dataset.step).toBe('link')
    expect((dialog().querySelector('.add-link__input') as HTMLInputElement).value).toBe('https://app.example.org/read/1')
    expect((dialog().querySelector('.add-link__add') as HTMLButtonElement).disabled).toBe(false)
    expect(upload).not.toHaveBeenCalled()
    expect(go).not.toHaveBeenCalled()
  })

  it('Paste text: the paste box with a back chevron and no "Choose a file instead"; a link pasted into it goes to Insert link', () => {
    openDialog()
    tap(dialog(), 'paste')
    expect(box().dataset.step).toBe('paste')
    expect(dialog().querySelector('.paste-title__text')?.getAttribute('data-placeholder')).toBe('Paste text')
    expect(dialog().querySelector('.paste-quiet-link, .own-paste-file')).toBeNull()
    expect(dialog().textContent).not.toContain('Tinct imports the article')
    expect(dialog().querySelector('.tui-dialog__head .add-own-back')).not.toBeNull()
    const event = pasteInto(dialog().querySelector('.paste-box')!, 'https://news.example.org/otters')
    expect(event.defaultPrevented).toBe(true)
    expect(box().dataset.step).toBe('link')
    expect(box().classList.contains('paste-dialog')).toBe(false)
    expect((dialog().querySelector('.add-link__input') as HTMLInputElement).value).toBe('https://news.example.org/otters')
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('Paste text: text with a link in it stays text', () => {
    openDialog()
    tap(dialog(), 'paste')
    pasteInto(dialog().querySelector('.paste-box')!, 'Harbour notes\n\nThe harbour wall was rebuilt; see https://example.org/more for photographs.')
    expect(box().dataset.step).toBe('paste')
    expect(dialog().querySelector('.paste-box')?.textContent).toContain('see https://example.org/more')
  })

  it('files dropped on the choices go the same way as chosen ones, with no line saying so', async () => {
    openDialog()
    expect(dialog().textContent).not.toMatch(/drag|drop/i)
    const drop = new Event('drop', { bubbles: true, cancelable: true }) as Event & { dataTransfer?: unknown }
    Object.defineProperty(drop, 'dataTransfer', { value: { types: ['Files'], files: [new File(['PK'], 'one.epub')] } })
    box().dispatchEvent(drop)
    expect(drop.defaultPrevented).toBe(true)
  })

  it('a kept link (from /byob or the signed-out sheet, via sign-in) opens in Insert link', () => {
    const { layer } = openDialog()
    layer.showPaste({ html: '<p>https://news.example.org/otters</p>', title: '', uid: 'u', url: 'https://news.example.org/otters' })
    expect(box().dataset.step).toBe('link')
    expect((dialog().querySelector('.add-link__input') as HTMLInputElement).value).toBe('https://news.example.org/otters')
  })
})

describe('the signed-out add sheet', () => {
  let db: ReturnType<typeof memoryIndexedDb>
  beforeEach(() => { db = memoryIndexedDb(); vi.stubGlobal('indexedDB', db.api) })
  afterEach(() => { closeOwnStart(); vi.unstubAllGlobals(); document.body.replaceChildren() })
  const sheet = () => document.querySelector('[data-testid="own-start"] .own-start') as HTMLElement

  it('offers the same three choices under "Add your own"', () => {
    openOwnStart({ go: vi.fn() })
    expect(sheet().querySelector('h2')?.textContent).toBe('Add your own')
    expect([...sheet().querySelectorAll('.add-choice')].map(b => (b as HTMLElement).dataset.choice)).toEqual(['upload', 'link', 'paste'])
    expect(sheet().querySelectorAll('.own-start-lede, .own-start-drop, .own-start-choose, .paste-quiet-link')).toHaveLength(0)
  })

  it('Insert link keeps the link on this device and goes to sign-in, which returns to Preparing', async () => {
    const go = vi.fn()
    openOwnStart({ go })
    tap(sheet(), 'link')
    expect(sheet().querySelector('h2')?.textContent).toBe('Insert link')
    typeLink(sheet(), 'fieldnotes.example.net/commonplace')
    submit(sheet())
    await vi.waitFor(() => expect(go).toHaveBeenCalledWith('/sign-in?returnTo=' + encodeURIComponent('/preparing?own=paste')))
    expect(db.rows.get('paste')).toMatchObject({ url: 'https://fieldnotes.example.net/commonplace', title: '' })
  })

  it('Paste text hands a pasted link to Insert link; Upload opens the picker', () => {
    openOwnStart({ go: vi.fn() })
    const picker = vi.spyOn(sheet().querySelector('input[type=file]') as HTMLInputElement, 'click').mockImplementation(() => {})
    tap(sheet(), 'upload')
    expect(picker).toHaveBeenCalledTimes(1)
    tap(sheet(), 'paste')
    expect(sheet().querySelector('.paste-quiet-link, .own-paste-file')).toBeNull()
    pasteInto(sheet().querySelector('.paste-box')!, 'https://news.example.org/otters')
    expect(sheet().dataset.step).toBe('link')
    expect((sheet().querySelector('.add-link__input') as HTMLInputElement).value).toBe('https://news.example.org/otters')
    ;(sheet().querySelector('.add-own-back') as HTMLButtonElement).click()
    expect(sheet().dataset.step).toBe('choose')
  })
})
