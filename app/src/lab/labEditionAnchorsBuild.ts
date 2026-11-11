/**
 * Anchors between two editions of a book whose paragraphs do not line up (Butler's prose Odyssey and Pope's verse).
 *
 * Share of the chapter alone drifts: one translation dwells where the other hurries, and in Compare a row a
 * paragraph out reads as wrong (Anders, 11 Nov 2026). Both translations name the same people and things in the same
 * order, so the words they share (Laodamas, Pontonous, ewer, hearth) say which passage answers which paragraph.
 * `buildChapterAnchors` finds that (no model, no network: word counts and shared words only);
 * scripts/build-edition-anchors.mjs writes them to src/data/editionAnchors/<book>.json, and a test holds that file to
 * what this function gives for the served texts. At run time a place is carried through the anchors, and share of
 * the text is used only BETWEEN two anchors.
 *
 * An anchor is a pair of word offsets from the chapter's start, one in each edition, in the reader's own word count
 * (tokenizeHearingWords): the start of a paragraph of `a` and the start of the sentence of `b` opposite it. The first
 * pair is where the two texts begin to correspond (after an edition's own opening,
 * Pope's prose argument); the last is the two ends.
 */
import { leadingPreface } from './labEditionSwitch'
import { tokenizeHearingWords } from './labHearing'

export interface ChapterAnchors {
  /** Words in each paragraph of edition `a`, then of `b`: what the anchors were counted against. */
  a: number[]
  b: number[]
  /** [offset in a, offset in b], rising in both. */
  anchors: Array<[number, number]>
}

export interface EditionAnchorFile {
  format: 'tinct-edition-anchors'
  version: 1
  bookId: string
  /** The two edition keys. Editions aligned paragraph by paragraph with `a` (a Modern English) go through `a`. */
  a: string
  b: string
  chapters: Record<string, ChapterAnchors>
}

/** A word either edition uses more often than this in the whole book says nothing about where in it we are. */
const MAX_BOOK_COUNT = 150
/** How much a paragraph's share of the text counts against the words it shares with the passage opposite. */
const LENGTH_WEIGHT = 1.2
const EMPTY_RUN = 3
const PARAGRAPH_START = 0.6
const SENTENCE_END = /[.!?]["'”’)\]]*$/

/** A word as both translations might spell it: lower case, no accents or ligatures, "stretch'd" as "stretched", no plural s. */
export function anchorToken(word: string): string {
  let token = word.toLowerCase().replace(/æ/g, 'ae').replace(/œ/g, 'oe').normalize('NFKD').replace(/[̀-ͯ]/g, '')
  token = token.replace(/[’']d\b/g, 'ed').replace(/[’']s\b/g, '').replace(/[^a-z]/g, '')
  if (token.length > 4 && token.endsWith('s') && !token.endsWith('ss')) token = token.slice(0, -1)
  return token
}

/**
 * The anchors of one chapter: for each paragraph of `a`, the sentence of `b` that begins the passage opposite it.
 * Deterministic: the same two texts always give the same anchors.
 *
 * `b` is cut into sentences. Every paragraph of `a` takes a run of them, in order, none skipped (a run may be
 * empty). Of all such divisions the one kept shares the most words between each paragraph and its run, rare words
 * counting most (`weight`: a name the book holds twice says more than a word it holds a hundred times), less a
 * charge for a run much longer or shorter than the paragraph's share of the text. Found exactly, by dynamic
 * programming, so a paragraph is placed by everything it shares with the other text and not by one chance word.
 */
export function buildChapterAnchors(a: string[], b: string[], weight: (token: string) => number = () => 1): ChapterAnchors {
  const wordsA = a.map(text => tokenizeHearingWords(text).map(word => word.text))
  const wordsB = b.map(text => tokenizeHearingWords(text).map(word => word.text))
  const countsA = wordsA.map(list => list.length)
  const countsB = wordsB.map(list => list.length)
  const totalA = countsA.reduce((sum, n) => sum + n, 0)
  const totalB = countsB.reduce((sum, n) => sum + n, 0)
  const firstA = leadingPreface(a)
  const firstB = leadingPreface(b)
  const startA = firstA ? countsA[0] : 0
  const startB = firstB ? countsB[0] : 0
  const ends: Array<[number, number]> = [[startA, startB], [totalA, totalB]]
  if (totalA - startA <= 0 || totalB - startB <= 0) return { a: countsA, b: countsB, anchors: totalA > 0 && totalB > 0 ? ends : [] }

  // The sentences of b after its own opening: where each starts, and the words it holds that could name a moment.
  const unitStart: number[] = []
  const unitTokens: string[][] = []
  const unitOpensParagraph: boolean[] = []
  let offset = 0
  wordsB.forEach((list, paragraph) => {
    let open = false
    list.forEach((word, index) => {
      if (paragraph >= firstB) {
        if (!open) { unitStart.push(offset); unitTokens.push([]); unitOpensParagraph.push(index === 0); open = true }
        const token = anchorToken(word)
        if (token.length >= 4 && weight(token) > 0) unitTokens[unitTokens.length - 1].push(token)
        if (SENTENCE_END.test(word) || index === list.length - 1) open = false
      }
      offset += 1
    })
  })
  const units = unitStart.length
  const paragraphs = wordsA.map((list, index) => ({ index, words: list.length, tokens: new Set(list.map(anchorToken).filter(token => token.length >= 4 && weight(token) > 0)) }))
    .filter(paragraph => paragraph.index >= firstA && paragraph.words > 0)
  if (!units || !paragraphs.length) return { a: countsA, b: countsB, anchors: ends }
  const pace = (totalB - startB) / (totalA - startA)

  // shared[u]: what paragraph p shares with the first u sentences (a word counts once a sentence).
  const NEG = -Infinity
  let best = new Array<number>(units + 1).fill(NEG)
  best[0] = 0
  const cuts: Int32Array[] = []
  for (const paragraph of paragraphs) {
    const shared = new Float64Array(units + 1)
    for (let u = 0; u < units; u += 1) {
      let sum = 0
      const seen = new Set<string>()
      for (const token of unitTokens[u]) if (paragraph.tokens.has(token) && !seen.has(token)) { seen.add(token); sum += weight(token) }
      shared[u + 1] = shared[u] + sum
    }
    const want = paragraph.words * pace
    const next = new Array<number>(units + 1).fill(NEG)
    const from = new Int32Array(units + 1).fill(-1)
    for (let end = 0; end <= units; end += 1) {
      const endAt = end < units ? unitStart[end] : totalB
      for (let begin = 0; begin <= end; begin += 1) {
        if (best[begin] === NEG) continue
        const length = endAt - (begin < units ? unitStart[begin] : totalB)
        // A paragraph with nothing opposite it reads as a gap in Compare: only when there is no sentence left to give it.
        const score = best[begin] + shared[end] - shared[begin] - LENGTH_WEIGHT * Math.abs(length - want) / (want + 40) - (begin === end ? EMPTY_RUN : 0)
          // A translator's own paragraph break is the likeliest place for the passage to begin (a speech, a new scene).
          + (begin < units && unitOpensParagraph[begin] ? PARAGRAPH_START : 0)
        // Ties go to the earlier cut, so the result does not depend on anything but the texts.
        if (score > next[end]) { next[end] = score; from[end] = begin }
      }
    }
    best = next
    cuts.push(from)
  }
  // Every sentence belongs to some paragraph: the last run ends at the end.
  const begins: number[] = []
  let end = units
  for (let p = paragraphs.length - 1; p >= 0; p -= 1) { const begin = cuts[p][end]; begins.unshift(begin); end = begin }

  const startOfA: number[] = []
  let at = 0
  for (const count of countsA) { startOfA.push(at); at += count }
  const anchors: Array<[number, number]> = [ends[0]]
  paragraphs.forEach((paragraph, p) => {
    const pair: [number, number] = [startOfA[paragraph.index], begins[p] < units ? unitStart[begins[p]] : totalB]
    const last = anchors[anchors.length - 1]
    // The first paragraph begins where the texts begin; a paragraph with nothing opposite adds no anchor of its own.
    if (pair[0] > last[0] && pair[1] > last[1] && pair[0] < totalA && pair[1] < totalB) anchors.push(pair)
  })
  anchors.push(ends[1])
  return { a: countsA, b: countsB, anchors }
}

/** The anchors of every chapter both editions have, for scripts/build-edition-anchors.mjs. */
export function buildEditionAnchorFile(
  bookId: string,
  a: { key: string; data: { chapters: Array<{ number: number; paragraphs: string[] }> } },
  b: { key: string; data: { chapters: Array<{ number: number; paragraphs: string[] }> } },
): EditionAnchorFile {
  // How much a shared word says: nothing when either edition uses it all through the book, most when the book holds it once or twice.
  const perEdition = [a.data, b.data].map(data => {
    const seen = new Map<string, number>()
    for (const chapter of data.chapters) for (const text of chapter.paragraphs ?? []) for (const word of tokenizeHearingWords(text)) {
      const token = anchorToken(word.text)
      if (token.length >= 4) seen.set(token, (seen.get(token) ?? 0) + 1)
    }
    return seen
  })
  const weights = new Map<string, number>()
  const weight = (token: string) => {
    let value = weights.get(token)
    if (value === undefined) {
      const inA = perEdition[0].get(token) ?? 0
      const inB = perEdition[1].get(token) ?? 0
      value = inA === 0 || inB === 0 || inA > MAX_BOOK_COUNT || inB > MAX_BOOK_COUNT ? 0 : 1 / Math.sqrt(Math.max(inA, inB))
      weights.set(token, value)
    }
    return value
  }
  const chapters: Record<string, ChapterAnchors> = {}
  for (const chapter of a.data.chapters) {
    const other = b.data.chapters.find(candidate => candidate.number === chapter.number)
    if (!other?.paragraphs?.length || !chapter.paragraphs?.length) continue
    const anchors = buildChapterAnchors(chapter.paragraphs, other.paragraphs, weight)
    if (anchors.anchors.length >= 2) chapters[String(chapter.number)] = anchors
  }
  return { format: 'tinct-edition-anchors', version: 1, bookId, a: a.key, b: b.key, chapters }
}
