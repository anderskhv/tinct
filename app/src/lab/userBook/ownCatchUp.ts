/**
 * Client side of "Catch me up" for a reader's own book (`/api/own-catch-up`,
 * shared contract in `src/ownCatchUp.ts`).
 *
 * The recap is built incrementally, one request per chapter, in reading order:
 * each request carries one chapter's text (from its start to the reader's
 * place, sampled to OWN_CATCH_UP_MAX_CHAPTER_CHARS) and the cumulative recap
 * so far; the answer is the new cumulative recap. Steps the account already
 * holds (same chapter text, built on the same recap) are reused from the
 * account's private store, so reopening costs no AI. Nothing beyond the
 * reader's place is ever sent, and nothing is kept on this device.
 */
import {
  OWN_CATCH_UP_MAX_CHAPTER_CHARS,
  OWN_CATCH_UP_MAX_RECAP_CHARS,
  OWN_CATCH_UP_MAX_TITLE_CHARS,
  OWN_CATCH_UP_ROUTE,
  sampleCatchUpText,
  type OwnCatchUpLookup,
  type OwnCatchUpRequest,
  type OwnCatchUpResponse,
  type OwnCatchUpStep,
} from '../../ownCatchUp'
import { sha256Hex } from '../../narration/narrationCore'
import { apiUrl } from '../../utils/apiUrl'
import { internalTrafficHeaders } from '../../utils/internalTraffic'
import { readableParagraph } from '../labFigures'
import { isAllowanceUsedResponse } from '../labAiAllowance'
import { AI_RESTING_ERROR_TYPE, labChatErrorType } from '../labCompanion'
import type { UserBookChapter } from './userEdition'

/** One chapter to send: its text from the start through `through`. */
export interface OwnCatchUpPlanStep {
  chapter: number
  title: string
  complete: boolean
  through: number
  text: string
}

function cleanParagraph(text: string): string {
  return readableParagraph(text).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** A chapter's text through paragraph `through`, as one request carries it (sampled when long). */
export function ownCatchUpChapterText(paragraphs: readonly string[], through: number): string {
  const text = paragraphs.slice(0, through + 1).map(cleanParagraph).filter(Boolean).join('\n\n')
  return sampleCatchUpText(text, OWN_CATCH_UP_MAX_CHAPTER_CHARS)
}

/**
 * The chapters a recap covers, in order: every chapter before the reader's,
 * whole, then the reader's own chapter through the paragraph they are in (all
 * of it once they finished it). Chapters with no text are skipped. Nothing
 * after the reader's place is included.
 */
export function ownCatchUpPlan(input: {
  chapters: readonly UserBookChapter[]
  chapterNumber: number
  paragraphIndex: number
  completed: boolean
}): OwnCatchUpPlanStep[] {
  const steps: OwnCatchUpPlanStep[] = []
  for (const chapter of input.chapters) {
    if (chapter.number > input.chapterNumber) break
    const last = chapter.paragraphs.length - 1
    if (last < 0) continue
    const current = chapter.number === input.chapterNumber
    const complete = !current || input.completed || input.paragraphIndex >= last
    const through = complete ? last : Math.max(0, Math.min(input.paragraphIndex, last))
    // The reader's chapter counts once they are past its opening paragraph.
    if (current && !complete && through === 0) continue
    const text = ownCatchUpChapterText(chapter.paragraphs, through)
    if (!text) continue
    steps.push({ chapter: chapter.number, title: chapter.title.slice(0, OWN_CATCH_UP_MAX_TITLE_CHARS), complete, through, text })
  }
  return steps
}

export type OwnCatchUpResult =
  | { ok: true; recap: string }
  /**
   * `allowanceUsed`: refused at zero (402 allowance_used, only while the AI allowance is on).
   * `resting`: the daily AI ceiling or a provider limit (503 ai_resting).
   * `chapter`/`title`: the section it stopped at; the sections before it are kept, so Retry resumes there.
   */
  | { ok: false; status: number; allowanceUsed?: true; resting?: true; chapter?: number; title?: string }

type FetchLike = (input: string, init: RequestInit) => Promise<{ ok: boolean; status: number; json(): Promise<unknown>; headers?: { get(name: string): string | null } }>

/** A section refused for the per-minute limit is asked for again after the Worker's Retry-After (or this), within the same run. */
export const OWN_CATCH_UP_RATE_WAIT_MS = 15_000
/** At most this many such waits in one run: more than a whole limit window, then the sheet says why and offers Retry. */
export const OWN_CATCH_UP_RATE_WAITS = 5
/** A section the model could not answer (502) or a dropped connection is asked for once more after this. */
export const OWN_CATCH_UP_RETRY_MS = 1_200

const defaultSleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

function retryAfterMs(response: Awaited<ReturnType<FetchLike>>): number {
  const seconds = Number(response.headers?.get('retry-after'))
  return Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 60) * 1000 : OWN_CATCH_UP_RATE_WAIT_MS
}

/**
 * Why a run failed, in one short sentence for the sheet (never a bare Retry). Null when the sheet
 * already says it another way (the allowance's balance line) or there is nothing to say.
 */
export function ownCatchUpFailureReason(result: Extract<OwnCatchUpResult, { ok: false }>): string | null {
  if (result.allowanceUsed) return null
  const where = result.title ? `“${result.title}”` : result.chapter === undefined ? 'this chapter' : `chapter ${result.chapter}`
  switch (result.status) {
    case 0: return 'Could not reach Tinct. Check your connection, then retry.'
    case 401: return 'Your sign-in has expired. Sign in again, then retry.'
    case 404: return 'This book is not in your account’s library, so it cannot be summarised.'
    case 413: return `${where[0].toUpperCase()}${where.slice(1)} is too long to send.`
    case 429: return 'Too many summary requests in a minute. Trying again shortly.'
    case 503: return result.resting ? 'AI is resting. Trying again shortly.' : 'The summary service is unavailable. Trying again shortly.'
    case 502: return `The AI could not summarise ${where}. Retry picks up from there.`
    default: return `The summary stopped at ${where} (error ${result.status}). Retry picks up from there.`
  }
}

function matches(stored: OwnCatchUpStep | null | undefined, step: OwnCatchUpPlanStep, textHash: string, previousHash: string): stored is OwnCatchUpStep {
  return !!stored && stored.chapter === step.chapter && stored.complete === step.complete && stored.through === step.through
    && stored.textHash === textHash && stored.previousHash === previousHash
}

/**
 * Build (or read back) the cumulative recap through the last step. One GET
 * reads the account's stored chain; each step it does not cover is one POST,
 * in order, carrying that chapter and the recap before it. `onProgress`
 * reports the step being worked on. Any failure is a result, never a throw;
 * the steps already stored stay stored, so a retry resumes where it stopped.
 */
export async function buildOwnCatchUp(input: {
  bookHex: string
  bookTitle?: string
  steps: readonly OwnCatchUpPlanStep[]
  token: string | null
  fetchImpl?: FetchLike
  onProgress?: (done: number, total: number) => void
  cancelled?: () => boolean
  /** Tests: the waits between attempts. */
  sleep?: (ms: number) => Promise<void>
}): Promise<OwnCatchUpResult> {
  const sleep = input.sleep ?? defaultSleep
  const fetchImpl = input.fetchImpl ?? (typeof fetch === 'function' ? (url: string, init: RequestInit) => fetch(url, init) : null)
  if (!fetchImpl) return { ok: false, status: 0 }
  if (!input.token) return { ok: false, status: 401 }
  const steps = input.steps
  if (steps.length === 0) return { ok: true, recap: '' }
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${input.token}`, ...internalTrafficHeaders() }
  const last = steps[steps.length - 1]
  let lookup: OwnCatchUpLookup = { steps: [], current: null }
  try {
    const response = await fetchImpl(apiUrl(`${OWN_CATCH_UP_ROUTE}?book=${encodeURIComponent(input.bookHex)}&through=${last.chapter}`), { method: 'GET', headers })
    if (!response.ok) return { ok: false, status: response.status }
    const data = await response.json() as Partial<OwnCatchUpLookup> | null
    lookup = { steps: Array.isArray(data?.steps) ? data.steps : [], current: data?.current ?? null }
  } catch {
    return { ok: false, status: 0 }
  }
  const stored = new Map(lookup.steps.map(step => [step.chapter, step]))
  let recap = ''
  for (let index = 0; index < steps.length; index++) {
    if (input.cancelled?.()) return { ok: false, status: 0 }
    const step = steps[index]
    const [textHash, previousHash] = await Promise.all([sha256Hex(step.text), sha256Hex(recap)])
    const kept = step.complete ? stored.get(step.chapter) : lookup.current
    if (matches(kept, step, textHash, previousHash)) { recap = kept.recap; continue }
    input.onProgress?.(index, steps.length)
    const body: OwnCatchUpRequest = {
      book: input.bookHex, chapter: step.chapter, complete: step.complete, through: step.through,
      text: step.text, previous: recap.slice(0, OWN_CATCH_UP_MAX_RECAP_CHARS),
      ...(input.bookTitle ? { bookTitle: input.bookTitle.slice(0, OWN_CATCH_UP_MAX_TITLE_CHARS) } : {}),
      ...(step.title ? { chapterTitle: step.title } : {}),
    }
    const at = { chapter: step.chapter, ...(step.title ? { title: step.title } : {}) }
    let rateWaits = 0
    let retried = false
    for (;;) {
      const outcome = await postStep(fetchImpl, headers, body)
      if (outcome.ok) { recap = outcome.recap; break }
      if (input.cancelled?.()) return { ok: false, status: 0 }
      // The per-minute limit: wait it out and carry on with this section, still in progress.
      if (outcome.status === 429 && rateWaits < OWN_CATCH_UP_RATE_WAITS) {
        rateWaits++
        await sleep(outcome.waitMs ?? OWN_CATCH_UP_RATE_WAIT_MS)
        continue
      }
      // An unusable answer or a dropped connection: once more, then say which section.
      if ((outcome.status === 502 || outcome.status === 0) && !retried) {
        retried = true
        await sleep(OWN_CATCH_UP_RETRY_MS)
        continue
      }
      const { waitMs: _waitMs, ...failure } = outcome
      return { ...failure, ...at }
    }
  }
  input.onProgress?.(steps.length, steps.length)
  return { ok: true, recap }
}

type StepOutcome =
  | { ok: true; recap: string }
  | { ok: false; status: number; allowanceUsed?: true; resting?: true; waitMs?: number }

async function postStep(fetchImpl: FetchLike, headers: Record<string, string>, body: OwnCatchUpRequest): Promise<StepOutcome> {
  try {
    const response = await fetchImpl(apiUrl(OWN_CATCH_UP_ROUTE), { method: 'POST', headers, body: JSON.stringify(body) })
    if (!response.ok) {
      if (await isAllowanceUsedResponse(response)) return { ok: false, status: response.status, allowanceUsed: true }
      if (response.status === 429) return { ok: false, status: 429, waitMs: retryAfterMs(response) }
      if (response.status === 503 && await labChatErrorType(response) === AI_RESTING_ERROR_TYPE) return { ok: false, status: 503, resting: true }
      return { ok: false, status: response.status }
    }
    const data = await response.json() as Partial<OwnCatchUpResponse> | null
    // A 200 without a recap is the model's fault, not the reader's: treat it as an unusable answer.
    if (typeof data?.recap !== 'string') return { ok: false, status: 502 }
    return { ok: true, recap: data.recap }
  } catch {
    return { ok: false, status: 0 }
  }
}
