// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PdfContinuousSurface, pdfBaseSheetWidth, pdfZoomLimit, pdfSourcePlaceAt, pdfSourceLines } from './PdfContinuousSurface'
import type { PdfOriginalDocument } from './PdfOriginalSurface'

afterEach(() => { cleanup(); vi.restoreAllMocks() })

it('caps wide desktop source sheets, keeps only adjacent canvases, and restores an exact page/fraction through jumps and zoom', async () => {
  expect(pdfBaseSheetWidth(2000)).toBe(1500)
  expect(pdfZoomLimit(2000, false)).toBe(1.31)
  expect(pdfZoomLimit(390, true)).toBe(3)
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(2000)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(500)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D)
  const pdf: PdfOriginalDocument = {
    numPages: 40, destroy: vi.fn(async () => {}), getPage: vi.fn(async n => ({
      getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: (n === 35 ? 1200 : 900) * scale, scale, transform: [scale, 0, 0, -scale, 0, (n === 35 ? 1200 : 900) * scale] }),
      render: () => ({ promise: Promise.resolve() }),
      getTextContent: async () => ({ items: [{ str: `Source on page ${n}`, transform: [12, 0, 0, 12, 72, 800], width: 150 }] }),
    })), renderTextLayer: (content, layer) => {
      const span = document.createElement('span'); span.textContent = content.items[0]?.str || ''; layer.append(span)
      return { promise: Promise.resolve() }
    },
  }
  const onVisiblePlace = vi.fn(), onPageText = vi.fn(), onSelection = vi.fn()
  const bytes = vi.fn(async () => new Uint8Array([1]).buffer)
  const props = { bytes, openDocument: async () => pdf, initialPlace: { page: 2, frac: .25 }, onVisiblePlace, onPageText, onSelection }
  const { container, rerender, unmount } = render(<PdfContinuousSurface {...props} />)
  await screen.findByText('Source on page 2')
  expect(onVisiblePlace).toHaveBeenCalledWith({ page: 2, frac: .25 })
  expect(container.querySelectorAll('.pdf-original__slot')).toHaveLength(40)
  expect(container.querySelectorAll('canvas')).toHaveLength(3)
  expect((container.querySelector('.pdf-original__page[data-page="2"]') as HTMLElement).style.width).toBe('1500px')
  const requestedPlace = { page: 35, frac: .4 }
  rerender(<PdfContinuousSurface {...props} requestedPlace={requestedPlace} />)
  await screen.findByText('Source on page 35')
  expect(onVisiblePlace).toHaveBeenCalledWith({ page: 35, frac: .4 })
  expect(container.querySelectorAll('canvas')).toHaveLength(3)
  expect(screen.queryByText('Source on page 2')).toBeNull()
  expect(onPageText).toHaveBeenCalledWith(35, 'Source on page 35')
  await waitFor(() => expect(container.querySelector('.pdf-original__page[data-page="35"]')?.getAttribute('data-ready')).toBe('true'))
  expect((container.querySelector('.pdf-original__page[data-page="35"]') as HTMLElement).style.height).toBe('3000px')
  const layer = container.querySelector('.pdf-original__page[data-page="35"] .pdf-original__text')!
  vi.spyOn(layer, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 200, width: 1500, height: 3000, right: 1600, bottom: 3200 } as DOMRect)
  const originalRects = Object.getOwnPropertyDescriptor(Range.prototype, 'getClientRects')
  Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: () => [{ left: 250, top: 500, width: 150, height: 60, right: 400, bottom: 560 }] })
  const selection = window.getSelection()!, range = document.createRange()
  range.selectNodeContents(layer.firstElementChild!)
  selection.removeAllRanges(); selection.addRange(range)
  fireEvent.mouseUp(layer)
  expect(onSelection).toHaveBeenCalledTimes(1)
  expect(onSelection.mock.calls[0][0]).toMatchObject({ page: 35, text: 'Source on page 35' })
  expect(onSelection.mock.calls[0][0].rects[0].slice(0, 4)).toEqual([35, .1, .1, .1])
  expect(onSelection.mock.calls[0][0].rects[0][4]).toBeCloseTo(.02)
  if (originalRects) Object.defineProperty(Range.prototype, 'getClientRects', originalRects)
  else Reflect.deleteProperty(Range.prototype, 'getClientRects')
  rerender(<PdfContinuousSurface {...props} requestedPlace={requestedPlace} requestedZoom={.5} />)
  await waitFor(() => expect((container.querySelector('.pdf-original__page[data-page="35"]') as HTMLElement).style.width).toBe('750px'))
  expect(onVisiblePlace).toHaveBeenCalledWith({ page: 35, frac: .4 })
  expect(bytes).toHaveBeenCalledTimes(1)
  unmount()
  expect(pdf.destroy).toHaveBeenCalledTimes(1)
})

it('changes the visible source page by ordinary continuous scrolling without a Next click', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(632)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D)
  const pdf: PdfOriginalDocument = { numPages: 3, destroy: vi.fn(async () => {}), getPage: vi.fn(async () => ({
    getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 900 * scale, scale, transform: [scale, 0, 0, -scale, 0, 900 * scale] }),
    render: () => ({ promise: Promise.resolve() }), getTextContent: async () => ({ items: [] }),
  })) }
  const onVisiblePlace = vi.fn()
  const { container } = render(<PdfContinuousSurface bytes={async () => new ArrayBuffer(1)} openDocument={async () => pdf} onVisiblePlace={onVisiblePlace} />)
  await waitFor(() => expect(screen.getByRole('slider', { name: 'Original PDF position' }).getAttribute('aria-valuenow')).toBe('1'))
  const scroller = container.querySelector('.pdf-original__scroll') as HTMLElement
  const mapLines = container.querySelectorAll('.pdf-original__map-line').length
  expect(mapLines).toBe(3)
  scroller.scrollTop = 14 + 900 + 18 + 225
  fireEvent.scroll(scroller)
  await waitFor(() => expect(screen.getByRole('slider', { name: 'Original PDF position' }).getAttribute('aria-valuenow')).toBe('2'))
  expect(container.querySelector('.pdf-original__controls')).toBeNull()
  expect(onVisiblePlace).toHaveBeenCalledWith({ page: 2, frac: .25 })
  expect(container.querySelectorAll('.pdf-original__map-line')).toHaveLength(mapLines)
})

it('maps strip distances to genuine source pages and fractions, including unequal sheet heights', () => {
  expect(pdfSourcePlaceAt(0, [900, 1200, 600])).toEqual({ page: 1, frac: 0 })
  expect(pdfSourcePlaceAt(918 + 300, [900, 1200, 600])).toEqual({ page: 2, frac: .25 })
  expect(pdfSourcePlaceAt(918 + 1218 + 300, [900, 1200, 600])).toEqual({ page: 3, frac: .5 })
  expect(pdfSourcePlaceAt(10000, [900, 1200, 600])).toEqual({ page: 3, frac: 1 })
})

it('keeps exact PDF strip position and navigation without annotation dots, and omits the strip on phone', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(632)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(500)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D)
  const pdf: PdfOriginalDocument = { numPages: 3, destroy: vi.fn(async () => {}), getPage: vi.fn(async () => ({
    getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 900 * scale, scale, transform: [scale, 0, 0, -scale, 0, 900 * scale] }),
    render: () => ({ promise: Promise.resolve() }), getTextContent: async () => ({ items: [] }),
  })) }
  const onVisiblePlace = vi.fn(), onSourceActivate = vi.fn()
  const props = { onSourceActivate, bytes: async () => new ArrayBuffer(1), openDocument: async () => pdf, onVisiblePlace,
    initialPlace: { page: 2, frac: .25 }, cards: [{ id: 'answer', page: 2, rects: [[2, .1, .75, .3, .04]] }], highlights: [{ id: 'line', page: 2, rects: [[.1, .5, .3, .04]], color: 'gold' }] }
  const { container, rerender } = render(<PdfContinuousSurface {...props} />)
  const map = await screen.findByRole('slider', { name: 'Original PDF position' })
  await waitFor(() => expect(map.getAttribute('aria-valuetext')).toBe('Page 2 of 3, 25% down the page'))
  expect(map.querySelectorAll('circle')).toHaveLength(0)
  expect(Number(container.querySelector('.pdf-original__map-window')?.getAttribute('y'))).toBeCloseTo(1143 / 2736 * 600)
  const activity = screen.getByRole('button', { name: 'Explanation · Page 2' })
  expect(activity.closest('[role=slider]')).toBeNull()
  fireEvent.pointerDown(activity)
  expect(onSourceActivate).toHaveBeenCalledExactlyOnceWith({ kind: 'card', id: 'answer' })
  expect(onVisiblePlace).toHaveBeenLastCalledWith({ page: 2, frac: .75 })
  fireEvent.keyDown(screen.getByRole('button', { name: 'Highlight · Page 2' }), { key: 'Enter' })
  expect(onSourceActivate).toHaveBeenLastCalledWith({ kind: 'mark', id: 'line' })
  expect(onVisiblePlace).toHaveBeenLastCalledWith({ page: 2, frac: .5 })

  expect(container.querySelectorAll('.pdf-original__highlight')).toHaveLength(1)
  expect(container.querySelectorAll('.pdf-original__card-lines [data-card-id="answer"]')).toHaveLength(1)

  fireEvent.keyDown(map, { key: 'ArrowDown' })
  expect(onVisiblePlace).toHaveBeenLastCalledWith({ page: 3, frac: 0 })
  fireEvent.keyDown(map, { key: 'Home' })
  expect(onVisiblePlace).toHaveBeenLastCalledWith({ page: 1, frac: 0 })
  rerender(<PdfContinuousSurface {...props} phone />)
  expect(screen.queryByRole('slider', { name: 'Original PDF position' })).toBeNull()
})


it('builds minimap hairlines from real PDF glyph positions and excludes rotated or empty items', () => {
  const lines = pdfSourceLines([
    { str: 'A source line', transform: [12, 0, 0, 12, 72, 800], width: 100 },
    { str: 'continues', transform: [12, 0, 0, 12, 180, 800], width: 50 },
    { str: '', transform: [12, 0, 0, 12, 72, 700], width: 20 },
    { str: 'rotated stamp', transform: [0, 12, -12, 0, 20, 800], width: 100 },
  ], { width: 600, height: 900, scale: 1, transform: [1, 0, 0, -1, 0, 900] })
  expect(lines).toHaveLength(1)
  expect(lines[0].y).toBeCloseTo(88 / 900)
  expect(lines[0].left).toBeCloseTo(72 / 600)
  expect(lines[0].right).toBeCloseTo(230 / 600)
  expect(pdfSourceLines([], { width: 600, height: 900, scale: 1, transform: [1, 0, 0, -1, 0, 900] })).toEqual([])
})

it('handles canvas cancellation while PDF text extraction is still pending', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(632)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D)
  let rejectRender: (error: Error) => void = () => {}
  let finishText: (content: { items: [] }) => void = () => {}
  const rendering = new Promise<void>((_resolve, reject) => { rejectRender = reject })
  const text = new Promise<{ items: [] }>(resolve => { finishText = resolve })
  const cancel = vi.fn(() => rejectRender(new DOMException('Canvas cancelled during text extraction', 'RenderingCancelledException')))
  const renderPage = vi.fn(() => ({ promise: rendering, cancel }))
  const pdf: PdfOriginalDocument = { numPages: 1, destroy: vi.fn(async () => {}), getPage: vi.fn(async () => ({
    getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 900 * scale, scale, transform: [scale, 0, 0, -scale, 0, 900 * scale] }),
    render: renderPage, getTextContent: () => text,
  })) }
  const { unmount } = render(<PdfContinuousSurface bytes={async () => new ArrayBuffer(1)} openDocument={async () => pdf} onVisiblePlace={() => {}} />)
  await waitFor(() => expect(renderPage).toHaveBeenCalled())
  unmount()
  expect(cancel).toHaveBeenCalled()
  // Keep extraction unresolved for a task: the render rejection must already be handled.
  await new Promise(resolve => setTimeout(resolve, 0))
  finishText({ items: [] })
})

it('retains source text through a drag across more than two pages and releases it when selection clears', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(500)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D)
  const pdf: PdfOriginalDocument = {
    numPages: 12, destroy: vi.fn(async () => {}), getPage: vi.fn(async n => ({
      getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale, scale, transform: [scale, 0, 0, -scale, 0, 800 * scale] }),
      render: () => ({ promise: Promise.resolve() }), getTextContent: async () => ({ items: [{ str: `Source ${n}`, transform: [12, 0, 0, 12, 60, 700], width: 100 }] }),
    })), renderTextLayer: (content, layer) => { const span = document.createElement('span'); span.textContent = content.items[0].str; layer.append(span); return { promise: Promise.resolve() } },
  }
  const props = { bytes: async () => new ArrayBuffer(1), openDocument: async () => pdf, onVisiblePlace: vi.fn() }
  const { container, rerender } = render(<PdfContinuousSurface {...props} />)
  const first = await screen.findByText('Source 1')
  fireEvent.pointerDown(first)
  rerender(<PdfContinuousSurface {...props} requestedPlace={{ page: 5, frac: 0 }} />)
  const fifth = await screen.findByText('Source 5')
  expect(first.isConnected).toBe(true)
  const selection = window.getSelection()!, range = document.createRange()
  range.setStart(first.firstChild!, 0); range.setEnd(fifth.firstChild!, 6)
  selection.removeAllRanges(); selection.addRange(range)
  fireEvent(document, new Event('selectionchange')); fireEvent.pointerUp(window)
  const scroll = container.querySelector<HTMLElement>('.pdf-original__scroll')!
  const slots = [...container.querySelectorAll<HTMLElement>('.pdf-original__slot')]
  scroll.scrollTop = 14 + slots.slice(0, 9).reduce((sum, slot) => sum + parseFloat(slot.style.height) + 18, 0)
  fireEvent.scroll(scroll)
  await screen.findByText('Source 10')
  expect(first.isConnected).toBe(true)
  selection.removeAllRanges(); fireEvent(document, new Event('selectionchange'))
  await waitFor(() => expect(container.querySelector('.pdf-original__page[data-page="1"]')).toBeNull())
  expect(container.querySelectorAll('canvas')).toHaveLength(3)
})

it('publishes the complete source silhouette once, independently of virtualised page loading', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(632)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D)
  let release!: () => void
  const pending = new Promise<void>(resolve => { release = resolve })
  const pdf: PdfOriginalDocument = { numPages: 4, destroy: vi.fn(async () => {}), getPage: vi.fn(async number => ({
    getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 900 * scale, scale, transform: [scale, 0, 0, -scale, 0, 900 * scale] }),
    render: () => ({ promise: Promise.resolve() }), getTextContent: async () => {
      if (number === 4) await pending
      return { items: [100, 300, 500].map(y => ({ str: 'A source line', width: 420, transform: [12, 0, 0, 12, 80, y] })) }
    },
  })) }
  const { container, rerender } = render(<PdfContinuousSurface bytes={async () => new ArrayBuffer(1)} openDocument={async () => pdf} onVisiblePlace={() => {}} />)
  await waitFor(() => expect(pdf.getPage).toHaveBeenCalledWith(4))
  expect(container.querySelectorAll('.pdf-original__map-line')).toHaveLength(4)
  release()
  await waitFor(() => expect(container.querySelectorAll('.pdf-original__map-line')).toHaveLength(12))
  const lines = [...container.querySelectorAll('.pdf-original__map-line')].map(line => line.outerHTML)
  rerender(<PdfContinuousSurface bytes={async () => new ArrayBuffer(1)} openDocument={async () => pdf} onVisiblePlace={() => {}} requestedPlace={{ page: 4, frac: .5 }} />)
  await waitFor(() => expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('4'))
  expect([...container.querySelectorAll('.pdf-original__map-line')].map(line => line.outerHTML)).toEqual(lines)
})
