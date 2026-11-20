import { createRequire } from 'node:module'
import { expect, it } from 'vitest'
const require = createRequire(import.meta.url)
require('../../../public/lab/addbook/js/pdf-regions.js')
const regions = (globalThis as any).TinctPdfRegions
it('keeps a captioned plot’s ticks separate from the equation in the neighbouring column', () => {
  const body = [
    { x: 50, base: 100, w: 300, size: 10, str: 'A sentence introducing the mathematics.' },
    { x: 50, base: 200, w: 90, size: 10, str: 'or, equivalently,' },
    { x: 190, base: 200, w: 90, size: 10, str: 'y = x + 1' },
    { x: 380, base: 200, w: 20, size: 10, str: '(1)' },
    { x: 450, base: 195, w: 8, size: 8, str: '0.8' },
    { x: 450, base: 215, w: 8, size: 8, str: '0.6' },
    { x: 450, base: 235, w: 8, size: 8, str: '0.4' },
    { x: 420, base: 280, w: 100, size: 10, str: 'Figure 1. A graph.' },
    { x: 50, base: 340, w: 300, size: 10, str: 'A sentence following the mathematics.' },
  ]
  const picture = { x: .7, y: .2, w: .2, h: .12, label: 'Figure 1' }
  const calls: any[] = []
  const margin = { findFigures: (input: any) => { calls.push(input); return { figures: [picture], captions: [{ fig: 0, label: 'Figure 1', text: 'A graph.', box: { x: .7, y: .34, w: .2, h: .02 } }] } } }
  const result = regions.find({ captionColumns: true, body, vp: { width: 600, height: 800 }, ink: new Uint8Array(240 * 320), W: 240, H: 320, spans: [] }, margin)
  const equations = result.filter((r: any) => r.kind === 'equation')
  expect(equations.length).toBeGreaterThan(0)
  expect(equations.every((r: any) => r.x > .25 && r.x + r.w < .7)).toBe(true)
  expect(calls.at(-1).formulas.every((r: any) => r.x + r.w < .7)).toBe(true)
  expect(result.find((r: any) => r.label === 'Figure 1').x).toBeGreaterThan(.69)
})
