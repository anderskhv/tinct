import { useEffect, useRef, useState, type FocusEvent } from 'react'
import { PhoneIcon } from '../../marginPhone/LabPhoneCard'

interface Props {
  id: string
  /** Read by screen readers; the placeholder says it on screen. */
  label: string
  placeholder: string
  value: string
  onChange: (text: string) => void
  onSave: () => void
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void
  /** A note already saved opens as the words written, and a tap edits them. */
  saved?: boolean
}

/**
 * A PDF note, styled like the ask field on the other cards (approved mockup, 2 Nov 2026): an underlined field that
 * grows with the words, and the same plain send arrow, which saves. A saved note reads as text until tapped.
 */
export function PdfNoteField({ id, label, placeholder, value, onChange, onSave, onBlur, saved = false }: Props) {
  const [editing, setEditing] = useState(() => !saved || !value.trim())
  const field = useRef<HTMLTextAreaElement | null>(null)
  useEffect(() => {
    const el = field.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(34, el.scrollHeight)}px`
  }, [value, editing])
  if (!editing) return <button type="button" className="pdf-note-field__saved" data-testid="pdf-note-saved" aria-label={'Edit note: ' + value.trim()}
    onClick={() => { setEditing(true); requestAnimationFrame(() => { const el = field.current; if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length) } }) }}>{value.trim()}</button>
  return <form className="pdf-note-field" onSubmit={event => { event.preventDefault(); onSave() }}>
    <label htmlFor={id} className="lab-visually-hidden">{label}</label>
    <textarea autoComplete="off" ref={field} id={id} rows={1} placeholder={placeholder} value={value} onBlur={onBlur} onChange={event => onChange(event.target.value)} />
    <button type="submit" className="lab-pcard-send" aria-label="Save note" disabled={!value.trim()} onPointerDown={event => event.preventDefault()}><PhoneIcon name="up" /></button>
  </form>
}
