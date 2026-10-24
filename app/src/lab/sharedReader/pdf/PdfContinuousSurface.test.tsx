// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PdfContinuousSurface, pdfBaseSheetWidth, pdfZoomLimit } from './PdfContinuousSurface'
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
  await waitFor(() => expect(screen.getByText('Page 1 of 3')).toBeTruthy())
  const scroller = container.querySelector('.pdf-original__scroll') as HTMLElement
  scroller.scrollTop = 14 + 900 + 18 + 225
  fireEvent.scroll(scroller)
  expect(screen.getByText('Page 2 of 3')).toBeTruthy()
  expect(onVisiblePlace).toHaveBeenCalledWith({ page: 2, frac: .25 })
})
