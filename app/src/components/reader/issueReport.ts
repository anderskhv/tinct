import { apiUrl } from '../../utils/apiUrl'

// Issue-report network logic extracted from Reader.tsx (slice 4). The popup
// state (tag/comment/submitting) and UI side effects (toast, dismiss) stay in
// Reader; this module owns the POST + the evaluation poll so they're testable.

export interface IssueReportInput {
  authToken?: string
  bookId: string
  editionKey: string
  chapterNumber: number
  paragraphIndex: number
  selectedText: string
  tag: string
  comment?: string
}

/** POST an issue report. Throws on a non-OK response. Returns the parsed body
 *  (with an optional reportId used to poll for the evaluation result). */
export async function submitIssueReport(input: IssueReportInput): Promise<{ reportId?: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (input.authToken) headers['Authorization'] = `Bearer ${input.authToken}`
  const res = await fetch(apiUrl('/api/report-issue'), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      bookId: input.bookId,
      editionKey: input.editionKey,
      chapterNumber: input.chapterNumber,
      paragraphIndex: input.paragraphIndex,
      selectedText: input.selectedText,
      tag: input.tag,
      comment: input.comment,
    }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return await res.json() as { reportId?: string }
}

/** Poll the evaluation status for a submitted report. Dispatches
 *  'tinct:issue-fixed' when the fix is confirmed. Stops after ~60s (20 attempts
 *  at 3s) or on a terminal status. */
export function pollIssueStatus(reportId: string): void {
  let attempts = 0
  const poll = setInterval(async () => {
    attempts++
    if (attempts > 20) { clearInterval(poll); return } // stop after ~60s
    try {
      const statusRes = await fetch(apiUrl(`/api/report-status?id=${reportId}`))
      const statusData = await statusRes.json() as { status: string }
      if (statusData.status === 'confirmed') {
        clearInterval(poll)
        window.dispatchEvent(new CustomEvent('tinct:issue-fixed'))
      } else if (statusData.status === 'rejected' || statusData.status === 'needs_review') {
        clearInterval(poll)
      }
    } catch { /* keep polling */ }
  }, 3000)
}
