import { useEffect, useRef, useState } from 'react'
import type { Edition } from '../../types'
import { FREE_MODE_LOCALE, freeModePair } from './freeMode'
import type { FreeModeLocale } from './freeModeLocale'
import './freeMode.css'

/**
 * Free reading mode's own pieces of chrome (freeMode.ts; docs/modern-english/free-reader/*.jpg):
 * - the edition switch: Original · Modern · Both beside the t menu on the desktop, Original | Modern in the phone's
 *   bottom band;
 * - the page number alone at the right of that band;
 * - Copy, the one action on a selection.
 */

/** An edition key of the book's pair (freeMode.ts freeModePair), or 'both'. */
type FreeView = string

export function LabFreeModeEditions({ editions, current, both, phone = false, onChoose, locale = FREE_MODE_LOCALE }: {
  editions: Array<Pick<Edition, 'key'>>
  /** The edition on screen, or 'both' in the desktop's Compare view. */
  current: string
  /** Both is offered (the desktop, with the two editions side by side available). */
  both: boolean
  phone?: boolean
  onChoose: (view: FreeView) => void
  /** Free mode's language; the page's own unless a test passes one. */
  locale?: FreeModeLocale
}) {
  const keys = new Set(editions.map(edition => edition.key))
  const pair = freeModePair(editions, locale)
  if (!keys.has(pair.original) || !keys.has(pair.modern)) return null
  const views: FreeView[] = [...(locale.first === 'modern' ? [pair.modern, pair.original] : [pair.original, pair.modern]), ...(both && !phone ? ['both'] : [])]
  const LABELS = locale.strings.editions
  return (
    <span className={`lab-free-editions${phone ? ' is-phone' : ''}`} role="group" aria-label={locale.strings.editionGroup} data-testid="lab-free-editions">
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
export function LabFreeModePhoneBand({ editions, current, progressLabel, onChoose, locale = FREE_MODE_LOCALE }: {
  editions: Array<Pick<Edition, 'key'>>
  current: string
  progressLabel: string
  onChoose: (view: FreeView) => void
  locale?: FreeModeLocale
}) {
  return (
    <div className="lab-free-band" data-testid="lab-free-band">
      <LabFreeModeEditions editions={editions} current={current} both={false} phone onChoose={onChoose} locale={locale} />
      <span className="lab-free-folio" data-testid="lab-free-folio" aria-label={progressLabel || undefined}>{freeModeFolio(progressLabel)}</span>
    </div>
  )
}

/** Copy, the one thing a selection offers in free mode. Placed above the selection, or below it near the top. */
export function LabFreeModeCopyBar({ text, x, y, onDone, locale = FREE_MODE_LOCALE }: { text: string; x: number; y: number; onDone: () => void; locale?: FreeModeLocale }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = async () => {
    let ok = false
    try { await navigator.clipboard.writeText(text); ok = true } catch { /* blocked: the browser's own copy still works */ }
    if (!ok) {
      try { ok = document.execCommand('copy') } catch { ok = false }
    }
    setCopied(ok)
    timer.current = window.setTimeout(onDone, ok ? 700 : 0)
  }
  const width = typeof window === 'undefined' ? 1024 : window.innerWidth
  const left = Math.min(Math.max(x, 48), width - 48)
  const below = y < 72
  return (
    <div className={`lab-free-copy${below ? ' is-below' : ''}`} role="toolbar" aria-label={locale.strings.selection} data-testid="lab-free-copy"
      style={{ left, top: below ? y + 28 : y - 12 }}
      onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()} onMouseDown={event => event.preventDefault()}>
      <button type="button" onClick={() => { void copy() }}>{copied ? locale.strings.copied : locale.strings.copy}</button>
    </div>
  )
}
