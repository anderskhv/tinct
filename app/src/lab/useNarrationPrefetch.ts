import { useEffect, useRef } from 'react'
import { ensureNarration, type NarrationParagraphResult } from './labNarration'

/** Paragraphs kept ready at a chapter's opening so pressing Play is immediate. */
export const NARRATION_PREFETCH_PARAGRAPHS = 3
/** How close to the end of a chapter (in paragraphs) the next chapter starts warming. */
export const NARRATION_PREFETCH_TAIL = 3
const MAX_ROUNDS = 12
export const NARRATION_PREFETCH_TARGET_SECONDS = 45

export interface NarrationPrefetchInput {
  active: boolean
  voice: string | null
  bookId: string
  editionKey: string
  chapter: number
  nextChapter: number | null
  paragraphCount: number
  /** The paragraph the reader is at: the one being narrated, else the page's first paragraph. */
  currentParagraph: number
  authToken?: string | null
  readToken?: () => Promise<string | null>
  /** Test seam. */
  ensureImpl?: typeof ensureNarration
}

function complete(results: NarrationParagraphResult[], indexes: number[]): boolean {
  const readySeconds = results.reduce((total, result) => {
    if (result.status !== 'ready' && result.status !== 'partial' && result.status !== 'pending') return total
    return total + result.chunks.reduce((sum, chunk) => sum + (chunk.ready && typeof chunk.duration === 'number' ? chunk.duration : 0), 0)
  }, 0)
  if (readySeconds >= NARRATION_PREFETCH_TARGET_SECONDS) return true
  return indexes.every((index) => {
    const result = results.find(item => item.paragraph === index)
    return result?.status === 'ready' || result?.status === 'failed' || result?.status === 'text_mismatch'
  })
}

/**
 * Warms narration ahead of the reader, one sentence group per round:
 * the first paragraphs of the chapter on open, and the first paragraphs of
 * the next chapter once the reader is within the last few paragraphs. Each
 * (chapter, voice) is warmed once per mount; rounds stop on any failure and
 * when the tuple changes. The listen hook's own look-ahead and the Worker's
 * per-chunk lock keep this from generating anything twice.
 */
export function useNarrationPrefetch(input: NarrationPrefetchInput): void {
  const doneRef = useRef<Set<string>>(new Set())
  const inputRef = useRef(input)
  inputRef.current = input
  const { active, voice, bookId, editionKey, chapter, nextChapter, paragraphCount, currentParagraph } = input
  const nearEnd = paragraphCount > 0 && currentParagraph >= paragraphCount - NARRATION_PREFETCH_TAIL

  const warmChapter = (target: number, key: string) => {
    const controller = new AbortController()
    let cancelled = false
    const run = async () => {
      const current = inputRef.current
      const token = current.authToken ?? (current.readToken ? await current.readToken() : null)
      // Preparation needs a signed-in reader; without a token every round would be a 401.
      if (cancelled || !token) return
      const indexes = Array.from({ length: NARRATION_PREFETCH_PARAGRAPHS }, (_, index) => index)
      let finished = false
      for (let round = 0; round < MAX_ROUNDS && !cancelled; round += 1) {
        let results: NarrationParagraphResult[]
        try {
          results = await (current.ensureImpl ?? ensureNarration)({
            bookId, editionKey, chapter: target, voice: voice as string,
            paragraphs: indexes.map(index => ({ index })),
            mode: 'next',
          }, { signal: controller.signal, authToken: token })
        } catch {
          return
        }
        if (results.length === 0 || complete(results, indexes)) { finished = true; break }
        if (results.some(item => item.status === 'failed' || ('failure' in item && item.failure))) { finished = true; break }
      }
      // Marked done only once complete (or given up), so an aborted warm can resume.
      if (finished && !cancelled) doneRef.current.add(key)
    }
    void run()
    return () => { cancelled = true; controller.abort() }
  }

  // Only active playback may warm the next chapter. Opening preparation is
  // owned by the library click and silent reading never schedules synthesis.
  useEffect(() => {
    if (!active || !voice || !nearEnd || nextChapter == null) return
    const key = `${bookId}/${editionKey}/${nextChapter}/${voice}`
    if (doneRef.current.has(key)) return
    return warmChapter(nextChapter, key)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, voice, bookId, editionKey, chapter, nextChapter, nearEnd])
}
