/**
 * What a chosen photo is, read from its first bytes: its format (the file's
 * name and type are not trusted: Windows and Android often report none) and,
 * for JPEG, PNG, WebP and GIF, its size as shown (a JPEG's EXIF rotation
 * applied). The size lets the photo be decoded straight at the size it is
 * drawn (createImageBitmap's resize), so a 50 MP photo never becomes a
 * 200 MB bitmap on a phone.
 */

export type PhotoKind = 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'heic' | 'avif' | 'tiff'

/** Formats a browser may simply not read (HEIC outside Safari, AVIF on old browsers, TIFF outside Safari). */
export const MAYBE_UNREADABLE: ReadonlySet<PhotoKind> = new Set(['heic', 'avif', 'tiff'])

/** How much of the file is read for its format and size: past a JPEG's EXIF and maker notes. */
export const HEAD_BYTES = 512 * 1024

/** The reader-facing lines when a photo cannot be used, in the cards' own wording. */
export const PHOTO_COPY = {
  /** HEIC on Chrome or Edge, and other formats this browser cannot draw. */
  unreadableFormat: 'This photo’s format can’t be read here. Try a screenshot of it.',
  /** A file that is not a photo at all. */
  notAPhoto: 'Please choose a JPEG, PNG or WebP photo.',
  /** A known format that would not decode: damaged, still in the cloud, or too big for this device. */
  unreadable: 'This photo could not be read here. Try a smaller copy or a screenshot of it.',
  /** Decoded, but the browser would not draw or encode it. */
  unprepared: 'This photo could not be prepared here. Try a screenshot of it.',
  /** The Worker could not process the prepared photo (its 415; 19 Oct 2026: it said the same as notAPhoto). */
  unprocessed: 'This photo could not be processed. Try a screenshot of it.',
  /** After an upload: every uploaded picture and background waits for review. */
  approval: 'Others see your photo once it’s approved.',
  /** Still over the upload limit at the lowest quality (as the Worker words it). */
  tooLarge: 'That picture is too large.',
  /** The upload switch is off or the store is unavailable. */
  off: 'Photo uploads are not available right now.',
  signedOut: 'Please sign in again to upload a photo.',
} as const

const ascii = (bytes: Uint8Array, at: number, length: number) => String.fromCharCode(...bytes.subarray(at, at + length))

const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1', 'mif2'])
const AVIF_BRANDS = new Set(['avif', 'avis'])

/** The photo's format from its first bytes, or null when it is not a photo this page knows. */
export function sniffPhoto(bytes: Uint8Array): PhotoKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg'
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 3) === 'PNG') return 'png'
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp'
  if (bytes.length >= 6 && (ascii(bytes, 0, 6) === 'GIF87a' || ascii(bytes, 0, 6) === 'GIF89a')) return 'gif'
  if (bytes.length >= 2 && ascii(bytes, 0, 2) === 'BM') return 'bmp'
  if (bytes.length >= 4 && (ascii(bytes, 0, 4) === 'II*\0' || ascii(bytes, 0, 4) === 'MM\0*')) return 'tiff'
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'ftyp') {
    // ISO media: the major brand, then the compatible brands to the end of the ftyp box.
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    const boxEnd = Math.min(bytes.length, view.getUint32(0) || bytes.length)
    const brands = [ascii(bytes, 8, 4)]
    for (let at = 16; at + 4 <= boxEnd; at += 4) brands.push(ascii(bytes, at, 4))
    if (brands.some(brand => AVIF_BRANDS.has(brand))) return 'avif'
    if (brands.some(brand => HEIC_BRANDS.has(brand))) return 'heic'
  }
  return null
}

export interface PhotoSize { width: number; height: number }

/** The photo's size as shown (EXIF rotation applied), or null when the header does not say. */
export function photoSize(bytes: Uint8Array, kind: PhotoKind | null = sniffPhoto(bytes)): PhotoSize | null {
  try {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    const size = kind === 'jpeg' ? jpegSize(bytes, view)
      : kind === 'png' && ascii(bytes, 12, 4) === 'IHDR' ? { width: view.getUint32(16), height: view.getUint32(20) }
        : kind === 'webp' ? webpSize(bytes, view)
          : kind === 'gif' ? { width: view.getUint16(6, true), height: view.getUint16(8, true) }
            : null
    return size && size.width > 0 && size.height > 0 ? size : null
  } catch {
    return null
  }
}

function jpegSize(bytes: Uint8Array, view: DataView): PhotoSize | null {
  let orientation = 1
  let at = 2
  while (at + 4 <= bytes.length) {
    if (bytes[at] !== 0xff) return null
    const marker = bytes[at + 1]
    if (marker === 0xff) { at += 1; continue }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { at += 2; continue }
    if (marker === 0xd9 || marker === 0xda) return null
    const length = view.getUint16(at + 2)
    if (marker === 0xe1 && ascii(bytes, at + 4, 6) === 'Exif\0\0') orientation = exifOrientation(view, at + 10, at + 2 + length) ?? orientation
    // SOF0–SOF15, except DHT (C4), JPG (C8) and DAC (CC).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = view.getUint16(at + 5)
      const width = view.getUint16(at + 7)
      return orientation >= 5 && orientation <= 8 ? { width: height, height: width } : { width, height }
    }
    at += 2 + length
  }
  return null
}

function exifOrientation(view: DataView, tiff: number, end: number): number | null {
  if (tiff + 8 > end) return null
  const little = view.getUint16(tiff) === 0x4949
  const ifd = tiff + view.getUint32(tiff + 4, little)
  if (ifd + 2 > end) return null
  const count = view.getUint16(ifd, little)
  for (let i = 0; i < count; i++) {
    const entry = ifd + 2 + i * 12
    if (entry + 12 > end) return null
    if (view.getUint16(entry, little) === 0x0112) return view.getUint16(entry + 8, little)
  }
  return null
}

function webpSize(bytes: Uint8Array, view: DataView): PhotoSize | null {
  const chunk = ascii(bytes, 12, 4)
  if (chunk === 'VP8 ' && bytes.length >= 30) return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff }
  if (chunk === 'VP8L' && bytes.length >= 25) {
    const bits = view.getUint32(21, true)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }
  if (chunk === 'VP8X' && bytes.length >= 30) {
    const w = bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)
    const h = bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)
    return { width: w + 1, height: h + 1 }
  }
  return null
}

/** The first bytes of a file (empty when they cannot be read, e.g. a cloud file not yet on the device). */
export async function readHead(file: Blob, length = HEAD_BYTES): Promise<Uint8Array> {
  try {
    const part = file.slice(0, length)
    return new Uint8Array(await part.arrayBuffer())
  } catch {
    return new Uint8Array(0)
  }
}
