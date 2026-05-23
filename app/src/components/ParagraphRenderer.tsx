import { Fragment } from 'react'
import type { Highlight } from '../types'

interface ParagraphRendererProps {
  text: string
  paragraphIndex: number
  highlights: Highlight[]
  onMouseUp?: () => void
  /** Whether this edition is verse (preserve newlines) — determined from edition metadata */
  isVerse?: boolean
  /** Additional CSS class name */
  className?: string
}

interface TextSegment {
  text: string
  highlight?: Highlight
  startOffset: number
}

function renderDropCapText(text: string, preserveNewlines?: boolean): React.ReactNode {
  if (!text) return text
  const match = text.match(/^(\s*)([\s\S])([\s\S]*)$/)
  if (!match) return text
  const [, leading, first, rest] = match
  return (
    <>
      {leading}
      <span className="drop-cap-letter">{renderFormattedText(first, preserveNewlines)}</span>
      {renderFormattedText(rest, preserveNewlines)}
    </>
  )
}

// Unicode superscript digits come from two different blocks (Latin-1 for ¹²³,
// Superscripts and Subscripts for ⁰⁴⁵⁶⁷⁸⁹). EB Garamond covers ¹²³ but
// many fonts fall back for the others, producing inconsistent weight. We
// normalize them all into <sup> with regular digits so they render uniformly.
const SUP_MAP: Record<string, string> = {
  '\u2070': '0', '\u00B9': '1', '\u00B2': '2', '\u00B3': '3', '\u2074': '4',
  '\u2075': '5', '\u2076': '6', '\u2077': '7', '\u2078': '8', '\u2079': '9',
}
const SUP_RE = /[\u00B2\u00B3\u00B9\u2070\u2074\u2075\u2076\u2077\u2078\u2079]+/g

function renderWithSuperscripts(text: string, keyOffset: number): React.ReactNode[] {
  if (!SUP_RE.test(text)) return [text]
  SUP_RE.lastIndex = 0
  const out: React.ReactNode[] = []
  let last = 0
  let k = keyOffset
  let m: RegExpExecArray | null
  while ((m = SUP_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const digits = Array.from(m[0]).map(c => SUP_MAP[c] ?? c).join('')
    out.push(<sup key={`s${k++}`} className="verse-num">{digits}</sup>)
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

/**
 * Renders inline text with formatting support:
 * - \n → <br /> (for verse) or space (for prose with embedded breaks)
 * - **bold** → <strong>
 * - *italic* → <em>
 * - Unicode superscript digits → <sup> with regular digits (Bible verse numbers)
 */
function renderFormattedText(text: string, preserveNewlines?: boolean): React.ReactNode {
  const hasSup = SUP_RE.test(text)
  SUP_RE.lastIndex = 0
  // Fast path: no markers at all
  if (!text.includes('\n') && !text.includes('*') && !hasSup) return text

  // For prose text, collapse newlines to spaces before rendering
  let processedText = text
  if (!preserveNewlines && text.includes('\n')) {
    processedText = text.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
  }

  if (!processedText.includes('\n') && !processedText.includes('*') && !hasSup) {
    return processedText
  }

  // Split on inline formatting patterns
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\n)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  const pushPlain = (s: string) => {
    if (!s) return
    const nodes = renderWithSuperscripts(s, key)
    key += nodes.filter(n => typeof n !== 'string').length
    parts.push(...nodes)
  }

  while ((match = regex.exec(processedText)) !== null) {
    if (match.index > lastIndex) {
      pushPlain(processedText.slice(lastIndex, match.index))
    }

    if (match[0] === '\n') {
      parts.push(<br key={`br${key++}`} />)
    } else if (match[2]) {
      parts.push(<strong key={`b${key++}`}>{renderWithSuperscripts(match[2], key)}</strong>)
    } else if (match[3]) {
      parts.push(<em key={`i${key++}`}>{renderWithSuperscripts(match[3], key)}</em>)
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < processedText.length) {
    pushPlain(processedText.slice(lastIndex))
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>
}

/**
 * Renders a paragraph with highlight overlays.
 * Splits text into segments based on highlight offsets
 * and renders as alternating <span> and <mark> elements.
 * Preserves \n as <br /> for verse editions.
 */
export function ParagraphRenderer({ text, paragraphIndex, highlights, onMouseUp, isVerse = false, className }: ParagraphRendererProps) {
  // Filter highlights for this paragraph and sort by start offset
  const paraHighlights = highlights
    .filter(h => h.paragraphIndex === paragraphIndex)
    .sort((a, b) => a.startOffset - b.startOffset)

  // Normalize prose text the same way handleMouseUp does when computing offsets.
  // Offsets are calculated on normalized text, so we must slice the same string.
  const sliceText = isVerse ? text : text.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')

  const pClass = className ? `text-paragraph ${className}` : 'text-paragraph'
  const hasDropCap = pClass.split(/\s+/).includes('drop-cap')

  if (paraHighlights.length === 0) {
    return (
      <p className={pClass} data-paragraph-index={paragraphIndex} onMouseUp={onMouseUp}>
        {hasDropCap ? renderDropCapText(text) : renderFormattedText(text)}
      </p>
    )
  }

  // Build segments from the normalized text (same string offsets were computed against)
  const segments: TextSegment[] = []
  let pos = 0

  for (const hl of paraHighlights) {
    // Skip overlapping highlights — first one wins
    if (hl.startOffset < pos) continue

    // Text before highlight
    if (hl.startOffset > pos) {
      segments.push({ text: sliceText.slice(pos, hl.startOffset), startOffset: pos })
    }

    // Highlighted text
    const end = Math.min(hl.endOffset, sliceText.length)
    segments.push({ text: sliceText.slice(hl.startOffset, end), highlight: hl, startOffset: hl.startOffset })
    pos = end
  }

  // Remaining text after last highlight
  if (pos < sliceText.length) {
    segments.push({ text: sliceText.slice(pos), startOffset: pos })
  }

  return (
    <p className={pClass} data-paragraph-index={paragraphIndex} onMouseUp={onMouseUp}>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark
            key={i}
            className={`highlight highlight-${seg.highlight.color}`}
            data-highlight-id={seg.highlight.id}
            title={seg.highlight.note || undefined}
          >
            {hasDropCap && seg.startOffset === 0 ? renderDropCapText(seg.text, isVerse) : renderFormattedText(seg.text, isVerse)}
          </mark>
        ) : (
          <span key={i}>{hasDropCap && seg.startOffset === 0 ? renderDropCapText(seg.text, isVerse) : renderFormattedText(seg.text, isVerse)}</span>
        )
      )}
    </p>
  )
}
