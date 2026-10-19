// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { drawnSize, photoUploadMessage, preparePhoto, PHOTO_MAX_BYTES, PHOTO_MAX_SIDE, PHOTO_SLOT_SIZE } from './socialClient'
import { PHOTO_COPY } from './photoFile'

/** A JPEG header (SOI, APP0, SOF0 with the size). */
function jpegHeader(width: number, height: number): Uint8Array {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xc0, 0, 17, 8, height >> 8, height & 0xff, width >> 8, width & 0xff, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1, 0xff, 0xda, 0, 12])
}
const heicHeader = () => new Uint8Array([0, 0, 0, 24, ...[...'ftypheic'].map(c => c.charCodeAt(0)), 0, 0, 0, 0, ...[...'mif1heic'].map(c => c.charCodeAt(0))])

interface CanvasRecord { width: number; height: number; draws: unknown[]; qualities: number[]; smoothing?: string }

/** A canvas whose encoder answers `sizes` in turn (the last one repeats). */
function stubCanvas(sizes: number[] = [100_000]) {
  const canvases: CanvasRecord[] = []
  const real = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
    if (tag !== 'canvas') return real(tag)
    const record: CanvasRecord = { width: 0, height: 0, draws: [], qualities: [] }
    canvases.push(record)
    const context = { drawImage: (source: unknown) => record.draws.push(source), set imageSmoothingQuality(value: string) { record.smoothing = value }, imageSmoothingEnabled: false }
    return {
      get width() { return record.width }, set width(v: number) { record.width = v },
      get height() { return record.height }, set height(v: number) { record.height = v },
      getContext: () => context,
      toBlob: (done: (blob: Blob) => void, type: string, quality: number) => {
        record.qualities.push(quality)
        const size = sizes[Math.min(record.qualities.length - 1, sizes.length - 1)]
        done(new Blob([new Uint8Array(size)], { type }))
      },
    } as unknown as HTMLCanvasElement
  }) as typeof document.createElement)
  return canvases
}

function noImgDecode() {
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} }))
  Object.defineProperty(HTMLImageElement.prototype, 'decode', { configurable: true, writable: true, value: vi.fn(async () => { throw new Error('EncodingError') }) })
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('preparePhoto: a 50 MP photo on a phone', () => {
  it('decodes a large JPEG straight at the drawn size (createImageBitmap resize), never full size', async () => {
    const canvases = stubCanvas()
    const small = { width: 683, height: 512, close: vi.fn() }
    const decode = vi.fn(async (_file: Blob, options?: ImageBitmapOptions) => {
      if (!options?.resizeWidth) throw new Error('a full-size decode was asked for')
      return small
    })
    vi.stubGlobal('createImageBitmap', decode)
    const file = new File([jpegHeader(8160, 6120), new Uint8Array(1000)], '50mp.jpg', { type: 'image/jpeg' })
    const out = await preparePhoto(file, 'picture')
    expect(out.ok).toBe(true)
    expect(decode).toHaveBeenCalledTimes(1)
    expect(decode.mock.calls[0][1]).toEqual({ resizeWidth: 683, resizeQuality: 'high' })
    // One canvas, the slot's size; drawn from the small bitmap.
    expect(canvases.map(c => [c.width, c.height])).toEqual([[512, 512]])
    expect(canvases[0].draws).toEqual([small])
    expect(canvases[0].smoothing).toBe('high')
    expect(small.close).toHaveBeenCalled()
  })

  it('a background is decoded to cover 1600 × 800, whichever side is the tighter', async () => {
    stubCanvas()
    const decode = vi.fn(async () => ({ width: 1600, height: 1200, close: () => {} }))
    vi.stubGlobal('createImageBitmap', decode)
    await preparePhoto(new Blob([jpegHeader(8160, 6120)]), 'background')
    expect(decode.mock.calls[0][1]).toEqual({ resizeWidth: 1600, resizeQuality: 'high' })
    // A wide panorama: the height decides.
    expect(drawnSize({ width: 12000, height: 3000 }, 1600, 800)).toEqual({ width: 3200, height: 800 })
    // Already small enough: decoded as it is.
    expect(drawnSize({ width: 1200, height: 900 }, 1600, 800)).toBeNull()
  })

  it('falls back to a full-size bitmap where the resize options are refused', async () => {
    const canvases = stubCanvas()
    const full = { width: 8160, height: 6120, close: vi.fn() }
    const decode = vi.fn(async (_file: Blob, options?: ImageBitmapOptions) => { if (options) throw new TypeError('unsupported'); return full })
    vi.stubGlobal('createImageBitmap', decode)
    const out = await preparePhoto(new Blob([jpegHeader(8160, 6120)]), 'background')
    expect(out.ok).toBe(true)
    expect(decode).toHaveBeenCalledTimes(2)
    expect(canvases.map(c => [c.width, c.height])).toEqual([[1600, 800]])
    expect(canvases[0].draws).toEqual([full])
  })
})

describe('preparePhoto: always within the Worker’s limits (2 MB, 2400 px)', () => {
  it('both slots are drawn within 2400 px', () => {
    for (const [width, height] of Object.values(PHOTO_SLOT_SIZE)) {
      expect(width).toBeLessThanOrEqual(PHOTO_MAX_SIDE)
      expect(height).toBeLessThanOrEqual(PHOTO_MAX_SIDE)
    }
    expect(PHOTO_MAX_BYTES).toBe(2_000_000)
    expect(PHOTO_MAX_SIDE).toBe(2400)
  })

  it('encodes again at a lower quality until the JPEG is under 2 MB', async () => {
    const canvases = stubCanvas([2_600_000, 2_100_000, 1_400_000])
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 1600, height: 800, close: () => {} })))
    const out = await preparePhoto(new Blob(['noise']), 'background')
    expect(out.ok && out.image.size).toBe(1_400_000)
    expect(out.ok && out.image.type).toBe('image/jpeg')
    expect(canvases[0].qualities).toEqual([0.86, 0.72, 0.58])
  })

  it('says it is too large rather than sending what the Worker refuses', async () => {
    stubCanvas([2_500_000])
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 1600, height: 800, close: () => {} })))
    expect(await preparePhoto(new Blob(['noise']), 'background')).toEqual({ ok: false, message: PHOTO_COPY.tooLarge })
  })

  it('refuses an encoder that does not give a JPEG (the Worker accepts JPEG only)', async () => {
    const real = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => tag !== 'canvas' ? real(tag) : ({
      width: 0, height: 0, getContext: () => ({ drawImage: () => {} }),
      toBlob: (done: (blob: Blob) => void) => done(new Blob(['png'], { type: 'image/png' })),
    } as unknown as HTMLCanvasElement)) as typeof document.createElement)
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 800, height: 800, close: () => {} })))
    expect(await preparePhoto(new Blob(['x']), 'picture')).toEqual({ ok: false, message: PHOTO_COPY.unprepared })
  })
})

describe('preparePhoto: a specific line for every photo that cannot be used', () => {
  it('HEIC that neither createImageBitmap nor <img> can read (Chrome and Edge on Windows, Chrome on Mac and Android)', async () => {
    stubCanvas()
    vi.stubGlobal('createImageBitmap', vi.fn(async () => { throw new DOMException('The source image could not be decoded.', 'InvalidStateError') }))
    noImgDecode()
    // As Windows reports it (no type) and as Android does.
    for (const file of [new File([heicHeader()], 'IMG_0001.HEIC'), new File([heicHeader()], 'photo.heic', { type: 'image/heic' })]) {
      expect(await preparePhoto(file, 'picture')).toEqual({ ok: false, message: 'This photo’s format can’t be read here. Try a screenshot of it.' })
    }
  })

  it('a file that is not a photo, and a JPEG that will not decode, each say so', async () => {
    stubCanvas()
    vi.stubGlobal('createImageBitmap', vi.fn(async () => { throw new Error('nope') }))
    noImgDecode()
    expect(await preparePhoto(new Blob(['%PDF-1.7']), 'picture')).toEqual({ ok: false, message: PHOTO_COPY.notAPhoto })
    expect(await preparePhoto(new Blob([jpegHeader(9000, 7000)]), 'picture')).toEqual({ ok: false, message: PHOTO_COPY.unreadable })
  })

  it('a file whose bytes cannot be read (a cloud photo not yet on the device)', async () => {
    stubCanvas()
    vi.stubGlobal('createImageBitmap', vi.fn(async () => { throw new Error('NotReadableError') }))
    noImgDecode()
    const cloud = { size: 4_000_000, type: 'image/jpeg', slice: () => ({ arrayBuffer: async () => { throw new Error('NotReadableError') } }) } as unknown as Blob
    expect(await preparePhoto(cloud, 'picture')).toEqual({ ok: false, message: PHOTO_COPY.unreadable })
  })

  it('a canvas that cannot draw', async () => {
    const real = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => tag !== 'canvas' ? real(tag) : ({ width: 0, height: 0, getContext: () => null } as unknown as HTMLCanvasElement)) as typeof document.createElement)
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 800, height: 800, close: () => {} })))
    expect(await preparePhoto(new Blob(['x']), 'picture')).toEqual({ ok: false, message: PHOTO_COPY.unprepared })
  })

  it('an upload that fails says why: the Worker’s line, signed out, uploads off, else the save error', () => {
    const fallback = 'That did not save. Please try again.'
    expect(photoUploadMessage({ ok: false, reason: 'invalid', message: 'That picture is too large.' }, fallback)).toBe('That picture is too large.')
    expect(photoUploadMessage({ ok: false, reason: 'signed_out' }, fallback)).toBe(PHOTO_COPY.signedOut)
    expect(photoUploadMessage({ ok: false, reason: 'off' }, fallback)).toBe(PHOTO_COPY.off)
    expect(photoUploadMessage({ ok: false, reason: 'unavailable' }, fallback)).toBe(PHOTO_COPY.off)
    expect(photoUploadMessage({ ok: false, reason: 'failed' }, fallback)).toBe(fallback)
  })
})
