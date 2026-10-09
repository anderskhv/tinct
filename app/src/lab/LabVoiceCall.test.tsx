// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabVoiceCall } from './LabVoiceCall.tsx'
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
      onEnd={noop}
      onReconnect={noop}
      {...props}
    />,
  )
}

const circle = () => screen.getByTestId('lab-call-circle')

describe('the call surface', () => {
  it('holds only the orb, one status line and the controls', () => {
    renderCall()
    const call = screen.getByTestId('lab-call')
    expect([...call.children].map(node => node.className)).toEqual(['lab-call-stage', 'lab-call-controls'])
    const stage = call.querySelector('.lab-call-stage')!
    expect(stage.firstElementChild).toBe(circle())
    expect(stage.querySelector('.lab-call-words')?.children).toHaveLength(1)
    expect(stage.querySelector('.lab-call-words')?.firstElementChild).toBe(screen.getByTestId('lab-call-status'))
  })

  it('announces the status through one aria-live line', () => {
    renderCall()
    const live = screen.getByTestId('lab-call').querySelectorAll('[aria-live]')
    expect(live).toHaveLength(1)
    expect(live[0]).toBe(screen.getByTestId('lab-call-status'))
    expect(live[0].getAttribute('aria-live')).toBe('polite')
  })

  it('says "Connecting to AI…" while connecting, once, with no second connecting line', () => {
    for (const activity of ['listening', 'speaking'] as const) {
      const { unmount } = renderCall({ connection: 'connecting', activity })
      expect(screen.getByTestId('lab-call-status').textContent).toBe('Connecting to AI…')
      expect(screen.getByTestId('lab-call').textContent).not.toMatch(/Connecting(?! to AI…)/)
      expect(screen.queryByTestId('lab-call-connection')).toBeNull()
      unmount()
    }
  })

  it('draws no AI line, book line, caption, hint or transcript', () => {
    for (const input of [{ connection: 'connecting' as const }, {}, { activity: 'speaking' as const }, { connection: 'disconnected' as const }, { micMuted: true, activity: 'speaking' as const }]) {
      const { unmount } = renderCall(input)
      const call = screen.getByTestId('lab-call')
      expect(call.textContent).not.toContain("You're talking to an AI.")
      expect(call.textContent).not.toContain('Ask about this page')
      expect(call.textContent).not.toMatch(/Connected|Not connected/)
      for (const id of ['lab-call-ai', 'lab-call-book', 'lab-call-connection', 'lab-call-caption', 'lab-call-micoff', 'lab-call-help']) {
        expect(screen.queryByTestId(id)).toBeNull()
      }
      unmount()
    }
  })

  it('still shows a failure the reader must act on', () => {
    renderCall({ connection: 'disconnected' }, { notice: 'Sign in to talk.' })
    expect(screen.getByTestId('lab-call-notice').textContent).toBe('Sign in to talk.')
  })

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

  it('says Speaking while she speaks', () => {
    renderCall({ activity: 'speaking' })
    expect(screen.getByTestId('lab-call-status').textContent).toBe('Speaking.')
    expect(screen.getByTestId('lab-call').getAttribute('data-connection')).toBe('connected')
  })

  describe('mute', () => {
    it('says the microphone is off and stays connected', () => {
      renderCall({ micMuted: true })
      expect(screen.getByTestId('lab-call-status').textContent).toBe('Microphone off')
      expect(screen.getByTestId('lab-call').getAttribute('data-connection')).toBe('connected')
      expect(screen.getByTestId('lab-call-mute').getAttribute('aria-label')).toBe('Unmute')
      expect(screen.getByTestId('lab-call-mute').textContent).toBe('')
      expect(screen.getByTestId('lab-call-mute').getAttribute('aria-pressed')).toBe('true')
    })

    it('keeps the closed microphone visible on Mute while the assistant speaks', () => {
      renderCall({ micMuted: true, activity: 'speaking' })
      expect(screen.getByTestId('lab-call-status').textContent).toBe('Speaking.')
      expect(screen.getByTestId('lab-call-mute').getAttribute('aria-pressed')).toBe('true')
      expect(screen.getByTestId('lab-call-mute').getAttribute('aria-label')).toBe('Unmute')
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

  it('keeps the call focused with no transcript-mode control', () => {
    renderCall()
    expect(screen.queryByTestId('lab-call-transcript')).toBeNull()
    expect(screen.getByTestId('lab-call-mute')).toBeTruthy()
    expect(screen.getByTestId('lab-call-end')).toBeTruthy()
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
      // The word beneath the filled X is "End"; the full action is its name.
      expect(screen.getByTestId('lab-call-end').textContent).toBe('')
      expect(screen.getByTestId('lab-call-end').getAttribute('title')).toBe('End conversation')
      expect(screen.getByTestId('lab-call-end').getAttribute('aria-label')).toBe('End conversation')
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
