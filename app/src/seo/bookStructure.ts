/**
 * Structure facts and positions for the public reading pages (Anders, 19 Nov 2026, docs/seo-brief-2026-11-19.md
 * §2 and §4): "Chapter 26 of 38", "Book 3 of 24", the book page's pill ("6 parts + epilogue · 41 chapters").
 *
 * Everything is counted from the labels the pages already show (chapterLabels in chapterPages.tsx: the book's own
 * unit names, else "Chapter N"), never stated beyond them: a unit that is not in the labels is not in the facts.
 */

import type { EditionSource } from '../data/editionSources'

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15,
}
const ROMAN = /^[IVXLC]+$/

/** One unit of a label: "Chapter 3" → { word: "Chapter", number: "3" }; "Epilogue" → { word: "Epilogue" }. */
export interface LabelUnit { text: string; word: string; number: string | null }

/** "Part 1, Chapter 3" → [Part 1, Chapter 3]. A unit's name may carry a year or a name ("Book One (1805)", "Book I: Miss Brooke"). */
export function labelUnits(label: string): LabelUnit[] {
  return label.split(', ').map(text => {
    const match = text.match(/^([A-Za-z.]+(?: [A-Za-z]+)?) (\d{1,4}|[IVXLC]{1,8}|[A-Z][a-z]+)(?=$|[ :(])/)
    const number = match && (/^\d+$/.test(match[2]) || ROMAN.test(match[2]) || WORD_NUMBERS[match[2].toLowerCase()]) ? match[2] : null
    return { text, word: number ? match![1] : text, number }
  })
}

/**
 * The units that place a chapter: a label's trailing names after its last numbered unit are dropped
 * ("Chapter 38, Conclusion" is Chapter 38).
 */
export function placingUnits(label: string): LabelUnit[] {
  const units = labelUnits(label)
  let last = units.length - 1
  while (last > 0 && !units[last].number && units.slice(0, last).some(unit => unit.number)) last -= 1
  return units.slice(0, last + 1)
}

const plural = (word: string, count: number) => {
  const lower = word.toLowerCase()
  return count === 1 ? lower : `${lower}s`
}

/**
 * Each chapter's position within its own group: "Chapter 26" → { label, of: 38 } (38 chapters in the book);
 * "Part 2, Chapter 3" → of the chapters in Part 2. A unit without a number (Prologue, Epilogue) has no "of".
 */
export function chapterPositions(labels: ReadonlyMap<number, string>): Map<number, { label: string; of: number | null }> {
  const groups = new Map<string, number>()
  const keyOf = (label: string) => {
    const units = placingUnits(label)
    const last = units[units.length - 1]
    if (!last.number) return null
    return `${units.slice(0, -1).map(unit => unit.text).join(', ')}|${last.word}`
  }
  for (const label of labels.values()) {
    const key = keyOf(label)
    if (key) groups.set(key, (groups.get(key) ?? 0) + 1)
  }
  const out = new Map<number, { label: string; of: number | null }>()
  for (const [number, label] of labels) {
    const key = keyOf(label)
    const total = key ? groups.get(key)! : 0
    out.set(number, { label: placingUnits(label).map(unit => unit.text).join(', '), of: total > 1 ? total : null })
  }
  return out
}

export interface StructureFacts {
  /** The pill: "38 chapters", "6 parts + epilogue · 41 chapters", "24 books", "5 acts · 20 scenes". */
  pill: string
  /** For a sentence: "38 chapters", "4 letters and 24 chapters". */
  units: string
}

/**
 * The book's structure from its labels: the numbered top-level units (parts, books, acts) with any unnumbered
 * ones beside them (an epilogue), then the numbered leaf units (chapters, letters, scenes) with any unnumbered
 * ones (a prelude, a finale).
 */
export function structureFacts(labels: Iterable<string>): StructureFacts {
  const topNumbered = new Map<string, Set<string>>()
  const topExtra = new Map<string, number>()
  const leafNumbered = new Map<string, number>()
  const leafExtra: string[] = []
  const seenTop = new Set<string>()
  for (const label of labels) {
    const units = placingUnits(label)
    const leaf = units[units.length - 1]
    if (units.length > 1) {
      const top = units[0]
      if (!seenTop.has(top.text)) {
        seenTop.add(top.text)
        if (top.number) {
          const set = topNumbered.get(top.word) ?? new Set<string>()
          set.add(top.text)
          topNumbered.set(top.word, set)
        } else {
          const base = top.word.replace(/^(First|Second|Third) /, '')
          topExtra.set(base, (topExtra.get(base) ?? 0) + 1)
        }
      }
    }
    if (leaf.number) leafNumbered.set(leaf.word, (leafNumbered.get(leaf.word) ?? 0) + 1)
    else if (units.length === 1 && !leafExtra.includes(leaf.word.toLowerCase())) leafExtra.push(leaf.word.toLowerCase())
  }
  const top = [...topNumbered].map(([word, set]) => `${set.size} ${plural(word, set.size)}`)
  const topExtras = [...topExtra].map(([word, count]) => count === 1 ? word.toLowerCase() : `${count} ${plural(word, count)}`)
  const leaves = [...leafNumbered].map(([word, count]) => `${count} ${plural(word, count)}`)
  const head = [top.join(' · '), ...topExtras].filter(Boolean).join(' + ')
  const tail = [leaves.join(' · '), ...leafExtra].filter(Boolean).join(' + ')
  return {
    pill: [head, tail].filter(Boolean).join(' · '),
    units: leaves.length > 1 ? `${leaves.slice(0, -1).join(', ')} and ${leaves[leaves.length - 1]}` : (leaves[0] ?? ''),
  }
}

/**
 * Typographer's quotes for the Modern English text: "…" → “…”, '…' → ‘…’, apostrophes → ’. Straight quotes
 * only; text that already has curly ones is unchanged.
 */
export function curlyQuotes(text: string): string {
  return text
    // Elisions take the apostrophe, not an opening quote: 'tis, 'twas, 'em.
    .replace(/(^|[\s([{—–\-/_])'(?=(?:tis|twas|twere|em|til|cause|neath|tween)\b)/gi, '$1’')
    // An opening quote follows a space, a bracket or a dash and comes before a word; "killed if—" closes.
    .replace(/(^|[\s([{—–\-/_])"(?=\S)/g, '$1“')
    .replace(/"/g, '”')
    .replace(/(^|[\s([{—–\-/_])'(?=\S)/g, '$1‘')
    .replace(/'/g, '’')
}

/** The book page's title: it is the first chapter, so it answers "read {book} online". */
export function bookPageTitle(book: { title: string }, play = false): string {
  return play ? `Read ${book.title} online free, scene by scene in modern English | Tinct` : `Read ${book.title} online free, in modern English | Tinct`
}

/** Whose text the Modern English sits beside, for the book page's description. */
export function besidePhrase(source: EditionSource | null): string {
  if (source?.kind === 'translation') return `${source.translator}'s translation`
  if (source?.kind === 'english-original') return `${source.author}'s original`
  if (source?.kind === 'tinct-translation') return 'the original'
  return 'the original'
}

/** "Jane Eyre has 38 chapters. Read the full text free online in modern English beside Charlotte Brontë's original. No sign-up, no ads." */
export function bookPageDescription(book: { title: string }, units: string, source: EditionSource | null): string {
  return `${book.title}${units ? ` has ${units}` : ''}. Read the full text free online in modern English beside ${besidePhrase(source)}. No sign-up, no ads.`
}
