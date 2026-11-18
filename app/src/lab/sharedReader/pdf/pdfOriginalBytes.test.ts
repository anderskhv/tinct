import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { expect, it } from 'vitest'
import { openPdfOriginalBytes } from './PdfOriginalSurface'

const require = createRequire(import.meta.url)
const root = fileURLToPath(new URL('../../../../../', import.meta.url))

it('opens real generated PDF pages without transferring away the owned bytes', async () => {
  const before = console.log
  console.log = () => {}
  try {
    require(root + 'app/public/lab/addbook/vendor/pdfjs/pdf.worker.min.js')
    require(root + 'app/public/lab/addbook/vendor/pdfjs/pdf.min.js')
  } finally { console.log = before }
  const { makePdf } = await import(/* @vite-ignore */ pathToFileURL(root + 'addbooks/web/test/make-pdf.mjs').href) as { makePdf: (spec: unknown) => Buffer }
  const fixture = makePdf({ pages: [
    { lines: [{ x: 72, y: 700, text: 'Original PDF text' }] },
    { images: [{ x: 50, y: 100, w: 200, h: 200 }] },
  ] })
  const bytes = Uint8Array.from(fixture).buffer
  const pdfjs = (globalThis as unknown as { pdfjsLib: Parameters<typeof openPdfOriginalBytes>[1] }).pdfjsLib
  const pdf = await openPdfOriginalBytes(bytes, pdfjs)
  try {
    expect(pdf.numPages).toBe(2)
    expect((await (await pdf.getPage(1)).getTextContent()).items.map(item => item.str).join(' ')).toContain('Original PDF text')
    expect((await (await pdf.getPage(2)).getTextContent()).items).toHaveLength(0)
    expect(new Uint8Array(bytes).subarray(0, 4)).toEqual(new Uint8Array([37, 80, 68, 70]))
    expect(pdf.renderTextLayer).toBeTypeOf('function')
  } finally { await pdf.destroy() }
})
