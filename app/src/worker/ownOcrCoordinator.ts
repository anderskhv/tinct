import { DurableObject } from 'cloudflare:workers'
import { assembleOcrEdition, type OcrPage } from '../lab/userBook/ocrEdition'
import { loadPremiumTier, type PremiumTier } from './lib/aiAllowance'
import { ocrCostUsd, recordAiUsage } from './lib/aiUsage'
import { OCR_DEFAULT_MODEL, OcrProviderError, xaiOcrRecognizer, type OcrRecognition, type OcrRecognizer, type OcrReply } from './lib/ocrVision'
import {
  OCR_CALL_RESERVE_MICROS,
  dayOf,
  monthlyPageLimit,
  nextMonthStart,
  ocrEditionKey,
  ocrImageKey,
  ocrJobKey,
  ocrPageKey,
  ocrPagesThisMonth,
  ownOcrLimits,
  ownOcrPrefix,
  refundOcrPage,
  reserveOcrCall,
  reserveOcrPage,
  settleOcrCall,
  type OcrCeiling,
  type OwnOcrEnv,
} from './lib/ownOcr'

/**
 * One OCR job: one scanned own PDF of one account (`ocr:{sha256(userId\nhex)}`,
 * lib/ownOcr.ts). The device uploads page images; this object recognises them
 * one page per provider call and assembles the Tinct text when every page is
 * settled. SQLite holds the job, each page's state
 * (missing | ready | done | failed | blank) and the recognised blocks (the
 * working copy `edition.json` is assembled from; R2 `page/{n}.json` is the
 * durable copy). Nothing here is logged but counts.
 *
 * The alarm does the work: at most PAGES_PER_RUN pages a run, PARALLEL at a
 * time, the next run a second later. Every run first checks that the job's
 * `job.json` still exists in R2; when it is gone (the book or the account was
 * deleted) the object deletes everything it holds and stops. A provider 429
 * backs the job off BACKOFF_429_MS (or Retry-After), a 5xx BACKOFF_5XX_MS;
 * neither counts as a failed try. A reply that is no page is asked for once
 * more in text mode; after MAX_ATTEMPTS failed tries the page stands as a
 * placeholder ("Page 37 could not be recognised. It is in Original pages.").
 * Calls to xAI go through UsageCoordinator `rl:ocr-xai` (120 a minute in all).
 *
 * At a ceiling (lib/ownOcr.ts) the job pauses with the reservation it could
 * not complete given back, and resumes at the start of the next UTC month. A
 * Premium that has lapsed pauses it until the owner starts it again with
 * Premium. Images of a job nobody has touched for ABANDON_MS are deleted by
 * its own alarm (and pages wait for a new upload).
 */

export type OcrPageState = 'missing' | 'ready' | 'done' | 'failed' | 'blank'
export type OcrJobState = 'none' | 'uploading' | 'running' | 'paused' | 'done' | 'failed'
export type OcrPauseReason = OcrCeiling | 'premium_required'

export interface OcrStatus {
  state: OcrJobState
  pages: number
  uploaded: number
  done: number
  failed: number
  blank: number
  reason?: OcrPauseReason | 'abandoned' | 'no_text'
  resumesAt?: number
  /** The pages still to upload, in order (absent when none): a device resumes from here. */
  missing?: number[]
  month: { used: number; limit: number }
}

/** Who asks for a status: their own pages this month and their tier's ceiling (the job's owner, or a reader with no job yet). */
export interface OcrViewer { userId: string; tier: PremiumTier | null }

export interface OcrStartInput {
  userId: string
  hex: string
  pages: number
  title: string
  author: string
  /**
   * Pages the device found blank (ink under 0.3 %): never sent, never charged.
   * Also taken when the job exists, for pages still missing (a device finds
   * them while it uploads).
   */
  blank?: number[]
  rerun?: 'failed' | 'all'
  tier: PremiumTier
}

export const PAGES_PER_RUN = 24
export const PARALLEL = 4
export const MAX_ATTEMPTS = 3
export const NEXT_RUN_MS = 1000
export const BACKOFF_429_MS = 30_000
export const BACKOFF_5XX_MS = 15_000
/** When the provider rate window is full. */
export const BACKOFF_RATE_MS = 5_000
/** When the account's Premium cannot be read. */
export const BACKOFF_TIER_MS = 60_000
/** How long a Premium check is trusted. */
export const TIER_TTL_MS = 10 * 60_000
export const ABANDON_MS = 14 * 24 * 3600_000
/** Outbound calls one run may make (provider calls, ledger rows, the Premium check): under Cloudflare's 50. */
export const RUN_FETCH_BUDGET = 44
export const PROVIDER_RATE = { limit: 120, windowMs: 60_000 } as const
/** The ledger's book_id for every OCR row: a marker, never the book. */
export const OCR_LEDGER_BOOK_ID = 'userbook'

interface JobRow {
  user_id: string
  hex: string
  pages: number
  title: string
  author: string
  created_at: number
  updated_at: number
  completed_at: number | null
  finished: string | null
  paused: string | null
  resumes_at: number | null
  backoff_until: number | null
  tier: string | null
  tier_at: number | null
  generation: number
  abandoned: number
}

interface PageRow { n: number; state: OcrPageState; attempts: number; counted_day: string | null; reply: string | null }

type CallOutcome =
  | { kind: 'ok'; reply: OcrReply }
  | { kind: 'invalid' }
  | { kind: 'paused'; reason: OcrCeiling }
  | { kind: 'backoff'; ms: number }
  | { kind: 'failed' }
  | { kind: 'gone' }

/** Injected in tests: the vision call, the clock and the Premium check. */
export interface OcrDeps {
  recognizer: OcrRecognizer
  now: () => number
  loadTier: (userId: string) => Promise<PremiumTier | null>
}

export class OwnOcrCoordinator extends DurableObject<OwnOcrEnv> {
  /** Outbound calls made in the current alarm run. */
  private fetched = 0

  constructor(ctx: DurableObjectState, env: OwnOcrEnv) {
    super(ctx, env)
    this.createTables()
  }

  private createTables(): void {
    this.ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS job (id INTEGER PRIMARY KEY CHECK (id = 1), user_id TEXT NOT NULL, hex TEXT NOT NULL,
      pages INTEGER NOT NULL, title TEXT NOT NULL, author TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
      completed_at INTEGER, finished TEXT, paused TEXT, resumes_at INTEGER, backoff_until INTEGER, tier TEXT, tier_at INTEGER,
      generation INTEGER NOT NULL DEFAULT 0, abandoned INTEGER NOT NULL DEFAULT 0)`)
    this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS page (n INTEGER PRIMARY KEY, state TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, counted_day TEXT, reply TEXT)')
  }

  /** Overridden in tests. Never reached by a test with the switch off. */
  protected deps(): OcrDeps {
    return {
      recognizer: xaiOcrRecognizer(this.env.XAI_API_KEY ?? '', { model: this.model() }),
      now: () => Date.now(),
      loadTier: userId => loadPremiumTier(this.env, userId),
    }
  }

  private model(): string { return this.env.OCR_MODEL || OCR_DEFAULT_MODEL }

  private job(): JobRow | null {
    return this.ctx.storage.sql.exec<JobRow>('SELECT * FROM job WHERE id = 1').toArray()[0] ?? null
  }

  private pages(): PageRow[] {
    return this.ctx.storage.sql.exec<PageRow>('SELECT * FROM page ORDER BY n').toArray()
  }

  private bucket(): R2Bucket {
    if (!this.env.USER_BOOKS) throw new Error('USER_BOOKS binding missing')
    return this.env.USER_BOOKS
  }

  private spend() {
    if (!this.env.NARRATION_COORDINATOR) throw new Error('NARRATION_COORDINATOR binding missing')
    return this.env.NARRATION_COORDINATOR
  }

  /** Sets the alarm to `at` unless one is already due sooner. */
  private async schedule(at: number): Promise<void> {
    const current = await this.ctx.storage.getAlarm()
    if (current === null || current > at) await this.ctx.storage.setAlarm(at)
  }

  private async writeJobFile(job: JobRow, state: 'running' | 'done' | 'failed' | 'abandoned'): Promise<void> {
    const meta: Record<string, string> = { pages: String(job.pages), state, createdAt: new Date(job.created_at).toISOString() }
    if (job.completed_at) meta.completedAt = new Date(job.completed_at).toISOString()
    const body = JSON.stringify({ version: 1, pages: job.pages, model: this.model(), state, createdAt: meta.createdAt, completedAt: meta.completedAt ?? null })
    await this.bucket().put(ocrJobKey(job.user_id, job.hex), body, { httpMetadata: { contentType: 'application/json' }, customMetadata: meta })
  }

  // ===== RPC =====

  /** Starts the job, or re-runs failed pages ('failed') or every page ('all'); an existing job is otherwise left as it is. */
  async start(input: OcrStartInput): Promise<OcrStatus> {
    const now = this.deps().now()
    let job = this.job()
    if (job && (job.user_id !== input.userId || job.hex !== input.hex)) throw new Error('job identity mismatch')
    if (!job) {
      this.ctx.storage.transactionSync(() => {
        this.ctx.storage.sql.exec('INSERT INTO job (id, user_id, hex, pages, title, author, created_at, updated_at, tier, tier_at) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          input.userId, input.hex, input.pages, input.title.slice(0, 600), input.author.slice(0, 400), now, now, input.tier, now)
        const blank = new Set((input.blank ?? []).filter(n => Number.isInteger(n) && n >= 1 && n <= input.pages))
        for (let n = 1; n <= input.pages; n++) this.ctx.storage.sql.exec('INSERT INTO page (n, state) VALUES (?, ?)', n, blank.has(n) ? 'blank' : 'missing')
      })
      job = this.job()!
      await this.writeJobFile(job, 'running')
    } else {
      // The owner asked with Premium: a pause for lapsed Premium is over.
      this.ctx.storage.sql.exec("UPDATE job SET tier = ?, tier_at = ?, updated_at = ?, abandoned = 0, paused = CASE WHEN paused = 'premium_required' THEN NULL ELSE paused END WHERE id = 1", input.tier, now, now)
      // Blank pages found since the start: only a page still missing becomes blank.
      for (const n of new Set(input.blank ?? [])) {
        if (Number.isInteger(n) && n >= 1 && n <= job.pages) this.ctx.storage.sql.exec("UPDATE page SET state = 'blank' WHERE n = ? AND state = 'missing'", n)
      }
      if (input.rerun === 'failed') {
        const failed = this.ctx.storage.sql.exec<{ n: number }>("SELECT n FROM page WHERE state = 'failed'").toArray()
        for (const { n } of failed) {
          const image = await this.bucket().head(ocrImageKey(job.user_id, job.hex, n))
          this.ctx.storage.sql.exec('UPDATE page SET state = ?, attempts = 0, reply = NULL WHERE n = ?', image ? 'ready' : 'missing', n)
        }
        if (failed.length) this.ctx.storage.sql.exec('UPDATE job SET finished = NULL, completed_at = NULL WHERE id = 1')
      } else if (input.rerun === 'all') {
        await this.refundCounted(job)
        this.ctx.storage.sql.exec("UPDATE page SET state = CASE WHEN state = 'blank' THEN 'blank' ELSE 'missing' END, attempts = 0, counted_day = NULL, reply = NULL")
        this.ctx.storage.sql.exec('UPDATE job SET finished = NULL, completed_at = NULL, generation = generation + 1 WHERE id = 1')
        await deletePrefix(this.bucket(), `${ownOcrPrefix(job.user_id, job.hex)}page/`)
      }
      job = this.job()!
      if (input.rerun) await this.writeJobFile(job, 'running')
    }
    if (this.ctx.storage.sql.exec<{ c: number }>("SELECT COUNT(*) AS c FROM page WHERE state = 'ready'").one().c > 0) await this.schedule(now + NEXT_RUN_MS)
    else if (!job.finished && this.ctx.storage.sql.exec<{ c: number }>("SELECT COUNT(*) AS c FROM page WHERE state = 'missing'").one().c === 0) await this.schedule(now)
    return this.status()
  }

  /** Whether page `n` may be uploaded now (the route asks before it stores the image). */
  canUpload(n: number): boolean {
    const job = this.job()
    if (!job || job.finished || !Number.isInteger(n) || n < 1 || n > job.pages) return false
    const page = this.ctx.storage.sql.exec<{ state: OcrPageState }>('SELECT state FROM page WHERE n = ?', n).toArray()[0]
    return !!page && (page.state === 'missing' || page.state === 'ready' || page.state === 'failed')
  }

  /** The image of page `n` is stored: recognise it. */
  async pageUploaded(n: number): Promise<boolean> {
    if (!this.canUpload(n)) return false
    const now = this.deps().now()
    this.ctx.storage.sql.exec("UPDATE page SET state = 'ready', attempts = CASE WHEN state = 'failed' THEN 0 ELSE attempts END WHERE n = ?", n)
    this.ctx.storage.sql.exec('UPDATE job SET updated_at = ?, abandoned = 0 WHERE id = 1', now)
    await this.schedule(now + NEXT_RUN_MS)
    return true
  }

  /**
   * The job's state and counts, and the month of `viewer` (the reader asking;
   * else the job's owner under the job's tier).
   */
  async status(viewer?: OcrViewer): Promise<OcrStatus> {
    const job = this.job()
    const now = this.deps().now()
    const limits = ownOcrLimits(this.env)
    const userId = viewer?.userId ?? job?.user_id
    const used = userId && this.env.NARRATION_COORDINATOR ? await ocrPagesThisMonth(this.env.NARRATION_COORDINATOR, userId, now).catch(() => 0) : 0
    const month = { used, limit: monthlyPageLimit(limits, (viewer?.tier ?? job?.tier) as PremiumTier | null) }
    if (!job) return { state: 'none', pages: 0, uploaded: 0, done: 0, failed: 0, blank: 0, month }
    const counts: Record<OcrPageState, number> = { missing: 0, ready: 0, done: 0, failed: 0, blank: 0 }
    for (const row of this.ctx.storage.sql.exec<{ state: OcrPageState; c: number }>('SELECT state, COUNT(*) AS c FROM page GROUP BY state').toArray()) counts[row.state] = row.c
    const missing = counts.missing > 0 ? this.ctx.storage.sql.exec<{ n: number }>("SELECT n FROM page WHERE state = 'missing' ORDER BY n").toArray().map(row => row.n) : []
    const base = { pages: job.pages, uploaded: counts.ready + counts.done + counts.failed, done: counts.done, failed: counts.failed, blank: counts.blank, ...(missing.length ? { missing } : {}), month }
    if (job.finished === 'done') return { state: 'done', ...base }
    if (job.finished === 'no_text') return { state: 'failed', ...base, reason: 'no_text' }
    if (job.paused) return { state: 'paused', ...base, reason: job.paused as OcrPauseReason, ...(job.resumes_at ? { resumesAt: job.resumes_at } : {}) }
    if (counts.ready > 0) return { state: 'running', ...base }
    if (counts.missing > 0) return { state: 'uploading', ...base, ...(job.abandoned ? { reason: 'abandoned' as const } : {}) }
    return { state: 'running', ...base }
  }

  /**
   * Stops the job and forgets it: page reservations not yet used are given
   * back, then everything this object holds is deleted. The caller deletes the
   * R2 prefix (cancel, book removal, account deletion).
   */
  async cancel(): Promise<{ refunded: number }> {
    const job = this.job()
    const refunded = job ? await this.refundCounted(job) : 0
    await this.wipe()
    return { refunded }
  }

  private async wipe(): Promise<void> {
    await this.ctx.storage.deleteAlarm()
    await this.ctx.storage.deleteAll()
    this.createTables()
  }

  /** Gives back the page count of pages counted but never recognised. */
  private async refundCounted(job: JobRow): Promise<number> {
    const rows = this.ctx.storage.sql.exec<{ n: number; counted_day: string }>("SELECT n, counted_day FROM page WHERE counted_day IS NOT NULL AND state != 'done'").toArray()
    for (const row of rows) {
      await refundOcrPage(this.spend(), job.user_id, row.counted_day)
      this.ctx.storage.sql.exec('UPDATE page SET counted_day = NULL WHERE n = ?', row.n)
    }
    return rows.length
  }

  // ===== The work =====

  async alarm(): Promise<void> {
    const deps = this.deps()
    let job = this.job()
    if (!job) { await this.wipe(); return }
    // The book or the account is gone: so is the job.
    if (!await this.bucket().head(ocrJobKey(job.user_id, job.hex))) { await this.cancel(); return }
    if (job.finished) return
    let now = deps.now()
    const ceilingPause = job.paused && job.paused !== 'premium_required'
    if (!ceilingPause && !job.abandoned && now - job.updated_at >= ABANDON_MS) { await this.abandon(job); return }
    const abandonAt = job.updated_at + ABANDON_MS
    if (job.paused) {
      if (job.resumes_at && now >= job.resumes_at) {
        this.ctx.storage.sql.exec('UPDATE job SET paused = NULL, resumes_at = NULL WHERE id = 1')
      } else {
        if (job.resumes_at) await this.schedule(job.resumes_at)
        else if (!job.abandoned) await this.schedule(abandonAt)
        return
      }
    }
    if ((job.backoff_until ?? 0) > now) { await this.schedule(job.backoff_until!); return }

    this.fetched = 0
    if (!job.tier_at || now - job.tier_at >= TIER_TTL_MS || !job.tier) {
      this.fetched += 1
      const tier = await deps.loadTier(job.user_id).catch(() => null)
      if (tier === null && !job.tier) { await this.schedule(now + BACKOFF_TIER_MS); return }
      if (tier !== null) this.ctx.storage.sql.exec('UPDATE job SET tier = ?, tier_at = ? WHERE id = 1', tier, now)
      if (tier === 'none') {
        this.ctx.storage.sql.exec("UPDATE job SET paused = 'premium_required', resumes_at = NULL WHERE id = 1")
        await this.schedule(abandonAt)
        return
      }
      job = this.job()!
    }

    const generation = job.generation
    let processed = 0
    let stop = false
    const tried = new Set<number>()
    while (!stop && processed < PAGES_PER_RUN) {
      // A wave starts only if each of its pages can still take two calls and two ledger rows.
      const room = Math.min(PARALLEL, PAGES_PER_RUN - processed, Math.floor((RUN_FETCH_BUDGET - this.fetched) / 4))
      if (room <= 0) break
      // A page tried in this run waits for the next one (a failed try is not repeated at once).
      const wave = this.ctx.storage.sql.exec<PageRow>("SELECT * FROM page WHERE state = 'ready' ORDER BY n LIMIT ?", room + tried.size).toArray()
        .filter(page => !tried.has(page.n)).slice(0, room)
      if (!wave.length) break
      for (const page of wave) tried.add(page.n)
      processed += wave.length
      const outcomes = await Promise.all(wave.map(page => this.recognise(job!, page, generation)))
      const current = this.job()
      if (!current || current.generation !== generation) return
      now = deps.now()
      const paused = outcomes.find((o): o is { kind: 'paused'; reason: OcrCeiling } => o.kind === 'paused')
      const backoff = outcomes.filter((o): o is { kind: 'backoff'; ms: number } => o.kind === 'backoff').reduce((ms, o) => Math.max(ms, o.ms), 0)
      if (paused) {
        this.ctx.storage.sql.exec('UPDATE job SET paused = ?, resumes_at = ? WHERE id = 1', paused.reason, nextMonthStart(now))
        await this.schedule(nextMonthStart(now))
        return
      }
      if (backoff > 0) {
        this.ctx.storage.sql.exec('UPDATE job SET backoff_until = ? WHERE id = 1', now + backoff)
        stop = true
      }
    }
    job = this.job()!
    const counts = this.ctx.storage.sql.exec<{ ready: number; missing: number }>("SELECT SUM(state = 'ready') AS ready, SUM(state = 'missing') AS missing FROM page").one()
    if (Number(counts.ready) > 0) {
      await this.schedule(Math.max(now + NEXT_RUN_MS, job.backoff_until ?? 0))
      return
    }
    if (Number(counts.missing) > 0) { await this.schedule(abandonAt); return }
    await this.finish(job)
  }

  /** The last paragraph of the nearest recognised page before `n` (up to two back), as context. */
  private context(n: number): string {
    const rows = this.ctx.storage.sql.exec<{ n: number; state: OcrPageState; reply: string | null }>('SELECT n, state, reply FROM page WHERE n < ? AND n >= ? ORDER BY n DESC', n, n - 2).toArray()
    for (const row of rows) {
      if (row.state === 'blank') continue
      if (row.state !== 'done' || !row.reply) return ''
      try {
        const reply = JSON.parse(row.reply) as OcrReply
        return [...reply.blocks].reverse().find(block => block.t === 'p')?.x ?? ''
      } catch { return '' }
    }
    return ''
  }

  /** One page: up to two calls (JSON, then text mode), each reserved and settled on its own. */
  private async recognise(job: JobRow, page: PageRow, generation: number): Promise<CallOutcome> {
    const deps = this.deps()
    const bucket = this.bucket()
    const spend = this.spend()
    const limits = ownOcrLimits(this.env)
    const alive = () => this.job()?.generation === generation
    const image = await bucket.get(ocrImageKey(job.user_id, job.hex, page.n))
    if (!image) {
      this.ctx.storage.sql.exec("UPDATE page SET state = 'missing' WHERE n = ? AND state = 'ready'", page.n)
      return { kind: 'gone' }
    }
    const bytes = new Uint8Array(await image.arrayBuffer())
    const context = this.context(page.n)

    let countedNow = false
    if (!page.counted_day) {
      const day = dayOf(deps.now())
      if (!await reserveOcrPage(spend, job.user_id, day, monthlyPageLimit(limits, job.tier as PremiumTier))) return { kind: 'paused', reason: 'account_pages' }
      if (!alive()) { await refundOcrPage(spend, job.user_id, day); return { kind: 'gone' } }
      this.ctx.storage.sql.exec('UPDATE page SET counted_day = ? WHERE n = ?', day, page.n)
      countedNow = true
    }
    const giveBackPage = async () => {
      const day = this.ctx.storage.sql.exec<{ counted_day: string | null }>('SELECT counted_day FROM page WHERE n = ?', page.n).toArray()[0]?.counted_day
      if (day) {
        await refundOcrPage(spend, job.user_id, day)
        this.ctx.storage.sql.exec('UPDATE page SET counted_day = NULL WHERE n = ?', page.n)
      }
    }

    let result: CallOutcome = { kind: 'invalid' }
    for (const format of ['json', 'text'] as const) {
      result = await this.call(job, page.n, bytes, context, format)
      if (result.kind !== 'invalid') break
    }
    if (!alive()) return { kind: 'gone' }
    if (result.kind === 'paused') {
      // Nothing was sent: the page goes back too if it was counted for this call.
      if (countedNow) await giveBackPage()
      return result
    }
    if (result.kind === 'ok') {
      const stored: OcrPage = { page: page.n, ...result.reply }
      const json = JSON.stringify(stored)
      await bucket.put(ocrPageKey(job.user_id, job.hex, page.n), json, { httpMetadata: { contentType: 'application/json' } })
      if (!alive()) return { kind: 'gone' }
      this.ctx.storage.sql.exec("UPDATE page SET state = 'done', reply = ? WHERE n = ?", json, page.n)
      this.ctx.storage.sql.exec('UPDATE job SET updated_at = ? WHERE id = 1', deps.now())
      await bucket.delete(ocrImageKey(job.user_id, job.hex, page.n))
      return result
    }
    if (result.kind === 'backoff') return result
    // A failed try (an unusable reply twice, or a provider error).
    const attempts = page.attempts + 1
    if (attempts >= MAX_ATTEMPTS) {
      this.ctx.storage.sql.exec("UPDATE page SET state = 'failed', attempts = ? WHERE n = ?", attempts, page.n)
      await giveBackPage()
    } else {
      this.ctx.storage.sql.exec('UPDATE page SET attempts = ? WHERE n = ?', attempts, page.n)
    }
    return result.kind === 'invalid' ? { kind: 'failed' } : result
  }

  /** One provider call, its dollars reserved first and settled from the reported usage after. */
  private async call(job: JobRow, n: number, image: Uint8Array, context: string, format: 'json' | 'text'): Promise<CallOutcome> {
    const deps = this.deps()
    const spend = this.spend()
    const slot = this.env.USAGE_COORDINATOR
      ? await this.env.USAGE_COORDINATOR.getByName('rl:ocr-xai').hit(PROVIDER_RATE.limit, PROVIDER_RATE.windowMs).catch(() => false)
      : false
    if (!slot) return { kind: 'backoff', ms: BACKOFF_RATE_MS }
    this.fetched += 2 // the call and its ledger row
    const day = dayOf(deps.now())
    const refused = await reserveOcrCall(spend, job.user_id, day, ownOcrLimits(this.env))
    if (refused) return { kind: 'paused', reason: refused }
    let recognition: OcrRecognition
    try {
      recognition = await deps.recognizer({ image, page: n, context, format })
    } catch (error) {
      const fail = error instanceof OcrProviderError ? error : new OcrProviderError('provider_error')
      // 429 and 5xx are not billed; a timeout or other error may have been.
      const billed = fail.reason === 'timeout' || fail.reason === 'provider_error'
      await settleOcrCall(spend, job.user_id, day, billed ? OCR_CALL_RESERVE_MICROS : 0)
      if (billed) this.ledger(job.user_id, OCR_CALL_RESERVE_MICROS / 1_000_000, null)
      if (fail.reason === 'provider_429') return { kind: 'backoff', ms: fail.retryAfterMs ?? BACKOFF_429_MS }
      if (fail.reason === 'provider_5xx') return { kind: 'backoff', ms: fail.retryAfterMs ?? BACKOFF_5XX_MS }
      return { kind: 'failed' }
    }
    // What xAI says the call cost, else its tokens at our rates, else the reservation.
    const cost = recognition.usage ? recognition.usage.costUsd ?? ocrCostUsd(recognition.usage.input, recognition.usage.output) : OCR_CALL_RESERVE_MICROS / 1_000_000
    await settleOcrCall(spend, job.user_id, day, Math.round(cost * 1_000_000))
    this.ledger(job.user_id, cost, recognition.usage)
    return recognition.reply ? { kind: 'ok', reply: recognition.reply } : { kind: 'invalid' }
  }

  private ledger(userId: string, cost: number, usage: { input: number; output: number } | null): void {
    recordAiUsage(this.env, this.ctx, { userId }, {
      feature: 'ocr', provider: 'xai', model: this.model(), cost_usd: cost, cache_hit: false, book_id: OCR_LEDGER_BOOK_ID,
      ...(usage ? { input_tokens: usage.input, output_tokens: usage.output } : {}),
    })
  }

  /** Every page settled: the Tinct text, from the recognised pages. */
  private async finish(job: JobRow): Promise<void> {
    const now = this.deps().now()
    const pages: OcrPage[] = this.pages().map(row => {
      if (row.state === 'blank') return { page: row.n, blocks: [], blank: true as const }
      if (row.state === 'failed' || !row.reply) return { page: row.n, blocks: [], failed: true as const }
      try { return JSON.parse(row.reply) as OcrPage } catch { return { page: row.n, blocks: [], failed: true as const } }
    })
    const edition = assembleOcrEdition({ title: job.title, author: job.author, pages, pageCount: job.pages })
    const finished = edition.chapters.length ? 'done' : 'no_text'
    if (finished === 'done') {
      await this.bucket().put(ocrEditionKey(job.user_id, job.hex), JSON.stringify(edition), { httpMetadata: { contentType: 'application/json' } })
    }
    // Images of pages that could not be recognised go too; re-running them asks the device again.
    await deletePrefix(this.bucket(), `${ownOcrPrefix(job.user_id, job.hex)}img/`)
    if (this.job()?.generation !== job.generation) return
    this.ctx.storage.sql.exec('UPDATE job SET finished = ?, completed_at = ?, updated_at = ? WHERE id = 1', finished, now, now)
    await this.writeJobFile(this.job()!, finished === 'done' ? 'done' : 'failed')
    await this.ctx.storage.deleteAlarm()
  }

  /** Nobody has touched the job for ABANDON_MS: its page images go; pages wait for a new upload. */
  private async abandon(job: JobRow): Promise<void> {
    await deletePrefix(this.bucket(), `${ownOcrPrefix(job.user_id, job.hex)}img/`)
    await this.refundCounted(job)
    this.ctx.storage.sql.exec("UPDATE page SET state = 'missing' WHERE state IN ('ready', 'failed')")
    this.ctx.storage.sql.exec('UPDATE job SET abandoned = 1 WHERE id = 1')
    await this.writeJobFile(this.job()!, 'abandoned')
    await this.ctx.storage.deleteAlarm()
  }
}

/** Every object under `prefix`, re-listed from the start after each delete. */
async function deletePrefix(bucket: R2Bucket, prefix: string): Promise<void> {
  for (let round = 0; round < 1000; round++) {
    const page = await bucket.list({ prefix, limit: 1000 })
    const keys = page.objects.map(object => object.key).filter(key => key.startsWith(prefix))
    if (!keys.length) return
    await bucket.delete(keys)
  }
}
