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
  /** `allowanceUsed`: refused at zero (402 allowance_used, only while the AI allowance is on). */
  | { ok: false; status: number; allowanceUsed?: true }

type FetchLike = (input: string, init: RequestInit) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>

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
}): Promise<OwnCatchUpResult> {
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
    try {
      const response = await fetchImpl(apiUrl(OWN_CATCH_UP_ROUTE), { method: 'POST', headers, body: JSON.stringify(body) })
      if (!response.ok) {
        return await isAllowanceUsedResponse(response) ? { ok: false, status: response.status, allowanceUsed: true } : { ok: false, status: response.status }
      }
      const data = await response.json() as Partial<OwnCatchUpResponse> | null
      if (typeof data?.recap !== 'string') return { ok: false, status: response.status }
      recap = data.recap
    } catch {
      return { ok: false, status: 0 }
    }
  }
  input.onProgress?.(steps.length, steps.length)
  return { ok: true, recap }
}
