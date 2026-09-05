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

/** Sidecar `alignment` block (chapter-level carries `minimumParagraphRatio`). */
export interface SidecarAlignment {
  expectedWords?: number
  heardWords?: number
  matchedWords?: number
  matchRatio?: number
  minimumParagraphRatio?: number
}

/**
 * Provenance of a paragraph's word timings: the sidecar's forced-alignment
 * match ratio and the chapter threshold it is judged against.
 */
export interface FollowAlignment {
  matchRatio: number
  threshold: number
}

export type FollowGranularity = 'word' | 'sentence'

export interface FollowParagraph {
  index: number
  text: string
  duration?: number
  words?: TimedWord[]
  file?: string
  alignment?: FollowAlignment
}

/** Half-open word range `[from, to)` marked current, with its sidecar times. */
export interface FollowSpan {
  from: number
  to: number
  start: number
  end: number
}

export type FollowTarget =
  | {
      kind: 'word'
      paragraphIndex: number
      wordIndex: number
      /** Present only when the paragraph follows sentence by sentence. */
      granularity?: 'sentence'
      span?: FollowSpan
    }
  | { kind: 'paragraph'; paragraphIndex: number }
  | { kind: 'none' }

/** Sidecar paragraphs aligned below this ratio follow by sentence, not word. */
export const DEFAULT_FOLLOW_MATCH_RATIO = 0.85

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
  if (paragraph.words.length === 0 || !paragraph.words.every(isTimedWord)) return undefined
  const words = paragraph.words
  for (let index = 1; index < words.length; index += 1) {
    if (words[index].start < words[index - 1].start) return undefined
  }
  return words
}

/** Split on whitespace so validated manifest or sidecar times line up with hearing tokens. */
export function chapterWordsFromText(text: string): string[] {
  return text.split(/\s+/).map(part => part.trim()).filter(Boolean)
}

function isSilentVerseMarker(token: string): boolean {
  return /^[⁰¹²³⁴⁵⁶⁷⁸⁹]+$/.test(token)
}

function semanticToken(token: string): string {
  return token
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}']/gu, '')
}

/**
 * Word sidecars omit printed verse numbers. Insert zero-duration timing entries
 * for those silent tokens so every spoken word still addresses its painted word.
 */
export function alignTimedWordsToText(text: string, words: TimedWord[] | undefined): TimedWord[] | undefined {
  if (!words?.length) return undefined
  const tokens = chapterWordsFromText(text)
  const spokenTokens = tokens.filter(token => !isSilentVerseMarker(token))
  if (spokenTokens.length !== words.length) return undefined
  if (spokenTokens.some((token, index) => semanticToken(token) !== semanticToken(words[index].text))) return undefined
  if (tokens.length === words.length) {
    return words.map((word, index) => ({ ...word, text: tokens[index] }))
  }
  let spokenIndex = 0
  return tokens.map((token) => {
    if (isSilentVerseMarker(token)) {
      const nextStart = words[spokenIndex]?.start ?? words[words.length - 1]?.end ?? 0
      return { text: token, start: nextStart, end: nextStart }
    }
    const word = words[spokenIndex++]
    return { ...word, text: token }
  })
}

export function paragraphHasWordTimings(paragraph: FollowParagraph | undefined): boolean {
  return !!paragraph?.words && paragraph.words.length > 0
}

function isUnitRatio(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
}

/** Chapter threshold from `alignment.minimumParagraphRatio`, else the default. */
export function followThresholdFromSidecar(sidecar: WordSidecar | null | undefined): number {
  const ratio = sidecar?.alignment?.minimumParagraphRatio
  return isUnitRatio(ratio) ? ratio : DEFAULT_FOLLOW_MATCH_RATIO
}

export function followAlignmentFromSidecar(
  alignment: SidecarAlignment | undefined,
  threshold: number,
): FollowAlignment | undefined {
  if (!alignment || !isUnitRatio(alignment.matchRatio)) return undefined
  return { matchRatio: alignment.matchRatio, threshold }
}

/**
 * Weakly aligned sidecars still carry one timing per word, but the timings of
 * unmatched words are interpolated and drift inside name lists. Below the
 * threshold the paragraph follows the enclosing sentence instead of one word.
 * Missing alignment metadata (older sidecars) keeps word-level follow.
 */
export function followGranularity(paragraph: FollowParagraph | undefined): FollowGranularity {
  const alignment = paragraph?.alignment
  if (!alignment) return 'word'
  return alignment.matchRatio < alignment.threshold ? 'sentence' : 'word'
}

/** `.`, `!`, `?`, `;` or `:` ending a token (closing quotes/brackets allowed). */
export function isSentenceTerminator(text: string): boolean {
  return /[.!?;:][\u0022\u0027\u2019\u201d)\]]*$/.test(text)
}

/**
 * Sentence containing `wordIndex`: from the token after the previous
 * terminator (or a verse marker, which opens its own span) to the next
 * terminator inclusive. Times are the first word's start and last word's end.
 */
export function sentenceSpanAt(words: TimedWord[], wordIndex: number): FollowSpan {
  const last = words.length - 1
  const at = Math.max(0, Math.min(wordIndex, last))
  let from = 0
  for (let i = at; i > 0; i -= 1) {
    if (isSilentVerseMarker(words[i].text) || isSentenceTerminator(words[i - 1].text)) {
      from = i
      break
    }
  }
  let to = words.length
  for (let i = at; i < last; i += 1) {
    if (isSentenceTerminator(words[i].text) || isSilentVerseMarker(words[i + 1].text)) {
      to = i + 1
      break
    }
  }
  return { from, to, start: words[from].start, end: words[to - 1].end }
}

/** Word target for a paragraph, widened to its sentence when the alignment is weak. */
export function followWordTarget(paragraph: FollowParagraph, wordIndex: number): FollowTarget {
  const target: FollowTarget = { kind: 'word', paragraphIndex: paragraph.index, wordIndex }
  if (paragraph.words && paragraph.words.length > 0 && followGranularity(paragraph) === 'sentence') {
    return { ...target, granularity: 'sentence', span: sentenceSpanAt(paragraph.words, wordIndex) }
  }
  return target
}

/** Paint role of one painted word under a follow target; null when not word-following. */
export function followWordRole(
  follow: FollowTarget,
  paragraphIndex: number,
  wordIndex: number,
): 'spoken' | 'current' | 'upcoming' | null {
  if (follow.kind !== 'word') return null
  if (paragraphIndex < follow.paragraphIndex) return 'spoken'
  if (paragraphIndex > follow.paragraphIndex) return 'upcoming'
  const from = follow.span ? follow.span.from : follow.wordIndex
  const to = follow.span ? follow.span.to : follow.wordIndex + 1
  if (wordIndex < from) return 'spoken'
  if (wordIndex >= to) return 'upcoming'
  return 'current'
}

/**
 * Validated manifest / sidecar `words` win. No invented linear timings;
 * otherwise the reader falls back to paragraph-level follow.
 */
export function followParagraphFromManifest(
  index: number,
  text: string,
  manifestParagraph: ManifestParagraph | undefined,
): FollowParagraph {
  const duration = typeof manifestParagraph?.duration === 'number' ? manifestParagraph.duration : undefined
  const words = alignTimedWordsToText(text, wordsFromManifestParagraph(manifestParagraph))
  return {
    index,
    text,
    duration,
    words,
    file: typeof manifestParagraph?.file === 'string' ? manifestParagraph.file : undefined,
  }
}

export function paragraphDurationSeconds(paragraph: FollowParagraph): number | null {
  if (typeof paragraph.duration === 'number' && paragraph.duration > 0) {
    return paragraph.duration
  }
  if (paragraph.words && paragraph.words.length > 0) {
    return paragraph.words[paragraph.words.length - 1].end
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

/** Highlight time equals audio element time — timings come from a validated manifest or sidecar. */
export function followTimeFromAudio(currentTime: number): number {
  return Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0
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
          ? followWordTarget(paragraph, wordIndexAtTime(paragraph.words, elapsedSeconds - cursor))
          : { kind: 'paragraph', paragraphIndex: paragraph.index }
      }
      return { kind: 'none' }
    }

    const local = elapsedSeconds - cursor
    if (local < duration || paragraph === paragraphs[paragraphs.length - 1]) {
      if (paragraph.words) {
        return followWordTarget(paragraph, wordIndexAtTime(paragraph.words, Math.max(0, local)))
      }
      return { kind: 'paragraph', paragraphIndex: paragraph.index }
    }
    cursor += duration
  }

  const last = paragraphs[paragraphs.length - 1]
  return last.words
    ? followWordTarget(last, last.words.length - 1)
    : { kind: 'paragraph', paragraphIndex: last.index }
}

/**
 * Follow the paragraph (or word) that is actually playing.
 * Word-level only when that paragraph already has timings.
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
    return followWordTarget(paragraph, wordIndexAtTime(paragraph.words, Math.max(0, input.currentTime)))
  }
  return { kind: 'paragraph', paragraphIndex: paragraph.index }
}

export interface WordSidecar {
  chapter?: number
  alignment?: SidecarAlignment
  paragraphs?: Array<{
    paragraph?: number
    file?: string
    words?: unknown
    alignment?: SidecarAlignment
  }>
}

/** Sidecar word timings replace paragraphs that still lack manifest `words`. */
export function mergeSidecarWords(
  paragraphs: FollowParagraph[],
  sidecar: WordSidecar | null | undefined,
  expectedChapter?: number,
): FollowParagraph[] {
  if (!sidecar?.paragraphs?.length) return paragraphs
  if (expectedChapter != null && sidecar.chapter !== expectedChapter) return paragraphs
  const threshold = followThresholdFromSidecar(sidecar)
  const byIndex = new Map<number, { file?: string; words: TimedWord[]; alignment?: FollowAlignment }>()
  for (const entry of sidecar.paragraphs) {
    if (typeof entry.paragraph !== 'number') continue
    const words = wordsFromManifestParagraph({ words: entry.words as TimedWord[] })
    if (!words) continue
    byIndex.set(entry.paragraph, {
      file: entry.file,
      words,
      alignment: followAlignmentFromSidecar(entry.alignment, threshold),
    })
  }
  return paragraphs.map((paragraph) => {
    if (paragraph.words && paragraph.words.length > 0) return paragraph
    const match = byIndex.get(paragraph.index) || byIndex.get(paragraph.index + 1)
    if (!match || (paragraph.file && match.file && paragraph.file !== match.file)) return paragraph
    const words = alignTimedWordsToText(paragraph.text, match.words)
    if (!words) return paragraph
    return match.alignment ? { ...paragraph, words, alignment: match.alignment } : { ...paragraph, words }
  })
}
