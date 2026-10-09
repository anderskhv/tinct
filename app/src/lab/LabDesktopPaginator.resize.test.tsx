// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LabDesktopPaginator } from './LabDesktopPaginator'

// jsdom has no layout: give the measure host a size and capture the observer.
let width = 800
let observerCallbacks: Array<() => void> = []
beforeEach(() => {
  width = 800
  observerCallbacks = []
  vi.stubGlobal('ResizeObserver', class {
    constructor(private callback: () => void) { observerCallbacks.push(() => this.callback()) }
    observe() {}
    disconnect() {}
  })
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => width)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 600)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const frames = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 40)) })

it('measures once when the observer reports the size just measured, and again on a real resize', async () => {
  const onPages = vi.fn()
  render(<LabDesktopPaginator paragraphs={['One two three.', 'Four five six.']} chapterTitle="Chapter 1" layoutKey="k" onPages={onPages} />)
  await frames()
  expect(onPages).toHaveBeenCalledTimes(1)

  // A new observer's first report, at the size already measured.
  act(() => observerCallbacks.at(-1)!())
  await frames()
  expect(onPages).toHaveBeenCalledTimes(1)

  width = 900
  act(() => observerCallbacks.at(-1)!())
  await frames()
  expect(onPages).toHaveBeenCalledTimes(2)
})

// A leaf of 100 words: the stage's rows are as tall as the words they hold.
function measureGeometry(onRows?: () => void) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const rows = this.classList.contains('lab-desktop-measure-rows')
    if (rows) onRows?.()
    const height = this.classList.contains('lab-desktop-measure-page') ? 100
      : rows ? (this.textContent?.match(/\S+/g)?.length ?? 0) : 0
    return { x: 0, y: 0, top: 0, left: 0, right: width, width, bottom: height, height, toJSON: () => ({}) } as DOMRect
  })
}
// Ten paragraphs of fifty words: several leaves, so several pages of work.
const chapter = Array.from({ length: 10 }, (_, p) => Array.from({ length: 50 }, (_, w) => `p${p}w${w}`).join(' ') + '.')

it('drops a measurement for a size the window has already left, and measures the new one once', async () => {
  // The window grows while the first map is being laid out. Its observer
  // reports between two tasks, never inside one.
  let resized = false
  measureGeometry(() => {
    if (resized) return
    resized = true
    setTimeout(() => { width = 900; observerCallbacks.at(-1)!() }, 0)
  })
  // Each page of work outlasts a slice, so the work spans several tasks.
  let clock = 0
  vi.spyOn(performance, 'now').mockImplementation(() => (clock += 30))
  const widths: number[] = []
  const onPages = vi.fn((_pages: Array<{ segments: Array<{ from: number; to: number }> }>) => { widths.push(width) })
  render(<LabDesktopPaginator paragraphs={chapter} chapterTitle="Chapter 1" layoutKey="k" onPages={onPages} />)
  for (let i = 0; i < 6; i += 1) await frames()
  // Before, the 800px map was finished first and the chapter measured again: [800, 900].
  expect(widths).toEqual([900])
  const words = onPages.mock.calls[0][0].flatMap(page => page.segments).reduce((total, segment) => total + segment.to - segment.from, 0)
  expect(words).toBe(chapter.length * 50)
})

it('waits for a box that is still changing size before measuring it', async () => {
  measureGeometry()
  // A window being maximised: a new width on each of the first frames.
  const realFrame = window.requestAnimationFrame.bind(window)
  let frameCount = 0
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => realFrame(time => {
    frameCount += 1
    if (frameCount <= 4) width += 100
    callback(time)
  }))
  const widths: number[] = []
  const onPages = vi.fn(() => { widths.push(width) })
  render(<LabDesktopPaginator paragraphs={['One two three.', 'Four five six.']} chapterTitle="Chapter 1" layoutKey="k" onPages={onPages} />)
  for (let i = 0; i < 8; i += 1) await frames()
  // Measured once, at the size it settled on; no map for a passing width.
  expect(widths).toEqual([1200])
})
