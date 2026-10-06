/**
 * Painted covers for added public books, in the series style of the library's
 * covers (docs/library-cover-audit-2026-09-28.md). A queued job, behind the
 * switch PUBLIC_BOOK_PAINTED_COVERS=1 (default off): until a painting exists,
 * the library shows the typographic paper cover. Jobs are R2 objects under
 * `public-books/cover-jobs/`; the import queues one and the daily cron (and the
 * import itself, after its response) works through them, a few at a time.
 *
 * xAI runs with Zero Data Retention, so the image is requested as base64 bytes
 * (`response_format: b64_json`) and stored in R2; no xAI-hosted URL is kept.
 * The request carries the book's title, author and year only.
 */
export const COVER_JOB_PREFIX = 'public-books/cover-jobs/'
export const XAI_IMAGE_MODEL = 'grok-2-image'
const MAX_ATTEMPTS = 3
const MAX_IMAGE_BYTES = 6 * 1024 * 1024

export interface CoverJob { bookId: string; title: string; author: string; year: number | null; queuedAt: string; attempts: number }

/** The prompt, in the words of the series' own cover prompts. */
export function coverPrompt(job: Pick<CoverJob, 'title' | 'author' | 'year'>): string {
  const title = job.title.toUpperCase()
  const author = (job.author || '').toUpperCase()
  return [
    'Use case: illustration-story. A finished portrait literary book cover, 1024x1536, for Tinct, a library of classic books.',
    `Book: ${job.title}${job.author ? ` by ${job.author}` : ''}${job.year ? ` (${job.year < 0 ? `${-job.year} BC` : job.year})` : ''}.`,
    'Choose one quiet, specific scene, object or landscape from the world of this book. Literary oil painting with visible restrained brushwork and fine atmospheric light: dignified, spare, unmistakably painted, never a photograph or a mockup of a physical book. Restrained, muted palette with deep shadows. No people in close-up, no gore, no modern objects unless the book is modern.',
    `Integrate excellent large cream serif typography in a quiet dark area: exact title '${title}'${author ? `, exact author '${author}'` : ''}, both clearly readable at thumbnail size, no other text.`,
    'Flat full-bleed cover. No logo, subtitle, watermark, gold border, decorative frame, lighthouse or ship motif.',
  ].join(' ')
}

export type CoverFetch = (url: string, init: RequestInit) => Promise<Response>

/** One painting as bytes, or null. Never called unless the switch is on and the key is set. */
export async function paintCover(job: CoverJob, apiKey: string, fetchImpl: CoverFetch = fetch, model = XAI_IMAGE_MODEL): Promise<Uint8Array | null> {
  const response = await fetchImpl('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, prompt: coverPrompt(job), n: 1, response_format: 'b64_json' }),
    signal: AbortSignal.timeout(90_000),
  })
  if (!response.ok) return null
  const data = await response.json() as { data?: Array<{ b64_json?: string }> }
  const b64 = data.data?.[0]?.b64_json
  if (!b64 || b64.length > MAX_IMAGE_BYTES * 1.4) return null
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8
  const png = bytes[0] === 0x89 && bytes[1] === 0x50
  return jpeg || png ? bytes : null
}

export function coverContentType(bytes: Uint8Array): string {
  return bytes[0] === 0x89 ? 'image/png' : 'image/jpeg'
}

export async function queueCoverJob(bucket: R2Bucket, job: Omit<CoverJob, 'queuedAt' | 'attempts'>, now = new Date()): Promise<void> {
  const value: CoverJob = { ...job, queuedAt: now.toISOString(), attempts: 0 }
  await bucket.put(COVER_JOB_PREFIX + job.bookId + '.json', JSON.stringify(value), { httpMetadata: { contentType: 'application/json' } })
}

/**
 * Work through queued jobs. `onPainted` stores the bytes and points the book at
 * them (routes/publicBooks.ts). Failures are retried on later runs, then dropped.
 */
export async function processCoverJobs(
  bucket: R2Bucket,
  options: { apiKey: string; limit: number; fetchImpl?: CoverFetch; model?: string; onPainted: (bookId: string, bytes: Uint8Array) => Promise<void> },
): Promise<{ painted: number; failed: number }> {
  const page = await bucket.list({ prefix: COVER_JOB_PREFIX, limit: options.limit })
  let painted = 0, failed = 0
  for (const object of page.objects) {
    const stored = await bucket.get(object.key)
    if (!stored) continue
    let job: CoverJob
    try { job = JSON.parse(await new Response(stored.body).text()) as CoverJob } catch { await bucket.delete(object.key); continue }
    let bytes: Uint8Array | null = null
    try { bytes = await paintCover(job, options.apiKey, options.fetchImpl, options.model) } catch { bytes = null }
    if (bytes) {
      await options.onPainted(job.bookId, bytes)
      await bucket.delete(object.key)
      painted++
    } else {
      failed++
      if (job.attempts + 1 >= MAX_ATTEMPTS) await bucket.delete(object.key)
      else await bucket.put(object.key, JSON.stringify({ ...job, attempts: job.attempts + 1 }), { httpMetadata: { contentType: 'application/json' } })
    }
  }
  return { painted, failed }
}
