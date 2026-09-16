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
vi.mock('../LabVoiceCall', () => ({
  LabVoiceCall: ({ idleCaption, onEnd, onReconnect }: { idleCaption: string; onEnd: () => void; onReconnect: () => void }) => <div><span>{idleCaption}</span><button onClick={onEnd}>End</button><button onClick={onReconnect}>Reconnect</button></div>,
}))

import { LibraryAssistant } from '../labLibraryAssistant'

const catalogue = {
  books: [
    { id: 'republic', title: 'The Republic', author: 'Plato', summary: 'Justice and the ideal city.', art: { src: '/covers/v2/the-republic.webp' }, availability: { chapterText: true } },
  ],
}

beforeEach(() => {
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
