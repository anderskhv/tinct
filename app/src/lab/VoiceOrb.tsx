import { useEffect, useRef } from 'react'
import type { LabCallMotion, LabCallStatus } from './labVoiceCall'

/**
 * The voice orb: a dotted sphere on a plain 2D canvas.
 *
 * ~420 points on a Fibonacci sphere, orthographic projection, a slow turn
 * about a tilted axis. Dot size and opacity follow depth. Monochrome: the
 * canvas draws in its own CSS `color`, so the theme decides ink or bone.
 * No WebGL, no blur, no gradients.
 *
 * Four moving states, mapped from the call view: connecting fades patches of
 * dots in and out, listening rolls a wave down the sphere, thinking spins
 * faster with a wobbling tilt and flickering dots, speaking swells with the
 * assistant's real loudness from `getAssistantLevel`. With no level the
 * sphere rests at base size: it never runs a timed pulse that would only
 * look like speech. Muted and disconnected hold a still, fainter sphere.
 *
 * The animation loop is owned here and cancelled on unmount. Under reduced
 * motion one static frame is drawn and no loop runs.
 */

export const VOICE_ORB_POINTS = 420

export type VoiceOrbState = LabCallStatus

interface VoiceOrbProps {
  status: LabCallStatus
  /** Already resolved for reduced motion by the caller (`still`). */
  motion: LabCallMotion
  /** Real assistant loudness, 0-1, or null when the audio path exposes none. */
  getAssistantLevel?: () => number | null
  reducedMotion?: boolean
  /** CSS size in px; the backing store follows devicePixelRatio. */
  size: number
  /** Overrides the computed CSS colour. */
  color?: string
  testId?: string
  className?: string
  broken?: boolean
}

type Point = readonly [number, number, number]

let spherePoints: Point[] | null = null

/** Evenly spread points on the unit sphere (golden-angle spiral). */
export function fibonacciSphere(count: number): Point[] {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const points: Point[] = []
  for (let index = 0; index < count; index += 1) {
    const y = 1 - (index / (count - 1)) * 2
    const radius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * index
    points.push([Math.cos(theta) * radius, y, Math.sin(theta) * radius])
  }
  return points
}

function sphere(): Point[] {
  if (!spherePoints) spherePoints = fibonacciSphere(VOICE_ORB_POINTS)
  return spherePoints
}

export interface VoiceOrbFrame {
  width: number
  height: number
  /** Seconds since the orb appeared. */
  time: number
  status: LabCallStatus
  /** Smoothed assistant level, 0-1; only read while speaking. */
  level: number
  color: string
}

/** Per-state opacity of the whole sphere. Muted and dropped calls hold still and step back. */
export function voiceOrbOpacity(status: LabCallStatus): number {
  if (status === 'muted') return 0.45
  if (status === 'disconnected') return 0.28
  return 1
}

/** Draw one frame. Pure apart from the canvas it paints. Exported for tests. */
export function drawVoiceOrb(ctx: CanvasRenderingContext2D, frame: VoiceOrbFrame): void {
  const { width, height, time, status, level, color } = frame
  ctx.clearRect(0, 0, width, height)
  const cx = width / 2
  const cy = height / 2
  let radius = Math.min(width, height) * 0.38
  const swell = status === 'speaking' ? level : 0
  if (swell > 0) radius *= 1 + swell * 0.14
  const rotation = time * (status === 'thinking' ? 0.9 : 0.22)
  const tilt = status === 'thinking' ? 0.55 + 0.2 * Math.sin(time) : 0.35
  const cosR = Math.cos(rotation)
  const sinR = Math.sin(rotation)
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)
  const dim = voiceOrbOpacity(status)
  ctx.fillStyle = color
  const base = 1.35
  for (const [x0, y0, z0] of sphere()) {
    let scale = 1
    if (status === 'listening') scale = 1 + 0.07 * Math.sin(y0 * 6 - time * 3.2)
    else if (status === 'connecting') scale = 1 + 0.03 * Math.sin(time * 2 + x0 * 4)
    const x = x0 * scale
    const y = y0 * scale
    const z = z0 * scale
    const x1 = x * cosR + z * sinR
    const z1 = -x * sinR + z * cosR
    const y2 = y * cosT - z1 * sinT
    const z2 = y * sinT + z1 * cosT
    const px = cx + x1 * radius
    const py = cy + y2 * radius
    const depth = z2 * 0.5 + 0.5
    let alpha = 0.18 + depth * 0.82
    if (status === 'thinking') alpha *= 0.55 + 0.45 * Math.sin(time * 4 + px * 0.05)
    else if (status === 'connecting') {
      alpha *= Math.min(1, Math.max(0.15, (Math.sin(time * 1.4 + px * 0.02 + py * 0.03) + 1) / 1.6))
    }
    ctx.globalAlpha = Math.min(1, alpha) * dim
    const dot = base * (0.55 + depth * 0.9) * (1 + swell * 0.3)
    ctx.beginPath()
    ctx.arc(px, py, dot, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

let canvasSupport: boolean | null = null

/** jsdom has no 2D context; probe once so the surface still renders its DOM there. */
function acquireContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  if (canvasSupport === false) return null
  let ctx: CanvasRenderingContext2D | null = null
  try {
    ctx = canvas.getContext('2d')
  } catch {
    ctx = null
  }
  canvasSupport = ctx != null
  return ctx
}

function readColor(canvas: HTMLCanvasElement, override?: string): string {
  if (override) return override
  if (typeof getComputedStyle !== 'function') return '#0b0b0b'
  const computed = getComputedStyle(canvas).color
  return computed && computed !== 'transparent' ? computed : '#0b0b0b'
}

export function VoiceOrb({
  status,
  motion,
  getAssistantLevel,
  reducedMotion = false,
  size,
  color,
  testId = 'lab-call-circle',
  className,
  broken = false,
}: VoiceOrbProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = acquireContext(canvas)
    const dpr = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1
    let currentColor = readColor(canvas, color)

    const paint = (time: number, level: number) => {
      if (!ctx) return
      const width = size
      const height = size
      const backing = Math.round(width * dpr)
      if (canvas.width !== backing || canvas.height !== Math.round(height * dpr)) {
        canvas.width = backing
        canvas.height = Math.round(height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawVoiceOrb(ctx, { width, height, time, status, level, color: currentColor })
    }

    const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())
    if (startRef.current == null) startRef.current = now()
    const elapsed = (stamp?: number) => ((stamp ?? now()) - (startRef.current ?? 0)) / 1000

    wrap.style.setProperty('--lab-call-level', '0')

    // A still sphere: muted, dropped, or every state under reduced motion.
    // One frame, no loop, and the assistant level is never read.
    if (motion === 'still' || reducedMotion) {
      paint(reducedMotion ? 0 : elapsed(), 0)
      return
    }

    let frame = 0
    let stopped = false
    let smoothed = 0
    let ticks = 0
    const tick = (stamp: number) => {
      if (stopped) return
      ticks += 1
      if (ticks % 30 === 0) currentColor = readColor(canvas, color)
      if (motion === 'pulse') {
        const level = getAssistantLevel ? getAssistantLevel() : null
        if (level == null) {
          // No loudness to follow: rest at base size and stop, rather than
          // running an animation that would only look like speech.
          wrap.dataset.levelSource = 'unavailable'
          wrap.style.setProperty('--lab-call-level', '0')
          paint(elapsed(stamp), 0)
          return
        }
        wrap.dataset.levelSource = 'audio'
        smoothed = smoothed + (level - smoothed) * 0.35
        wrap.style.setProperty('--lab-call-level', smoothed.toFixed(3))
        paint(elapsed(stamp), smoothed)
      } else {
        paint(elapsed(stamp), 0)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      wrap.style.setProperty('--lab-call-level', '0')
    }
  }, [color, getAssistantLevel, motion, reducedMotion, size, status])

  return (
    <div
      ref={wrapRef}
      className={`lab-voice-orb is-${status} motion-${motion}${className ? ` ${className}` : ''}`}
      data-testid={testId}
      data-status={status}
      data-orb-state={status}
      data-motion={motion}
      data-broken={broken ? 'true' : 'false'}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="lab-voice-orb-canvas" style={{ width: size, height: size }} />
    </div>
  )
}
