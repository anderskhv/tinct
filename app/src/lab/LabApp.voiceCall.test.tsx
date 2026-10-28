// @vitest-environment jsdom
//
// The mobile call interface, wired into the reader. The voice layer is stubbed
// throughout: getUserMedia hangs, so the call never reaches a real Realtime
// session and no network call is made.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { LEAVE_FADE_MS } from './labLeaveForLibrary'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { LAB_PREFS_KEY, parseLabPrefs } from './labPrefs'
import { TALK_SPEED_MAX, TALK_SPEED_MIN, TALK_SPEED_STEPS } from './labTalkSpeed'
import { GrokVoiceSessionController } from '../voice/GrokVoiceSessionController'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  try { localStorage.clear() } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

beforeEach(() => {
  // A microphone request that never settles: the call opens and stays at its
  // own Connecting state without any session ever being established.
  vi.stubGlobal('navigator', {
    ...navigator,
    mediaDevices: { getUserMedia: () => new Promise(() => { /* hang */ }) },
  })
})

function renderPhone(search: string) {
  return render(
    <LabApp pathname="/lab/phone" search={search} source={fallbackLabSource()} authToken="reader-token" />,
  )
}

/** Chrome V2's Talk lives in the super-menu; the entry point is unchanged. */
function tapTalk() {
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-talk'))
}

async function openCall(search = '?chrome=v2') {
  const rendered = renderPhone(search)
  tapTalk()
  await waitFor(() => expect(screen.getByTestId('lab-call')).toBeTruthy())
  return rendered
}

describe('Talk on the phone with Chrome V2', () => {
  it('opens the full-screen call rather than the chat sheet', async () => {
    await openCall()
    expect(screen.getByTestId('lab-call')).toBeTruthy()
    expect(screen.getByTestId('lab-call-circle')).toBeTruthy()
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    // The old conversation overlay and its connecting gate stay out of the way.
    expect(screen.queryByTestId('lab-conversation')).toBeNull()
    expect(screen.queryByTestId('lab-voice-gate')).toBeNull()
  })

  it('shows Mute and End as icons, named for screen readers, beside the speed value', async () => {
    await openCall()
    const mute = screen.getByTestId('lab-call-mute')
    const end = screen.getByTestId('lab-call-end')
    expect(mute.textContent).toBe('')
    expect(end.textContent).toBe('')
    expect(mute.querySelector('.lab-voice-control-word')).toBeNull()
    expect(end.querySelector('.lab-voice-control-word')).toBeNull()
    expect(mute.getAttribute('aria-label')).toBe('Mute')
    expect(mute.getAttribute('title')).toBe('Mute')
    expect(end.getAttribute('aria-label')).toBe('End conversation')
    expect(end.getAttribute('title')).toBe('End conversation')
    expect(screen.getByTestId('lab-call-speed').querySelector('.lab-voice-control-word')?.textContent).toBe('1×')
    // Minimal Talk: orb, one status line, controls. The AI Act disclosure is
    // the connecting status line itself; no separate AI line, hint or book line.
    expect(screen.queryByTestId('lab-call-ai')).toBeNull()
    expect(screen.queryByTestId('lab-call-book')).toBeNull()
    expect(screen.queryByTestId('lab-call-connection')).toBeNull()
    expect(screen.queryByTestId('lab-call-caption')).toBeNull()
    expect(screen.getByTestId('lab-call').textContent).not.toContain("You're talking to an AI.")
    expect(screen.getByTestId('lab-call').textContent).not.toContain('Ask about this page')
  })

  it('never claims to be listening before a connection exists', async () => {
    await openCall()
    expect(screen.getByTestId('lab-call-status').textContent).toBe('Connecting to AI…')
    expect(screen.getByTestId('lab-call-status').getAttribute('aria-live')).toBe('polite')
    expect(screen.getByTestId('lab-call-circle').getAttribute('data-motion')).not.toBe('breathe')
  })

  it('keeps the microphone request out of the way until Talk is tapped', () => {
    const getUserMedia = vi.fn()
    vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia } })
    renderPhone('?chrome=v2')
    expect(screen.queryByTestId('lab-call')).toBeNull()
    expect(getUserMedia).not.toHaveBeenCalled()
  })

  it('opens the full call from Chat without exposing transcript mode', async () => {
    const getUserMedia = vi.fn(() => new Promise(() => {}))
    vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia } })
    renderPhone('?chrome=v2')
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-chat'))
    await waitFor(() => expect(screen.getByTestId('lab-ask-pane')).toBeTruthy())
    fireEvent.click(screen.getByTestId('lab-ask-voice'))
    await waitFor(() => expect(screen.getByTestId('lab-call')).toBeTruthy())
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1))
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    expect(screen.queryByTestId('lab-call-transcript')).toBeNull()
    expect(screen.queryByTestId('lab-call-bar')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-call-end'))
    expect(getUserMedia).toHaveBeenCalledTimes(1)
  })

  describe('ending the conversation', () => {
    it('closes the call and returns to the reading page', async () => {
      await openCall()
      fireEvent.click(screen.getByTestId('lab-call-end'))
      await waitFor(() => expect(screen.queryByTestId('lab-call')).toBeNull())
      expect(screen.queryByTestId('lab-call-bar')).toBeNull()
      expect(screen.getByTestId('lab-root')).toBeTruthy()
    })

    it('leaves the reader where the dialogue began', async () => {
      await openCall()
      const before = screen.getByTestId('lab-root').getAttribute('data-chapter')
      fireEvent.click(screen.getByTestId('lab-call-end'))
      await waitFor(() => expect(screen.queryByTestId('lab-call')).toBeNull())
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe(before)
    })
  })

  it('gives up on a connection that never lands, and offers to reconnect', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    renderPhone('?chrome=v2')
    tapTalk()
    await waitFor(() => expect(screen.getByTestId('lab-call')).toBeTruthy())
    expect(screen.getByTestId('lab-call-status').textContent).toBe('Connecting to AI…')
    await vi.advanceTimersByTimeAsync(9000)
    await waitFor(() => {
      expect(screen.getByTestId('lab-call-status').textContent).toBe('Disconnected')
    })
    expect(screen.getByTestId('lab-call-reconnect')).toBeTruthy()
    expect(screen.queryByText('Listening.')).toBeNull()
  })
})

function renderDesktop(search = '?chrome=v2') {
  return render(
    <LabApp pathname="/lab/desktop" search={search} source={fallbackLabSource()} authToken="reader-token" />,
  )
}

async function openDesktopCall() {
  const rendered = renderDesktop()
  tapTalk()
  await waitFor(() => expect(screen.getByTestId('lab-voice-panel')).toBeTruthy())
  return rendered
}

const readerPlace = () => {
  const root = screen.getByTestId('lab-root')
  return `${root.getAttribute('data-chapter')}|${root.getAttribute('data-place')}`
}

describe('Talk on the desktop with Chrome V2', () => {
  it('opens the conversation in the companion panel, not the chat pane and not full screen', async () => {
    await openDesktopCall()
    const root = screen.getByTestId('lab-root')
    expect(root.getAttribute('data-desktop-panel')).toBe('talk')
    expect(screen.getByTestId('lab-voice-panel-orb')).toBeTruthy()
    expect(screen.getByTestId('lab-voice-panel-status').textContent).toBe('Connecting to AI…')
    expect(screen.getByTestId('lab-voice-panel-status').getAttribute('aria-live')).toBe('polite')
    // One connecting line, not "Connecting." plus "◦ Connecting".
    expect(screen.getByTestId('lab-voice-panel').textContent?.match(/Connecting/g)).toHaveLength(1)
    expect(screen.queryByTestId('lab-call')).toBeNull()
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    expect(screen.queryByTestId('lab-voice-pill')).toBeNull()
    // Mute and End are in the panel; no transcript, AI line or hint is drawn.
    expect(screen.getByTestId('lab-voice-panel-mute')).toBeTruthy()
    expect(screen.getByTestId('lab-voice-panel-end')).toBeTruthy()
    // Icons only, still named for screen readers and tooltips.
    expect(screen.getByTestId('lab-voice-panel-mute').textContent).toBe('')
    expect(screen.getByTestId('lab-voice-panel-end').textContent).toBe('')
    expect(screen.getByTestId('lab-voice-panel-mute').getAttribute('aria-label')).toBe('Mute')
    expect(screen.getByTestId('lab-voice-panel-end').getAttribute('aria-label')).toBe('End conversation')
    expect(screen.queryByTestId('lab-voice-panel-ai')).toBeNull()
    expect(screen.queryByTestId('lab-voice-panel-thread')).toBeNull()
    expect(screen.queryByTestId('lab-voice-panel-empty')).toBeNull()
    expect(screen.queryByTestId('lab-voice-panel-connection')).toBeNull()
  })

  it('opens the full desktop voice panel from Chat', async () => {
    renderDesktop()
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-chat'))
    await waitFor(() => expect(screen.getByTestId('lab-ask-pane')).toBeTruthy())
    fireEvent.click(screen.getByTestId('lab-ask-voice'))
    await waitFor(() => expect(screen.getByTestId('lab-voice-panel')).toBeTruthy())
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    expect(screen.getByTestId('lab-root').getAttribute('data-desktop-panel')).toBe('talk')
  })

  it('tints the passage under discussion on the page', async () => {
    await openDesktopCall()
    await waitFor(() => expect(document.querySelector('.lab-hearing-line.is-discussed')).toBeTruthy())
  })

  describe('minimizing', () => {
    it('collapses the panel to the pill with the call still running', async () => {
      await openDesktopCall()
      fireEvent.click(screen.getByTestId('lab-voice-panel-minimize'))
      expect(screen.queryByTestId('lab-voice-panel')).toBeNull()
      const pill = screen.getByTestId('lab-voice-pill')
      expect(pill).toBeTruthy()
      expect(screen.getByTestId('lab-voice-pill-status').textContent).toBe('Connecting to AI…')
      expect(screen.getByTestId('lab-root').getAttribute('data-desktop-panel')).toBe('pill')
      expect(screen.getByTestId('lab-root').getAttribute('data-chrome-state')).toBe('talking')
      // Still tinted while minimized.
      expect(document.querySelector('.lab-hearing-line.is-discussed')).toBeTruthy()
    })

    it('restores the panel from the orb and expand control without transcript mode', async () => {
      await openDesktopCall()
      for (const control of ['lab-voice-pill-orb', 'lab-voice-pill-expand']) {
        fireEvent.click(screen.getByTestId('lab-voice-panel-minimize'))
        expect(screen.getByTestId('lab-voice-pill')).toBeTruthy()
        expect(screen.queryByTestId('lab-voice-pill-transcript')).toBeNull()
        fireEvent.click(screen.getByTestId(control))
        expect(screen.queryByTestId('lab-voice-pill')).toBeNull()
        expect(screen.getByTestId('lab-voice-panel')).toBeTruthy()
      }
    })

    it('never moves the reader\u2019s place', async () => {
      await openDesktopCall()
      const before = readerPlace()
      fireEvent.click(screen.getByTestId('lab-voice-panel-minimize'))
      expect(readerPlace()).toBe(before)
      fireEvent.click(screen.getByTestId('lab-voice-pill-expand'))
      expect(readerPlace()).toBe(before)
      fireEvent.click(screen.getByTestId('lab-voice-panel-end'))
      await waitFor(() => expect(screen.queryByTestId('lab-voice-panel')).toBeNull())
      expect(readerPlace()).toBe(before)
    })

    it('mutes and ends from the pill', async () => {
      await openDesktopCall()
      fireEvent.click(screen.getByTestId('lab-voice-panel-minimize'))
      fireEvent.click(screen.getByTestId('lab-voice-pill-end'))
      await waitFor(() => expect(screen.queryByTestId('lab-voice-pill')).toBeNull())
      expect(screen.queryByTestId('lab-voice-panel')).toBeNull()
      expect(screen.getByTestId('lab-root').getAttribute('data-desktop-panel')).toBe('none')
    })
  })

  it('ends from the panel and returns to reading with the tint gone', async () => {
    await openDesktopCall()
    fireEvent.click(screen.getByTestId('lab-voice-panel-end'))
    await waitFor(() => expect(screen.queryByTestId('lab-voice-panel')).toBeNull())
    expect(screen.getByTestId('lab-root').getAttribute('data-chrome-state')).toBe('reading')
    expect(screen.getByTestId('lab-root').getAttribute('data-desktop-panel')).toBe('none')
    expect(document.querySelector('.lab-hearing-line.is-discussed')).toBeNull()
  })

  it('gives up on a connection that never lands, and offers Reconnect in the panel', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    renderDesktop()
    tapTalk()
    await waitFor(() => expect(screen.getByTestId('lab-voice-panel')).toBeTruthy())
    await vi.advanceTimersByTimeAsync(9000)
    await waitFor(() => {
      expect(screen.getByTestId('lab-voice-panel-status').textContent).toBe('Disconnected')
    })
    expect(screen.getByTestId('lab-voice-panel-reconnect')).toBeTruthy()
    expect(screen.queryByTestId('lab-voice-panel-mute')).toBeNull()
    expect(screen.queryByText('Listening.')).toBeNull()
  })

  it('hands over to Chat when the reader picks it during a call', async () => {
    await openDesktopCall()
    const before = readerPlace()
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-chat'))
    await waitFor(() => expect(screen.getByTestId('lab-ask-pane')).toBeTruthy())
    expect(screen.queryByTestId('lab-voice-panel')).toBeNull()
    expect(screen.queryByTestId('lab-voice-pill')).toBeNull()
    expect(screen.getByTestId('lab-root').getAttribute('data-desktop-panel')).toBe('chat')
    expect(readerPlace()).toBe(before)
  })
})

it('opens the whole-book primer from Contents while keeping the reader and place', async () => {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => new Response('{}', { status: 404 }))
  vi.stubGlobal('fetch', fetchMock)
  vi.useFakeTimers({ shouldAdvanceTime: true })
  render(<LabApp pathname="/lab/phone" source={{ ...fallbackLabSource(), bookId: 'bible', chaptersProvisional: false }} authToken="reader-token" />)
  const before = readerPlace()
  fireEvent.click(screen.getByTestId('lab-header-chapter'))
  expect(screen.queryByRole('button', { name: 'Cover', exact: true })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Preface', exact: true })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Book primer', exact: true }))
  expect(screen.queryByTestId('lab-chapter-cover')).toBeNull()
  expect(readerPlace()).toBe(before)
  await vi.advanceTimersByTimeAsync(LEAVE_FADE_MS + 20)
  expect(screen.queryByTestId('lab-leave-veil')).toBeNull()
  expect(screen.getByTestId('lab-chapter-notes')).toBeTruthy()
  const call = fetchMock.mock.calls.find(args => String(args[0]).includes('/api/lab-chapter-notes')) as unknown as [string, RequestInit]
  expect(JSON.parse(String(call[1].body))).toMatchObject({ format: 'structured-primer', primerType: 'book' })
})

it('keeps Reconnect available after cancelling a pending microphone and can end the next attempt', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  renderDesktop()
  tapTalk()
  await waitFor(() => expect(screen.getByTestId('lab-voice-panel')).toBeTruthy())
  await vi.advanceTimersByTimeAsync(9000)
  await waitFor(() => expect(screen.getByTestId('lab-voice-panel-reconnect')).toBeTruthy())
  fireEvent.click(screen.getByTestId('lab-voice-panel-reconnect'))
  await waitFor(() => expect(screen.getByTestId('lab-voice-panel-status').textContent).toBe('Connecting to AI…'))
  fireEvent.click(screen.getByTestId('lab-voice-panel-end'))
  await vi.advanceTimersByTimeAsync(35000)
  expect(screen.queryByTestId('lab-voice-panel')).toBeNull()
})

// Talk speed. The voice layer stays stubbed: the microphone request hangs, so
// no xAI session ever opens. The controller methods are spied on, called
// through, and with no socket their session.update goes nowhere.
describe('Talk speed', () => {
  const storedTalkSpeed = () => JSON.parse(localStorage.getItem(LAB_PREFS_KEY) || '{}')?.shared?.talkSpeed

  for (const surface of [
    { name: 'phone', prefix: 'lab-call', open: openCall },
    { name: 'desktop', prefix: 'lab-voice-panel', open: openDesktopCall },
  ] as const) {
    it(`shows the speed control in the ${surface.name} Talk controls, at 1× by default`, async () => {
      await surface.open()
      const control = screen.getByTestId(`${surface.prefix}-speed`)
      expect(control.textContent).toContain('1×')
      expect(control.getAttribute('aria-label')).toBe('Playback speed 1 times. Open speed control')
      fireEvent.click(control)
      const steps = TALK_SPEED_STEPS.map(step => screen.getByTestId(`${surface.prefix}-speed-${step}`).textContent)
      expect(steps).toEqual(['0.8×', '1×', '1.25×', '1.5×'])
    })

    it(`on the ${surface.name}, a new speed goes to the live session, is saved, and starts the next session`, async () => {
      const setSpeed = vi.spyOn(GrokVoiceSessionController.prototype, 'setAssistantSpeed')
      const start = vi.spyOn(GrokVoiceSessionController.prototype, 'start')
      await surface.open()
      expect(start.mock.calls.at(-1)?.[0].assistantSpeed).toBe(1)
      fireEvent.click(screen.getByTestId(`${surface.prefix}-speed`))
      fireEvent.click(screen.getByTestId(`${surface.prefix}-speed-1.25`))
      expect(setSpeed).toHaveBeenLastCalledWith(1.25)
      expect(screen.getByTestId(`${surface.prefix}-speed`).textContent).toContain('1.25×')
      expect(screen.queryByTestId(`${surface.prefix}-speed-popover`)).toBeNull()
      expect(storedTalkSpeed()).toBe(1.25)

      fireEvent.click(screen.getByTestId(`${surface.prefix}-end`))
      await waitFor(() => expect(screen.queryByTestId(surface.prefix)).toBeNull())
      cleanup()
      start.mockClear()
      await surface.open()
      await waitFor(() => expect(start).toHaveBeenCalled())
      expect(start.mock.calls.at(-1)?.[0].assistantSpeed).toBe(1.25)
      expect(screen.getByTestId(`${surface.prefix}-speed`).textContent).toContain('1.25×')
    })
  }

  it('a spoken "talk slower" request updates the same saved speed', async () => {
    const start = vi.spyOn(GrokVoiceSessionController.prototype, 'start')
    await openCall()
    await waitFor(() => expect(start).toHaveBeenCalled())
    const controller = start.mock.contexts.at(-1) as unknown as { callbacks: { onSetAssistantPace?: (pace: 'slow' | 'normal' | 'fast') => void } }
    act(() => controller.callbacks.onSetAssistantPace?.('slow'))
    expect(storedTalkSpeed()).toBe(0.8)
    expect(screen.getByTestId('lab-call-speed').textContent).toContain('0.8×')
    act(() => controller.callbacks.onSetAssistantPace?.('fast'))
    expect(storedTalkSpeed()).toBe(1.25)
  })

  it('reads a saved speed back inside xAI\'s 0.7-1.5, and leaves it unset until chosen', () => {
    expect(parseLabPrefs({ version: 2, shared: { talkSpeed: 9 } }).talkSpeed).toBe(TALK_SPEED_MAX)
    expect(parseLabPrefs({ version: 2, shared: { talkSpeed: 0.1 } }).talkSpeed).toBe(TALK_SPEED_MIN)
    expect(parseLabPrefs({ version: 2, shared: { talkSpeed: 1.5 } }).talkSpeed).toBe(1.5)
    expect(parseLabPrefs({ version: 2, shared: {} }).talkSpeed).toBeUndefined()
    for (const step of TALK_SPEED_STEPS) {
      expect(step).toBeGreaterThanOrEqual(TALK_SPEED_MIN)
      expect(step).toBeLessThanOrEqual(TALK_SPEED_MAX)
    }
  })
})
