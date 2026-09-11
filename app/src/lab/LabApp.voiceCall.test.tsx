// @vitest-environment jsdom
//
// The mobile call interface, wired into the reader. The voice layer is stubbed
// throughout: getUserMedia hangs, so the call never reaches a real Realtime
// session and no network call is made.

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

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
    <LabApp pathname="/lab/phone" search={search} source={fallbackLabSource()} authToken={null} />,
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

  it('never claims to be listening before a connection exists', async () => {
    await openCall()
    expect(screen.getByTestId('lab-call-status').textContent).toBe('Connecting.')
    expect(screen.getByTestId('lab-call-circle').getAttribute('data-motion')).not.toBe('breathe')
  })

  it('keeps the microphone request out of the way until Talk is tapped', () => {
    const getUserMedia = vi.fn()
    vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia } })
    renderPhone('?chrome=v2')
    expect(screen.queryByTestId('lab-call')).toBeNull()
    expect(getUserMedia).not.toHaveBeenCalled()
  })

  it('requests the microphone once across call, transcript and composer changes', async () => {
    const getUserMedia = vi.fn(() => new Promise(() => {}))
    vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia } })
    await openCall()
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByTestId('lab-call-transcript'))
    fireEvent.change(screen.getByTestId('lab-ask-input'), { target: { value: 'A multiline\nquestion' } })
    fireEvent.click(screen.getByTestId('lab-call-bar-return'))
    await waitFor(() => expect(screen.getByTestId('lab-call')).toBeTruthy())
    expect(getUserMedia).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByTestId('lab-call-end'))
    expect(getUserMedia).toHaveBeenCalledTimes(1)
  })

  describe('the transcript control', () => {
    it('opens the existing chat view with the call still live', async () => {
      await openCall()
      const control = screen.getByTestId('lab-call-transcript')
      expect(control.textContent).toBe('Transcript')
      fireEvent.click(control)

      await waitFor(() => expect(screen.getByTestId('lab-ask-pane')).toBeTruthy())
      // The full surface stands down, but the call has not ended: the compact
      // controls carry its status, mute, and end.
      expect(screen.queryByTestId('lab-call')).toBeNull()
      const bar = screen.getByTestId('lab-call-bar')
      expect(bar).toBeTruthy()
      expect(screen.getByTestId('lab-call-bar-mute')).toBeTruthy()
      expect(screen.getByTestId('lab-call-bar-end')).toBeTruthy()
      expect(screen.getByTestId('lab-call-bar-text').textContent).toBe('Connecting.')
    })

    it('goes back to the full call surface', async () => {
      await openCall()
      fireEvent.click(screen.getByTestId('lab-call-transcript'))
      await waitFor(() => expect(screen.getByTestId('lab-call-bar')).toBeTruthy())
      fireEvent.click(screen.getByTestId('lab-call-bar-return'))
      await waitFor(() => expect(screen.getByTestId('lab-call')).toBeTruthy())
      expect(screen.queryByTestId('lab-call-bar')).toBeNull()
    })
  })

  describe('ending the conversation', () => {
    it('closes the call and returns to the reading page', async () => {
      await openCall()
      fireEvent.click(screen.getByTestId('lab-call-end'))
      await waitFor(() => expect(screen.queryByTestId('lab-call')).toBeNull())
      expect(screen.queryByTestId('lab-call-bar')).toBeNull()
      expect(screen.getByTestId('lab-root')).toBeTruthy()
    })

    it('can be ended from the transcript too', async () => {
      await openCall()
      fireEvent.click(screen.getByTestId('lab-call-transcript'))
      await waitFor(() => expect(screen.getByTestId('lab-call-bar')).toBeTruthy())
      fireEvent.click(screen.getByTestId('lab-call-bar-end'))
      await waitFor(() => expect(screen.queryByTestId('lab-call-bar')).toBeNull())
      expect(screen.queryByTestId('lab-call')).toBeNull()
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
    expect(screen.getByTestId('lab-call-status').textContent).toBe('Connecting.')
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
    <LabApp pathname="/lab/desktop" search={search} source={fallbackLabSource()} authToken={null} />,
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
    expect(screen.getByTestId('lab-voice-panel-status').textContent).toBe('Connecting.')
    expect(screen.queryByTestId('lab-call')).toBeNull()
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    expect(screen.queryByTestId('lab-voice-pill')).toBeNull()
    // Mute and End are in the panel; the transcript is the panel body.
    expect(screen.getByTestId('lab-voice-panel-mute')).toBeTruthy()
    expect(screen.getByTestId('lab-voice-panel-end')).toBeTruthy()
    expect(screen.getByTestId('lab-voice-panel-thread')).toBeTruthy()
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
      expect(screen.getByTestId('lab-voice-pill-status').textContent).toBe('Connecting.')
      expect(screen.getByTestId('lab-root').getAttribute('data-desktop-panel')).toBe('pill')
      expect(screen.getByTestId('lab-root').getAttribute('data-chrome-state')).toBe('talking')
      // Still tinted while minimized.
      expect(document.querySelector('.lab-hearing-line.is-discussed')).toBeTruthy()
    })

    it('restores the panel from the orb, the Transcript button and the expand control', async () => {
      await openDesktopCall()
      for (const control of ['lab-voice-pill-orb', 'lab-voice-pill-transcript', 'lab-voice-pill-expand']) {
        fireEvent.click(screen.getByTestId('lab-voice-panel-minimize'))
        expect(screen.getByTestId('lab-voice-pill')).toBeTruthy()
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

describe('Talk without the Chrome V2 flag', () => {
  it('keeps the chat sheet the unflagged reader ships with', async () => {
    renderPhone('')
    fireEvent.click(screen.getByTestId('lab-phone-talk'))
    await waitFor(() => expect(screen.getByTestId('lab-ask-pane')).toBeTruthy())
    expect(screen.queryByTestId('lab-call')).toBeNull()
    expect(screen.queryByTestId('lab-call-bar')).toBeNull()
  })
})
