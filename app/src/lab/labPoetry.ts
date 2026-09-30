import { tokenizeHearingWords } from './labHearing'

/**
 * Presentation only: the Berean Standard Bible stores every poetic half-line
 * as its own paragraph ("¹ Wine is a mocker, strong drink is a brawler," /
 * "and whoever is led astray by them is not wise."), in the Psalms and the
 * Prophets, in Matthew 5 and Genesis 27 alike, with no poetry marker in the
 * data. Every other Bible edition sets poetry as justified prose, several verses
 * to a paragraph. The reader shows BSB the same way — at render time only.
 *
 * Source paragraphs stay the unit of everything stored or synced: positions,
 * highlights, notes, audio word timings, verse-paired Compare, chat context. A
 * joined source paragraph is painted inside the visual paragraph of the one
 * before it, keeping its own paragraph and word indexes on every word span, so
 * nothing that addresses words can tell the difference. Changing the data files
 * would need a migration of all of that; this needs none.
 *
 * The rule, data-driven (see `proseJoins`):
 *  1. A verse unit is a paragraph that opens with a verse number plus the
 *     paragraphs after it that do not. A poem introduced at the end of a long
 *     prose paragraph ("…and said:") starts its own unit at its first line, so
 *     the prose paragraph is never joined to it.
 *  2. A unit is lineated when it has two or more lines and every line is short
 *     (≤ 22 words), and no line break in it is a dialogue turn (a closed quote
 *     followed by a line opening a new quote). Prose never breaks mid-sentence,
 *     so a lineated unit with a line break that does not follow . ! or ? is
 *     poetry outright. A unit whose breaks all follow full stops ("Give thanks to
 *     the LORD, for He is good." / "His loving devotion endures forever.") is
 *     poetry only among other lineated units and when all its lines are ≤ 14
 *     words — that keeps a prose verse split in two (Genesis 1:31, "…very
 *     good." / "And there was evening…") exactly as it is.
 *  3. A one-line verse of ≤ 14 words beside a poetic unit belongs to the poem.
 *  4. Lines of a poetic unit join one visual paragraph. Consecutive poetic
 *     verses join too, in runs of five that restart at verses 1, 6, 11, 16…:
 *     that is precisely how WEB paragraphs its poetry, so BSB reads like the
 *     other editions and its paragraphs line up with WEB's in Compare.
 */

const VERSE_START = /^([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\s/u
const SENTENCE_END = /[.!?][”’"')\]]*$/u
const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹'
export const PROSE_LINE_MAX_WORDS = 22
export const PROSE_STOPPED_LINE_MAX_WORDS = 14
const VERSES_PER_PARAGRAPH = 5

/** Chapter texts of editions whose poetry is stored one line per paragraph. */
const lineated = new Set<string>()
const joinCache = new WeakMap<string[], boolean[]>()

function chapterKey(paragraphs: string[]): string {
  return `${paragraphs.length}\u0001${paragraphs[0] ?? ''}\u0001${paragraphs[paragraphs.length - 1] ?? ''}`
}

/** BSB chapter texts are registered as they load (labSource), before any render. */
export function registerLineatedChapter(paragraphs: string[]): void {
  if (paragraphs.length > 1) lineated.add(chapterKey(paragraphs))
}

function verseNumber(text: string): number | null {
  const match = VERSE_START.exec(text)
  if (!match) return null
  return Number([...match[1]].map(digit => SUPERSCRIPT.indexOf(digit)).join(''))
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

/**
 * `joins[i]` is true when source paragraph `i` is painted as a continuation of
 * the visual paragraph that holds paragraph `i - 1`. Pure: exported for tests.
 */
export function lineatedProseJoins(paragraphs: string[]): boolean[] {
  const words = paragraphs.map(wordCount)
  const short = (i: number) => words[i] <= PROSE_LINE_MAX_WORDS
  const units: number[][] = []
  paragraphs.forEach((text, i) => {
    const current = units[units.length - 1]
    if (!current || verseNumber(text) != null || (current.length === 1 && !short(current[0]))) units.push([i])
    else current.push(i)
  })
  const turn = (a: number, b: number) => SENTENCE_END.test(paragraphs[a].trimEnd())
    && paragraphs[a].includes('”') && paragraphs[b].startsWith('“')
  const allShort = units.map(unit => unit.every(short) && !unit.some((i, k) => k > 0 && turn(unit[k - 1], i)))
  const lined = units.map((unit, k) => allShort[k] && unit.length > 1)
  const seed = units.map((unit, k) => lined[k] && unit.some((i, n) => n > 0 && !SENTENCE_END.test(paragraphs[unit[n - 1]].trimEnd())))
  const stopped = units.map((unit, k) => lined[k] && unit.every(i => words[i] <= PROSE_STOPPED_LINE_MAX_WORDS))
  const kin = (k: number) => k >= 0 && k < units.length && (stopped[k] || seed[k])
  const poeticUnit = units.map((_, k) => seed[k] || (stopped[k] && (kin(k - 1) || kin(k + 1))))
  const poetic = units.map((unit, k) => poeticUnit[k] || (
    unit.length === 1
    && words[unit[0]] <= PROSE_STOPPED_LINE_MAX_WORDS
    && verseNumber(paragraphs[unit[0]]) != null
    && (!!poeticUnit[k - 1] || !!poeticUnit[k + 1])
  ))

  const joins = paragraphs.map(() => false)
  let runStart: number | null = null
  units.forEach((unit, k) => {
    if (!poetic[k]) { runStart = null; return }
    for (const i of unit.slice(1)) joins[i] = true
    const verse = verseNumber(paragraphs[unit[0]])
    if (k > 0 && poetic[k - 1] && verse != null && runStart != null
      && (verse - 1) % VERSES_PER_PARAGRAPH !== 0 && verse - runStart < VERSES_PER_PARAGRAPH) {
      joins[unit[0]] = true
    } else runStart = verse
  })
  return joins
}

/** Join flags for a chapter; all false for any chapter not registered as lineated. */
export function proseJoins(paragraphs: string[]): boolean[] {
  let joins = joinCache.get(paragraphs)
  if (!joins) {
    joins = lineated.has(chapterKey(paragraphs)) ? lineatedProseJoins(paragraphs) : paragraphs.map(() => false)
    joinCache.set(paragraphs, joins)
  }
  return joins
}

/** A painted slice of one source paragraph: words [from, to). */
export interface ProseSlice { paragraphIndex?: number; from?: number; to?: number }

function sliceEndsParagraph(paragraphs: string[], slice: ProseSlice): boolean {
  if (slice.paragraphIndex == null || slice.to == null) return false
  return slice.to >= tokenizeHearingWords(paragraphs[slice.paragraphIndex] || '').length
}

/** Whether `next` is painted in the same visual paragraph as `previous`. */
export function sliceJoinsPrevious(paragraphs: string[], previous: ProseSlice | undefined, next: ProseSlice): boolean {
  if (!previous || previous.paragraphIndex == null || next.paragraphIndex == null) return false
  return next.paragraphIndex === previous.paragraphIndex + 1
    && (next.from ?? 0) === 0
    && sliceEndsParagraph(paragraphs, previous)
    && !!proseJoins(paragraphs)[next.paragraphIndex]
}

/** The visual paragraph goes on past this slice: its next source paragraph joins it. */
export function sliceRunContinues(paragraphs: string[], slice: ProseSlice): boolean {
  return slice.paragraphIndex != null
    && sliceEndsParagraph(paragraphs, slice)
    && !!proseJoins(paragraphs)[slice.paragraphIndex + 1]
}

/**
 * Group a page's slices, in order, into visual paragraphs. Each group is a list
 * of indexes into `slices`; a group of one is an ordinary paragraph.
 */
export function proseRuns(paragraphs: string[], slices: ProseSlice[], enabled = true): number[][] {
  const runs: number[][] = []
  slices.forEach((slice, index) => {
    if (enabled && index > 0 && sliceJoinsPrevious(paragraphs, slices[index - 1], slice)) runs[runs.length - 1].push(index)
    else runs.push([index])
  })
  return runs
}

/** A reading/hearing line as a slice: owned words only, never the page-edge fragment. */
export function lineSlice(line: { paragraphIndex?: number; from?: number; words: Array<{ fragment?: boolean }> }): ProseSlice {
  const from = line.from ?? 0
  return { paragraphIndex: line.paragraphIndex, from, to: from + line.words.filter(word => !word.fragment).length }
}
