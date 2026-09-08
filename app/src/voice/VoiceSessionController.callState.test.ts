// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { VoiceSessionController, type VoiceUiSnapshot } from './VoiceSessionController'

/**
 * The call surface is only as honest as what the session reports. These drive
 * the controller from mocked connection, microphone and assistant events and
 * assert the two facts the surface depends on: transport state that is kept
 * apart from activity, and a mute that the engine's own microphone handling
 * cannot undo.
 */

function harness() {
  const snapshots: VoiceUiSnapshot[] = []
  const controller = new VoiceSessionController({
    onSnapshot: snapshot => { snapshots.push(snapshot) },
    onTurn: () => {},
  })
  const track = { enabled: true, kind: 'audio' }
  controller.testPrimeSession({
    audio: { pausePlayback: () => null, resumePlayback: () => {} },
    honorModelResume: true,
    send: () => {},
    audioTracks: [track],
    voiceVersion: 'v2',
  })
  const last = () => snapshots[snapshots.length - 1]
  return { controller, snapshots, track, last }
}

describe('the session snapshot', () => {
  it('reports a live session as connected, with the microphone open', () => {
    const { controller, track } = harness()
    const snapshot = controller.getSnapshot()
    expect(snapshot.connection).toBe('connected')
    expect(snapshot.micMuted).toBe(false)
    expect(track.enabled).toBe(true)
  })

  it('closes the microphone on mute and says so, without leaving the call', () => {
    const { controller, track, last } = harness()
    controller.setMicMuted(true)
    expect(track.enabled).toBe(false)
    expect(last().micMuted).toBe(true)
    // Muting is a microphone change, not a transport change.
    expect(last().connection).toBe('connected')
    expect(last().isActive).toBe(true)
  })

  it('does not let the engine reopen a microphone the reader closed', async () => {
    vi.useFakeTimers()
    try {
      const { controller, track } = harness()
      controller.setMicMuted(true)
      // The assistant speaks and finishes: the engine's own barge-in settle
      // arms an unmute a moment later.
      await controller.testRealtime({ type: 'output_audio_buffer.started' })
      await controller.testRealtime({ type: 'output_audio_buffer.stopped' })
      vi.advanceTimersByTime(5000)
      expect(track.enabled).toBe(false)
      controller.setMicMuted(false)
      expect(track.enabled).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('reports a lost data channel as disconnected', () => {
    const { controller, last } = harness()
    controller.testDataChannelClosed()
    expect(last().connection).toBe('disconnected')
    expect(last().isActive).toBe(false)
    expect(last().error).toBe('Connection lost.')
  })

  it('reports the reader ending the call as no connection at all', () => {
    const { controller, last } = harness()
    controller.setMicMuted(true)
    controller.stop()
    expect(last().connection).toBe('idle')
    expect(last().micMuted).toBe(false)
  })

  it('has no assistant level until an assistant track has been tapped', () => {
    const { controller } = harness()
    // The caller must be able to tell "no level" from "silence"; a session
    // with no analyser reports null, never 0.
    expect(controller.getAssistantLevel()).toBeNull()
  })
})
