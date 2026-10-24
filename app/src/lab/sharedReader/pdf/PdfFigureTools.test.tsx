// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PdfFigureTools, PdfFigureCardImage } from './PdfFigureTools'
import type { PdfOriginalDocument, PdfOriginalSelection } from './PdfOriginalSurface'
const fixture = vi.hoisted(() => ({ region: { kind: 'figure' as const, x: .2, y: .3, w: .4, h: .2, label: 'Figure 1', caption: 'Figure 1. A fixture diagram.' }, image: { src: 'data:image/png;base64,aW1hZ2U=', block: { type: 'image' as const, source: { type: 'base64' as const, media_type: 'image/png', data: 'aW1hZ2U=' } } } }))
vi.mock('./pdfOriginalFigures', () => ({ detectPdfFigures: vi.fn(async () => [fixture.region]), capturePdfRegion: vi.fn(async () => fixture.image) }))
afterEach(cleanup)
it('keeps figure controls source-owned and sends an actual crop capability with Ask, Explain and Highlight', async () => {
  const pdf = { getPage: async () => ({ getViewport: () => ({ width: 600, height: 800, scale: 1, transform: [1, 0, 0, -1, 0, 800] }) }) } as unknown as PdfOriginalDocument
  const action = vi.fn(), canvas = document.createElement('canvas')
  const { container } = render(<div className="pdf-original__scroll"><div className="pdf-original__page"><PdfFigureTools pdf={pdf} page={4} canvas={canvas} items={[]} ready onAction={action} /></div></div>)
  const source = await screen.findByRole('button', { name: 'View Figure 1 on page 4' })
  expect(source.style.left).toBe('20%'); expect(source.style.top).toBe('30%')
  const viewport = container.firstElementChild as HTMLElement
  viewport.getBoundingClientRect = () => ({ left: 0, right: 800, top: 0, bottom: 600, width: 800, height: 600 } as DOMRect)
  source.getBoundingClientRect = () => ({ left: 120, right: 150, top: 100, bottom: 130, width: 30, height: 30 } as DOMRect)
  source.focus(); fireEvent.scroll(viewport)
  expect(screen.getByRole('toolbar', { name: 'Figure 1 actions' })).toBeTruthy()
  for (const name of ['Ask', 'Explain', 'Highlight']) {
    fireEvent.focus(source)
    fireEvent.click(screen.getByRole('button', { name }))
    expect(action.mock.lastCall?.[0]).toBe(name.toLowerCase())
    const selection = action.mock.lastCall?.[1]
    expect(selection).toMatchObject({ page: 4, rects: [[4, .2, .3, .4, .2]], region: { label: 'Figure 1' } })
    expect(await selection.region.image()).toEqual(fixture.image)
  }
  const scroll = container.firstElementChild as HTMLElement; scroll.scrollTop = 123
  source.focus(); fireEvent.click(source)
  expect(await screen.findByRole('dialog', { name: 'Figure 1' })).toBeTruthy()
  expect(scroll.scrollTop).toBe(123)
  const close = screen.getByRole('button', { name: 'Close figure' })
  fireEvent.keyDown(window, { key: 'Tab' }); expect(document.activeElement).toBe(close)
  fireEvent.keyDown(window, { key: 'Tab', shiftKey: true }); expect(document.activeElement).toBe(close)
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(document.activeElement).toBe(source)
})

it('keeps a saved thumbnail capture stable across reconstructed source objects and traps its modal focus', async () => {
  const identity = {}, image = vi.fn(async () => fixture.image)
  const source: PdfOriginalSelection = { page: 4, text: fixture.region.caption, rects: [[4, .2, .3, .4, .2]], region: { kind: 'figure', label: 'Figure 1', caption: fixture.region.caption, identity, image } }
  const { rerender } = render(<PdfFigureCardImage source={source} />)
  const thumb = await screen.findByRole('button', { name: 'Show Figure 1 larger' })
  const replacement = vi.fn(async () => fixture.image)
  rerender(<PdfFigureCardImage source={{ ...source, region: { ...source.region!, image: replacement } }} />)
  expect(image).toHaveBeenCalledOnce(); expect(replacement).not.toHaveBeenCalled()
  thumb.focus(); fireEvent.click(thumb)
  const close = screen.getByRole('button', { name: 'Close figure' })
  fireEvent.keyDown(window, { key: 'Tab' }); expect(document.activeElement).toBe(close)
  fireEvent.keyDown(window, { key: 'Tab', shiftKey: true }); expect(document.activeElement).toBe(close)
  fireEvent.keyDown(window, { key: 'Escape' }); expect(document.activeElement).toBe(thumb)
})
