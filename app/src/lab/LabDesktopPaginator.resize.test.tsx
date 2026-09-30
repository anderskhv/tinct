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
