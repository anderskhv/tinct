import { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react'
import { createNoteEditor, type NoteEditorHandle, type NoteEditorState } from './noteEditor'
import './notes.css'

const MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '')
export const NOTE_KEYS = MAC ? { bold: '⌘B', italic: '⌘I' } : { bold: 'Ctrl+B', italic: 'Ctrl+I' }

export interface NoteFieldProps {
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
  ariaLabel: string
  className?: string
  testId?: string
  inputRef?: MutableRefObject<HTMLElement | null>
  /** The phone: the B / I / • row sits above the keyboard, with Done. */
  keyboardBar?: boolean
}

/**
 * The note field (noteEditor.ts) with its quiet B / I / • row, shown only while the note is being written (Anders,
 * 13 Nov 2026). Typing stays the browser's own: a keystroke renders nothing here; the note's Markdown is handed up
 * as it changes.
 */
export function NoteField({ value, onChange, placeholder, ariaLabel, className = 'lab-pcard-note', testId = 'lab-phone-card-note', inputRef, keyboardBar = false }: NoteFieldProps) {
  const field = useRef<HTMLDivElement | null>(null)
  const editor = useRef<NoteEditorHandle | null>(null)
  const change = useRef(onChange)
  change.current = onChange
  const [state, setState] = useState<NoteEditorState>({ bold: false, italic: false, bullet: false })
  const [editing, setEditing] = useState(false)
  const [lift, setLift] = useState(0)

  useLayoutEffect(() => {
    const el = field.current
    if (!el) return
    const made = createNoteEditor(el, { value, onChange: md => change.current(md), onState: setState })
    editor.current = made
    return () => { made.destroy(); editor.current = null }
  // The field is made once; later values arrive through setValue below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // A note changed from outside (an undo elsewhere, another device): drawn again only when it differs.
  useEffect(() => { if (editor.current && editor.current.getValue() !== value) editor.current.setValue(value) }, [value])
  useEffect(() => { if (inputRef) { inputRef.current = field.current; return () => { if (inputRef.current === field.current) inputRef.current = null } } }, [inputRef])

  // The phone's row rides on the keyboard: the visual viewport's foot, as it opens and closes.
  useEffect(() => {
    if (!keyboardBar || !editing || typeof window === 'undefined') return
    const vv = window.visualViewport
    if (!vv) return
    const place = () => setLift(Math.max(0, Math.round(window.innerHeight - (vv.offsetTop + vv.height))))
    place()
    vv.addEventListener('resize', place)
    vv.addEventListener('scroll', place)
    return () => { vv.removeEventListener('resize', place); vv.removeEventListener('scroll', place) }
  }, [keyboardBar, editing])

  const run = (name: 'bold' | 'italic' | 'bullet') => () => editor.current?.command(name)
  const hold = (event: { preventDefault(): void }) => event.preventDefault()
  return (
    <div className={`tn-wrap${editing ? ' is-editing' : ''}${keyboardBar ? ' is-phone' : ''}`}
      onFocus={() => setEditing(true)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setEditing(false) }}>
      <div ref={field} className={`${className} tn-editor`} data-testid={testId} data-placeholder={placeholder} aria-label={ariaLabel} />
      <div className="tn-fmt" role="toolbar" aria-label="Format" hidden={!editing}
        style={keyboardBar ? { bottom: lift } : undefined} data-testid="note-format">
        <button type="button" className="tn-b" aria-pressed={state.bold} aria-label="Bold" aria-keyshortcuts={MAC ? 'Meta+B' : 'Control+B'} title={`Bold ${NOTE_KEYS.bold}`} onPointerDown={hold} onMouseDown={hold} onClick={run('bold')}>B</button>
        <button type="button" className="tn-i" aria-pressed={state.italic} aria-label="Italic" aria-keyshortcuts={MAC ? 'Meta+I' : 'Control+I'} title={`Italic ${NOTE_KEYS.italic}`} onPointerDown={hold} onMouseDown={hold} onClick={run('italic')}>I</button>
        <button type="button" className="tn-u" aria-pressed={state.bullet} aria-label="Bulleted list" title="Bulleted list (Tab to indent)" onPointerDown={hold} onMouseDown={hold} onClick={run('bullet')}>•</button>
        {keyboardBar && <button type="button" className="tn-done" onPointerDown={hold} onMouseDown={hold} onClick={() => field.current?.blur()}>Done</button>}
      </div>
    </div>
  )
}
