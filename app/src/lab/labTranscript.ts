import { tokenizeHearingWords } from './labHearing'

/**
 * Pasted transcripts ("0:20 David Deutsch What it is first: …"): the timestamp
 * and the speaker's name at the head of each turn, so the reader can paint the
 * time muted and the name bold. Display only: words, indexes, positions,
 * highlights and audio are untouched; this only says which leading words of a
 * paragraph are the time and which are the name (Anders, 11 Nov 2026).
 *
 * A chapter counts as a transcript when at least three paragraphs open with a
 * timestamp. A speaker is the leading run of capitalised words after the
 * timestamp that recurs at the head of at least two turns; the most frequent
 * prefix wins, the longer on a tie ("Robert Lawrence Kuhn", not "Robert").
 */
export interface TranscriptTurn { time: number; name: number }

const TIME_RE = /^\d{1,2}:\d{2}(?::\d{2})?$/
const NAME_WORD_RE = /^(?:\p{Lu}[\p{L}'’-]*\.?|\p{Lu}\.)$/u
const MAX_NAME_WORDS = 5
const MIN_TURNS = 3

const cache = new WeakMap<readonly string[], Map<number, TranscriptTurn> | null>()

export function transcriptTurns(paragraphs: readonly string[]): Map<number, TranscriptTurn> | null {
  if (cache.has(paragraphs)) return cache.get(paragraphs)!
  const result = compute(paragraphs)
  cache.set(paragraphs, result)
  return result
}

function compute(paragraphs: readonly string[]): Map<number, TranscriptTurn> | null {
  const heads: Array<{ index: number; runs: string[] }> = []
  paragraphs.forEach((paragraph, index) => {
    if (!paragraph || !/^\d{1,2}:\d{2}/.test(paragraph)) return
    const words = tokenizeHearingWords(paragraph).slice(0, MAX_NAME_WORDS + 2).map(word => word.text)
    if (!words.length || !TIME_RE.test(words[0])) return
    const runs: string[] = []
    for (let k = 1; k <= MAX_NAME_WORDS && k < words.length; k += 1) {
      if (!NAME_WORD_RE.test(words[k])) break
      runs.push(words.slice(1, k + 1).join(' '))
    }
    heads.push({ index, runs })
  })
  if (heads.length < MIN_TURNS) return null
  const counts = new Map<string, number>()
  for (const head of heads) for (const run of head.runs) counts.set(run, (counts.get(run) ?? 0) + 1)
  const turns = new Map<number, TranscriptTurn>()
  for (const head of heads) {
    let best = ''
    let bestCount = 1
    for (const run of head.runs) {
      const count = counts.get(run) ?? 0
      if (count >= 2 && (count > bestCount || (count === bestCount && run.length > best.length))) { best = run; bestCount = count }
    }
    turns.set(head.index, { time: 1, name: best ? best.split(' ').length : 0 })
  }
  return turns
}

/** The class a word at the head of a transcript turn takes, or '' for every other word. */
export function transcriptWordClass(turns: Map<number, TranscriptTurn> | null, paragraphIndex: number, wordIndex: number): string {
  return transcriptTurnClass(turns?.get(paragraphIndex), wordIndex)
}

/** The same for one paragraph's turn (the paginators measure a paragraph at a time). */
export function transcriptTurnClass(turn: TranscriptTurn | undefined, wordIndex: number): string {
  if (!turn) return ''
  if (wordIndex < turn.time) return ' lab-transcript-time'
  if (wordIndex < turn.time + turn.name) return ' lab-transcript-speaker'
  return ''
}
