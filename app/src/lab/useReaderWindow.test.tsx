// @vitest-environment jsdom
import { render, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { readerWindowEdgeName, readerWindowEdgesAt, useReaderWindow } from './useReaderWindow'

const box = { left: 100, top: 100, right: 500, bottom: 400 }
const name = (x: number, y: number) => {
  const edges = readerWindowEdgesAt(box, x, y)
  return edges ? readerWindowEdgeName(edges) : null
}

describe('reader window edges', () => {
  it('resizes from every edge and corner, like a desktop window', () => {
    expect(name(300, 102)).toBe('n')
    expect(name(300, 398)).toBe('s')
    expect(name(102, 250)).toBe('w')
    expect(name(498, 250)).toBe('e')
    expect(name(102, 102)).toBe('nw')
    expect(name(498, 398)).toBe('se')
    // Corners are a larger target than the edges.
    expect(name(112, 395)).toBe('sw')
    expect(name(495, 112)).toBe('ne')
  })

  it('leaves the interior and the outside alone', () => {
    expect(name(300, 250)).toBeNull()
    expect(name(300, 120)).toBeNull()
    expect(name(50, 250)).toBeNull()
  })
})

function Panel() {
  const ref = useReaderWindow<HTMLDivElement>('test-window')
  return <div className="lab is-desktop"><div ref={ref} data-testid="panel"><div data-reader-window-handle>Chat</div><p>Body</p></div></div>
}

function pointer(type: string, target: EventTarget, x: number, y: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 })
  Object.assign(event, { pointerId: 1, pointerType: 'mouse' })
  target.dispatchEvent(event)
}

describe('dragging a reader window edge', () => {
  afterEach(() => { cleanup(); sessionStorage.clear() })

  it('moves only the dragged sides: the left and top edges keep the right and bottom in place', () => {
    const { getByTestId } = render(<Panel />)
    const panel = getByTestId('panel')
    const initial = { left: 300, top: 200, width: 400, height: 300 }
    // jsdom has no layout: the box is whatever the hook's styles say.
    const current = () => {
      const px = (value: string, fallback: number) => (value ? Number.parseFloat(value) : fallback)
      return { left: px(panel.style.left, initial.left), top: px(panel.style.top, initial.top), width: px(panel.style.width, initial.width), height: px(panel.style.height, initial.height) }
    }
    panel.getBoundingClientRect = () => {
      const r = current()
      return { ...r, right: r.left + r.width, bottom: r.top + r.height, x: r.left, y: r.top, toJSON: () => ({}) } as DOMRect
    }
    Object.assign(window, { innerWidth: 1440, innerHeight: 900 })
    // Mounting placed the zero-sized jsdom box; start from a real window position.
    for (const [property, value] of Object.entries(initial)) panel.style.setProperty(property, value + 'px')

    expect(panel.dataset.readerWindow).toBe('true')
    // Hovering the left edge shows the resize cursor.
    pointer('pointermove', panel, 302, 350)
    expect(panel.dataset.readerWindowEdge).toBe('w')
    pointer('pointerdown', panel, 302, 350)
    pointer('pointermove', window, 202, 350)
    pointer('pointerup', window, 202, 350)
    expect(current().width).toBe(500)
    expect(current().left + current().width).toBe(700)

    pointer('pointerdown', panel, 450, 201)
    pointer('pointermove', window, 450, 151)
    pointer('pointerup', window, 450, 151)
    expect(current().height).toBe(350)
    expect(current().top + current().height).toBe(500)
    // The interior still does nothing but select text.
    pointer('pointermove', panel, 450, 350)
    expect(panel.dataset.readerWindowEdge).toBeUndefined()
  })
})
