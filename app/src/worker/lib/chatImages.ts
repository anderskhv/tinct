/**
 * Pictures in signed-in companion chat (Add a book: a snipped figure or an
 * attached image). Only the latest user turn may carry them; earlier turns
 * stay text. Blocks are validated strictly and rebuilt with only the fields
 * Anthropic's Messages API defines, so nothing else reaches the provider.
 */

export const MAX_IMAGES_PER_REQUEST = 4
/** Decoded bytes per image. The client sends ≤1568 px JPEG/PNG, well under this. */
export const MAX_IMAGE_BYTES = 1_572_864
/** Body ceiling for a request that carries pictures; text-only requests keep the normal cap. */
export const MAX_IMAGE_REQUEST_BODY_BYTES = 8_000_000
/** Anthropic bills roughly width × height / 750 tokens per image, about 1,600 at most after resizing. */
export const IMAGE_TOKENS_CAP = 1_600
const MAX_TEXT_BLOCKS = 8

export const IMAGE_MEDIA_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
export type ImageMediaType = typeof IMAGE_MEDIA_TYPES[number]

export type ChatTextBlock = { type: 'text'; text: string }
export type ChatImageBlock = { type: 'image'; source: { type: 'base64'; media_type: ImageMediaType; data: string } }
export type ChatUserBlock = ChatTextBlock | ChatImageBlock

export type ParsedUserBlocks =
  | { ok: true; blocks: ChatUserBlock[]; imageTokens: number; imageCount: number }
  | { ok: false; error: 'invalid' | 'image_rejected' }

const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/
const HEADER_BASE64_CHARS = 349_528 // ≈256 KiB decoded: enough for any JPEG's SOF marker after EXIF

function exactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const own = Object.keys(value)
  return own.length === keys.length && own.every(key => keys.includes(key))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function decodedBase64Length(data: string): number {
  const padding = data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0
  return Math.floor(data.length * 3 / 4) - padding
}

function decodeHead(data: string): Uint8Array {
  const head = data.length > HEADER_BASE64_CHARS ? data.slice(0, HEADER_BASE64_CHARS - (HEADER_BASE64_CHARS % 4)) : data
  const binary = atob(head)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function sniffImageType(bytes: Uint8Array): ImageMediaType | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'image/png'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp'
  return null
}

/** Pixel size from the file header, or null when the header does not say. */
export function imageDimensions(bytes: Uint8Array, type: ImageMediaType): { width: number; height: number } | null {
  const u16be = (i: number) => (bytes[i] << 8) | bytes[i + 1]
  const u32be = (i: number) => ((bytes[i] << 24) >>> 0) + (bytes[i + 1] << 16) + (bytes[i + 2] << 8) + bytes[i + 3]
  const u16le = (i: number) => bytes[i] | (bytes[i + 1] << 8)
  const u24le = (i: number) => bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16)
  const ok = (width: number, height: number) => (width > 0 && height > 0 ? { width, height } : null)
  if (type === 'image/png') {
    // IHDR is always the first chunk.
    if (bytes.length < 24 || String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]) !== 'IHDR') return null
    return ok(u32be(16), u32be(20))
  }
  if (type === 'image/jpeg') {
    let i = 2
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) { i++; continue }
      const marker = bytes[i + 1]
      if (marker === 0xff) { i++; continue }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue }
      if (marker === 0xd9 || marker === 0xda) return null
      const length = u16be(i + 2)
      // SOF0–SOF15 except DHT (C4), JPG (C8) and DAC (CC).
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return ok(u16be(i + 7), u16be(i + 5))
      }
      if (length < 2) return null
      i += 2 + length
    }
    return null
  }
  // WebP: VP8 (lossy), VP8L (lossless) or VP8X (extended).
  if (bytes.length < 30) return null
  const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15])
  if (chunk === 'VP8X') return ok(u24le(24) + 1, u24le(27) + 1)
  if (chunk === 'VP8L') {
    if (bytes[20] !== 0x2f) return null
    const b = bytes
    return ok(1 + (((b[22] & 0x3f) << 8) | b[21]), 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)))
  }
  if (chunk === 'VP8 ') return ok(u16le(26) & 0x3fff, u16le(28) & 0x3fff)
  return null
}

/** Estimated input tokens for one picture: width × height / 750, capped. Unknown size counts as the cap. */
export function imageTokenEstimate(size: { width: number; height: number } | null): number {
  if (!size) return IMAGE_TOKENS_CAP
  return Math.min(IMAGE_TOKENS_CAP, Math.max(1, Math.ceil((size.width * size.height) / 750)))
}

function parseImage(raw: Record<string, unknown>): { block: ChatImageBlock; tokens: number } | null {
  if (!exactKeys(raw, ['type', 'source']) || !isRecord(raw.source)) return null
  const source = raw.source
  if (!exactKeys(source, ['type', 'media_type', 'data'])) return null
  if (source.type !== 'base64' || typeof source.data !== 'string') return null
  const mediaType = source.media_type
  if (typeof mediaType !== 'string' || !(IMAGE_MEDIA_TYPES as readonly string[]).includes(mediaType)) return null
  const data = source.data
  if (data.length < 16 || data.length % 4 !== 0 || !BASE64_RE.test(data)) return null
  if (decodedBase64Length(data) > MAX_IMAGE_BYTES) return null
  let head: Uint8Array
  try { head = decodeHead(data) } catch { return null }
  if (sniffImageType(head) !== mediaType) return null
  return {
    block: { type: 'image', source: { type: 'base64', media_type: mediaType as ImageMediaType, data } },
    tokens: imageTokenEstimate(imageDimensions(head, mediaType as ImageMediaType)),
  }
}

/** True when a message's content is an array holding at least one image block. */
export function contentHasImage(content: unknown): boolean {
  return Array.isArray(content) && content.some(block => isRecord(block) && block.type === 'image')
}

/**
 * Validates the latest user turn's block array: text blocks and up to
 * MAX_IMAGES_PER_REQUEST base64 PNG/JPEG/WebP images whose bytes match their
 * stated type. Text is trimmed to `maxTextChars` in total.
 */
export function parseUserBlocks(content: unknown[], maxTextChars: number): ParsedUserBlocks {
  if (content.length === 0) return { ok: false, error: 'invalid' }
  const blocks: ChatUserBlock[] = []
  let images = 0
  let texts = 0
  let textChars = 0
  let imageTokens = 0
  for (const raw of content) {
    if (!isRecord(raw)) return { ok: false, error: 'invalid' }
    if (raw.type === 'text') {
      if (!exactKeys(raw, ['type', 'text']) || typeof raw.text !== 'string') return { ok: false, error: 'invalid' }
      if (++texts > MAX_TEXT_BLOCKS) return { ok: false, error: 'invalid' }
      const text = raw.text.slice(0, Math.max(0, maxTextChars - textChars))
      textChars += text.length
      if (text) blocks.push({ type: 'text', text })
    } else if (raw.type === 'image') {
      if (++images > MAX_IMAGES_PER_REQUEST) return { ok: false, error: 'image_rejected' }
      const image = parseImage(raw)
      if (!image) return { ok: false, error: 'image_rejected' }
      imageTokens += image.tokens
      blocks.push(image.block)
    } else {
      return { ok: false, error: 'invalid' }
    }
  }
  if (texts === 0 || textChars === 0) return { ok: false, error: 'invalid' }
  return { ok: true, blocks, imageTokens, imageCount: images }
}

/** The text of a message, string or blocks (images contribute nothing). */
export function messageText(content: string | ChatUserBlock[]): string {
  if (typeof content === 'string') return content
  return content.filter((block): block is ChatTextBlock => block.type === 'text').map(block => block.text).join('\n')
}
