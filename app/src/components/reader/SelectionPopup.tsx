import { consumeDismissGesture } from '../../utils/consumeDismissGesture'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { flushSync } from 'react-dom'
import type { CharacterSelection, NamesakeNotice } from '../../services/characters/characterCards'
import { subtitleRepeatsBody } from '../../services/characters/cardSubtitle'
import { HIGHLIGHT_COLORS, type HighlightColor } from '../../types'
import type { DictResult } from '../../services/dictionary'
import type { SelectionSegment } from './selectionGeometry'
import { defaultPopupMode, type SelectionPopupHomeMode } from './selectionPopupMode'
import { DefinitionFallback } from './DefinitionFallback'
import { useReaderWindow } from '../../lab/useReaderWindow'
import { ContextualExplainCard } from './ContextualExplainCard'
import { useReaderSelectionCopy } from './useReaderSelectionCopy'
import { ChatIcon, HighlightIcon } from '../../lab/LabReaderIcons'
import { useLabKeyboardDock } from '../../lab/useLabKeyboardDock'
import { LAB_KEYBOARD_SHEET_ATTR } from '../../lab/labChrome'
import { SelectionDeskBar, type DeskBarState, type DeskMoreId } from './SelectionDeskBar'

/** The companion's passage actions the explanation card can show besides Explain (the margin reader's bar and •••). */
export type ExplainIntent = 'simplify' | 'factcheck' | 'counterpoint'

export type PopupMode = 'main' | 'colors' | 'issue' | 'note' | 'define' | 'character' | 'gallery' | 'explain'

// The selection/highlight action popup. Presentational: all state + handlers are
// owned by Reader.tsx and passed in. Extracted from Reader.tsx (slice 4).
export interface SelectionInfo {
  character?: CharacterSelection
  /** A tapped name several cards share, with no reviewed mention to say which. */
  namesakes?: NamesakeNotice
  x: number
  y: number
  text: string
  paragraphIndex: number
  startOffset: number
  endOffset: number
  segments?: SelectionSegment[]
  showBelow?: boolean
  mobilePlacement?: 'bottom' | 'above-selection'
  existingHighlightId?: string
  highlightIds?: string[]
  existingNote?: string
  noteEditMode?: boolean
  homeMode?: SelectionPopupHomeMode
}

export interface SelectionPopupProps {
  selection: SelectionInfo
  popupRef: RefObject<HTMLDivElement | null>
  popupMode: PopupMode
  setPopupMode: (mode: PopupMode) => void
  onColorClick: (color: HighlightColor) => void
  currentHighlightColor?: HighlightColor
  // Define panel
  defineQuery: string
  setDefineQuery: (q: string) => void
  defineResult: DictResult | null
  defineLoading: boolean
  defineNotFound: boolean
  runDefine: (q: string) => void
  onDefine: () => void
  // Issue form
  issueTag: string
  setIssueTag: (t: string) => void
  issueComment: string
  setIssueComment: (c: string) => void
  issueSubmitting: boolean
  onIssueSubmit: () => void
  // Note editor
  noteInput: string
  setNoteInput: (n: string) => void
  onUpdateHighlightNote?: (id: string, note: string) => void
  onRequestNote: (color?: HighlightColor) => void
  // Main toolbar actions
  onExplanationReady?: (answer: string) => void
  onTalkExplanation?: (answer: string) => void
  onExplain: (answer?: string) => void
  /** Private shared reader: submit a newly typed passage question through the existing chat service. */
  onAskQuestion?: (question: string) => void
  /** Private shared reader: start the existing passage quiz flow. */
  onQuizPassage?: () => void
  onPassageNote?: () => void
  onPassageAction?: (kind: 'explain' | 'simplify' | 'factcheck' | 'counterpoint' | 'define') => void
  /** `text` overrides the selection: a dictionary miss explains the looked-up word. */
  onRequestExplanation?: (onDelta: (text: string) => void, text?: string, intent?: 'define' | ExplainIntent) => Promise<string>
  onCopy: () => void
  /** A reader's own PDF read as Tinct text: its page, at this passage, in Original pages. */
  onShowPage?: () => void
  onShare?: (text: string) => void
  /** Share a saved highlight as an image (live reader). */
  onShareHighlight?: (id: string) => void
  onDeleteHighlight?: (id: string) => void
  dismissPopup: () => void
  lab?: boolean
  /** Phone: the note editor opens as a sheet docked on the software keyboard, not beside the passage. */
  keyboardDock?: boolean
  /**
   * Desktop: the margin reader's dark bar instead of the light menu and palette, and its dark note editor and Define
   * card (Anders, 22 Oct 2026: one selection pop-up everywhere). Answers still open where they did.
   */
  darkBar?: boolean
  /** Gates the consolidated AI actions and theme preview until the private reader is ready. */
  sharedReader?: boolean
  /** One in-card persistence status for a shared contextual answer. */
  saveError?: boolean
}

/** A passage quoted in the note editor, cut at 120 characters with … (margin.js cut). */
function cutQuote(text: string, max = 120): string {
  const bare = text.replace(/\s+/g, ' ').trim().replace(/^["“‘']+|["”’']+$/g, '')
  if (bare.length <= max) return bare
  const room = bare.slice(0, max - 1), at = room.lastIndexOf(' ')
  return (at > max * 0.6 ? room.slice(0, at) : room).replace(/[\s,;:.]+$/, '') + '…'
}

function homeModeFor(selection: SelectionInfo): SelectionPopupHomeMode {
  return selection.homeMode ?? defaultPopupMode(selection.text, selection.existingHighlightId)
}

/** Pointer-up already supplies a viewport anchor in the private reader. Keep
 * keyboard/invalid anchors on the measured-word path. */
function sharedPointerY(selection: SelectionInfo, sharedReader: boolean, keyboardDock: boolean): number | null {
  if (!sharedReader || keyboardDock || !Number.isFinite(selection.x) || !Number.isFinite(selection.y)
    || selection.x < 0 || selection.x > window.innerWidth || selection.y < 0 || selection.y > window.innerHeight
    || selection.text.length > 56 || /[\r\n]/.test(selection.text)) return null
  return selection.y + (selection.showBelow ? -12 : 12)
}

function selectedWordBounds(sharedReader: boolean, keyboardDock: boolean, topLimit: number, bottomLimit: number) {
  const words = document.querySelectorAll('.lab .lab-hearing-word.is-selecting')
  // A long private selection may span lines. The first and last words bound
  // the reading-order extent without forcing a layout read for every word.
  const nodes = sharedReader && !keyboardDock && words.length > 2 ? [words[0], words[words.length - 1]] : Array.from(words)
  const boxes = nodes.flatMap(node => Array.from(node.getClientRects()))
    .filter(box => box.width && box.height && box.bottom > topLimit && box.top < bottomLimit)
  return boxes.length ? { top: Math.min(...boxes.map(box => box.top)), bottom: Math.max(...boxes.map(box => box.bottom)) } : null
}

export function ShareIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 10V2M5 5l3-3 3 3M3 9v4.5h10V9" /></svg>
}

export function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="9" height="9" rx="1" />
      <path d="M11 5 V3 a1 1 0 0 0 -1 -1 H3 a1 1 0 0 0 -1 1 v7 a1 1 0 0 0 1 1 h2" />
    </svg>
  )
}

/** A page with its corner turned: the PDF's own page. */
function PageIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 2h5.5L12 4.5V14H4z" />
      <path d="M9.5 2v2.5H12" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2h12v12H2z" />
      <line x1="5" y1="5" x2="11" y2="5" />
      <line x1="5" y1="8" x2="11" y2="8" />
      <line x1="5" y1="11" x2="8" y2="11" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,4 13,4" />
      <path d="M6 4 V2 h4 V4" />
      <path d="M4 4 L5 14 h6 L12 4" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3.5" cy="8" r="1.3" />
      <circle cx="8" cy="8" r="1.3" />
      <circle cx="12.5" cy="8" r="1.3" />
    </svg>
  )
}





export function SelectionPopup({
  selection,
  popupRef,
  popupMode,
  setPopupMode,
  onColorClick,
  currentHighlightColor,
  defineQuery,
  setDefineQuery,
  defineResult,
  defineLoading,
  defineNotFound,
  runDefine,
  onDefine,
  issueTag,
  setIssueTag,
  issueComment,
  setIssueComment,
  issueSubmitting,
  onIssueSubmit,
  noteInput,
  setNoteInput,
  onUpdateHighlightNote,
  onRequestNote,
  onExplain,
  onAskQuestion,
  onQuizPassage,
  onPassageAction,
  onPassageNote,
  onExplanationReady,
  onTalkExplanation,
  onRequestExplanation,
  onCopy,
  onShowPage,
  onDeleteHighlight,
  onShareHighlight,
  dismissPopup,
  lab = false,
  keyboardDock = false,
  darkBar = false,
  sharedReader = false,
  saveError = false,
}: SelectionPopupProps) {
  const windowRef = useReaderWindow<HTMLDivElement>(popupMode === 'define' ? 'define' : 'explain', lab && (popupMode === 'explain' || popupMode === 'define'))
  const combinedRef = useCallback((node: HTMLDivElement | null) => { popupRef.current = node; windowRef(node) }, [popupRef, windowRef])
  useReaderSelectionCopy(lab ? selection.text : null)
  const compactAnchor = useRef<{ x: number; y: number; selectionX: number; selectionY: number } | null>(null)
  const explainAnchor = useRef<{ x: number; y: number; height: number; edge: 'below' | 'above' } | null>(null)
  const contextualExplain = lab && !!onRequestExplanation
  const [explainPlacement, setExplainPlacement] = useState({ edge: 'bottom', available: 520 })
  const [explainIntent, setExplainIntent] = useState<ExplainIntent | undefined>(undefined)
  const openContextualExplanation = (intent?: ExplainIntent) => {
    if (onPassageAction) { onPassageAction(intent ?? 'explain'); return }
    setExplainIntent(intent)
    // Position beside the selected passage without moving the reader or its place.
    const pointerY = sharedPointerY(selection, sharedReader, keyboardDock)
    const bounds = pointerY === null ? selectedWordBounds(sharedReader, keyboardDock, 0, window.innerHeight) : null
    const top = pointerY ?? bounds?.top ?? selection.y
    const bottom = pointerY ?? bounds?.bottom ?? selection.y
    const above = top - 92
    const below = window.innerHeight - bottom - 100
    setExplainPlacement({ edge: above > below ? 'top' : 'bottom', available: Math.max(230, above > below ? above : below) })
    setPopupMode('explain')
  }
  useLayoutEffect(() => {
    if (!lab || !popupRef.current) return
    const el = popupRef.current
    let placedBox: { width: number; height: number } | null = null
    const place = () => {
      // An expanding explanation grows in place: the edge that faces the
      // selection stays put, it widens to one leaf, and it moves only as far
      // as the window edge requires (it used to jump to a fixed leaf box).
      if (el.querySelector('.lab-contextual-explain.is-expanded')) {
        const anchor = explainAnchor.current
        if (!anchor) return
        const low = window.innerHeight - 32
        // Room on the card's own side of the selection: use it and scroll
        // inside, so the card never slides over the passage it explains.
        const room = anchor.edge === 'below' ? low - anchor.y : anchor.y + anchor.height - 76
        if (room >= 280) el.style.setProperty('max-height', `${room}px`, 'important')
        else el.style.removeProperty('max-height')
        const height = el.offsetHeight
        const width = el.offsetWidth
        placedBox = { width, height }
        const y = Math.max(76, Math.min(low - height, anchor.edge === 'below' ? anchor.y : anchor.y + anchor.height - height))
        const x = Math.max(12, Math.min(window.innerWidth - width - 12, anchor.x))
        el.style.setProperty('--anchored-popup-x', `${x}px`)
        el.style.setProperty('--anchored-popup-y', `${y}px`)
        return
      }
      const pointerY = sharedPointerY(selection, sharedReader, keyboardDock)
      const bounds = pointerY === null ? selectedWordBounds(sharedReader, keyboardDock, 76, window.innerHeight - 32) : null
      const top = pointerY ?? bounds?.top ?? selection.y
      const bottom = pointerY ?? bounds?.bottom ?? selection.y
      const height = el.offsetHeight
      const width = el.offsetWidth
      placedBox = { width, height }
      const low = window.innerHeight - 32
      const above = top - 12 - height
      const below = bottom + 12
      let y = below + height <= low ? below : above >= 76 ? above
        : Math.max(76, Math.min(low - height, top - height - 12))
      let x = Math.max(12, Math.min(window.innerWidth - width - 12, selection.x - width / 2))
      const saved = compactAnchor.current
      if (popupMode === 'colors' && saved?.selectionX === selection.x && saved.selectionY === selection.y) {
        x = Math.max(12, Math.min(window.innerWidth - width - 12, saved.x))
        y = Math.max(76, Math.min(low - height, saved.y))
      }
      if (popupMode === 'main' || popupMode === 'define') {
        compactAnchor.current = { x, y, selectionX: selection.x, selectionY: selection.y }
      }
      if (popupMode === 'explain') {
        const edge = y >= bottom ? 'below' : 'above'
        explainAnchor.current = { x, y, height, edge }
        // Cap the card to its side of the selection from the start, so growing
        // (more text, or More) never pushes it past the window edge.
        const room = edge === 'below' ? low - y : y + height - 76
        if (room >= 280) el.style.setProperty('max-height', `${room}px`, 'important')
        else el.style.removeProperty('max-height')
      } else el.style.removeProperty('max-height')
      el.style.setProperty('--anchored-popup-x', `${x}px`)
      el.style.setProperty('--anchored-popup-y', `${y}px`)
    }
    place()
    // observe() delivers the current box even when it has not changed. Its
    // duplicate placement would remeasure the selected words and force layout
    // while the toolbar is trying to appear. A genuinely changed box still
    // repositions the popup; window resize always does too.
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(entries => {
      const size = entries.find(entry => entry.target === el)?.borderBoxSize
      const box = (Array.isArray(size) ? size[0] : size) as ResizeObserverSize | undefined
      if (box && placedBox && Math.abs(box.inlineSize - placedBox.width) < 0.75
        && Math.abs(box.blockSize - placedBox.height) < 0.75) return
      place()
    }) : null
    observer?.observe(el)
    let frameId = 0
    const schedule = () => { if (!frameId) frameId = requestAnimationFrame(() => { frameId = 0; place() }) }
    window.addEventListener('resize', place)
    window.addEventListener('scroll', schedule, true)
    return () => { cancelAnimationFrame(frameId); observer?.disconnect(); window.removeEventListener('resize', place); window.removeEventListener('scroll', schedule, true) }
  }, [lab, popupMode, selection.x, selection.y, selection.showBelow, popupRef, sharedReader, keyboardDock])
  const homeMode = homeModeFor(selection)
  const [galleryId, setGalleryId] = useState<string | null>(null)
  useEffect(() => { setGalleryId(null) }, [selection.character])
  useEffect(() => {
    if (!selection.character) return
    const previous = document.activeElement as HTMLElement | null
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [selection.character])
  useEffect(() => {
    if ((selection.character && (popupMode === 'character' || popupMode === 'gallery')) || popupMode === 'explain') popupRef.current?.focus({ preventScroll: true })
  }, [selection.character, popupMode, popupRef])
  const character = selection.character
  const card = galleryId ? character?.gallery.find(entry => entry.card.id === galleryId)?.card : character?.card
  const roles: Record<string, string> = { central: 'Central figure', major: 'Major figure', supporting: 'Supporting figure', reference: 'Minor figure' }
  // Cards can be places, objects, peoples or personifications; "figure" only fits a being.
  const nonFigureRoles: Record<string, string> = { central: 'Central', major: 'Major', supporting: 'Supporting', reference: 'Minor' }
  const roleLabel = card?.role ? (['person', 'spirit', 'deity'].includes(card.kind) ? roles : nonFigureRoles)[card.role] : null

  const showDefinePanel = popupMode === 'define'
  const informationMode = character ? 'character' : homeMode === 'define' ? 'define' : null
  const [lastColor, setLastColor] = useState<HighlightColor>(() => {
    try { const saved = localStorage.getItem('tinct-highlight-color'); return HIGHLIGHT_COLORS.find(c => c.key === saved)?.key ?? 'gold' } catch { return 'gold' }
  })
  const applyColor = (color: HighlightColor) => {
    setLastColor(color)
    try { localStorage.setItem('tinct-highlight-color', color) } catch { /* private mode */ }
    onColorClick(color)
    setPopupMode('colors')
  }
  /**
   * Picking a colour from the open palette is a finished action: apply it and
   * get out of the reader's way. (`applyColor` on its own still opens the
   * palette — that is the Highlight action, whose whole point is to offer the
   * choice.)
   */
  const pickColor = (color: HighlightColor) => {
    applyColor(color)
    dismissPopup()
  }
  const noteFieldRef = useRef<HTMLTextAreaElement | null>(null)
  /**
   * Open the note editor and focus its field inside the same tap. iOS raises
   * the keyboard only for a focus made within the gesture; a field merely
   * rendered after it stayed unfocused, so text typed right after "Add note"
   * went nowhere (phone QA, 6 Oct). Opening an existing highlight's note
   * without this request still leaves the keyboard down.
   */
  const requestNote = (color?: HighlightColor) => {
    if (onPassageNote) { onPassageNote(); return }
    flushSync(() => onRequestNote(color))
    noteFieldRef.current?.focus({ preventScroll: true })
  }
  const docked = lab && keyboardDock && popupMode === 'note'
  useLabKeyboardDock(popupRef, docked)
  /**
   * A note typed but not saved is kept, not lost, when the popup goes away
   * other than by Back (a tap outside, Escape): it is saved as typed.
   */
  const keepDraftRef = useRef(() => {})
  keepDraftRef.current = () => {
    if (popupMode !== 'note' || !selection.existingHighlightId) return
    const draft = noteInput.trim()
    if (draft && draft !== (selection.existingNote || '').trim()) onUpdateHighlightNote?.(selection.existingHighlightId, draft)
  }
  const dismissRef = useRef(dismissPopup)
  dismissRef.current = () => { keepDraftRef.current(); dismissPopup() }
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (popupRef.current?.contains(event.target as Node)) return
      // A sheet opened above the popup (the account sheet after the free AI uses)
      // owns its own taps: its first button tap was eaten here (desktop QA, 9 Oct).
      if ((event.target as Element | null)?.closest?.('.lab-v2-sheet-layer, [aria-modal="true"]')) { dismissRef.current(); return }
      // The first outside gesture only dismisses, including desktop text.
      // Otherwise pointerup can open a definition beneath the closing menu.
      consumeDismissGesture(event)
      dismissRef.current()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      // The private Ask field and More menu close one level inside the bar.
      if (sharedReader && (event.target as Element | null)?.closest?.('.lab-dbar-ask-field, [data-shared-reader-menu]')) return
      event.preventDefault(); event.stopImmediatePropagation(); dismissRef.current()
    }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', outside, { capture: true, passive: false })
    return () => { window.removeEventListener('pointerdown', outside, true); window.removeEventListener('keydown', onKey, true) }
  }, [popupRef, sharedReader])
  const headword = defineResult?.word || defineQuery
  const contextualLookup = !character && contextualExplain
    && (typeof navigator === 'undefined' || navigator.onLine !== false)
    && (defineNotFound || /^[A-Z]/.test(defineQuery))
  const showDefineInput = popupMode === 'define' && !headword && !defineLoading
  const trapKeys = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.key === 'Escape') {
      if (sharedReader && (event.target as Element | null)?.closest?.('.lab-dbar-ask-field, [data-shared-reader-menu]')) return
      event.preventDefault(); dismissRef.current()
    }
    if (event.key === 'Tab') {
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, input, textarea, [tabindex="0"]')).filter(el => !el.hasAttribute('disabled'))
      const index = controls.indexOf(document.activeElement as HTMLElement)
      if (controls.length && (event.shiftKey ? index <= 0 : index === controls.length - 1 || index < 0)) {
        event.preventDefault(); controls[event.shiftKey ? controls.length - 1 : 0].focus()
      }
    }
  }
  // The dark bar (desktop): which of the margin reader's bar states this is. A saved highlight clicked keeps its own
  // bar ('existing') through a recolour; a fresh selection shows the menu, and its colours once it is highlighted.
  const openedOnMark = useRef<{ key: string; existing: boolean } | null>(null)
  const selectionKey = `${selection.x}:${selection.y}:${selection.text}`
  if (openedOnMark.current?.key !== selectionKey) openedOnMark.current = { key: selectionKey, existing: !!selection.existingHighlightId }
  const darkDesk = darkBar && lab && !keyboardDock
  if (darkDesk && (popupMode === 'main' || popupMode === 'colors')) {
    const barState: DeskBarState = openedOnMark.current.existing ? 'existing' : popupMode === 'colors' ? 'colors' : 'menu'
    const markId = selection.existingHighlightId
    const ask = contextualExplain
    const moreRows: DeskMoreId[][] = [
      ['define', ...(ask ? ['factcheck', 'counterpoint'] as DeskMoreId[] : []), ...(sharedReader && onQuizPassage ? ['quiz'] as DeskMoreId[] : []), ...(character ? ['gallery'] as DeskMoreId[] : [])],
      ['copy', ...(markId && onShareHighlight ? ['share'] as DeskMoreId[] : []), ...(onShowPage ? ['page'] as DeskMoreId[] : [])],
    ]
    const remember = (color: HighlightColor) => {
      setLastColor(color)
      try { localStorage.setItem('tinct-highlight-color', color) } catch { /* private mode */ }
    }
    return (
      <SelectionDeskBar
        ref={combinedRef}
        sharedReader={sharedReader}
        state={barState}
        color={currentHighlightColor ?? lastColor}
        marked={!!markId}
        noted={!!selection.existingNote}
        moreRows={moreRows}
        fallback={{ x: selection.x, y: selection.y }}
        containerProps={{ tabIndex: -1, onKeyDown: trapKeys, 'data-popup-home': homeMode, onClick: (e: React.MouseEvent) => e.stopPropagation(), onMouseUp: (e: React.MouseEvent) => e.stopPropagation(), onTouchEnd: (e: React.TouchEvent) => e.stopPropagation() }}
        onAsk={() => onExplain()}
        onAskQuestion={sharedReader ? onAskQuestion : undefined}
        onExplain={() => (ask ? openContextualExplanation() : onExplain())}
        onSimplify={() => (ask ? openContextualExplanation('simplify') : onExplain())}
        onMore={id => {
          if (id === 'define') { if (onPassageAction) onPassageAction('define'); else onDefine() }
          else if (id === 'factcheck' || id === 'counterpoint') openContextualExplanation(id)
          else if (id === 'quiz') onQuizPassage?.()
          else if (id === 'copy') onCopy()
          else if (id === 'share' && markId) onShareHighlight?.(markId)
          else if (id === 'page') onShowPage?.()
          else if (id === 'gallery') { setGalleryId(null); setPopupMode('gallery') }
        }}
        onHighlight={() => {
          // One click highlights in the current colour; on a highlighted passage it opens the colours.
          if (markId) { setPopupMode('colors'); return }
          remember(lastColor)
          onColorClick(lastColor)
        }}
        onSwatch={color => { remember(color); onColorClick(color) }}
        onNote={() => requestNote(currentHighlightColor ?? lastColor)}
        onRemove={() => { if (markId) (selection.highlightIds ?? [markId]).forEach(id => onDeleteHighlight?.(id)); dismissPopup() }}
      />
    )
  }

  return (
    <div
      ref={combinedRef}
      tabIndex={-1}
      role={character || popupMode === 'explain' ? 'dialog' : undefined}
      aria-label={popupMode === 'explain' ? 'Explain this passage' : character ? 'People at this passage' : undefined}
      onKeyDown={trapKeys}
      {...(docked ? { [LAB_KEYBOARD_SHEET_ATTR]: '' } : {})}
      className={`selection-popup is-compact${popupMode === 'explain' ? ' is-contextual-explain' : ''}${lab ? ' is-lab' : ''}${docked ? ' is-keyboard-docked' : ''}${darkDesk && (popupMode === 'note' || popupMode === 'define') ? ' is-dark' : ''}${sharedReader ? ' is-shared-reader' : ''} ${selection.showBelow ? 'selection-popup-below' : ''} ${selection.mobilePlacement === 'above-selection' ? 'selection-popup-mobile-float' : ''}`}
      data-explain-edge={explainPlacement.edge}
      data-explain-side={selection.x < window.innerWidth / 2 ? 'right' : 'left'}
      data-explain-origin={selection.x < window.innerWidth / 2 ? 'left' : 'right'}
      data-popup-mode={popupMode}
      data-popup-home={homeMode}
      style={{
        left: selection.x,
        top: selection.y,
        position: 'fixed',
        '--selection-popup-top': `${selection.y}px`,
        '--explain-available-height': `${explainPlacement.available}px`,
      } as CSSProperties}
      onClick={e => e.stopPropagation()}
      onMouseUp={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
    >
      {contextualExplain && popupMode === 'explain' && (
        <ContextualExplainCard key={explainIntent ?? 'explain'} passage={selection.text} saveError={sharedReader && saveError}
          request={explainIntent ? onDelta => onRequestExplanation(onDelta, undefined, explainIntent) : onRequestExplanation}
          onAsk={onExplain} onTalk={onTalkExplanation} onReady={explainIntent ? undefined : onExplanationReady} onClose={dismissPopup} onHighlight={() => setPopupMode('colors')} />
      )}
      {lab && (popupMode === 'define' || popupMode === 'explain') && <button type="button" data-reader-window-resize aria-label="Resize panel" />}
      {character && (popupMode === 'character' || popupMode === 'gallery') && (
        <div className="popup-character">
          <div className="popup-character-heading"><button className="popup-more" type="button" onClick={() => setPopupMode('main')} aria-label="More actions"><MoreIcon /></button></div>
          {popupMode === 'character' && card && <>
            <h2>{card.name}</h2>
            {roleLabel && <small>{roleLabel}</small>}
            {card.subtitle && !subtitleRepeatsBody(card.subtitle, card.body) && <p className="popup-character-subtitle">{card.subtitle}</p>}
            <p>{card.body}</p>

          </>}
          {popupMode === 'gallery' && <>
            <h2>Character gallery</h2>
            <div className="popup-character-gallery">
              {[true, false].map(inPassage => {
                const entries = character.gallery.filter(entry => entry.inPassage === inPassage)
                return entries.length ? <section key={String(inPassage)}><h3>{inPassage ? 'In this passage' : 'Introduced by this passage'}</h3>{entries.map(({ card: entry }) => <button type="button" key={entry.id} onClick={() => { setGalleryId(entry.id); setPopupMode('character') }}><strong>{entry.name}</strong><span>{entry.subtitle}</span></button>)}</section> : null
              })}
            </div>
            <button type="button" onClick={() => { setGalleryId(null); setPopupMode('character') }}>Back to selected name</button>
          </>}
        </div>
      )}
      {character && popupMode === 'define' && <button className="popup-button" onClick={() => { setGalleryId(null); setPopupMode('character') }}>Back to character</button>}
      {showDefinePanel && (
        <div className="popup-define">
          <header className="lab-reader-window-head" data-reader-window-handle>
            <span className="lab-reader-window-title popup-define-word">{headword}</span>
            <button className="lab-window-control" type="button" onClick={() => setPopupMode('main')} aria-label="More actions"><MoreIcon /></button>
            {lab && <button className="lab-window-control" type="button" aria-label="Close definition" onClick={dismissPopup}>×</button>}
          </header>
          {showDefineInput ? (
            <div className="popup-define-head">
              <input
                className="popup-define-input"
                type="text"
                value={defineQuery}
                onChange={e => setDefineQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') runDefine(defineQuery) }}
                onBlur={() => runDefine(defineQuery)}
                placeholder="Look up a word…"
              />
            </div>
          ) : null}
          {defineResult?.resolvedFrom && defineResult.resolvedFrom !== defineResult.word && (
            <div className="popup-define-note">from &ldquo;{defineResult.resolvedFrom}&rdquo;</div>
          )}
          {defineLoading && !contextualLookup && <div className="popup-define-status">Looking up…</div>}
          {!defineLoading && defineResult && !contextualLookup && (
            <div className="popup-define-result">
              <ol className="popup-define-list">
                {defineResult.definitions.slice(0, 3).map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ol>
            </div>
          )}
          {/* The passage lookup starts with the dictionary, not after it (Anders, 2026-10-06). */}
          {contextualLookup ? (
            <DefinitionFallback word={defineQuery} request={onRequestExplanation!} dictionaryDefinitions={defineLoading ? undefined : defineResult?.definitions} onChat={text => onExplain(text)} onTalk={onTalkExplanation} namesakes={selection.namesakes} />
          ) : !defineLoading && defineNotFound && (
            <div className="popup-define-status popup-define-empty">
              No definition found for &ldquo;{defineQuery}&rdquo;.
            </div>
          )}
        </div>
      )}

      {popupMode === 'issue' && (
        <div className="popup-issue-form">
          <div className="popup-tag-chips">
            {['Translation', 'Wrong text', 'Formatting', 'Other'].map(tag => (
              <button
                key={tag}
                className={`popup-tag-chip ${issueTag === tag ? 'selected' : ''}`}
                onClick={() => setIssueTag(tag)}
              >{tag}</button>
            ))}
          </div>
          <textarea
            className="popup-note-input"
            value={issueComment}
            onChange={e => setIssueComment(e.target.value)}
            placeholder="Optional comment..."
            rows={2}
            onClick={e => e.stopPropagation()}
          />
          <div className="popup-note-actions">
            <button className="popup-button" onClick={() => { setPopupMode(homeMode); setIssueTag(''); setIssueComment('') }}>Cancel</button>
            <button
              className="popup-button popup-button-primary"
              onClick={onIssueSubmit}
              disabled={!issueTag || issueSubmitting}
            >{issueSubmitting ? '…' : 'Report'}</button>
          </div>
        </div>
      )}

      {contextualExplain && popupMode === 'colors' && <div className="popup-highlight-palette" aria-label="Highlight colour">
        {HIGHLIGHT_COLORS.map(c => <button key={c.key} type="button" className={`popup-color-dot highlight-${c.key}${(currentHighlightColor ?? lastColor) === c.key ? ' is-selected' : ''}`} title={`Highlight ${c.label}`} aria-label={`Highlight ${c.label}`} aria-pressed={(currentHighlightColor ?? lastColor) === c.key} onClick={() => pickColor(c.key)} />)}
        <button type="button" className="popup-add-note" aria-label={selection.existingNote ? 'Edit note' : 'Add note'} onClick={() => requestNote(lastColor)}><span aria-hidden="true">+</span></button>
      </div>}

      {popupMode === 'note' && darkDesk && (
        // The margin reader's note editor (margin.js noteHtml): the passage, the field, Remove highlight and Save note.
        <div className="lab-dnote">
          <div className="lab-dnote-body">
            {selection.text && <p className="lab-dnote-quote">“{cutQuote(selection.text)}”</p>}
            <textarea
              ref={noteFieldRef}
              className="lab-dnote-field"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              placeholder="Add a note…"
              aria-label="Highlight note"
              rows={3}
              onClick={e => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="lab-dnote-foot">
            {selection.existingHighlightId
              ? <button type="button" className="is-quiet" onClick={() => { (selection.highlightIds ?? [selection.existingHighlightId!]).forEach(id => onDeleteHighlight?.(id)); dismissPopup() }}>Remove highlight</button>
              : <span />}
            <button
              type="button"
              disabled={!noteInput.trim() && !selection.existingNote}
              onClick={() => {
                if (!noteInput.trim() && !selection.existingNote) return
                if (selection.existingHighlightId) onUpdateHighlightNote?.(selection.existingHighlightId, noteInput.trim())
                dismissPopup()
              }}
            >Save note</button>
          </div>
        </div>
      )}
      {popupMode === 'note' && !darkDesk && (
        <div className={`popup-issue-form${contextualExplain ? ' popup-highlight-note' : ''}`}>
          {/* Same markup as the compact palette, so opening a note does not
              resize or shift the dots: the row stays put and the note grows
              out beneath it. */}
          {/* On the phone's keyboard sheet the passage is named above the colours (approved mockup, 12 Oct). */}
          {contextualExplain && selection.text && <p className="popup-note-quote">“{selection.text}”</p>}
          {contextualExplain && <div className="popup-highlight-palette" aria-label="Highlight colour">{HIGHLIGHT_COLORS.map(c => <button key={c.key} type="button" className={`popup-color-dot highlight-${c.key}${(currentHighlightColor ?? lastColor) === c.key ? ' is-selected' : ''}`} title={`Highlight ${c.label}`} aria-label={`Highlight ${c.label}`} aria-pressed={(currentHighlightColor ?? lastColor) === c.key} onClick={() => { onColorClick(c.key); setLastColor(c.key) }} />)}
            {/* The same "+" the palette carries, so the row is the same width
                and the pill does not narrow or re-centre; pressed, it folds
                the note away again. */}
            <button type="button" className="popup-add-note is-pressed" aria-label="Close note" aria-pressed="true" onClick={() => { setNoteInput(selection.existingNote || ''); setPopupMode(homeMode) }}><span aria-hidden="true">+</span></button>
          </div>}
          <div className={contextualExplain ? 'popup-note-body' : undefined}>
            <textarea
              ref={noteFieldRef}
              className="popup-textarea"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              placeholder={contextualExplain ? 'Add a note…' : 'Add a note to this highlight...'}
              aria-label="Highlight note"
              rows={3}
              onClick={e => e.stopPropagation()}
              // Desktop: type straight away (otherwise the reader's letter shortcuts
              // take the keys). Touch: the Add note tap focuses it (requestNote);
              // merely showing a note does not raise the keyboard.
              autoFocus={!contextualExplain || (typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches === true)}
            />
            <div className="popup-note-actions">
              {/* The reader's note sheet (approved mockup, 12 Oct): Remove highlight on the left,
                  Save note on the right; a tap outside keeps the draft. */}
              {contextualExplain && selection.existingHighlightId
                ? <button className="popup-button popup-note-remove" onClick={() => { (selection.highlightIds ?? [selection.existingHighlightId!]).forEach(id => onDeleteHighlight?.(id)); dismissPopup() }}>Remove highlight</button>
                : <button className="popup-button" onClick={() => {
                  if (contextualExplain) setNoteInput(selection.existingNote || '')
                  setPopupMode(homeMode)
                }}>{contextualExplain ? 'Back' : 'Cancel'}</button>}
              <button
                className="popup-button popup-button-primary"
                // An empty new note is never saved; clearing an existing one is.
                disabled={!noteInput.trim() && !selection.existingNote}
                onClick={() => {
                  if (!noteInput.trim() && !selection.existingNote) return
                  if (selection.existingHighlightId) {
                    onUpdateHighlightNote?.(selection.existingHighlightId, noteInput.trim())
                  }
                  dismissPopup()
                }}
              >{contextualExplain ? 'Save note' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {(popupMode === 'main' || (popupMode === 'colors' && !contextualExplain)) && (
        <div className="popup-compact-menu">
          {informationMode && <div className="popup-menu-heading"><button type="button" onClick={() => { setGalleryId(null); setPopupMode(informationMode) }} aria-label="Back to information">‹ Back</button></div>}
          {contextualExplain ? (
            <>
              {selection.existingHighlightId && <button type="button" className="popup-menu-action" onClick={() => { (selection.highlightIds ?? [selection.existingHighlightId!]).forEach(id => onDeleteHighlight?.(id)); dismissPopup() }}><DeleteIcon /><span>Delete highlight</span></button>}
              <button type="button" className="popup-menu-action" onClick={() => openContextualExplanation()}><span className="popup-highlight-symbol" aria-hidden="true">✧</span><span>Explain</span></button>
              {sharedReader && <>
                <button type="button" className="popup-menu-action" onClick={() => openContextualExplanation('simplify')}><span className="popup-highlight-symbol" aria-hidden="true">✧</span><span>Simplify</span></button>
                <button type="button" className="popup-menu-action" onClick={onDefine}><span className="popup-highlight-symbol" aria-hidden="true">⌕</span><span>Define</span></button>
                <button type="button" className="popup-menu-action" onClick={() => openContextualExplanation('factcheck')}><span className="popup-highlight-symbol" aria-hidden="true">✧</span><span>Fact-check</span></button>
                <button type="button" className="popup-menu-action" onClick={() => openContextualExplanation('counterpoint')}><span className="popup-highlight-symbol" aria-hidden="true">✧</span><span>Counterpoint</span></button>
                {onQuizPassage && <button type="button" className="popup-menu-action" onClick={onQuizPassage}><span className="popup-highlight-symbol" aria-hidden="true">✧</span><span>Quiz me</span></button>}
              </>}
              <button type="button" className="popup-menu-action" onClick={() => onExplain()}><ChatIcon /><span>Chat</span></button>
              <button type="button" className="popup-menu-action" onClick={() => applyColor(lastColor)}><HighlightIcon /><span>Highlight</span></button>
              <button type="button" className="popup-menu-action" onClick={onCopy}><CopyIcon /><span>Copy</span></button>
              {onShowPage && <button type="button" className="popup-menu-action" data-testid="popup-show-page" onClick={onShowPage}><PageIcon /><span>Show page</span></button>}
              {selection.existingHighlightId && onShareHighlight && <button type="button" className="popup-menu-action" data-testid="popup-share-highlight" onClick={() => onShareHighlight(selection.existingHighlightId!)}><ShareIcon /><span>Share</span></button>}
            </>
          ) : <>
          {selection.existingHighlightId ? <button type="button" className="popup-menu-action" onClick={() => { (selection.highlightIds ?? [selection.existingHighlightId!]).forEach(id => onDeleteHighlight?.(id)); dismissPopup() }}><DeleteIcon /><span>Remove highlight</span></button>
            : <button type="button" className="popup-menu-action" onClick={() => applyColor(lastColor)}><HighlightIcon /><span>Highlight</span></button>}
          {(popupMode === 'colors' || selection.existingHighlightId) && <div className="popup-colors" aria-label="Highlight colour">{HIGHLIGHT_COLORS.map(c => <button key={c.key} type="button" className={`popup-color-dot highlight-${c.key}${(currentHighlightColor ?? lastColor) === c.key ? ' is-selected' : ''}`} title={`Highlight ${c.label}`} aria-label={`Highlight ${c.label}`} aria-pressed={(currentHighlightColor ?? lastColor) === c.key} onClick={() => applyColor(c.key)} />)}</div>}
          <button type="button" className="popup-menu-action" onClick={onCopy}><CopyIcon /><span>Copy</span></button>
          {onShowPage && <button type="button" className="popup-menu-action" data-testid="popup-show-page" onClick={onShowPage}><PageIcon /><span>Show page</span></button>}
          <button type="button" className="popup-menu-action" onClick={() => onExplain()}><ChatIcon /><span>Chat</span></button>
          <button type="button" className="popup-menu-action" onClick={() => requestNote()}><NoteIcon /><span>{selection.existingNote ? 'Edit note' : 'Add note'}</span></button>
          {character && <div className="popup-menu-secondary"><button type="button" onClick={onDefine}>Dictionary</button><button type="button" onClick={() => { setGalleryId(null); setPopupMode('gallery') }}>Character gallery</button></div>}
          </>}
        </div>
      )}
    </div>
  )
}
