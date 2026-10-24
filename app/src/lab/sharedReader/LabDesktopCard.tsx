import { consumeDismissGesture } from '../../utils/consumeDismissGesture'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { PhoneIcon, type LabPhoneCardProps } from '../marginPhone/LabPhoneCard'
import { desktopCardPlace, type CardBox } from './desktopCardPlace'
import './desktopCard.css'

/** The same response body and Notebook flow as a phone card, placed outside selected ink. */
export function LabDesktopCard({ label, kind, onClose, onDelete, deleteLabel = 'Delete', children, foot, testId = 'lab-phone-card', getAnchor, hasPassage = false, passageText, embedded = false }: LabPhoneCardProps & { getAnchor?: () => CardBox | null; hasPassage?: boolean; passageText?: string; embedded?: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const customAnchor = useRef(getAnchor)
  customAnchor.current = getAnchor
  const close = useRef(onClose)
  close.current = onClose
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || embedded) return
    let frame = 0
    const place = () => {
      const top = Math.max(76, document.querySelector('.lab-header')?.getBoundingClientRect().bottom ?? 0)
      const bottom = window.innerHeight - 24
      const words = [...document.querySelectorAll('.lab .is-card-passage')]
      const boxes = words.flatMap(word => [...word.getClientRects()]).filter(box => box.width && box.height && box.bottom > top && box.top < bottom)
      // A closed/offscreen passage does not leave a response floating over unrelated text.
      const supplied = customAnchor.current?.()
      const fallback = document.querySelector('.continuous-reader-window, .lab-passage')?.getBoundingClientRect()
      el.style.visibility = customAnchor.current ? (supplied ? '' : 'hidden') : boxes.length || !hasPassage && !words.length ? '' : 'hidden'
      if (customAnchor.current && !supplied || !boxes.length && (hasPassage || words.length) && !supplied) return
      const ink = supplied ?? (boxes.length ? { left: Math.min(...boxes.map(b => b.left)), right: Math.max(...boxes.map(b => b.right)), top: Math.max(top, Math.min(...boxes.map(b => b.top))), bottom: Math.min(bottom, Math.max(...boxes.map(b => b.bottom))) } : { left: fallback?.left ?? 40, right: fallback?.right ?? window.innerWidth * .6, top: top + 20, bottom: top + 40 })
      const column = words[0]?.closest('.continuous-reader-window')?.getBoundingClientRect()
      // In Margin view use its reserved rail, even for a short selection within one line.
      const anchor = column ? { ...ink, left: Math.min(ink.left, column.left), right: Math.max(ink.right, column.right) } : ink
      const at = desktopCardPlace(anchor, { left: 20, right: window.innerWidth - 20, top, bottom })
      Object.assign(el.style, { left: `${at.left}px`, top: `${at.top}px`, width: `${at.width}px`, maxHeight: `${at.maxHeight}px` })
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; place() }) }
    place()
    // Passage marks are installed by the owning reader's layout effect.
    schedule()
    window.addEventListener('scroll', schedule, true)
    window.addEventListener('resize', schedule)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    observer?.observe(el)
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); window.removeEventListener('scroll', schedule, true); window.removeEventListener('resize', schedule) }
  }, [getAnchor, hasPassage, kind, label, embedded])
  useEffect(() => {
    if (embedded) return
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); close.current() } }
    const outside = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (!target || ref.current?.contains(target) || target.closest?.('.lab-v2-sheet-layer, [aria-modal="true"], .lab-super-menu, .lab-pbar')) return
      consumeDismissGesture(event)
      close.current()
    }
    window.addEventListener('keydown', key)
    window.addEventListener('pointerdown', outside, { capture: true, passive: false })
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('pointerdown', outside, true) }
  }, [embedded])
  if (embedded) return <><div className="lab-pcard-body" data-testid="lab-phone-card-body">{children}</div>{foot}</>
  return <section ref={ref} className="lab-pcard lab-desktop-card" role="dialog" aria-label={label} aria-description={passageText?.trim() || undefined} data-kind={kind} data-testid={testId} style={{ visibility: 'hidden' }}>
    <header className="lab-pcard-head">
      <span className="lab-pcard-label" data-testid="lab-phone-card-label">{label}</span>
      {onDelete && <button type="button" className="lab-pcard-bin" data-testid="lab-phone-card-delete" aria-label={deleteLabel} onClick={onDelete}><PhoneIcon name="trash" /></button>}
      <button type="button" className="lab-pcard-bin" aria-label="Close card" onClick={onClose}><PhoneIcon name="close" /></button>
    </header>
    <div className="lab-pcard-body" data-testid="lab-phone-card-body">{children}</div>
    {foot}
  </section>
}
