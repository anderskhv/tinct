// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PdfOriginalSurface, pdfOriginalFollowRect, pdfOriginalOutline, pdfPageFraction, projectPdfSelection, visiblePdfHighlightRects, type PdfOriginalDocument, type PdfOriginalPage } from './PdfOriginalSurface'

afterEach(() => { cleanup(); vi.restoreAllMocks() })

const viewport = (scale: number) => ({ width: 600 * scale, height: 900 * scale, scale, transform: [scale, 0, 0, -scale, 0, 900 * scale] })
const makePage = (text: string): PdfOriginalPage => ({
  getViewport: ({ scale }) => viewport(scale),
  render: () => ({ promise: Promise.resolve(), cancel: vi.fn() }),
  getTextContent: async () => ({ items: text ? [{ str: text, transform: [12, 0, 0, 12, 72, 800], width: 60 }] : [] }),
})

it('renders bounded original pages, restores page and fractional place, and keeps scan pages visible', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(624)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D)
  const documentPdf: PdfOriginalDocument = {
    numPages: 3,
    getPage: vi.fn(async n => makePage(n === 2 ? 'Printed words' : '')),
    destroy: vi.fn(async () => {}),
    renderTextLayer: vi.fn((content, layer) => {
      for (const item of content.items) { const span = document.createElement('span'); span.textContent = item.str; layer.append(span) }
      return { promise: Promise.resolve() }
    }),
  }
  const onVisiblePlace = vi.fn()
  const onPageText = vi.fn()
  const bytes = vi.fn(async () => new Uint8Array([1, 2]).buffer)
  const onDocument = vi.fn()
  const { container, rerender, unmount } = render(<PdfOriginalSurface bytes={bytes} openDocument={async () => documentPdf} initialPlace={{ page: 2, frac: .25 }} onVisiblePlace={onVisiblePlace} onDocument={onDocument} onPageText={onPageText} />)
  await waitFor(() => expect(onVisiblePlace).toHaveBeenCalledWith({ page: 2, frac: .25 }))
  expect(onDocument).toHaveBeenCalledWith(3)
  expect(screen.getByText('Printed words')).toBeTruthy()
  expect(onPageText).toHaveBeenCalledWith(2, 'Printed words')
  expect(container.querySelectorAll('canvas')).toHaveLength(1)
  expect(container.querySelector('.pdf-original__scroll')?.scrollTop).toBe(225)
  rerender(<PdfOriginalSurface bytes={() => bytes()} openDocument={async () => documentPdf} onVisiblePlace={onVisiblePlace} onDocument={() => {}} onPageText={onPageText} />)
  expect(bytes).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByRole('button', { name: 'Next PDF page' }))
  await waitFor(() => expect(screen.getByText('Page 3 of 3')).toBeTruthy())
  await waitFor(() => expect(documentPdf.getPage).toHaveBeenCalledWith(3))
  expect(container.querySelectorAll('canvas')).toHaveLength(1)
  await waitFor(() => expect(onVisiblePlace).toHaveBeenCalledWith({ page: 3, frac: 0 }))
  expect(container.querySelector('.pdf-original__text')?.children.length).toBe(0)
  await waitFor(() => expect(onPageText).toHaveBeenCalledWith(3, ''))
  expect(screen.getByRole('button', { name: 'Next PDF page' }).hasAttribute('disabled')).toBe(true)
  rerender(<PdfOriginalSurface bytes={() => bytes()} openDocument={async () => documentPdf} requestedPlace={{ page: 2, frac: .5 }} onVisiblePlace={onVisiblePlace} onPageText={onPageText} />)
  await waitFor(() => expect(onVisiblePlace).toHaveBeenCalledWith({ page: 2, frac: .5 }))
  expect(bytes).toHaveBeenCalledTimes(1)
  rerender(<PdfOriginalSurface bytes={() => bytes()} openDocument={async () => documentPdf} requestedPlace={{ page: 2, frac: .3 }} onVisiblePlace={onVisiblePlace} onPageText={onPageText} />)
  await waitFor(() => expect(onVisiblePlace).toHaveBeenCalledWith({ page: 2, frac: .3 }))
  fireEvent.click(screen.getByRole('button', { name: 'Next PDF page' }))
  await waitFor(() => expect(onVisiblePlace).toHaveBeenCalledWith({ page: 3, frac: 0 }))
  onVisiblePlace.mockClear()
  rerender(<PdfOriginalSurface bytes={() => bytes()} openDocument={async () => documentPdf} requestedPlace={{ page: 2, frac: .3 }} onVisiblePlace={onVisiblePlace} onPageText={onPageText} />)
  await waitFor(() => expect(onVisiblePlace).toHaveBeenCalledWith({ page: 2, frac: .3 }))
  expect(bytes).toHaveBeenCalledTimes(1)
  unmount()
  expect(documentPdf.destroy).toHaveBeenCalledTimes(1)
})

it('projects actual selection rectangles into zoom-independent page fractions', () => {
  const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height }) as DOMRect
  const rects = projectPdfSelection(4, rect(100, 200, 400, 800), [rect(200, 400, 100, 20), rect(490, 980, 80, 40)])
  expect(rects[0].slice(0, 4)).toEqual([4, .25, .25, .25])
  expect(rects[0][4]).toBeCloseTo(.025)
  expect(rects[1].slice(0, 3)).toEqual([4, .975, .975])
  expect(rects[1][3]).toBeCloseTo(.025)
  expect(rects[1][4]).toBeCloseTo(.025)
  expect(projectPdfSelection(0, rect(0, 0, 100, 100), [rect(10, 10, 20, 20)])).toEqual([])
  expect(pdfPageFraction(450, 900)).toBe(.5)
  expect(pdfPageFraction(5000, 900)).toBe(1)
})

it('paints only the current page’s valid saved rectangles over the original canvas', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(624)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D)
  const documentPdf: PdfOriginalDocument = { numPages: 2, getPage: async () => makePage('Selectable original'), destroy: async () => {} }
  const highlights = [
    { id: 'a', page: 1, color: 'sage', rects: [[.2, .3, .25, .04]] },
    { id: 'b', page: 2, color: 'rose', rects: [[.9, .95, .3, .2]] },
  ]
  const { container } = render(<PdfOriginalSurface bytes={async () => new Uint8Array([1]).buffer} openDocument={async () => documentPdf} onVisiblePlace={() => {}} highlights={highlights} />)
  await waitFor(() => expect(screen.getByText('Selectable original')).toBeTruthy())
  let overlay = container.querySelector('.pdf-original__highlights')!
  expect(overlay.getAttribute('aria-hidden')).toBe('true')
  expect(overlay.parentElement?.firstElementChild?.tagName).toBe('CANVAS')
  expect(overlay.nextElementSibling?.className).toBe('pdf-original__text')
  expect(overlay.children).toHaveLength(1)
  expect((overlay.firstElementChild as HTMLElement).style.left).toBe('20%')
  expect((overlay.firstElementChild as HTMLElement).style.top).toBe('30%')
  expect((overlay.firstElementChild as HTMLElement).style.width).toBe('25%')
  fireEvent.click(screen.getByRole('button', { name: 'Next PDF page' }))
  await waitFor(() => expect(screen.getByText('Page 2 of 2')).toBeTruthy())
  overlay = container.querySelector('.pdf-original__highlights')!
  expect(overlay.children).toHaveLength(1)
  expect((overlay.firstElementChild as HTMLElement).style.left).toBe('90%')
  expect(parseFloat((overlay.firstElementChild as HTMLElement).style.width)).toBeCloseTo(10)
  expect(parseFloat((overlay.firstElementChild as HTMLElement).style.height)).toBeCloseTo(5)
  expect(visiblePdfHighlightRects([{ id: 'invalid', page: 2, color: 'gold', rects: [[NaN, 0, .3, .1], [1.1, 0, .2, .1], [0, 0, -.1, .1]] }], 2)).toEqual([])
})

it('invalidates the old page text selection before the next page has rendered', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(624)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D)
  let resolveNext!: (page: PdfOriginalPage) => void
  const nextPage = new Promise<PdfOriginalPage>(resolve => { resolveNext = resolve })
  const documentPdf: PdfOriginalDocument = { numPages: 2, getPage: vi.fn(n => n === 1 ? Promise.resolve(makePage('Old page words')) : nextPage), destroy: async () => {} }
  const onSelection = vi.fn()
  const { container } = render(<PdfOriginalSurface bytes={async () => new Uint8Array([1]).buffer} openDocument={async () => documentPdf} onVisiblePlace={() => {}} onSelection={onSelection} />)
  const oldText = await screen.findByText('Old page words')
  const layer = container.querySelector('.pdf-original__text')!
  const range = document.createRange()
  range.selectNodeContents(oldText)
  window.getSelection()?.addRange(range)
  fireEvent.click(screen.getByRole('button', { name: 'Next PDF page' }))
  expect(screen.getByText('Page 2 of 2')).toBeTruthy()
  expect(layer.childElementCount).toBe(0)
  expect(window.getSelection()?.isCollapsed).toBe(true)
  fireEvent.mouseUp(layer)
  expect(onSelection).not.toHaveBeenCalled()
  resolveNext(makePage('New page words'))
  await screen.findByText('New page words')
})

it('reports page completion only after the rendered page reaches its visible end', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(624)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400)
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(900)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D)
  let releaseNext!: (page: PdfOriginalPage) => void
  const delayed = new Promise<PdfOriginalPage>(resolve => { releaseNext = resolve })
  const pdf: PdfOriginalDocument = { numPages: 2, getPage: n => n === 1 ? Promise.resolve(makePage('Page one')) : delayed, destroy: async () => {} }
  const onPageEnd = vi.fn()
  const { container, rerender } = render(<PdfOriginalSurface bytes={async () => new Uint8Array([1]).buffer}
    openDocument={async () => pdf} onVisiblePlace={() => {}} onPageEnd={onPageEnd} />)
  await screen.findByText('Page one')
  await waitFor(() => expect(onPageEnd).toHaveBeenLastCalledWith(1, false))
  const scroll = container.querySelector('.pdf-original__scroll') as HTMLElement
  scroll.scrollTop = 497
  fireEvent.scroll(scroll)
  expect(onPageEnd).toHaveBeenLastCalledWith(1, false)
  scroll.scrollTop = 498
  fireEvent.scroll(scroll)
  expect(onPageEnd).toHaveBeenLastCalledWith(1, true)
  fireEvent.click(screen.getByRole('button', { name: 'Next PDF page' }))
  expect(onPageEnd).toHaveBeenLastCalledWith(2, false)
  releaseNext(makePage('Page two'))
  await screen.findByText('Page two')
  expect(onPageEnd).toHaveBeenLastCalledWith(2, false)
  rerender(<PdfOriginalSurface bytes={async () => new Uint8Array([1]).buffer} openDocument={async () => pdf}
    requestedPlace={{ page: 2, frac: .8 }} onVisiblePlace={() => {}} onPageEnd={onPageEnd} />)
  await waitFor(() => expect(onPageEnd).toHaveBeenLastCalledWith(2, true))
})

it('resolves actual outline destinations once into bounded page entries without inventing page numbers', async () => {
  const documentPdf: PdfOriginalDocument = { numPages: 5, getPage: async () => makePage('Printed words'), destroy: async () => {},
    getOutline: vi.fn(async () => [{ title: 'Introduction', dest: 'intro', items: [{ title: 'Section', dest: [{ num: 2, gen: 0 }], items: [] }] },
      { title: 'Unresolved', dest: 'missing', items: [] }]),
    getDestination: async name => name === 'intro' ? [0] : null,
    getPageIndex: async () => 3 }
  expect(await pdfOriginalOutline(documentPdf)).toEqual([
    { title: 'Introduction', page: 1, items: [{ title: 'Section', page: 4, items: [] }] },
    { title: 'Unresolved', page: null, items: [] },
  ])
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(624)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ setTransform: vi.fn() } as unknown as CanvasRenderingContext2D)
  const outline = vi.fn()
  render(<PdfOriginalSurface bytes={async () => new Uint8Array([1]).buffer} openDocument={async () => documentPdf}
    onVisiblePlace={() => {}} onOutline={outline} />)
  await waitFor(() => expect(outline).toHaveBeenCalledWith([
    { title: 'Introduction', page: 1, items: [{ title: 'Section', page: 4, items: [] }] },
    { title: 'Unresolved', page: null, items: [] },
  ]))
  expect(documentPdf.getOutline).toHaveBeenCalledTimes(2) // direct resolver and mounted surface
})

it('paints a heard word only when narration text exactly matches the rendered PDF extraction', () => {
  const layer = document.createElement('div')
  layer.innerHTML = '<span>First word</span><span>and second</span>'
  vi.spyOn(layer, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, right: 400, bottom: 800, width: 400, height: 800 } as DOMRect)
  const bounds = vi.fn(() => ({ left: 80, top: 160, right: 120, bottom: 180, width: 40, height: 20 } as DOMRect))
  const original = Object.getOwnPropertyDescriptor(Range.prototype, 'getBoundingClientRect')
  Object.defineProperty(Range.prototype, 'getBoundingClientRect', { configurable: true, value: bounds })
  const items = [{ str: 'First word', transform: [1, 0, 0, 1, 0, 0], width: 100 },
    { str: 'and second', transform: [1, 0, 0, 1, 0, 0], width: 100 }]
  const rect = pdfOriginalFollowRect(layer, items, { page: 3, wordIndex: 1, text: 'First word and second' }, 3)
  expect(rect?.slice(0, 3)).toEqual([3, .2, .2])
  expect(rect?.[3]).toBeCloseTo(.1)
  expect(rect?.[4]).toBeCloseTo(.025)
  expect(bounds).toHaveBeenCalledTimes(1)
  expect(pdfOriginalFollowRect(layer, items, { page: 3, wordIndex: 1, text: 'Other text' }, 3)).toBeNull()
  expect(pdfOriginalFollowRect(layer, items, { page: 4, wordIndex: 1, text: 'First word and second' }, 3)).toBeNull()
  layer.lastElementChild!.textContent = 'wrong glyphs'
  expect(pdfOriginalFollowRect(layer, items, { page: 3, wordIndex: 3, text: 'First word and second' }, 3)).toBeNull()
  if (original) Object.defineProperty(Range.prototype, 'getBoundingClientRect', original)
  else Reflect.deleteProperty(Range.prototype, 'getBoundingClientRect')
})
