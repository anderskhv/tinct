// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { createNoteEditor, domToDoc, pastedDoc, positionOf, textToDoc, type NoteEditorHandle } from './noteEditor'
import { NOTE_MAX_CHARS, serializeNote } from './noteMarkdown'

let handle: NoteEditorHandle | null = null
afterEach(() => { handle?.destroy(); handle = null; document.body.innerHTML = '' })

function field(value = '') {
  const el = document.createElement('div')
  document.body.append(el)
  const changes: string[] = []
  handle = createNoteEditor(el, { value, onChange: md => changes.push(md) })
  return { el, changes, handle }
}
function caret(el: HTMLElement, pos: number) { (el as unknown as { setSelectionRange(a: number, z?: number): void }).setSelectionRange(pos, pos) }
function beforeInput(el: HTMLElement, inputType: string, data: string | null = null) {
  const event = new InputEvent('beforeinput', { inputType, data, bubbles: true, cancelable: true })
  el.dispatchEvent(event)
  return event.defaultPrevented
}
function typeText(el: HTMLElement, text: string) {
  for (const ch of text) {
    if (beforeInput(el, 'insertText', ch)) continue
    // What the browser does: the character goes in at the caret.
    const sel = document.getSelection()!
    const range = sel.getRangeAt(0)
    const node = range.startContainer
    if (node.nodeType === 3) {
      (node as Text).insertData(range.startOffset, ch)
      range.setStart(node, range.startOffset + 1); range.collapse(true)
    } else {
      const t = document.createTextNode(ch)
      const br = (node as Element).querySelector?.('br')
      if (br) br.replaceWith(t); else node.appendChild(t)
      range.setStart(t, 1); range.collapse(true)
    }
    sel.removeAllRanges(); sel.addRange(range)
    el.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: ch, bubbles: true }))
  }
}

describe('note field', () => {
  it('draws an old plain note line by line and reads back the same Markdown', () => {
    const { el } = field('One line\n\nAnother <b>line</b>')
    expect(el.querySelectorAll('[data-depth]').length).toBe(3)
    expect(el.innerHTML).not.toContain('<b>')
    expect((el as unknown as { value: string }).value).toBe('One line\n\nAnother <b>line</b>')
    expect(serializeNote(domToDoc(el))).toBe('One line\n\nAnother <b>line</b>')
  })

  it('types a nested list with bold and italic, live', () => {
    const { el, changes } = field('')
    el.focus(); caret(el, 0)
    typeText(el, '- one')
    expect(el.querySelector('[data-depth="0"]')).not.toBeNull()
    expect(beforeInput(el, 'insertParagraph')).toBe(true)
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
    typeText(el, 'two **bold**')
    expect(el.querySelector('strong')?.textContent).toBe('bold')
    typeText(el, ' and *it*')
    expect(el.querySelector('em')?.textContent).toBe('it')
    expect(changes[changes.length - 1]).toBe('- one\n  - two **bold** and *it*')
    // Return twice on an empty bullet ends the list.
    beforeInput(el, 'insertParagraph'); beforeInput(el, 'insertParagraph')
    typeText(el, 'after')
    expect(changes[changes.length - 1]).toBe('- one\n  - two **bold** and *it*\nafter')
  })

  it('positions survive the field being drawn again', () => {
    const { el } = field('ab\n- cd')
    caret(el, 4)
    const sel = document.getSelection()!
    expect(positionOf(el, sel.anchorNode!, sel.anchorOffset)).toBe(4)
    expect((el as unknown as { selectionStart: number }).selectionStart).toBe(4)
  })

  it('reads a paste for words and the formats only, never markup', () => {
    const page = new DOMParser().parseFromString('<meta charset="utf-8"><div><p>Hello <b>bold</b> <i>it</i> <a href="javascript:alert(1)">link</a><img src=x onerror="alert(1)"><script>alert(2)</script></p><ul><li>one<ul><li>two</li></ul></li></ul><span style="font-weight:700">heavy</span></div>', 'text/html')
    const md = serializeNote(pastedDoc(page.body))
    expect(md).toBe('Hello **bold** *it* link\n- one\n  - two\n**heavy**')
    expect(serializeNote(textToDoc('• a\n  • b'))).toBe('- a\n  - b')
  })

  it('holds a note to 4000 characters of Markdown', () => {
    const { el, changes } = field('x'.repeat(NOTE_MAX_CHARS - 1))
    el.focus(); caret(el, NOTE_MAX_CHARS - 1)
    typeText(el, 'yz')
    const value = (el as unknown as { value: string }).value
    expect(value.length).toBeLessThanOrEqual(NOTE_MAX_CHARS)
    expect(changes.every(md => md.length <= NOTE_MAX_CHARS)).toBe(true)
  })

  it('⌘B with no selection makes the next words bold', () => {
    const { el, changes } = field('a ')
    el.focus(); caret(el, 2)
    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', metaKey: mac, ctrlKey: !mac, bubbles: true, cancelable: true }))
    typeText(el, 'b')
    expect(changes[changes.length - 1]).toBe('a **b**')
  })
})
