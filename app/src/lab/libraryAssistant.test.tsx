// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: { user: { id: 'user-a' }, session: { access_token: 'token-a' }, isLoading: false } as Record<string, unknown>,
  start: vi.fn(async () => ({})),
  stop: vi.fn(),
  unlockAudio: vi.fn(),
  setMicMuted: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({ useAuth: () => mocks.auth }))
vi.mock('../hooks/useVoiceSession', () => ({
  useVoiceSession: () => ({
    state: 'listening', activity: 'listening', connection: 'connected', micMuted: false,
    isActive: false, error: null, start: mocks.start, stop: mocks.stop,
    unlockAudio: mocks.unlockAudio, setMicMuted: mocks.setMicMuted,
    getAssistantLevel: () => null,
  }),
}))


import { LibraryAssistant } from '../labLibraryAssistant'

const catalogue = {
  books: [
    { id: 'republic', title: 'The Republic', author: 'Plato', summary: 'Justice and the ideal city.', art: { src: '/covers/v2/the-republic.webp' }, availability: { chapterText: true } },
  ],
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()})))

  mocks.auth = { user: { id: 'user-a' }, session: { access_token: 'token-a' }, isLoading: false }
  mocks.start.mockClear(); mocks.stop.mockClear(); mocks.unlockAudio.mockClear(); mocks.setMicMuted.mockClear()
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(catalogue), { status: 200, headers: { 'Content-Type': 'application/json' } })))
})

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('library assistant lifecycle', () => {
  it('starts the microphone only from Talk and cleans it up on End', async () => {
    render(<LibraryAssistant />)
    expect(mocks.start).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
    await waitFor(() => expect(mocks.start).toHaveBeenCalledWith({ authToken: 'token-a' }))
    expect(mocks.unlockAudio).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Tell me what you feel like reading.')).toBeTruthy()
    expect(screen.queryByText('Ask about this page.')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'End conversation' }))
    expect(mocks.stop).toHaveBeenCalled()
  })

  it('preserves the search draft across close and reopen', async () => {
    render(<LibraryAssistant />)
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const field = await screen.findByRole('searchbox')
    fireEvent.change(field, { target: { value: 'justice' } })
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('justice')
  })

  it('aborts a pending librarian response and clears its isolated thread when the account signs out', async () => {
    let chatSignal: AbortSignal | null = null
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockImplementationOnce(async () => new Response(JSON.stringify(catalogue), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    fetchMock.mockImplementationOnce((_url, init) => {
      chatSignal = init?.signal as AbortSignal
      return new Promise((_resolve, reject) => chatSignal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))
    })
    const view = render(<LibraryAssistant />)
    fireEvent.click(screen.getByRole('button', { name: 'Chat' }))
    const field = await screen.findByRole('textbox', { name: 'Message the librarian' })
    fireEvent.change(field, { target: { value: 'Something about justice' } })
    fireEvent.submit(field.closest('form')!)
    await waitFor(() => expect(chatSignal).not.toBeNull())
    mocks.auth = { user: null, session: null, isLoading: false }
    view.rerender(<LibraryAssistant />)
    await waitFor(() => expect(chatSignal?.aborted).toBe(true))
    expect(screen.queryByText('Something about justice')).toBeNull()
  })
})

it('phone conversation owns scrolling and Escape ends voice and restores the library', async () => {
  render(<LibraryAssistant />)
  fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
  await waitFor(() => expect(mocks.start).toHaveBeenCalled())
  expect(document.body.style.overflow).toBe('hidden')
  expect(document.querySelector('.library-glass-dock')?.classList.contains('is-conversation-open')).toBe(true)
  fireEvent.keyDown(document,{key:'Escape'})
  expect(mocks.stop).toHaveBeenCalled()
  expect(screen.queryByRole('dialog',{name:'Talk with the librarian'})).toBeNull()
  expect(document.body.style.overflow).toBe('')
})

it('introduces the same shared pill once per visit, with exactly three laps', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  const animate = vi.fn(() => ({ cancel: vi.fn() }))
  const original = SVGElement.prototype.animate
  SVGElement.prototype.animate = animate as any
  try {
    const host = document.createElement('section')
    host.dataset.viewPanel = 'library'; host.className = 'is-current'; document.body.append(host)
    const view = render(<LibraryAssistant />, { container: host })
    expect(animate).toHaveBeenCalledTimes(1)
    expect(animate.mock.calls[0][1]).toEqual({ duration: 3200, iterations: 3 })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    view.rerender(<LibraryAssistant />)
    expect(animate).toHaveBeenCalledTimes(1)
    host.classList.remove('is-current')
    await waitFor(() => expect(animate.mock.results[0].value.cancel).toHaveBeenCalled())
    host.classList.add('is-current')
    await waitFor(() => expect(animate).toHaveBeenCalledTimes(2))
    view.unmount(); host.remove()
  } finally { SVGElement.prototype.animate = original }
})
