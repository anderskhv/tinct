/**
 * A note's formatting (Anders, 13 Nov 2026): bullet points nested up to four levels, bold and italic, stored as
 * Markdown in the note's existing plain-text field (`LabHighlight.note`, the margin reader's `note`), so nothing about
 * storage or sync changes. Nested bullets are 2-space-indented `- `; bold is `**…**`, italic `*…*`; a literal `*` or
 * `\` is escaped with a backslash, and a line that starts with "- " but is not a bullet starts with "\- ".
 *
 * One line of the note is one block (a paragraph line or a bullet), so a plain note from before reads exactly as it
 * did: every line break stays a line break, every character stays as typed. Nothing here makes HTML from the note's
 * words except `noteHtml`, which escapes every character.
 *
 * Pure: no DOM. The editor (noteEditor.ts) and both renderers (NoteMarkdown.tsx, the margin frame's note-md.js,
 * built from these files by scripts/build-note-md.mjs) share it.
 */

/** A run of characters with one style. */
export interface NoteRun { text: string; b?: boolean; i?: boolean }
/** One line: a paragraph line (depth -1) or a bullet at depth 0 (top level) to NOTE_MAX_DEPTH. */
export interface NoteBlock { depth: number; runs: NoteRun[] }
export type NoteDoc = NoteBlock[]
export type NoteMark = 'b' | 'i'

/** The note field's limit (labMarkOf, commitNoteEdit): the stored Markdown's length. */
export const NOTE_MAX_CHARS = 4000
/** Bullets nest four levels (0..3): "at least 3 levels" (Anders, 13 Nov 2026). */
export const NOTE_MAX_DEPTH = 3

const BULLET_LINE = /^( *)[-*] (.*)$/

/* ---------------- Parsing ---------------- */

/** A note's Markdown as blocks. A blank note is one empty paragraph line. */
export function parseNote(markdown: string): NoteDoc {
  const lines = String(markdown ?? '').replace(/\r\n?/g, '\n').split('\n')
  const doc: NoteDoc = lines.map(line => {
    const tabbed = line.replace(/^\t+/, tabs => '  '.repeat(tabs.length))
    const bullet = tabbed.match(BULLET_LINE)
    if (bullet) return { depth: Math.min(NOTE_MAX_DEPTH, Math.floor(bullet[1].length / 2)), runs: parseInline(bullet[2]) }
    return { depth: -1, runs: parseInline(line) }
  })
  return normalizeDoc(doc)
}

/**
 * Bullets never nest deeper than one level under the line above (a first bullet is at the top level), runs of one
 * style are joined and empty runs dropped.
 */
export function normalizeDoc(doc: NoteDoc): NoteDoc {
  let prev = -1
  const out = (doc.length ? doc : [{ depth: -1, runs: [] }]).map(block => {
    const depth = block.depth < 0 ? -1 : Math.max(0, Math.min(block.depth, prev + 1, NOTE_MAX_DEPTH))
    prev = depth
    return { depth, runs: compactRuns(block.runs) }
  })
  return out
}

function compactRuns(runs: NoteRun[]): NoteRun[] {
  const out: NoteRun[] = []
  for (const run of runs) {
    if (!run.text) continue
    const last = out[out.length - 1]
    if (last && !!last.b === !!run.b && !!last.i === !!run.i) last.text += run.text
    else out.push({ text: run.text, ...(run.b ? { b: true } : {}), ...(run.i ? { i: true } : {}) })
  }
  return out
}

type Delim = { kind: 'open' | 'close'; mark: NoteMark; stars: string; matched?: boolean }
type Token = { kind: 'text'; text: string } | Delim

const isSpace = (ch: string | undefined) => ch === undefined || /\s/.test(ch)

/**
 * One line's inline Markdown. A run of stars first closes what it can (italic with one star, bold with two, from the
 * innermost), then opens with what is left (one: italic; two: bold; three: bold, then italic inside), as the
 * serializer writes it. A star with a space (or the line's edge) on the side it would act on is a star. Unclosed
 * openers stay stars.
 */
export function parseInline(line: string): NoteRun[] {
  const tokens: Token[] = []
  const stack: Delim[] = []
  let text = ''
  const flush = () => { if (text) { tokens.push({ kind: 'text', text }); text = '' } }
  for (let k = 0; k < line.length;) {
    const ch = line[k]
    if (ch === '\\' && (line[k + 1] === '\\' || line[k + 1] === '*' || line[k + 1] === '-')) { text += line[k + 1]; k += 2; continue }
    if (ch !== '*') { text += ch; k += 1; continue }
    let end = k
    while (line[end] === '*') end += 1
    let left = end - k
    const before = line[k - 1], after = line[end]
    flush()
    if (!isSpace(before)) {
      while (left > 0 && stack.length) {
        const top = stack[stack.length - 1]
        const need = top.mark === 'b' ? 2 : 1
        if (left < need) break
        stack.pop()
        top.matched = true
        tokens.push({ kind: 'close', mark: top.mark, stars: '*'.repeat(need), matched: true })
        left -= need
      }
    }
    if (left > 0 && !isSpace(after)) {
      const opens: NoteMark[] = left >= 3 ? ['b', 'i'] : left === 2 ? ['b'] : ['i']
      const used = left >= 3 ? 3 : left
      if (left > used) tokens.push({ kind: 'text', text: '*'.repeat(left - used) })
      for (const mark of opens) {
        const token: Delim = { kind: 'open', mark, stars: mark === 'b' ? '**' : '*' }
        tokens.push(token); stack.push(token)
      }
    } else if (left > 0) tokens.push({ kind: 'text', text: '*'.repeat(left) })
    k = end
  }
  flush()
  const runs: NoteRun[] = []
  let b = 0, i = 0
  for (const token of tokens) {
    if (token.kind === 'text') runs.push({ text: token.text, ...(b ? { b: true } : {}), ...(i ? { i: true } : {}) })
    else if (!token.matched) runs.push({ text: token.stars, ...(b ? { b: true } : {}), ...(i ? { i: true } : {}) })
    else if (token.mark === 'b') b += token.kind === 'open' ? 1 : -1
    else i += token.kind === 'open' ? 1 : -1
  }
  return compactRuns(runs)
}

/* ---------------- Writing ---------------- */

const escapeText = (text: string) => text.replace(/[\\*]/g, ch => '\\' + ch)

/**
 * One line's runs as Markdown. Spaces take the style both their neighbours share (so a marker never sits against a
 * space), bold is always outside italic, and every change of style closes before it opens: the inverse of parseInline.
 */
export function serializeInline(runs: NoteRun[]): string {
  const chars: Array<{ ch: string; b: boolean; i: boolean }> = []
  for (const run of runs) for (const ch of run.text) chars.push({ ch, b: !!run.b, i: !!run.i })
  const space = (k: number) => /\s/.test(chars[k].ch)
  let out = ''
  const stack: NoteMark[] = []
  const star = (mark: NoteMark) => (mark === 'b' ? '**' : '*')
  const firstUnwanted = (want: { b: boolean; i: boolean }) => { const k = stack.findIndex(mark => !want[mark]); return k < 0 ? stack.length : k }
  const open = (want: { b: boolean; i: boolean }) => { for (const mark of ['b', 'i'] as NoteMark[]) if (want[mark] && !stack.includes(mark)) { out += star(mark); stack.push(mark) } }
  for (let k = 0; k < chars.length; k += 1) {
    const c = chars[k]
    if (space(k)) { out += c.ch; continue }
    const want = { b: c.b, i: c.i }
    if (k > 0 && !space(k - 1)) {
      // Against the word before: one run of stars that closes (innermost first) before it opens, as parseInline reads
      // it. An italic left on top would be closed by stars meant to open, so then everything closes and reopens.
      let cut = firstUnwanted(want)
      const opening = (['b', 'i'] as NoteMark[]).some(mark => want[mark] && !stack.slice(0, cut).includes(mark))
      if (opening && cut > 0 && stack[cut - 1] === 'i') cut = 0
      while (stack.length > cut) out += star(stack.pop()!)
    }
    // After a space nothing can close (it was closed before the space): only opens.
    open(want)
    out += escapeText(c.ch)
    // Before a space (or the line's end): close what the next word does not keep, so no marker touches a space.
    if (k + 1 === chars.length || space(k + 1)) {
      let z = k + 1
      while (z < chars.length && space(z)) z += 1
      const next = z < chars.length ? { b: chars[z].b, i: chars[z].i } : { b: false, i: false }
      const cut = firstUnwanted(next)
      while (stack.length > cut) out += star(stack.pop()!)
    }
  }
  return out
}

/** The note as Markdown: one line per block, bullets as 2-space-indented "- ". */
export function serializeNote(doc: NoteDoc): string {
  return normalizeDoc(doc).map(block => {
    const inline = serializeInline(block.runs)
    if (block.depth >= 0) return '  '.repeat(block.depth) + '- ' + inline
    // A line that would read as a bullet is not one: its dash is escaped.
    return /^ *[-*] /.test(inline) ? inline.replace(/^( *)-/, '$1\\-') : inline
  }).join('\n')
}

/** The note's words without any marker: for search, a quotation, an aria label or an export as plain text. */
export function notePlainText(markdown: string): string {
  return parseNote(markdown).map(block => (block.depth >= 0 ? '  '.repeat(block.depth) + '• ' : '') + block.runs.map(run => run.text).join('')).join('\n')
}

/** True when the note uses any formatting (a bullet, bold or italic). */
export function noteHasFormatting(markdown: string): boolean {
  return parseNote(markdown).some(block => block.depth >= 0 || block.runs.some(run => run.b || run.i))
}

/* ---------------- Display ---------------- */

export type NoteNode =
  | { type: 'p'; runs: NoteRun[] }
  | { type: 'ul'; items: Array<{ runs: NoteRun[]; children: NoteNode | null }> }

/** The blocks as a tree for display: paragraph lines, and each run of bullets as a nested list. */
export function noteTree(doc: NoteDoc): NoteNode[] {
  const out: NoteNode[] = []
  const norm = normalizeDoc(doc)
  for (let k = 0; k < norm.length;) {
    if (norm[k].depth < 0) { out.push({ type: 'p', runs: norm[k].runs }); k += 1; continue }
    let end = k
    while (end < norm.length && norm[end].depth >= 0) end += 1
    out.push(listOf(norm.slice(k, end), 0))
    k = end
  }
  return out
}

function listOf(blocks: NoteBlock[], depth: number): Extract<NoteNode, { type: 'ul' }> {
  const items: Array<{ runs: NoteRun[]; children: NoteNode | null }> = []
  for (let k = 0; k < blocks.length;) {
    const block = blocks[k]
    let end = k + 1
    while (end < blocks.length && blocks[end].depth > depth) end += 1
    const kids = blocks.slice(k + 1, end)
    items.push({ runs: block.depth === depth ? block.runs : [], children: kids.length ? listOf(kids, depth + 1) : null })
    k = end
  }
  return { type: 'ul', items }
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const escapeHtml = (text: string) => String(text).replace(/[&<>"']/g, ch => ESC[ch])

function runsHtml(runs: NoteRun[]): string {
  return runs.map(run => {
    let html = escapeHtml(run.text)
    if (run.i) html = `<em>${html}</em>`
    if (run.b) html = `<strong>${html}</strong>`
    return html
  }).join('')
}

function nodeHtml(node: NoteNode): string {
  if (node.type === 'p') return `<p>${node.runs.length ? runsHtml(node.runs) : '<br>'}</p>`
  return `<ul>${node.items.map(item => `<li>${runsHtml(item.runs)}${item.children ? nodeHtml(item.children) : ''}</li>`).join('')}</ul>`
}

/** The note as HTML for display (every character escaped): `<p>` lines and nested `<ul>` lists. */
export function noteHtml(markdown: string): string {
  return noteTree(parseNote(markdown)).map(nodeHtml).join('')
}

/* ---------------- Editing operations (positions are offsets in docText) ---------------- */

type Ch = { ch: string; b: boolean; i: boolean }
type Line = { depth: number; chars: Ch[] }

const toLines = (doc: NoteDoc): Line[] => doc.map(block => ({ depth: block.depth, chars: block.runs.flatMap(run => run.text.split('').map(ch => ({ ch, b: !!run.b, i: !!run.i }))) }))
const fromLines = (lines: Line[]): NoteDoc => normalizeDoc(lines.map(line => ({ depth: line.depth, runs: line.chars.map(c => ({ text: c.ch, ...(c.b ? { b: true } : {}), ...(c.i ? { i: true } : {}) })) })))

/** The note's characters, lines joined by "\n": what an editor position counts. */
export function docText(doc: NoteDoc): string {
  return doc.map(block => block.runs.map(run => run.text).join('')).join('\n')
}

const lineLength = (line: Line) => line.chars.length

/** A position as its line and the offset in it. */
export function locate(doc: NoteDoc, pos: number): { line: number; offset: number } {
  let rest = Math.max(0, pos)
  for (let line = 0; line < doc.length; line += 1) {
    const len = doc[line].runs.reduce((n, run) => n + run.text.length, 0)
    if (rest <= len) return { line, offset: rest }
    rest -= len + 1
  }
  const last = doc.length - 1
  return { line: Math.max(0, last), offset: last >= 0 ? doc[last].runs.reduce((n, run) => n + run.text.length, 0) : 0 }
}

/** The position of a line's start. */
export function lineStart(doc: NoteDoc, line: number): number {
  let pos = 0
  for (let k = 0; k < line && k < doc.length; k += 1) pos += doc[k].runs.reduce((n, run) => n + run.text.length, 0) + 1
  return pos
}

export interface EditResult { doc: NoteDoc; caret: number }

/** Delete [from, to) and insert `text` there with the given style; "\n" in the text starts a new paragraph line. */
export function replaceText(doc: NoteDoc, from: number, to: number, text: string, style: { b?: boolean; i?: boolean } = {}): EditResult {
  const pasted: NoteDoc = text.split('\n').map(part => ({ depth: -1, runs: part ? [{ text: part, ...(style.b ? { b: true } : {}), ...(style.i ? { i: true } : {}) }] : [] }))
  return replaceWithDoc(doc, from, to, pasted, { keepFirstDepth: true })
}

/**
 * Replace [from, to) with another note's lines (a paste): its first line joins the line at `from`, its last line is
 * followed by what came after `to`; lines in between keep their own kind. -> the new note and the caret after it.
 */
export function replaceWithDoc(doc: NoteDoc, from: number, to: number, insert: NoteDoc, { keepFirstDepth = false } = {}): EditResult {
  const lines = toLines(doc)
  const [a, z] = from <= to ? [from, to] : [to, from]
  const start = locate(doc, a), end = locate(doc, z)
  const head = lines[start.line], tail = lines[end.line]
  const before = head.chars.slice(0, start.offset), after = tail.chars.slice(end.offset)
  const add = toLines(insert.length ? insert : [{ depth: -1, runs: [] }])
  const made: Line[] = add.map((line, k) => ({ depth: k === 0 && (keepFirstDepth || before.length || head.depth >= 0) ? head.depth : line.depth, chars: line.chars }))
  made[0] = { depth: made[0].depth, chars: [...before, ...made[0].chars] }
  const lastIndex = made.length - 1
  const caretLine = start.line + lastIndex, caretOffset = made[lastIndex].chars.length
  made[lastIndex] = { depth: made[lastIndex].depth, chars: [...made[lastIndex].chars, ...after] }
  const next = [...lines.slice(0, start.line), ...made, ...lines.slice(end.line + 1)]
  const out = fromLines(next)
  return { doc: out, caret: lineStart(out, caretLine) + caretOffset }
}

/**
 * Return: the line splits at the caret (a selection is deleted first) and the new line is of the same kind. Return
 * on an empty bullet ends the list there: the line becomes a paragraph line.
 */
export function splitLine(doc: NoteDoc, from: number, to: number = from): EditResult {
  const cut = from === to ? { doc, caret: from } : replaceText(doc, from, to, '')
  const lines = toLines(cut.doc)
  const at = locate(cut.doc, cut.caret)
  const line = lines[at.line]
  if (line.depth >= 0 && line.chars.length === 0) {
    lines[at.line] = { depth: -1, chars: [] }
    const out = fromLines(lines)
    return { doc: out, caret: lineStart(out, at.line) }
  }
  const first = { depth: line.depth, chars: line.chars.slice(0, at.offset) }
  const second = { depth: line.depth, chars: line.chars.slice(at.offset) }
  lines.splice(at.line, 1, first, second)
  const out = fromLines(lines)
  return { doc: out, caret: lineStart(out, at.line + 1) }
}

/**
 * Backspace at a line's start: a bullet loses one level, a top-level bullet becomes a paragraph line, and a paragraph
 * line joins the line above. -> null when the caret is not at a line's start (the browser deletes as usual).
 */
export function backspaceAtStart(doc: NoteDoc, pos: number): EditResult | null {
  const at = locate(doc, pos)
  if (at.offset !== 0) return null
  const lines = toLines(doc)
  const line = lines[at.line]
  if (line.depth > 0) { line.depth -= 1; const out = fromLines(lines); return { doc: out, caret: lineStart(out, at.line) } }
  if (line.depth === 0) { line.depth = -1; const out = fromLines(lines); return { doc: out, caret: lineStart(out, at.line) } }
  if (at.line === 0) return { doc, caret: 0 }
  const above = lines[at.line - 1]
  const caretOffset = above.chars.length
  lines.splice(at.line - 1, 2, { depth: above.depth, chars: [...above.chars, ...line.chars] })
  const out = fromLines(lines)
  return { doc: out, caret: lineStart(out, at.line - 1) + caretOffset }
}

const linesBetween = (doc: NoteDoc, from: number, to: number) => {
  const a = locate(doc, Math.min(from, to)).line, z = locate(doc, Math.max(from, to)).line
  return { a, z }
}

/** Tab / Shift+Tab on bullets: each bullet line in [from, to] goes one level in (+1) or out (-1). -> null when none is a bullet. */
export function indentLines(doc: NoteDoc, from: number, to: number, delta: 1 | -1): NoteDoc | null {
  const { a, z } = linesBetween(doc, from, to)
  const lines = toLines(doc)
  let any = false
  for (let k = a; k <= z; k += 1) {
    if (lines[k].depth < 0) continue
    any = true
    const prev = k > 0 ? lines[k - 1].depth : -1
    lines[k].depth = delta > 0 ? Math.min(NOTE_MAX_DEPTH, lines[k].depth + 1, prev + 1) : lines[k].depth - 1
  }
  return any ? fromLines(lines) : null
}

/** The bullet button: the lines in [from, to] become bullets, or, when they all are bullets already, paragraph lines. */
export function toggleBullets(doc: NoteDoc, from: number, to: number): NoteDoc {
  const { a, z } = linesBetween(doc, from, to)
  const lines = toLines(doc)
  const all = lines.slice(a, z + 1).every(line => line.depth >= 0)
  for (let k = a; k <= z; k += 1) lines[k].depth = all ? -1 : Math.max(0, lines[k].depth)
  return fromLines(lines)
}

/** Whether every character in [from, to) has the style (a collapsed range: the character before it). */
export function hasMark(doc: NoteDoc, from: number, to: number, mark: NoteMark): boolean {
  const lines = toLines(doc)
  const [a, z] = from <= to ? [from, to] : [to, from]
  if (a === z) {
    const at = locate(doc, a)
    const c = lines[at.line].chars[at.offset - 1]
    return !!c && c[mark]
  }
  let seen = false
  for (let pos = a; pos < z; pos += 1) {
    const at = locate(doc, pos)
    const c = lines[at.line].chars[at.offset]
    if (!c) continue
    if (/\s/.test(c.ch)) continue
    seen = true
    if (!c[mark]) return false
  }
  return seen
}

/** ⌘B / ⌘I on a selection: the style on every character in it, or off when all have it. */
export function toggleMark(doc: NoteDoc, from: number, to: number, mark: NoteMark): NoteDoc {
  const on = !hasMark(doc, from, to, mark)
  const lines = toLines(doc)
  const [a, z] = from <= to ? [from, to] : [to, from]
  for (let pos = a; pos < z; pos += 1) {
    const at = locate(doc, pos)
    const c = lines[at.line].chars[at.offset]
    if (c) c[mark] = on
  }
  return fromLines(lines)
}

/** The line kind at a position: a bullet's depth, or -1. */
export function depthAt(doc: NoteDoc, pos: number): number {
  return doc[locate(doc, pos).line]?.depth ?? -1
}

/**
 * Markdown typed in place: "- " or "* " at the start of a paragraph line makes it a bullet; "**words**" and "*words*"
 * just closed before the caret become bold and italic. -> the new note and caret, or null when nothing applies.
 */
export function markdownShortcut(doc: NoteDoc, caret: number): EditResult | null {
  const at = locate(doc, caret)
  const lines = toLines(doc)
  const line = lines[at.line]
  const text = line.chars.map(c => c.ch).join('')
  const before = text.slice(0, at.offset)
  if (line.depth < 0 && (before === '- ' || before === '* ') && line.chars.slice(0, 2).every(c => !c.b && !c.i)) {
    lines[at.line] = { depth: 0, chars: line.chars.slice(2) }
    const out = fromLines(lines)
    return { doc: out, caret: lineStart(out, at.line) }
  }
  const plainBefore = line.chars.slice(0, at.offset)
  const tryWrap = (stars: number, mark: NoteMark): EditResult | null => {
    const re = stars === 2 ? /(?:^|[^*\\])\*\*([^*\s](?:[^*]*[^*\s])?)\*\*$/ : /(?:^|[^*\\])\*([^*\s](?:[^*]*[^*\s])?)\*$/
    const m = before.match(re)
    if (!m) return null
    const inner = m[1]
    const end = at.offset, innerStart = end - stars - inner.length, open = innerStart - stars
    if (plainBefore.slice(open, end).some(c => c[mark])) return null
    const kept = [...plainBefore.slice(0, open), ...plainBefore.slice(innerStart, innerStart + inner.length).map(c => ({ ...c, [mark]: true })), ...line.chars.slice(end)]
    lines[at.line] = { depth: line.depth, chars: kept }
    const out = fromLines(lines)
    return { doc: out, caret: lineStart(out, at.line) + end - stars * 2 }
  }
  return tryWrap(2, 'b') ?? tryWrap(1, 'i')
}

/** The note cut to its limit as Markdown (the longest start of it whose Markdown fits). */
export function capDoc(doc: NoteDoc, max = NOTE_MAX_CHARS): NoteDoc {
  if (serializeNote(doc).length <= max) return doc
  const total = docText(doc).length
  let lo = 0, hi = total
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (serializeNote(replaceText(doc, mid, total, '').doc).length <= max) lo = mid
    else hi = mid - 1
  }
  return replaceText(doc, lo, total, '').doc
}

/** A note's Markdown cut to the field's limit without breaking a marker or an escape. */
export function capNoteMarkdown(markdown: string, max = NOTE_MAX_CHARS): string {
  if (markdown.length <= max) return markdown
  return serializeNote(capDoc(parseNote(markdown), max))
}
