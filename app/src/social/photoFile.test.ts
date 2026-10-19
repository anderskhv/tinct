import { describe, expect, it } from 'vitest'
import { photoSize, readHead, sniffPhoto } from './photoFile'
import { isAppleTouchDevice, photoAccept, PHOTO_ACCEPT, PHOTO_ACCEPT_WIDE } from './photoAccept'

/** A JPEG header: SOI, optional EXIF APP1 with an orientation, then SOF0 with the size. */
function jpegHeader(width: number, height: number, orientation?: number): Uint8Array {
  const parts: number[] = [0xff, 0xd8]
  if (orientation) {
    // TIFF, big-endian: header (8), IFD0 with one entry (2 + 12 + 4).
    const tiff = [0x4d, 0x4d, 0x00, 0x2a, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, orientation, 0, 0, 0, 0, 0, 0]
    const body = [...'Exif'].map(c => c.charCodeAt(0)).concat([0, 0], tiff)
    const length = body.length + 2
    parts.push(0xff, 0xe1, length >> 8, length & 0xff, ...body)
  }
  // An APP0 (JFIF) before SOF, as cameras write.
  parts.push(0xff, 0xe0, 0, 16, ...[...'JFIF'].map(c => c.charCodeAt(0)), 0, 1, 1, 0, 0, 1, 0, 1, 0, 0)
  parts.push(0xff, 0xc0, 0, 17, 8, height >> 8, height & 0xff, width >> 8, width & 0xff, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1)
  parts.push(0xff, 0xda, 0, 12)
  return new Uint8Array(parts)
}

const bytes = (...values: Array<number | string>) => new Uint8Array(values.flatMap(v => (typeof v === 'string' ? [...v].map(c => c.charCodeAt(0)) : [v])))
const u32be = (n: number) => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]

describe('the photo pickers’ accept list, per platform', () => {
  const IPHONE = { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', platform: 'iPhone', maxTouchPoints: 5 }
  const IPHONE_CHROME = { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0 Mobile/15E148 Safari/604.1', platform: 'iPhone', maxTouchPoints: 5 }
  const IPAD_DESKTOP = { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15', platform: 'MacIntel', maxTouchPoints: 5 }
  const MAC_SAFARI = { ...IPAD_DESKTOP, maxTouchPoints: 0 }
  const MAC_CHROME = { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36', platform: 'MacIntel', maxTouchPoints: 0 }
  const WINDOWS = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36 Edg/129.0', platform: 'Win32', maxTouchPoints: 0 }
  const SAMSUNG = { userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36', platform: 'Linux armv81', maxTouchPoints: 5 }
  const ANDROID_APP = { userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0 Mobile Safari/537.36', platform: 'Linux aarch64', maxTouchPoints: 5 }

  it('iPhone and iPad (also an iPad presenting as a Mac, and Chrome on iOS) never name HEIC, so iOS converts to JPEG', () => {
    for (const nav of [IPHONE, IPHONE_CHROME, IPAD_DESKTOP]) {
      expect(isAppleTouchDevice(nav)).toBe(true)
      expect(photoAccept(nav)).toBe('image/jpeg,image/png,image/webp')
      expect(photoAccept(nav)).not.toMatch(/heic|heif/i)
    }
  })

  it('Windows, Mac, Android and the Android app name HEIC by type and extension, so a HEIC photo can be chosen', () => {
    for (const nav of [MAC_SAFARI, MAC_CHROME, WINDOWS, SAMSUNG, ANDROID_APP]) {
      expect(isAppleTouchDevice(nav)).toBe(false)
      expect(photoAccept(nav)).toBe('image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif')
    }
    expect(photoAccept(undefined)).toBe(PHOTO_ACCEPT_WIDE)
  })

  it('has no spaces (Android’s WebView passes each piece to the picker untrimmed)', () => {
    for (const list of [PHOTO_ACCEPT, PHOTO_ACCEPT_WIDE]) expect(list).not.toMatch(/\s/)
  })
})

describe('sniffPhoto and photoSize: the format and size from the first bytes', () => {
  it('reads a JPEG’s size, with EXIF rotation 5–8 swapping it', () => {
    expect(sniffPhoto(jpegHeader(8160, 6120))).toBe('jpeg')
    expect(photoSize(jpegHeader(8160, 6120))).toEqual({ width: 8160, height: 6120 })
    expect(photoSize(jpegHeader(8160, 6120, 1))).toEqual({ width: 8160, height: 6120 })
    expect(photoSize(jpegHeader(8160, 6120, 6))).toEqual({ width: 6120, height: 8160 })
    expect(photoSize(jpegHeader(8160, 6120, 8))).toEqual({ width: 6120, height: 8160 })
  })

  it('reads PNG, WebP (lossy, lossless, extended) and GIF sizes', () => {
    const png = bytes(0x89, 'PNG', 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 'IHDR', ...u32be(9000), ...u32be(7000))
    expect(sniffPhoto(png)).toBe('png')
    expect(photoSize(png)).toEqual({ width: 9000, height: 7000 })
    const vp8 = bytes('RIFF', 0, 0, 0, 0, 'WEBP', 'VP8 ', 0, 0, 0, 0, 0, 0, 0, 0x9d, 0x01, 0x2a, 4000 & 0xff, 4000 >> 8, 3000 & 0xff, 3000 >> 8)
    expect(sniffPhoto(vp8)).toBe('webp')
    expect(photoSize(vp8)).toEqual({ width: 4000, height: 3000 })
    const w = 4000 - 1, h = 3000 - 1, bits = w | (h << 14)
    const vp8l = bytes('RIFF', 0, 0, 0, 0, 'WEBP', 'VP8L', 0, 0, 0, 0, 0x2f, bits & 0xff, (bits >> 8) & 0xff, (bits >> 16) & 0xff, (bits >>> 24) & 0xff)
    expect(photoSize(vp8l)).toEqual({ width: 4000, height: 3000 })
    const vp8x = bytes('RIFF', 0, 0, 0, 0, 'WEBP', 'VP8X', 10, 0, 0, 0, 0, 0, 0, 0, w & 0xff, (w >> 8) & 0xff, 0, h & 0xff, (h >> 8) & 0xff, 0)
    expect(photoSize(vp8x)).toEqual({ width: 4000, height: 3000 })
    expect(photoSize(bytes('GIF89a', 0x20, 0x03, 0x58, 0x02))).toEqual({ width: 800, height: 600 })
  })

  it('knows HEIC and AVIF by their ftyp brands, and says nothing of what it does not know', () => {
    const ftyp = (major: string, ...compatible: string[]) => bytes(...u32be(16 + compatible.length * 4), 'ftyp', major, 0, 0, 0, 0, ...compatible)
    expect(sniffPhoto(ftyp('heic', 'mif1', 'heic'))).toBe('heic')
    expect(sniffPhoto(ftyp('mif1', 'heic'))).toBe('heic')
    expect(sniffPhoto(ftyp('avif', 'mif1', 'miaf'))).toBe('avif')
    expect(sniffPhoto(ftyp('isom', 'mp41'))).toBeNull()
    expect(sniffPhoto(bytes('%PDF-1.7'))).toBeNull()
    expect(sniffPhoto(new Uint8Array(0))).toBeNull()
    expect(photoSize(ftyp('heic'))).toBeNull()
    expect(photoSize(bytes(0xff, 0xd8, 0xff))).toBeNull()
  })

  it('reads only the head of the file, and an empty head when the file cannot be read', async () => {
    expect([...await readHead(new Blob([new Uint8Array([1, 2, 3, 4, 5])]), 3)]).toEqual([1, 2, 3])
    const broken = { slice: () => ({ arrayBuffer: async () => { throw new Error('NotReadableError') } }) } as unknown as Blob
    expect(await readHead(broken)).toHaveLength(0)
  })
})
