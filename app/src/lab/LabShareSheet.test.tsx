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
    if (url.includes('/api/share/preview')) return new Response(new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }))
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

describe('LabShareSheet', () => {
  it('stores nothing until the reader shares (privacy notice)', async () => {
    const calls = mockFetch()
    render(<LabShareSheet target={target} look="paper" format="desktop" onClose={() => {}} />)
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 1200)) })
    fireEvent.click(screen.getByTestId('lab-share-context'))
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 600)) })
    expect(calls.filter(call => call.method === 'POST')).toEqual([])
    expect(calls.some(call => call.url.includes('/api/share/preview'))).toBe(true)
  })

  it('creates the link when the reader copies it', async () => {
    const calls = mockFetch()
    const writeText = vi.fn(async () => {})
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    vi.stubGlobal('ClipboardItem', undefined)
    render(<LabShareSheet target={target} look="paper" format="phone" onClose={() => {}} />)
    await act(async () => { fireEvent.click(screen.getByTestId('lab-share-copy-link')); await new Promise(resolve => setTimeout(resolve, 50)) })
    expect(calls.filter(call => call.method === 'POST').map(call => call.url)).toEqual([expect.stringMatching(/\/api\/share$/)])
    expect(writeText).toHaveBeenCalledWith('https://tinct.app/q/abcdefg')
  })
})
