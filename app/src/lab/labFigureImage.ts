/**
 * A figure's picture as the companion takes pictures: redrawn as PNG (JPEG for
 * photos, or when PNG is too large) of at most 1568 px on its long side and at
 * most 1.2 MB, white behind transparency -- the same as Add a book's picture
 * path (addbooks/web/src/js/tinct-api.js), which the Worker accepts in the
 * latest user turn of a signed-in request (worker/lib/chatImages.ts).
 */
import { figureBlob, type LabFigure } from './labFigures'

const IMAGE_SIDE = 1568
const IMAGE_BYTES = 1_200_000

export interface LabImageBlock { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }

const canvasBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality))

const blobBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(blob)
})

function decode(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')) }
    image.src = url
  })
}

/** The figure's picture as an image block for /api/chat, or null if it cannot be read. */
export async function figureImageBlock(figure: Pick<LabFigure, 'src' | 'width' | 'height'>): Promise<LabImageBlock | null> {
  const blob = await figureBlob(figure.src)
  if (!blob) return null
  let image: HTMLImageElement
  try { image = await decode(blob) } catch { return null }
  const width = image.naturalWidth || figure.width || 1024
  const height = image.naturalHeight || figure.height || 768
  const photo = blob.type === 'image/jpeg'
  const tries: Array<[string, number?]> = photo ? [['image/jpeg', 0.88], ['image/jpeg', 0.75]] : [['image/png'], ['image/jpeg', 0.9], ['image/jpeg', 0.75]]
  let scale = Math.min(1, IMAGE_SIDE / Math.max(width, height))
  for (let round = 0; round < 3; round += 1, scale *= 0.7) {
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))
    const context = canvas.getContext('2d')
    if (!context) return null
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    for (const [type, quality] of tries) {
      const out = await canvasBlob(canvas, type, quality)
      if (out && out.size <= IMAGE_BYTES) return { type: 'image', source: { type: 'base64', media_type: type, data: await blobBase64(out) } }
    }
  }
  return null
}
