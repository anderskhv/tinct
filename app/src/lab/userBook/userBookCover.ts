/**
 * An own book's cover as Your books, the library and the reader's book
 * switcher show it: the book's own picture at its own size, up to
 * OWN_COVER_MAX_WIDTH pixels wide, as a JPEG data: URL kept on the book's
 * record on this device. Add a book draws covers by the same rule
 * (public/lab/addbook/js/epub.js `coverImage`).
 */
import { OWN_COVER_MAX_WIDTH } from './ownShelf'

export interface DrawnCover { url: string; width: number }

/** True where this browser can draw a cover (not in a test DOM or an old browser). */
export function canDrawCover(): boolean {
  return typeof createImageBitmap === 'function' && typeof document !== 'undefined'
}

/** The picture drawn as a cover, or null when it is not a cover's shape or cannot be drawn. */
export async function drawCover(image: Blob, maxWidth = OWN_COVER_MAX_WIDTH): Promise<DrawnCover | null> {
  if (!canDrawCover()) return null
  const bitmap = await createImageBitmap(image)
  try {
    // A long strip or a sliver is not a cover.
    if (!bitmap.width || !bitmap.height || bitmap.height > bitmap.width * 3 || bitmap.width > bitmap.height * 2) return null
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(maxWidth, bitmap.width)
    canvas.height = Math.max(1, Math.round(canvas.width * bitmap.height / bitmap.width))
    const context = canvas.getContext('2d')
    if (!context) return null
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const url = canvas.toDataURL('image/jpeg', 0.88)
    return url.startsWith('data:image/jpeg') ? { url, width: canvas.width } : null
  } finally {
    bitmap.close?.()
  }
}
