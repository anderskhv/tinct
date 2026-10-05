/** Underscore-emphasis parsing shared by the reader and the Worker (no React). */

/**
 * Project Gutenberg's `_..._` emphasis markup. An underscore counts as a
 * delimiter only at a token edge — `\b` immediately before/after `_` relies
 * on `_` itself being a `\w` character, so a transition from a letter/digit
 * lands *inside* a run (snake_case) and is excluded, and a lone/unmatched
 * underscore never matches at all. `[^_\n]+` keeps a run from swallowing a
 * later, unrelated pair.
 */
const UNDERSCORE_EMPHASIS_RE = /\b_([^_\n]+)_\b/g

/**
 * Strip matched underscore-emphasis delimiters from `text`, returning the
 * cleaned text plus the character ranges (offsets into the CLEANED text)
 * that were emphasized.
 *
 * Only the two delimiter characters of each matched pair are ever removed —
 * nothing else about the string changes — so whitespace-delimited token
 * boundaries are identical to the raw text's, and tokenizing the result
 * yields the same word count and order as tokenizing `text` directly. This
 * is what keeps audio word-highlight sidecars (which index words by
 * position) valid after the fix.
 */
export function stripUnderscoreEmphasis(text: string): { text: string; ranges: Array<[number, number]> } {
  if (!text.includes('_')) return { text, ranges: [] }
  const ranges: Array<[number, number]> = []
  let result = ''
  let lastIndex = 0
  UNDERSCORE_EMPHASIS_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = UNDERSCORE_EMPHASIS_RE.exec(text))) {
    const content = match[1]
    result += text.slice(lastIndex, match.index)
    const start = result.length
    result += content
    ranges.push([start, result.length])
    lastIndex = match.index + match[0].length
  }
  if (ranges.length === 0) return { text, ranges }
  result += text.slice(lastIndex)
  return { text: result, ranges }
}
