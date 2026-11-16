import { useCallback, useEffect, useRef, useState } from 'react'

/** How long the pointer rests in a paragraph's gutter before its ▶ shows (the gutter is a deliberate place to go). */
export const PARAGRAPH_LISTEN_REST_MS = 250
/** How long into the voice the after-Play offer (a faint ▶ beside each paragraph on screen) stays. */
export const LISTEN_OFFER_MS = 4000
/** How far left of the text column the gutter reaches. */
export const PARAGRAPH_LISTEN_GUTTER_PX = 96
const BUTTON = 30
const GAP = 10

interface Spot { chapterNumber: number; paragraphIndex: number }

interface Shown extends Spot {
  button: { left: number; top: number }
  tint: { left: number; top: number; width: number; height: number }
}

interface Props {
  /** The desktop Margin reader with the voice on (playing or paused) and nothing else holding the text (no selection popup). */
  enabled: boolean
  /** The reader's chapter (the one-chapter reader paints only it). */
  chapterNumber: number
  /** The paragraph the voice is reading (playing or paused): it never gets a ▶. */
  voice: Spot | null
  onListen: (chapterNumber: number, paragraphIndex: number) => void
  /**
   * Play was just pressed (narration loading, or the first seconds of the voice): offer a faint ▶ beside every
   * paragraph on screen, so the wait is a chance to choose where to start (Anders, 16 Nov 2026).
   */
  offer?: boolean
}

const TEXT_FIELD = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]'

function textFieldFocused(): boolean {
  const active = document.activeElement
  return active instanceof Element && active.matches(TEXT_FIELD)
}

function selectionExists(): boolean {
  const selection = window.getSelection?.()
  return !!selection && !selection.isCollapsed && selection.toString().trim().length > 0
}

const WORD = ':is([data-testid="lab-word"],[data-testid="lab-opening-word"])'
const same = (a: Spot | null, b: Spot | null) => !!a && !!b && a.chapterNumber === b.chapterNumber && a.paragraphIndex === b.paragraphIndex

/** The chapter's painted block in the scrolling reader (book scroll paints its neighbours too). */
function chapterScope(host: Element, chapterNumber: number): Element | null {
  return (host as HTMLElement).dataset.bookScroll ? host.querySelector(`[data-book-scroll-chapter="${chapterNumber}"]`) : host
}

/**
 * The paragraph beside a point in the left gutter, and its chapter. Only the gutter counts, never the text: a reader
 * rests the cursor on the text while reading (Anders, 16 Nov 2026: the ▶ appearing there was distracting).
 */
function paragraphAt(x: number, y: number, ownChapter: number): Spot | null {
  const target = document.elementFromPoint(x, y)
  if (!target || target.closest('p.lab-hearing-line, .source-margin-item, button, a, input, textarea, select, [contenteditable="true"]')) return null
  const host = document.querySelector<HTMLElement>('[data-testid="continuous-reader"]')
  const column = host?.querySelector<HTMLElement>('p.lab-hearing-line')?.getBoundingClientRect()
  if (!host || !column) return null
  const view = host.getBoundingClientRect()
  if (y < view.top || y > view.bottom || x >= column.left || x < column.left - PARAGRAPH_LISTEN_GUTTER_PX) return null
  const beside = document.elementFromPoint(column.left + 2, y)
  const line = beside?.closest('p.lab-hearing-line')
  if (!line || !host.contains(line)) return null
  const block = host.dataset.bookScroll ? line.closest<HTMLElement>('[data-book-scroll-chapter]') : null
  const chapterNumber = block ? Number(block.dataset.bookScrollChapter) : ownChapter
  const word = beside!.closest<HTMLElement>(`${WORD}[data-paragraph-index]`) ?? line.querySelector<HTMLElement>(`${WORD}[data-paragraph-index]`)
  const paragraphIndex = Number(word?.dataset.paragraphIndex)
  return Number.isInteger(paragraphIndex) && Number.isFinite(chapterNumber) ? { chapterNumber, paragraphIndex } : null
}

/** Where the paragraph's ▶ and tint go: the left gutter at its first line, and the paragraph's painted box. */
function geometry({ chapterNumber, paragraphIndex }: Spot): Shown | null {
  const host = document.querySelector('[data-testid="continuous-reader"]')
  const scope = host && chapterScope(host, chapterNumber)
  if (!host || !scope) return null
  const words = scope.querySelectorAll<HTMLElement>(`${WORD}[data-paragraph-index="${paragraphIndex}"]`)
  const lines = new Set<HTMLElement>()
  for (const word of words) { const line = word.closest<HTMLElement>('p.lab-hearing-line'); if (line) lines.add(line) }
  if (!lines.size) return null
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity
  for (const line of lines) {
    const box = line.getBoundingClientRect()
    if (box.height <= 0) continue
    left = Math.min(left, box.left); top = Math.min(top, box.top); right = Math.max(right, box.right); bottom = Math.max(bottom, box.bottom)
  }
  if (!Number.isFinite(left)) return null
  const view = host.getBoundingClientRect()
  const header = document.querySelector('.lab-header')?.getBoundingClientRect()
  const viewTop = header && header.height > 0 && header.bottom > view.top && header.bottom < view.top + view.height / 2 ? header.bottom : view.top
  const first = scope.querySelector<HTMLElement>(`${WORD}[data-paragraph-index="${paragraphIndex}"][data-word-index="0"]`)?.getBoundingClientRect()
  const lineTop = first && first.height > 0 ? first.top : top
  const lineHeight = first && first.height > 0 ? first.height : BUTTON
  const buttonTop = Math.max(viewTop + 4, Math.min(view.bottom - BUTTON - 4, lineTop + (lineHeight - BUTTON) / 2))
  const tintTop = Math.max(top, viewTop), tintBottom = Math.min(bottom, view.bottom)
  return {
    chapterNumber,
    paragraphIndex,
    button: { left: left - BUTTON - GAP, top: buttonTop },
    tint: { left: left - 6, top: tintTop - 3, width: right - left + 12, height: Math.max(0, tintBottom - tintTop + 6) },
  }
}

/** The reader's own chapter's paragraphs whose first line is on screen, each with its ▶ place (at most 24). */
function visibleParagraphs(chapterNumber: number): Shown[] {
  const host = document.querySelector('[data-testid="continuous-reader"]')
  const scope = host && chapterScope(host, chapterNumber)
  if (!host || !scope) return []
  const view = host.getBoundingClientRect()
  const header = document.querySelector('.lab-header')?.getBoundingClientRect()
  const viewTop = header && header.height > 0 && header.bottom > view.top && header.bottom < view.top + view.height / 2 ? header.bottom : view.top
  const out: Shown[] = []
  for (const first of scope.querySelectorAll<HTMLElement>(`${WORD}[data-word-index="0"][data-paragraph-index]`)) {
    const box = first.getBoundingClientRect()
    if (box.height <= 0 || box.bottom < viewTop + 4) continue
    if (box.top > view.bottom - BUTTON - 4) break
    const spot = geometry({ chapterNumber, paragraphIndex: Number(first.dataset.paragraphIndex) })
    if (spot && Number.isInteger(spot.paragraphIndex)) out.push(spot)
    if (out.length >= 24) break
  }
  return out
}

/**
 * Listen from here, the gutter ▶ (Anders approved the mockups, 16 Nov 2026). On a desktop with a hovering mouse and the
 * voice on (playing or paused), a dark round ▶ comes into the left gutter beside the paragraph whose gutter the pointer
 * has rested in for 250 ms (never over the text: Anders, 16 Nov 2026), and the
 * paragraph takes a faint tint; a click starts the voice at its first word. It is an overlay (fixed, out of the
 * text's flow): it moves nothing, and nothing but the button itself takes the pointer.
 */
export function LabParagraphListen({ enabled, chapterNumber, voice, onListen, offer = false }: Props) {
  const [shown, setShown] = useState<Shown | null>(null)
  const [tip, setTip] = useState(false)
  const shownRef = useRef<Shown | null>(null)
  shownRef.current = shown
  const voiceRef = useRef(voice)
  voiceRef.current = voice
  const chapterRef = useRef(chapterNumber)
  chapterRef.current = chapterNumber
  const onListenRef = useRef(onListen)
  onListenRef.current = onListen
  const hide = useCallback(() => { shownRef.current = null; setShown(null); setTip(false) }, [])

  useEffect(() => {
    if (!enabled) { hide(); return }
    const media = typeof window.matchMedia === 'function' ? window.matchMedia('(hover: hover) and (pointer: fine)') : null
    if (!media?.matches || document.querySelector('.lab.is-phone')) return
    let timer = 0
    let candidate: Spot | null = null
    let pointer: { x: number; y: number } | null = null
    const clear = () => { if (timer) { window.clearTimeout(timer); timer = 0 } }
    const blocked = () => selectionExists() || textFieldFocused()
    const at = (x: number, y: number) => paragraphAt(x, y, chapterRef.current)
    const arm = (spot: Spot | null) => {
      if (same(spot, candidate) && (timer || same(shownRef.current, spot))) return
      clear()
      hide()
      candidate = spot
      if (!spot || same(spot, voiceRef.current) || blocked()) return
      timer = window.setTimeout(() => {
        timer = 0
        if (!same(candidate, spot) || same(spot, voiceRef.current) || blocked()) return
        // Still resting on it: the pointer may have moved on without an event (a scroll under a still mouse).
        if (pointer && !same(at(pointer.x, pointer.y), spot)) return
        const next = geometry(spot)
        shownRef.current = next
        setShown(next)
      }, PARAGRAPH_LISTEN_REST_MS)
    }
    /** Inside the shown paragraph, its gutter strip and the button count as on it. */
    const insideShown = (x: number, y: number) => {
      const current = shownRef.current
      if (!current) return false
      const { tint, button } = current
      const inButton = x >= button.left && x <= button.left + BUTTON && y >= button.top && y <= button.top + BUTTON
      return inButton || (x >= button.left && x <= tint.left + tint.width && y >= tint.top && y <= tint.top + tint.height)
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') { clear(); hide(); candidate = null; return }
      pointer = { x: event.clientX, y: event.clientY }
      // A button held down is a selection (or a drag) in progress.
      if (event.buttons !== 0) { clear(); hide(); candidate = null; return }
      // On the ▶ itself (hit-testing can reach it a pixel before its painted edge), or inside its paragraph: keep it.
      if (event.target instanceof Element && event.target.closest('[data-testid="lab-paragraph-listen"], [data-testid="lab-paragraph-listen-offer"]')) return
      if (insideShown(event.clientX, event.clientY)) return
      arm(at(event.clientX, event.clientY))
    }
    const down = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-testid="lab-paragraph-listen"], [data-testid="lab-paragraph-listen-offer"]')) return
      clear(); hide(); candidate = null
    }
    const scroll = () => {
      // The text moved under the pointer: the paragraph there is a new one to rest on.
      clear(); hide(); candidate = null
      if (pointer) arm(at(pointer.x, pointer.y))
    }
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) { clear(); hide(); candidate = null } }
    const quiet = () => { if (blocked()) { clear(); hide() } }
    // Capture: a neighbouring chapter's text stops its own pointer events.
    window.addEventListener('pointermove', move, { capture: true, passive: true })
    window.addEventListener('pointerdown', down, true)
    window.addEventListener('scroll', scroll, { capture: true, passive: true })
    document.addEventListener('pointerout', leave)
    document.addEventListener('selectionchange', quiet)
    document.addEventListener('focusin', quiet)
    window.addEventListener('blur', hide)
    return () => {
      clear()
      window.removeEventListener('pointermove', move, true)
      window.removeEventListener('pointerdown', down, true)
      window.removeEventListener('scroll', scroll, true)
      document.removeEventListener('pointerout', leave)
      document.removeEventListener('selectionchange', quiet)
      document.removeEventListener('focusin', quiet)
      window.removeEventListener('blur', hide)
    }
  }, [enabled, hide])

  // Play was pressed: a faint ▶ beside each paragraph on screen until the offer ends; they follow the scroll.
  const [offered, setOffered] = useState<Shown[]>([])
  useEffect(() => {
    if (!enabled || !offer) { setOffered([]); return }
    const media = typeof window.matchMedia === 'function' ? window.matchMedia('(hover: hover) and (pointer: fine)') : null
    if (!media?.matches || document.querySelector('.lab.is-phone')) return
    let frame = 0
    const measure = () => { frame = 0; setOffered(selectionExists() ? [] : visibleParagraphs(chapterRef.current)) }
    const later = () => { if (!frame) frame = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', later, { capture: true, passive: true })
    window.addEventListener('resize', later)
    return () => { if (frame) cancelAnimationFrame(frame); window.removeEventListener('scroll', later, true); window.removeEventListener('resize', later) }
  }, [enabled, offer, chapterNumber])

  // The voice reached the paragraph: its ▶ goes.
  useEffect(() => { if (same(shown, voice)) hide() }, [shown, voice, hide])

  const offers = offer ? offered.filter(spot => !same(spot, voice) && !same(spot, shown)) : []
  if (!enabled || (!shown && !offers.length)) return null
  return <>
    {offers.map(spot => <button key={`${spot.chapterNumber}:${spot.paragraphIndex}`} type="button" className="lab-paragraph-listen is-offer" data-testid="lab-paragraph-listen-offer"
      data-chapter-number={spot.chapterNumber} data-paragraph-index={spot.paragraphIndex} aria-label="Listen from here" title="Listen from here"
      style={{ left: spot.button.left, top: spot.button.top }}
      onClick={() => { hide(); setOffered([]); onListenRef.current(spot.chapterNumber, spot.paragraphIndex) }}>
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8L10.2 6z" fill="currentColor" /></svg>
    </button>)}
    {shown && <>
    <div className="lab-paragraph-listen-tint" data-testid="lab-paragraph-listen-tint" aria-hidden="true"
      style={{ left: shown.tint.left, top: shown.tint.top, width: shown.tint.width, height: shown.tint.height }} />
    <button type="button" className="lab-paragraph-listen" data-testid="lab-paragraph-listen" data-chapter-number={shown.chapterNumber} data-paragraph-index={shown.paragraphIndex}
      aria-label="Listen from here" style={{ left: shown.button.left, top: shown.button.top }}
      onPointerEnter={() => setTip(true)} onPointerLeave={() => setTip(false)}
      onClick={() => { const { chapterNumber: chapter, paragraphIndex } = shown; hide(); onListenRef.current(chapter, paragraphIndex) }}>
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8L10.2 6z" fill="currentColor" /></svg>
      {tip && <span className="lab-paragraph-listen-tip" role="tooltip" data-testid="lab-paragraph-listen-tip">Listen from here</span>}
    </button>
    </>}
  </>
}
