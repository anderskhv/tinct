/**
 * The margin frame's copy of the note formatting (public/lab/addbook/js/note-md.js, a classic script built from this
 * file by scripts/build-note-md.mjs; never edit the built file). It gives the frame `window.TinctNoteMd` (the
 * Markdown rules and the field, noteMarkdown.ts and noteEditor.ts) and the `<tinct-note>` element: around a
 * `[data-note-field]` element whose text is the note's Markdown, it makes the note field and its quiet B / I / • row,
 * shown only while the note is being written. The field answers as a textarea does (`value`, `setSelectionRange`),
 * so reader.js reads and writes it as it did its textarea.
 */
import * as markdown from './noteMarkdown'
import { createNoteEditor, domToDoc, pastedDoc, positionOf, textToDoc, type NoteEditorHandle } from './noteEditor'

const MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '')

function button(doc: Document, cls: string, label: string, text: string, title: string): HTMLButtonElement {
  const b = doc.createElement('button')
  b.type = 'button'; b.className = cls; b.textContent = text
  b.setAttribute('aria-label', label); b.setAttribute('aria-pressed', 'false'); b.title = title
  return b
}

/** Make the note field inside `host` (once). -> the field's handle, or null when there is no field. */
export function upgrade(host: HTMLElement): NoteEditorHandle | null {
  const known = (host as unknown as { noteEditor?: NoteEditorHandle }).noteEditor
  if (known) return known
  const field = host.querySelector<HTMLElement>('[data-note-field]')
  if (!field) return null
  const value = field.textContent || ''
  field.textContent = ''
  const doc = host.ownerDocument
  const bar = doc.createElement('div')
  bar.className = 'tn-fmt'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Format')
  const b = button(doc, 'tn-b', 'Bold', 'B', `Bold ${MAC ? '⌘B' : 'Ctrl+B'}`)
  const i = button(doc, 'tn-i', 'Italic', 'I', `Italic ${MAC ? '⌘I' : 'Ctrl+I'}`)
  const u = button(doc, 'tn-u', 'Bulleted list', '•', 'Bulleted list (Tab to indent)')
  bar.append(b, i, u)
  const handle = createNoteEditor(field, {
    value,
    onState: s => { b.setAttribute('aria-pressed', String(s.bold)); i.setAttribute('aria-pressed', String(s.italic)); u.setAttribute('aria-pressed', String(s.bullet)) },
  })
  for (const [el, name] of [[b, 'bold'], [i, 'italic'], [u, 'bullet']] as const) {
    // The field keeps the focus and its selection: a press on the row never takes them.
    el.addEventListener('pointerdown', e => e.preventDefault())
    el.addEventListener('mousedown', e => e.preventDefault())
    el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); handle.command(name) })
  }
  field.after(bar)
  ;(host as unknown as { noteEditor?: NoteEditorHandle }).noteEditor = handle
  ;(field as unknown as { noteEditor?: NoteEditorHandle }).noteEditor = handle
  return handle
}

if (typeof customElements !== 'undefined' && typeof HTMLElement !== 'undefined' && !customElements.get('tinct-note')) {
  customElements.define('tinct-note', class extends HTMLElement {
    connectedCallback() { upgrade(this) }
  })
}

export const noteHtml = markdown.noteHtml
export const notePlainText = markdown.notePlainText
export const parseNote = markdown.parseNote
export const serializeNote = markdown.serializeNote
export const capNoteMarkdown = markdown.capNoteMarkdown
export const escapeHtml = markdown.escapeHtml
export const NOTE_MAX_CHARS = markdown.NOTE_MAX_CHARS
export { createNoteEditor, domToDoc, pastedDoc, positionOf, textToDoc }
