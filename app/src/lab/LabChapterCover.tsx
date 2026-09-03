import { useRef } from 'react'
import { labSwipePageDirection, labTapPageDirection, type LabPageTurnDirection } from './labChrome'

interface LabChapterCoverProps {
  title: string
  series: string
  editionLabel: string
  ground?: string
  accent?: string
  onPageTurn: (direction: LabPageTurnDirection) => void
  onToggleControls: () => void
}

export function labCoverTone(title: string): number {
  let hash = 0
  for (const character of title) hash = ((hash * 31) + character.charCodeAt(0)) >>> 0
  return hash % 5
}

export function LabChapterCover({ title, series, editionLabel, ground, accent, onPageTurn, onToggleControls }: LabChapterCoverProps) {
  const pointerRef = useRef<{ x: number; y: number; at: number } | null>(null)

  return (
    <article
      className={`lab-chapter-cover is-tone-${labCoverTone(title)}`}
      style={{
        ...(ground ? { ['--lab-cover-ground' as string]: ground } : {}),
        ...(ground ? { ['--lab-cover-shade' as string]: `color-mix(in srgb, ${ground} 72%, black)` } : {}),
        ...(accent ? { ['--lab-cover-accent' as string]: accent } : {}),
      }}
      data-testid="lab-chapter-cover"
      aria-label={`${title} cover page`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') onPageTurn(-1)
        if (event.key === 'ArrowRight' || event.key === ' ') onPageTurn(1)
      }}
      onPointerDown={(event) => {
        pointerRef.current = { x: event.clientX, y: event.clientY, at: event.timeStamp }
        try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* jsdom */ }
      }}
      onPointerUp={(event) => {
        const start = pointerRef.current
        pointerRef.current = null
        if (!start) return
        const deltaX = event.clientX - start.x
        const deltaY = event.clientY - start.y
        const swipe = labSwipePageDirection(deltaX, deltaY)
        const rect = event.currentTarget.getBoundingClientRect()
        const tap = Math.abs(deltaX) <= 10
          && Math.abs(deltaY) <= 10
          && event.timeStamp - start.at <= 500
          ? labTapPageDirection(event.clientX, rect.left, rect.width)
          : null
        const direction = swipe ?? tap
        if (direction != null) onPageTurn(direction)
        else if (tap == null && Math.abs(deltaX) <= 10 && Math.abs(deltaY) <= 10) onToggleControls()
      }}
    >
      <div className="lab-chapter-cover-book">
        <span className="lab-chapter-cover-series">{series}</span>
        <span className="lab-chapter-cover-mark" aria-hidden="true">{title.slice(0, 1)}</span>
        <h2>{title}</h2>
        <span className="lab-chapter-cover-rule" aria-hidden="true" />
        <small>{editionLabel}</small>
      </div>
    </article>
  )
}
