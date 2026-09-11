// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VOICE_ORB_POINTS, VoiceOrb, drawVoiceOrb, fibonacciSphere, voiceOrbOpacity } from './VoiceOrb'
import { labCallView, type LabCallInput } from './labVoiceCall'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function stubFrames() {
  const frames: FrameRequestCallback[] = []
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
    frames.push(fn)
    return frames.length
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
  return frames
}

function renderOrb(input: Partial<LabCallInput> = {}, props: Record<string, unknown> = {}) {
  const view = labCallView({ connection: 'connected', activity: 'listening', micMuted: false, ...input })
  return render(<VoiceOrb status={view.status} motion={view.motion} size={120} {...props} />)
}

const orb = () => screen.getByTestId('lab-call-circle')

describe('the dotted sphere', () => {
  it('has ~420 evenly spread points on the unit sphere', () => {
    const points = fibonacciSphere(VOICE_ORB_POINTS)
    expect(points.length).toBe(420)
    for (const [x, y, z] of points) {
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 6)
    }
    // Poles at both ends, so nothing bunches on one side.
    expect(points[0][1]).toBe(1)
    expect(points[points.length - 1][1]).toBe(-1)
  })

  it('paints every dot in the given colour, dimmer when muted or dropped', () => {
    expect(voiceOrbOpacity('listening')).toBe(1)
    expect(voiceOrbOpacity('speaking')).toBe(1)
    expect(voiceOrbOpacity('muted')).toBeLessThan(0.5)
    expect(voiceOrbOpacity('disconnected')).toBeLessThan(voiceOrbOpacity('muted'))
  })

  it('draws with plain 2D calls only: arcs, no gradients, no filters', () => {
    const calls: string[] = []
    const ctx = new Proxy({} as CanvasRenderingContext2D, {
      get: (_target, key) => {
        if (key === 'globalAlpha' || key === 'fillStyle') return undefined
        return (...args: unknown[]) => { calls.push(String(key)); return args }
      },
      set: () => true,
    })
    drawVoiceOrb(ctx, { width: 100, height: 100, time: 1, status: 'listening', level: 0, color: '#0b0b0b' })
    expect(calls.filter(name => name === 'arc').length).toBe(VOICE_ORB_POINTS)
    expect(calls).not.toContain('createRadialGradient')
    expect(calls).not.toContain('createLinearGradient')
    expect(calls.some(name => name === 'filter')).toBe(false)
  })

  it('swells only with a real level while speaking', () => {
    const radii: number[] = []
    const ctx = new Proxy({} as CanvasRenderingContext2D, {
      get: (_target, key) => {
        if (key === 'arc') return (_x: number, _y: number, r: number) => { radii.push(r) }
        return () => undefined
      },
      set: () => true,
    })
    drawVoiceOrb(ctx, { width: 100, height: 100, time: 0, status: 'speaking', level: 0, color: '#000' })
    const resting = radii.reduce((sum, r) => sum + r, 0)
    radii.length = 0
    drawVoiceOrb(ctx, { width: 100, height: 100, time: 0, status: 'speaking', level: 1, color: '#000' })
    const loud = radii.reduce((sum, r) => sum + r, 0)
    expect(loud).toBeGreaterThan(resting)
  })
})

describe('the orb states', () => {
  it('maps each call status onto the sphere', () => {
    const expected: Array<[Partial<LabCallInput>, string, string]> = [
      [{ connection: 'connecting' }, 'connecting', 'rotate'],
      [{ activity: 'listening' }, 'listening', 'breathe'],
      [{ activity: 'thinking' }, 'thinking', 'rotate'],
      [{ activity: 'checking' }, 'thinking', 'rotate'],
      [{ activity: 'speaking' }, 'speaking', 'pulse'],
      [{ micMuted: true }, 'muted', 'still'],
      [{ connection: 'disconnected' }, 'disconnected', 'still'],
    ]
    for (const [input, state, motion] of expected) {
      const { unmount } = renderOrb(input)
      expect(orb().getAttribute('data-orb-state')).toBe(state)
      expect(orb().getAttribute('data-motion')).toBe(motion)
      expect(orb().querySelector('canvas')).toBeTruthy()
      unmount()
    }
  })

  it('runs a frame loop while connecting, listening and thinking', () => {
    for (const input of [{ connection: 'connecting' as const }, { activity: 'listening' as const }, { activity: 'thinking' as const }]) {
      const frames = stubFrames()
      const { unmount } = renderOrb(input)
      expect(frames.length).toBe(1)
      frames.shift()?.(16)
      // Each frame schedules the next.
      expect(frames.length).toBe(1)
      unmount()
      vi.unstubAllGlobals()
    }
  })

  it('holds still, with no loop, when muted or dropped', () => {
    for (const input of [{ micMuted: true }, { connection: 'disconnected' as const }]) {
      const frames = stubFrames()
      const { unmount } = renderOrb(input)
      expect(frames.length).toBe(0)
      unmount()
      vi.unstubAllGlobals()
    }
  })

  it('draws one static frame under reduced motion and never reads the level', () => {
    const frames = stubFrames()
    const getAssistantLevel = vi.fn(() => 0.8)
    renderOrb({ activity: 'speaking' }, { motion: 'still', reducedMotion: true, getAssistantLevel })
    expect(frames.length).toBe(0)
    expect(getAssistantLevel).not.toHaveBeenCalled()
  })

  it('follows the real assistant level while speaking', () => {
    const frames = stubFrames()
    renderOrb({ activity: 'speaking' }, { getAssistantLevel: () => 0.6 })
    frames.shift()?.(16)
    expect(orb().dataset.levelSource).toBe('audio')
    expect(Number(orb().style.getPropertyValue('--lab-call-level'))).toBeGreaterThan(0)
    expect(frames.length).toBe(1)
  })

  it('rests at base size, loop stopped, when no level exists', () => {
    const frames = stubFrames()
    renderOrb({ activity: 'speaking' }, { getAssistantLevel: () => null })
    frames.shift()?.(16)
    expect(orb().dataset.levelSource).toBe('unavailable')
    expect(Number(orb().style.getPropertyValue('--lab-call-level'))).toBe(0)
    expect(frames.length).toBe(0)
  })

  it('cancels its loop on unmount', () => {
    const frames = stubFrames()
    const cancel = vi.fn()
    vi.stubGlobal('cancelAnimationFrame', cancel)
    const { unmount } = renderOrb()
    expect(frames.length).toBe(1)
    unmount()
    expect(cancel).toHaveBeenCalled()
  })

  it('takes its own test id so the desktop panel and pill can carry it apart from the phone circle', () => {
    renderOrb({}, { testId: 'lab-voice-panel-orb' })
    expect(screen.getByTestId('lab-voice-panel-orb').getAttribute('data-orb-state')).toBe('listening')
    expect(screen.queryByTestId('lab-call-circle')).toBeNull()
  })
})
