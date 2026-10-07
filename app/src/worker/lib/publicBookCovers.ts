/**
 * Painted covers for added public books, in the series style of the library's
 * covers (docs/library-cover-audit-2026-09-28.md). A queued job, behind the
 * switch PUBLIC_BOOK_PAINTED_COVERS=1 (default off): until a painting exists,
 * the library shows the typographic paper cover. Jobs are R2 objects under
 * `public-books/cover-jobs/`; the import queues one, the crons (every ten minutes
 * and daily) backfill books added while the switch was off, and the crons and
 * the import itself (after its response) work through them, a few at a time.
 *
 * xAI runs with Zero Data Retention, so the image is requested as base64 bytes
 * (`response_format: b64_json`) and stored in R2; no xAI-hosted URL is kept.
 * The request carries the book's title, author and year only.
 */
export const COVER_JOB_PREFIX = 'public-books/cover-jobs/'
/**
 * xAI's current image model (docs.x.ai, Imagine image generation, checked
 * 2026-10-07): flat $0.04 per image; `grok-2-image` is no longer listed.
 * Portrait 2:3 at 1k, the shape of the series' covers.
 */
export const XAI_IMAGE_MODEL = 'grok-imagine-image-2.0'
export const XAI_IMAGE_OPTIONS = { aspect_ratio: '2:3', resolution: '1k' } as const
const MAX_ATTEMPTS = 3
const MAX_IMAGE_BYTES = 6 * 1024 * 1024

export interface CoverJob { bookId: string; title: string; author: string; year: number | null; queuedAt: string; attempts: number; claimedUntil?: number }

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
    body: JSON.stringify({ model, prompt: coverPrompt(job), n: 1, response_format: 'b64_json', ...XAI_IMAGE_OPTIONS }),
    signal: AbortSignal.timeout(90_000),
  })
  if (!response.ok) return null
  const data = await response.json() as { data?: Array<{ b64_json?: string }> }
  const b64 = data.data?.[0]?.b64_json
  if (!b64 || b64.length > MAX_IMAGE_BYTES * 1.4) return null
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return coverImageType(bytes) ? bytes : null
}

/** JPEG, PNG or WebP by magic bytes (the API may answer with any of the three), else null. */
export function coverImageType(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'image/png'
  const tag = (at: number) => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3])
  if (bytes.length > 12 && tag(0) === 'RIFF' && tag(8) === 'WEBP') return 'image/webp'
  return null
}

export function coverContentType(bytes: Uint8Array): string {
  return coverImageType(bytes) ?? 'image/jpeg'
}

// ===== The spine =====

/**
 * The spine colour for a painted cover, from the RGBA pixels of its left edge:
 * their average, kept to a dark binding tone (the library sets cream or gilt
 * lettering on it, and picks the nearest leather from it). Null for no pixels.
 */
export function spineToneFromPixels(rgba: Uint8Array): string | null {
  let r = 0, g = 0, b = 0, n = 0
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    if (rgba[i + 3] < 128) continue
    r += rgba[i]; g += rgba[i + 1]; b += rgba[i + 2]; n++
  }
  if (!n) return null
  // RGB → HSL, clamp lightness and saturation, back to RGB.
  const [R, G, B] = [r / n / 255, g / n / 255, b / n / 255]
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min
  let h = 0
  if (d) h = max === R ? ((G - B) / d + 6) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4
  const l0 = (max + min) / 2
  const s0 = d ? d / (1 - Math.abs(2 * l0 - 1)) : 0
  const l = Math.min(0.26, Math.max(0.1, l0)), s = Math.min(0.5, s0)
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(h % 2 - 1)), m = l - c / 2
  const [r1, g1, b1] = h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x]
  return '#' + [r1, g1, b1].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('')
}

function base64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

/**
 * The painting's spine tone, computed once when it is stored: resvg (already
 * in the Worker for share images) scales the left 6% of the image down to a
 * strip and the pixels are averaged. Null if the image cannot be decoded.
 */
export async function paintingSpineTone(bytes: Uint8Array): Promise<string | null> {
  const type = coverImageType(bytes)
  if (!type) return null
  try {
    const [{ Resvg }, { ensureResvg }] = await Promise.all([import('@resvg/resvg-wasm'), import('./resvgWasm')])
    await ensureResvg()
    // The image is drawn 100 × 150 units wide (the 2:3 cover); the view shows its left 6 units.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="4" height="48" viewBox="0 0 6 150" preserveAspectRatio="none"><image width="100" height="150" preserveAspectRatio="none" xlink:href="data:${type};base64,${base64(bytes)}"/></svg>`
    const resvg = new Resvg(svg)
    try { return spineToneFromPixels(resvg.render().pixels) } finally { resvg.free() }
  } catch {
    return null
  }
}

/** Where a book's painting is stored (served at /api/public-books/{id}/cover). */
export const coverObjectKey = (bookId: string) => `public-books/${bookId}/cover`
/** Set once a book's jobs have all failed: the backfill never queues it again. */
export const coverGaveUpKey = (bookId: string) => `public-books/${bookId}/cover-gave-up`
const jobKey = (bookId: string) => COVER_JOB_PREFIX + bookId + '.json'
/** A runner owns a job this long (longer than one 90 s request), so two runs never paint one book at once. */
export const COVER_CLAIM_MS = 3 * 60_000
const JSON_META = { httpMetadata: { contentType: 'application/json' } }

/** Queues a job unless one is already queued (create-only: a claimed job is never reset). */
export async function queueCoverJob(bucket: R2Bucket, job: Omit<CoverJob, 'queuedAt' | 'attempts'>, now = new Date()): Promise<boolean> {
  const value: CoverJob = { ...job, queuedAt: now.toISOString(), attempts: 0 }
  return !!await bucket.put(jobKey(job.bookId), JSON.stringify(value), { ...JSON_META, onlyIf: { etagDoesNotMatch: '*' } })
}

export interface CoverCandidate { id: string; title: string; author: string; year: number | null; art?: unknown }

/**
 * Books added while the switch was off have no job. Queues one for each added
 * book (`isAdded`) with no painting, no queued job and no given-up mark, at most
 * `limit` per run. Idempotent: a second run finds the jobs and queues nothing.
 */
export async function backfillCoverJobs(
  bucket: R2Bucket,
  books: CoverCandidate[],
  options: { limit: number; isAdded: (id: string) => boolean; now?: Date; relink?: (bookId: string) => Promise<void> },
): Promise<string[]> {
  const queued: string[] = []
  for (const book of books) {
    if (queued.length >= options.limit) break
    if (!options.isAdded(book.id) || book.art) continue
    // A painting stored but never linked to its book (an interrupted run) is linked, never painted again.
    if (await bucket.head(coverObjectKey(book.id))) { await options.relink?.(book.id).catch(() => {}); continue }
    if (await bucket.head(jobKey(book.id)) || await bucket.head(coverGaveUpKey(book.id))) continue
    if (await queueCoverJob(bucket, { bookId: book.id, title: book.title, author: book.author, year: book.year }, options.now)) queued.push(book.id)
  }
  return queued
}

/**
 * Work through queued jobs. `onPainted` stores the bytes and points the book at
 * them (routes/publicBooks.ts). Each job is claimed first (a conditional put), so
 * the import's own run, the 10-minute cron and the daily cron never paint one
 * book twice; a book that already has a painting is never painted again.
 * Failures are retried on later runs, then given up.
 */
export async function processCoverJobs(
  bucket: R2Bucket,
  options: { apiKey: string; limit: number; fetchImpl?: CoverFetch; model?: string; now?: () => number; deadline?: number; onPainted: (bookId: string, bytes: Uint8Array) => Promise<void> },
): Promise<{ painted: number; failed: number }> {
  const now = options.now ?? Date.now
  const page = await bucket.list({ prefix: COVER_JOB_PREFIX, limit: options.limit })
  let painted = 0, failed = 0
  for (const object of page.objects) {
    if (options.deadline !== undefined && now() >= options.deadline) break
    const stored = await bucket.get(object.key)
    if (!stored) continue
    let job: CoverJob
    try { job = JSON.parse(await new Response(stored.body).text()) as CoverJob } catch { await bucket.delete(object.key); continue }
    if (await bucket.head(coverObjectKey(job.bookId))) { await bucket.delete(object.key); continue }
    if ((job.claimedUntil ?? 0) > now()) continue
    const claimed = await bucket.put(object.key, JSON.stringify({ ...job, claimedUntil: now() + COVER_CLAIM_MS }), { ...JSON_META, onlyIf: { etagMatches: stored.etag } })
    if (!claimed) continue
    let bytes: Uint8Array | null = null
    try { bytes = await paintCover(job, options.apiKey, options.fetchImpl, options.model) } catch { bytes = null }
    if (bytes) {
      // A painting stored but not yet linked is linked by the next backfill, never painted again.
      try { await options.onPainted(job.bookId, bytes) } catch { /* see above */ }
      await bucket.delete(object.key)
      painted++
    } else {
      failed++
      if (job.attempts + 1 >= MAX_ATTEMPTS) {
        await bucket.put(coverGaveUpKey(job.bookId), new Date(now()).toISOString(), {})
        await bucket.delete(object.key)
      } else await bucket.put(object.key, JSON.stringify({ ...job, attempts: job.attempts + 1, claimedUntil: 0 }), JSON_META)
    }
  }
  return { painted, failed }
}
