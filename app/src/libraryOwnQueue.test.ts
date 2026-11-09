// @vitest-environment jsdom
// Several own books at once (Anders, 9 Nov 2026: "Lets do bulk uploads, yes"): the queue
// (public/lab/library_2/own-queue.js) and the "Your own book" pop-up drawing it (add-to-tinct.js).
import { afterEach, describe, expect, it, vi } from 'vitest'
import '../public/lab/wait-ring.js'
// @ts-expect-error -- plain browser module of the library page
import * as queue from '../public/lab/library_2/own-queue.js'
// @ts-expect-error -- plain browser module of the library page
import * as addToTinct from '../public/lab/library_2/add-to-tinct.js'

type Read = { kind: 'pdf' | 'epub'; bytes: Uint8Array; key: string } | { error: string }

/** Add a book's engine (add-engine.js) as the queue uses it: each file its own key, recording each step. */
function fakeEngine({ rights = true, onShelf = [] as string[], readErrors = {} as Record<string, string>, kept = true, uploadError = null as null | { code: string } } = {}) {
  const steps: string[] = []
  let confirmed = rights
  const shelf = new Set(onShelf)
  const keyOf = (name: string) => (/\.pdf$/i.test(name) ? 'pdf:' : 'epub:') + name.replace(/\W/g, '').toLowerCase().padEnd(24, '0').slice(0, 24)
  const api = {
    RIGHTS_COPY: 'I have the right to add this file.',
    ACCOUNT_COPY_WAIT_MS: 50,
    rightsConfirmed: () => confirmed,
    confirmRights: () => { steps.push('rights'); confirmed = true },
    readFile: async (file: File): Promise<Read> => {
      steps.push('read ' + file.name)
      if (readErrors[file.name]) return { error: readErrors[file.name] }
      return { kind: /\.pdf$/i.test(file.name) ? 'pdf' : 'epub', bytes: new Uint8Array([1]), key: keyOf(file.name) }
    },
    keepFile: async (file: File) => { steps.push('keep ' + file.name); return kept },
    prepareEpub: async (_b: Uint8Array, name: string, key: string, upload: File | null, { notify = (_: string) => {} } = {}) => {
      steps.push('epub ' + name); if (upload && uploadError) notify('Kept on this device only: your account’s storage for books is full.')
      return { href: '/reader?userBook=' + key.slice(5) }
    },
    preparePdf: async (file: File, key: string) => { steps.push('pdf ' + file.name); return { href: '/lab/addbook/?userBook=' + key.slice(4) } },
    saveToAccount: async (_key: string, file: File, meta: { kind: string, title: string }) => { steps.push(`save ${file.name} ${meta.kind} ${meta.title}`) },
    library: { get: async (key: string) => shelf.has(key) ? { key, title: 'On the shelf' } : (steps.some(s => s.startsWith('keep ') && keyOf(s.slice(5)) === key) ? { key, title: 'Named title' } : null) },
    cloud: { get: () => null },
  }
  return { steps, api, keyOf, engine: async () => api }
}
const file = (name: string, body = 'x') => new File([body], name)

describe('own-queue: several files, one after another', () => {
  it('runs files strictly in order, one at a time, and settles once', async () => {
    let active = 0, most = 0
    const order: string[] = [], settled = vi.fn()
    const q = queue.createQueue([file('a.pdf'), file('b.epub'), file('c.pdf')], {
      prepare: async (f: File) => { active++; most = Math.max(most, active); order.push(f.name); await new Promise(r => setTimeout(r, 5)); active--; return { status: 'ready', key: f.name } },
      onSettled: settled,
    })
    const items = await q.done()
    expect(order).toEqual(['a.pdf', 'b.epub', 'c.pdf'])
    expect(most).toBe(1)
    expect(items.map((i: { status: string }) => i.status)).toEqual(['ready', 'ready', 'ready'])
    expect(settled).toHaveBeenCalledTimes(1)
  })

  it('one failure never stops the others: a throw and a refusal each keep their own reason', async () => {
    const q = queue.createQueue([file('a.pdf'), file('bad.pdf'), file('c.pdf'), file('d.epub')], {
      prepare: async (f: File) => {
        if (f.name === 'bad.pdf') throw Object.assign(new Error('account_full'), { code: 'account_full' })
        if (f.name === 'c.pdf') return { status: 'failed', reason: 'That file is larger than 300 MB, too big to open here.' }
        return { status: 'ready', key: f.name }
      },
    })
    const items = await q.done()
    expect(items.map((i: { status: string }) => i.status)).toEqual(['ready', 'failed', 'failed', 'ready'])
    expect(items[1].reason).toBe('Your account’s storage for books is full.')
    expect(items[2].reason).toBe('That file is larger than 300 MB, too big to open here.')
  })

  it('takes more files at the end while it runs, and reports waiting/preparing as it goes', async () => {
    const seen: string[] = []
    let release!: () => void
    const gate = new Promise<void>(r => { release = r })
    const q = queue.createQueue([file('a.pdf')], {
      prepare: async (f: File) => { if (f.name === 'a.pdf') await gate; return { status: 'ready' } },
      onChange: (items: Array<{ status: string }>) => seen.push(items.map(i => i.status).join(',')),
    })
    q.add([file('b.pdf')])
    expect(q.items.map((i: { status: string }) => i.status)).toEqual(['preparing', 'waiting'])
    release()
    const items = await q.done()
    expect(items.map((i: { name: string }) => i.name)).toEqual(['a.pdf', 'b.pdf'])
    expect(seen).toContain('preparing,waiting')
    expect(seen.at(-1)).toBe('ready,ready')
  })
})

describe('own-queue: each file through the one-file path’s own steps', () => {
  it('reads, keeps and prepares an EPUB as the one-file path does', async () => {
    const fake = fakeEngine()
    const out = await queue.prepareQueuedFile(fake.api, file('book.epub'), {})
    expect(out).toEqual({ status: 'ready', key: fake.keyOf('book.epub'), note: '' })
    expect(fake.steps).toEqual(['read book.epub', 'keep book.epub', 'epub book.epub'])
  })

  it('sends a queued PDF’s account copy, named as it was kept (a PDF alone sends it from its reader)', async () => {
    const fake = fakeEngine()
    const out = await queue.prepareQueuedFile(fake.api, file('notes.pdf'), {})
    expect(out.status).toBe('ready')
    expect(fake.steps).toEqual(['read notes.pdf', 'keep notes.pdf', 'pdf notes.pdf', 'save notes.pdf pdf Named title'])
  })

  it('skips a file already on My shelf, and the same file twice in one batch, with a short note', async () => {
    const fake = fakeEngine({ onShelf: [fakeEngine().keyOf('old.epub')] })
    const seen = new Set<string>()
    expect(await queue.prepareQueuedFile(fake.api, file('old.epub'), { seen })).toEqual({ status: 'skipped', reason: 'Already on My shelf', key: fake.keyOf('old.epub') })
    expect((await queue.prepareQueuedFile(fake.api, file('new.epub'), { seen })).status).toBe('ready')
    expect(await queue.prepareQueuedFile(fake.api, file('new.epub'), { seen })).toMatchObject({ status: 'skipped', reason: 'Already on My shelf' })
    expect(fake.steps.filter(s => s.startsWith('keep'))).toEqual(['keep new.epub'])
  })

  it('honours the gates: signed out reads nothing; the engine’s size and type refusals are the reason; no rights, no keeping', async () => {
    const fake = fakeEngine({ readErrors: { 'huge.pdf': 'That file is larger than 300 MB, too big to open here.' } })
    expect(await queue.prepareQueuedFile(fake.api, file('a.pdf'), { authorize: async () => false })).toEqual({ status: 'failed', reason: queue.QUEUE_COPY.signedOut })
    expect(fake.steps).toEqual([])
    expect(await queue.prepareQueuedFile(fake.api, file('huge.pdf'), {})).toEqual({ status: 'failed', reason: 'That file is larger than 300 MB, too big to open here.' })
    const unconfirmed = fakeEngine({ rights: false })
    expect((await queue.prepareQueuedFile(unconfirmed.api, file('a.epub'), {})).status).toBe('failed')
    expect(unconfirmed.steps).toEqual(['read a.epub'])
  })

  it('an account refusal on upload is said on the row, as the one-file path says it, and the book is still added here', async () => {
    const fake = fakeEngine({ uploadError: { code: 'account_full' } })
    expect(await queue.prepareQueuedFile(fake.api, file('a.epub'), {})).toMatchObject({ status: 'ready', note: 'Kept on this device only: your account’s storage for books is full.' })
  })

  it('a browser that cannot keep a copy fails that file with the reason', async () => {
    const fake = fakeEngine({ kept: false })
    expect(await queue.prepareQueuedFile(fake.api, file('a.epub'), {})).toEqual({ status: 'failed', reason: queue.QUEUE_COPY.unkept })
  })

  it('a text file keeps the paste limits: empty and too long are refused with the paste window’s words', async () => {
    const fake = fakeEngine()
    expect(await queue.prepareQueuedFile(fake.api, file('blank.txt', '   '), {})).toEqual({ status: 'failed', reason: 'This text file is empty.' })
    const long = await queue.prepareQueuedFile(fake.api, file('long.txt', 'word '.repeat(50000)), {})
    expect(long.status).toBe('failed')
    expect(long.reason).toMatch(/^This text is too long to paste/)
    expect(fake.steps).toEqual([])
  })

  it('words engine codes as the Preparing page does', () => {
    expect(queue.queueReason({ code: 'offline' })).toBe('No connection. Check your internet and try again.')
    expect(queue.queueReason({ status: 413 })).toBe('Files over 50 MB are not saved to your account.')
    expect(queue.queueReason(new Error('This book is protected by DRM.'))).toBe('This book is protected by DRM.')
    expect(queue.queueReason(new Error('bad_epub'))).toBe(queue.QUEUE_COPY.failed)
  })
})

describe('the "Your own book" pop-up with several files', () => {
  afterEach(() => { addToTinct.closeFileDialog(); document.documentElement.classList.remove('signed-in'); document.body.replaceChildren() })
  const dialog = () => document.querySelector('[data-testid="own-file-dialog"]')
  const choose = (...files: File[]) => {
    const input = dialog()!.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: files, configurable: true })
    input.dispatchEvent(new Event('change'))
  }
  const rows = () => [...dialog()!.querySelectorAll('.own-queue__item')].map(row => `${row.querySelector('.own-queue__name')!.textContent} | ${row.querySelector('.own-queue__status')!.textContent}`)

  it('the picker takes several files', async () => {
    document.documentElement.classList.add('signed-in')
    await addToTinct.openFileEntry(null, { access: async () => true, go: vi.fn(), engine: fakeEngine().engine })
    expect((dialog()!.querySelector('input[type="file"]') as HTMLInputElement).multiple).toBe(true)
  })

  it('one file chosen keeps today’s path exactly: no queue, the book opens', async () => {
    document.documentElement.classList.add('signed-in')
    const go = vi.fn(), showShelf = vi.fn(), fake = fakeEngine()
    await addToTinct.openFileEntry(null, { access: async () => true, go, showShelf, engine: fake.engine })
    choose(file('one.epub'))
    await vi.waitFor(() => expect(go).toHaveBeenCalledTimes(1))
    expect(go).toHaveBeenCalledWith('/reader?userBook=' + fake.keyOf('one.epub').slice(5))
    expect(fake.steps).toEqual(['read one.epub', 'keep one.epub', 'epub one.epub'])
    expect(dialog()!.querySelector('.own-queue')).toBeNull()
    expect(showShelf).not.toHaveBeenCalled()
  })

  it('three files: rights asked once, a queue with each status, books announced as ready, then My shelf; a failure keeps its reason', async () => {
    document.documentElement.classList.add('signed-in')
    const go = vi.fn(), showShelf = vi.fn(), added: string[] = []
    const onAdded = (event: Event) => added.push((event as CustomEvent).detail.key)
    addEventListener('library2:own-added', onAdded)
    const fake = fakeEngine({ rights: false, readErrors: { 'broken.pdf': 'This file could not be opened. Choose another file.' } })
    await addToTinct.openFileEntry(null, { access: async () => true, go, showShelf, engine: fake.engine })
    choose(file('first.epub'), file('broken.pdf'), file('third.pdf'))
    await vi.waitFor(() => expect(dialog()!.querySelector('.own-file-rights')).not.toBeNull())
    expect(dialog()!.textContent).toContain('Tinct opens 3 files here')
    const check = dialog()!.querySelector('.own-file-rights-box') as HTMLInputElement
    check.checked = true; check.dispatchEvent(new Event('change'))
    ;(dialog()!.querySelector('.own-file-continue') as HTMLButtonElement).click()
    await vi.waitFor(() => expect(showShelf).toHaveBeenCalledTimes(1))
    removeEventListener('library2:own-added', onAdded)
    expect(fake.steps.filter(s => s === 'rights')).toHaveLength(1)
    expect(fake.steps.filter(s => s.startsWith('read '))).toEqual(['read first.epub', 'read broken.pdf', 'read third.pdf'])
    expect(added).toEqual([fake.keyOf('first.epub'), fake.keyOf('third.pdf')])
    // Never opens a book after a batch.
    expect(go).not.toHaveBeenCalled()
    expect(dialog()!.querySelector('h2')!.textContent).toBe('Added 2 of 3 books')
    expect(rows()).toEqual(['first.epub | Added', 'broken.pdf | This file could not be opened. Choose another file.', 'third.pdf | Added'])
    expect(addToTinct.ownQueue().map((i: { status: string }) => i.status)).toEqual(['ready', 'failed', 'ready'])
    // Closing the finished list forgets it.
    ;(dialog()!.querySelector('.own-file-close') as HTMLButtonElement).click()
    expect(addToTinct.ownQueue()).toBeNull()
  })

  it('all added: the pop-up goes and My shelf shows them', async () => {
    document.documentElement.classList.add('signed-in')
    const showShelf = vi.fn()
    await addToTinct.openFileEntry(null, { access: async () => true, go: vi.fn(), showShelf, engine: fakeEngine().engine })
    choose(file('a.epub'), file('b.epub'))
    await vi.waitFor(() => expect(showShelf).toHaveBeenCalledTimes(1))
    expect(dialog()).toBeNull()
    expect(addToTinct.ownQueue()).toBeNull()
  })

  it('is not busy: the × closes it while the queue carries on, and the + shows it again', async () => {
    document.documentElement.classList.add('signed-in')
    const showShelf = vi.fn()
    let release!: () => void
    const gate = new Promise<void>(r => { release = r })
    const fake = fakeEngine({ readErrors: { 'c.pdf': 'Choose a PDF or EPUB file.' } })
    const slow = { ...fake.api, keepFile: async (f: File) => { await gate; return fake.api.keepFile(f) } }
    await addToTinct.openFileEntry(null, { access: async () => true, go: vi.fn(), showShelf, engine: async () => slow })
    choose(file('a.epub'), file('b.epub'), file('c.pdf'))
    await vi.waitFor(() => expect(dialog()!.querySelector('.own-queue')).not.toBeNull())
    expect(dialog()!.querySelector('h2')!.textContent).toBe('Adding 3 books')
    expect(rows()).toEqual(['a.epub | Preparing', 'b.epub | Waiting', 'c.pdf | Waiting'])
    ;(dialog()!.querySelector('.own-file-close') as HTMLButtonElement).click()
    expect(dialog()).toBeNull()
    await addToTinct.openFileEntry(null, { access: async () => true, go: vi.fn(), showShelf, engine: async () => slow })
    expect(rows()[0]).toBe('a.epub | Preparing')
    ;(dialog()!.querySelector('.own-file-close') as HTMLButtonElement).click()
    release()
    // A failure brings the list back, with its reason, once the batch is done.
    await vi.waitFor(() => expect(showShelf).toHaveBeenCalledTimes(1))
    await vi.waitFor(() => expect(dialog()).not.toBeNull())
    expect(rows()).toEqual(['a.epub | Added', 'b.epub | Added', 'c.pdf | Choose a PDF or EPUB file.'])
  })

  it('a free account choosing several files is offered Premium and nothing is read', async () => {
    document.documentElement.classList.add('signed-in')
    let resolve: ((yes: boolean) => void) | undefined
    const go = vi.fn(), fake = fakeEngine()
    const opening = addToTinct.openFileEntry(null, { access: () => new Promise<boolean>(r => { resolve = r }), go, engine: fake.engine })
    choose(file('a.epub'), file('b.epub'))
    // Wait for the access check itself rather than a fixed number of ticks (it failed under CI load).
    await vi.waitFor(() => expect(resolve).toBeTypeOf('function'))
    resolve!(false); await opening
    await vi.waitFor(() => expect(go).toHaveBeenCalledWith(addToTinct.PREMIUM_PAGE))
    expect(fake.steps).toEqual([])
    expect(addToTinct.ownQueue()).toBeNull()
  })

  it('files dropped on the pop-up go the same way', async () => {
    document.documentElement.classList.add('signed-in')
    const showShelf = vi.fn()
    await addToTinct.openFileEntry(null, { access: async () => true, go: vi.fn(), showShelf, engine: fakeEngine().engine })
    const box = dialog()!.querySelector('.own-file-dialog')!
    const drop = new Event('drop', { bubbles: true, cancelable: true }) as Event & { dataTransfer: unknown }
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [file('x.epub'), file('y.epub')], types: ['Files'] } })
    box.dispatchEvent(drop)
    expect(drop.defaultPrevented).toBe(true)
    await vi.waitFor(() => expect(showShelf).toHaveBeenCalledTimes(1))
  })
})
