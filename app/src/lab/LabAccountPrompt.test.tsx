// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabAccountSheet, LabSecondBookNudge } from './LabAccountPrompt.tsx'
import { LabApp } from './LabApp'
import { LAB_AI_ACTIONS_KEY, LAB_FREE_AI_ACTIONS, LAB_SECOND_BOOK_NUDGE_KEY } from './labAccountPrompt'
import { LAB_COPY } from './labCopy'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

const DEVICE_KEYS = [
  LAB_AI_ACTIONS_KEY,
  LAB_SECOND_BOOK_NUDGE_KEY,
  'tinct-lab-prefs',
  'tinct-lab-position',
  'tinct:reading-memory',
  'tinct:chat-history:lab',
  'tinct:chat-history:bible',
]

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  for (const key of DEVICE_KEYS) {
    try { localStorage.removeItem(key) } catch { /* jsdom */ }
  }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

/** The chat endpoints only; `/api/lab-chat-history` (signed-in sync) must not count. */
const CHAT_ENDPOINT = /\/api\/(lab-)?chat(?:\?|$)/

function chatFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (CHAT_ENDPOINT.test(url)) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ content: [{ text: 'A reply from the page.' }] }),
      }
    }
    return { ok: false, status: 404, json: async () => ({}) }
  })
}

function chatCalls(fetchMock: ReturnType<typeof chatFetch>) {
  return fetchMock.mock.calls.filter(call => CHAT_ENDPOINT.test(String(call[0])))
}

function openDesktopChat() {
  fireEvent.click(screen.getByTestId('lab-desktop-chat'))
}

function sendTyped(text: string) {
  fireEvent.change(screen.getByPlaceholderText('Ask'), { target: { value: text } })
  fireEvent.click(screen.getByTestId('lab-ask-send'))
}

describe('LabAccountSheet', () => {
  it('renders the copy, the two sign-in links with the return target, and nothing when closed', () => {
    const onClose = vi.fn()
    const { rerender } = render(<LabAccountSheet open action="chat" returnTo="/lab/reader?voice=v2" onClose={onClose} />)
    const sheet = screen.getByTestId('lab-account-sheet')
    expect(sheet.getAttribute('data-action')).toBe('chat')
    expect(screen.getByRole('dialog').getAttribute('aria-labelledby')).toBe('lab-account-title')
    expect(screen.getByText(LAB_COPY.accountEyebrow)).toBeTruthy()
    expect(screen.getByText(LAB_COPY.accountTitle)).toBeTruthy()
    expect(screen.getByText(LAB_COPY.accountBody)).toBeTruthy()
    expect(screen.getByTestId('lab-account-create').getAttribute('href')).toBe('/lab/sign-in?mode=create&returnTo=%2Flab%2Freader%3Fvoice%3Dv2')
    expect(screen.getByTestId('lab-account-create').textContent).toBe(LAB_COPY.accountCreate)
    expect(screen.getByTestId('lab-account-sign-in').getAttribute('href')).toBe('/lab/sign-in?returnTo=%2Flab%2Freader%3Fvoice%3Dv2')
    expect(screen.getByTestId('lab-account-sign-in').textContent).toBe(LAB_COPY.accountSignIn)
    rerender(<LabAccountSheet open={false} action="chat" returnTo="/lab/reader" onClose={onClose} />)
    expect(screen.queryByTestId('lab-account-sheet')).toBeNull()
  })

  it('dismisses on the close button, the backdrop and Escape, but not on the card', () => {
    const onClose = vi.fn()
    render(<LabAccountSheet open action="voice" returnTo="/lab/reader" onClose={onClose} desktop />)
    expect(screen.getByTestId('lab-account-sheet').className).toContain('is-desktop-popover')
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(screen.getByLabelText(LAB_COPY.accountDismiss))
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByTestId('lab-account-sheet'))
    expect(onClose).toHaveBeenCalledTimes(2)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})

describe('LabSecondBookNudge', () => {
  it('is one line with a create-account link and a dismiss', () => {
    const onDismiss = vi.fn()
    render(<LabSecondBookNudge returnTo="/lab/reader" onDismiss={onDismiss} />)
    const nudge = screen.getByTestId('lab-second-book-nudge')
    expect(nudge.textContent).toContain(`${LAB_COPY.secondBookNudge}${LAB_COPY.secondBookNudgeLink}`)
    expect(screen.getByTestId('lab-second-book-nudge-link').getAttribute('href')).toBe('/lab/sign-in?mode=create&returnTo=%2Flab%2Freader')
    fireEvent.click(screen.getByLabelText(LAB_COPY.secondBookNudgeDismiss))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

describe('lab account prompt in the reader', () => {
  it('sends three anonymous chats, holds the fourth behind the sheet, and keeps the draft on dismiss', async () => {
    const fetchMock = chatFetch()
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online authToken={null} />)
    openDesktopChat()

    const questions = ['Who wrote this?', 'And when?', 'Where?']
    expect(questions).toHaveLength(LAB_FREE_AI_ACTIONS)
    for (const [index, question] of questions.entries()) {
      sendTyped(question)
      await waitFor(() => expect(screen.getAllByTestId('lab-ask-turn-user')).toHaveLength(index + 1))
      await waitFor(() => expect(chatCalls(fetchMock)).toHaveLength(index + 1))
      expect(screen.queryByTestId('lab-account-sheet')).toBeNull()
      expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBe(String(index + 1))
    }
    expect((await screen.findAllByTestId('lab-ask-turn-assistant'))[0].textContent).toContain('A reply from the page.')

    sendTyped('One more?')
    const sheet = await screen.findByTestId('lab-account-sheet')
    expect(sheet.getAttribute('data-action')).toBe('chat')
    expect(screen.getByText(LAB_COPY.accountTitle)).toBeTruthy()
    expect(screen.getByTestId('lab-account-create').getAttribute('href')).toContain('/lab/sign-in?mode=create&returnTo=')
    // Not sent: no extra network call, no extra user turn, counter unchanged.
    expect(chatCalls(fetchMock)).toHaveLength(LAB_FREE_AI_ACTIONS)
    expect(screen.getAllByTestId('lab-ask-turn-user')).toHaveLength(LAB_FREE_AI_ACTIONS)
    expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBe(String(LAB_FREE_AI_ACTIONS))
    expect(screen.queryByTestId('lab-ask-notice')).toBeNull()

    fireEvent.click(screen.getByTestId('lab-account-dismiss'))
    expect(screen.queryByTestId('lab-account-sheet')).toBeNull()
    // The reader keeps the chat pane and the unsent question.
    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expect((screen.getByPlaceholderText('Ask') as HTMLInputElement).value).toBe('One more?')
    expect(chatCalls(fetchMock)).toHaveLength(LAB_FREE_AI_ACTIONS)

    // Trying again is still held: the dismissed sheet spent nothing.
    fireEvent.click(screen.getByTestId('lab-ask-send'))
    expect(await screen.findByTestId('lab-account-sheet')).toBeTruthy()
    expect(chatCalls(fetchMock)).toHaveLength(LAB_FREE_AI_ACTIONS)
  })

  it('counts chat and voice against one allowance, so both can be tried first', async () => {
    // Two chats already spent on this device. A chat takes the third, and the
    // voice turn after it — the fourth action overall — is the one held.
    localStorage.setItem(LAB_AI_ACTIONS_KEY, '2')
    const fetchMock = chatFetch()
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online authToken={null} />)

    openDesktopChat()
    sendTyped('Who wrote this?')
    await waitFor(() => expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBe('3'))
    expect(chatCalls(fetchMock)).toHaveLength(1)
    expect(screen.queryByTestId('lab-account-sheet')).toBeNull()

    fireEvent.click(screen.getByTestId('lab-desktop-talk'))
    expect((await screen.findByTestId('lab-account-sheet')).getAttribute('data-action')).toBe('voice')
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('voice-session'))).toBe(false)
    expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBe('3')
  })

  it('keeps the spent count across a reload and hands it back on sign-in', async () => {
    const fetchMock = chatFetch()
    vi.stubGlobal('fetch', fetchMock)
    const first = render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online authToken={null} />)
    openDesktopChat()
    sendTyped('Who wrote this?')
    await waitFor(() => expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBe('1'))
    first.unmount()

    // Reload: only what reached storage survives, and it still counts.
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online authToken={null} />)
    openDesktopChat()
    sendTyped('And when?')
    await waitFor(() => expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBe('2'))
    sendTyped('Where?')
    await waitFor(() => expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBe('3'))
    sendTyped('One more?')
    expect(await screen.findByTestId('lab-account-sheet')).toBeTruthy()
    cleanup()

    // Signing in hands the anonymous allowance back.
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online authToken="signed-in" />)
    await waitFor(() => expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBeNull())
    expect(screen.queryByTestId('lab-account-sheet')).toBeNull()
  })

  it('never shows the sheet to a signed-in reader', async () => {
    localStorage.setItem(LAB_AI_ACTIONS_KEY, '5')
    // Signing in clears the anonymous device count, so it is gone by the end.
    const fetchMock = chatFetch()
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online authToken="signed-in" />)
    openDesktopChat()
    sendTyped('First')
    await screen.findByTestId('lab-ask-turn-assistant')
    sendTyped('Second')
    await waitFor(() => expect(screen.getAllByTestId('lab-ask-turn-user')).toHaveLength(2))
    expect(screen.queryByTestId('lab-account-sheet')).toBeNull()
    expect(chatCalls(fetchMock)).toHaveLength(2)
    expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBeNull()
  })

  it('holds an anonymous voice question once the allowance is spent, before any mic session, and returns to reading on dismiss', async () => {
    localStorage.setItem(LAB_AI_ACTIONS_KEY, String(LAB_FREE_AI_ACTIONS))
    const fetchMock = chatFetch()
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online authToken={null} />)
    fireEvent.click(screen.getByTestId('lab-desktop-talk'))
    const sheet = await screen.findByTestId('lab-account-sheet')
    expect(sheet.getAttribute('data-action')).toBe('voice')
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('voice-session'))).toBe(false)
    expect(screen.queryByTestId('lab-voice-gate')).toBeNull()
    expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBe(String(LAB_FREE_AI_ACTIONS))

    fireEvent.click(screen.getByTestId('lab-account-dismiss'))
    expect(screen.queryByTestId('lab-account-sheet')).toBeNull()
    await waitFor(() => expect(screen.queryByTestId('lab-conversation')).toBeNull())
    expect(screen.getByTestId('lab-page-wrap')).toBeTruthy()
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('voice-session'))).toBe(false)
  })

  it('holds the phone Talk button the same way', async () => {
    localStorage.setItem(LAB_AI_ACTIONS_KEY, String(LAB_FREE_AI_ACTIONS))
    const fetchMock = chatFetch()
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} online authToken={null} />)
    fireEvent.click(screen.getByTestId('lab-phone-talk'))
    expect((await screen.findByTestId('lab-account-sheet')).getAttribute('data-action')).toBe('voice')
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('voice-session'))).toBe(false)
    fireEvent.click(screen.getByTestId('lab-account-dismiss'))
    expect(screen.queryByTestId('lab-account-sheet')).toBeNull()
    await waitFor(() => expect(screen.queryByTestId('lab-conversation')).toBeNull())
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    expect(screen.getByTestId('lab-page-wrap')).toBeTruthy()
  })

  it('lets the first voice question through for an anonymous reader', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => { /* hang the guest voice token */ })))
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online authToken={null} />)
    fireEvent.click(screen.getByTestId('lab-desktop-talk'))
    await waitFor(() => expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBe('1'))
    expect(screen.queryByTestId('lab-account-sheet')).toBeNull()
  })

  it('shows the second-book nudge once per device for an anonymous reader, never when signed in', () => {
    localStorage.setItem('tinct-lab-position', JSON.stringify({ books: {}, finished: { odyssey: [1, 2] }, lastSettledBookId: null, lastSettledAt: 0, updatedAt: 1, deviceId: 'd' }))
    const { unmount } = render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken={null} />)
    const nudge = screen.getByTestId('lab-second-book-nudge')
    expect(nudge.textContent).toContain('Keep your place across books')
    expect(localStorage.getItem(LAB_SECOND_BOOK_NUDGE_KEY)).toBe('1')
    fireEvent.click(screen.getByTestId('lab-second-book-nudge-dismiss'))
    expect(screen.queryByTestId('lab-second-book-nudge')).toBeNull()
    unmount()

    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken={null} />)
    expect(screen.queryByTestId('lab-second-book-nudge')).toBeNull()
    cleanup()

    localStorage.removeItem(LAB_SECOND_BOOK_NUDGE_KEY)
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken="signed-in" />)
    expect(screen.queryByTestId('lab-second-book-nudge')).toBeNull()
    expect(localStorage.getItem(LAB_SECOND_BOOK_NUDGE_KEY)).toBeNull()
  })

  it('does not nudge on the first book', () => {
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken={null} />)
    expect(screen.queryByTestId('lab-second-book-nudge')).toBeNull()
    expect(localStorage.getItem(LAB_SECOND_BOOK_NUDGE_KEY)).toBeNull()
  })
})
