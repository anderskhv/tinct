import { useMemo, useState, type PointerEvent } from 'react'
import { tokenizeHearingWords } from '../labHearing'
import type { LabHighlight } from '../labHighlights'
import type { ContinuousReaderAnchor } from './continuousReaderWindow'

export interface SourceBookMap {
  chapters: readonly { number: number; title: string; wordCount?: number; paragraphCount?: number }[]
  chapterNumber: number
  onJumpChapter: (chapterNumber: number, anchor?: ContinuousReaderAnchor) => void
}

export type SourceMapCard = { id: string; paragraphIndex: number; wordIndex: number; label: string; onOpen: () => void }

/** Source paragraphs and the visible range, without annotation dots or ebook-page guesses. */
export function SourceMinimap({ paragraphs, visible, visibleEnd, bookMap, highlights = [], cards = [], onJump }: {
  paragraphs: readonly string[]; visible: ContinuousReaderAnchor; visibleEnd?: ContinuousReaderAnchor;
  bookMap?: SourceBookMap; highlights?: readonly LabHighlight[]; cards?: readonly SourceMapCard[];
  onJump: (place: ContinuousReaderAnchor) => void
}) {
  const model = useMemo(() => {
    const weights = paragraphs.map(p => Math.max(1, tokenizeHearingWords(p).length))
    const starts: number[] = []
    let total = 0
    weights.forEach(weight => { starts.push(total); total += weight })
    return { weights, starts, total: total || 1 }
  }, [paragraphs])
  const book = useMemo(() => {
    if (!bookMap?.chapters.length) return null
    let total = 0
    const chapters = bookMap.chapters.map(chapter => {
      const weight = chapter.number === bookMap.chapterNumber ? model.total : Math.max(1, chapter.wordCount || (chapter.paragraphCount || 1) * 80)
      const start = total
      total += weight
      return { ...chapter, start, weight }
    })
    const current = chapters.find(chapter => chapter.number === bookMap.chapterNumber)
    return current ? { chapters, current, total } : null
  }, [bookMap, model])
  const offset = book?.current.start ?? 0
  const total = book?.total ?? model.total
  const [dragging, setDragging] = useState(false)
  const position = ((model.starts[visible.paragraphIndex] ?? 0) + visible.wordIndex + offset) / total
  const atChapterEnd = visibleEnd?.paragraphIndex === paragraphs.length - 1 && visibleEnd.wordIndex >= (model.weights.at(-1) ?? 1) - 1
  const progress = atChapterEnd ? (offset + model.total) / total : position
  const mapHeight = Math.max(140, Math.min(600, Math.ceil(total / 12) * 5))
  const jump = (event: PointerEvent<SVGGElement>) => {
    if (!paragraphs.length) return
    const box = event.currentTarget.getBoundingClientRect()
    if (!(box.height > 0)) return
    const absolute = Math.max(0, Math.min(.999999, (event.clientY - box.top) / box.height)) * total
    const chapter = book?.chapters.find(chapter => absolute >= chapter.start && absolute < chapter.start + chapter.weight)
    if (chapter && chapter.number !== bookMap!.chapterNumber) { bookMap!.onJumpChapter(chapter.number); return }
    const word = Math.max(0, absolute - offset)
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
        const y = (offset + model.starts[i] + line * 12) / total * mapHeight
        if (y - previous < 3) continue
        previous = y
        lines.push({ y, width: line === count - 1 ? Math.max(6, Math.min(25, (model.weights[i] % 12 || 12) / 12 * 25)) : 25 })
      }
      return lines
    })
  }, [paragraphs, model, offset, total, mapHeight])
  return <svg className="source-minimap" data-testid="source-minimap" style={{ height: `min(calc(100dvh - 200px), ${mapHeight}px)` }} viewBox={`0 0 34 ${mapHeight}`} preserveAspectRatio="none" role="group" aria-label="Chapter reading overview">
    <g role="slider" tabIndex={0} aria-label={book ? "Book position" : "Chapter position"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}
    aria-valuetext={`${Math.round(progress * 100)}% through ${book ? "this book" : "this chapter"}`}
    onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId); setDragging(true); jump(event) }}
    onPointerMove={event => { if (dragging) jump(event) }} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}
    onKeyDown={event => {
      if (!paragraphs.length) return
      const step = event.key === 'ArrowDown' || event.key === 'PageDown' ? 1 : event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 0
      if (!step && event.key !== 'Home' && event.key !== 'End') return
      event.preventDefault()
      // A short final viewport can begin several paragraphs before its end.
      // Forward chapter-map keys must not turn that earlier top word into a
      // fresh jump and replace the already visible final source window.
      if (!book && atChapterEnd && (step > 0 || event.key === 'End')) return
      if (book && bookMap) {
        const index = book.chapters.findIndex(chapter => chapter.number === bookMap.chapterNumber)
        const target = event.key === 'Home' ? book.chapters[0] : event.key === 'End' ? book.chapters.at(-1)
          : step < 0 && visible.paragraphIndex === 0 ? book.chapters[index - 1]
          : step > 0 && visible.paragraphIndex === paragraphs.length - 1 ? book.chapters[index + 1] : undefined
        if (target && target.number !== bookMap.chapterNumber) { bookMap.onJumpChapter(target.number); return }
      }
      const paragraphIndex = event.key === 'Home' ? 0 : event.key === 'End' ? paragraphs.length - 1 : Math.max(0, Math.min(paragraphs.length - 1, visible.paragraphIndex + step))
      const atEnd = event.key === 'End' || step > 0 && visible.paragraphIndex >= paragraphs.length - 1
      onJump({ paragraphIndex, wordIndex: atEnd ? model.weights[paragraphIndex] - 1 : 0 })
    }}>
    <rect width={34} height={mapHeight} fill="transparent" />
    <title>{book ? 'Drag to move through the book; chapter sizes use available word counts' : 'Drag to move through the chapter'}</title>
    {book?.chapters.filter(chapter => chapter.number !== bookMap!.chapterNumber).map(chapter => <g key={chapter.number} data-map-chapter={chapter.number}>
      <title>{chapter.title}</title>
      <line x1={4} x2={24} y1={chapter.start / total * mapHeight} y2={chapter.start / total * mapHeight} className="source-minimap-line" />
      {Array.from({ length: Math.max(0, Math.floor(chapter.weight / total * mapHeight / 4) - 1) }, (_, index) => {
        const y = chapter.start / total * mapHeight + (index + 1) * 4
        return <line key={index} x1={6} x2={25} y1={y} y2={y} className="source-minimap-line" />
      })}
    </g>)}
    {lines.map((line, i) => <line key={i} x1={4} x2={4 + line.width} y1={line.y + .5} y2={line.y + .5} className="source-minimap-line" />)}
    <rect x={.5} y={Math.min(mapHeight - 8, position * mapHeight)} width={33} height={Math.max(8, Math.min(mapHeight - position * mapHeight, visibleEnd ? (((model.starts[visibleEnd.paragraphIndex] ?? 0) + visibleEnd.wordIndex + 1 + offset) / total - position) * mapHeight : 24))} rx={5} className="source-minimap-window" />
    </g>
    {cards.filter(card => card.paragraphIndex >= 0 && card.paragraphIndex < paragraphs.length).map(card => {
      const y = (offset + (model.starts[card.paragraphIndex] ?? 0) + card.wordIndex) / total * mapHeight
      const open = () => { onJump({ paragraphIndex: card.paragraphIndex, wordIndex: card.wordIndex }); card.onOpen() }
      return <g key={card.id} role="button" tabIndex={0} aria-label={card.label} className="source-minimap-card"
        onPointerDown={event => { event.stopPropagation(); event.preventDefault(); open() }}
        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); open() } }}>
        <title>{card.label}</title><rect x={26} y={Math.max(0, y - 3)} width={8} height={9} fill="transparent" />
        <rect x={29} y={y} width={3} height={3} rx={.7} fill="currentColor" />
      </g>
    })}
    {highlights.filter(mark => mark.kind !== 'chapter' && mark.paragraphIndex >= 0 && mark.paragraphIndex < paragraphs.length).map(mark => {
      const start = (model.starts[mark.paragraphIndex] ?? 0) + mark.fromWord
      const end = (model.starts[mark.endParagraphIndex] ?? start) + mark.toWord
      const y = (offset + start) / total * mapHeight
      return <g key={mark.id} role="button" tabIndex={0} aria-label={`${mark.note ? 'Note' : 'Highlight'}: ${mark.text || paragraphs[mark.paragraphIndex].slice(0, 80)}`}
        className="source-minimap-activity" data-color={mark.color}
        onPointerDown={event => { event.stopPropagation(); event.preventDefault(); onJump({ paragraphIndex: mark.paragraphIndex, wordIndex: mark.fromWord }) }}
        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); onJump({ paragraphIndex: mark.paragraphIndex, wordIndex: mark.fromWord }) } }}>
        <title>{mark.note || mark.text || 'Highlight'}</title>
        <rect x={2} y={Math.max(0, y - 3)} width={23} height={Math.max(8, (end - start) / total * mapHeight + 6)} fill="transparent" />
        <rect className="source-minimap-activity-ink" x={5} y={y} width={21} height={Math.max(2.5, (end - start) / total * mapHeight)} rx={.7} />
      </g>
    })}

    <text x={17} y={mapHeight + 20} className="source-minimap-progress" data-testid="source-map-progress" aria-label={`${Math.round(progress * 100)}% through ${book ? 'this book' : 'this chapter'}`}>{Math.round(progress * 100)}%</text>
  </svg>
}
