// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabVoiceDesktopPanel, LabVoicePill } from './LabVoiceDesktop.tsx'
import type { LabAskTurn } from './labAsk'
import { labCallView, type LabCallInput } from './labVoiceCall'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const noop = () => {}

const turns: LabAskTurn[] = [
  { id: 'u1', role: 'user', content: 'Why does Odysseus tell the Cyclops his real name at the end?', source: 'voice' },
  { id: 'a1', role: 'assistant', content: 'Pride, mostly. He has just won with the “Nobody” trick.', source: 'voice' },
]

function view(input: Partial<LabCallInput> = {}) {
  return labCallView({ connection: 'connected', activity: 'listening', micMuted: false, ...input })
}

function renderPanel(input: Partial<LabCallInput> = {}, props: Record<string, unknown> = {}) {
  return render(
    <LabVoiceDesktopPanel
      view={view(input)}
      turns={turns}
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
      turns={turns}
      onMuteToggle={noop}
      onEnd={noop}
      onReconnect={noop}
      onExpand={noop}
      {...props}
    />,
  )
}

describe('the desktop panel', () => {
  it('puts the orb on top with the status word and connection beneath', () => {
    renderPanel({ activity: 'speaking' })
    const panel = screen.getByTestId('lab-voice-panel')
    expect(panel.getAttribute('data-status')).toBe('speaking')
    expect(panel.getAttribute('data-connection')).toBe('connected')
    expect(screen.getByTestId('lab-voice-panel-orb').getAttribute('data-orb-state')).toBe('speaking')
    expect(screen.getByTestId('lab-voice-panel-status').textContent).toBe('Speaking.')
    expect(screen.getByTestId('lab-voice-panel-connection').textContent).toContain('Connected')
  })

  it('streams the transcript in the body with You and Tinct labels', () => {
    renderPanel({ activity: 'speaking' })
    const thread = screen.getByTestId('lab-voice-panel-thread')
    expect(thread.textContent).toContain('You')
    expect(thread.textContent).toContain('Tinct')
    expect(thread.textContent).toContain('Why does Odysseus')
    expect(thread.textContent).toContain('Pride, mostly.')
    // The reply she is speaking carries the caret.
    expect(screen.getByTestId('lab-voice-turn-assistant').querySelector('.lab-voice-caret')).toBeTruthy()
  })

  it('has no caret once she is done speaking', () => {
    renderPanel({ activity: 'listening' })
    expect(screen.getByTestId('lab-voice-turn-assistant').querySelector('.lab-voice-caret')).toBeNull()
  })

  it('invites the reader when nothing has been said yet', () => {
    renderPanel({}, { turns: [] })
    expect(screen.getByTestId('lab-voice-panel-empty').textContent).toBe('Ask about this page.')
  })

  it('offers Mute and End at the bottom, and no Transcript button since the transcript is in view', () => {
    const onMuteToggle = vi.fn()
    const onEnd = vi.fn()
    renderPanel({}, { onMuteToggle, onEnd })
    expect(screen.getByTestId('lab-voice-panel-mute').textContent).toBe('Mute')
    expect(screen.getByTestId('lab-voice-panel-end').textContent).toBe('End')
    expect(screen.getByTestId('lab-voice-panel-end').getAttribute('aria-label')).toBe('End conversation')
    expect(screen.queryByTestId('lab-voice-panel-transcript')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-voice-panel-mute'))
    fireEvent.click(screen.getByTestId('lab-voice-panel-end'))
    expect(onMuteToggle).toHaveBeenCalledTimes(1)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('says Unmute while the microphone is closed', () => {
    renderPanel({ micMuted: true })
    expect(screen.getByTestId('lab-voice-panel-status').textContent).toBe('Microphone off')
    expect(screen.getByTestId('lab-voice-panel-mute').textContent).toBe('Unmute')
    expect(screen.getByTestId('lab-voice-panel-mute').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('lab-voice-panel-orb').getAttribute('data-motion')).toBe('still')
  })

  it('replaces Mute with Reconnect on a dropped call', () => {
    const onReconnect = vi.fn()
    renderPanel({ connection: 'disconnected' }, { onReconnect })
    expect(screen.getByTestId('lab-voice-panel-status').textContent).toBe('Disconnected')
    expect(screen.getByTestId('lab-voice-panel-help')).toBeTruthy()
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
  it('carries the small orb, the status word and one line of what she is saying', () => {
    renderPill({ activity: 'speaking' })
    expect(screen.getByTestId('lab-voice-pill').getAttribute('data-status')).toBe('speaking')
    expect(screen.getByTestId('lab-voice-pill-orb-canvas').getAttribute('data-orb-state')).toBe('speaking')
    expect(screen.getByTestId('lab-voice-pill-status').textContent).toBe('Speaking.')
    expect(screen.getByTestId('lab-voice-pill-line').textContent).toBe('Pride, mostly. He has just won with the “Nobody” trick.')
  })

  it('invites the reader while listening and says nothing extra while thinking', () => {
    const listening = renderPill({ activity: 'listening' })
    expect(screen.getByTestId('lab-voice-pill-line').textContent).toBe('Ask about this page.')
    listening.unmount()
    renderPill({ activity: 'thinking' })
    expect(screen.queryByTestId('lab-voice-pill-line')).toBeNull()
  })

  it('restores the panel from the orb, the Transcript button and the expand control', () => {
    const onExpand = vi.fn()
    renderPill({}, { onExpand })
    fireEvent.click(screen.getByTestId('lab-voice-pill-orb'))
    fireEvent.click(screen.getByTestId('lab-voice-pill-transcript'))
    fireEvent.click(screen.getByTestId('lab-voice-pill-expand'))
    expect(onExpand).toHaveBeenCalledTimes(3)
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
