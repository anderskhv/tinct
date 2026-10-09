/**
 * What My shelf says of a scanned own PDF whose text the account is
 * recognising (OCR, §3 of the PDF editions plan): "Recognising text…", from
 * the account's status (GET /api/user-books/ocr/{hex}, worker/routes/userBooks.ts).
 * The same words and states as Add a book's viewer (addbooks/web/src/js/pdf-ocr.js
 * shelfLine). Recognition switched off (the route answers 404), a job done or
 * never started, or an account that cannot be asked: nothing.
 */
import type { FetchLike } from './ownAccount'

/** The approved copy. */
export const OCR_SHELF_LINE = 'Recognising text…'
const UNDER_WAY = new Set(['uploading', 'running', 'paused'])
const HEX = /^[0-9a-f]{24}$/

/** The line for each scan (by hex) whose text is being recognised; only those. */
export async function ocrShelfLines(hexes: readonly string[], options: { token: string | null; fetchImpl?: FetchLike }): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  const token = options.token
  const fetchImpl = options.fetchImpl ?? fetch
  const list = [...new Set(hexes)].filter(hex => HEX.test(hex))
  if (!token || !list.length) return out
  await Promise.all(list.map(async hex => {
    try {
      const response = await fetchImpl(`/api/user-books/ocr/${hex}`, { cache: 'no-store', credentials: 'same-origin', headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) return
      const status = await response.json() as { state?: unknown } | null
      if (typeof status?.state === 'string' && UNDER_WAY.has(status.state)) out.set(hex, OCR_SHELF_LINE)
    } catch { /* offline: nothing said */ }
  }))
  return out
}
