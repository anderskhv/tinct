// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { useVoiceSession } from '../hooks/useVoiceSession'
import { LabApp } from './LabApp'
import { fallbackLabSource } from './labSource'

const captured = vi.hoisted(() => ({ options: null as Parameters<typeof useVoiceSession>[0] | null }))
vi.mock('../hooks/useVoiceSession', async importOriginal => {
  const original = await importOriginal<typeof import('../hooks/useVoiceSession')>()
  return { ...original, useVoiceSession: (options: Parameters<typeof useVoiceSession>[0]) => {
    captured.options = options
    return original.useVoiceSession(options)
  } }
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
})

it('lets a direct voice resume command finish before closing the call successfully', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 404 })))
  vi.stubGlobal('navigator', {
    ...navigator,
    mediaDevices: { getUserMedia: () => new Promise(() => {}) },
  })
  render(<LabApp pathname="/lab/phone" search="?chrome=v2&voiceTrial=full" source={fallbackLabSource()} authToken={null} />)
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-talk'))
  await waitFor(() => expect(screen.getByTestId('lab-call')).toBeTruthy())

  // A transcript is evidence of what was said, not a second command handler.
  act(() => captured.options?.appendLocalMessage?.({
    id: 'resume-turn', role: 'user', content: 'Please resume the audiobook now.',
    timestamp: Date.now(), bookId: 'bible',
  }))
  expect(screen.getByTestId('lab-call')).toBeTruthy()

  // The engine calls this only when the resume command has completed.
  act(() => captured.options?.resumePlayback?.({
    bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1,
    paragraphIndex: 0, paragraphNumber: 1, offsetSeconds: 0,
  }))
  await waitFor(() => expect(screen.queryByTestId('lab-call')).toBeNull())
  expect(screen.queryByTestId('lab-call-reconnect')).toBeNull()
})

it('keeps an account rejection visible after the V2 call closes, without an audio bar', async () => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => String(input).includes('/voice-session')
    ? new Response(JSON.stringify({ error: 'No messages remaining. Buy a chat pack to continue.' }), { status: 402 })
    : new Response('{}', { status: 404 })))
  const stop = vi.fn()
  vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop }] }) } })
  render(<LabApp pathname="/lab/phone" search="?chrome=v2&voiceTrial=full" source={fallbackLabSource()} authToken="test-token" />)
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-talk'))
  const notice = await screen.findByTestId('lab-voice-notice')
  expect(notice.textContent).toContain('balance is empty')
  expect(screen.queryByTestId('lab-call')).toBeNull()
  expect(screen.queryByTestId('lab-phone-bar')).toBeNull()
  expect(stop).toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'View account' }))
  expect(screen.getByTestId('lab-v2-sheet').getAttribute('data-layer')).toBe('account')
  fireEvent.click(screen.getByTestId('lab-v2-sheet-close'))
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss message' }))
  expect(screen.queryByTestId('lab-voice-notice')).toBeNull()
})

it('returns a spoken back-to-book request to silent reading with no stale failure', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 404 })))
  vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia: () => new Promise(() => {}) } })
  render(<LabApp pathname="/lab/phone" search="?chrome=v2&voiceTrial=full" source={fallbackLabSource()} authToken={null} />)
  expect(screen.getByTestId('lab-root').getAttribute('data-voice-history-fixture')).toBe('false')
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-talk'))
  await screen.findByTestId('lab-call')
  act(() => captured.options?.appendLocalMessage({ id: 'back', role: 'user', content: 'Can you take me back to the book?', timestamp: Date.now(), bookId: 'bible' }))
  act(() => captured.options?.resumePlayback({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1, paragraphIndex: 0, paragraphNumber: 1, offsetSeconds: 0 }))
  await waitFor(() => expect(screen.queryByTestId('lab-call')).toBeNull())
  expect(screen.queryByTestId('lab-voice-notice')).toBeNull()
  expect(screen.getByTestId('lab-listen-status').getAttribute('data-playing')).toBe('false')
})

it('persists research sources as clickable links beside the voice answer', async () => {
  vi.stubGlobal('fetch', vi.fn(async input => String(input).includes('/voice-research')
    ? Response.json({ ok: true, notes: 'A sourced note.', sources: [{ title: 'Sermon archive', url: 'https://gospelinlife.com/example' }] })
    : new Response('{}', { status: 404 })))
  render(<LabApp pathname="/lab/phone" search="?chrome=v2&voiceTrial=full" source={fallbackLabSource()} authToken="test-token" />)
  act(() => captured.options?.appendLocalMessage({ id: 'question', role: 'user', content: 'Has Keller commented?', timestamp: Date.now(), bookId: 'bible', source: 'voice' }))
  await act(async () => { await captured.options?.onApplicationTool?.('search_reading_sources', { query: 'Tim Keller Genesis 1' }, 'research') })
  const answer = { id: 'answer', role: 'assistant' as const, content: 'Keller discusses creation.', timestamp: Date.now(), bookId: 'bible', source: 'voice' as const }
  act(() => { captured.options?.appendLocalMessage(answer); captured.options?.recordMessage(answer, 1, 0) })
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-chat'))
  const link = await screen.findByRole('link', { name: 'Sermon archive' })
  expect(link.getAttribute('href')).toBe('https://gospelinlife.com/example')
  expect(localStorage.getItem('tinct:chat-history:bible')).toContain('https://gospelinlife.com/example')
})
