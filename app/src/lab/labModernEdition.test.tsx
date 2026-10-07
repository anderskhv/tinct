// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BOOKS, getBook } from '../data/bookRegistry'
import { bookFromEntry, registerPublicBook, type PublicEntry } from '../utils/publicBooks'
import {
  fetchModernStatus,
  formatModernPrice,
  modernChapterPending,
  modernPollDelay,
  prioritiseModernChapter,
  startModernCheckout,
} from './labModernEdition'
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

  it('shows a bought edition only on devices with the internal flag', () => {
    registerPublicBook(bookFromEntry(entry('pd-pg-90')))
    expect(getBook('pd-pg-90')?.editions.map(e => e.key)).toEqual(['original-en'])
    localStorage.setItem('tinct:internal', '1')
    registerPublicBook(bookFromEntry(entry('pd-pg-90')))
    expect(getBook('pd-pg-90')?.editions.map(e => e.key)).toEqual(['original-en', 'modern-en'])
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
