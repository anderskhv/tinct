// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { labUndoShortcut } from './labChrome'

const z = (extra: Partial<KeyboardEvent> = {}) => ({ key: 'z', code: 'KeyZ', ctrlKey: true, metaKey: false, altKey: false, shiftKey: false, isComposing: false, defaultPrevented: false, repeat: false, ...extra }) as KeyboardEvent

afterEach(() => { document.body.innerHTML = '' })

it('takes Ctrl+Z and Cmd+Z on the page', () => {
  expect(labUndoShortcut(z(), document.body)).toBe(true)
  expect(labUndoShortcut(z({ ctrlKey: false, metaKey: true }), document.body)).toBe(true)
  expect(labUndoShortcut(z({ key: 'Z' }), null)).toBe(true)
  // A layout whose Z position types another script still undoes; a Latin letter elsewhere does not.
  expect(labUndoShortcut(z({ key: 'я' }), null)).toBe(true)
  expect(labUndoShortcut(z({ key: 'y' }), null)).toBe(false)
})

it('leaves redo, other combinations, repeats and handled keys to the browser', () => {
  for (const extra of [{ shiftKey: true }, { altKey: true }, { ctrlKey: false }, { metaKey: true }, { repeat: true }, { isComposing: true }, { defaultPrevented: true }, { key: 'x', code: 'KeyX' }] as Partial<KeyboardEvent>[]) {
    expect(labUndoShortcut(z(extra), document.body)).toBe(false)
  }
})

it('never takes the key from a field, so typing keeps its native undo', () => {
  document.body.innerHTML = '<textarea></textarea><input type="text"><input type="checkbox"><div contenteditable="true"><span>t</span></div><div role="textbox"></div>'
  const [area, text, box] = [document.querySelector('textarea')!, document.querySelector('input[type=text]')!, document.querySelector('input[type=checkbox]')!]
  expect(labUndoShortcut(z(), area)).toBe(false)
  expect(labUndoShortcut(z(), text)).toBe(false)
  expect(labUndoShortcut(z(), document.querySelector('[contenteditable] span'))).toBe(false)
  expect(labUndoShortcut(z(), document.querySelector('[role=textbox]'))).toBe(false)
  expect(labUndoShortcut(z(), box)).toBe(true)
})
