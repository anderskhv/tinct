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
  let last = 0
  for (let i = 0; i < words.length; i++) {
    if (words[i].start <= localSeconds) last = i
    else break
  }
  return last
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

/** Manifest `words` win; sidecar fills paragraphs that have none. */
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
    if (paragraph.words && paragraph.words.length > 0) return paragraph
    const words = byIndex.get(paragraph.index) || byIndex.get(paragraph.index + 1)
    return words ? { ...paragraph, words } : paragraph
  })
}
