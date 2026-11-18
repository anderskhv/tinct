/**
 * The note field (Anders, 13 Nov 2026): a small contenteditable over the note's Markdown (noteMarkdown.ts), with
 * bullets nested by Tab / Shift+Tab, bold and italic by ⌘B / ⌘I (Ctrl elsewhere), Markdown typed in place ("- ",
 * "**words**", "*words*"), Return continuing a list and ending it on an empty bullet, and a paste reduced to its words
 * and these formats. The same controller runs in the React reader (NoteEditor.tsx) and in the margin frame
 * (public/lab/addbook/js/note-md.js, built from this file).
 *
 * The field holds one `div[data-depth]` per line: -1 a paragraph line, 0..3 a bullet. Typing is the browser's own;
 * only a change of structure (Return, Backspace at a line's start, Tab, a format, a paste, Markdown typed in place)
 * is made on the note and drawn again, with the caret kept by its position in the note's text. The note's Markdown is
 * written once per input, never more: a 4000-character note takes well under a millisecond.
 *
 * The field also answers as a textarea does (`value`, `selectionStart`, `selectionEnd`, `setSelectionRange`), so
 * the code and checks that read a note field keep working. Undo and redo are the field's own (a structural change
 * would otherwise confuse the browser's).
 */
import {
  backspaceAtStart, capDoc, depthAt, docText, hasMark, indentLines, markdownShortcut, NOTE_MAX_CHARS, parseNote,
  replaceText, replaceWithDoc, serializeNote, splitLine, toggleBullets, toggleMark,
  type NoteDoc, type NoteMark, type NoteRun,
} from './noteMarkdown'

export interface NoteEditorState { bold: boolean; italic: boolean; bullet: boolean }
export interface NoteEditorOptions {
  value?: string
  max?: number
  onChange?: (markdown: string) => void
  onState?: (state: NoteEditorState) => void
}
export interface NoteEditorHandle {
  getValue(): string
  setValue(markdown: string): void
  /** The B / I / • buttons. */
  command(name: 'bold' | 'italic' | 'bullet'): void
  state(): NoteEditorState
  destroy(): void
}

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '')
const BLOCK_TAGS = new Set(['DIV', 'P', 'LI', 'UL', 'OL', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'TABLE', 'TR', 'TD', 'TH', 'DL', 'DT', 'DD', 'FIGURE', 'FIGCAPTION', 'HR'])
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'HEAD', 'TITLE', 'META', 'LINK', 'IFRAME', 'OBJECT', 'SVG', 'MATH', 'BUTTON', 'SELECT', 'TEXTAREA', 'INPUT', 'IMG', 'VIDEO', 'AUDIO', 'CANVAS'])

function styleOf(el: Element, inherited: { b: boolean; i: boolean }): { b: boolean; i: boolean } {
  let { b, i } = inherited
  const tag = el.tagName
  if (tag === 'B' || tag === 'STRONG') b = true
  if (tag === 'I' || tag === 'EM') i = true
  const style = (el as HTMLElement).style
  if (style) {
    const weight = style.fontWeight
    if (weight === 'bold' || weight === 'bolder' || Number(weight) >= 600) b = true
    else if (weight === 'normal' || (weight && Number(weight) > 0 && Number(weight) < 600)) b = false
    if (style.fontStyle === 'italic' || style.fontStyle === 'oblique') i = true
    else if (style.fontStyle === 'normal') i = false
  }
  return { b, i }
}

/**
 * Any DOM (the field, or a pasted page) as a note: its words and their bold and italic, a line per block element and
 * per `<br>`, bullets from the field's own `data-depth` or a pasted list's nesting. Nothing else is read: no link,
 * no attribute, no style but weight and slant.
 */
export function domToDoc(root: Node): NoteDoc {
  const doc: NoteDoc = []
  let current: { depth: number; runs: NoteRun[] } | null = null
  let pendingDepth = -1
  const open = (depth: number) => { current = { depth, runs: [] }; doc.push(current) }
  const add = (text: string, style: { b: boolean; i: boolean }) => {
    if (!current) open(pendingDepth)
    current!.runs.push({ text, ...(style.b ? { b: true } : {}), ...(style.i ? { i: true } : {}) })
  }
  const nextSignificant = (node: Node): Node | null => {
    let n = node.nextSibling
    while (n && n.nodeType === 3 && !(n.nodeValue || '').replace(/\u200b/g, '')) n = n.nextSibling
    return n
  }
  const walk = (node: Node, style: { b: boolean; i: boolean }, listDepth: number) => {
    if (node.nodeType === 3) {
      const text = (node.nodeValue || '').replace(/\u200b/g, '').replace(/[\r\n]+/g, ' ')
      if (text) add(text, style)
      return
    }
    if (node.nodeType !== 1 && node.nodeType !== 11) return
    const el = node as Element
    const tag = node.nodeType === 1 ? el.tagName.toUpperCase() : '#fragment'
    if (SKIP_TAGS.has(tag)) return
    if (tag === 'BR') {
      // An empty line holds a <br> so it has height: the last <br> of a line ends nothing.
      if (nextSignificant(node) === null) return
      if (!current) open(pendingDepth)
      open(current!.depth)
      return
    }
    const next = node.nodeType === 1 ? styleOf(el, style) : style
    if (node.nodeType === 1 && BLOCK_TAGS.has(tag)) {
      if (tag === 'UL' || tag === 'OL') {
        current = null
        for (const child of Array.from(el.childNodes)) walk(child, next, listDepth + 1)
        current = null
        return
      }
      const own = el.getAttribute('data-depth')
      const depth = own != null && /^-?\d+$/.test(own) ? Number(own) : tag === 'LI' ? Math.max(0, listDepth) : -1
      const outer = pendingDepth
      const before = doc.length
      const hasBlocks = Array.from(el.children).some(child => BLOCK_TAGS.has(child.tagName.toUpperCase()))
      current = null
      pendingDepth = depth
      for (const child of Array.from(el.childNodes)) {
        walk(child, next, listDepth)
        // Words after a nested block (a list inside an item) start a line of this block's own kind again.
        if (child.nodeType === 1 && BLOCK_TAGS.has((child as Element).tagName.toUpperCase())) pendingDepth = depth
      }
      if (doc.length === before && !hasBlocks) open(depth)
      current = null
      pendingDepth = outer
      return
    }
    for (const child of Array.from(node.childNodes)) walk(child, next, listDepth)
  }
  for (const child of Array.from(root.childNodes)) walk(child, { b: false, i: false }, -1)
  return doc.length ? doc : [{ depth: -1, runs: [] }]
}

/** A pasted page's lines, without the empty lines its wrappers leave at both ends. */
export function pastedDoc(root: Node): NoteDoc {
  const doc = domToDoc(root)
  const empty = (block: { runs: NoteRun[] }) => !block.runs.some(run => run.text.trim())
  let a = 0, z = doc.length
  while (a < z && empty(doc[a])) a += 1
  while (z > a && empty(doc[z - 1])) z -= 1
  // Two wrappers in a row (a <div> holding a <p>) make one blank line between real ones: collapse runs of blanks to one.
  const out: NoteDoc = []
  for (const block of doc.slice(a, z)) {
    if (empty(block) && out.length && empty(out[out.length - 1])) continue
    out.push(empty(block) ? { depth: -1, runs: [] } : block)
  }
  return out.length ? out : [{ depth: -1, runs: [] }]
}

/** A plain-text paste: its Markdown (a note copied as text keeps its formats); "•" bullets read as bullets. */
export function textToDoc(text: string): NoteDoc {
  return parseNote(String(text).replace(/\r\n?/g, '\n').replace(/^([ \t]*)[•◦▪‣·]\s+/gm, '$1- '))
}

/** The field's lines drawn: one div per line, bold and italic as <strong> and <em>, an empty line holding a <br>. */
export function renderDoc(root: HTMLElement, doc: NoteDoc): void {
  const d = root.ownerDocument
  const blocks = doc.map(block => {
    const div = d.createElement('div')
    div.className = 'tn-line'
    div.setAttribute('data-depth', String(block.depth))
    for (const run of block.runs) {
      let node: Node = d.createTextNode(run.text)
      if (run.i) { const em = d.createElement('em'); em.appendChild(node); node = em }
      if (run.b) { const strong = d.createElement('strong'); strong.appendChild(node); node = strong }
      div.appendChild(node)
    }
    if (!block.runs.length) div.appendChild(d.createElement('br'))
    return div
  })
  root.replaceChildren(...blocks)
}

/** The field as drawn by renderDoc (and only typed into since): its lines can be read and the caret placed directly. */
function clean(root: HTMLElement): boolean {
  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType !== 1 || (child as Element).tagName !== 'DIV' || !(child as Element).hasAttribute('data-depth')) return false
    for (const node of Array.from(child.childNodes)) {
      if (node.nodeType === 3) continue
      if (node.nodeType !== 1) return false
      const tag = (node as Element).tagName
      if (BLOCK_TAGS.has(tag)) return false
    }
  }
  return true
}

/** A DOM point (node, offset) inside the field as a position in the note's text. */
export function positionOf(root: HTMLElement, node: Node, offset: number): number {
  if (!root.contains(node)) return 0
  if (node === root) {
    const kids = Array.from(root.childNodes)
    if (offset >= kids.length) return docText(domToDoc(root)).length
    node = kids[offset]; offset = 0
  }
  const range = root.ownerDocument.createRange()
  range.setStart(root, 0)
  range.setEnd(node, offset)
  const prefix = domToDoc(range.cloneContents())
  // A cut that ends at a line's start clones that line empty: the position is that line's start.
  return docText(prefix).length
}

/** A position in the note's text as a DOM point in a field drawn by renderDoc. `right`: at a style boundary, the next run. */
export function pointAt(root: HTMLElement, pos: number, right = false): { node: Node; offset: number } {
  const lines = Array.from(root.children) as HTMLElement[]
  let rest = Math.max(0, pos)
  for (let k = 0; k < lines.length; k += 1) {
    const line = lines[k]
    const texts: Text[] = []
    const tw = root.ownerDocument.createTreeWalker(line, 4)
    for (let n = tw.nextNode(); n; n = tw.nextNode()) texts.push(n as Text)
    const len = texts.reduce((n, t) => n + (t.nodeValue || '').length, 0)
    if (rest <= len || k === lines.length - 1) {
      if (!texts.length) return { node: line, offset: 0 }
      for (let t = 0; t < texts.length; t += 1) {
        const size = (texts[t].nodeValue || '').length
        if (rest < size || (rest === size && !(right && t + 1 < texts.length))) return { node: texts[t], offset: Math.min(rest, size) }
        rest -= size
      }
      const last = texts[texts.length - 1]
      return { node: last, offset: (last.nodeValue || '').length }
    }
    rest -= len + 1
  }
  return { node: root, offset: 0 }
}

/** Create the note field on `root` (an element the caller owns; it becomes the contenteditable). */
export function createNoteEditor(root: HTMLElement, options: NoteEditorOptions = {}): NoteEditorHandle {
  const max = options.max ?? NOTE_MAX_CHARS
  root.setAttribute('contenteditable', 'true')
  root.setAttribute('role', 'textbox')
  root.setAttribute('aria-multiline', 'true')
  if (!root.hasAttribute('spellcheck')) root.setAttribute('spellcheck', 'true')
  let value = ''
  /** The Markdown last handed to onChange (a value set from outside is not handed back). */
  let emitted = ''
  let pending: { b: boolean; i: boolean } | null = null
  let pendingAt = -1
  let composing = false
  const undo: Array<{ value: string; sel: [number, number] }> = []
  const redo: typeof undo = []
  let lastSnap = 0
  let lastState = ''

  const selection = (): [number, number] | null => {
    const sel = root.ownerDocument.getSelection?.()
    if (!sel || !sel.rangeCount || !root.contains(sel.anchorNode)) return null
    const a = positionOf(root, sel.anchorNode!, sel.anchorOffset)
    const f = sel.focusNode && root.contains(sel.focusNode) ? positionOf(root, sel.focusNode, sel.focusOffset) : a
    return [Math.min(a, f), Math.max(a, f)]
  }
  const select = (from: number, to = from, right = false) => {
    const sel = root.ownerDocument.getSelection?.()
    if (!sel) return
    const a = pointAt(root, from, right), z = to === from ? a : pointAt(root, to)
    const range = root.ownerDocument.createRange()
    range.setStart(a.node, a.offset)
    range.setEnd(z.node, z.offset)
    sel.removeAllRanges()
    sel.addRange(range)
  }
  const readDoc = (): NoteDoc => domToDoc(root)
  const markEmpty = (doc: NoteDoc) => root.classList.toggle('is-empty', doc.length === 1 && doc[0].depth < 0 && !doc[0].runs.length)
  const emit = (doc: NoteDoc) => {
    markEmpty(doc)
    value = serializeNote(doc)
    if (value === emitted) return
    emitted = value
    options.onChange?.(value)
  }
  const snapshot = (force = false) => {
    const now = Date.now()
    if (!force && now - lastSnap < 900) return
    lastSnap = now
    const sel = selection() ?? [0, 0]
    const top = undo[undo.length - 1]
    if (top && top.value === value) return
    undo.push({ value, sel })
    if (undo.length > 200) undo.shift()
    redo.length = 0
  }
  /** A structural change: drawn, the caret placed, the Markdown written. */
  const apply = (doc: NoteDoc, caret: number, to = caret, right = false) => {
    snapshot(true)
    let next = doc
    if (serializeNote(next).length > max) next = capDoc(next, max)
    renderDoc(root, next)
    const len = docText(next).length
    select(Math.min(caret, len), Math.min(to, len), right)
    emit(next)
    lastSnap = 0
    report()
  }
  const report = () => {
    if (!options.onState) return
    const s = state()
    const key = `${s.bold}${s.italic}${s.bullet}`
    if (key === lastState) return
    lastState = key
    options.onState(s)
  }
  const state = (): NoteEditorState => {
    const sel = selection()
    if (!sel) return { bold: false, italic: false, bullet: false }
    const doc = readDoc()
    const [a, z] = sel
    return {
      bold: pending && a === z ? pending.b : hasMark(doc, a, z, 'b'),
      italic: pending && a === z ? pending.i : hasMark(doc, a, z, 'i'),
      bullet: depthAt(doc, a) >= 0,
    }
  }
  const toggle = (mark: NoteMark) => {
    const sel = selection(); if (!sel) return
    const doc = readDoc()
    const [a, z] = sel
    if (a === z) {
      const now = pending ?? { b: hasMark(doc, a, a, 'b'), i: hasMark(doc, a, a, 'i') }
      pending = { ...now, [mark]: !now[mark] }
      pendingAt = a
      report()
      return
    }
    apply(toggleMark(doc, a, z, mark), a, z)
  }
  const command = (name: 'bold' | 'italic' | 'bullet') => {
    if (root.ownerDocument.activeElement !== root) root.focus({ preventScroll: true })
    if (name === 'bold') return toggle('b')
    if (name === 'italic') return toggle('i')
    const sel = selection() ?? [0, 0]
    apply(toggleBullets(readDoc(), sel[0], sel[1]), sel[0], sel[1])
  }
  const restore = (from: typeof undo, to: typeof undo) => {
    const snap = from.pop(); if (!snap) return
    to.push({ value, sel: selection() ?? [0, 0] })
    const doc = parseNote(snap.value)
    renderDoc(root, doc)
    select(snap.sel[0], snap.sel[1])
    emit(doc)
    report()
  }

  const onBeforeInput = (event: InputEvent) => {
    if (composing || event.isComposing) return
    const type = event.inputType
    if (type === 'historyUndo' || type === 'historyRedo') { event.preventDefault(); restore(type === 'historyUndo' ? undo : redo, type === 'historyUndo' ? redo : undo); return }
    if (type === 'formatBold' || type === 'formatItalic') { event.preventDefault(); toggle(type === 'formatBold' ? 'b' : 'i'); return }
    const sel = selection(); if (!sel) return
    const [a, z] = sel
    if (type === 'insertParagraph' || type === 'insertLineBreak') {
      event.preventDefault()
      const made = splitLine(readDoc(), a, z)
      pending = null
      apply(made.doc, made.caret)
      return
    }
    if (type === 'deleteContentBackward' && a === z) {
      const made = backspaceAtStart(readDoc(), a)
      if (made) { event.preventDefault(); apply(made.doc, made.caret) }
      return
    }
    if (type === 'insertText' || type === 'insertReplacementText') {
      const data = event.data ?? event.dataTransfer?.getData('text/plain') ?? ''
      if (value.length + data.length > max && a === z) { event.preventDefault(); return }
      if (pending && type === 'insertText' && data) {
        event.preventDefault()
        const style = pending
        pending = null
        const made = replaceText(readDoc(), a, z, data, style)
        apply(made.doc, made.caret)
        return
      }
    }
    if (type.startsWith('insert') || type.startsWith('delete')) snapshot()
  }
  const onInput = (event: Event) => {
    if (composing) return
    const ie = event as InputEvent
    if (!clean(root)) {
      // The browser made structure of its own (select-all and type, a drop): read, draw again, caret kept.
      const sel = selection()
      const doc = readDoc()
      renderDoc(root, doc)
      if (sel) select(sel[0], sel[1])
    }
    let doc = readDoc()
    if (ie.inputType === 'insertText' && (ie.data === ' ' || ie.data === '*')) {
      const sel = selection()
      if (sel && sel[0] === sel[1]) {
        const made = markdownShortcut(doc, sel[0])
        if (made) {
          // A bold or italic just made ends there: what is typed next is plain.
          apply(made.doc, made.caret)
          if (ie.data === '*') { pending = { b: false, i: false }; pendingAt = made.caret }
          return
        }
      }
    }
    if (serializeNote(doc).length > max) {
      const sel = selection()
      doc = capDoc(doc, max)
      renderDoc(root, doc)
      if (sel) select(Math.min(sel[0], docText(doc).length))
    }
    emit(doc)
    report()
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.isComposing || composing) return
    const mod = isMac() ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
    if (mod && !event.altKey && (key === 'b' || key === 'i')) { event.preventDefault(); toggle(key === 'b' ? 'b' : 'i'); return }
    if (mod && !event.altKey && (key === 'z' || key === 'y')) {
      event.preventDefault()
      const back = key === 'z' && !event.shiftKey
      restore(back ? undo : redo, back ? redo : undo)
      return
    }
    if (event.key === 'Tab' && !mod && !event.altKey) {
      const sel = selection(); if (!sel) return
      const made = indentLines(readDoc(), sel[0], sel[1], event.shiftKey ? -1 : 1)
      if (!made) return
      event.preventDefault()
      apply(made, sel[0], sel[1])
      return
    }
  }
  const onPaste = (event: ClipboardEvent) => {
    const data = event.clipboardData
    if (!data) return
    event.preventDefault()
    const sel = selection() ?? [value.length, value.length]
    const html = data.getData('text/html')
    let pasted: NoteDoc
    if (html && typeof DOMParser !== 'undefined') {
      // Parsed into an inert document (no script runs, nothing loads) and read for words and the supported formats.
      const page = new DOMParser().parseFromString(html, 'text/html')
      pasted = pastedDoc(page.body)
    } else pasted = textToDoc(data.getData('text/plain') || '')
    const doc = readDoc()
    const made = replaceWithDoc(doc, sel[0], sel[1], pasted)
    let next = made.doc
    if (serializeNote(next).length > max) next = capDoc(next, max)
    apply(next, Math.min(made.caret, docText(next).length))
  }
  const onDrop = (event: DragEvent) => {
    // A drop could bring any HTML in: only words, through the paste path's rules.
    const text = event.dataTransfer?.getData('text/plain')
    event.preventDefault()
    if (!text) return
    const sel = selection() ?? [value.length, value.length]
    const made = replaceWithDoc(readDoc(), sel[0], sel[1], textToDoc(text))
    apply(made.doc, made.caret)
  }
  const onSelection = () => {
    if (root.ownerDocument.activeElement !== root) return
    const sel = selection()
    if (pending && !(sel && sel[0] === sel[1] && sel[0] === pendingAt)) pending = null
    report()
  }
  const onCompositionStart = () => { composing = true }
  const onCompositionEnd = () => { composing = false; onInput(new Event('input')) }
  const onBlur = () => { pending = null }

  root.addEventListener('beforeinput', onBeforeInput as EventListener)
  root.addEventListener('input', onInput)
  root.addEventListener('keydown', onKeyDown)
  root.addEventListener('paste', onPaste)
  root.addEventListener('drop', onDrop)
  root.addEventListener('compositionstart', onCompositionStart)
  root.addEventListener('compositionend', onCompositionEnd)
  root.addEventListener('blur', onBlur)
  root.ownerDocument.addEventListener('selectionchange', onSelection)

  const setValue = (markdown: string) => {
    const doc = parseNote(String(markdown ?? ''))
    value = serializeNote(doc)
    renderDoc(root, doc)
    markEmpty(doc)
  }
  setValue(options.value ?? '')
  emitted = value
  // A value set as on a textarea (`field.value = …`) and then announced with a change event is handed on.
  const onChangeEvent = () => { if (value !== emitted) { emitted = value; options.onChange?.(value) } }
  root.addEventListener('change', onChangeEvent)
  // Answers as a textarea does, for the code and checks that read a note field.
  const textarea = {
    value: { get: () => value, set: (v: string) => { setValue(v); undo.length = 0; redo.length = 0 }, configurable: true },
    selectionStart: { get: () => (selection() ?? [value.length])[0], configurable: true },
    selectionEnd: { get: () => { const s = selection(); return s ? s[1] : value.length }, configurable: true },
    setSelectionRange: { value: (a: number, z: number = a) => { const len = docText(readDoc()).length; select(Math.min(a, len), Math.min(z, len)) }, configurable: true, writable: true },
  }
  Object.defineProperties(root, textarea)

  return {
    getValue: () => value,
    setValue: v => { if (v !== value) setValue(v); emitted = value },
    command,
    state,
    destroy() {
      root.removeEventListener('beforeinput', onBeforeInput as EventListener)
      root.removeEventListener('input', onInput)
      root.removeEventListener('keydown', onKeyDown)
      root.removeEventListener('paste', onPaste)
      root.removeEventListener('drop', onDrop)
      root.removeEventListener('compositionstart', onCompositionStart)
      root.removeEventListener('compositionend', onCompositionEnd)
      root.removeEventListener('blur', onBlur)
      root.removeEventListener('change', onChangeEvent)
      root.ownerDocument.removeEventListener('selectionchange', onSelection)
    },
  }
}
