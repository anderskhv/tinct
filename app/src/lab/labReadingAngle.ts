import { useCallback, useEffect, useState } from 'react'
import { storage } from '../services/storage'

/**
 * The reader's reading angle for one book: what they want to notice, set
 * before or while reading and always optional (free for everyone). One value
 * per book, on this device (`reading-angle:{bookId}`, the key the legacy
 * reader used), read by every AI request for that book and edited from Book
 * settings and the desktop's "Before you start" card. Never another book's
 * angle: a book with none sends none.
 */
export const READING_ANGLE_MAX_CHARS = 240
const KEY = (bookId: string) => `reading-angle:${bookId}`
const EVENT = 'tinct:reading-angle'

export function readReadingAngle(bookId: string | null | undefined): string {
  if (!bookId) return ''
  const value = storage.get<unknown>(KEY(bookId))
  return typeof value === 'string' ? value.slice(0, READING_ANGLE_MAX_CHARS) : ''
}

export function writeReadingAngle(bookId: string, angle: string): void {
  const value = angle.slice(0, READING_ANGLE_MAX_CHARS)
  if (value.trim()) storage.set(KEY(bookId), value)
  else storage.delete(KEY(bookId))
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVENT, { detail: { bookId } }))
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
