// @vitest-environment jsdom
//
// Talk on the Chrome V2 phone reader, wired to the Grok voice session. The
// transport is stubbed: getUserMedia hangs or the token route fails, so no
// provider session is ever opened here.
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { useVoiceSession } from '../hooks/useVoiceSession'
import { GROK_VOICE_INSTRUCTIONS } from '../voice/grokConfig'
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

function openTalk(authToken: string | null = null) {
  render(<LabApp pathname="/lab/phone" search="?chrome=v2" source={fallbackLabSource()} authToken={authToken} />)
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-talk'))
}

it('lets a direct voice resume command finish before closing the call successfully', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 404 })))
  vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia: () => new Promise(() => {}) } })
  openTalk()
  await waitFor(() => expect(screen.getByTestId('lab-call')).toBeTruthy())

  // A transcript is evidence of what was said, not a second command handler.
  act(() => captured.options?.appendLocalMessage?.({
    id: 'resume-turn', role: 'user', content: 'Please resume the audiobook now.',
    timestamp: Date.now(), bookId: 'bible',
  }))
  expect(screen.getByTestId('lab-call')).toBeTruthy()

  // The engine calls this only when the resume tool has completed.
  act(() => captured.options?.resumePlayback?.({
    bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1,
    paragraphIndex: 0, paragraphNumber: 1, offsetSeconds: 0,
  }))
  await waitFor(() => expect(screen.queryByTestId('lab-call')).toBeNull())
  expect(screen.queryByTestId('lab-call-reconnect')).toBeNull()
})

it('keeps an account rejection visible after the call closes, without an audio bar, and releases the microphone', async () => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => String(input).includes('/voice-session')
    ? new Response(JSON.stringify({ error: 'No messages remaining. Buy a chat pack to continue.' }), { status: 402 })
    : new Response('{}', { status: 404 })))
  const stop = vi.fn()
  vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop }], getAudioTracks: () => [{ stop, enabled: true }] }) } })
  openTalk('test-token')
  const notice = await screen.findByTestId('lab-voice-notice')
  expect(notice.textContent).toContain('No messages remaining')
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
  openTalk()
  expect(screen.getByTestId('lab-root').getAttribute('data-voice-history-fixture')).toBe('false')
  await screen.findByTestId('lab-call')
  act(() => captured.options?.appendLocalMessage({ id: 'back', role: 'user', content: 'Can you take me back to the book?', timestamp: Date.now(), bookId: 'bible' }))
  act(() => captured.options?.resumePlayback({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1, paragraphIndex: 0, paragraphNumber: 1, offsetSeconds: 0 }, false))
  await waitFor(() => expect(screen.queryByTestId('lab-call')).toBeNull())
  expect(screen.queryByTestId('lab-voice-notice')).toBeNull()
  expect(screen.getByTestId('lab-listen-status').getAttribute('data-playing')).toBe('false')
})

it('persists research sources as clickable links beside the voice answer', async () => {
  vi.stubGlobal('fetch', vi.fn(async input => String(input).includes('/voice-research')
    ? Response.json({ ok: true, notes: 'A sourced note.', sources: [{ title: 'Sermon archive', url: 'https://gospelinlife.com/example' }] })
    : new Response('{}', { status: 404 })))
  render(<LabApp pathname="/lab/phone" search="?chrome=v2" source={fallbackLabSource()} authToken="test-token" />)
  act(() => captured.options?.appendLocalMessage({ id: 'question', role: 'user', content: 'Has Keller commented?', timestamp: Date.now(), bookId: 'bible', source: 'voice' }))
  await act(async () => { const result = await captured.options?.onApplicationTool?.('search_reading_sources', { query: 'Tim Keller Genesis 1' }, 'research'); expect(result?.responseInstructions).toContain("I've added the source links in chat.") })
  const answer = { id: 'answer', role: 'assistant' as const, content: 'Keller discusses creation.', timestamp: Date.now(), bookId: 'bible', source: 'voice' as const }
  act(() => { captured.options?.appendLocalMessage(answer); captured.options?.recordMessage(answer, 1, 0) })
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-chat'))
  const link = await screen.findByRole('link', { name: '1' })
  expect(link.getAttribute('href')).toBe('https://gospelinlife.com/example')
  expect(link.getAttribute('title')).toBe('Sermon archive')
  expect(localStorage.getItem('tinct:chat-history:bible')).toContain('https://gospelinlife.com/example')
})

it('also closes voice without starting audio when the model uses the open-reader tool', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 404 })))
  vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia: () => new Promise(() => {}) } })
  openTalk()
  await screen.findByTestId('lab-call')
  await act(async () => { await captured.options?.onApplicationTool?.('open_tinct_view', { view: 'read' }, 'return') })
  expect(screen.queryByTestId('lab-call')).toBeNull()
  expect(screen.getByTestId('lab-listen-status').getAttribute('data-playing')).toBe('false')
  expect(screen.queryByTestId('lab-voice-notice')).toBeNull()
})

it('gives Talk the Grok contract: reference data apart from the prompt, and the research, passage and reader controls', () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 404 })))
  render(<LabApp pathname="/lab/phone" search="?chrome=v2" source={fallbackLabSource()} authToken={null} />)
  const options = captured.options!
  // The reader never replaces the Tinct prompt; it supplies reference data only.
  expect(options.instructions).toBeUndefined()
  const reference = JSON.parse(options.reference!) as Record<string, unknown>
  expect(reference).toMatchObject({ book: expect.any(String), chapter: expect.any(String), chapterNumber: expect.any(Number), paragraphIndex: expect.any(Number) })
  expect(Array.isArray(reference.excerpt)).toBe(true)
  expect(options.reference).not.toContain(GROK_VOICE_INSTRUCTIONS.slice(0, 40))
  const names = (options.tools as Array<{ name: string }>).map(tool => tool.name)
  for (const name of ['resume_audiobook', 'end_voice_session', 'get_book_passage', 'search_reading_sources', 'search_personal_reading_history', 'get_reading_history', 'open_tinct_view', 'set_audiobook_speed', 'undo_last_tinct_action', 'next_chapter']) {
    expect(names).toContain(name)
  }
  expect(names).not.toContain('ask_companion')
  const resume = (options.tools as Array<{ name: string; parameters: { required?: string[] } }>).find(tool => tool.name === 'resume_audiobook')!
  expect(resume.parameters.required).toEqual(['play_audio'])
  expect(options.labGuest).toBe(true)
})

it('carries the Explain quote and its explanation into Talk as reference data', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 404 })))
  vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia: () => new Promise(() => {}) } })
  render(<LabApp pathname="/lab/phone" search="?chrome=v2" source={fallbackLabSource()} authToken={null} />)
  const explanation = { id: 'explain-answer', role: 'assistant' as const, content: 'The deep is the primordial abyss.', timestamp: Date.now(), bookId: 'bible', source: 'text' as const }
  act(() => {
    captured.options?.appendLocalMessage({ id: 'explain-question', role: 'user', content: 'Explain this passage.', timestamp: Date.now() - 1, bookId: 'bible', source: 'text' })
    captured.options?.appendLocalMessage(explanation)
  })
  await waitFor(() => {
    const reference = JSON.parse(captured.options!.reference!) as { recentConversation?: Array<{ content: string }> }
    expect(reference.recentConversation?.map(turn => turn.content)).toEqual(['Explain this passage.', 'The deep is the primordial abyss.'])
  })
})
