import type { CSSProperties, RefObject } from 'react'
import { HIGHLIGHT_COLORS, type HighlightColor } from '../../types'
import type { DictResult } from '../../services/dictionary'
import type { SelectionSegment } from './selectionGeometry'
import { defaultPopupMode, type SelectionPopupHomeMode } from './selectionPopupMode'

export type PopupMode = 'main' | 'colors' | 'issue' | 'note' | 'define'

// The selection/highlight action popup. Presentational: all state + handlers are
// owned by Reader.tsx and passed in. Extracted from Reader.tsx (slice 4).
export interface SelectionInfo {
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
  existingNote?: string
  noteEditMode?: boolean
}

export interface SelectionPopupProps {
  selection: SelectionInfo
  popupRef: RefObject<HTMLDivElement | null>
  popupMode: PopupMode
  setPopupMode: (mode: PopupMode) => void
  onColorClick: (color: HighlightColor) => void
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
  onRequestNote: () => void
  // Main toolbar actions
  onExplain: () => void
  onCopy: () => void
  onShare?: (text: string) => void
  onDeleteHighlight?: (id: string) => void
  dismissPopup: () => void
}

function homeModeFor(selection: SelectionInfo): SelectionPopupHomeMode {
  return defaultPopupMode(selection.text, selection.existingHighlightId)
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

function IssueIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2 L13 2 L10 9 L6 9 Z" />
      <circle cx="8" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2 L8 11" />
      <path d="M5 5 L8 2 L11 5" />
      <path d="M3 9 L3 13 L13 13 L13 9" />
    </svg>
  )
}

function DefineIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2 H12 A1 1 0 0 1 13 3 V13 A1 1 0 0 1 12 14 H4 A1 1 0 0 1 3 13 Z" />
      <line x1="5.5" y1="5" x2="10.5" y2="5" />
      <line x1="5.5" y1="8" x2="10.5" y2="8" />
      <line x1="5.5" y1="11" x2="8.5" y2="11" />
    </svg>
  )
}

export function SelectionPopup({
  selection,
  popupRef,
  popupMode,
  setPopupMode,
  onColorClick,
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
  onCopy,
  onShare,
  onDeleteHighlight,
  dismissPopup,
}: SelectionPopupProps) {
  const homeMode = homeModeFor(selection)
  const showActionBar = popupMode === 'define' || popupMode === 'colors'
  const headword = defineResult?.word || defineQuery
  const showDefineInput = popupMode === 'define' && !headword && !defineLoading

  return (
    <div
      ref={popupRef}
      className={`selection-popup ${selection.showBelow ? 'selection-popup-below' : ''} ${selection.mobilePlacement === 'above-selection' ? 'selection-popup-mobile-float' : ''}`}
      data-popup-mode={popupMode}
      style={{
        left: selection.x,
        top: selection.y,
        position: 'fixed',
        '--selection-popup-top': `${selection.y}px`,
      } as CSSProperties}
      onClick={e => e.stopPropagation()}
      onMouseUp={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
    >
      {popupMode === 'define' && (
        <div className="popup-define">
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

      {showActionBar && (
        <div className="popup-action-bar">
          <div className="popup-colors">
            {HIGHLIGHT_COLORS.map(c => (
              <button
                key={c.key}
                className={`popup-color-dot highlight-${c.key}`}
                title={`Highlight ${c.label}`}
                onClick={() => onColorClick(c.key)}
              />
            ))}
          </div>
          <button className="popup-bar-btn" onClick={onCopy} title="Copy text">
            <CopyIcon />
          </button>
          <button className="popup-bar-btn" onClick={onRequestNote} title="Add a note">
            <NoteIcon />
          </button>
          {selection.existingHighlightId && (
            <button
              className="popup-bar-btn popup-icon-btn-delete"
              onClick={() => { onDeleteHighlight?.(selection.existingHighlightId!); dismissPopup() }}
              title="Delete highlight"
            >
              <DeleteIcon />
            </button>
          )}
          <button className="popup-bar-btn" onClick={() => setPopupMode('main')} title="More actions">
            <MoreIcon />
          </button>
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

      {popupMode === 'note' && (
        <div className="popup-issue-form">
          <textarea
            className="popup-textarea"
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            placeholder="Add a note to this highlight..."
            rows={3}
            onClick={e => e.stopPropagation()}
            autoFocus
          />
          <div className="popup-note-actions">
            <button className="popup-button" onClick={() => setPopupMode(homeMode)}>Cancel</button>
            <button
              className="popup-button popup-button-primary"
              onClick={() => {
                if (selection.existingHighlightId) {
                  onUpdateHighlightNote?.(selection.existingHighlightId, noteInput.trim())
                }
                dismissPopup()
              }}
            >Save</button>
          </div>
        </div>
      )}

      {popupMode === 'main' && (
        <div className="popup-overflow">
          <button className="popup-back-btn" onClick={() => setPopupMode(homeMode)} title="Back">‹</button>
          <button className="popup-icon-btn" onClick={onExplain} title="Chat about this">
            <ChatIcon />
            <span className="popup-icon-label">Explain</span>
          </button>
          <button className="popup-icon-btn" onClick={() => setPopupMode('issue')} title="Report an issue">
            <IssueIcon />
            <span className="popup-icon-label">Report</span>
          </button>
          <button className="popup-icon-btn" onClick={() => { onShare?.(selection.text); dismissPopup(); window.getSelection()?.removeAllRanges() }} title="Share this quote">
            <ShareIcon />
            <span className="popup-icon-label">Share</span>
          </button>
          {homeMode !== 'define' && (
            <button className="popup-icon-btn" onClick={onDefine} title="Define">
              <DefineIcon />
              <span className="popup-icon-label">Define</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
