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
}


/**
 * Renders inline text with formatting support:
 * - \n → <br /> (for verse) or space (for prose with embedded breaks)
 * - **bold** → <strong>
 * - *italic* → <em>
 */
function renderFormattedText(text: string, preserveNewlines?: boolean): React.ReactNode {
  // Fast path: no markers at all
  if (!text.includes('\n') && !text.includes('*')) return text

  // For prose text, collapse newlines to spaces before rendering
  let processedText = text
  if (!preserveNewlines && text.includes('\n')) {
    processedText = text.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
  }

  if (!processedText.includes('\n') && !processedText.includes('*')) return processedText

  // Split on inline formatting patterns
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\n)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(processedText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(processedText.slice(lastIndex, match.index))
    }

    if (match[0] === '\n') {
      parts.push(<br key={key++} />)
    } else if (match[2]) {
      parts.push(<strong key={key++}>{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[3]}</em>)
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < processedText.length) {
    parts.push(processedText.slice(lastIndex))
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

  if (paraHighlights.length === 0) {
    return (
      <p className={pClass} data-paragraph-index={paragraphIndex} onMouseUp={onMouseUp}>
        {renderFormattedText(text)}
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
      segments.push({ text: sliceText.slice(pos, hl.startOffset) })
    }

    // Highlighted text
    const end = Math.min(hl.endOffset, sliceText.length)
    segments.push({ text: sliceText.slice(hl.startOffset, end), highlight: hl })
    pos = end
  }

  // Remaining text after last highlight
  if (pos < sliceText.length) {
    segments.push({ text: sliceText.slice(pos) })
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
            {renderFormattedText(seg.text, isVerse)}
          </mark>
        ) : (
          <span key={i}>{renderFormattedText(seg.text, isVerse)}</span>
        )
      )}
    </p>
  )
}
