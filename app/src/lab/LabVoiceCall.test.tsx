// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabVoiceCall, LabVoiceCallBar } from './LabVoiceCall'
import { labCallView, type LabCallInput } from './labVoiceCall'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const noop = () => {}

function renderCall(input: Partial<LabCallInput> = {}, props: Record<string, unknown> = {}) {
  const view = labCallView({
    connection: 'connected',
    activity: 'listening',
    micMuted: false,
    ...input,
  })
  return render(
    <LabVoiceCall
      view={view}
      onMuteToggle={noop}
      onTranscript={noop}
      onEnd={noop}
      onReconnect={noop}
      {...props}
    />,
  )
}

const circle = () => screen.getByTestId('lab-call-circle')

describe('the call surface', () => {
  it('breathes and says Listening once the microphone is live', () => {
    renderCall()
    expect(screen.getByTestId('lab-call-status').textContent).toBe('Listening.')
    expect(circle().getAttribute('data-motion')).toBe('breathe')
    expect(circle().getAttribute('data-broken')).toBe('false')
  })

  it('turns a broken ring and says Thinking', () => {
    renderCall({ activity: 'thinking' })
    expect(screen.getByTestId('lab-call-status').textContent).toBe('Thinking.')
    expect(circle().getAttribute('data-motion')).toBe('rotate')
    expect(circle().getAttribute('data-broken')).toBe('true')
  })

  it('shows the connection apart from the activity', () => {
    renderCall({ activity: 'speaking' })
    expect(screen.getByTestId('lab-call-status').textContent).toBe('Speaking.')
    expect(screen.getByTestId('lab-call-connection').textContent).toContain('Connected')
  })

  describe('mute', () => {
    it('says the microphone is off and stays connected', () => {
      renderCall({ micMuted: true })
      expect(screen.getByTestId('lab-call-status').textContent).toBe('Microphone off')
      expect(screen.getByTestId('lab-call-connection').textContent).toContain('Connected')
      expect(screen.getByTestId('lab-call-mute').textContent).toBe('Unmute')
      expect(screen.getByTestId('lab-call-mute').getAttribute('aria-pressed')).toBe('true')
    })

    it('keeps the closed microphone visible while the assistant speaks', () => {
      renderCall({ micMuted: true, activity: 'speaking' })
      expect(screen.getByTestId('lab-call-status').textContent).toBe('Speaking.')
      expect(screen.getByTestId('lab-call-micoff').textContent).toBe('Microphone off')
    })

    it("toggles on the reader tap", () => {
      const onMuteToggle = vi.fn()
      renderCall({}, { onMuteToggle })
      fireEvent.click(screen.getByTestId('lab-call-mute'))
      expect(onMuteToggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('a dropped call', () => {
    it('is unmistakable, motionless, and never says Listening', () => {
      renderCall({ connection: 'disconnected', activity: 'listening' })
      expect(screen.getByTestId('lab-call-status').textContent).toBe('Disconnected')
      expect(screen.queryByText('Listening.')).toBeNull()
      expect(circle().getAttribute('data-motion')).toBe('still')
      expect(circle().getAttribute('data-broken')).toBe('true')
      expect(screen.getByTestId('lab-call-help')).toBeTruthy()
      expect(screen.getByTestId('lab-call').getAttribute('data-connection')).toBe('lost')
    })

    it('offers Reconnect in place of Mute', () => {
      const onReconnect = vi.fn()
      renderCall({ connection: 'disconnected' }, { onReconnect })
      expect(screen.queryByTestId('lab-call-mute')).toBeNull()
      fireEvent.click(screen.getByTestId('lab-call-reconnect'))
      expect(onReconnect).toHaveBeenCalledTimes(1)
    })
  })

  describe('the transcript control', () => {
    it('is labelled exactly as specified', () => {
      renderCall()
      expect(screen.getByTestId('lab-call-transcript').textContent).toBe('See transcript in real time.')
    })

    it('opens the transcript without ending the call', () => {
      const onTranscript = vi.fn()
      const onEnd = vi.fn()
      renderCall({}, { onTranscript, onEnd })
      fireEvent.click(screen.getByTestId('lab-call-transcript'))
      expect(onTranscript).toHaveBeenCalledTimes(1)
      expect(onEnd).not.toHaveBeenCalled()
    })
  })

  it('offers an obvious End conversation control in every state', () => {
    for (const input of [
      {},
      { micMuted: true },
      { activity: 'speaking' as const },
      { connection: 'connecting' as const },
      { connection: 'disconnected' as const },
    ]) {
      const onEnd = vi.fn()
      const { unmount } = renderCall(input, { onEnd })
      expect(screen.getByTestId('lab-call-end').textContent).toBe('End conversation')
      fireEvent.click(screen.getByTestId('lab-call-end'))
      expect(onEnd).toHaveBeenCalledTimes(1)
      unmount()
    }
  })

  describe('reduced motion', () => {
    it('holds every state still', () => {
      for (const input of [
        { activity: 'listening' as const },
        { activity: 'thinking' as const },
        { activity: 'speaking' as const },
        { connection: 'connecting' as const },
      ]) {
        const { unmount } = renderCall(input, { reducedMotion: true })
        expect(circle().getAttribute('data-motion')).toBe('still')
        unmount()
      }
    })

    it('still says exactly what is happening', () => {
      renderCall({ activity: 'speaking' }, { reducedMotion: true })
      expect(screen.getByTestId('lab-call-status').textContent).toBe('Speaking.')
    })

    it("never reads the assistant level", () => {
      const getAssistantLevel = vi.fn(() => 0.5)
      renderCall({ activity: 'speaking' }, { reducedMotion: true, getAssistantLevel })
      expect(getAssistantLevel).not.toHaveBeenCalled()
    })
  })

  describe('the speaking circle', () => {
    it('follows the assistant own loudness', () => {
      const frames: FrameRequestCallback[] = []
      vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
        frames.push(fn)
        return frames.length
      })
      vi.stubGlobal('cancelAnimationFrame', () => {})
      renderCall({ activity: 'speaking' }, { getAssistantLevel: () => 1 })
      expect(frames.length).toBeGreaterThan(0)
      frames.shift()?.(0)
      expect(circle().dataset.levelSource).toBe('audio')
      expect(Number(circle().style.getPropertyValue('--lab-call-level'))).toBeGreaterThan(0)
    })

    it('rests rather than faking a pulse when no level exists', () => {
      const frames: FrameRequestCallback[] = []
      vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
        frames.push(fn)
        return frames.length
      })
      vi.stubGlobal('cancelAnimationFrame', () => {})
      renderCall({ activity: 'speaking' }, { getAssistantLevel: () => null })
      frames.shift()?.(0)
      expect(circle().dataset.levelSource).toBe('unavailable')
      expect(Number(circle().style.getPropertyValue('--lab-call-level'))).toBe(0)
      // Nothing further is scheduled: the circle holds still rather than
      // running an animation that would only look like speech.
      expect(frames.length).toBe(0)
    })
  })
})

describe('the compact controls over the transcript', () => {
  function renderBar(input: Partial<LabCallInput> = {}, props: Record<string, unknown> = {}) {
    const view = labCallView({
      connection: 'connected',
      activity: 'listening',
      micMuted: false,
      ...input,
    })
    return render(
      <LabVoiceCallBar view={view} onMuteToggle={noop} onEnd={noop} onReturn={noop} {...props} />,
    )
  }

  it('carries the same status and connection the full surface shows', () => {
    renderBar({ activity: 'speaking' })
    expect(screen.getByTestId('lab-call-bar-text').textContent).toBe('Speaking.')
    expect(screen.getByTestId('lab-call-bar-connection').textContent).toBe('Connected')
  })

  it('never claims a dropped call is listening', () => {
    renderBar({ connection: 'disconnected', activity: 'listening' })
    expect(screen.getByTestId('lab-call-bar-text').textContent).toBe('Disconnected')
    expect(screen.getByTestId('lab-call-bar-connection').textContent).toBe('Not connected')
  })

  it('mutes, ends, and goes back to the full surface', () => {
    const onMuteToggle = vi.fn()
    const onEnd = vi.fn()
    const onReturn = vi.fn()
    renderBar({}, { onMuteToggle, onEnd, onReturn })
    fireEvent.click(screen.getByTestId('lab-call-bar-mute'))
    fireEvent.click(screen.getByTestId('lab-call-bar-end'))
    fireEvent.click(screen.getByTestId('lab-call-bar-return'))
    expect(onMuteToggle).toHaveBeenCalledTimes(1)
    expect(onEnd).toHaveBeenCalledTimes(1)
    expect(onReturn).toHaveBeenCalledTimes(1)
  })
})
