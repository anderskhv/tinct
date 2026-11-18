/**
 * Where in the chapter the reader is, said truthfully.
 *
 * The position record knows the paragraph the reader stopped in and the
 * catalogue knows how many paragraphs the chapter has, so the hero can say
 * "You're at the start of / in the middle of / near the end of Proverbs 17"
 * instead of a flat "You stopped in". "Finished" is never inferred from a
 * fraction: it needs the session's own completed state or the reader's
 * finished-chapter record.
 */
export type ChapterProgress = 'start' | 'middle' | 'near-end' | 'finished'

/** Read-through fraction at or below this is "at the start". */
export const RECAP_START_FRACTION = 0.25
/** Read-through fraction above this is "near the end". */
export const RECAP_NEAR_END_FRACTION = 0.8

/**
 * Progress from the 0-based paragraph the reader stopped in and the chapter's
 * paragraph count. The fraction counts the stopped-in paragraph as read
 * (`(index + 1) / count`) because the reader has at least started it.
 * Unknown or tiny chapter lengths only ever claim "start" (paragraph 0) or
 * "middle" — the one claim that is always true of an unfinished chapter.
 */
export function chapterProgress(input: { paragraphIndex: number; paragraphCount: number | null; finished: boolean }): ChapterProgress {
  if (input.finished) return 'finished'
  const index = Number.isFinite(input.paragraphIndex) ? Math.max(0, Math.floor(input.paragraphIndex)) : 0
  const count = typeof input.paragraphCount === 'number' && Number.isFinite(input.paragraphCount) ? Math.floor(input.paragraphCount) : null
  if (count === null || count < 3) return index === 0 && (count === null || count >= 2) ? 'start' : 'middle'
  const fraction = (Math.min(index, count - 1) + 1) / count
  if (index === 0 || fraction <= RECAP_START_FRACTION) return 'start'
  if (fraction > RECAP_NEAR_END_FRACTION) return 'near-end'
  return 'middle'
}

/** A chapter label longer than this reads as its first sentence or words in a headline. */
export const CONCISE_CHAPTER_CHARS = 60

/**
 * A chapter label short enough for a headline. Most labels are kept whole; a
 * long one (an added book's chapter written as its whole opening sentence,
 * "The First Book of the Dialogues of L. Annaeus Seneca, Addressed to
 * Lucilius. “Why, …”") is cut at its first full stop, colon or dash after a
 * real word (not an initial like "L."), else at the last whole word, with "…".
 */
export function conciseChapterLabel(label: string, max = CONCISE_CHAPTER_CHARS): string {
  const text = String(label ?? '').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  const stop = /(?:[.:;!?]|\s[—–-])\s/g
  for (let match = stop.exec(text); match; match = stop.exec(text)) {
    const head = text.slice(0, match.index).replace(/[\s,]+$/, '')
    const lastWord = head.split(' ').pop() ?? ''
    if (/^\p{L}{1,2}$/u.test(lastWord) || /^(?:Mr|Mrs|Dr|St|Ch|No|Vol|Bk)$/i.test(lastWord)) continue
    if (head.length >= 8 && head.length <= max) return head
    if (head.length > max) break
  }
  const cut = text.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return (space > max / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:.—–-]+$/, '') + '…'
}

/** The hero headline: "You’re in the middle of Proverbs 17". */
export function positionLine(progress: ChapterProgress, chapterLabel: string): string {
  switch (progress) {
    case 'start': return `You’re at the start of ${chapterLabel}`
    case 'near-end': return `You’re near the end of ${chapterLabel}`
    case 'finished': return `You finished ${chapterLabel}`
    default: return `You’re in the middle of ${chapterLabel}`
  }
}

/**
 * Whether the "so far" summary should also cover the previous chapter: only
 * when the reader actually finished it, and either they have barely begun
 * this one (so the previous chapter is what "so far" means) or both chapters
 * were read in the same sitting.
 */
export function includesPreviousChapter(input: {
  chapterNumber: number
  progress: ChapterProgress
  previousChapterFinished: boolean
  sameSitting: boolean
}): boolean {
  if (input.chapterNumber <= 1 || !input.previousChapterFinished) return false
  return input.progress === 'start' || input.sameSitting
}
