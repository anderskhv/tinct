// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { continueChoice, continueLatestDestination, fetchAccountLabPosition, newestOwnBook, readerNamesNoBook, registeredReadAt, CONTINUE_ACCOUNT_WAIT_MS, type AccountOwnPlaces } from './continueLatest'
import { ownBookOpenUrl, userBookReaderUrl } from './userBook/userBookId'
import { isLabPhoneSurface, labPhoneSurfaceInput } from './labChrome'
import type { OwnShelfBook } from './userBook/ownShelf'
import { emptyLabPositionState, type LabPositionState } from './labPosition'
import { READER_BOOT_POSITION_PREFETCH } from './readerBoot'

const PDF = 'a'.repeat(24)
const EPUB = 'b'.repeat(24)
const OTHER = 'c'.repeat(24)

function ownBook(hex: string, kind: 'pdf' | 'epub', lastActiveAt: number): OwnShelfBook {
  return {
    key: `${kind}:${hex}`, kind, hex, title: kind === 'pdf' ? 'A Paper' : 'To the Lighthouse', author: '', cover: null, at: 1,
    href: kind === 'pdf' ? ownBookOpenUrl(hex) : userBookReaderUrl(hex),
    reading: { bookId: `userbook-${hex}`, chapterNumber: 1, chapterLabel: 'p. 3 of 8', headline: '', percent: null, wordCount: null, lastActiveAt },
  }
}

const base = {
  pathname: '/reader',
  search: '',
  phone: false,
  owner: 'user-1',
  online: true,
  session: { getItem: () => null },
  savedAt: () => null,
}

afterEach(() => { vi.useRealTimers(); localStorage.clear() })

describe('Continue opens the latest thing read (desktop /reader with no book)', () => {
  it('opens the own PDF when it was read after the registered book', async () => {
    const href = await continueLatestDestination({ ...base, registeredAt: () => 1_000, readLocal: async () => [ownBook(PDF, 'pdf', 2_000)], readAccount: async () => null })
    expect(href).toBe(ownBookOpenUrl(PDF))
  })

  it('keeps the registered book when it was read later', async () => {
    const href = await continueLatestDestination({ ...base, registeredAt: () => 3_000, readLocal: async () => [ownBook(PDF, 'pdf', 2_000)], readAccount: async () => null })
    expect(href).toBeNull()
  })

  it('takes a place read on another device from the account (a PDF goes to the margin viewer)', async () => {
    const account: AccountOwnPlaces = { text: {}, pages: { [OTHER]: { updatedAt: 5_000 } } }
    const href = await continueLatestDestination({ ...base, registeredAt: () => 3_000, readLocal: async () => [ownBook(PDF, 'pdf', 2_000)], readAccount: async () => account })
    expect(href).toBe(ownBookOpenUrl(OTHER))
  })

  it('offline: this device’s places decide and the account is never asked', async () => {
    const readAccount = vi.fn(async () => ({ text: {}, pages: { [OTHER]: { updatedAt: 9_000 } } }))
    const href = await continueLatestDestination({ ...base, online: false, registeredAt: () => 1_000, readLocal: async () => [ownBook(EPUB, 'epub', 2_000)], readAccount })
    expect(readAccount).not.toHaveBeenCalled()
    expect(href).toBe(userBookReaderUrl(EPUB))
  })

  it('a slow account is given up after the timeout and the registered book opens', async () => {
    vi.useFakeTimers()
    const never = new Promise<AccountOwnPlaces | null>(() => {})
    const pending = continueLatestDestination({ ...base, registeredAt: () => 3_000, readLocal: async () => [], readAccount: () => never })
    await vi.advanceTimersByTimeAsync(CONTINUE_ACCOUNT_WAIT_MS)
    await expect(pending).resolves.toBeNull()
    expect(CONTINUE_ACCOUNT_WAIT_MS).toBeLessThanOrEqual(1500)
  })

  it('a failed account read falls back to this device', async () => {
    const href = await continueLatestDestination({ ...base, registeredAt: () => 1_000, readLocal: async () => [ownBook(PDF, 'pdf', 2_000)], readAccount: async () => { throw new Error('down') } })
    expect(href).toBe(ownBookOpenUrl(PDF))
  })

  it('signed out: nothing is read and the reader opens as today', async () => {
    const readLocal = vi.fn(async () => [ownBook(PDF, 'pdf', 9_000)])
    expect(await continueLatestDestination({ ...base, owner: null, registeredAt: () => 0, readLocal, readAccount: async () => null })).toBeNull()
    expect(readLocal).not.toHaveBeenCalled()
  })

  it('a reader URL that names a book, or a waiting hand-off, is left alone', async () => {
    const readLocal = vi.fn(async () => [ownBook(PDF, 'pdf', 9_000)])
    expect(await continueLatestDestination({ ...base, search: '?book=emma', registeredAt: () => 0, readLocal })).toBeNull()
    expect(await continueLatestDestination({ ...base, session: { getItem: () => '{"kind":"open-reader"}' }, registeredAt: () => 0, readLocal })).toBeNull()
    expect(readLocal).not.toHaveBeenCalled()
    expect(readerNamesNoBook('/reader', '?layout=desktop', null)).toBe(true)
    expect(readerNamesNoBook('/reader', '?userBook=' + PDF, null)).toBe(false)
    expect(readerNamesNoBook('/library', '', null)).toBe(false)
  })

  it('a book taken off Currently reading on this device does not lead from its account place', () => {
    const account: AccountOwnPlaces = { text: { [EPUB]: { updatedAt: 5_000 } }, pages: {} }
    expect(newestOwnBook([], account, hex => hex === EPUB ? 6_000 : null)).toBeNull()
    expect(newestOwnBook([], account, () => null)?.hex).toBe(EPUB)
  })

  it('the registered time is the settle time or the resumed place’s, whichever is later', () => {
    const state = emptyLabPositionState('d')
    expect(registeredReadAt(state)).toBe(0)
    state.books.emma = { bookId: 'emma', headerBook: 'Emma', chapterNumber: 2, sequentialChapter: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: 4_000, deviceId: 'd', rev: 1 }
    state.lastSettledBookId = 'emma'
    state.lastSettledAt = 3_000
    expect(registeredReadAt(state)).toBe(4_000)
    expect(continueChoice(4_000, { hex: PDF, kind: 'pdf', at: 4_000, href: 'x' })).toBeNull()
    expect(continueChoice(4_000, { hex: PDF, kind: 'pdf', at: 4_001, href: 'x' })?.hex).toBe(PDF)
  })
})

/** A position record that resumes `bookId`, read at `at` (on the phone, for the account's). */
function settledIn(bookId: string, at: number, deviceId = 'phone'): LabPositionState {
  const state = emptyLabPositionState(deviceId, 'user-1')
  state.books[bookId] = { bookId, headerBook: bookId, chapterNumber: 3, sequentialChapter: 3, paragraphIndex: 7, wordIndex: 4, updatedAt: at, deviceId, rev: 2 }
  state.lastSettledBookId = bookId
  state.lastSettledAt = at
  state.updatedAt = at
  return state
}

describe('the account’s registered-book position counts (read on another device)', () => {
  it('the Bible read on the phone is newer than the own PDF, which is newer than this device’s registered book: the reader opens', async () => {
    const readAccountPosition = vi.fn(async () => settledIn('john', 3_000))
    const href = await continueLatestDestination({ ...base, registeredAt: () => 1_000, readLocal: async () => [ownBook(PDF, 'pdf', 2_000)], readAccount: async () => null, readAccountPosition })
    expect(readAccountPosition).toHaveBeenCalledTimes(1)
    expect(href).toBeNull()
  })

  it('an own book read after the phone’s Bible still opens', async () => {
    const href = await continueLatestDestination({ ...base, registeredAt: () => 1_000, readLocal: async () => [ownBook(PDF, 'pdf', 4_000)], readAccount: async () => null, readAccountPosition: async () => settledIn('john', 3_000) })
    expect(href).toBe(ownBookOpenUrl(PDF))
  })

  it('both account reads start together, before either answers', async () => {
    const started: string[] = []
    let release: () => void = () => {}
    const gate = new Promise<void>(resolve => { release = resolve })
    const pending = continueLatestDestination({
      ...base,
      registeredAt: () => 1_000,
      readLocal: async () => [ownBook(PDF, 'pdf', 2_000)],
      readAccount: async () => { started.push('places'); await gate; return null },
      readAccountPosition: async () => { started.push('position'); await gate; return settledIn('john', 3_000) },
    })
    await Promise.resolve()
    expect(started.sort()).toEqual(['places', 'position'])
    release()
    expect(await pending).toBeNull()
  })

  it('the account position timing out falls back to this device, under the one deadline', async () => {
    vi.useFakeTimers()
    let aborted = false
    const readAccountPosition = (signal?: AbortSignal) => new Promise<LabPositionState | null>(() => { signal?.addEventListener('abort', () => { aborted = true }) })
    const pending = continueLatestDestination({ ...base, registeredAt: () => 1_000, readLocal: async () => [ownBook(PDF, 'pdf', 2_000)], readAccount: async () => null, readAccountPosition })
    await vi.advanceTimersByTimeAsync(CONTINUE_ACCOUNT_WAIT_MS)
    await expect(pending).resolves.toBe(ownBookOpenUrl(PDF))
    expect(aborted).toBe(true)
  })

  it('signed out: the account position is never asked', async () => {
    const readAccountPosition = vi.fn(async () => settledIn('john', 9_000))
    expect(await continueLatestDestination({ ...base, owner: null, registeredAt: () => 0, readLocal: async () => [ownBook(PDF, 'pdf', 2_000)], readAccountPosition })).toBeNull()
    expect(readAccountPosition).not.toHaveBeenCalled()
  })

  it('offline: the account position is never asked', async () => {
    const readAccountPosition = vi.fn(async () => settledIn('john', 9_000))
    const href = await continueLatestDestination({ ...base, online: false, registeredAt: () => 1_000, readLocal: async () => [ownBook(PDF, 'pdf', 2_000)], readAccountPosition })
    expect(readAccountPosition).not.toHaveBeenCalled()
    expect(href).toBe(ownBookOpenUrl(PDF))
  })

  it('the default read is one plain GET of /api/lab-position, and it writes nothing', async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify(settledIn('john', 3_000)), { status: 200 }))
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const state = await fetchAccountLabPosition('tok', undefined, fetchImpl as unknown as typeof fetch)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0]
    expect(String(url)).toMatch(/\/api\/lab-position$/)
    expect(init?.method).toBe('GET')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok')
    expect(registeredReadAt(state)).toBe(3_000)
    expect(setItem).not.toHaveBeenCalled()
    setItem.mockRestore()
    expect(await fetchAccountLabPosition(null, undefined, fetchImpl as unknown as typeof fetch)).toBeNull()
    expect(await fetchAccountLabPosition('tok', undefined, (async () => new Response('', { status: 500 })) as unknown as typeof fetch)).toBeNull()
  })

  it('reads the head script’s early GET without taking it from the reader', async () => {
    const slot = window as unknown as Record<string, unknown>
    slot[READER_BOOT_POSITION_PREFETCH] = { token: 'tok', at: Date.now(), body: Promise.resolve(settledIn('john', 3_000)) }
    const fetchImpl = vi.fn()
    const state = await fetchAccountLabPosition('tok', undefined, fetchImpl as unknown as typeof fetch)
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(registeredReadAt(state)).toBe(3_000)
    expect(slot[READER_BOOT_POSITION_PREFETCH]).toBeTruthy()
    delete slot[READER_BOOT_POSITION_PREFETCH]
  })
})

describe('phones keep today’s /reader exactly', () => {
  it('decides nothing and reads nothing on a phone', async () => {
    const readLocal = vi.fn(async () => [ownBook(PDF, 'pdf', 9_000)])
    const readAccount = vi.fn(async () => ({ text: {}, pages: { [PDF]: { updatedAt: 9_000 } } }))
    const registeredAt = vi.fn(() => 0)
    const session = { getItem: vi.fn(() => null) }
    const readAccountPosition = vi.fn(async () => settledIn('john', 9_000))
    expect(await continueLatestDestination({ ...base, phone: true, session, registeredAt, readLocal, readAccount, readAccountPosition })).toBeNull()
    expect(readLocal).not.toHaveBeenCalled()
    expect(readAccount).not.toHaveBeenCalled()
    expect(readAccountPosition).not.toHaveBeenCalled()
    expect(registeredAt).not.toHaveBeenCalled()
    expect(session.getItem).not.toHaveBeenCalled()
  })

  it('uses the reader’s own phone test: an iPhone, a narrow window and ?layout=phone are phones', async () => {
    const readLocal = vi.fn(async () => [ownBook(PDF, 'pdf', 9_000)])
    const ua = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
    expect(isLabPhoneSurface(labPhoneSurfaceInput(null))).toBe(true)
    expect(await continueLatestDestination({ ...base, phone: undefined, registeredAt: () => 0, readLocal })).toBeNull()
    ua.mockRestore()
    expect(await continueLatestDestination({ ...base, phone: undefined, search: '?layout=phone', registeredAt: () => 0, readLocal })).toBeNull()
    const width = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    expect(await continueLatestDestination({ ...base, phone: undefined, registeredAt: () => 0, readLocal })).toBeNull()
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    expect(readLocal).not.toHaveBeenCalled()
  })

  it('a desktop window passes the same test and is decided', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
    const readLocal = vi.fn(async () => [ownBook(PDF, 'pdf', 9_000)])
    expect(isLabPhoneSurface(labPhoneSurfaceInput('desktop'))).toBe(false)
    expect(await continueLatestDestination({ ...base, phone: undefined, search: '?layout=desktop', registeredAt: () => 0, readLocal, readAccount: async () => null })).toBe(ownBookOpenUrl(PDF))
  })
})
