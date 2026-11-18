// @vitest-environment jsdom
import { expect, test } from 'vitest'
import { labFindShortcut } from './labChrome'

const f = (over: Partial<KeyboardEvent> = {}) => ({ key: 'f', code: 'KeyF', ctrlKey: true, metaKey: false, altKey: false, shiftKey: false, isComposing: false, defaultPrevented: false, ...over }) as KeyboardEvent

test('Ctrl+F and Cmd+F open the book search', () => {
  expect(labFindShortcut(f(), document.body)).toBe(true)
  expect(labFindShortcut(f({ ctrlKey: false, metaKey: true }), document.body)).toBe(true)
  expect(labFindShortcut(f({ key: 'F' }), document.body)).toBe(true)
})

test('the F key by position works on layouts where it types another letter', () => {
  expect(labFindShortcut(f({ key: 'а' }), document.body)).toBe(true)
  expect(labFindShortcut(f({ key: 'g', code: 'KeyF' }), document.body)).toBe(false)
})

test('other combinations stay with the browser', () => {
  expect(labFindShortcut(f({ ctrlKey: false }), document.body)).toBe(false)
  expect(labFindShortcut(f({ shiftKey: true }), document.body)).toBe(false)
  expect(labFindShortcut(f({ altKey: true }), document.body)).toBe(false)
  expect(labFindShortcut(f({ ctrlKey: true, metaKey: true }), document.body)).toBe(false)
  expect(labFindShortcut(f({ isComposing: true }), document.body)).toBe(false)
  expect(labFindShortcut(f({ defaultPrevented: true }), document.body)).toBe(false)
  expect(labFindShortcut(f({ key: 'g', code: 'KeyG' }), document.body)).toBe(false)
})

test('while typing in a field the browser keeps its own Find', () => {
  const input = document.createElement('input'); document.body.append(input)
  const textarea = document.createElement('textarea'); document.body.append(textarea)
  const editable = document.createElement('div'); editable.setAttribute('contenteditable', 'true'); document.body.append(editable)
  expect(labFindShortcut(f(), input)).toBe(false)
  expect(labFindShortcut(f(), textarea)).toBe(false)
  expect(labFindShortcut(f(), editable)).toBe(false)
  input.remove(); textarea.remove(); editable.remove()
})
