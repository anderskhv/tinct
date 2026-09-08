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

  describe('the transcript control', () => {
    it('opens the existing chat view with the call still live', async () => {
      await openCall()
      const control = screen.getByTestId('lab-call-transcript')
      expect(control.textContent).toBe('See transcript in real time.')
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

describe('Talk without the Chrome V2 flag', () => {
  it('keeps the chat sheet the unflagged reader ships with', async () => {
    renderPhone('')
    fireEvent.click(screen.getByTestId('lab-phone-talk'))
    await waitFor(() => expect(screen.getByTestId('lab-ask-pane')).toBeTruthy())
    expect(screen.queryByTestId('lab-call')).toBeNull()
    expect(screen.queryByTestId('lab-call-bar')).toBeNull()
  })
})
