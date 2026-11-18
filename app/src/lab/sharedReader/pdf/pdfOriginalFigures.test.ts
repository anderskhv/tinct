// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { capturePdfRegion, detectPdfFigures } from './pdfOriginalFigures'
import type { PdfOriginalDocument } from './PdfOriginalSurface'
const engine = vi.hoisted(() => ({ margin: { findFigures: vi.fn() }, regions: { find: vi.fn((_input: unknown) => [{ kind: 'figure', x: .2, y: .3, w: .4, h: .2 }]) } }))
vi.mock('../../userBook/pdfEdition', () => ({ loadPdfEngine: async () => engine }))
afterEach(() => vi.restoreAllMocks())
it('uses complete source text and the established ink detector, independent of theme filters', async () => {
  const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 800; canvas.style.filter = 'invert(1)'
  const data = new Uint8ClampedArray(240 * 320 * 4).fill(255); data[0] = data[1] = data[2] = 0
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillRect: vi.fn(), drawImage: vi.fn(), getImageData: () => ({ data }) } as unknown as CanvasRenderingContext2D)
  const regions = await detectPdfFigures(canvas, [{ str: 'Figure 1. Diagram', transform: [12, 0, 0, 12, 60, 400], width: 160 }], { width: 600, height: 800, scale: 1, transform: [1, 0, 0, -1, 0, 800] })
  expect(regions).toHaveLength(1)
  const input = engine.regions.find.mock.calls[0][0] as unknown as { ink: Uint8Array; spans: Array<{ text: string }> }
  expect(input.ink[0]).toBe(1); expect(input.ink[1]).toBe(0)
  expect(input.spans[0].text).toBe('Figure 1. Diagram')
})
it('redraws an original region within the image size limit and rejects invalid source geometry', async () => {
  const context = { fillRect: vi.fn(), drawImage: vi.fn() } as unknown as CanvasRenderingContext2D
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(new Blob(['fixture'], { type: 'image/png' })))
  const draw = vi.fn((_options: unknown) => ({ promise: Promise.resolve() }))
  const pdf = { getPage: async () => ({ getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale, scale, transform: [scale, 0, 0, -scale, 0, 800 * scale] }), render: draw }) } as unknown as PdfOriginalDocument
  const image = await capturePdfRegion(pdf, 2, { x: .2, y: .3, w: .4, h: .2 })
  expect(image?.block.source.media_type).toBe('image/png')
  expect(draw).toHaveBeenCalledOnce()
  const view = draw.mock.calls[0][0] as unknown as { viewport: { width: number; height: number } }
  expect(Math.max(view.viewport.width * .4, view.viewport.height * .2)).toBeLessThanOrEqual(1568)
  expect(await capturePdfRegion(pdf, 2, { x: -.1, y: .3, w: .4, h: .2 })).toBeNull()
  expect(draw).toHaveBeenCalledOnce()
})
