/**
 * Word-level audio follow. Paragraph MP3s stay as-is; optional `words`
 * windows are seconds relative to that file. Missing `words` means
 * paragraph-level follow only.
 */

export interface AudioWord {
  text: string
  /** Seconds from the start of this paragraph's MP3. */
  start: number
  /** Seconds from the start of this paragraph's MP3 (exclusive end). */
  end: number
}

export interface ParagraphAudio {
  paragraph: number
  duration: number
  file: string
  words?: AudioWord[]
}

export interface AudioManifest {
  chapter: number
  title: string
  paragraphs: ParagraphAudio[]
}

export interface WordSidecarParagraph {
  paragraph: number
  file?: string
  words: AudioWord[]
}

export interface WordSidecar {
  chapter: number
  bookId?: string
  editionKey?: string
  paragraphs: WordSidecarParagraph[]
}

export interface WordToken {
  text: string
  isWord: boolean
  wordIndex: number | null
  startOffset: number
  endOffset: number
}

const WORD_RE = /\S+/g

export function isAudioWord(value: unknown): value is AudioWord {
  if (!value || typeof value !== 'object') return false
  const w = value as AudioWord
  return typeof w.text === 'string'
    && Number.isFinite(w.start)
    && Number.isFinite(w.end)
    && w.end > w.start
    && w.start >= 0
}

export function parseAudioWords(value: unknown): AudioWord[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  const words: AudioWord[] = []
  for (const item of value) {
    if (!isAudioWord(item)) return undefined
    words.push({ text: item.text, start: item.start, end: item.end })
  }
  return words
}

export function paragraphHasWords(para: ParagraphAudio | undefined | null): boolean {
  return Boolean(para?.words && para.words.length > 0)
}

/**
 * Index of the word that should be marked current at `timeSec`.
 * Uses the last word whose start has been reached so short gaps
 * between windows keep the previous word, not a blank.
 */
export function findWordAtTime(words: AudioWord[] | undefined, timeSec: number): number | null {
  if (!words?.length || !Number.isFinite(timeSec)) return null
  let idx = -1
  for (let i = 0; i < words.length; i++) {
    if (timeSec + 1e-4 >= words[i].start) idx = i
    else break
  }
  if (idx < 0) return timeSec > 0 ? 0 : null
  return idx
}

/** Tokenize the same way the aligner maps source words onto Whisper windows. */
export function tokenizeParagraphWords(text: string): WordToken[] {
  const tokens: WordToken[] = []
  if (!text) return tokens
  WORD_RE.lastIndex = 0
  let last = 0
  let wordIndex = 0
  let match: RegExpExecArray | null
  while ((match = WORD_RE.exec(text)) !== null) {
    if (match.index > last) {
      tokens.push({
        text: text.slice(last, match.index),
        isWord: false,
        wordIndex: null,
        startOffset: last,
        endOffset: match.index,
      })
    }
    tokens.push({
      text: match[0],
      isWord: true,
      wordIndex: wordIndex++,
      startOffset: match.index,
      endOffset: match.index + match[0].length,
    })
    last = match.index + match[0].length
  }
  if (last < text.length) {
    tokens.push({
      text: text.slice(last),
      isWord: false,
      wordIndex: null,
      startOffset: last,
      endOffset: text.length,
    })
  }
  return tokens
}

export function parseWordSidecar(value: unknown): WordSidecar | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as WordSidecar
  if (!Number.isFinite(raw.chapter) || !Array.isArray(raw.paragraphs)) return null
  const paragraphs: WordSidecarParagraph[] = []
  for (const entry of raw.paragraphs) {
    if (!entry || typeof entry !== 'object') continue
    if (!Number.isInteger(entry.paragraph)) continue
    const words = parseAudioWords(entry.words)
    if (!words) continue
    paragraphs.push({
      paragraph: entry.paragraph,
      file: typeof entry.file === 'string' ? entry.file : undefined,
      words,
    })
  }
  if (paragraphs.length === 0) return null
  return {
    chapter: raw.chapter,
    bookId: typeof raw.bookId === 'string' ? raw.bookId : undefined,
    editionKey: typeof raw.editionKey === 'string' ? raw.editionKey : undefined,
    paragraphs,
  }
}

/** Manifest `words` win; sidecar fills paragraphs that have none. */
export function mergeWordSidecar(
  manifest: AudioManifest,
  sidecar: WordSidecar | null | undefined,
): AudioManifest {
  if (!sidecar) return manifest
  const byParagraph = new Map(sidecar.paragraphs.map(p => [p.paragraph, p.words]))
  return {
    ...manifest,
    paragraphs: manifest.paragraphs.map(para => {
      if (paragraphHasWords(para)) return para
      const words = byParagraph.get(para.paragraph)
      return words ? { ...para, words } : para
    }),
  }
}
