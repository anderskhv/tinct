/**
 * English hyphenation for the share page, as the phone reader hyphenates: the
 * en-us patterns (hypher + hyphenation.en-us) and labSyllableFallback's guess
 * for a word of seven letters or more that the patterns leave whole, under
 * labHyphenCore's rules (two letters before a break, three after, nothing in
 * digits or in a word with its own hyphen). Static imports, so the Worker
 * bundles only the English patterns; the engine is built on first use.
 */

// @ts-expect-error hypher ships no type declarations
import Hypher from 'hypher'
// @ts-expect-error hyphenation.en-us ships no type declarations
import englishPatterns from 'hyphenation.en-us'
import { dictionaryBreaks, type Hyphenator } from '../lab/labHyphenCore'
import { fallbackBreaks } from '../lab/labSyllableFallback'

let engine: Hyphenator | null = null

/** Character offsets in `word` after which a hyphen may be drawn, ascending. */
export function englishShareBreaks(word: string): number[] {
  engine ??= new (Hypher as new (patterns: unknown) => Hyphenator)(englishPatterns)
  return dictionaryBreaks(engine, word, fallbackBreaks)
}
