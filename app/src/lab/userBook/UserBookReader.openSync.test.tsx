// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { UserBookReader } from './UserBookReader'

const hex = 'ab12cd34ef56ab12cd34ef56'
const fileId = 'a'.repeat(32)
const sync = vi.hoisted(() => ({
  pending: new Map<string, { marks: Promise<void>; cards: Promise<void> }>(),
  started: [] as string[], disposed: [] as string[], published: vi.fn(),
}))

vi.mock('../LabApp', () => ({ LabApp: ({ userBook }: { userBook: { bookId: string } }) => <div data-testid="opened-book">{userBook.bookId}</div> }))
vi.mock('./userBookSource', () => ({ registerUserBook: sync.published }))
vi.mock('./userBookStore', () => ({
  openUserBook: vi.fn(), readOwnedBookFileId: vi.fn(async () => fileId),
  hasOwnedPdfText: vi.fn(), loadOwnedPdfBytes: vi.fn(), readOwnedPdfScanEntries: vi.fn(),
}))
vi.mock('./ownBookMetadata', () => ({
  currentOwnBookMetadata: vi.fn(async () => ({ id: fileId, type: 'epub', title: '', author: '', name: '', metadataRev: 0 })),
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
  unclaimedLegacyEpubCount: () => 0, migrateVerifiedLegacyEpubMarks: async () => 0,
  syncClaimedLegacyEpubPages: () => ({ queued: 0, keptLocal: 0 }), allLegacyEpubNotebookItems: () => [],
  claimLegacyEpubAnnotations: vi.fn(),
}))

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>(done => { resolve = done })
  return { promise, resolve }
}
function book() {
  return { hex, bookId: `userbook-${hex}`, kind: 'epub' as const, images: new Map(), place: null,
    edition: { format: 'tinct-user-edition-v1', converter: 7, title: 'Private Book', author: '', language: 'en', droppedImages: 0,
      chapters: [{ number: 1, title: 'One', paragraphs: ['This private chapter is ready.'] }] } }
}
afterEach(() => { cleanup(); sync.pending.clear(); sync.started.length = 0; sync.disposed.length = 0; sync.published.mockClear(); localStorage.clear() })

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
