import { useMemo, useState, type PointerEvent } from 'react'
import { tokenizeHearingWords } from '../labHearing'
import type { LabHighlight } from '../labHighlights'
import type { ContinuousReaderAnchor } from './continuousReaderWindow'

/** Source paragraphs, never ebook pages. Mirrors strip.js's faint lines, viewport box and mark dots. */
export function SourceMinimap({ paragraphs, visible, visibleEnd, highlights = [], onJump }: {
  paragraphs: readonly string[]; visible: ContinuousReaderAnchor; visibleEnd?: ContinuousReaderAnchor; highlights?: readonly LabHighlight[];
  onJump: (place: ContinuousReaderAnchor) => void
}) {
  const model = useMemo(() => {
    const weights = paragraphs.map(p => Math.max(1, tokenizeHearingWords(p).length))
    const starts: number[] = []
    let total = 0
    weights.forEach(weight => { starts.push(total); total += weight })
    return { weights, starts, total: total || 1 }
  }, [paragraphs])
  const [dragging, setDragging] = useState(false)
  const position = ((model.starts[visible.paragraphIndex] ?? 0) + visible.wordIndex) / model.total
  const jump = (event: PointerEvent<SVGSVGElement>) => {
    if (!paragraphs.length) return
    const box = event.currentTarget.getBoundingClientRect()
    const word = Math.max(0, Math.min(.999999, (event.clientY - box.top) / box.height)) * model.total
    let paragraphIndex = 0
    while (paragraphIndex + 1 < model.starts.length && model.starts[paragraphIndex + 1] <= word) paragraphIndex++
    onJump({ paragraphIndex, wordIndex: Math.min(model.weights[paragraphIndex] - 1, Math.max(0, Math.floor(word - model.starts[paragraphIndex]))) })
  }
  const lines = useMemo(() => {
    // At most one hairline per 3 SVG units, as the old strip's pitch guard.
    let previous = -3
    return paragraphs.flatMap((p, i) => {
      const lines = []
      const count = Math.max(1, Math.ceil(model.weights[i] / 12))
      for (let line = 0; line < count; line++) {
        const y = (model.starts[i] + line * 12) / model.total * 600
        if (y - previous < 3) continue
        previous = y
        lines.push({ y, width: line === count - 1 ? Math.max(6, Math.min(25, (model.weights[i] % 12 || 12) / 12 * 25)) : 25 })
      }
      return lines
    })
  }, [paragraphs, model])
  return <svg className="source-minimap" data-testid="source-minimap" viewBox="0 0 34 600" preserveAspectRatio="none"
    role="slider" tabIndex={0} aria-label="Chapter position" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(position * 100)}
    aria-valuetext={`${Math.round(position * 100)}% through this chapter`}
    onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId); setDragging(true); jump(event) }}
    onPointerMove={event => { if (dragging) jump(event) }} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}
    onKeyDown={event => {
      if (!paragraphs.length) return
      const step = event.key === 'ArrowDown' || event.key === 'PageDown' ? 1 : event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 0
      if (!step && event.key !== 'Home' && event.key !== 'End') return
      event.preventDefault()
      const paragraphIndex = event.key === 'Home' ? 0 : event.key === 'End' ? paragraphs.length - 1 : Math.max(0, Math.min(paragraphs.length - 1, visible.paragraphIndex + step))
      onJump({ paragraphIndex, wordIndex: 0 })
    }}>
    <title>Drag to move through the chapter</title>
    {lines.map((line, i) => <line key={i} x1={4} x2={4 + line.width} y1={line.y + .5} y2={line.y + .5} className="source-minimap-line" />)}
    <rect x={.5} y={Math.min(575, position * 600)} width={33} height={Math.max(8, Math.min(600 - position * 600, visibleEnd ? (((model.starts[visibleEnd.paragraphIndex] ?? 0) + visibleEnd.wordIndex + 1) / model.total - position) * 600 : 24))} rx={5} className="source-minimap-window" />
    {highlights.map(mark => <circle key={mark.id} cx={30} cy={(model.starts[mark.paragraphIndex] ?? 0) / model.total * 600} r={2} className="source-minimap-mark" style={{ fill: { gold: '#c7a855', rose: '#c5868b', sage: '#82a47b', sky: '#839fc5', lavender: '#a795bf' }[mark.color] }} />)}
  </svg>
}
