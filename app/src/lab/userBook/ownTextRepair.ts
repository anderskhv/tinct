/**
 * Scanning errors in a converted PDF, fixed once at conversion (rules: `ownTextRepair.ts`).
 *
 * Only paragraphs the device flags are sent, in small batches, to the account's
 * repair route; each reply is checked again here (a small edit, numbers and figure
 * marks unchanged) before it replaces the paragraph. Signed out, offline, refused or
 * slow: the book keeps its text exactly as converted. The whole pass is bounded in
 * time so it never holds the book back for long.
 */
import {
  OWN_TEXT_REPAIR_BATCH,
  OWN_TEXT_REPAIR_MAX_PARAGRAPHS,
  OWN_TEXT_REPAIR_ROUTE,
  acceptedRepair,
  suspectReason,
  type OwnTextRepairItem,
} from '../../ownTextRepair'
import type { UserBookEdition } from './userEdition'

/** The longest the pass may hold a conversion back. */
export const OWN_TEXT_REPAIR_DEADLINE_MS = 25_000
const PARALLEL = 4

export interface OwnTextRepairResult {
  edition: UserBookEdition
  flagged: number
  repaired: number
  /** Every flagged paragraph was answered (not signed out, refused, offline or past the deadline). */
  complete: boolean
}

/** Marks an edition whose flagged paragraphs have been through the pass (`UserBookEdition.textRepair`). */
export const OWN_TEXT_REPAIR_VERSION = 1

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length

/** Every flagged paragraph's place (`c{chapter index}p{paragraph index}`) and text, in book order. */
export function flaggedParagraphs(edition: Pick<UserBookEdition, 'chapters'>): OwnTextRepairItem[] {
  const items: OwnTextRepairItem[] = []
  edition.chapters.forEach((chapter, c) => (chapter.paragraphs ?? []).forEach((text, p) => {
    if (items.length < OWN_TEXT_REPAIR_MAX_PARAGRAPHS && suspectReason(text)) items.push({ id: `c${c}p${p}`, text })
  }))
  return items
}

/** The edition with accepted repairs applied (a new object; the given one is untouched). */
export function applyRepairs(edition: UserBookEdition, repairs: ReadonlyMap<string, string>): UserBookEdition {
  if (!repairs.size) return edition
  return {
    ...edition,
    chapters: edition.chapters.map((chapter, c) => {
      const changed = (chapter.paragraphs ?? []).some((_, p) => repairs.has(`c${c}p${p}`))
      return changed ? { ...chapter, paragraphs: chapter.paragraphs.map((text, p) => repairs.get(`c${c}p${p}`) ?? text) } : chapter
    }),
  }
}

export async function repairOwnEdition(edition: UserBookEdition, options: {
  book: string
  token: string | null
  fetchImpl?: typeof fetch
  deadlineMs?: number
  /**
   * A book already read (stored before this pass existed): only repairs that keep each paragraph's
   * word count, so a saved place or highlight, addressed by word, stays on the same word.
   */
  keepWordCount?: boolean
}): Promise<OwnTextRepairResult> {
  const flagged = flaggedParagraphs(edition)
  if (!flagged.length) return { edition, flagged: 0, repaired: 0, complete: true }
  if (!options.token || !/^[0-9a-f]{24,64}$/.test(options.book)) return { edition, flagged: flagged.length, repaired: 0, complete: false }
  const fetchImpl = options.fetchImpl ?? fetch
  const deadline = Date.now() + (options.deadlineMs ?? OWN_TEXT_REPAIR_DEADLINE_MS)
  const batches: OwnTextRepairItem[][] = []
  for (let i = 0; i < flagged.length; i += OWN_TEXT_REPAIR_BATCH) batches.push(flagged.slice(i, i + OWN_TEXT_REPAIR_BATCH))
  const sent = new Map(flagged.map(item => [item.id, item.text]))
  const repairs = new Map<string, string>()
  let stop = false
  let answered = 0
  const send = async (items: OwnTextRepairItem[]) => {
    const left = deadline - Date.now()
    if (stop || left <= 0) return
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), left)
    try {
      const response = await fetchImpl(OWN_TEXT_REPAIR_ROUTE, {
        method: 'POST', cache: 'no-store', credentials: 'same-origin', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${options.token}` },
        body: JSON.stringify({ book: options.book, items }),
      })
      // Refused for the account (signed out, not its book, the AI resting): no further batches.
      if (!response.ok) { if ([401, 402, 403, 404, 503].includes(response.status)) stop = true; return }
      const data = await response.json() as { items?: unknown }
      for (const item of Array.isArray(data.items) ? data.items as Array<Record<string, unknown>> : []) {
        const original = typeof item?.id === 'string' ? sent.get(item.id) : undefined
        const fixed = original === undefined ? null : acceptedRepair(original, item.text)
        if (fixed && (!options.keepWordCount || wordCount(fixed) === wordCount(original!))) repairs.set(item.id as string, fixed)
      }
      answered += 1
    } catch { /* offline or past the deadline: this batch keeps its text */ }
    finally { clearTimeout(timer) }
  }
  let next = 0
  await Promise.all(Array.from({ length: Math.min(PARALLEL, batches.length) }, async () => {
    while (next < batches.length && !stop && Date.now() < deadline) await send(batches[next++])
  }))
  return { edition: applyRepairs(edition, repairs), flagged: flagged.length, repaired: repairs.size, complete: answered === batches.length }
}
