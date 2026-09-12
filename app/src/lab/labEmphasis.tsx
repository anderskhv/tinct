import { Fragment, type ReactNode } from 'react'

export interface EmphasisWord {
  text: string
  emphasis: boolean
}

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

/**
 * Whitespace-tokenize `text` (`\S+` runs — the same split every lab
 * tokenizer uses) with matched underscore-emphasis pairs stripped and
 * flagged per token. Token count and order always match a plain whitespace
 * split of the untouched `text`.
 */
export function tokenizeWithEmphasis(text: string): EmphasisWord[] {
  const { text: cleaned, ranges } = stripUnderscoreEmphasis(text)
  const tokens: EmphasisWord[] = []
  const re = /\S+/g
  let match: RegExpExecArray | null
  while ((match = re.exec(cleaned))) {
    const start = match.index
    const end = start + match[0].length
    const emphasis = ranges.some(([rangeStart, rangeEnd]) => start < rangeEnd && end > rangeStart)
    tokens.push({ text: match[0], emphasis })
  }
  return tokens
}

/**
 * Render `text` with matched underscore-emphasis pairs as `<em>`, otherwise
 * the plain string. For call sites that paint a whole paragraph/sentence as
 * one block rather than per-word spans.
 */
export function renderTextWithEmphasis(text: string, keyPrefix: string): ReactNode {
  const { text: cleaned, ranges } = stripUnderscoreEmphasis(text)
  if (ranges.length === 0) return cleaned
  const nodes: ReactNode[] = []
  let cursor = 0
  ranges.forEach(([start, end], index) => {
    if (start > cursor) nodes.push(<Fragment key={`${keyPrefix}-t${index}`}>{cleaned.slice(cursor, start)}</Fragment>)
    nodes.push(<em key={`${keyPrefix}-e${index}`}>{cleaned.slice(start, end)}</em>)
    cursor = end
  })
  if (cursor < cleaned.length) nodes.push(<Fragment key={`${keyPrefix}-tail`}>{cleaned.slice(cursor)}</Fragment>)
  return nodes
}
