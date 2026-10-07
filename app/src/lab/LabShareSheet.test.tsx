// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabShareSheet } from './LabShareSheet'

vi.mock('./labAuth', () => ({ readSupabaseAccessToken: async () => null }))

const target = {
  bookId: 'frankenstein', editionKey: 'original-en', editionLabel: 'Original (1831)', chapterNumber: 9,
  paragraphIndex: 2, fromWord: 61, endParagraphIndex: 2, toWord: 75,
}

function mockFetch() {
  const calls: Array<{ url: string; method: string }> = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, method: init?.method ?? 'GET' })
    if (url.includes('/api/share/preview')) return new Response(new Uint8Array([137, 80, 78, 71]), { headers: { 'Content-Type': 'image/png' } })
    if (url.endsWith('/api/share')) return Response.json({ id: 'abcdefg', url: 'https://tinct.app/q/abcdefg', image: 'https://tinct.app/q/abcdefg/image.png' }, { status: 201 })
    return new Response('not found', { status: 404 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return calls
}

afterEach(() => {
  cleanup()
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
})
