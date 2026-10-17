/**
 * Every book a reader opens becomes readable offline in full, with no tap:
 * once the first page is up and the browser is idle, the whole book (main
 * edition, plus compare when it differs) is saved in the background with the
 * same machinery as "Make available offline" (labOfflineBook.ts). Quiet when
 * it fails; tried again on the next visit, or when the connection returns,
 * fetching only what is not cached yet.
 */
import { useEffect } from 'react'
import { isNativeCapacitor } from '../utils/nativePlatform'
import { autoSaveBookOffline, shouldAutoSaveBookOffline } from './labOfflineBook'

/** After the first page: the reader's own requests (neighbour chapters, cast, audio) go first. */
export const AUTO_OFFLINE_DELAY_MS = 4000

export function useLabAutoOffline({ bookId, editionKeys, hasVerseLines, enabled }: {
  bookId: string | undefined
  editionKeys: string[]
  hasVerseLines: boolean
  /** The first page is shown, and the book is a published one (a reader's own books are already on the device). */
  enabled: boolean
}): void {
  const editionsId = editionKeys.join(',')
  useEffect(() => {
    if (!enabled || !bookId || !editionsId || isNativeCapacitor()) return
    // A page shown inside another (a preview) does not save books.
    try { if (window.top !== window) return } catch { return }
    const keys = editionsId.split(',')
    let timer: number | undefined
    let idle: number | undefined
    const run = () => { void autoSaveBookOffline({ bookId, editionKeys: keys, hasVerseLines }) }
    const schedule = (delay: number) => {
      if (!shouldAutoSaveBookOffline(bookId, keys)) return
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(run, { timeout: 5000 })
        else run()
      }, delay)
    }
    schedule(AUTO_OFFLINE_DELAY_MS)
    // Opened offline, or the connection dropped mid-save: resume once it is back.
    const online = () => schedule(1000)
    window.addEventListener('online', online)
    return () => {
      window.removeEventListener('online', online)
      window.clearTimeout(timer)
      if (idle !== undefined && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle)
      // A save already running finishes: switching books mid-save still leaves the first one whole.
    }
  }, [bookId, editionsId, hasVerseLines, enabled])
}
