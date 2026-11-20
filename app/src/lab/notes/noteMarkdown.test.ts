import { describe, expect, it } from 'vitest'
import {
  backspaceAtStart, capNoteMarkdown, docText, indentLines, markdownShortcut, NOTE_MAX_CHARS, noteHtml, notePlainText,
  parseInline, parseNote, replaceText, serializeInline, serializeNote, splitLine, toggleBullets, toggleMark,
  type NoteDoc, type NoteRun,
} from './noteMarkdown'

const round = (md: string) => serializeNote(parseNote(md))

describe('note Markdown: parsing and writing', () => {
  it('keeps an old plain note exactly as it was, line breaks and all', () => {
    const plain = 'First thought.\n\nA second, after a blank line.\n  indented words stay as typed\nC:\\path and 2 * 3 = 6'
    // Written back, a stray star or backslash is escaped: it still reads exactly as before.
    expect(noteHtml(round(plain))).toBe(noteHtml(plain))
    expect(notePlainText(round(plain))).toBe(plain)
    expect(round('First thought.\n\nSecond.')).toBe('First thought.\n\nSecond.')
    expect(notePlainText(plain)).toBe(plain)
    expect(noteHtml('Plain <b>not bold</b> & "quoted"')).toBe('<p>Plain &lt;b&gt;not bold&lt;/b&gt; &amp; &quot;quoted&quot;</p>')
    expect(noteHtml('one\n\ntwo')).toBe('<p>one</p><p><br></p><p>two</p>')
  })

  it('reads bold, italic and both, and writes them back the same way', () => {
    expect(parseInline('a **bold** and *italic* and ***both***')).toEqual([
      { text: 'a ' }, { text: 'bold', b: true }, { text: ' and ' }, { text: 'italic', i: true }, { text: ' and ' }, { text: 'both', b: true, i: true },
    ])
    for (const md of ['a **bold** and *italic* and ***both***', '**a *b* c**', '*a* **b**', '**bold***italic*', '*it****both***', '***both****it*', 'x **a b** y']) {
      expect(round(md)).toBe(md)
    }
  })

  it('round-trips every mix of styles through Markdown', () => {
    const styles = [{}, { b: true }, { i: true }, { b: true, i: true }] as const
    for (const a of styles) for (const b of styles) for (const c of styles) {
      const runs: NoteRun[] = [{ text: 'one', ...a }, { text: 'two', ...b }, { text: ' three', ...c }]
      const back = parseInline(serializeInline(runs))
      const flat = (list: NoteRun[]) => list.flatMap(run => run.text.split('').map(ch => `${ch}${run.b ? 'B' : ''}${run.i ? 'I' : ''}`)).filter(x => !x.startsWith(' ')).join('|')
      expect(flat(back)).toBe(flat(runs))
    }
  })

  it('leaves stray stars as stars, and escapes literal ones', () => {
    expect(parseInline('2 * 3 * 4')).toEqual([{ text: '2 * 3 * 4' }])
    expect(parseInline('**not closed')).toEqual([{ text: '**not closed' }])
    expect(serializeInline([{ text: 'a*b\\c' }])).toBe('a\\*b\\\\c')
    expect(parseInline('a\\*b\\\\c')).toEqual([{ text: 'a*b\\c' }])
  })

  it('reads nested bullets (2-space indents) and writes them back', () => {
    const md = 'Walton:\n- one\n  - two\n    - three\n      - four\n- back'
    const doc = parseNote(md)
    expect(doc.map(block => block.depth)).toEqual([-1, 0, 1, 2, 3, 0])
    expect(serializeNote(doc)).toBe(md)
    expect(noteHtml(md)).toBe('<p>Walton:</p><ul><li>one<ul><li>two<ul><li>three<ul><li>four</li></ul></li></ul></li></ul></li><li>back</li></ul>')
    // "* " is a bullet too; a jump of two levels is one level.
    expect(serializeNote(parseNote('* a\n      * b'))).toBe('- a\n  - b')
  })

  it('keeps a line that only looks like a bullet a paragraph line', () => {
    const doc: NoteDoc = [{ depth: -1, runs: [{ text: '- not a bullet' }] }]
    const md = serializeNote(doc)
    expect(md).toBe('\\- not a bullet')
    expect(parseNote(md)).toEqual(doc)
  })

  it('escapes every character it shows as HTML', () => {
    const html = noteHtml('- <img src=x onerror=alert(1)>\n**<script>alert(1)</script>**')
    expect(html).not.toMatch(/<img|<script/)
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).toContain('<strong>&lt;script&gt;alert(1)&lt;/script&gt;</strong>')
  })

  it('cuts a note at 4000 characters of Markdown without breaking a marker', () => {
    const long = '**' + 'x'.repeat(5000) + '**'
    const cut = capNoteMarkdown(long)
    expect(cut.length).toBeLessThanOrEqual(NOTE_MAX_CHARS)
    expect(cut.startsWith('**') && cut.endsWith('**')).toBe(true)
    expect(parseNote(cut)[0].runs).toEqual([{ text: 'x'.repeat(NOTE_MAX_CHARS - 4), b: true }])
    expect(capNoteMarkdown('short')).toBe('short')
  })
})

describe('note Markdown: editing', () => {
  const doc = (md: string) => parseNote(md)
  it('Return continues a list; Return on an empty bullet ends it', () => {
    const a = splitLine(doc('- one'), 5)
    expect(serializeNote(a.doc)).toBe('- one\n- ')
    expect(a.caret).toBe(4)
    const b = splitLine(a.doc, a.caret)
    expect(serializeNote(b.doc)).toBe('- one\n')
    expect(serializeNote(splitLine(doc('- one\n  - two'), docText(doc('- one\n  - two')).length).doc)).toBe('- one\n  - two\n  - ')
  })

  it('Tab nests a bullet at most one level under the line above; Shift+Tab takes it out', () => {
    const d = doc('- a\n- b\n- c')
    const once = indentLines(d, 2, 2, 1)!
    expect(serializeNote(once)).toBe('- a\n  - b\n- c')
    expect(serializeNote(indentLines(once, 2, 2, 1)!)).toBe('- a\n  - b\n- c')
    expect(serializeNote(indentLines(once, 2, 2, -1)!)).toBe('- a\n- b\n- c')
    expect(indentLines(doc('plain'), 0, 0, 1)).toBeNull()
  })

  it('Backspace at a bullet start takes a level off, then the bullet', () => {
    const d = doc('- a\n  - b')
    const one = backspaceAtStart(d, 2)!
    expect(serializeNote(one.doc)).toBe('- a\n- b')
    expect(serializeNote(backspaceAtStart(one.doc, 2)!.doc)).toBe('- a\nb')
    expect(serializeNote(backspaceAtStart(doc('a\nb'), 2)!.doc)).toBe('ab')
    expect(backspaceAtStart(doc('ab'), 1)).toBeNull()
  })

  it('"- " starts a bullet; **words** and *words* typed become bold and italic', () => {
    const typed: NoteDoc = [{ depth: -1, runs: [{ text: '- ' }] }]
    expect(serializeNote(markdownShortcut(typed, 2)!.doc)).toBe('- ')
    expect(markdownShortcut(typed, 2)!.doc[0]).toEqual({ depth: 0, runs: [] })
    const bold = markdownShortcut(doc('see \\*\\*this\\*\\*'), 12)!
    expect(serializeNote(bold.doc)).toBe('see **this**')
    expect(bold.caret).toBe(8)
    expect(serializeNote(markdownShortcut(doc('an \\*idea\\*'), 9)!.doc)).toBe('an *idea*')
    expect(markdownShortcut(doc('2 \\* 3 \\*'), 7)).toBeNull()
  })

  it('⌘B toggles bold over a selection; the bullet button toggles lines', () => {
    const d = doc('one two')
    const on = toggleMark(d, 0, 3, 'b')
    expect(serializeNote(on)).toBe('**one** two')
    expect(serializeNote(toggleMark(on, 0, 3, 'b'))).toBe('one two')
    expect(serializeNote(toggleBullets(doc('a\nb'), 0, 3))).toBe('- a\n- b')
    expect(serializeNote(toggleBullets(doc('- a\n- b'), 0, 3))).toBe('a\nb')
  })

  it('typing in a style and replacing a selection', () => {
    const r = replaceText(doc('ab'), 1, 1, 'X', { b: true })
    expect(serializeNote(r.doc)).toBe('a**X**b')
    expect(r.caret).toBe(2)
  })
})
