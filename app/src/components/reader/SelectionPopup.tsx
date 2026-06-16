import type { CSSProperties, RefObject } from 'react'
import { HIGHLIGHT_COLORS, type HighlightColor } from '../../types'
import type { DictResult } from '../../services/dictionary'
import type { SelectionSegment } from './selectionGeometry'

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
  // Main toolbar actions
  onExplain: () => void
  onCopy: () => void
  onShare?: (text: string) => void
  onDeleteHighlight?: (id: string) => void
  dismissPopup: () => void
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
  onExplain,
  onCopy,
  onShare,
  onDeleteHighlight,
  dismissPopup,
}: SelectionPopupProps) {
  return (
    <div
      ref={popupRef}
      className={`selection-popup ${selection.showBelow ? 'selection-popup-below' : ''} ${selection.mobilePlacement === 'above-selection' ? 'selection-popup-mobile-float' : ''}`}
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
      {/* Color submenu */}
      {popupMode === 'colors' && (
        <>
          <button className="popup-back-btn" onClick={() => setPopupMode('main')} title="Back">‹</button>
          <div className="popup-colors">
            {HIGHLIGHT_COLORS.map(c => (
              <button
                key={c.key}
                className={`popup-color-dot highlight-${c.key}`}
                title={`Highlight ${c.label}`}
                onClick={() => { onColorClick(c.key); setPopupMode('main') }}
              />
            ))}
          </div>
        </>
      )}

      {/* Dictionary panel */}
      {popupMode === 'define' && (
        <div className="popup-define">
          <div className="popup-define-head">
            <button className="popup-back-btn" onClick={() => setPopupMode('main')} title="Back">‹</button>
            <input
              className="popup-define-input"
              type="text"
              value={defineQuery}
              onChange={e => setDefineQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') runDefine(defineQuery) }}
              onBlur={() => runDefine(defineQuery)}
              placeholder="Look up a word…"
              autoFocus
            />
          </div>
          {defineLoading && <div className="popup-define-status">Looking up…</div>}
          {!defineLoading && defineResult && (
            <div className="popup-define-result">
              <div className="popup-define-word">{defineResult.word}</div>
              {defineResult.resolvedFrom && defineResult.resolvedFrom !== defineResult.word && (
                <div className="popup-define-note">from &ldquo;{defineResult.resolvedFrom}&rdquo;</div>
              )}
              <ol className="popup-define-list">
                {defineResult.definitions.map((d, i) => (
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
          {!defineLoading && !defineResult && !defineNotFound && !defineQuery && (
            <div className="popup-define-status">
              Type a word and press Enter to look it up.
            </div>
          )}
        </div>
      )}

      {/* Issue form */}
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
            <button className="popup-button" onClick={() => { setPopupMode('main'); setIssueTag(''); setIssueComment('') }}>Cancel</button>
            <button
              className="popup-button popup-button-primary"
              onClick={onIssueSubmit}
              disabled={!issueTag || issueSubmitting}
            >{issueSubmitting ? '…' : 'Report'}</button>
          </div>
        </div>
      )}

      {/* Note editor */}
      {popupMode === 'note' && selection.existingHighlightId && (
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
            <button className="popup-button" onClick={() => setPopupMode('main')}>Cancel</button>
            <button
              className="popup-button popup-button-primary"
              onClick={() => {
                onUpdateHighlightNote?.(selection.existingHighlightId!, noteInput.trim())
                dismissPopup()
              }}
            >Save</button>
          </div>
        </div>
      )}

      {/* Main icon toolbar */}
      {popupMode === 'main' && (
        <>
          <button className="popup-icon-btn" onClick={() => setPopupMode('colors')} title="Highlight">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.5 2.5 L13.5 5.5 L6 13 L2 14 L3 10 Z" />
              <line x1="8.5" y1="4.5" x2="11.5" y2="7.5" />
            </svg>
            <span className="popup-icon-label">Highlight</span>
          </button>

          <div className="popup-divider" />

          <button className="popup-icon-btn" onClick={onDefine} title="Define">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2 H12 A1 1 0 0 1 13 3 V13 A1 1 0 0 1 12 14 H4 A1 1 0 0 1 3 13 Z" />
              <line x1="5.5" y1="5" x2="10.5" y2="5" />
              <line x1="5.5" y1="8" x2="10.5" y2="8" />
              <line x1="5.5" y1="11" x2="8.5" y2="11" />
            </svg>
            <span className="popup-icon-label">Define</span>
          </button>

          <div className="popup-divider" />

          <button className="popup-icon-btn" onClick={onExplain} title="Chat about this">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 10a2 2 0 0 1-2 2H5l-3 3V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" />
            </svg>
            <span className="popup-icon-label">Chat</span>
          </button>

          <div className="popup-divider" />

          <button className="popup-icon-btn" onClick={() => setPopupMode('issue')} title="Report an issue">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2 L13 2 L10 9 L6 9 Z" />
              <circle cx="8" cy="13" r="1" fill="currentColor" stroke="none" />
            </svg>
            <span className="popup-icon-label">Issue</span>
          </button>

          <div className="popup-divider" />

          <button className="popup-icon-btn" onClick={onCopy} title="Copy text">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="5" width="9" height="9" rx="1" />
              <path d="M11 5 V3 a1 1 0 0 0 -1 -1 H3 a1 1 0 0 0 -1 1 v7 a1 1 0 0 0 1 1 h2" />
            </svg>
            <span className="popup-icon-label">Copy</span>
          </button>

          <div className="popup-divider" />

          <button className="popup-icon-btn" onClick={() => { onShare?.(selection.text); dismissPopup(); window.getSelection()?.removeAllRanges() }} title="Share this quote">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2 L8 11" />
              <path d="M5 5 L8 2 L11 5" />
              <path d="M3 9 L3 13 L13 13 L13 9" />
            </svg>
            <span className="popup-icon-label">Share</span>
          </button>

          {selection.existingHighlightId && (
            <>
              <div className="popup-divider" />
              <button className="popup-icon-btn" onClick={() => setPopupMode('note')} title="Add/edit note">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 2h12v12H2z" />
                  <line x1="5" y1="5" x2="11" y2="5" />
                  <line x1="5" y1="8" x2="11" y2="8" />
                  <line x1="5" y1="11" x2="8" y2="11" />
                </svg>
                <span className="popup-icon-label">Note</span>
              </button>
            </>
          )}

          {selection.existingHighlightId && (
            <>
              <div className="popup-divider" />
              <button
                className="popup-icon-btn popup-icon-btn-delete"
                onClick={() => { onDeleteHighlight?.(selection.existingHighlightId!); dismissPopup() }}
                title="Delete highlight"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3,4 13,4" />
                  <path d="M6 4 V2 h4 V4" />
                  <path d="M4 4 L5 14 h6 L12 4" />
                </svg>
                <span className="popup-icon-label">Delete</span>
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
