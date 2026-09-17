import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import type { CharacterSelection } from '../../services/characters/characterCards'
import { HIGHLIGHT_COLORS, type HighlightColor } from '../../types'
import type { DictResult } from '../../services/dictionary'
import type { SelectionSegment } from './selectionGeometry'
import { defaultPopupMode, type SelectionPopupHomeMode } from './selectionPopupMode'
import { ContextualExplainCard } from './ContextualExplainCard'

export type PopupMode = 'main' | 'colors' | 'issue' | 'note' | 'define' | 'character' | 'gallery' | 'explain'

// The selection/highlight action popup. Presentational: all state + handlers are
// owned by Reader.tsx and passed in. Extracted from Reader.tsx (slice 4).
export interface SelectionInfo {
  character?: CharacterSelection
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
  onRequestExplanation?: (onDelta: (text: string) => void) => Promise<string>
  onCopy: () => void
  onShare?: (text: string) => void
  onDeleteHighlight?: (id: string) => void
  dismissPopup: () => void
  lab?: boolean
}

function homeModeFor(selection: SelectionInfo): SelectionPopupHomeMode {
  return selection.homeMode ?? defaultPopupMode(selection.text, selection.existingHighlightId)
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="9" height="9" rx="1" />
      <path d="M11 5 V3 a1 1 0 0 0 -1 -1 H3 a1 1 0 0 0 -1 1 v7 a1 1 0 0 0 1 1 h2" />
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

function ChatIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 10a2 2 0 0 1-2 2H5l-3 3V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" />
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
  onExplanationReady,
  onTalkExplanation,
  onRequestExplanation,
  onCopy,
  onDeleteHighlight,
  dismissPopup,
  lab = false,
}: SelectionPopupProps) {
  const contextualExplain = lab && !!onRequestExplanation
  const [explainPlacement, setExplainPlacement] = useState({ edge: 'bottom', available: 520 })
  const openContextualExplanation = () => {
    // Position beside the selected passage without moving the reader or its place.
    const boxes = Array.from(document.querySelectorAll('.lab .lab-hearing-word.is-selecting'))
      .map(node => node.getBoundingClientRect())
      .filter(box => box.width && box.height && box.bottom > 0 && box.top < window.innerHeight)
    const top = boxes.length ? Math.min(...boxes.map(box => box.top)) : selection.y
    const bottom = boxes.length ? Math.max(...boxes.map(box => box.bottom)) : selection.y
    const above = top - 92
    const below = window.innerHeight - bottom - 100
    setExplainPlacement({ edge: above > below ? 'top' : 'bottom', available: Math.max(230, above > below ? above : below) })
    setPopupMode('explain')
  }
  useLayoutEffect(() => {
    if (!lab || !popupRef.current) return
    const el = popupRef.current
    const place = () => {
      // Preserve the compact anchor while CSS expands the card to the reader.
      if (el.querySelector('.lab-contextual-explain.is-expanded')) return
      const boxes = Array.from(document.querySelectorAll('.lab .lab-hearing-word.is-selecting'))
        .flatMap(node => Array.from(node.getClientRects()))
        .filter(box => box.width && box.height && box.bottom > 76 && box.top < window.innerHeight - 32)
      const top = boxes.length ? Math.min(...boxes.map(box => box.top)) : selection.y
      const bottom = boxes.length ? Math.max(...boxes.map(box => box.bottom)) : selection.y
      const height = el.offsetHeight
      const low = window.innerHeight - 32
      const above = top - 12 - height
      const below = bottom + 12
      const y = below + height <= low ? below : above >= 76 ? above
        : Math.max(76, Math.min(low - height, top - height - 12))
      const x = Math.max(12, Math.min(window.innerWidth - el.offsetWidth - 12, selection.x - el.offsetWidth / 2))
      el.style.setProperty('--anchored-popup-x', `${x}px`)
      el.style.setProperty('--anchored-popup-y', `${y}px`)
    }
    place()
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(place) : null
    observer?.observe(el)
    window.addEventListener('resize', place)
    return () => { observer?.disconnect(); window.removeEventListener('resize', place) }
  }, [lab, popupMode, selection.x, selection.y, popupRef])
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
  const roles: Record<string, string> = { central: 'Central figure', major: 'Major figure', supporting: 'Supporting figure', reference: 'Mentioned in passing' }

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
  const applyNoteColor = (color: HighlightColor) => {
    setLastColor(color)
    try { localStorage.setItem('tinct-highlight-color', color) } catch { /* private mode */ }
    if (selection.existingHighlightId) onUpdateHighlightNote?.(selection.existingHighlightId, noteInput.trim())
    onColorClick(color)
    dismissPopup()
  }
  const dismissRef = useRef(dismissPopup)
  dismissRef.current = dismissPopup
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (popupRef.current?.contains(event.target as Node)) return
      event.preventDefault(); event.stopImmediatePropagation()
      // Keep swallowing the initiating gesture after this popup unmounts.
      // Pointerdown alone does not suppress touchend or a subsequent click.
      const types = ['pointerup', 'pointermove', 'mousedown', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'click', 'contextmenu'] as const
      const consume = (next: Event) => { next.preventDefault(); next.stopImmediatePropagation(); if (next.type === 'click') cleanup() }
      const cleanup = () => { types.forEach(type => window.removeEventListener(type, consume, true)); window.removeEventListener('pointerdown', cleanup, true); clearTimeout(timer) }
      types.forEach(type => window.addEventListener(type, consume, { capture: true, passive: false }))
      const timer = window.setTimeout(cleanup, 10_000)
      window.addEventListener('pointerdown', cleanup, { capture: true, once: true })
      dismissRef.current()
    }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); dismissRef.current() } }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', outside, { capture: true, passive: false })
    return () => { window.removeEventListener('pointerdown', outside, true); window.removeEventListener('keydown', onKey, true) }
  }, [popupRef])
  const headword = defineResult?.word || defineQuery
  const showDefineInput = popupMode === 'define' && !headword && !defineLoading

  return (
    <div
      ref={popupRef}
      tabIndex={-1}
      role={character || popupMode === 'explain' ? 'dialog' : undefined}
      aria-label={popupMode === 'explain' ? 'Explain this passage' : character ? 'People at this passage' : undefined}
      onKeyDown={event => {
        event.stopPropagation()
        if (event.key === 'Escape') { event.preventDefault(); dismissPopup() }
        if (event.key === 'Tab') {
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, input, textarea, [tabindex="0"]')).filter(el => !el.hasAttribute('disabled'))
          const index = controls.indexOf(document.activeElement as HTMLElement)
          if (controls.length && (event.shiftKey ? index <= 0 : index === controls.length - 1 || index < 0)) {
            event.preventDefault(); controls[event.shiftKey ? controls.length - 1 : 0].focus()
          }
        }
      }}
      className={`selection-popup is-compact${popupMode === 'explain' ? ' is-contextual-explain' : ''}${lab ? ' is-lab' : ''} ${selection.showBelow ? 'selection-popup-below' : ''} ${selection.mobilePlacement === 'above-selection' ? 'selection-popup-mobile-float' : ''}`}
      data-explain-edge={explainPlacement.edge}
      data-explain-side={selection.x < window.innerWidth / 2 ? 'right' : 'left'}
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
        <ContextualExplainCard passage={selection.text} request={onRequestExplanation} onAsk={onExplain} onTalk={onTalkExplanation} onReady={onExplanationReady} />
      )}
      {character && (popupMode === 'character' || popupMode === 'gallery') && (
        <div className="popup-character">
          <div className="popup-character-heading"><small>At this passage</small><button className="popup-more" type="button" onClick={() => setPopupMode('main')} aria-label="More actions"><MoreIcon /></button></div>
          {popupMode === 'character' && card && <>
            <h2>{card.name}</h2>
            {card.role && <small>{roles[card.role]}</small>}
            <p className="popup-character-subtitle">{card.subtitle}</p>
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
          <button className="popup-more" type="button" onClick={() => setPopupMode('main')} aria-label="More actions"><MoreIcon /></button>
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
          ) : headword ? (
            <div className="popup-define-word">{headword}</div>
          ) : null}
          {defineResult?.resolvedFrom && defineResult.resolvedFrom !== defineResult.word && (
            <div className="popup-define-note">from &ldquo;{defineResult.resolvedFrom}&rdquo;</div>
          )}
          {defineLoading && <div className="popup-define-status">Looking up…</div>}
          {!defineLoading && defineResult && (
            <div className="popup-define-result">
              <ol className="popup-define-list">
                {defineResult.definitions.slice(0, 3).map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ol>
            </div>
          )}
          {!defineLoading && defineNotFound && (
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
        {HIGHLIGHT_COLORS.map(c => <button key={c.key} type="button" className={`popup-color-dot highlight-${c.key}${(currentHighlightColor ?? lastColor) === c.key ? ' is-selected' : ''}`} title={`Highlight ${c.label}`} aria-label={`Highlight ${c.label}`} aria-pressed={(currentHighlightColor ?? lastColor) === c.key} onClick={() => applyColor(c.key)} />)}
        <button type="button" className="popup-add-note" aria-label={selection.existingNote ? 'Edit note' : 'Add note'} onClick={() => onRequestNote(lastColor)}>+</button>
      </div>}

      {popupMode === 'note' && (
        <div className={`popup-issue-form${contextualExplain ? ' popup-highlight-note' : ''}`}>
          {contextualExplain && <div className="popup-colors" aria-label="Highlight colour">{HIGHLIGHT_COLORS.map(c => <button key={c.key} type="button" className={`popup-color-dot highlight-${c.key}${(currentHighlightColor ?? lastColor) === c.key ? ' is-selected' : ''}`} title={`Highlight ${c.label}`} aria-label={`Highlight ${c.label}`} aria-pressed={(currentHighlightColor ?? lastColor) === c.key} onClick={() => { onColorClick(c.key); setLastColor(c.key) }} />)}</div>}
          <textarea
            className="popup-textarea"
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            placeholder={contextualExplain ? 'Add a note…' : 'Add a note to this highlight...'}
            aria-label="Highlight note"
            rows={3}
            onClick={e => e.stopPropagation()}
            autoFocus={!contextualExplain}
          />
          <div className="popup-note-actions">
            <button className="popup-button" onClick={() => {
              if (contextualExplain) setNoteInput(selection.existingNote || '')
              setPopupMode(homeMode)
            }}>{contextualExplain ? 'Back' : 'Cancel'}</button>
            <button
              className="popup-button popup-button-primary"
              onClick={() => {
                if (selection.existingHighlightId) {
                  onUpdateHighlightNote?.(selection.existingHighlightId, noteInput.trim())
                }
                dismissPopup()
              }}
            >{contextualExplain ? 'Save note' : 'Save'}</button>
          </div>
          {contextualExplain && selection.existingHighlightId && <button className="popup-button" onClick={() => { (selection.highlightIds ?? [selection.existingHighlightId!]).forEach(id => onDeleteHighlight?.(id)); dismissPopup() }}>Remove highlight</button>}
        </div>
      )}

      {(popupMode === 'main' || (popupMode === 'colors' && !contextualExplain)) && (
        <div className="popup-compact-menu">
          {informationMode && <div className="popup-menu-heading"><button type="button" onClick={() => { setGalleryId(null); setPopupMode(informationMode) }} aria-label="Back to information">‹ Back</button></div>}
          {contextualExplain ? (
            <>
              {selection.existingHighlightId && <button type="button" className="popup-menu-action" onClick={() => { (selection.highlightIds ?? [selection.existingHighlightId!]).forEach(id => onDeleteHighlight?.(id)); dismissPopup() }}><DeleteIcon /><span>Delete highlight</span></button>}
              <button type="button" className="popup-menu-action" onClick={openContextualExplanation}><span className="popup-highlight-symbol" aria-hidden="true">✧</span><span>Explain</span></button>
              <button type="button" className="popup-menu-action" onClick={() => onExplain()}><ChatIcon /><span>Ask</span></button>
              <button type="button" className="popup-menu-action" onClick={() => applyColor(lastColor)}><NoteIcon /><span>Highlight</span></button>
              <button type="button" className="popup-menu-action" onClick={onCopy}><CopyIcon /><span>Copy</span></button>
            </>
          ) : <>
          {selection.existingHighlightId ? <button type="button" className="popup-menu-action" onClick={() => { (selection.highlightIds ?? [selection.existingHighlightId!]).forEach(id => onDeleteHighlight?.(id)); dismissPopup() }}><DeleteIcon /><span>Remove highlight</span></button>
            : <button type="button" className="popup-menu-action" onClick={() => applyColor(lastColor)}><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="m3 10 7-7 3 3-7 7H3zM2 15h12" /></svg><span>Highlight</span></button>}
          {(popupMode === 'colors' || selection.existingHighlightId) && <div className="popup-colors" aria-label="Highlight colour">{HIGHLIGHT_COLORS.map(c => <button key={c.key} type="button" className={`popup-color-dot highlight-${c.key}${(currentHighlightColor ?? lastColor) === c.key ? ' is-selected' : ''}`} title={`Highlight ${c.label}`} aria-label={`Highlight ${c.label}`} aria-pressed={(currentHighlightColor ?? lastColor) === c.key} onClick={() => applyColor(c.key)} />)}</div>}
          <button type="button" className="popup-menu-action" onClick={onCopy}><CopyIcon /><span>Copy</span></button>
          <button type="button" className="popup-menu-action" onClick={() => onExplain()}><ChatIcon /><span>Ask</span></button>
          <button type="button" className="popup-menu-action" onClick={onRequestNote}><NoteIcon /><span>{selection.existingNote ? 'Edit note' : 'Add note'}</span></button>
          {character && <div className="popup-menu-secondary"><button type="button" onClick={onDefine}>Dictionary</button><button type="button" onClick={() => { setGalleryId(null); setPopupMode('gallery') }}>Character gallery</button></div>}
          </>}
        </div>
      )}
    </div>
  )
}
