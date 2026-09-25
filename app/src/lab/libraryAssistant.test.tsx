// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
    // Routed by URL, not call order: with Supabase configured (a developer's
    // environment) the account's preferences are fetched in between.
    fetchMock.mockImplementation((url, init) => {
      if (String(url).includes('/api/chat')) {
        chatSignal = init?.signal as AbortSignal
        return new Promise((_resolve, reject) => chatSignal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))
      }
      if (String(url).includes('catalogue.json')) return Promise.resolve(new Response(JSON.stringify(catalogue), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      return Promise.resolve(new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }))
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

function embeddedHost() {
  return { controls: { current: null as import('../labLibraryAssistant').LibraryAssistantControls | null }, ready: vi.fn(), onClose: vi.fn(), openBook: vi.fn(), returnTo: '/lab/library_2/', getBookId: () => 'republic' }
}

it('embeds without the old dock, sends current-book context, and opens recommendations through its host', async () => {
  const host = embeddedHost()
  let request: any
  vi.mocked(fetch).mockImplementation(async (url, init) => {
    if (String(url).includes('/api/chat')) {
      request = JSON.parse(String(init?.body))
      return new Response(JSON.stringify({ content: [{ type: 'text', text: 'Try The Republic. [[book:republic]]' }] }), { headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify(catalogue))
  })
  render(<LibraryAssistant host={host} />)
  await waitFor(() => expect(host.ready).toHaveBeenCalled())
  expect(screen.queryByRole('navigation')).toBeNull()
  act(() => host.controls.current!.open('chat'))
  const field = await screen.findByRole('textbox', { name: 'Message the librarian' })
  fireEvent.change(field, { target: { value: 'Help me prepare' } })
  fireEvent.submit(field.closest('form')!)
  await waitFor(() => expect(request?.system).toContain('"id":"republic"'))
  fireEvent.click(await screen.findByRole('button', { name: /The Republic/ }))
  expect(host.openBook).toHaveBeenCalledWith('republic')
  expect(host.onClose).toHaveBeenCalled()
})

it('embedded Talk starts only on the explicit action and stops when the host minimizes it', async () => {
  const host = embeddedHost()
  render(<LibraryAssistant host={host} />)
  await waitFor(() => expect(host.ready).toHaveBeenCalled())
  expect(mocks.start).not.toHaveBeenCalled()
  act(() => host.controls.current!.open('talk'))
  await waitFor(() => expect(mocks.start).toHaveBeenCalledWith({ authToken: 'token-a' }))
  act(() => host.controls.current!.close())
  expect(mocks.stop).toHaveBeenCalled()
  expect(host.onClose).toHaveBeenCalled()
  expect(screen.queryByTestId('lab-call')).toBeNull()
})

it('embedded exhausted guests keep the shared allowance and sign in back to the new library', async () => {
  const host = embeddedHost()
  mocks.auth = { user: null, session: null, isLoading: false }
  localStorage.setItem('tinct:lab-ai-actions', '10')
  try {
    render(<LibraryAssistant host={host} />)
    await waitFor(() => expect(host.ready).toHaveBeenCalled())
    act(() => host.controls.current!.open('talk'))
    expect(mocks.start).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toContain('returnTo=%2Flab%2Flibrary_2%2F')
    expect(localStorage.getItem('tinct:lab-ai-actions')).toBe('10')
  } finally { localStorage.removeItem('tinct:lab-ai-actions') }
})

it('minimizing an embedded pending chat aborts it and offers a retry when reopened', async () => {
  const host = embeddedHost()
  let signal: AbortSignal | null = null
  vi.mocked(fetch).mockImplementation((url, init) => {
    if (String(url).includes('/api/chat')) {
      signal = init?.signal as AbortSignal
      return new Promise((_resolve, reject) => signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))
    }
    return Promise.resolve(new Response(JSON.stringify(catalogue)))
  })
  render(<LibraryAssistant host={host} />)
  await waitFor(() => expect(host.ready).toHaveBeenCalled())
  act(() => host.controls.current!.open('chat'))
  const field = await screen.findByRole('textbox', { name: 'Message the librarian' })
  fireEvent.change(field, { target: { value: 'A book about justice' } })
  fireEvent.submit(field.closest('form')!)
  await waitFor(() => expect(signal).not.toBeNull())
  act(() => host.controls.current!.close())
  expect(signal?.aborted).toBe(true)
  act(() => host.controls.current!.open('chat'))
  expect(screen.queryByText('Thinking…')).toBeNull()
  expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
})
