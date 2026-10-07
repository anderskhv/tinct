// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabShareSheet } from './LabShareSheet'

vi.mock('./labAuth', () => ({ readSupabaseAccessToken: async () => null }))

const target = {
  bookId: 'frankenstein', editionKey: 'original-en', editionLabel: 'Original (1831)', chapterNumber: 9,
  paragraphIndex: 2, fromWord: 61, endParagraphIndex: 2, toWord: 75,
}

/** The Worker's preview: `cards` images (each one's last byte is its number), the count on every response. */
function mockFetch(cards = 1) {
  const calls: Array<{ url: string; method: string }> = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, method: init?.method ?? 'GET' })
    if (url.includes('/api/share/preview')) {
      const card = Number(new URL(url, 'https://tinct.app').searchParams.get('card') ?? 1)
      return new Response(new Uint8Array([137, 80, 78, 71, card]), { headers: { 'Content-Type': 'image/png', 'X-Share-Cards': String(cards) } })
    }
    if (url.endsWith('/api/share')) return Response.json({ id: 'abcdefg', url: 'https://tinct.app/q/abcdefg', image: 'https://tinct.app/q/abcdefg/image.png' }, { status: 201 })
    return new Response('not found', { status: 404 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return calls
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

async function settle(ms = 50) {
  await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)) })
}

describe('LabShareSheet', () => {
  it('stores nothing until the reader shares (privacy notice)', async () => {
    const calls = mockFetch()
    const write = vi.fn(async () => {})
    Object.defineProperty(navigator, 'clipboard', { value: { write, writeText: vi.fn(async () => {}) }, configurable: true })
    vi.stubGlobal('ClipboardItem', class { constructor(public items: Record<string, unknown>) {} })
    const createObjectURL = vi.fn(() => 'blob:x')
    Object.assign(URL, { createObjectURL, revokeObjectURL: () => {} })
    render(<LabShareSheet target={target} look="paper" format="desktop" onClose={() => {}} />)
    await settle(1200)
    fireEvent.click(screen.getByTestId('lab-share-context'))
    fireEvent.click(screen.getByTestId('lab-share-tagline'))
    await settle(600)
    fireEvent.click(screen.getByTestId('lab-share-copy-image'))
    fireEvent.click(screen.getByTestId('lab-share-download'))
    await settle(600)
    expect(write).toHaveBeenCalledTimes(1)
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(calls.filter(call => call.method === 'POST')).toEqual([])
    expect(calls.some(call => call.url.includes('/api/share/preview'))).toBe(true)
  })

  it('shows only Copy image and Download on desktop, as icons, with no footnote', async () => {
    mockFetch()
    render(<LabShareSheet target={target} look="night" format="desktop" onClose={() => {}} />)
    await settle()
    const actions = screen.getAllByRole('button').filter(button => button.closest('.lab-share-actions'))
    expect(actions.map(button => button.getAttribute('aria-label'))).toEqual(['Copy image', 'Download image'])
    for (const button of actions) {
      expect(button.textContent).toBe('')
      expect(button.getAttribute('title')).toBe(button.getAttribute('aria-label'))
      expect(button.querySelector('svg')).not.toBeNull()
    }
    expect(screen.queryByTestId('lab-share-native')).toBeNull()
    expect(screen.queryByTestId('lab-share-copy-link')).toBeNull()
    expect(screen.getByTestId('lab-share-status').textContent).toBe('')
    expect(screen.queryByText(/remembered for next time/)).toBeNull()
    expect(screen.getByRole('checkbox', { name: 'Show surrounding text' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Add "Read free at tinct.app"' })).toBeTruthy()
  })

  it('leaves the tinct.app credit off until the reader turns it on, then remembers it', async () => {
    const calls = mockFetch()
    localStorage.clear()
    render(<LabShareSheet target={target} look="book" format="phone" onClose={() => {}} />)
    await settle()
    const tagline = screen.getByRole('checkbox', { name: 'Add "Read free at tinct.app"' }) as HTMLInputElement
    expect(tagline.checked).toBe(false)
    expect((screen.getByRole('checkbox', { name: 'Show surrounding text' }) as HTMLInputElement).checked).toBe(true)
    expect(calls.find(call => call.url.includes('/api/share/preview'))!.url).toMatch(/[?&]tagline=0(&|$)/)
    expect(calls.find(call => call.url.includes('/api/share/preview'))!.url).toMatch(/[?&]look=book(&|$)/)
    // The toggle is the reader's "t" mark, not a text label.
    const chip = tagline.closest('label')!
    expect(chip.textContent).toBe('')
    expect(chip.querySelector('svg')).not.toBeNull()
    expect(chip.getAttribute('title')).toBe('Add "Read free at tinct.app"')
    fireEvent.click(tagline)
    expect(JSON.parse(localStorage.getItem('tinct:share-prefs')!)).toEqual({ context: true, tagline: true })
    cleanup()
    render(<LabShareSheet target={target} look="book" format="phone" onClose={() => {}} />)
    await settle()
    expect((screen.getByRole('checkbox', { name: 'Add "Read free at tinct.app"' }) as HTMLInputElement).checked).toBe(true)
  })

  it('keeps Share on phone, beside Copy image and Download', async () => {
    mockFetch()
    render(<LabShareSheet target={target} look="paper" format="phone" onClose={() => {}} />)
    await settle()
    const actions = screen.getAllByRole('button').filter(button => button.closest('.lab-share-actions'))
    expect(actions.map(button => button.getAttribute('aria-label'))).toEqual(['Share', 'Copy image', 'Download image'])
    expect(actions.every(button => button.textContent === '')).toBe(true)
  })

  it('creates the link when the reader shares, copying it where there is no share sheet', async () => {
    const calls = mockFetch()
    const writeText = vi.fn(async () => {})
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    vi.stubGlobal('ClipboardItem', undefined)
    render(<LabShareSheet target={target} look="paper" format="phone" onClose={() => {}} />)
    await settle(600)
    expect(calls.filter(call => call.method === 'POST')).toEqual([])
    await act(async () => { fireEvent.click(screen.getByTestId('lab-share-native')); await new Promise(resolve => setTimeout(resolve, 50)) })
    expect(calls.filter(call => call.method === 'POST').map(call => call.url)).toEqual([expect.stringMatching(/\/api\/share$/)])
    expect(writeText).toHaveBeenCalledWith('https://tinct.app/q/abcdefg')
  })

  it('opens the share sheet with the new link and the image', async () => {
    const calls = mockFetch()
    const share = vi.fn(async (_data: ShareData) => {})
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true })
    try {
      render(<LabShareSheet target={target} look="paper" format="phone" onClose={() => {}} />)
      await settle(600)
      expect(calls.filter(call => call.method === 'POST')).toEqual([])
      await act(async () => { fireEvent.click(screen.getByTestId('lab-share-native')); await new Promise(resolve => setTimeout(resolve, 50)) })
      expect(calls.filter(call => call.method === 'POST')).toHaveLength(1)
      expect(share).toHaveBeenCalledTimes(1)
      const data = share.mock.calls[0][0]
      expect(data.url).toBe('https://tinct.app/q/abcdefg')
      expect(data.files?.[0]?.type).toBe('image/png')
    } finally {
      delete (navigator as { share?: unknown }).share
      delete (navigator as { canShare?: unknown }).canShare
    }
  })

  it('shows no counter for a single image', async () => {
    mockFetch(1)
    render(<LabShareSheet target={target} look="paper" format="phone" onClose={() => {}} />)
    await settle(300)
    expect(screen.queryByTestId('lab-share-count')).toBeNull()
    expect(screen.queryByTestId('lab-share-cards')).toBeNull()
    expect(screen.getAllByAltText('Preview of the image')).toHaveLength(1)
  })

  describe('a series of cards', () => {
    const bytes = async (blob: Blob) => [...new Uint8Array(await blob.arrayBuffer())]

    it('previews every card in a swipeable row with a small counter', async () => {
      const calls = mockFetch(3)
      render(<LabShareSheet target={target} look="night" format="phone" onClose={() => {}} />)
      await settle(300)
      const previews = calls.filter(call => call.url.includes('/api/share/preview')).map(call => new URL(call.url, 'https://tinct.app').searchParams.get('card'))
      expect(previews.map(card => card ?? '1').sort()).toEqual(['1', '2', '3'])
      const row = screen.getByTestId('lab-share-cards')
      const images = [...row.querySelectorAll('img')]
      expect(images).toHaveLength(3)
      expect(images[1].getAttribute('src')).toMatch(/[?&]card=2$/)
      expect(images[2].getAttribute('src')).toMatch(/[?&]card=3$/)
      expect(screen.getByTestId('lab-share-count').textContent).toBe('1/3')
      // Swiping to the second card moves the counter; no other new text.
      Object.defineProperty(row, 'clientWidth', { value: 300, configurable: true })
      row.scrollLeft = 300
      fireEvent.scroll(row)
      expect(screen.getByTestId('lab-share-count').textContent).toBe('2/3')
      expect(screen.getByTestId('lab-share-status').textContent).toBe('')
    })

    it('copies the card in view', async () => {
      mockFetch(3)
      const write = vi.fn(async (_items: Array<{ items: Record<string, Blob> }>) => {})
      Object.defineProperty(navigator, 'clipboard', { value: { write, writeText: vi.fn(async () => {}) }, configurable: true })
      vi.stubGlobal('ClipboardItem', class { constructor(public items: Record<string, unknown>) {} })
      render(<LabShareSheet target={target} look="paper" format="desktop" onClose={() => {}} />)
      await settle(300)
      const row = screen.getByTestId('lab-share-cards')
      Object.defineProperty(row, 'clientWidth', { value: 500, configurable: true })
      row.scrollLeft = 1000
      fireEvent.scroll(row)
      await act(async () => { fireEvent.click(screen.getByTestId('lab-share-copy-image')) })
      expect(write).toHaveBeenCalledTimes(1)
      expect(await bytes(write.mock.calls[0][0][0].items['image/png'])).toEqual([137, 80, 78, 71, 3])
    })

    it('downloads every card as its own numbered file', async () => {
      mockFetch(3)
      const saved: Array<{ name: string; blob: Blob }> = []
      const urls = new Map<string, Blob>()
      Object.assign(URL, { createObjectURL: (blob: Blob) => { const href = `blob:${urls.size}`; urls.set(href, blob); return href }, revokeObjectURL: () => {} })
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { saved.push({ name: this.download, blob: urls.get(this.getAttribute('href')!)! }) })
      try {
        render(<LabShareSheet target={target} look="paper" format="desktop" onClose={() => {}} />)
        await settle(300)
        fireEvent.click(screen.getByTestId('lab-share-download'))
        expect(saved.map(file => file.name)).toEqual(['tinct-frankenstein-quote-1-of-3.png', 'tinct-frankenstein-quote-2-of-3.png', 'tinct-frankenstein-quote-3-of-3.png'])
        expect(await Promise.all(saved.map(file => bytes(file.blob)))).toEqual([1, 2, 3].map(card => [137, 80, 78, 71, card]))
      } finally {
        click.mockRestore()
      }
    })

    it('shares every card in one share, with the link', async () => {
      const calls = mockFetch(3)
      const share = vi.fn(async (_data: ShareData) => {})
      const canShare = vi.fn((_data: ShareData) => true)
      Object.defineProperty(navigator, 'share', { value: share, configurable: true })
      Object.defineProperty(navigator, 'canShare', { value: canShare, configurable: true })
      try {
        render(<LabShareSheet target={target} look="paper" format="phone" onClose={() => {}} />)
        await settle(300)
        await act(async () => { fireEvent.click(screen.getByTestId('lab-share-native')); await new Promise(resolve => setTimeout(resolve, 50)) })
        expect(calls.filter(call => call.method === 'POST')).toHaveLength(1)
        expect(share).toHaveBeenCalledTimes(1)
        const data = share.mock.calls[0][0]
        expect(data.url).toBe('https://tinct.app/q/abcdefg')
        expect(data.files?.map(file => file.name)).toEqual(['tinct-quote-1-of-3.png', 'tinct-quote-2-of-3.png', 'tinct-quote-3-of-3.png'])
        expect(data.files?.every(file => file.type === 'image/png')).toBe(true)
        // (jsdom cannot read back a File made from a fetched Blob; Download checks each card's bytes.)
        expect(data.files?.every(file => file.size > 0)).toBe(true)
        expect(canShare.mock.calls[0][0].files).toHaveLength(3)
      } finally {
        delete (navigator as { share?: unknown }).share
        delete (navigator as { canShare?: unknown }).canShare
      }
    })
  })
})
