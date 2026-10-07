/**
 * A picture from a reader's own EPUB, made safe to draw on any device.
 *
 * Books name their pictures loosely: a manifest type that is not the file's
 * (a PNG declared `image/jpeg`, an SVG declared `image/svg`), formats a
 * browser may not draw (TIFF, BMP), SVG files that are not well-formed XML
 * on their own (undeclared prefixes, HTML entities), and plates scanned far
 * larger than any screen (iOS Safari will not draw some of them at all).
 * Each is read for what its bytes are, checked and, where needed, redrawn
 * here, once, as the book is converted; a picture that cannot be drawn on
 * this device is reported so the reader shows its caption with a plain
 * placeholder, never a broken image.
 */

export interface PictureSize { width: number; height: number }
export interface PreparedPicture { bytes: Uint8Array; type: string; size: PictureSize | null }

/** Types every current browser draws in an <img>. */
const WEB_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
export const IMAGE_EXTENSIONS: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', jpe: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
  svg: 'image/svg+xml', svgz: 'image/svg+xml', avif: 'image/avif', bmp: 'image/bmp', dib: 'image/bmp', tif: 'image/tiff', tiff: 'image/tiff',
}
/** A picture is kept no larger than this on its long side, and this many pixels (redrawn smaller if it is). */
export const MAX_PICTURE_SIDE = 2400
export const MAX_PICTURE_PIXELS = 4_000_000
/** The file as stored after preparing it. */
export const MAX_STORED_PICTURE_BYTES = 8_000_000

const SVG_NS = 'http://www.w3.org/2000/svg'
const KNOWN_NS: Record<string, string> = {
  xlink: 'http://www.w3.org/1999/xlink',
  xml: 'http://www.w3.org/XML/1998/namespace',
  svg: SVG_NS,
}

/** What the bytes are, whatever the book calls them; '' when they are no picture we know. */
export function sniffImageType(bytes: Uint8Array): string {
  const at = (i: number) => bytes[i]
  if (bytes.length < 4) return ''
  if (at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47) return 'image/png'
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return 'image/jpeg'
  if (at(0) === 0x47 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x38) return 'image/gif'
  if (bytes.length > 12 && at(0) === 0x52 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x46 && at(8) === 0x57 && at(9) === 0x45 && at(10) === 0x42 && at(11) === 0x50) return 'image/webp'
  if (at(0) === 0x42 && at(1) === 0x4d) return 'image/bmp'
  if ((at(0) === 0x49 && at(1) === 0x49 && at(2) === 0x2a && at(3) === 0) || (at(0) === 0x4d && at(1) === 0x4d && at(2) === 0 && at(3) === 0x2a)) return 'image/tiff'
  if (bytes.length > 12 && String.fromCharCode(at(4), at(5), at(6), at(7)) === 'ftyp' && /^avi[fs]$/.test(String.fromCharCode(at(8), at(9), at(10), at(11)))) return 'image/avif'
  const head = new TextDecoder().decode(bytes.subarray(0, 2048)).replace(/^﻿/, '').trimStart()
  if (/^</.test(head) && /<svg[\s>]/i.test(head)) return 'image/svg+xml'
  return ''
}

/** Pixel size from an image's own header (PNG, GIF, JPEG, WebP, BMP, TIFF) or an SVG's attributes; null when it cannot say. */
export function imageSize(bytes: Uint8Array, type: string): PictureSize | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const at = (i: number) => bytes[i]
  try {
    if (type === 'image/svg+xml') {
      const head = new TextDecoder().decode(bytes.subarray(0, 4000))
      const tag = /<svg\b[^>]*>/i.exec(head)?.[0] || ''
      const num = (name: string) => { const m = new RegExp(`\\b${name}\\s*=\\s*["']\\s*([\\d.]+)(px)?\\s*["']`, 'i').exec(tag); return m ? parseFloat(m[1]) : NaN }
      let width = num('width'), height = num('height')
      const box = /\bviewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(tag)
      if (!(width > 0 && height > 0) && box) { width = parseFloat(box[1]); height = parseFloat(box[2]) }
      return width > 0 && height > 0 ? { width: Math.round(width), height: Math.round(height) } : null
    }
    if (at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47) return { width: view.getUint32(16), height: view.getUint32(20) }
    if (at(0) === 0x47 && at(1) === 0x49 && at(2) === 0x46) return { width: view.getUint16(6, true), height: view.getUint16(8, true) }
    if (at(0) === 0xff && at(1) === 0xd8) {
      let i = 2
      while (i + 9 < bytes.length) {
        if (at(i) !== 0xff) { i += 1; continue }
        const marker = at(i + 1)
        const length = view.getUint16(i + 2)
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) return { width: view.getUint16(i + 7), height: view.getUint16(i + 5) }
        i += 2 + length
      }
      return null
    }
    if (at(0) === 0x52 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x46 && at(8) === 0x57 && at(9) === 0x45) {
      const chunk = String.fromCharCode(at(12), at(13), at(14), at(15))
      if (chunk === 'VP8 ') return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff }
      if (chunk === 'VP8L') { const b = view.getUint32(21, true); return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 } }
      if (chunk === 'VP8X') return { width: 1 + (at(24) | at(25) << 8 | at(26) << 16), height: 1 + (at(27) | at(28) << 8 | at(29) << 16) }
    }
    if (at(0) === 0x42 && at(1) === 0x4d && bytes.length > 26) {
      const width = view.getInt32(18, true), height = Math.abs(view.getInt32(22, true))
      return width > 0 && height > 0 ? { width, height } : null
    }
    const little = at(0) === 0x49 && at(1) === 0x49
    if ((little || (at(0) === 0x4d && at(1) === 0x4d)) && view.getUint16(2, little) === 42) {
      const ifd = view.getUint32(4, little)
      const count = view.getUint16(ifd, little)
      let width = 0, height = 0
      for (let n = 0; n < count; n += 1) {
        const entry = ifd + 2 + n * 12
        const tag = view.getUint16(entry, little)
        const kind = view.getUint16(entry + 2, little)
        const value = kind === 3 ? view.getUint16(entry + 8, little) : view.getUint32(entry + 8, little)
        if (tag === 256) width = value
        if (tag === 257) height = value
      }
      return width > 0 && height > 0 ? { width, height } : null
    }
  } catch { /* a damaged header: no size */ }
  return null
}

/** The picture's type: what its bytes say, else what the book declares, else its extension. */
export function pictureType(bytes: Uint8Array, declared: string, path: string): string {
  const sniffed = sniffImageType(bytes)
  if (sniffed) return sniffed
  const named = (declared || '').toLowerCase().split(';')[0].trim()
  if (/^image\/svg/.test(named)) return 'image/svg+xml'
  if (named === 'image/jpg' || named === 'image/pjpeg') return 'image/jpeg'
  if (/^image\//.test(named)) return named
  return IMAGE_EXTENSIONS[(path.split('.').pop() || '').toLowerCase()] || ''
}

/**
 * An SVG file that draws as an <img> on its own: well-formed XML in the SVG
 * namespace. A drawing that only an HTML parser reads (entities such as
 * &nbsp;, prefixes never declared) is read that way and written back as XML;
 * null when it still is not one.
 */
export function standaloneSvg(text: string): string | null {
  if (typeof DOMParser === 'undefined') return text
  const parsedOk = (source: string) => {
    const doc = new DOMParser().parseFromString(source, 'image/svg+xml')
    const root = doc.documentElement
    return !doc.getElementsByTagName('parsererror').length && root?.localName === 'svg' && root.namespaceURI === SVG_NS
  }
  const source = text.replace(/^﻿/, '')
  if (parsedOk(source)) return source
  // Read as HTML (entities, sloppy markup), then written back as XML with every prefix declared.
  const html = new DOMParser().parseFromString(`<!doctype html><body>${source.replace(/<\?xml[^>]*\?>/i, '').replace(/<!DOCTYPE[^>[]*(\[[^\]]*\])?\s*>/i, '')}</body>`, 'text/html')
  const svg = html.querySelector('svg')
  if (!svg) return null
  for (const el of [svg, ...svg.querySelectorAll('*')]) {
    if (el.localName === 'script' || el.localName === 'foreignObject') { el.remove(); continue }
    for (const attr of [...el.attributes]) if (/^on/i.test(attr.name)) el.removeAttribute(attr.name)
  }
  let out = ''
  try { out = new XMLSerializer().serializeToString(svg) } catch { return null }
  out = declarePrefixes(out)
  return parsedOk(out) ? out : null
}

/** Adds the SVG namespace and a declaration for every prefix the root does not declare. */
export function declarePrefixes(svg: string): string {
  const open = /^<svg\b[^>]*>/i.exec(svg)?.[0]
  if (!open) return svg
  let tag = open
  if (!/\sxmlns\s*=/.test(tag)) tag = tag.replace(/^<svg/i, `<svg xmlns="${SVG_NS}"`)
  const used = new Set<string>()
  for (const match of svg.matchAll(/[\s<]([A-Za-z_][\w.-]*):[A-Za-z_][\w.-]*(?=\s*=|[\s/>])/g)) used.add(match[1])
  for (const prefix of used) {
    if (prefix === 'xmlns' || prefix === 'xml' || new RegExp(`\\sxmlns:${prefix}\\s*=`).test(svg)) continue
    tag = tag.replace(/^<svg/i, `<svg xmlns:${prefix}="${KNOWN_NS[prefix] || `urn:x-tinct:${prefix}`}"`)
  }
  return tag + svg.slice(open.length)
}

const canDecode = () => typeof createImageBitmap === 'function' && typeof document !== 'undefined'

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise(resolve => { try { canvas.toBlob(resolve, type, quality) } catch { resolve(null) } })
}

/** The picture decoded by this browser, or null when it cannot draw it. */
async function decodePicture(blob: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void } | null> {
  try {
    const bitmap = await createImageBitmap(blob)
    if (bitmap.width > 0 && bitmap.height > 0) return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close?.() }
    bitmap.close?.()
  } catch { /* some formats only an <img> decodes */ }
  if (typeof Image === 'undefined' || typeof URL.createObjectURL !== 'function') return null
  const url = URL.createObjectURL(blob)
  try {
    const image = new Image()
    image.decoding = 'async'
    image.src = url
    await image.decode()
    if (!image.naturalWidth || !image.naturalHeight) return null
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => { image.src = '' } }
  } catch { return null } finally { URL.revokeObjectURL(url) }
}

/** Redraws a decoded picture at most MAX_PICTURE_SIDE / MAX_PICTURE_PIXELS, as PNG or (photos, or when PNG is too large) JPEG. */
async function redraw(picture: NonNullable<Awaited<ReturnType<typeof decodePicture>>>, photo: boolean): Promise<PreparedPicture | null> {
  const scale = Math.min(1, MAX_PICTURE_SIDE / Math.max(picture.width, picture.height), Math.sqrt(MAX_PICTURE_PIXELS / (picture.width * picture.height)))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(picture.width * scale))
  canvas.height = Math.max(1, Math.round(picture.height * scale))
  const context = canvas.getContext('2d')
  if (!context) return null
  const tries: Array<[string, number?]> = photo ? [['image/jpeg', 0.88]] : [['image/png'], ['image/jpeg', 0.9]]
  for (const [type, quality] of tries) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    // JPEG has no transparency: a page-white ground, as print would have.
    if (type === 'image/jpeg') { context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height) }
    context.drawImage(picture.source, 0, 0, canvas.width, canvas.height)
    const blob = await canvasBlob(canvas, type, quality)
    if (!blob || !blob.size) continue
    if (blob.size > 2_500_000 && type === 'image/png') continue
    const bytes = new Uint8Array(await blob.arrayBuffer())
    return { bytes, type: blob.type || type, size: { width: canvas.width, height: canvas.height } }
  }
  return null
}

/**
 * The picture as this device will draw it, or null when it cannot be drawn
 * (the reader then shows a placeholder). Where the browser can decode, every
 * raster picture is decoded once to be sure; formats an <img> may not draw
 * and oversized plates are redrawn as PNG or JPEG. `check: false` (no
 * images are kept) only reads the type and size.
 */
export async function preparePicture(bytes: Uint8Array, type: string, options: { check?: boolean } = {}): Promise<PreparedPicture | null> {
  if (type === 'image/svg+xml') {
    if (options.check === false) return { bytes, type, size: imageSize(bytes, type) }
    const text = standaloneSvg(new TextDecoder().decode(bytes))
    if (!text) return null
    const out = new TextEncoder().encode(text)
    return { bytes: out, type, size: imageSize(out, type) }
  }
  const size = imageSize(bytes, type)
  const fits = !!size && Math.max(size.width, size.height) <= MAX_PICTURE_SIDE && size.width * size.height <= MAX_PICTURE_PIXELS
  if (options.check === false || !canDecode()) {
    // Nothing to check with (a test, a worker): web formats of a fitting size are kept as they are.
    return WEB_TYPES.has(type) || options.check === false ? { bytes, type, size } : null
  }
  const decoded = await decodePicture(new Blob([bytes as BlobPart], { type }))
  if (!decoded) return null
  try {
    if (WEB_TYPES.has(type) && fits) return { bytes, type, size: size ?? { width: decoded.width, height: decoded.height } }
    return await redraw(decoded, type === 'image/jpeg')
  } finally { decoded.close() }
}
