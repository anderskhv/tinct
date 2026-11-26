import type { Edition } from '../../types'
import './freeMode.css'

/**
 * Free reading mode's own pieces of chrome (freeMode.ts; docs/modern-english/free-reader/*.jpg):
 * - the edition switch: Original · Modern · Both beside the t menu on the desktop, Original | Modern in the phone's
 *   bottom band;
 * - the page number alone at the right of that band.
 * A selection offers what it offers a guest in the normal reader, AI included (freeMode.ts).
 */

type FreeView = 'original-en' | 'modern-en' | 'both'

const LABELS: Record<FreeView, string> = { 'original-en': 'Original', 'modern-en': 'Modern', both: 'Both' }

export function LabFreeModeEditions({ editions, current, both, phone = false, onChoose }: {
  editions: Array<Pick<Edition, 'key'>>
  /** The edition on screen, or 'both' in the desktop's Compare view. */
  current: string
  /** Both is offered (the desktop, with the two editions side by side available). */
  both: boolean
  phone?: boolean
  onChoose: (view: FreeView) => void
}) {
  const keys = new Set(editions.map(edition => edition.key))
  if (!keys.has('original-en') || !keys.has('modern-en')) return null
  const views: FreeView[] = ['original-en', 'modern-en', ...(both && !phone ? ['both' as const] : [])]
  return (
    <span className={`lab-free-editions${phone ? ' is-phone' : ''}`} role="group" aria-label="Edition" data-testid="lab-free-editions">
      {views.map(view => (
        <button key={view} type="button" aria-pressed={current === view} data-view={view}
          onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()}
          onClick={event => { event.stopPropagation(); if (current !== view) onChoose(view) }}>{LABELS[view]}</button>
      ))}
    </span>
  )
}

/** The page number alone, from the reader's own progress label ("40 / 266 of book" → "40"). */
export function freeModeFolio(progressLabel: string): string {
  return progressLabel.match(/\d[\d,]*/)?.[0] ?? ''
}

/** The phone's bottom band in free mode: the switch in the centre, the page number on the right. */
export function LabFreeModePhoneBand({ editions, current, progressLabel, onChoose }: {
  editions: Array<Pick<Edition, 'key'>>
  current: string
  progressLabel: string
  onChoose: (view: FreeView) => void
}) {
  return (
    <div className="lab-free-band" data-testid="lab-free-band">
      <LabFreeModeEditions editions={editions} current={current} both={false} phone onChoose={onChoose} />
      <span className="lab-free-folio" data-testid="lab-free-folio" aria-label={progressLabel || undefined}>{freeModeFolio(progressLabel)}</span>
    </div>
  )
}
