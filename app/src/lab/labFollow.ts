export interface TimedWord {
  text: string
  start: number
  end: number
}

export interface ManifestParagraph {
  paragraph?: number
  duration?: number
  file?: string
  words?: TimedWord[]
}

export interface FollowParagraph {
  index: number
  text: string
  duration?: number
  words?: TimedWord[]
  file?: string
}

export type FollowTarget =
  | { kind: 'word'; paragraphIndex: number; wordIndex: number }
  | { kind: 'paragraph'; paragraphIndex: number }
  | { kind: 'none' }

function isTimedWord(value: unknown): value is TimedWord {
  if (!value || typeof value !== 'object') return false
  const word = value as Partial<TimedWord>
  return typeof word.text === 'string'
    && typeof word.start === 'number'
    && Number.isFinite(word.start)
    && typeof word.end === 'number'
    && Number.isFinite(word.end)
    && word.end >= word.start
}

export function wordsFromManifestParagraph(paragraph: ManifestParagraph | undefined): TimedWord[] | undefined {
  if (!paragraph || !Array.isArray(paragraph.words)) return undefined
  const words = paragraph.words.filter(isTimedWord)
  return words.length > 0 ? words : undefined
}

/** Split on whitespace so derived times line up with reading / hearing tokens. */
export function chapterWordsFromText(text: string): string[] {
  return text.split(/\s+/).map(part => part.trim()).filter(Boolean)
}

/**
 * Proportional word times from this paragraph's MP3 duration + its chapter words.
 * Not a downloaded corpus — used when words.json is missing.
 */
/**
 * Even-split derived times span the full clip. Highlight lag handles trailing pad;
 * compressing into 0.86× made highlights race ahead of the voice.
 */
export const DERIVED_SPEECH_SPAN = 1

export function wordsFromParagraphDuration(text: string, duration: number): TimedWord[] | undefined {
  if (!(duration > 0)) return undefined
  const tokens = chapterWordsFromText(text)
  if (tokens.length === 0) return undefined
  const usable = duration * DERIVED_SPEECH_SPAN
  const unit = usable / tokens.length
  return tokens.map((word, index) => ({
    text: word,
    start: index * unit,
    end: (index + 1) * unit,
  }))
}

export function ensureDerivedWordTimes(paragraph: FollowParagraph): FollowParagraph {
  if (paragraph.words && paragraph.words.length > 0) return paragraph
  const duration = typeof paragraph.duration === 'number' ? paragraph.duration : 0
  const words = wordsFromParagraphDuration(paragraph.text, duration)
  return words ? { ...paragraph, words } : paragraph
}

/** True when `words` are the even-split fallback, not spoken start/end times. */
export function wordsLookDerived(paragraph: FollowParagraph): boolean {
  const duration = typeof paragraph.duration === 'number' ? paragraph.duration : 0
  const derived = wordsFromParagraphDuration(paragraph.text, duration)
  const words = paragraph.words
  if (!derived || !words || derived.length !== words.length) return false
  return derived.every((word, index) => (
    Math.abs(word.start - words[index].start) < 1e-6
    && Math.abs(word.end - words[index].end) < 1e-6
  ))
}

/**
 * Manifest / sidecar `words` win. Otherwise derive times from MP3 duration + text.
 */
export function followParagraphFromManifest(
  index: number,
  text: string,
  manifestParagraph: ManifestParagraph | undefined,
): FollowParagraph {
  const duration = typeof manifestParagraph?.duration === 'number' ? manifestParagraph.duration : undefined
  const words = wordsFromManifestParagraph(manifestParagraph)
    ?? (duration != null ? wordsFromParagraphDuration(text, duration) : undefined)
  return {
    index,
    text,
    duration,
    words,
    file: typeof manifestParagraph?.file === 'string' ? manifestParagraph.file : undefined,
  }
}

export function paragraphDurationSeconds(paragraph: FollowParagraph): number | null {
  if (paragraph.words && paragraph.words.length > 0) {
    return paragraph.words[paragraph.words.length - 1].end
  }
  if (typeof paragraph.duration === 'number' && paragraph.duration > 0) {
    return paragraph.duration
  }
  return null
}

export function wordIndexAtTime(words: TimedWord[], localSeconds: number): number {
  if (words.length === 0) return -1
  let index = 0
  for (let i = 0; i < words.length; i++) {
    if (localSeconds >= words[i].start) index = i
    else break
  }
  return index
}

/**
 * Delay even-split derived highlights so they do not run ahead of narration.
 * Real manifest / sidecar word starts are used as-is (no lag).
 */
export function followDerivedLagSeconds(playbackRate: number): number {
  const rate = Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1
  return 0.15 * rate + 0.05
}

/** Map audio element time to highlight time (derived paragraphs only). */
export function followTimeFromAudio(currentTime: number, playbackRate = 1, derived = false): number {
  const t = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0
  if (!derived) return t
  return Math.max(0, t - followDerivedLagSeconds(playbackRate))
}

/**
 * Resolve the quiet follow target at a chapter-elapsed time.
 * Word-level only when the paragraph already carries `words`.
 */
export function followAtTime(paragraphs: FollowParagraph[], elapsedSeconds: number): FollowTarget {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0 || paragraphs.length === 0) {
    return { kind: 'none' }
  }

  let cursor = 0
  for (const paragraph of paragraphs) {
    const duration = paragraphDurationSeconds(paragraph)
    if (duration == null) {
      if (elapsedSeconds >= cursor) {
        return paragraph.words
          ? { kind: 'word', paragraphIndex: paragraph.index, wordIndex: wordIndexAtTime(paragraph.words, elapsedSeconds - cursor) }
          : { kind: 'paragraph', paragraphIndex: paragraph.index }
      }
      return { kind: 'none' }
    }

    const local = elapsedSeconds - cursor
    if (local < duration || paragraph === paragraphs[paragraphs.length - 1]) {
      if (paragraph.words) {
        return {
          kind: 'word',
          paragraphIndex: paragraph.index,
          wordIndex: wordIndexAtTime(paragraph.words, Math.max(0, local)),
        }
      }
      return { kind: 'paragraph', paragraphIndex: paragraph.index }
    }
    cursor += duration
  }

  const last = paragraphs[paragraphs.length - 1]
  return last.words
    ? { kind: 'word', paragraphIndex: last.index, wordIndex: last.words.length - 1 }
    : { kind: 'paragraph', paragraphIndex: last.index }
}

/**
 * Follow the paragraph (or word) that is actually playing.
 * Word-level only when that paragraph already has real timings.
 */
export function followFromPlayback(input: {
  paragraphs: FollowParagraph[]
  paragraphIndex: number
  currentTime: number
}): FollowTarget {
  const paragraph = input.paragraphs.find(item => item.index === input.paragraphIndex)
    ?? input.paragraphs[input.paragraphIndex]
  if (!paragraph) return { kind: 'none' }
  if (paragraph.words && paragraph.words.length > 0) {
    return {
      kind: 'word',
      paragraphIndex: paragraph.index,
      wordIndex: wordIndexAtTime(paragraph.words, Math.max(0, input.currentTime)),
    }
  }
  return { kind: 'paragraph', paragraphIndex: paragraph.index }
}

export interface WordSidecar {
  chapter?: number
  paragraphs?: Array<{
    paragraph?: number
    file?: string
    words?: unknown
  }>
}

/** Real manifest `words` win. Sidecar replaces missing or even-split derived times. */
export function mergeSidecarWords(
  paragraphs: FollowParagraph[],
  sidecar: WordSidecar | null | undefined,
): FollowParagraph[] {
  if (!sidecar?.paragraphs?.length) return paragraphs
  const byIndex = new Map<number, TimedWord[]>()
  for (const entry of sidecar.paragraphs) {
    if (typeof entry.paragraph !== 'number') continue
    const words = wordsFromManifestParagraph({ words: entry.words as TimedWord[] })
    if (!words) continue
    byIndex.set(entry.paragraph, words)
  }
  return paragraphs.map((paragraph) => {
    const words = byIndex.get(paragraph.index) || byIndex.get(paragraph.index + 1)
    if (!words) return paragraph
    if (paragraph.words && paragraph.words.length > 0 && !wordsLookDerived(paragraph)) {
      return paragraph
    }
    return { ...paragraph, words }
  })
}
