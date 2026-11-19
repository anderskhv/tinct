// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BOOKS, getBook } from '../data/bookRegistry'
import { bookFromEntry, registerPublicBook, type PublicEntry } from '../utils/publicBooks'
import {
  fetchModernStatus,
  formatModernPrice,
  modernChapterPending,
  modernPollDelay,
  MODERN_PREMIUM_REQUIRED,
  prioritiseModernChapter,
  startModernCheckout,
  firstUnwritten,
  formatModernWait,
  modernChapterWritten,
  modernReaderDecision,
  modernWaitSeconds,
  runsCover,
  useLabModernEdition,
} from './labModernEdition'
import { LabModernReadyNotice, LabModernWait, MODERN_WAIT_COPY } from './LabModernWait'
import { LabContentsV2 } from './LabContentsV2'
import { LabV2Sheet } from './LabV2Sheet.tsx'
import { DEFAULT_LAB_PREFS } from './labPrefs'

vi.mock('../data/editionLoader', () => ({ loadEdition: vi.fn(async () => ({ chapters: [] })) }))

const entry = (id: string): PublicEntry => ({
  id, title: 'The River House', author: 'Ann Example', wordCount: 1200,
  editions: [{ key: 'original-en', language: 'en', label: 'Original' }, { key: 'modern-en', language: 'en', label: 'Modern English' }],
})

afterEach(() => {
  cleanup()
  for (let i = BOOKS.length - 1; i >= 0; i--) if (BOOKS[i].id.startsWith('pd-')) BOOKS.splice(i, 1)
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('Modern English edition in the reader', () => {
  it('knows a chapter served in its original text from the edition’s own states', () => {
    const data = { chapters: [], modern: { complete: false, chapters: { 1: 'ready', 2: 'preparing', 3: 'queued' } } }
    expect(modernChapterPending(data, 1)).toBe(false)
    expect(modernChapterPending(data, 2)).toBe(true)
    expect(modernChapterPending(data, 3)).toBe(true)
    // A finished edition carries no states: nothing is pending.
    expect(modernChapterPending({ chapters: [] }, 2)).toBe(false)
  })

  it('asks often while a shown chapter waits, slowly while chapters are left, never once done', () => {
    expect(modernPollDelay(null, true, false)).toBe(10_000)
    expect(modernPollDelay(null, false, true)).toBe(5_000)
    expect(modernPollDelay({ state: 'paid', chapters: {}, offer: null }, false, false)).toBe(30_000)
    expect(modernPollDelay({ state: 'complete', chapters: {}, offer: null }, false, false)).toBe(0)
    expect(modernPollDelay({ state: 'none', chapters: {}, offer: { tier: 1, cents: 299 } }, false, false)).toBe(0)
  })

  it('formats the offer price', () => {
    expect(formatModernPrice(299)).toBe('$2.99')
    expect(formatModernPrice(1199)).toBe('$11.99')
  })

  it('talks to the Worker routes and never sends a price', async () => {
    const fetchImpl = vi.fn(async (url: string, _init?: RequestInit) => url.endsWith('/checkout')
      ? Response.json({ url: 'https://checkout.stripe.com/c/pay/cs_1' })
      : Response.json({ state: 'paid', chapters: { 1: 'ready' }, offer: null }))
    expect(await fetchModernStatus('pd-pg-1', fetchImpl)).toEqual({ state: 'paid', chapters: { 1: 'ready' }, offer: null })
    expect(await prioritiseModernChapter('pd-pg-1', 4, fetchImpl)).toMatchObject({ state: 'paid' })
    expect(await startModernCheckout('pd-pg-1', 4, 'tok', fetchImpl)).toBe('https://checkout.stripe.com/c/pay/cs_1')
    expect(fetchImpl.mock.calls.map(call => call[0])).toEqual([
      '/api/public-books/pd-pg-1/modern-en', '/api/public-books/pd-pg-1/modern-en/priority', '/api/public-books/pd-pg-1/modern-en/checkout',
    ])
    expect(JSON.parse(String(fetchImpl.mock.calls[2][1]?.body))).toEqual({ chapter: 4 })
  })

  // Premium only, the trial included (2026-10-08): signed in, the status is asked with the
  // reader's token so a free account past its trial gets no offer; its checkout is a 402.
  it('sends a signed-in reader’s token with the status and the priority, and none when signed out', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) => Response.json({ state: 'none', chapters: {}, offer: null }))
    await fetchModernStatus('pd-pg-1', fetchImpl, 'tok')
    await prioritiseModernChapter('pd-pg-1', 4, fetchImpl, 'tok')
    await fetchModernStatus('pd-pg-1', fetchImpl)
    const auth = fetchImpl.mock.calls.map(call => new Headers(call[1]?.headers).get('Authorization'))
    expect(auth).toEqual(['Bearer tok', 'Bearer tok', null])
  })

  it('tells a Premium refusal (402) from any other failed checkout', async () => {
    const refused = vi.fn(async () => Response.json({ error: 'premium_required' }, { status: 402 }))
    await expect(startModernCheckout('pd-pg-1', 4, 'tok', refused)).rejects.toThrow(MODERN_PREMIUM_REQUIRED)
    const failed = vi.fn(async () => Response.json({ error: 'in_progress' }, { status: 409 }))
    await expect(startModernCheckout('pd-pg-1', 4, 'tok', failed)).rejects.toThrow('checkout')
  })

  it('shows a bought edition on every device, with or without the internal flag', () => {
    registerPublicBook(bookFromEntry(entry('pd-pg-90')))
    expect(getBook('pd-pg-90')?.editions.map(e => e.key)).toEqual(['original-en', 'modern-en'])
    localStorage.setItem('tinct:internal', '1')
    registerPublicBook(bookFromEntry(entry('pd-pg-91')))
    expect(getBook('pd-pg-91')?.editions.map(e => e.key)).toEqual(['original-en', 'modern-en'])
  })

  it('Contents shows each chapter’s state while the edition is being written', () => {
    const chapters = [1, 2, 3].map(number => ({ number, title: `Chapter ${number}` }))
    render(<LabContentsV2 open bookId="pd-pg-1" title="T" editionKey="modern-en" editionLabel="Tinct Modern English" chapters={chapters} chaptersReady
      currentChapter={1} currentPage={1} totalPages={2} statuses={new Map()} conversations={[]} highlights={[]} unassignedHighlights={[]} historyStatus="ready"
      modernStates={{ 1: 'ready', 2: 'preparing', 3: 'queued' }}
      onClose={vi.fn()} onSelectChapter={vi.fn()} onWarmChapter={vi.fn()} onOpenPassage={vi.fn()} onContinueConversation={vi.fn()} />)
    expect(screen.getByTestId('lab-tree-modern-1').textContent).toBe('Ready')
    expect(screen.getByTestId('lab-tree-modern-2').textContent).toBe('Preparing')
    expect(screen.getByTestId('lab-tree-modern-3').textContent).toBe('Queued')
  })

  it('offers the edition under the main-version choices', () => {
    const onBuy = vi.fn()
    const editions = [{ key: 'original-en', language: 'en' as const, style: 'original' as const, label: 'Original', aligned: false }]
    render(<LabV2Sheet bookId="pd-pg-1" layer="mainEdition" onLayer={vi.fn()} onClose={vi.fn()} prefs={{ ...DEFAULT_LAB_PREFS, primaryEdition: 'original-en' }}
      onPrefs={vi.fn()} editions={editions} modernOffer={{ price: '$4.99', onBuy }} />)
    const offer = screen.getByTestId('lab-v2-modern-offer')
    expect(offer.textContent).toContain('Tinct Modern English')
    expect(offer.textContent).toContain('$4.99')
    fireEvent.click(offer)
    expect(onBuy).toHaveBeenCalledTimes(1)
  })
})

describe('Modern English being written: what the reader shows', () => {
  const paid = (chapters: Record<string, 'ready' | 'preparing' | 'queued'>, ranges: Record<string, Array<[number, number]>> = {}, extra: { wordsPerMinute?: number | null; startsIn?: number | null; eta?: number | null } = {}) => ({
    state: 'paid' as const, chapters, offer: null,
    progress: {
      wordsPerMinute: extra.wordsPerMinute ?? null,
      chapters: Object.fromEntries(Object.keys(chapters).map(key => [key, { done: (ranges[key] ?? []).reduce((s, [a, b]) => s + b - a, 0), total: 100, ranges: ranges[key] ?? [], startsIn: extra.startsIn ?? null, eta: extra.eta ?? null }])),
    },
  })
  const decide = (over: Partial<Parameters<typeof modernReaderDecision>[0]>) => modernReaderDecision({
    reading: true, pending: true, written: [], visible: { first: 10, last: 12 }, status: null, chapterNumber: 2, paragraphCount: 100, purchasePending: false, ...over,
  })

  it('reads the written runs the edition carries for a chapter being written', () => {
    const data = { chapters: [], modern: { complete: false, chapters: { 2: 'preparing' }, written: { 2: [[0, 12], [40, 44]], 3: 'nonsense' } } }
    expect(modernChapterWritten(data, 2)).toEqual([[0, 12], [40, 44]])
    expect(modernChapterWritten(data, 3)).toEqual([])
    expect(modernChapterWritten({ chapters: [] }, 2)).toEqual([])
  })

  it('knows which paragraphs are written', () => {
    expect(runsCover([[0, 12]], 10, 11)).toBe(true)
    expect(runsCover([[0, 12]], 10, 12)).toBe(false)
    expect(runsCover([[0, 5], [5, 12]], 3, 11)).toBe(true)
    expect(runsCover([], 3, 2)).toBe(true)
    expect(firstUnwritten([[0, 12]], 10, 14)).toBe(12)
    expect(firstUnwritten([[0, 20]], 10, 14)).toBeNull()
  })

  it('covers a page holding any paragraph not yet in Modern English, never showing the original as modern', () => {
    expect(decide({ written: [[0, 11]], status: paid({ 2: 'preparing' }) }).cover).toBe('writing')
    expect(decide({ written: [[0, 13]], status: paid({ 2: 'preparing' }) }).cover).toBeNull()
    // Before the status has arrived: covered too.
    expect(decide({ written: [] }).cover).toBe('writing')
    // A chapter that could not be written (no state while the edition is being written).
    expect(decide({ status: paid({ 1: 'ready' }) }).cover).toBe('unavailable')
    // The original edition, or a chapter wholly written: nothing to cover.
    expect(decide({ reading: false }).cover).toBeNull()
    expect(decide({ pending: false }).cover).toBeNull()
  })

  it('covers the page while a purchase is confirmed, before the edition is switched', () => {
    expect(decide({ reading: false, purchasePending: true }).cover).toBe('purchase')
    expect(decide({ reading: true, purchasePending: true, written: [[0, 20]] }).cover).toBeNull()
  })

  it('reloads the chapter when the paragraphs the reader needs are written, and only then', () => {
    // Covered at 10–12; the Worker has written them since.
    expect(decide({ written: [], status: paid({ 2: 'preparing' }, { 2: [[0, 13]] }) })).toEqual({ cover: 'writing', reload: true })
    expect(decide({ written: [], status: paid({ 2: 'preparing' }, { 2: [[0, 11]] }) })).toEqual({ cover: 'writing', reload: false })
    // Reading Modern English near the end of what was loaded: the next paragraphs are fetched before the page turns.
    expect(decide({ written: [[0, 13]], status: paid({ 2: 'preparing' }, { 2: [[0, 30]] }) })).toEqual({ cover: null, reload: true })
    expect(decide({ written: [[0, 30]], status: paid({ 2: 'preparing' }, { 2: [[0, 30]] }) })).toEqual({ cover: null, reload: false })
    // The chapter is finished: swapped in.
    expect(decide({ written: [[0, 13]], status: paid({ 2: 'ready' }) }).reload).toBe(true)
  })

  it('estimates the wait from the pace, and says so in words', () => {
    expect(modernWaitSeconds(undefined, 2)).toBeNull()
    expect(modernWaitSeconds(paid({ 2: 'preparing' }, {}, { wordsPerMinute: null, startsIn: 0 }).progress, 2)).toBeNull()
    // 1,250 words at 1,500 a minute: 50 s.
    expect(modernWaitSeconds(paid({ 2: 'preparing' }, {}, { wordsPerMinute: 1500, startsIn: 0, eta: 600 }).progress, 2)).toBe(50)
    expect(modernWaitSeconds(paid({ 2: 'preparing' }, {}, { wordsPerMinute: 1500, startsIn: 240, eta: 900 }).progress, 2)).toBe(290)
    // Never later than the whole chapter.
    expect(modernWaitSeconds(paid({ 2: 'preparing' }, {}, { wordsPerMinute: 1500, startsIn: 0, eta: 20 }).progress, 2)).toBe(20)
    expect(formatModernWait(null)).toBeNull()
    expect(formatModernWait(20)).toBe('Under a minute')
    expect(formatModernWait(80)).toBe('About a minute')
    expect(formatModernWait(290)).toBe('About 5 minutes')
  })

  it('reads progress from the status, dropping anything malformed', async () => {
    const fetchImpl = vi.fn(async () => Response.json({
      state: 'paid', chapters: { 1: 'preparing' }, offer: null,
      progress: { wordsPerMinute: 1800, chapters: { 1: { done: 12, total: 126, ranges: [[0, 12], [5, 'x']], startsIn: 0, eta: 400 }, 2: null } },
    }))
    expect(await fetchModernStatus('pd-pg-1', fetchImpl)).toEqual({
      state: 'paid', chapters: { 1: 'preparing' }, offer: null,
      progress: { wordsPerMinute: 1800, chapters: { 1: { done: 12, total: 126, ranges: [[0, 12]], startsIn: 0, eta: 400 } } },
    })
  })

  it('asks for the reader’s waiting paragraph to be written first', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) => Response.json({ state: 'paid', chapters: {}, offer: null }))
    await prioritiseModernChapter('pd-pg-1', 2, fetchImpl, null, 400)
    await prioritiseModernChapter('pd-pg-1', 2, fetchImpl, null)
    expect(fetchImpl.mock.calls.map(call => JSON.parse(String(call[1]?.body)))).toEqual([{ chapter: 2, paragraph: 400 }, { chapter: 2 }])
  })

  it('asks often while the reader waits at a covered page', () => {
    expect(modernPollDelay(null, true, false, true)).toBe(5_000)
  })

  it('the waiting screen shows the book, the progress and the estimate, and offers the original only when told to', () => {
    const onReadOriginal = vi.fn()
    const { rerender } = render(<LabModernWait wait={{ kind: 'writing', offerOriginal: false, done: 12, total: 1119, estimate: 'About 3 minutes' }} bookTitle="Gorgias" chapterTitle="Gorgias" onReadOriginal={onReadOriginal} />)
    expect(screen.getByRole('heading').textContent).toBe('Gorgias')
    expect(screen.getByTestId('lab-modern-wait-line').textContent).toBe('Writing this page. About 3 minutes.')
    expect(screen.getByTestId('lab-modern-wait-progress').textContent).toBe('12 of 1,119 paragraphs in this chapter written')
    expect(screen.queryByTestId('lab-modern-read-original')).toBeNull()
    rerender(<LabModernWait wait={{ kind: 'writing', offerOriginal: true, done: 12, total: 1119, estimate: null }} bookTitle="Gorgias" chapterTitle="Gorgias" onReadOriginal={onReadOriginal} />)
    expect(screen.getByTestId('lab-modern-wait-line').textContent).toBe('Writing this page.')
    fireEvent.click(screen.getByTestId('lab-modern-read-original'))
    expect(onReadOriginal).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('lab-modern-read-original').textContent).toBe(MODERN_WAIT_COPY.readOriginal)
    rerender(<LabModernWait wait={{ kind: 'purchase', offerOriginal: false, done: 0, total: null, estimate: null }} bookTitle="Gorgias" chapterTitle="Introduction" onReadOriginal={onReadOriginal} />)
    expect(screen.getByTestId('lab-modern-wait-line').textContent).toBe('Confirming your purchase.')
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('the ready notice switches with one tap, or is dismissed', () => {
    const onSwitch = vi.fn()
    const onDismiss = vi.fn()
    render(<LabModernReadyNotice onSwitch={onSwitch} onDismiss={onDismiss} />)
    expect(screen.getByTestId('lab-modern-ready').textContent).toContain('Modern English is ready')
    fireEvent.click(screen.getByTestId('lab-modern-ready-switch'))
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onSwitch).toHaveBeenCalledTimes(1)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('reading the original meanwhile: named as the original until Modern English is written where the reader is', async () => {
    let ranges: Array<[number, number]> = [[0, 5]]
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      state: 'paid', chapters: { 1: 'preparing' }, offer: null,
      progress: { wordsPerMinute: null, chapters: { 1: { done: 5, total: 40, ranges, startsIn: 0, eta: null } } },
    })))
    const props = { enabled: true, bookId: 'pd-pg-7', editionKey: 'original-en', chapterNumber: 1, pending: false, onPurchased: vi.fn(), visible: { first: 20, last: 22 }, paragraphCount: 40 }
    const { result, rerender } = renderHook(p => useLabModernEdition(p), { initialProps: props })
    expect(result.current.originalNote).toBeNull()
    act(() => result.current.readOriginal())
    await waitFor(() => expect(result.current.originalNote).toBe('original'))
    ranges = [[0, 30]]
    // The reader turns a page in the original: their place is asked for, and the answer says it is written.
    rerender({ ...props, visible: { first: 23, last: 25 } })
    await waitFor(() => expect(result.current.originalNote).toBe('ready'))
    const bodies = (fetch as unknown as { mock: { calls: Array<[string, RequestInit?]> } }).mock.calls.filter(c => c[0].endsWith('/priority')).map(c => JSON.parse(String(c[1]?.body)))
    expect(bodies[0]).toEqual({ chapter: 1, paragraph: 20 })
  })
})
