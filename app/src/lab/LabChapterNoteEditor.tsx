import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { LAB_KEYBOARD_SHEET_ATTR } from './labChrome'
import { consumeDismissGesture } from '../utils/consumeDismissGesture'
import { useLabKeyboardDock } from './useLabKeyboardDock'

export interface LabChapterNoteEditorProps {
  /** The chapter's saved note ('' for none). */
  initialNote: string
  /** Phone: a sheet docked on the software keyboard. Desktop: a card above the pill. */
  keyboardDock: boolean
  /** The Note pill's box, for the desktop card's place. */
  anchor: { left: number; top: number; bottom: number }
  onSave: (note: string) => void
  onClose: () => void
}

/**
 * The note editor of a highlight, with no passage: a private note on the
 * whole chapter, opened from the chapter-end Note pill. Back discards; a tap
 * outside or Escape keeps what was typed (saved), never silently drops it.
 */
export function LabChapterNoteEditor({ initialNote, keyboardDock, anchor, onSave, onClose }: LabChapterNoteEditorProps) {
  const [draft, setDraft] = useState(initialNote)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const fieldRef = useRef<HTMLTextAreaElement | null>(null)
  useLabKeyboardDock(rootRef, keyboardDock)

  // Focus inside the opening tap (the caller flushes the render): iOS raises
  // the keyboard only then. preventScroll: the page beneath does not move.
  useLayoutEffect(() => { fieldRef.current?.focus({ preventScroll: true }) }, [])

  // Desktop: the card grows upward from just above the pill (its height is
  // still animating open here, so it is anchored by its bottom edge), or
  // downward from below it when the pill sits near the top of the window.
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el || keyboardDock) return
    const above = anchor.top >= 260
    el.dataset.edge = above ? 'above' : 'below'
    el.style.setProperty('--anchored-popup-x', `${Math.max(12, Math.min(window.innerWidth - el.offsetWidth - 12, anchor.left))}px`)
    el.style.setProperty('--anchored-popup-y', `${anchor.bottom + 12}px`)
    el.style.setProperty('--chapter-note-bottom', `${Math.max(12, window.innerHeight - anchor.top + 12)}px`)
  }, [anchor.left, anchor.top, anchor.bottom, keyboardDock])

  const keepRef = useRef(() => {})
  keepRef.current = () => {
    const text = draft.trim()
    if (text && text !== initialNote.trim()) onSave(text)
    onClose()
  }
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      // The closing tap only closes: it does not also turn the page beneath.
      consumeDismissGesture(event)
      keepRef.current()
    }
    window.addEventListener('pointerdown', outside, true)
    return () => window.removeEventListener('pointerdown', outside, true)
  }, [])

  const save = () => {
    const text = draft.trim()
    if (text || initialNote) onSave(text)
    onClose()
  }

  return <div
    ref={rootRef}
    className={`selection-popup is-compact is-lab lab-chapter-note-editor${keyboardDock ? ' is-keyboard-docked' : ''}`}
    data-popup-mode="note"
    data-testid="lab-chapter-note"
    role="dialog"
    aria-label="Chapter note"
    {...(keyboardDock ? { [LAB_KEYBOARD_SHEET_ATTR]: '' } : {})}
    style={{ position: 'fixed' } as CSSProperties}
    onKeyDown={event => {
      // The reader's letter shortcuts never take the note's keys.
      event.stopPropagation()
      if (event.key === 'Escape') { event.preventDefault(); keepRef.current() }
    }}
    onClick={event => event.stopPropagation()}
    onPointerUp={event => event.stopPropagation()}
  >
    <div className="popup-issue-form popup-highlight-note">
      <div className="popup-note-body">
        <textarea
          ref={fieldRef}
          className="popup-textarea"
          data-testid="lab-chapter-note-field"
          value={draft}
          onChange={event => setDraft(event.target.value)}
          placeholder="Add a note…"
          aria-label="Chapter note"
          rows={3}
        />
        <div className="popup-note-actions">
          <button type="button" className="popup-button" onClick={onClose}>Back</button>
          <button type="button" className="popup-button popup-button-primary" disabled={!draft.trim() && !initialNote} onClick={save}>Save note</button>
        </div>
      </div>
    </div>
  </div>
}
