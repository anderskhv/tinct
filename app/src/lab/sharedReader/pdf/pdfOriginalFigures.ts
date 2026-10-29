import { loadPdfEngine, type PdfRegion } from '../../userBook/pdfEdition'
import type { LabImageBlock } from '../../labFigureImage'
import type { PdfOriginalDocument, PdfOriginalPage } from './PdfOriginalSurface'
export type PdfFigureRegion = PdfRegion
export type PdfRegionImage = { src: string; block: LabImageBlock }
export type PdfRegionCapture = (page: number, region: Pick<PdfRegion, 'x' | 'y' | 'w' | 'h'>) => Promise<PdfRegionImage | null>
const matrix = (a: number[], b: number[]) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]]
/** Same raster/text input and established region rules as the final original-PDF reader. */
export async function detectPdfFigures(canvas: HTMLCanvasElement, items: Awaited<ReturnType<PdfOriginalPage['getTextContent']>>['items'], view: ReturnType<PdfOriginalPage['getViewport']>): Promise<PdfRegion[]> {
  const engine = await loadPdfEngine()
  if (!engine.regions?.find || !engine.margin || !canvas.width || !canvas.height) return []
  const W = 240, H = Math.max(1, Math.round(W * canvas.height / canvas.width)), small = document.createElement('canvas')
  small.width = W; small.height = H
  const context = small.getContext('2d', { willReadFrequently: true })
  if (!context) return []
  try {
    context.fillStyle = '#fff'; context.fillRect(0, 0, W, H); context.drawImage(canvas, 0, 0, W, H)
    const data = context.getImageData(0, 0, W, H).data, ink = new Uint8Array(W * H)
    for (let i = 0; i < ink.length; i++) ink[i] = data[i * 4] * .3 + data[i * 4 + 1] * .59 + data[i * 4 + 2] * .11 < 247 ? 1 : 0
    const spans: Array<{ x: number; y: number; w: number; h: number; text: string }> = [], body: Array<{ x: number; base: number; size: number; w: number; str: string }> = []
    for (const item of items) {
      if (!item.str.trim()) continue
      const tx = matrix(view.transform, item.transform), size = Math.hypot(tx[2], tx[3])
      if (size < .5) continue
      spans.push({ x: tx[4] / view.width, y: (tx[5] - size * .86) / view.height, w: item.width * view.scale / view.width, h: size * 1.1 / view.height, text: item.str })
      body.push({ x: tx[4], base: tx[5], size, w: item.width * view.scale, str: item.str })
    }
    return engine.regions.find({ ink, W, H, spans, body, vp: view, captionColumns: true }, engine.margin)
  } finally { small.width = small.height = 0 }
}
/** A fresh raw drawing, independent of theme filters and virtual-page mounting. Never persisted. */
export async function capturePdfRegion(pdf: PdfOriginalDocument, pageNumber: number, region: Parameters<PdfRegionCapture>[1]): Promise<PdfRegionImage | null> {
  if (![region.x, region.y, region.w, region.h].every(Number.isFinite) || region.x < 0 || region.y < 0 || region.w <= 0 || region.h <= 0 || region.x + region.w > 1.01 || region.y + region.h > 1.01) return null
  const page = await pdf.getPage(pageNumber), base = page.getViewport({ scale: 1 })
  const scale = Math.min(1568 / Math.max(region.w * base.width, region.h * base.height), Math.sqrt(12e6 / (base.width * base.height)))
  const view = page.getViewport({ scale }), raw = document.createElement('canvas'), crop = document.createElement('canvas')
  raw.width = Math.ceil(view.width); raw.height = Math.ceil(view.height)
  crop.width = Math.max(1, Math.round(region.w * raw.width)); crop.height = Math.max(1, Math.round(region.h * raw.height))
  const context = raw.getContext('2d'), cg = crop.getContext('2d')
  if (!context || !cg) return null
  try {
    context.fillStyle = '#fff'; context.fillRect(0, 0, raw.width, raw.height)
    await page.render({ canvasContext: context, viewport: view }).promise
    cg.fillStyle = '#fff'; cg.fillRect(0, 0, crop.width, crop.height)
    cg.drawImage(raw, region.x * raw.width, region.y * raw.height, region.w * raw.width, region.h * raw.height, 0, 0, crop.width, crop.height)
    for (const [type, quality] of [['image/png', undefined], ['image/jpeg', .85], ['image/jpeg', .65]] as const) {
      const blob = await new Promise<Blob | null>(resolve => crop.toBlob(resolve, type, quality))
      if (!blob || blob.size > 1_200_000) continue
      const src = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob) })
      return { src, block: { type: 'image', source: { type: 'base64', media_type: type, data: src.split(',')[1] } } }
    }
    return null
  } finally { raw.width = raw.height = crop.width = crop.height = 0 }
}
