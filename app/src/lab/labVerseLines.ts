/**
 * Verse lineation, applied at render time.
 *
 * Shakespeare's plays are stored as one paragraph per speech, with the verse
 * lines run together into prose. The lines are recovered from the Project
 * Gutenberg source and shipped beside the edition as
 * `/data/editions/{bookId}-lines.json` -- per paragraph, the character offsets
 * at which a new verse line begins. The edition text itself is never altered:
 * character cards carry hashes and offsets into the served bytes, audio
 * word-highlight sidecars index words by position, and reading positions are
 * paragraph indices. Unchanged bytes keep all three correct by construction,
 * exactly as `labEmphasis.ts` keeps them correct while turning `_..._` into
 * italics.
 *
 * A break is therefore expressed here as a WORD INDEX, the same coordinate the
 * renderers and paginators already use, so nothing about tokenisation, word
 * counting or word highlighting changes -- a line break only decides which
 * words share a line box.
 *
 * Lineation is looked up by paragraph TEXT rather than threaded through as a
 * prop. The reader paints the primary edition, the compare edition and a
 * standby edition through the same components, and each of the four places
 * that build word markup (two painted, two hidden measurement copies) would
 * otherwise need its own edition-aware prop. Looking up the text answers the
 * only question that matters -- is THIS paragraph lineated verse -- and a
 * prose translation simply is not in the map.
 */

export interface VerseLineSidecar {
  bookId: string
  edition: string
  /** chapter number -> paragraph index -> character offsets of each new line. */
  chapters: Record<string, Record<string, number[]>>
}

/** Paragraph text -> word indexes at which a new verse line begins. */
const lineated = new Map<string, ReadonlySet<number>>()
const speakers = new Map<string, Array<[number, number]>>()

const WORD = /\S+/g

/**
 * How many whitespace-delimited words precede `offset`.
 *
 * This is the word index of the word starting AT `offset`, and it is the same
 * index `tokenizeHearingWords` assigns: stripping `_..._` emphasis removes
 * only the two delimiter characters of a matched pair, which never changes
 * token boundaries, count or order (see `labEmphasis.ts`). So an offset
 * measured against the raw served text lands on the right rendered word.
 */
export function wordIndexAtOffset(text: string, offset: number): number {
  WORD.lastIndex = 0
  let count = 0
  let match: RegExpExecArray | null
  while ((match = WORD.exec(text))) {
    if (match.index >= offset) break
    count += 1
  }
  return count
}

/**
 * Record the lineation of one chapter's paragraphs.
 *
 * Offsets that do not survive the round trip -- splitting the paragraph there
 * and rejoining with single spaces must reproduce it exactly -- are dropped
 * rather than painted. The sidecar is generated against a specific edition
 * revision; if it ever drifts from the served text, the reader falls back to
 * today's unlineated paragraph instead of breaking a line mid-word.
 */
export function registerVerseLines(paragraphs: string[], chapter: Record<string, number[]> | undefined): void {
  if (!chapter) return
  for (const [index, offsets] of Object.entries(chapter)) {
    const text = paragraphs[Number(index)]
    if (!text || !offsets.length) continue
    if (!offsetsFit(text, offsets)) continue
    const starts = new Set(offsets.map(offset => wordIndexAtOffset(text, offset)))
    const existing = lineated.get(text)
    // The same text twice with different lineation is a contradiction; leaving
    // both out is the only answer that cannot be wrong on one of them.
    if (existing && !sameStarts(existing, starts)) {
      lineated.set(text, new Set())
      continue
    }
    lineated.set(text, starts)
  }
}

function offsetsFit(text: string, offsets: number[]): boolean {
  let previous = 0
  for (const offset of offsets) {
    if (!(offset > previous + 1) || offset >= text.length) return false
    if (text[offset - 1] !== ' ' || text[offset] === ' ') return false
    previous = offset
  }
  return true
}

function sameStarts(a: ReadonlySet<number>, b: ReadonlySet<number>): boolean {
  return a.size === b.size && [...a].every(value => b.has(value))
}

/** Word indexes at which a new verse line begins, or undefined for prose. */
export function verseLineStarts(text: string | undefined): ReadonlySet<number> | undefined {
  if (!text) return undefined
  const starts = lineated.get(text)
  return starts && starts.size > 0 ? starts : undefined
}

/**
 * Split the word range `[from, to)` of a paragraph into its verse lines.
 *
 * Returns null for prose, so every caller keeps its existing markup untouched
 * for every other book. A page boundary can fall inside a verse line; the
 * opening run then simply starts mid-line, which is what the printed page
 * does too.
 */
export function verseLineRanges(text: string | undefined, from: number, to: number): Array<[number, number]> | null {
  const starts = verseLineStarts(text)
  if (!starts || to <= from) return null
  const ranges: Array<[number, number]> = []
  let start = from
  for (let index = from + 1; index < to; index += 1) {
    if (starts.has(index)) {
      ranges.push([start, index])
      start = index
    }
  }
  ranges.push([start, to])
  return ranges
}

/** Test seam: forget every registered lineation. */
export function resetVerseLines(): void {
  lineated.clear()
  speakers.clear()
}

export async function loadVerseLines(bookId: string, version: string): Promise<VerseLineSidecar | null> {
  try {
    const response = await fetch(`/data/editions/${bookId}-lines.json?v=${encodeURIComponent(version)}`)
    if (!response.ok) return null
    const data = (await response.json()) as VerseLineSidecar
    return data && typeof data === 'object' && data.chapters ? data : null
  } catch {
    return null
  }
}

/** Speaker typography is independent of verse metadata. Only paragraphs from
 * a registry-confirmed Shakespeare book are registered here. Existing labels,
 * including joint speakers and italic abbreviations, remain source words. */
export function shakespeareSpeakerWords(text: string): number {
  // Verified labels missing their period in the shipped original editions.
  const unpunctuated = text.match(/^(VAUGHAN|RATCLIFFE|ALL PEOPLE|LORDS|CLEOMENES|BALTHASAR)(?=\s)/)
  if (unpunctuated) return unpunctuated[1].split(/\s+/).length
  const italic = text.match(/^_([^_]{1,100}\.)_(?:[.}])?(?=\s|$)/u)
  const plain = text.match(/^([^.[\]_:]{1,100}[.:])(?=\s|$)/u)
  const label = italic?.[1] ?? plain?.[1]
  if (!label) return 0
  const words = label.replace(/[.,:]/g, '').trim().split(/\s+/)
  if (/^(?:I|O|ENTER|RE-ENTER|EXIT|EXEUNT|SCENE|ACT|FLOURISH|ALARUM|MUSIC|SONG|DURING|SINGS|EPILOGUE)$/i.test(words[0])) return 0
  const connector = /^(?:and|of|the|&|&c|etc)$/
  const name = italic ? /^[\p{Lu}][\p{L}\p{N}’'-]*$/u : /^[\p{Lu}][\p{Lu}\p{N}’'-]*$/u
  if (!words.every(word => connector.test(word) || name.test(word))) return 0
  return (italic?.[0] ?? plain![0]).split(/\s+/).length
}

export function registerShakespeareSpeakers(paragraphs: string[]): void {
  for (const text of paragraphs) {
    const words = [...text.matchAll(/\S+/g)]
    const labels: Array<[number, number]> = []
    for (let index = 0; index < words.length; index += 1) {
      const start = words[index].index!
      if (index && !/[.!?;:\]_]$/.test(text.slice(0, start).trimEnd())) continue
      if (!/^[_\p{Lu}]/u.test(words[index][0])) continue
      const count = shakespeareSpeakerWords(text.slice(start))
      if (!count) continue
      labels.push([index, index + count])
      index += count - 1
    }
    if (labels.length) speakers.set(text, labels)
  }
}

function speakerRanges(text: string | undefined): Array<[number, number]> {
  if (!text) return []
  const registered = speakers.get(text)
  if (registered) return registered
  const count = verseLineStarts(text) ? shakespeareSpeakerWords(text) : 0
  return count ? [[0, count]] : []
}

export function verseSpeakerWords(text: string | undefined): number {
  return speakerRanges(text).find(([from]) => from === 0)?.[1] ?? 0
}

export function verseSpeakerEnd(text: string | undefined, at: number): number {
  return speakerRanges(text).find(([from, to]) => at >= from && at < to)?.[1] ?? 0
}

export function isInternalVerseBreak(text: string | undefined, at: number): boolean {
  return !!verseLineStarts(text)?.has(at) && !speakerRanges(text).some(([from]) => from === at)
}

/** Speaker boundaries are presentation runs, not invented verse breaks. */
export function presentationLineRanges(text: string | undefined, from: number, to: number): Array<[number, number]> | null {
  if (to <= from) return null
  const verse = verseLineRanges(text, from, to)
  const labels = speakerRanges(text)
  if (!verse && !labels.length) return null
  const boundaries = new Set([from, to])
  for (const [start] of verse ?? []) boundaries.add(start)
  for (const [start] of labels) if (start > from && start < to) boundaries.add(start)
  const sorted = [...boundaries].sort((a, b) => a - b)
  return sorted.slice(0, -1).map((start, index) => [start, sorted[index + 1]])
}
