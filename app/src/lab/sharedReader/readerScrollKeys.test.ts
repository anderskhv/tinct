// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { READER_SCROLL_LINE, readerScrollKeyAction, readerScrollKeyTarget } from './readerScrollKeys'

const key = (k: string, extra: Partial<KeyboardEvent> = {}) => ({ key: k, shiftKey: false, altKey: false, ctrlKey: false, metaKey: false, isComposing: false, defaultPrevented: false, ...extra })

describe('readerScrollKeyAction', () => {
  it('steps a line for arrows and a screen less a line for Page keys and Space', () => {
    expect(readerScrollKeyAction(key('ArrowDown'), 800)).toEqual({ kind: 'by', delta: READER_SCROLL_LINE })
    expect(readerScrollKeyAction(key('ArrowUp'), 800)).toEqual({ kind: 'by', delta: -READER_SCROLL_LINE })
    expect(readerScrollKeyAction(key('PageDown'), 800)).toEqual({ kind: 'by', delta: 800 - READER_SCROLL_LINE })
    expect(readerScrollKeyAction(key('PageUp'), 800)).toEqual({ kind: 'by', delta: -(800 - READER_SCROLL_LINE) })
    expect(readerScrollKeyAction(key(' '), 800)).toEqual({ kind: 'by', delta: 800 - READER_SCROLL_LINE })
    expect(readerScrollKeyAction(key(' ', { shiftKey: true }), 800)).toEqual({ kind: 'by', delta: -(800 - READER_SCROLL_LINE) })
    expect(readerScrollKeyAction(key('Home'), 800)).toEqual({ kind: 'start' })
    expect(readerScrollKeyAction(key('End'), 800)).toEqual({ kind: 'end' })
  })

  it('leaves page turns, selection keys, shortcuts and handled keys alone', () => {
    expect(readerScrollKeyAction(key('ArrowRight'), 800)).toBeNull()
    expect(readerScrollKeyAction(key('ArrowLeft'), 800)).toBeNull()
    expect(readerScrollKeyAction(key('Escape'), 800)).toBeNull()
    expect(readerScrollKeyAction(key('ArrowDown', { shiftKey: true }), 800)).toBeNull()
    expect(readerScrollKeyAction(key('End', { shiftKey: true }), 800)).toBeNull()
    expect(readerScrollKeyAction(key('ArrowDown', { ctrlKey: true }), 800)).toBeNull()
    expect(readerScrollKeyAction(key('ArrowDown', { metaKey: true }), 800)).toBeNull()
    expect(readerScrollKeyAction(key('ArrowDown', { altKey: true }), 800)).toBeNull()
    expect(readerScrollKeyAction(key('ArrowDown', { isComposing: true }), 800)).toBeNull()
    expect(readerScrollKeyAction(key('PageDown', { defaultPrevented: true }), 800)).toBeNull()
  })
})

describe('readerScrollKeyTarget', () => {
  afterEach(() => { document.body.innerHTML = ''; delete document.documentElement.dataset.tinctCommandsOpen })
  const setup = (html: string) => {
    document.body.innerHTML = `<div id="host">${html}</div><div id="outside"><button id="chrome">Aa</button><textarea id="ask"></textarea></div>`
    const host = document.getElementById('host')!
    Object.defineProperty(host, 'clientHeight', { configurable: true, value: 800 })
    return host
  }

  it('takes keys from the page itself, the text and chrome buttons', () => {
    const host = setup('<p><span id="word">word</span></p>')
    expect(readerScrollKeyTarget(document.body, host, 'ArrowDown')).toBe(true)
    expect(readerScrollKeyTarget(document.getElementById('word'), host, ' ')).toBe(true)
    expect(readerScrollKeyTarget(document.getElementById('chrome'), host, 'ArrowDown')).toBe(true)
  })

  it('leaves Space to a focused control, and every key to fields, sliders, menus and dialogs', () => {
    const host = setup('<div role="slider" tabindex="0" id="map"></div><div role="dialog"><button id="in-dialog">Close</button></div><div contenteditable="true" id="note"></div>')
    expect(readerScrollKeyTarget(document.getElementById('chrome'), host, ' ')).toBe(false)
    expect(readerScrollKeyTarget(document.getElementById('ask'), host, 'ArrowDown')).toBe(false)
    expect(readerScrollKeyTarget(document.getElementById('map'), host, 'ArrowDown')).toBe(false)
    expect(readerScrollKeyTarget(document.getElementById('in-dialog'), host, 'PageDown')).toBe(false)
    expect(readerScrollKeyTarget(document.getElementById('note'), host, 'ArrowDown')).toBe(false)
  })

  it('stands aside while a modal sheet or the command menu is open, or the reader is hidden', () => {
    const host = setup('<p id="text">text</p>')
    document.documentElement.dataset.tinctCommandsOpen = 'true'
    expect(readerScrollKeyTarget(document.body, host, 'ArrowDown')).toBe(false)
    delete document.documentElement.dataset.tinctCommandsOpen
    document.body.insertAdjacentHTML('beforeend', '<div aria-modal="true"></div>')
    expect(readerScrollKeyTarget(document.body, host, 'ArrowDown')).toBe(false)
    const hidden = setup('<p>text</p>')
    Object.defineProperty(hidden, 'clientHeight', { configurable: true, value: 0 })
    expect(readerScrollKeyTarget(document.body, hidden, 'ArrowDown')).toBe(false)
  })
})
