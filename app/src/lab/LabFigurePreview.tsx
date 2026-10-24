import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { LabFigureThumb } from './LabFigure'
import { figureName, type LabFigure } from './labFigures'
import './labFigurePreview.css'

const reference = /\b(fig(?:ure)?s?\.?|plates?|tables?)\s*((?:\d+|[IVXLC]+)(?:[.\-–]\d+)*[a-z]?)\b/gi
const key = (kind: string, number: string) => `${/^tab/i.test(kind) ? 'table' : /^plate/i.test(kind) ? 'plate' : 'figure'} ${number.toLowerCase().replace(/[–-]/g, '.')}`
/** Match a named reference at the pointer, never an unrelated number nearby. */
function figureReferenceIndex(figures: readonly LabFigure[]) {
  const names = new Map<string, LabFigure>()
  for (const figure of figures) {
    const label = [figure.label, figure.caption, figureName(figure)].map(text => new RegExp(reference.source, 'i').exec(text || '')).find(match => match && match.index < 3)
    if (label && label.index < 3 && !names.has(key(label[1], label[2]))) names.set(key(label[1], label[2]), figure)
  }
  return names
}

export function figureAtReference(text: string, offset: number, figures: readonly LabFigure[], names = figureReferenceIndex(figures)): LabFigure | null {
  for (const match of text.matchAll(new RegExp(reference.source, 'gi'))) {
    if (offset >= match.index! && offset <= match.index! + match[0].length) return names.get(key(match[1], match[2])) ?? null
  }
  return null
}

/** Desktop reference peek; it never changes selection, pagination, or reading position. */
export function LabFigurePreview({ figures, enabled, chapterNumber }: { figures: readonly LabFigure[]; enabled: boolean; chapterNumber?: number }) {
  const [peek, setPeek] = useState<{ figure: LabFigure; box: DOMRect } | null>(null)
  const [place, setPlace] = useState({ left: 0, top: 0 })
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setPeek(null)
    if (!enabled || !figures.length) return
    const indexes = new Map<number | undefined, Map<string, LabFigure>>()
    const hide = () => setPeek(null)
    const inspect = (event: Event) => {
      const pointer = event as PointerEvent
      if (event.type === 'pointermove' && (pointer.buttons || pointer.pointerType === 'touch')) { hide(); return }
      const target = event.target instanceof Element ? event.target : null
      const word = target?.closest<HTMLElement>('.lab.is-desktop [data-testid="lab-word"]')
      const line = word?.closest('.lab-hearing-line')
      if (!word || !line || word.closest('.is-figure')) { hide(); return }
      const words = [...line.querySelectorAll<HTMLElement>('[data-testid="lab-word"]')]
      const index = words.indexOf(word)
      const nearby = words.slice(Math.max(0, index - 1), index + 2)
      const text = nearby.map(node => node.textContent || '').join(' ')
      const offset = nearby.slice(0, nearby.indexOf(word)).reduce((sum, node) => sum + (node.textContent?.length || 0) + 1, 0)
      const sourceChapter = Number(word.closest('[data-chapter-number]')?.getAttribute('data-chapter-number')) || chapterNumber
      if (!indexes.has(sourceChapter)) {
        const scopedFigures = sourceChapter == null ? figures : [...figures.filter(figure => figure.chapterNumber === sourceChapter), ...figures.filter(figure => figure.chapterNumber !== sourceChapter)]
        indexes.set(sourceChapter, figureReferenceIndex(scopedFigures))
      }
      const figure = figureAtReference(text, offset, figures, indexes.get(sourceChapter))
      if (!figure) { hide(); return }
      const box = word.getBoundingClientRect()
      setPeek(current => current?.figure === figure && current.box.top === box.top && current.box.left === box.left ? current : { figure, box })
    }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') hide() }
    document.addEventListener('pointermove', inspect, { passive: true })
    document.addEventListener('focusin', inspect)
    document.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    window.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointermove', inspect)
      document.removeEventListener('focusin', inspect)
      document.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
      window.removeEventListener('keydown', escape)
    }
  }, [enabled, figures, chapterNumber])
  useLayoutEffect(() => {
    if (!peek || !ref.current) return
    const { width, height } = ref.current.getBoundingClientRect()
    setPlace({ left: Math.max(12, Math.min(window.innerWidth - width - 12, peek.box.left)),
      top: peek.box.bottom + height + 12 < window.innerHeight ? peek.box.bottom + 8 : Math.max(64, peek.box.top - height - 8) })
  }, [peek])
  return peek ? <div className="lab-figure-preview" role="tooltip" ref={ref} style={place} data-testid="lab-figure-preview">
    <LabFigureThumb figure={peek.figure} />
    <p>{peek.figure.caption || peek.figure.alt || figureName(peek.figure)}</p>
  </div> : null
}
