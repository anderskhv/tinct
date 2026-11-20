// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { PdfSnipLayer } from './PdfSnipLayer'
import { SNIP_MIN_PX, snipCaption, snipRegion, snipSource } from './pdfOriginalSnip'
import { PdfOriginalReaderShell, type PdfOriginalReaderServices } from './PdfOriginalReaderShell'

vi.mock('../../useLabReadingYear', () => ({ useLabReadingYear: vi.fn() }))
const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect
// A page 900 x 1200 px at (50, 100); its caption line, split in two spans by pdf.js, under the figure.
function Pages({ onHost }: { onHost?: (host: HTMLElement | null) => void }) {
  useEffect(() => { onHost?.(document.querySelector<HTMLElement>('.pdf-original__scroll')) }, [])
  return <div className="pdf-original__scroll" ref={node => { if (node) node.getBoundingClientRect = () => rect(40, 90, 930, 710) }}>
    <div className="pdf-original__page" data-page="2" ref={node => { if (node) node.getBoundingClientRect = () => rect(50, 100, 900, 1200) }}>
      <div className="pdf-original__text">
        <span ref={node => { if (node) node.getBoundingClientRect = () => rect(140, 560, 80, 14) }}>Figure 2.</span>
        <span ref={node => { if (node) node.getBoundingClientRect = () => rect(225, 560, 300, 14) }}>Growth of the network.</span>
        <span ref={node => { if (node) node.getBoundingClientRect = () => rect(140, 1100, 300, 14) }}>Table 9. Far below the box.</span>
      </div>
    </div>
  </div>
}
vi.mock('./PdfContinuousSurface', () => ({
  PdfContinuousSurface: ({ onDocument, onPageText, onVisiblePlace, onScrollHost }: { onDocument: (n: number) => void; onPageText: (p: number, t: string) => void; onVisiblePlace: (p: { page: number; frac: number }) => void; onScrollHost?: (h: HTMLElement | null) => void }) => {
    useEffect(() => { onDocument(3); onPageText(2, 'A page with a figure.'); onVisiblePlace({ page: 2, frac: .2 }) }, [])
    return <Pages onHost={onScrollHost} />
  },
}))
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })

const drag = (target: Element, from: [number, number], to: [number, number]) => {
  fireEvent.pointerDown(target, { clientX: from[0], clientY: from[1], pointerId: 1 })
  fireEvent.pointerMove(target, { clientX: to[0], clientY: to[1], pointerId: 1 })
  fireEvent.pointerUp(target, { clientX: to[0], clientY: to[1], pointerId: 1 })
}

it('turns a dragged box into a page fraction, clamped to its page, and ignores a stray tap', () => {
  const page = { left: 50, top: 100, right: 950, bottom: 1300 }
  expect(snipRegion({ left: 500, top: 700, right: 140, bottom: 220 }, page)).toEqual({ x: .1, y: .1, w: .4, h: .4 })
  expect(snipRegion({ left: 0, top: 0, right: 2000, bottom: 2000 }, page)).toEqual({ x: 0, y: 0, w: 1, h: 1 })
  expect(snipRegion({ left: 300, top: 300, right: 300 + SNIP_MIN_PX - 1, bottom: 400 }, page)).toBeNull()
})

it('finds the printed caption near the box, whole line, and nothing far away or in another column', () => {
  const region = { x: .1, y: .1, w: .4, h: .25 }
  const lines = [
    { x: .1, y: .38, w: .09, h: .012, text: 'Figure 2.' }, { x: .2, y: .38, w: .3, h: .012, text: 'Growth of the network.' },
    { x: .6, y: .2, w: .3, h: .012, text: 'Figure 7. Another column.' }, { x: .1, y: .9, w: .3, h: .012, text: 'Table 9. Far below.' },
  ]
  expect(snipCaption(lines, region)).toBe('Figure 2. Growth of the network.')
  expect(snipCaption(lines.slice(2), region)).toBe('')
  expect(snipCaption([{ x: .1, y: .2, w: .3, h: .012, text: 'An axis label' }], region)).toBe('')
})

it('builds a figure source whose picture is redrawn from the PDF for exactly that box', async () => {
  const capture = vi.fn(async () => null)
  const source = snipSource(2, { x: .1, y: .1, w: .4, h: .25 }, '', capture)
  expect(source).toMatchObject({ page: 2, text: 'Figure on page 2', rects: [[2, .1, .1, .4, .25]], region: { kind: 'figure', label: '', caption: '' } })
  await source.region!.image()
  expect(capture).toHaveBeenCalledWith(2, { x: .1, y: .1, w: .4, h: .25 })
})

it('picks the box on the page under the pointer with its caption; Escape and Cancel end it', () => {
  const pick = vi.fn(), cancel = vi.fn()
  render(<Pages />)
  const host = document.querySelector<HTMLElement>('.pdf-original__scroll')!
  const { unmount } = render(<PdfSnipLayer host={host} onPick={pick} onCancel={cancel} />)
  const layer = screen.getByTestId('pdf-snip-layer')
  drag(layer, [140, 220], [146, 300])
  expect(pick).not.toHaveBeenCalled()
  drag(layer, [140, 220], [500, 520])
  expect(pick).toHaveBeenCalledWith({ page: 2, region: { x: .1, y: .1, w: .4, h: .25 }, caption: 'Figure 2. Growth of the network.' })
  fireEvent.keyDown(window, { key: 'Escape' })
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(cancel).toHaveBeenCalledTimes(2)
  unmount()
})

it('Explain a figure from the menu explains the dragged box as a figure and saves a figure card', async () => {
  const cards: PdfOriginalReaderServices['cards'] = []
  const ask = vi.fn(async (_selection: Parameters<PdfOriginalReaderServices['ask']>[0], _intent: string) => 'The chart shows growth.')
  const saveCard = vi.fn((_selection: Parameters<PdfOriginalReaderServices['saveCard']>[0], _kind: string, _answer: string, _options?: Parameters<PdfOriginalReaderServices['saveCard']>[3]) => true)
  const captureRegion = vi.fn(async () => null)
  const services: PdfOriginalReaderServices = { marks: [], cards, saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true), removeMark: vi.fn(() => null), removeCard: vi.fn(() => null), ask, saveCard, captureRegion }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByText('Explain a figure'))
  drag(await screen.findByTestId('pdf-snip-layer'), [140, 220], [500, 520])
  await screen.findByText('The chart shows growth.')
  expect(screen.queryByTestId('pdf-snip-layer')).toBeNull()
  const [source, intent] = ask.mock.calls[0]
  expect(intent).toBe('explain')
  expect(source).toMatchObject({ page: 2, text: 'Figure 2. Growth of the network.', rects: [[2, .1, .1, .4, .25]], region: { kind: 'figure', caption: 'Figure 2. Growth of the network.' } })
  await source.region!.image()
  expect(captureRegion).toHaveBeenCalledWith(2, { x: .1, y: .1, w: .4, h: .25 })
  expect(saveCard.mock.calls[0][1]).toBe('figure')
  expect(saveCard.mock.calls[0][3]).toMatchObject({ question: 'Explain this figure.', data: { region: 'figure' } })
})

it('offers Explain a figure only where a figure can be redrawn', () => {
  const services: PdfOriginalReaderServices = { marks: [], cards: [], saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true), removeMark: vi.fn(() => null), removeCard: vi.fn(() => null), ask: vi.fn(async () => null), saveCard: vi.fn(() => true) }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByTestId('lab-super'))
  expect(screen.queryByText('Explain a figure')).toBeNull()
})
