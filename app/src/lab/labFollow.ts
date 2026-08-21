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

/**
 * Attach real word timings when the audio manifest provides them.
 * Never invent timings by splitting the paragraph on whitespace.
 */
export function followParagraphFromManifest(
  index: number,
  text: string,
  manifestParagraph: ManifestParagraph | undefined,
): FollowParagraph {
  const words = wordsFromManifestParagraph(manifestParagraph)
  return {
    index,
    text,
    duration: typeof manifestParagraph?.duration === 'number' ? manifestParagraph.duration : undefined,
    words,
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
  for (let i = 0; i < words.length; i++) {
    if (localSeconds >= words[i].start && localSeconds < words[i].end) return i
  }
  if (localSeconds >= words[words.length - 1].end) return words.length - 1
  return 0
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
