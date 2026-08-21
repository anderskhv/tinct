import {
  type AudioManifest,
  type AudioWord,
  type ParagraphAudio,
  type WordSidecar,
  parseAudioWords,
  tokenizeParagraphWords,
} from './wordTimings'

export const INTERPOLATION_BACKENDS = new Set(['interpolate', 'linear', 'word-count'])

export function assertProductionAlignerBackend(backend: string): void {
  const key = backend.trim().toLowerCase()
  if (INTERPOLATION_BACKENDS.has(key)) {
    throw new Error(
      `Backend "${backend}" is not a production path. Use Whisper word timestamps `
      + `(--backend whisper) or a checked-in aligner fixture (--backend fixture). `
      + 'Linear word-count interpolation is forbidden.',
    )
  }
}

export function normalizeAlignToken(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}']+/gu, '')
}

const SKIP_LIMIT = 3
const MIN_COVERAGE = 0.5

/**
 * Map aligner (Whisper) word windows onto source-text tokens.
 * Sequential normalized match; unmatched source words are omitted
 * rather than given interpolated times.
 */
export function mapAlignedWordsToSource(sourceText: string, aligned: AudioWord[]): AudioWord[] {
  const sourceWords = tokenizeParagraphWords(sourceText).filter(t => t.isWord)
  if (sourceWords.length === 0 || aligned.length === 0) return []

  const out: AudioWord[] = []
  let a = 0
  for (const token of sourceWords) {
    const want = normalizeAlignToken(token.text)
    if (!want) continue
    let found = -1
    const limit = Math.min(aligned.length, a + SKIP_LIMIT + 1)
    for (let i = a; i < limit; i++) {
      if (normalizeAlignToken(aligned[i].text) === want) {
        found = i
        break
      }
    }
    if (found < 0) continue
    const hit = aligned[found]
    out.push({ text: token.text, start: hit.start, end: hit.end })
    a = found + 1
  }
  return out
}

export function coverageRatio(sourceText: string, mapped: AudioWord[]): number {
  const sourceCount = tokenizeParagraphWords(sourceText).filter(t => t.isWord).length
  if (sourceCount === 0) return 0
  return mapped.length / sourceCount
}

export function validateMappedWords(
  words: AudioWord[],
  durationSec?: number,
): AudioWord[] {
  const parsed = parseAudioWords(words)
  if (!parsed) return []
  const out: AudioWord[] = []
  let prevStart = -1
  for (const word of parsed) {
    if (word.start < prevStart) continue
    if (durationSec !== undefined && word.start > durationSec + 0.35) continue
    const end = durationSec !== undefined ? Math.min(word.end, durationSec + 0.05) : word.end
    if (end <= word.start) continue
    out.push({ text: word.text, start: word.start, end })
    prevStart = word.start
  }
  return out
}

export function alignParagraphWords(
  sourceText: string,
  aligned: AudioWord[],
  durationSec?: number,
): AudioWord[] {
  const mapped = validateMappedWords(mapAlignedWordsToSource(sourceText, aligned), durationSec)
  if (coverageRatio(sourceText, mapped) < MIN_COVERAGE) return []
  return mapped
}

export function mergeWordsIntoManifest(
  manifest: AudioManifest,
  wordsByParagraph: Map<number, AudioWord[]>,
): AudioManifest {
  return {
    ...manifest,
    paragraphs: manifest.paragraphs.map(para => {
      const words = wordsByParagraph.get(para.paragraph)
      if (!words?.length) return para
      return { ...para, words }
    }),
  }
}

export function sidecarFromManifest(
  manifest: AudioManifest,
  meta?: { bookId?: string; editionKey?: string },
): WordSidecar {
  return {
    chapter: manifest.chapter,
    bookId: meta?.bookId,
    editionKey: meta?.editionKey,
    paragraphs: manifest.paragraphs
      .filter((p): p is ParagraphAudio & { words: AudioWord[] } => Boolean(p.words?.length))
      .map(p => ({
        paragraph: p.paragraph,
        file: p.file,
        words: p.words,
      })),
  }
}
