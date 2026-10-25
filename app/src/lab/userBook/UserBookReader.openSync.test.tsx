// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { UserBookReader } from './UserBookReader'
import type { LoadedUserBook } from './userBookStore'

const hex = 'ab12cd34ef56ab12cd34ef56'
const fileId = 'a'.repeat(32)
const sync = vi.hoisted(() => ({
  pending: new Map<string, { marks: Promise<void>; cards: Promise<void> }>(),
  started: [] as string[], disposed: [] as string[], published: vi.fn(),
  migration: null as Promise<number> | null,
  metadata: null as Promise<{ id: string; type: 'epub' | 'pdf'; title: string; author: string; name: string; metadataRev: number }> | null,
  localFileId: null as Promise<string | null> | null,
  pdfText: null as Promise<boolean> | null,
  scan: null as Promise<null> | null,
}))

vi.mock('../LabApp', () => ({ LabApp: ({ userBook, marginPhone }: { userBook: { bookId: string; storedCover?: string | null }; marginPhone?: boolean }) =>
  <div data-testid="opened-book" data-cover={userBook.storedCover ?? ''} data-margin-phone={marginPhone ? 'yes' : 'no'}>{userBook.bookId}</div> }))
vi.mock('./userBookSource', () => ({ registerUserBook: sync.published }))
vi.mock('./userBookStore', () => ({
  openUserBook: vi.fn(), readOwnedBookFileId: vi.fn(() => sync.localFileId ?? Promise.resolve(fileId)),
  hasOwnedPdfText: vi.fn(() => sync.pdfText ?? Promise.resolve(false)), loadOwnedPdfBytes: vi.fn(),
  readOwnedPdfScanEntries: vi.fn(() => sync.scan ?? Promise.resolve(null)),
}))
vi.mock('./pdfOriginalPlace', () => ({
  openPdfOriginalPlace: async () => ({ page: 3, frac: 0.2 }), notePdfOriginalPlace: vi.fn(),
  readPdfOriginalZoom: () => 1, notePdfOriginalZoom: vi.fn(),
}))
vi.mock('./usePdfOriginalServices', () => ({ usePdfOriginalServices: () => null }))
vi.mock('../sharedReader/pdf/PdfOriginalReaderShell', () => ({ PdfOriginalReaderShell: ({ title, onOpenText, textAvailable, textBusy, textError }: { title: string; onOpenText?: (place:{page:number;frac:number})=>void; textAvailable?:boolean; textBusy?:boolean; textError?:string }) =>
  <div data-testid="original-pages" data-text={textAvailable ? 'yes' : 'no'}>{title}<button disabled={textBusy} onClick={()=>onOpenText?.({page:4,frac:.6})}>Convert fixture</button>{textError && <p role="status">{textError}</p>}</div> }))
vi.mock('./ownBookMetadata', () => ({
  currentOwnBookMetadata: vi.fn(() => sync.metadata ?? Promise.resolve({ id: fileId, type: 'epub', title: '', author: '', name: '', metadataRev: 0 })),
  withOwnBookMetadata: (book: unknown) => book,
}))
vi.mock('./ownTextMarksSync', () => ({
  guardOwnTextMarks: vi.fn(), releaseOwnTextMarksGuard: vi.fn(),
  startOwnTextMarksSync: (_hex: string, owner: string) => ({
    open: () => { sync.started.push(`${owner}:marks`); return sync.pending.get(owner)!.marks },
    dispose: () => { sync.disposed.push(`${owner}:marks`) },
  }),
  unassignedOwnTextMarkCount: () => 0, adoptUnassignedOwnTextMarks: vi.fn(),
  listenOwnTextMarks: () => () => {},
}))
vi.mock('./ownTextCardsSync', () => ({
  OwnTextCardsSync: class {
    owner: string
    constructor(_hex: string, owner: string) { this.owner = owner }
    open() { sync.started.push(`${this.owner}:cards`); return sync.pending.get(this.owner)!.cards }
    dispose() { sync.disposed.push(`${this.owner}:cards`) }
    subscribe() { return () => {} }
  },
  unassignedOwnTextCardCount: () => 0, adoptUnassignedOwnTextCards: vi.fn(),
}))
vi.mock('./legacyEpubMarks', () => ({
  unclaimedLegacyEpubCount: () => 0, migrateVerifiedLegacyEpubMarks: () => sync.migration ?? Promise.resolve(0),
  syncClaimedLegacyEpubPages: () => ({ queued: 0, keptLocal: 0 }), allLegacyEpubNotebookItems: () => [],
  claimLegacyEpubAnnotations: vi.fn(),
}))

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>(done => { resolve = done })
  return { promise, resolve }
}
function book():LoadedUserBook {
  return { hex, bookId: `userbook-${hex}`, kind: 'epub' as const, images: new Map(), place: null,
    edition: { format: 'tinct-user-edition-v1', converter: 7, title: 'Private Book', author: '', language: 'en', droppedImages: 0,
      chapters: [{ number: 1, title: 'One', paragraphs: ['This private chapter is ready.'] }] } }
}
afterEach(() => { cleanup(); sync.pending.clear(); sync.started.length = 0; sync.disposed.length = 0; sync.published.mockClear(); sync.migration = null; sync.metadata = null; sync.localFileId = null; sync.pdfText = null; sync.scan = null; localStorage.clear(); window.history.replaceState(null, '', '/') })

it('starts both owner-qualified requests together, waits for both, and rejects a late old-owner completion', async () => {
  const aMarks = deferred(), aCards = deferred(), bMarks = deferred(), bCards = deferred()
  sync.pending.set('account-a', { marks: aMarks.promise, cards: aCards.promise })
  sync.pending.set('account-b', { marks: bMarks.promise, cards: bCards.promise })
  const open = vi.fn(async () => ({ ok: true as const, book: book() }))
  const reconcile = vi.fn(async () => {})
  const { rerender } = render(<UserBookReader hex={hex} owner="account-a" sharedReader open={open} reconcile={reconcile} />)
  await waitFor(() => expect(sync.started).toEqual(['account-a:marks', 'account-a:cards']))
  expect(screen.queryByTestId('opened-book')).toBeNull()
  await act(async () => { aCards.resolve(); await aCards.promise })
  expect(screen.queryByTestId('opened-book')).toBeNull()

  rerender(<UserBookReader hex={hex} owner="account-b" sharedReader open={open} reconcile={reconcile} />)
  await waitFor(() => expect(sync.started).toEqual(['account-a:marks', 'account-a:cards', 'account-b:marks', 'account-b:cards']))
  expect(sync.disposed).toEqual(expect.arrayContaining(['account-a:marks', 'account-a:cards']))
  await act(async () => { bMarks.resolve(); await bMarks.promise })
  expect(screen.queryByTestId('opened-book')).toBeNull()
  await act(async () => { bCards.resolve(); await bCards.promise })
  await waitFor(() => expect(screen.getByTestId('opened-book').textContent).toBe(`userbook-${hex}`))
  expect(sync.published).toHaveBeenCalledOnce()
  await act(async () => { aMarks.resolve(); await aMarks.promise })
  expect(screen.getAllByTestId('opened-book')).toHaveLength(1)
  expect(sync.published).toHaveBeenCalledOnce()
  expect(sync.disposed).toEqual(expect.arrayContaining(['account-a:marks', 'account-a:cards']))
})

it('opens a previously converted EPUB before its older annotation import finishes', async () => {
  const migrated = deferred()
  sync.migration = migrated.promise.then(() => 1)
  sync.pending.set('account-a', { marks: Promise.resolve(), cards: Promise.resolve() })
  const earlierEdition = { ...book(), edition: { ...book().edition, converter: 5, title: 'Synthetic migrated EPUB' } }
  render(<UserBookReader hex={hex} owner="account-a" sharedReader
    open={async () => ({ ok: true, book: earlierEdition })} reconcile={async () => {}} />)
  await waitFor(() => expect(sync.started).toEqual(['account-a:marks', 'account-a:cards']))
  // A large older EPUB may take minutes to parse solely for legacy marks.
  // Its already-converted chapters are usable while that optional import waits.
  await waitFor(() => expect(screen.getByTestId('opened-book').textContent).toBe(`userbook-${hex}`), { timeout: 250 })
  await act(async () => { migrated.resolve(); await migrated.promise })
})

it('requests the same phone chrome for shared own-book text while keeping nonshared opt-in', async () => {
  sync.pending.set('account-a', { marks: Promise.resolve(), cards: Promise.resolve() })
  const open = async () => ({ ok: true as const, book: book() })
  render(<UserBookReader hex={hex} owner="account-a" sharedReader phone open={open} reconcile={async () => {}} />)
  await waitFor(() => expect(screen.getByTestId('opened-book').getAttribute('data-margin-phone')).toBe('yes'))
  cleanup()
  render(<UserBookReader hex={hex} owner="account-a" phone open={open} reconcile={async () => {}} />)
  await waitFor(() => expect(screen.getByTestId('opened-book').getAttribute('data-margin-phone')).toBe('no'))
})

it('opens owner-qualified converted text while account metadata is pending, then attaches its verified generation', async () => {
  let resolveMetadata!: (value: { id: string; type: 'epub' | 'pdf'; title: string; author: string; name: string; metadataRev: number }) => void
  sync.metadata = new Promise(resolve => { resolveMetadata = resolve })
  sync.pending.set('account-a', { marks: Promise.resolve(), cards: Promise.resolve() })
  render(<UserBookReader hex={hex} owner="account-a" sharedReader open={async () => ({ ok: true, book: book() })} reconcile={async () => {}} />)
  await waitFor(() => expect(screen.getByTestId('opened-book').textContent).toBe(`userbook-${hex}`), { timeout: 1200 })
  expect(sync.started).toEqual([])
  await act(async () => resolveMetadata({ id: fileId, type: 'epub', title: '', author: '', name: '', metadataRev: 0 }))
  await waitFor(() => expect(sync.started).toEqual(['account-a:marks', 'account-a:cards']))
})

it('keeps the new owner’s page isolated when older metadata or cover work finishes later', async () => {
  let resolveMetadata!: (value: { id: string; type: 'epub' | 'pdf'; title: string; author: string; name: string; metadataRev: number }) => void
  sync.metadata = new Promise(resolve => { resolveMetadata = resolve })
  let resolveCover!: (url: string | null) => void
  const oldCover = new Promise<string | null>(resolve => { resolveCover = resolve })
  const open = vi.fn(async (_hex: string, options: { owner?: string | null }) => ({ ok: true as const,
    book: { ...book(), storedCoverPending: options.owner === 'account-a' ? oldCover : Promise.resolve('cover-b') } }))
  sync.pending.set('account-b', { marks: Promise.resolve(), cards: Promise.resolve() })
  const { rerender } = render(<UserBookReader hex={hex} owner="account-a" sharedReader open={open} reconcile={async () => {}} />)
  await waitFor(() => expect(screen.getByTestId('opened-book')).toBeTruthy(), { timeout: 1200 })
  rerender(<UserBookReader hex={hex} owner="account-b" sharedReader open={open} reconcile={async () => {}} />)
  sync.metadata = null
  await waitFor(() => expect(screen.getByTestId('opened-book').getAttribute('data-cover')).toBe('cover-b'))
  await act(async () => {
    resolveCover('cover-a')
    resolveMetadata({ id: fileId, type: 'epub', title: 'A-only title', author: '', name: '', metadataRev: 1 })
  })
  expect(screen.getByTestId('opened-book').getAttribute('data-cover')).toBe('cover-b')
  expect(sync.started).toEqual(['account-b:marks', 'account-b:cards'])
})

it('opens text without an unbounded local file-ID lookup and attaches it when verified', async () => {
  let resolveId!: (value: string | null) => void
  sync.metadata = Promise.resolve({ id: '', type: 'epub', title: '', author: '', name: '', metadataRev: 0 })
  sync.localFileId = new Promise(resolve => { resolveId = resolve })
  sync.pending.set('account-a', { marks: Promise.resolve(), cards: Promise.resolve() })
  render(<UserBookReader hex={hex} owner="account-a" sharedReader open={async () => ({ ok: true, book: book() })} reconcile={async () => {}} />)
  await waitFor(() => expect(screen.getByTestId('opened-book')).toBeTruthy(), { timeout: 1200 })
  expect(sync.started).toEqual([])
  await act(async () => resolveId(fileId))
  await waitFor(() => expect(sync.started).toEqual(['account-a:marks', 'account-a:cards']))
})

it('shows owned Original PDF pages while optional labels, outline and text-switch checks wait', async () => {
  window.history.replaceState(null, '', `/reader?userBook=${hex}&pages`)
  let resolveMetadata!: (value: { id: string; type: 'epub' | 'pdf'; title: string; author: string; name: string; metadataRev: number }) => void
  let resolveText!: (value: boolean) => void
  let resolveScan!: (value: null) => void
  sync.metadata = new Promise(resolve => { resolveMetadata = resolve })
  sync.pdfText = new Promise(resolve => { resolveText = resolve })
  sync.scan = new Promise(resolve => { resolveScan = resolve })
  const open = vi.fn()
  render(<UserBookReader hex={hex} owner="account-a" sharedReader open={open} />)
  await waitFor(() => expect(screen.getByTestId('original-pages').textContent).toContain('Your PDF'), { timeout: 1200 })
  expect(open).not.toHaveBeenCalled()
  expect(screen.getByTestId('original-pages').getAttribute('data-text')).toBe('no')
  await act(async () => {
    resolveMetadata({ id: fileId, type: 'pdf', title: 'Recovered PDF title', author: '', name: '', metadataRev: 1 })
    resolveText(true)
    resolveScan(null)
  })
  await waitFor(() => expect(screen.getByTestId('original-pages').textContent).toContain('Recovered PDF title'))
  expect(screen.getByTestId('original-pages').getAttribute('data-text')).toBe('yes')
})

it('converts an uncached PDF only when chosen and carries page fraction into the shared text route', async()=>{
  window.history.replaceState(null,'',`/reader?userBook=${hex}&sharedReader=1&pages`)
  const forward=vi.fn(), open=vi.fn(async()=>({ok:true as const,book:{...book(),kind:'pdf' as const}}))
  render(<UserBookReader hex={hex} owner="account-a" sharedReader open={open} forward={forward} />)
  await screen.findByTestId('original-pages')
  expect(open).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button',{name:'Convert fixture'}))
  await waitFor(()=>expect(forward).toHaveBeenCalledWith(`/reader?userBook=${hex}&sharedReader=1&page=4&frac=0.6`))
  expect(open).toHaveBeenCalledWith(hex,expect.objectContaining({owner:'account-a',page:4,sharedReader:true,desktop:true}))
  expect(JSON.parse(localStorage.getItem(`tinct-addbook:edition:${hex}`)||'null')).toBe('text')
  const {notePdfOriginalPlace}=await import('./pdfOriginalPlace')
  expect(notePdfOriginalPlace).toHaveBeenCalledWith(hex,'account-a',{page:4,frac:.6},undefined,true)
})
it('keeps original pages open and restores their preference when no readable conversion exists', async()=>{
  window.history.replaceState(null,'',`/reader?userBook=${hex}&pages`)
  const forward=vi.fn(),open=vi.fn(async()=>({ok:false as const,reason:'pages_only' as const,message:'No recognised text'}))
  render(<UserBookReader hex={hex} owner="account-a" sharedReader open={open} forward={forward} />)
  await screen.findByTestId('original-pages')
  fireEvent.click(screen.getByRole('button',{name:'Convert fixture'}))
  await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('recognised text'))
  expect(forward).not.toHaveBeenCalled()
  expect(screen.getByTestId('original-pages')).toBeTruthy()
  expect(JSON.parse(localStorage.getItem(`tinct-addbook:edition:${hex}`)||'null')).toBe('pages')
})

it('does not navigate from an old account conversion that completes after an account change',async()=>{
  window.history.replaceState(null,'',`/reader?userBook=${hex}&pages`)
  let finish!:(value:{ok:true;book:ReturnType<typeof book>})=>void
  const open=vi.fn(()=>new Promise<{ok:true;book:ReturnType<typeof book>}>(resolve=>{finish=resolve})),forward=vi.fn()
  const view=render(<UserBookReader hex={hex} owner="account-a" sharedReader open={open} forward={forward} />)
  await screen.findByTestId('original-pages')
  fireEvent.click(screen.getByRole('button',{name:'Convert fixture'}))
  expect(screen.getByRole('button',{name:'Convert fixture'}).hasAttribute('disabled')).toBe(true)
  view.rerender(<UserBookReader hex={hex} owner="account-b" sharedReader open={open} forward={forward} />)
  await screen.findByTestId('original-pages')
  await act(async()=>{finish({ok:true,book:book()})})
  expect(forward).not.toHaveBeenCalled()
})
it('does not navigate when a conversion completes after leaving the reader',async()=>{
  window.history.replaceState(null,'',`/reader?userBook=${hex}&pages`)
  let finish!:(value:{ok:true;book:ReturnType<typeof book>})=>void
  const open=vi.fn(()=>new Promise<{ok:true;book:ReturnType<typeof book>}>(resolve=>{finish=resolve})),forward=vi.fn()
  const view=render(<UserBookReader hex={hex} owner="account-a" sharedReader open={open} forward={forward} />)
  await screen.findByTestId('original-pages')
  fireEvent.click(screen.getByRole('button',{name:'Convert fixture'}))
  view.unmount()
  await act(async()=>{finish({ok:true,book:book()})})
  expect(forward).not.toHaveBeenCalled()
})
