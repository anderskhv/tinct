import { useCallback, useEffect, useState } from 'react'
import { storage } from '../services/storage'

/**
 * The reader's reading angle for one book: what they want to notice, set
 * before or while reading and always optional (free for everyone). One value
 * per book, on this device (`reading-angle:{bookId}`, the key the legacy
 * reader used), read by every AI request for that book and edited in AI
 * settings' This book tab and the desktop's "Before you start" card. Never another book's
 * angle: a book with none sends none. Signed in, the angles also go with the
 * account (labAiAccount.ts), so a book's angle applies on every device.
 */
export const READING_ANGLE_MAX_CHARS = 240
const KEY = (bookId: string) => `reading-angle:${bookId}`
const EVENT = 'tinct:reading-angle'
export const READING_ANGLE_EVENT = EVENT
const KEY_PREFIX = 'tinct:reading-angle:'
/** When this device's angles last changed (labAiAccount.ts: the newer side wins). */
const CHANGED_AT_KEY = 'reading-angles-at'

export function readReadingAngle(bookId: string | null | undefined): string {
  if (!bookId) return ''
  const value = storage.get<unknown>(KEY(bookId))
  return typeof value === 'string' ? value.slice(0, READING_ANGLE_MAX_CHARS) : ''
}

export function writeReadingAngle(bookId: string, angle: string, at = Date.now()): void {
  const value = angle.slice(0, READING_ANGLE_MAX_CHARS)
  if (value.trim()) storage.set(KEY(bookId), value)
  else storage.delete(KEY(bookId))
  storage.set(CHANGED_AT_KEY, at)
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVENT, { detail: { bookId } }))
}

export function readingAnglesChangedAt(): number {
  const at = storage.get<unknown>(CHANGED_AT_KEY)
  return typeof at === 'number' && Number.isFinite(at) ? at : 0
}

/** Every book's angle on this device. */
export function localReadingAngles(): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (!key?.startsWith(KEY_PREFIX)) continue
      const bookId = key.slice(KEY_PREFIX.length)
      const angle = readReadingAngle(bookId)
      if (angle.trim()) out[bookId] = angle
    }
  } catch { /* storage unavailable: none */ }
  return out
}

/** The account's angles replace this device's (they changed later elsewhere), keeping the account's time. */
export function applyAccountReadingAngles(angles: Record<string, string>, at: number): void {
  for (const bookId of Object.keys(localReadingAngles())) if (!(bookId in angles)) writeReadingAngle(bookId, '', at)
  for (const [bookId, angle] of Object.entries(angles)) if (readReadingAngle(bookId) !== angle.slice(0, READING_ANGLE_MAX_CHARS)) writeReadingAngle(bookId, angle, at)
  storage.set(CHANGED_AT_KEY, at)
}

/** The angle the AI is given: trimmed, or nothing. */
export function readingAngleForAi(bookId: string | null | undefined): string | undefined {
  return readReadingAngle(bookId).trim() || undefined
}

/** One book's angle, kept in step wherever it is edited on this page. */
export function useReadingAngle(bookId: string | null | undefined): [string, (angle: string) => void] {
  const [angle, setAngle] = useState(() => readReadingAngle(bookId))
  useEffect(() => {
    setAngle(readReadingAngle(bookId))
    if (typeof window === 'undefined') return
    const sync = (event: Event) => { if ((event as CustomEvent<{ bookId: string }>).detail?.bookId === bookId) setAngle(readReadingAngle(bookId)) }
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [bookId])
  const update = useCallback((next: string) => {
    if (!bookId) return
    setAngle(next.slice(0, READING_ANGLE_MAX_CHARS))
    writeReadingAngle(bookId, next)
  }, [bookId])
  return [angle, update]
}
