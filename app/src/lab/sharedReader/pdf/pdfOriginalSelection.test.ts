// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { markPdfTextFurniture, pdfFurnitureIndexes } from './pdfOriginalSelection'
import type { PdfOriginalPage } from './PdfOriginalSurface'
const view = { width: 600, height: 800, transform: [1, 0, 0, -1, 0, 800] } as ReturnType<PdfOriginalPage['getViewport']>
const item = (str: string, top: number, size = 12, shear = 0) => ({ str, transform: [size, 0, shear, size, 50, 800 - top], width: 100, height: size })
it('preserves a large source title while excluding a small isolated running head and folio', () => {
  const items = [item('Running head', 25, 9), item('Chapter One', 90, 20), ...[160, 177, 194, 211, 228].map(y => item('Body text', y)), item('12', 775, 9)]
  const furniture = pdfFurnitureIndexes(items, view)
  expect(furniture.has(0)).toBe(true)
  expect(furniture.has(1)).toBe(false)
  expect(furniture.has(7)).toBe(true)
  expect([...furniture]).toEqual([0, 7])
})
it('does not confuse horizontal italic shear with rotated side text', () => {
  const layer = document.createElement('div')
  layer.innerHTML = '<span>Italic body</span><span>Side annotation</span>'
  const italic = item('Italic body', 200, 12, 3)
  const side = { ...item('Side annotation', 200), transform: [0, 12, -12, 0, 25, 600] }
  markPdfTextFurniture(layer, [italic, side], view)
  expect(layer.children[0].hasAttribute('data-pdf-side')).toBe(false)
  expect(layer.children[1].getAttribute('data-pdf-side')).toBe('true')
})

it('keeps whole words and honest per-page fragments across a native range while omitting running furniture', async () => {
  const { readPdfOriginalSelection } = await import('./pdfOriginalSelection')
  const root = document.createElement('div')
  root.innerHTML = '<div class="pdf-original__page" data-page="1"><div class="pdf-original__text"><span>Beginning words</span><span data-pdf-furniture="true">Running head</span></div></div><div class="pdf-original__page" data-page="2"><div class="pdf-original__text"><span>Finishing words</span></div></div>'
  document.body.append(root)
  const box = { left: 0, top: 0, right: 600, bottom: 800, width: 600, height: 800 } as DOMRect
  root.querySelectorAll<HTMLElement>('.pdf-original__text,span').forEach(node => { node.getBoundingClientRect = () => box })
  const prior = Object.getOwnPropertyDescriptor(Range.prototype, 'getClientRects')
  Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: () => [{ left: 60, top: 80, right: 180, bottom: 92, width: 120, height: 12 }] })
  try {
    const spans = root.querySelectorAll('span'), native = document.createRange()
    native.setStart(spans[0].firstChild!, 3); native.setEnd(spans[2].firstChild!, 5)
    const selection = window.getSelection()!; selection.removeAllRanges(); selection.addRange(native)
    const result = readPdfOriginalSelection(root, selection)
    expect(result?.text).toBe('Beginning words Finishing')
    expect(result?.pages).toEqual([{ n: 1, text: 'Beginning words' }, { n: 2, text: 'Finishing' }])
    expect(result?.rects.map(rect => rect[0])).toEqual([1, 2])
    selection.removeAllRanges()
  } finally {
    root.remove()
    if (prior) Object.defineProperty(Range.prototype, 'getClientRects', prior)
    else delete (Range.prototype as Partial<Range>).getClientRects
  }
})
