// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabVoiceDesktopPanel, LabVoicePill } from './LabVoiceDesktop.tsx'
import { labCallView, type LabCallInput } from './labVoiceCall'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const noop = () => {}

function view(input: Partial<LabCallInput> = {}) {
  return labCallView({ connection: 'connected', activity: 'listening', micMuted: false, ...input })
}

function renderPanel(input: Partial<LabCallInput> = {}, props: Record<string, unknown> = {}) {
  return render(
    <LabVoiceDesktopPanel
      view={view(input)}
      onMuteToggle={noop}
      onEnd={noop}
      onReconnect={noop}
      onMinimize={noop}
      {...props}
    />,
  )
}

function renderPill(input: Partial<LabCallInput> = {}, props: Record<string, unknown> = {}) {
  return render(
    <LabVoicePill
      view={view(input)}
      onMuteToggle={noop}
      onEnd={noop}
      onReconnect={noop}
      onExpand={noop}
      {...props}
    />,
  )
}

describe('the desktop panel', () => {
  it('holds only the header, the orb, one status line and the controls row', () => {
    renderPanel({ activity: 'speaking' })
    const panel = screen.getByTestId('lab-voice-panel')
    expect(panel.getAttribute('data-status')).toBe('speaking')
    expect(panel.getAttribute('data-connection')).toBe('connected')
    // Header (one-word title + collapse), stage, controls: nothing else.
    expect([...panel.children].map(node => node.hasAttribute('data-reader-window-resize') ? 'resize' : node.className)).toEqual([
      'resize', 'lab-voice-panel-head', 'lab-voice-panel-stage', 'lab-voice-panel-controls',
    ])
    expect(panel.querySelector('.lab-voice-panel-head')?.textContent).toBe('Talk')
    const stage = panel.querySelector('.lab-voice-panel-stage')!
    expect([...stage.children].map(node => node.getAttribute('data-testid'))).toEqual(['lab-voice-panel-orb', 'lab-voice-panel-status'])
    expect(screen.getByTestId('lab-voice-panel-orb').getAttribute('data-orb-state')).toBe('speaking')
    expect(screen.getByTestId('lab-voice-panel-status').textContent).toBe('Speaking.')
  })

  it('announces the status through one aria-live line', () => {
    renderPanel()
    const live = screen.getByTestId('lab-voice-panel').querySelectorAll('[aria-live]')
    expect(live).toHaveLength(1)
    expect(live[0]).toBe(screen.getByTestId('lab-voice-panel-status'))
    expect(live[0].getAttribute('aria-live')).toBe('polite')
  })

  it('says one status line per state, "Connecting to AI…" while connecting', () => {
    for (const [input, text] of [
      [{ connection: 'connecting' as const }, 'Connecting to AI…'],
      [{ activity: 'listening' as const }, 'Listening.'],
      [{ activity: 'speaking' as const }, 'Speaking.'],
      [{ activity: 'thinking' as const }, 'Thinking.'],
      [{ micMuted: true }, 'Microphone off'],
      [{ connection: 'disconnected' as const }, 'Disconnected'],
    ] as const) {
      const { unmount } = renderPanel(input)
      expect(screen.getByTestId('lab-voice-panel-status').textContent).toBe(text)
      expect(screen.getAllByText(text)).toHaveLength(1)
      unmount()
    }
  })

  it('draws no AI line, hint, connection line or transcript', () => {
    for (const input of [{ connection: 'connecting' as const }, { activity: 'listening' as const }, { activity: 'speaking' as const }, { connection: 'disconnected' as const }, { micMuted: true, activity: 'speaking' as const }]) {
      const { unmount } = renderPanel(input)
      const panel = screen.getByTestId('lab-voice-panel')
      expect(panel.textContent).not.toContain("You're talking to an AI.")
      expect(panel.textContent).not.toContain('Ask about this page')
      expect(panel.textContent).not.toContain('Why does Odysseus')
      expect(panel.textContent).not.toContain('Pride, mostly.')
      expect(panel.textContent).not.toMatch(/◦|•|Connected|Not connected/)
      for (const id of ['lab-voice-panel-ai', 'lab-voice-panel-empty', 'lab-voice-panel-thread', 'lab-voice-panel-connection', 'lab-voice-panel-micoff', 'lab-voice-panel-help']) {
        expect(screen.queryByTestId(id)).toBeNull()
      }
      expect(panel.querySelector('.lab-voice-turn, .lab-voice-caret')).toBeNull()
      unmount()
    }
  })

  it('still shows a failure the reader must act on', () => {
    renderPanel({ connection: 'disconnected' }, { notice: 'Sign in to talk.' })
    expect(screen.getByTestId('lab-voice-panel-notice').textContent).toBe('Sign in to talk.')
  })

  it('offers Mute and End at the bottom, and no Transcript button since the transcript is in view', () => {
    const onMuteToggle = vi.fn()
    const onEnd = vi.fn()
    renderPanel({}, { onMuteToggle, onEnd })
    // Icons only: no visible caption, but screen readers and tooltips name both.
    const mute = screen.getByTestId('lab-voice-panel-mute')
    const end = screen.getByTestId('lab-voice-panel-end')
    expect(mute.textContent).toBe('')
    expect(end.textContent).toBe('')
    expect(mute.querySelector('.lab-voice-control-word')).toBeNull()
    expect(end.querySelector('.lab-voice-control-word')).toBeNull()
    expect(mute.getAttribute('aria-label')).toBe('Mute')
    expect(mute.getAttribute('title')).toBe('Mute')
    expect(end.getAttribute('aria-label')).toBe('End conversation')
    expect(end.getAttribute('title')).toBe('End conversation')
    expect(screen.queryByTestId('lab-voice-panel-transcript')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-voice-panel-mute'))
    fireEvent.click(screen.getByTestId('lab-voice-panel-end'))
    expect(onMuteToggle).toHaveBeenCalledTimes(1)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('says Unmute while the microphone is closed', () => {
    renderPanel({ micMuted: true })
    expect(screen.getByTestId('lab-voice-panel-status').textContent).toBe('Microphone off')
    expect(screen.getByTestId('lab-voice-panel-mute').getAttribute('aria-label')).toBe('Unmute')
    expect(screen.getByTestId('lab-voice-panel-mute').getAttribute('title')).toBe('Unmute')
    expect(screen.getByTestId('lab-voice-panel-mute').textContent).toBe('')
    expect(screen.getByTestId('lab-voice-panel-mute').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('lab-voice-panel-orb').getAttribute('data-motion')).toBe('still')
  })

  it('replaces Mute with Reconnect on a dropped call', () => {
    const onReconnect = vi.fn()
    renderPanel({ connection: 'disconnected' }, { onReconnect })
    expect(screen.getByTestId('lab-voice-panel-status').textContent).toBe('Disconnected')
    expect(screen.queryByTestId('lab-voice-panel-mute')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-voice-panel-reconnect'))
    expect(onReconnect).toHaveBeenCalledTimes(1)
  })

  it('minimizes from the control at the top right', () => {
    const onMinimize = vi.fn()
    renderPanel({}, { onMinimize })
    fireEvent.click(screen.getByTestId('lab-voice-panel-minimize'))
    expect(onMinimize).toHaveBeenCalledTimes(1)
  })

  it('holds the orb still under reduced motion', () => {
    renderPanel({ activity: 'listening' }, { reducedMotion: true })
    expect(screen.getByTestId('lab-voice-panel-orb').getAttribute('data-motion')).toBe('still')
  })
})

describe('the pill', () => {
  it('carries the small orb and the status word, and no caption', () => {
    renderPill({ activity: 'speaking' })
    expect(screen.getByTestId('lab-voice-pill').getAttribute('data-status')).toBe('speaking')
    expect(screen.getByTestId('lab-voice-pill-orb-canvas').getAttribute('data-orb-state')).toBe('speaking')
    expect(screen.getByTestId('lab-voice-pill-status').textContent).toBe('Speaking.')
    expect(screen.queryByTestId('lab-voice-pill-line')).toBeNull()
    cleanup()
    renderPill({ activity: 'listening' })
    expect(screen.queryByTestId('lab-voice-pill-line')).toBeNull()
    expect(screen.queryByText('Ask about this page.')).toBeNull()
  })

  it('restores the panel from the orb and expand control, without transcript mode', () => {
    const onExpand = vi.fn()
    renderPill({}, { onExpand })
    fireEvent.click(screen.getByTestId('lab-voice-pill-orb'))
    fireEvent.click(screen.getByTestId('lab-voice-pill-expand'))
    expect(onExpand).toHaveBeenCalledTimes(2)
    expect(screen.queryByTestId('lab-voice-pill-transcript')).toBeNull()
  })

  it('mutes and ends without leaving the pill', () => {
    const onMuteToggle = vi.fn()
    const onEnd = vi.fn()
    const onExpand = vi.fn()
    renderPill({}, { onMuteToggle, onEnd, onExpand })
    fireEvent.click(screen.getByTestId('lab-voice-pill-mute'))
    fireEvent.click(screen.getByTestId('lab-voice-pill-end'))
    expect(onMuteToggle).toHaveBeenCalledTimes(1)
    expect(onEnd).toHaveBeenCalledTimes(1)
    expect(onExpand).not.toHaveBeenCalled()
    // Icon-only controls still name themselves.
    expect(screen.getByTestId('lab-voice-pill-mute').getAttribute('aria-label')).toBe('Mute')
    expect(screen.getByTestId('lab-voice-pill-end').getAttribute('aria-label')).toBe('End conversation')
  })

  it('offers Reconnect on a dropped call and never claims to listen', () => {
    renderPill({ connection: 'disconnected', activity: 'listening' })
    expect(screen.getByTestId('lab-voice-pill-status').textContent).toBe('Disconnected')
    expect(screen.queryByText('Listening.')).toBeNull()
    expect(screen.getByTestId('lab-voice-pill-reconnect')).toBeTruthy()
    expect(screen.queryByTestId('lab-voice-pill-mute')).toBeNull()
  })
})

describe('Talk speed in the desktop Talk window', () => {
  it('sits in the controls row between Mute and End and offers the four steps', () => {
    const onTalkSpeedChange = vi.fn()
    renderPanel({}, { talkSpeed: 1.25, onTalkSpeedChange })
    const row = screen.getByTestId('lab-voice-panel-end').parentElement!
    expect([...row.querySelectorAll('[data-testid]')].map(node => node.getAttribute('data-testid')).filter(id => !id!.startsWith('lab-voice-panel-speed-')))
      .toEqual(['lab-voice-panel-mute', 'lab-voice-panel-speed', 'lab-voice-panel-end'])
    const control = screen.getByTestId('lab-voice-panel-speed')
    expect(control.textContent).toContain('1.25×')
    // The speed is information, so unlike Mute and End it keeps its visible value.
    expect(control.querySelector('.lab-voice-control-word')?.textContent).toBe('1.25×')
    fireEvent.click(control)
    expect(control.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByTestId('lab-voice-panel-speed-1.25').getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByTestId('lab-voice-panel-speed-0.8'))
    expect(onTalkSpeedChange).toHaveBeenCalledWith(0.8)
    expect(screen.queryByTestId('lab-voice-panel-speed-popover')).toBeNull()
  })

  it('stays out of a panel whose host keeps no speed', () => {
    renderPanel()
    expect(screen.queryByTestId('lab-voice-panel-speed')).toBeNull()
  })
})
