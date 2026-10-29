import { createRequire } from 'node:module'
import { beforeAll, expect, it } from 'vitest'
const require = createRequire(import.meta.url)
let rows: (items: unknown[]) => Array<{ text: string; x: number; y: number }>
beforeAll(() => {
  require('../../../public/lab/addbook/js/pdf-scan.js')
  rows = (globalThis as unknown as { TinctPdfScan: { textRows: typeof rows } }).TinctPdfScan.textRows
})
const item = (str: string, x: number, y: number, width: number) => ({ str, transform: [9.1, 0, 0, 9.1, x, y], width, fontName: 'body' })
const line = (y: number, slope: number, words: string[]) => [386, 421, 476, 495, 538, 595, 613].map((x, i) => item(words[i], x, y + (x - 386) * slope, [27, 46, 12, 35, 49, 11, 32][i]))
it('reassembles a shallow scanned baseline without interleaving its right fragment before its left', () => {
  const input = [item('Other column first line', 95, 348.447, 240), item('Other column second line', 95, 336.567, 240),
    ...line(344.881, .01, ['These', 'sentences', 'are', 'arranged', 'carefully', 'in', 'order']),
    ...line(333, .008, ['Other', 'sentences', 'can', 'remain', 'separate', 'as', 'well'])]
  expect(rows(input).filter(r => r.x > 375).map(r => r.text)).toEqual(['These sentences are arranged carefully in order', 'Other sentences can remain separate as well'])
})
it('does not combine adjacent lines, distant columns, or raised annotations', () => {
  const input = [...line(344, 0, ['These', 'sentences', 'are', 'arranged', 'carefully', 'in', 'order']),
    ...line(332, 0, ['Other', 'sentences', 'can', 'remain', 'separate', 'as', 'well']),
    item('Separate distant column', 720, 344, 150), item('Raised annotation', 655, 350, 45)]
  expect(rows(input).map(r => r.text)).toEqual(['Raised annotation', 'These sentences are arranged carefully in order', 'Separate distant column', 'Other sentences can remain separate as well'])
})
