import { consumeDismissClick } from '../../utils/consumeDismissClick'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { PhoneIcon } from '../marginPhone/LabPhoneCard'
import type { CardBox } from './desktopCardPlace'
import { clampWords } from './cardPreview'
import './sourceMarginRail.css'

export interface SourceMarginEntry {
  id: string
  label: string
  source: () => CardBox | null
  order: number
  open: boolean
  content: ReactNode
  preview?: string
  /** An Ask's first question, shown above its preview when folded (cardPreview.ts). */
  previewQuestion?: string
  /** How many follow-ups the card holds. */
  previewMore?: number
  /** How the folded line opens (cardPreview.ts FoldedPreview.previewStyle). */
  previewStyle?: 'note' | 'whole'
  sourceText?: string
  onToggle: () => void
  onDelete?: () => void
  /** Notes without a passage have no source leader. */
  free?: boolean
  /** Focus the new editor only after its measured card is visible. */
  focusEditor?: boolean
  /**
   * A chapter's actions beside its heading (Primer, Recap, …; Anders, 3 Nov 2026): always shown, labelled with
   * the chapter, never folded or deleted. Its leader starts at the page border, like every card's.
   */
  actions?: true
  /**
   * The start actions (approved mockup, Anders 9 Nov 2026): 'start' is the book's "Before you start" card; 'start-later'
   * a later chapter's greyed card (dashed, muted) until one of its actions is chosen.
   */
  variant?: 'start' | 'start-later'
  /** An actions card that folds to its label alone, greyed with a +, until opened (Anders, 10 Nov 2026: "Before you start"). */
  collapsible?: boolean
}
export interface SourceMarginRailProps {
  host: HTMLElement | null
  entries: SourceMarginEntry[]
  ownsSourcePointer?: (event: PointerEvent) => boolean
  onBlankNote?: (position: { clientY: number; sourceY: number }) => void
}

export function sourceMarginLayout<T extends { id: string; y: number; height: number; order: number }>(items: T[], gap = 18) {
  let floor = 0
  return [...items].sort((a, b) => a.order - b.order || a.y - b.y || a.id.localeCompare(b.id)).map(item => {
    const top = Math.max(item.y, floor)
    floor = top + item.height + gap
    return { ...item, top }
  })
}
/** Start at the page border; every segment stays in the outside margin. */
export function sourceMarginLeaderPath(sourceX:number, sourceY:number, railLeft:number, headerY:number) {
  const channel=railLeft-12, end=railLeft-6
  return `M${sourceX} ${sourceY}H${channel}V${headerY}H${end}`
}
/** A layer in the source scroller, never another scrolling panel. */
/**
 * How a press in the Margin reader's blank margin starts a note. A mouse
 * press starts one at once. A finger (or a pen, which pans like one) must
 * hold still for a moment: a touch that moves, lifts early or becomes a
 * scroll makes no note (Surface Duo, 6 Nov 2026: a note on every touch in the
 * margin; Anders: "you need to long press to create a note with touch").
 */
export function sourceMarginBlankNoteGesture(pointerType: string | undefined, button: number | undefined): 'press' | 'long-press' | null {
  if (pointerType === 'touch' || pointerType === 'pen') return 'long-press'
  return button == null || button === 0 ? 'press' : null
}
/** How long a finger holds still in the blank margin before a note starts. */
export const SOURCE_MARGIN_NOTE_HOLD_MS = 500
/** Movement that turns a held finger into a scroll instead of a note. */
export const SOURCE_MARGIN_NOTE_SLOP_PX = 10

/**
 * Whether the click that folds an open margin card does nothing else (no word definition, no highlight menu;
 * consumeDismissClick). A mouse's main button on the page: yes. A control (the top bar, a button, a link, a field)
 * still acts on the same click, so the reader never clicks a button twice. A finger or a pen is left alone: there
 * the same touch scrolls the page, and a tap on a word defines nothing.
 */
export function sourceMarginDismissConsumes(pointerType: string, button: number, target: Element | null): boolean {
  if (pointerType !== 'mouse' || button !== 0 || !target) return false
  return !target.closest('button, a, input, textarea, select, summary, [role="button"], [role="slider"], [role="tab"], [contenteditable="true"], .lab-header')
}

export function SourceMarginRail({ host, entries, onBlankNote, ownsSourcePointer }: SourceMarginRailProps) {
  const layer = useRef<HTMLDivElement>(null)
  const latest = useRef(entries)
  latest.current = entries
  const sourcePointer = useRef(ownsSourcePointer)
  sourcePointer.current = ownsSourcePointer
  const heldNote = useRef<{ pointerId: number, x: number, y: number, timer: ReturnType<typeof setTimeout> } | null>(null)
  const cancelHeldNote = () => { if (heldNote.current) clearTimeout(heldNote.current.timer); heldNote.current = null }
  // The note opens under the resting finger; lifting it then taps whatever is
  // there now (the new card's header, which folds it). Swallow that one tap.
  const liftTap = useRef<(() => void) | null>(null)
  const swallowLiftTap = () => {
    liftTap.current?.()
    const swallow = (event: Event) => { event.preventDefault(); event.stopPropagation(); done() }
    const done = () => { clearTimeout(timer); window.removeEventListener('click', swallow, true); window.removeEventListener('pointerdown', done, true); liftTap.current = null }
    const timer = setTimeout(done, 1500)
    window.addEventListener('click', swallow, true)
    window.addEventListener('pointerdown', done, true)
    liftTap.current = done
  }
  useEffect(() => () => { if (heldNote.current) clearTimeout(heldNote.current.timer); liftTap.current?.() }, [])
  // A scroll means the finger was browsing, not holding still.
  useEffect(() => {
    if (!host) return
    const onScroll = () => { if (heldNote.current) { clearTimeout(heldNote.current.timer); heldNote.current = null } }
    host.addEventListener('scroll', onScroll, { passive: true })
    return () => host.removeEventListener('scroll', onScroll)
  }, [host])
  const [layout, setLayout] = useState<{ left: number; width: number; height: number; items: Array<{ id: string; top: number; y: number; sourceX: number | null }> }>({ left: 0, width: 380, height: 0, items: [] })
  useLayoutEffect(() => {
    if (!host || !layer.current) return
    let raf = 0
    const measure = () => {
      const frame = host.getBoundingClientRect()
      const columns = [...host.querySelectorAll<HTMLElement>('.continuous-reader-window, .pdf-original__page')].map(node => node.getBoundingClientRect())
      const located = latest.current.flatMap(entry => {
        const source = entry.source()
        if (!source) return []
        const el = [...(layer.current?.querySelectorAll<HTMLElement>('section[data-card-id]') ?? [])].find(el => el.dataset.cardId === entry.id)
        // A PDF may contain sheets of different widths. Use the sheet at the
        // source's first line, rather than extending from its last word or from
        // some other, wider page. Multi-line/cross-page quotes keep their first Y.
        const containing = columns.find(box => source.top >= box.top && source.top < box.bottom && source.left >= box.left && source.left <= box.right)
        const intersecting = columns.find(box => source.bottom > box.top && source.top < box.bottom)
        const border = containing?.right ?? intersecting?.right ?? (columns.length ? Math.max(...columns.map(box => box.right)) : null)
        return [{ id: entry.id, y: source.top - frame.top + host.scrollTop, sourceX: border === null ? null : border - frame.left + host.scrollLeft, height: el?.offsetHeight || (entry.open ? 100 : 46), order: entry.order }]
      })
      const left = columns.length ? Math.max(...columns.map(box => box.right - frame.left + host.scrollLeft)) + 18 : located.length ? Math.max(...located.map(item => item.sourceX ?? 0)) + 18 : Math.max(0, host.clientWidth - 400)
      const width = Math.max(1, Math.min(380, host.clientWidth - left - 18))
      const ordered = sourceMarginLayout(located)
      // The blank hit surface covers the source document, not just the first
      // viewport or the last existing card. Never use host.scrollHeight here:
      // our own absolute layer contributes to it and would prevent shrinking.
      const sourceBottoms = [...columns, ...[...host.querySelectorAll<HTMLElement>('.pdf-original__pages')].map(node => node.getBoundingClientRect())]
        .map(box => box.bottom - frame.top + host.scrollTop).filter(Number.isFinite)
      const paddingBottom = Number.parseFloat(getComputedStyle(host).paddingBottom) || 0
      const next = { left, width, height: Math.max(host.clientHeight, ...sourceBottoms.map(bottom => bottom + paddingBottom), ...ordered.map(item => item.top + item.height + 32)), items: ordered.map(item => ({ id: item.id, top: item.top, y: item.y, sourceX: item.sourceX })) }
      setLayout(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; measure() }) }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    observer?.observe(host)
    const observeGeometry = () => {
      for (const el of host.querySelectorAll<HTMLElement>('.continuous-reader-window, .pdf-original__page, .pdf-original__pages, section[data-card-id]')) observer?.observe(el)
    }
    observeGeometry()
    const mutation = typeof MutationObserver === 'undefined' ? null : new MutationObserver(() => { observeGeometry(); schedule() })
    // A page marked drawn (data-ready) is often the last change: an entry found only on a drawn page (a chapter's
    // actions) waited for it, and the CI release of 3 Nov 2026 rolled back on that race.
    mutation?.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-ready'] })
    measure(); schedule()
    host.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => { cancelAnimationFrame(raf); observer?.disconnect(); mutation?.disconnect(); host.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule) }
  }, [host, entries.map(entry => `${entry.id}:${entry.open}`).join('|')])
  const focusedEditor = useRef<string | null>(null)
  const editorId = entries.find(entry => entry.open && entry.focusEditor)?.id ?? null
  useLayoutEffect(() => {
    if (!editorId) { focusedEditor.current = null; return }
    if (focusedEditor.current === editorId || !layout.items.some(item => item.id === editorId)) return
    const card = [...(layer.current?.querySelectorAll<HTMLElement>('section[data-card-id]') ?? [])].find(node => node.dataset.cardId === editorId)
    const field = card?.querySelector<HTMLTextAreaElement>('.lab-pcard-note, .lab-pcard-follow-input')
    if (!field) return
    field.focus({ preventScroll: true })
    if (document.activeElement === field) focusedEditor.current = editorId
  }, [editorId, layout])
  useEffect(() => {
    if (!host) return
    const covered = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null
      return !!element?.closest('.lab-v2-sheet-layer, [aria-modal="true"], .lab-super-menu, .lab-pbar, [role="listbox"], [role="menu"]')
        || !![...document.querySelectorAll('[aria-modal="true"], .lab-v2-sheet-layer, .lab-super-menu')].find(node => !node.closest('.source-margin-item') && !(node as HTMLElement).hidden)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || event.keyCode === 229 || covered(event.target)) return
      // A chapter's actions are always shown, never an open card: Escape is not theirs to take (start actions, 9 Nov 2026).
      const open = latest.current.filter(entry => entry.open && !entry.actions)
      if (open.length) { event.preventDefault(); event.stopPropagation(); open.forEach(entry => entry.onToggle()) }
    }
    const outside = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target || covered(target) || target.closest('.source-margin-item, .source-margin-room, [data-source-card-id], [data-source-mark-id], .pdf-original__minimap, .source-minimap') || sourcePointer.current?.(event)) return
      const open = latest.current.filter(entry => entry.open && !entry.actions)
      if (!open.length) return
      // Clicking away is one whole click that only dismisses (Anders, 11 Nov 2026: folding a card by clicking the
      // page also opened the clicked word's definition). A press that becomes a drag still selects.
      if (sourceMarginDismissConsumes(event.pointerType, event.button, target)) consumeDismissClick(event)
      open.forEach(entry => entry.onToggle())
    }
    window.addEventListener('keydown', key, true)
    window.addEventListener('pointerdown', outside, true)
    return () => { window.removeEventListener('keydown', key, true); window.removeEventListener('pointerdown', outside, true) }
  }, [host])
  if (!host) return null
  return createPortal(<div ref={layer} className="source-margin-rail" data-testid="source-margin-rail" style={{ height: layout.height }}>
    <div className="source-margin-room" aria-hidden="true" style={{ left: Math.max(0, layout.left - 18), width: Math.max(layout.width + 18, host.clientWidth - Math.max(0, layout.left - 18)), height: layout.height }} onPointerDown={event => {
      const gesture = sourceMarginBlankNoteGesture(event.pointerType, event.button)
      if (event.target !== event.currentTarget || !gesture) return
      const at = { clientY: event.clientY, sourceY: event.clientY - host.getBoundingClientRect().top + host.scrollTop }
      if (gesture === 'long-press') {
        // Left to the browser, so a finger that moves scrolls the book; only a
        // finger held still starts a note.
        cancelHeldNote()
        heldNote.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, timer: setTimeout(() => { heldNote.current = null; swallowLiftTap(); onBlankNote?.(at) }, SOURCE_MARGIN_NOTE_HOLD_MS) }
        return
      }
      // Starting a note in blank paper must not start a native drag selection
      // extending into the reading column. Card bodies remain selectable.
      event.preventDefault()
      event.stopPropagation()
      onBlankNote?.(at)
    }} onPointerMove={event => {
      const held = heldNote.current
      if (held?.pointerId === event.pointerId && Math.max(Math.abs(event.clientX - held.x), Math.abs(event.clientY - held.y)) > SOURCE_MARGIN_NOTE_SLOP_PX) cancelHeldNote()
    }} onPointerUp={cancelHeldNote} onPointerCancel={cancelHeldNote} onPointerLeave={cancelHeldNote}
      onContextMenu={event => event.preventDefault()} />
    <svg className="source-margin-leaders" data-testid="source-margin-leaders" width="100%" height={layout.height} aria-hidden="true">
      {layout.items.map(at => { const entry = entries.find(item => item.id === at.id); if (!entry || entry.free || at.sourceX === null) return null
        const endY = at.top + 16
        return <g key={at.id} data-card-id={at.id} className={entry.open ? 'is-open' : 'is-folded'}><path d={sourceMarginLeaderPath(at.sourceX, at.y, layout.left, endY)} /></g>
      })}
    </svg>
    {entries.map(entry => { const at = layout.items.find(item => item.id === entry.id)
      // A chapter's actions appear only once its heading is on a drawn page; a card is measured hidden first.
      if (entry.actions && !at) return null
      return <section key={entry.id} data-testid="source-margin-item" data-card-id={entry.id} data-source-order={entry.order} data-open={entry.actions ? undefined : entry.open} className={`source-margin-item ${entry.open ? 'is-open' : 'is-folded'}${entry.actions ? ' is-actions' : ''}${entry.collapsible ? ' is-collapsible' : ''}${entry.variant ? ` is-${entry.variant}` : ''}`} aria-describedby={entry.sourceText ? `source-about-${entry.id}` : undefined} style={{ left: layout.left, width: layout.width, top: at?.top ?? 0, visibility: at ? undefined : 'hidden' }}>
        <header className="source-margin-head">{entry.actions && !entry.collapsible ? <span className="source-margin-label">{entry.label}</span> : <button type="button" data-testid="source-margin-open" className="source-margin-label" onClick={entry.onToggle} aria-expanded={entry.open}>{entry.label}</button>}
          {/* One place opens and minimises (tester, 9 Nov 2026: the open click and the minimise sat apart). */}
          {(!entry.actions || entry.collapsible) && <button type="button" data-testid={entry.open ? 'source-margin-minimise' : 'source-margin-expand'} className="source-margin-toggle" aria-label={entry.open ? 'Minimise' : 'Open'} aria-expanded={entry.open} onClick={entry.onToggle}>{entry.open ? '−' : '+'}</button>}
          {entry.onDelete && <button type="button" aria-label={`Delete ${entry.label}`} onClick={entry.onDelete}><PhoneIcon name="trash" /></button>}
        </header>
        {entry.sourceText && <span className="lab-visually-hidden" id={`source-about-${entry.id}`}>{entry.sourceText}</span>}
        {!entry.open && !entry.actions && <button type="button" className="source-margin-preview" data-preview={entry.previewStyle} onClick={entry.onToggle}>{/* Folded is one line, enough to recall the card (Anders, 9 Nov 2026): an Ask shows its question, every other card its first words. */}{entry.previewQuestion ? <span className="source-margin-preview-question">{entry.previewQuestion}</span> : <span className="source-margin-preview-lead">{entry.preview ? clampWords(entry.preview, 220) : 'Open this card'}</span>}</button>}
        <div className="source-margin-content" hidden={!entry.open}>{entry.content}</div>
      </section>
    })}
  </div>, host)
}
