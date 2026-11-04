/**
 * Catch me up's length limit, enforced on the model's answer (Anders, 4 Nov
 * 2026: "this is too much text"). The prompt asks for the limit; this module
 * checks it, because the prompt alone did not hold (a 70-word ask came back
 * as 270 words in 15 sentences for 2 Maccabees 1–8). Pure.
 */

export interface EntryLimit {
  /** Whole sentences at most. */
  sentences: number
  /** Words at most, in all. */
  words: number
}

/** Abbreviations whose full stop does not end a sentence ("Mr. Darcy", "St. Petersburg", "e.g. a"). */
const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'st', 'mt', 'jr', 'sr', 'vs', 'no', 'gen', 'col', 'capt', 'lt', 'sgt', 'rev', 'prof',
  'ch', 'vol', 'cf', 'e.g', 'i.e', 'b.c', 'a.d', 'mme', 'mlle', 'messrs', 'fr', 'sts',
])

/** A sentence end: terminal punctuation (and any closing quote or bracket), a space, then a capital or digit. */
const SENTENCE_END = /[.!?…]+["'”’)\]]*\s+(?=["'“‘(\[]?[\p{Lu}\p{N}])/gu

function words(text: string): string[] {
  return text.split(/\s+/).filter(word => /[\p{L}\p{N}]/u.test(word))
}

export function entryWordCount(text: string): number {
  return words(text).length
}

/** The entry's sentences, in order, whitespace collapsed. A text without terminal punctuation is one sentence. */
export function entrySentences(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return []
  const sentences: string[] = []
  let start = 0
  for (const match of clean.matchAll(SENTENCE_END)) {
    const end = match.index! + match[0].length
    const before = clean.slice(start, match.index! + 1)
    const last = (before.split(' ').pop() ?? '').replace(/^["'“‘(\[]+/, '').replace(/\.$/, '').toLowerCase()
    // "Mr." or an initial ("J. Smith") is not the end of a sentence.
    if (ABBREVIATIONS.has(last) || /^\p{L}$/u.test(last)) continue
    sentences.push(clean.slice(start, end).trim())
    start = end
  }
  const rest = clean.slice(start).trim()
  if (rest) sentences.push(rest)
  return sentences
}

export function entryFits(text: string, limit: EntryLimit): boolean {
  return entrySentences(text).length <= limit.sentences && entryWordCount(text) <= limit.words
}

/**
 * Whole sentences from the start while they fit the limit; never a cut inside
 * a sentence, and always at least the first sentence (even when it alone is
 * over the word limit).
 */
export function trimEntryToLimit(text: string, limit: EntryLimit): string {
  const sentences = entrySentences(text)
  if (!sentences.length) return ''
  const kept = [sentences[0]]
  let count = entryWordCount(sentences[0])
  for (const sentence of sentences.slice(1)) {
    const next = entryWordCount(sentence)
    if (kept.length >= limit.sentences || count + next > limit.words) break
    kept.push(sentence)
    count += next
  }
  return kept.join(' ')
}

/** "one sentence of at most 25 words" / "at most two sentences and 45 words in all". */
export function describeEntryLimit(limit: EntryLimit): string {
  if (limit.sentences === 1) return `one sentence of at most ${limit.words} words`
  const n = ['zero', 'one', 'two', 'three', 'four', 'five'][limit.sentences] ?? String(limit.sentences)
  return `at most ${n} sentences and ${limit.words} words in all`
}
