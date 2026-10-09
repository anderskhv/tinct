// @vitest-environment jsdom
/**
 * One shelf truth (Anders, 2026-10-09: "There's a diff between my library, my fast
 * book picker in reader — and my shelf doesn't show the cover"): the library's
 * reading table (and My shelf's Currently reading, drawn from it) and the reader's
 * book switcher list the same books, in the same order, with the same cover per
 * book — an own EPUB and every kind of removal included.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyLabPositionState, type LabPositionState } from './lab/labPosition'
import { ownReading, type OwnShelfBook } from './lab/userBook/ownShelf'

const VIEWER = 'viewer-a'
const fixture = vi.hoisted(() => ({ positions: null as unknown, own: [] as unknown[] }))

vi.mock('./services/supabase', () => ({
  supabase: {
    auth: { getSession: async () => ({ data: { session: { user: { id: 'viewer-a' }, access_token: 'token-a' } } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
    from: () => ({ select: () => ({ eq: () => ({ or: () => Promise.resolve({ data: [], error: null }), like: () => Promise.resolve({ data: [], error: null }) }) }) }),
    rpc: async () => ({ data: null, error: null }),
  },
  isSupabaseConfigured: () => true,
}))
vi.mock('./readingMemory/recapLoad', () => ({ loadRecap: async () => null }))
vi.mock('./lab/labPositionStore', async original => ({
  ...await original<typeof import('./lab/labPositionStore')>(),
  prepareLabPositionLocal: async () => fixture.positions,
  fetchLabPositionCloud: async () => null,
  readLabPositionLocal: () => fixture.positions,
  writeLabPositionLocal: (value: unknown) => value,
  putLabPositionCloud: async () => true,
}))
// The own books on this device: Add a book's IndexedDB, as ownShelf.ts summarizes it.
vi.mock('./lab/userBook/ownShelf', async original => ({
  ...await original<typeof import('./lab/userBook/ownShelf')>(),
  readOwnShelf: async (owner: string | null) => owner === 'viewer-a' ? fixture.own : [],
}))
vi.mock('./lab/labLibraryBoot', async original => ({
  ...await original<typeof import('./lab/labLibraryBoot')>(),
  readCachedSupabaseUser: () => ({ id: 'viewer-a' }),
}))
// The library syncs its membership with the account first; here the account adds nothing.
vi.mock('./libraryTwoSaved', async original => {
  const real = await original<typeof import('./libraryTwoSaved')>()
  return { ...real, loadSavedBooks: async () => ({ ids: [], synced: true }), loadShelfMembership: async () => real.readShelfMembership('viewer-a') }
})

const chapters = (n: number) => Array.from({ length: n }, (_, i) => ({ number: i + 1, title: `Chapter ${i + 1}`, paragraphCount: 40 }))
const book = (id: string, title: string, author: string, n = 10) => ({
  id, title, author, art: { src: `/covers/v2/${id}.webp`, srcSet: `/covers/v2/${id}.webp 540w` },
  cover: { background: '#222' }, editions: [{ key: 'modern-en', language: 'en', style: 'modern' }], defaultEditionKey: 'modern-en',
  readingStructure: { chapters: chapters(n) },
})
const CATALOGUE = [
  book('to-the-lighthouse', 'To the Lighthouse', 'Virginia Woolf'),
  book('notes-from-underground', 'Notes from Underground', 'Fyodor Dostoevsky'),
  book('confessions', 'Confessions', 'Augustine'),
  book('bible', 'The Bible', ''),
  book('hamlet', 'Hamlet', 'William Shakespeare'),
  book('the-republic', 'The Republic', 'Plato'),
  book('candide', 'Candide', 'Voltaire'),
  book('frankenstein', 'Frankenstein', 'Mary Shelley'),
]

const place = (bookId: string, updatedAt: number, chapter = 3) => ({
  bookId, headerBook: bookId, chapterNumber: chapter, sequentialChapter: chapter, paragraphIndex: 5, wordIndex: 0, pageIndex: 1,
  primaryEditionKey: 'modern-en', updatedAt, deviceId: 'device-a', rev: 1,
})

const BOI_HEX = 'b0b0b0b0b0b0b0b0b0b0b0b0'
const GONE_HEX = 'c1c1c1c1c1c1c1c1c1c1c1c1'
function ownBook(hex: string, title: string, cover: string | null, place: Record<string, unknown>, hiddenAt?: number): OwnShelfBook {
  const read = (key: string) => key.endsWith(':place:' + hex) ? place : key.endsWith(':table-hidden:' + hex) ? hiddenAt ?? null : null
  return {
    key: 'epub:' + hex, kind: 'epub', hex, title, author: 'David Deutsch', cover, at: 10,
    href: '/reader?userBook=' + hex, reading: ownReading(hex, null, 10, read),
  }
}

beforeEach(() => {
  const positions: LabPositionState = emptyLabPositionState('device-a', VIEWER)
  positions.books = {
    'to-the-lighthouse': place('to-the-lighthouse', 500),
    'notes-from-underground': place('notes-from-underground', 400),
    confessions: place('confessions', 300),
    bible: place('bible', 200),
    // Taken off My shelf (×) after it was last read: not listed anywhere.
    hamlet: place('hamlet', 100),
    // Taken off the desk (× → Saved for later) after it was last read.
    'the-republic': place('the-republic', 90),
    // The desk's older hide stamp, after its last reading.
    candide: place('candide', 80),
    // Finished by its completion record.
    frankenstein: place('frankenstein', 600),
  }
  positions.hidden = { candide: 85 }
  fixture.positions = positions
  localStorage.setItem(`tinct:library-2-saved:${VIEWER}`, JSON.stringify({
    items: { hamlet: { saved: false, at: 150 }, 'the-republic': { saved: true, at: 95, tableHidden: true } },
    pending: {},
  }))
  localStorage.setItem('tinct:book-completed:frankenstein', JSON.stringify({ bookId: 'frankenstein' }))
  fixture.own = [
    // The Beginning of Infinity: an EPUB with a tall cover, 34% read, read between two Tinct books.
    ownBook(BOI_HEX, 'The Beginning of Infinity: Explanations that Transform the World', 'data:image/jpeg;base64,BOICOVER', { chapterNumber: 5, paragraphIndex: 0, wordIndex: 0, updatedAt: 450, percent: 34 }),
    // An own book taken off the reading table since it was last read.
    ownBook(GONE_HEX, 'A Removed Notebook', null, { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 50 }, 60),
  ]
  vi.stubGlobal('fetch', vi.fn(async (url: string) => String(url).startsWith('/lab/catalogue.json')
    ? new Response(JSON.stringify({ books: CATALOGUE }), { status: 200, headers: { 'content-type': 'application/json' } })
    : new Response('', { status: 404 })))
})
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); localStorage.clear() })

const EXPECTED_ORDER = ['to-the-lighthouse', 'userbook-' + BOI_HEX, 'notes-from-underground', 'confessions', 'bible']
const EXPECTED_COVERS: Record<string, string> = {
  // The library's paintings: the same image on the desk, My shelf and in the reader's switcher.
  'to-the-lighthouse': '/lab/library_2/assets/to-the-lighthouse.jpg',
  confessions: '/lab/library_2/assets/confessions.jpg',
  // No painting: the catalogue's art.
  'notes-from-underground': '/covers/v2/notes-from-underground.webp',
  bible: '/covers/v2/bible.webp',
  // The own book's own picture.
  ['userbook-' + BOI_HEX]: 'data:image/jpeg;base64,BOICOVER',
}

describe('one list and one cover for every "Reading now"', () => {
  it('the library’s reading table and the reader’s book switcher list the same books, in the same order, with the same covers', async () => {
    const { loadReadingTable } = await import('./libraryTwoReading')
    const table = await loadReadingTable({ catalogue: Promise.resolve({ books: CATALOGUE as never }) })
    const { switcherRows } = await import('./lab/userBook/ownSwitcher')
    const { rows, error } = await switcherRows(fetch as typeof fetch, localStorage)
    expect(error).toBe('')

    expect(table.reading.map(row => row.bookId)).toEqual(EXPECTED_ORDER)
    expect(rows.map(row => row.bookId)).toEqual(EXPECTED_ORDER)
    for (const row of table.reading) expect(row.cover, row.bookId).toBe(EXPECTED_COVERS[row.bookId])
    for (const row of rows) expect(row.coverSrc, row.bookId).toBe(EXPECTED_COVERS[row.bookId])
    // The own row carries what My shelf's card needs to draw it in the desk's order.
    expect(table.reading[1]).toMatchObject({ own: true, ownKey: 'epub:' + BOI_HEX, kind: 'epub', href: '/reader?userBook=' + BOI_HEX, percent: 34 })
    // Finished stays finished on both.
    expect(table.finished.map(row => row.bookId)).toEqual(['frankenstein'])
  })

  it('reading a removed book again brings it back on both, as the library’s rule says', async () => {
    const positions = fixture.positions as LabPositionState
    positions.books.hamlet = place('hamlet', 700)
    const { loadReadingTable } = await import('./libraryTwoReading')
    const table = await loadReadingTable({ catalogue: Promise.resolve({ books: CATALOGUE as never }) })
    const { switcherRows } = await import('./lab/userBook/ownSwitcher')
    const { rows } = await switcherRows(fetch as typeof fetch, localStorage)
    expect(table.reading[0].bookId).toBe('hamlet')
    expect(rows.map(row => row.bookId)).toEqual(table.reading.map(row => row.bookId))
  })

  it('the reader’s own switcher (LabApp) reads the same membership and own books as the library', () => {
    const app = readFileSync(resolve(__dirname, 'lab/LabApp.tsx'), 'utf8')
    expect(app).toMatch(/membership: readShelfMembership\(viewer\)/)
    expect(app).toMatch(/ownReadingNowWithAccount\(owner/)
    expect(app).toMatch(/currentSwitcherCover\(/)
  })

  it('My shelf’s Currently reading is the reading table’s list, own books in its order', () => {
    const app = readFileSync(resolve(__dirname, '../public/lab/library_2/app.js'), 'utf8')
    const draw = app.slice(app.indexOf('function drawMyBooks'), app.indexOf('function drawMyBooks') + 4000)
    expect(draw).toMatch(/const readingCards=reading\.map\(row=>row\.own\?/)
    expect(draw).toMatch(/appendOwnShelf\(grid,ownShelf\|\|\[\],el,\{covers,currentlyReading:false/)
  })
})

describe('the cover resolver', () => {
  it('paints, then catalogue art, then the own picture, then paper (null)', async () => {
    const { resolveBookCover, bookCoverSrc } = await import('../public/lab/book-cover.js')
    expect(resolveBookCover({ bookId: 'to-the-lighthouse', art: { src: '/covers/v2/to-the-lighthouse.webp', srcSet: 'x 540w' } })).toEqual({
      src: '/lab/library_2/assets/to-the-lighthouse.jpg',
      srcSet: '/lab/library_2/assets/thumbs/to-the-lighthouse.webp 240w, /lab/library_2/assets/to-the-lighthouse.jpg 1024w',
    })
    expect(resolveBookCover({ bookId: 'notes-from-underground', art: { src: '/covers/v2/notes-from-underground.webp', srcSet: 'x 540w' } })).toEqual({ src: '/covers/v2/notes-from-underground.webp', srcSet: 'x 540w' })
    expect(bookCoverSrc({ bookId: 'userbook-ab', ownCover: 'data:image/jpeg;base64,AA' })).toBe('data:image/jpeg;base64,AA')
    expect(bookCoverSrc({ bookId: 'userbook-ab', ownCover: 'javascript:alert(1)' })).toBeNull()
    expect(bookCoverSrc({ bookId: 'pd-pg-135', art: null })).toBeNull()
  })

  it('an own book wears this device\'s picture, else the account\'s stored copy, else paper', async () => {
    const { bookCoverSrc } = await import('../public/lab/book-cover.js')
    const local = 'data:image/jpeg;base64,LOCAL'
    const stored = 'data:image/webp;base64,STORED'
    expect(bookCoverSrc({ bookId: 'userbook-ab', ownCover: local, storedCover: stored })).toBe(local)
    expect(bookCoverSrc({ bookId: 'userbook-ab', ownCover: null, storedCover: stored })).toBe(stored)
    // Only an image data: URL is worn; anything else is the paper cover.
    expect(bookCoverSrc({ bookId: 'userbook-ab', storedCover: '/api/user-books/covers/ab?v=1' })).toBeNull()
    expect(bookCoverSrc({ bookId: 'userbook-ab', ownCover: null, storedCover: null })).toBeNull()
  })

  it('every painting has its small file for the switcher’s rows', async () => {
    const { PAINTED_COVER_IDS } = await import('../public/lab/book-cover.js')
    const { existsSync } = await import('node:fs')
    for (const id of PAINTED_COVER_IDS) {
      expect(existsSync(resolve(__dirname, `../public/lab/library_2/assets/${id}.jpg`)), id).toBe(true)
      expect(existsSync(resolve(__dirname, `../public/lab/library_2/assets/thumbs/${id}.webp`)), id).toBe(true)
    }
  })

  it('no surface keeps a cover rule of its own', () => {
    const lib = (file: string) => readFileSync(resolve(__dirname, '../public/lab/library_2/' + file), 'utf8')
    expect(lib('cover-assets.js')).toMatch(/paintedCover\(id\) \?\? fallback/)
    expect(lib('bookshelf-view.js')).not.toMatch(/studyCovers/)
    expect(lib('bookshelf-view.js')).toMatch(/bookCoverSrc\(\{bookId:entry\.id,art:entry\.art\}\)/)
    expect(lib('bookshelf.js')).toMatch(/cover:bookCoverSrc\(\{bookId:entry\.id,art:entry\.art\}\)/)
    expect(lib('reading-table.js')).toMatch(/ownCoverImage\(b\.cover\) \|\| paperCoverUrl\(/)
    expect(lib('add-to-tinct.js')).toMatch(/export \{paperCover\}/)
    const switcher = readFileSync(resolve(__dirname, 'preReader/quickBookSwitcher.ts'), 'utf8')
    expect(switcher).not.toMatch(/art\?\.src/)
  })
})
