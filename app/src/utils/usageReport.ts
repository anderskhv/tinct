/**
 * Client reports for the cost ledger (see worker/lib/aiUsage.ts). The browser
 * talks to xAI directly for Talk and plays cached narration audio, so the
 * Worker cannot see connected or listened time; the client reports it. Both
 * reports are keepalive fetches that never await, throw or block anything.
 */
import { apiUrl } from './apiUrl'

type Post = (path: string, body: object, token: string | null | undefined) => void

const defaultPost: Post = (path, body, token) => {
  try {
    if (typeof fetch !== 'function') return
    void fetch(apiUrl(path), {
      method: 'POST', keepalive: true, body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    }).catch(() => {})
  } catch { /* the ledger never breaks the feature */ }
}

let post: Post = defaultPost
/** Test seam. */
export function setUsageReportTransport(next: Post | null): void { post = next ?? defaultPost }

/** Connected Talk time (signed-in only: Talk requires an account). */
export function reportTalkSeconds(input: { seconds: number; authToken?: string | null; bookId?: string | null }): void {
  if (!input.authToken || !(input.seconds >= 1)) return
  post('/api/voice-usage', { seconds: Math.round(input.seconds), ...(input.bookId ? { bookId: input.bookId } : {}) }, input.authToken)
}

export const LISTEN_REPORT_EVERY_SECONDS = 60

/**
 * Accumulates listened seconds per book and reports them in batches of about a
 * minute, on pause, on book change and when the page is hidden.
 */
export function createListenReporter(getToken: () => string | null | undefined) {
  let bookId: string | null = null
  let pending = 0
  const flush = () => {
    const seconds = Math.round(pending)
    pending = 0
    if (seconds < 1 || !bookId) return
    post('/api/narration/listen', { bookId, seconds }, getToken())
  }
  return {
    /** Add playback time for a book; switching books reports the previous one first. */
    tick(book: string, seconds: number) {
      if (!(seconds > 0)) return
      if (bookId !== null && book !== bookId) flush()
      bookId = book
      pending += seconds
      if (pending >= LISTEN_REPORT_EVERY_SECONDS) flush()
    },
    flush,
  }
}
