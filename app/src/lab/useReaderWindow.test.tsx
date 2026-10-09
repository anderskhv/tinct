// @vitest-environment jsdom
import { render, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { READER_COMPANION_WINDOW, READER_TALK_WINDOW, readerCompanionPlacement, readerWindowEdgeName, readerWindowEdgesAt, readerWindowMinimum, useReaderWindow } from './useReaderWindow'

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

describe('Chat and Talk default geometry (Anders, 9 Oct 2026)', () => {
  afterEach(() => { cleanup(); sessionStorage.clear() })

  it('opens 312 x 390, 8px from the right edge, its foot level with the foot of the pages', () => {
    expect(READER_COMPANION_WINDOW).toEqual({ width: 312, height: 390, right: 8 })
    expect(readerCompanionPlacement({ width: 312, height: 390 }, { width: 1440, height: 900 }, 808)).toEqual({ x: 1120, y: 418 })
    expect(readerCompanionPlacement({ width: 312, height: 390 }, { width: 1280, height: 800 }, 708)).toEqual({ x: 960, y: 318 })
    // No pages measured (or off screen): the foot sits 8px above the viewport's.
    expect(readerCompanionPlacement({ width: 312, height: 390 }, { width: 1440, height: 900 }, null)).toEqual({ x: 1120, y: 502 })
    expect(readerCompanionPlacement({ width: 312, height: 390 }, { width: 1440, height: 900 }, 1200)).toEqual({ x: 1120, y: 502 })
  })

  function Companion({ name }: { name: string }) {
    const ref = useReaderWindow<HTMLDivElement>(name)
    return (
      <div className="lab is-desktop">
        <div className="lab-page-wrap" />
        <div ref={ref} data-testid="panel"><div data-reader-window-handle>Chat</div><p>Body</p></div>
      </div>
    )
  }

  // jsdom has no layout: the pages end at 808px and the window's box is whatever its inline styles say.
  const pages = { left: 30, top: 58, right: 1410, bottom: 808, width: 1380, height: 750, x: 30, y: 58, toJSON: () => ({}) } as DOMRect
  function styledBox(panel: HTMLElement): DOMRect {
    const px = (value: string, otherwise: number) => (value ? Number.parseFloat(value) : otherwise)
    const left = px(panel.style.left, 0), top = px(panel.style.top, 0)
    const width = px(panel.style.width, 312), height = px(panel.style.height, 390)
    return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) } as DOMRect
  }
  function mountWithLayout(name: string) {
    Object.assign(window, { innerWidth: 1440, innerHeight: 900 })
    const original = Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = function (this: Element) {
      if (this.classList.contains('lab-page-wrap')) return pages
      if ((this as HTMLElement).dataset.testid === 'panel') return styledBox(this as HTMLElement)
      return original.call(this)
    }
    try { return render(<Companion name={name} />) } finally { Element.prototype.getBoundingClientRect = original }
  }

  for (const name of ['chat', 'talk']) {
    it(`${name} opens anchored at the book's lower right`, () => {
      const panel = mountWithLayout(name).getByTestId('panel')
      expect(panel.style.left).toBe('1120px')
      expect(panel.style.top).toBe('418px')
      expect(panel.style.right).toBe('auto')
    })
  }

  it("a reader's own place still wins over the default", () => {
    sessionStorage.setItem('tinct-window:chat', JSON.stringify({ x: 200, y: 150, width: 400, height: 500 }))
    const panel = mountWithLayout('chat').getByTestId('panel')
    expect(panel.style.left).toBe('200px')
    expect(panel.style.top).toBe('150px')
    expect(panel.style.width).toBe('400px')
    expect(panel.style.height).toBe('500px')
  })

  it('Chat cannot be made smaller than 280 x 300, Talk not smaller than 260 x 180, so their controls keep room', () => {
    expect(readerWindowMinimum('talk')).toEqual({ width: 260, height: 180 })
    expect(readerWindowMinimum('chat')).toEqual({ width: 280, height: 300 })
    expect(readerWindowMinimum('settings')).toEqual({ width: 260, height: 160 })
    for (const [name, minimum] of [['talk', { width: 260, height: 180 }], ['chat', { width: 280, height: 300 }]] as const) {
      const view = mountWithLayout(name)
      const panel = view.getByTestId('panel')
      panel.getBoundingClientRect = () => styledBox(panel)
      for (const [property, value] of Object.entries({ left: 1120, top: 418, width: 312, height: 390 })) panel.style.setProperty(property, value + 'px')
      // Drag the top-left corner far down and right.
      pointer('pointerdown', panel, 1121, 419)
      pointer('pointermove', window, 1421, 819)
      pointer('pointerup', window, 1421, 819)
      expect(panel.style.width).toBe(minimum.width + 'px')
      expect(panel.style.height).toBe(minimum.height + 'px')
      view.unmount()
    }
  })

  it('Talk opens at its compact size on the same anchor: 8px in, foot on the pages\' foot', () => {
    expect(READER_TALK_WINDOW).toEqual({ width: 312, height: 252, right: 8 })
    const point = readerCompanionPlacement(READER_TALK_WINDOW, { width: 1440, height: 900 }, pages.bottom)
    expect(point).toEqual({ x: 1440 - 8 - 312, y: 808 - 252 })
  })

  it('pins the Talk header and controls: only the orb gives way; Talk is sized to its content (lab.css)', () => {
    const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
    expect(css).toMatch(/\.lab-voice-panel\[data-reader-window\] > \.lab-voice-panel-controls \{ flex:none; \}/)
    expect(css).toMatch(/\.lab-voice-panel\[data-reader-window\] > \.lab-voice-panel-stage \{\s*flex:1 1 auto; min-height:0; overflow:hidden;/)
    expect(css).toMatch(/width:min\(312px,calc\(100vw - 48px\)\);\s*height:min\(390px,calc\(100dvh - 132px\)\);/)
    expect(css).toMatch(/\.lab-voice-panel\[data-reader-window\] \{\s*height:min\(252px,calc\(100dvh - 132px\)\);/)
    expect(css).not.toMatch(/lab-voice-panel-thread/)
  })
})
