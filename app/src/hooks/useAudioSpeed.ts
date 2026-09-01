import { useCallback, useEffect, useRef, useState } from 'react'
import { storage } from '../services/storage'

/**
 * Cross-device-synced audio playback speed. **INVARIANT 5** in CLAUDE.md.
 *
 * Single source of truth — fixes the class of bugs (B12, B14) where speed
 * was held in component-local `useState`, drifted from the DOM `<audio>.playbackRate`,
 * and reset to 1.0 every time the audio element was re-created (chapter
 * change, pause/play). The hook:
 *
 *   - Loads the persisted speed from the storage layer on mount
 *     (Supabase if signed in, localStorage otherwise — the storage
 *     abstraction handles cross-device sync).
 *   - Persists every change.
 *   - Exposes `applyTo(audioEl)` so callers can set the rate on any
 *     `<audio>` element they hold a ref to. This is what gets called on
 *     every audio element creation AND on every `play` event, so the rate
 *     can never drift away from the user's chosen value.
 *
 * The rate is set to a literal value (never incremented) so a buggy event
 * handler can't accumulate speed.
 */
const STORAGE_KEY = 'audio-speed'
const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const
const DEFAULT_SPEED = 1
export const AUDIO_SPEED_CHANGE_EVENT = 'tinct:audio-speed-change'

function notifySpeedChange(speed: number): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<number>(AUDIO_SPEED_CHANGE_EVENT, { detail: speed }))
}

function clampToOption(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SPEED
  // Snap to the nearest valid speed option — protects against any caller
  // that passes a fractional value or a value outside our supported range.
  let nearest: number = DEFAULT_SPEED
  let bestDelta = Infinity
  for (const opt of SPEED_OPTIONS) {
    const d = Math.abs(opt - value)
    if (d < bestDelta) {
      bestDelta = d
      nearest = opt
    }
  }
  return nearest
}

function readPersistedSpeed(): number {
  const raw = storage.get<unknown>(STORAGE_KEY)
  if (typeof raw === 'number') return clampToOption(raw)
  if (raw && typeof raw === 'object' && 'value' in raw) {
    const v = (raw as { value?: unknown }).value
    if (typeof v === 'number') return clampToOption(v)
  }
  return DEFAULT_SPEED
}

export function nextAudioSpeed(current: number): number {
  const normalized = clampToOption(current)
  const idx = SPEED_OPTIONS.indexOf(normalized as typeof SPEED_OPTIONS[number])
  return SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]
}

interface UseAudioSpeedReturn {
  speed: number
  setSpeed: (next: number) => void
  cycleSpeed: () => void
  /** Apply the current speed to a live `<audio>` element. Idempotent — call
   * this on every element creation, on every play event, and after any
   * chapter/source change. */
  applyTo: (audio: HTMLAudioElement | null) => void
}

export function useAudioSpeed(): UseAudioSpeedReturn {
  const [speed, setSpeedState] = useState<number>(() => readPersistedSpeed())
  const speedRef = useRef(speed)
  speedRef.current = speed

  // Re-read on storageReady changes (cloud restore can update the key after
  // initial mount). The storage abstraction's get() falls through to
  // localStorage, so the first render already has a usable value; this just
  // catches the case where cloud has a different choice than local.
  useEffect(() => {
    const persisted = readPersistedSpeed()
    if (persisted !== speedRef.current) {
      setSpeedState(persisted)
    }
    // Run only on mount; storage events handle live updates if needed later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setSpeed = useCallback((next: number) => {
    const clamped = clampToOption(next)
    setSpeedState(clamped)
    storage.set(STORAGE_KEY, clamped)
    notifySpeedChange(clamped)
  }, [])

  const cycleSpeed = useCallback(() => {
    const next = nextAudioSpeed(speedRef.current)
    setSpeedState(next)
    storage.set(STORAGE_KEY, next)
    notifySpeedChange(next)
  }, [])

  const applyTo = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return
    if (audio.playbackRate !== speedRef.current) {
      audio.playbackRate = speedRef.current
    }
  }, [])

  return { speed, setSpeed, cycleSpeed, applyTo }
}

export { SPEED_OPTIONS }
