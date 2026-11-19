import { Fragment, type ReactNode } from 'react'
import { stripUnderscoreEmphasis } from './emphasisText'

export { stripUnderscoreEmphasis }

export interface EmphasisWord {
  text: string
  emphasis: boolean
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
