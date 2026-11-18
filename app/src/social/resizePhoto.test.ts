// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resizePhoto } from './socialClient'
import { PHOTO_ACCEPT } from './photoAccept'

function stubCanvas(draws: unknown[]) {
  const real = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
    if (tag !== 'canvas') return real(tag)
    return {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage: (source: unknown) => draws.push(source) }),
      toBlob: (done: (blob: Blob) => void, type: string) => done(new Blob(['jpeg'], { type })),
    } as unknown as HTMLCanvasElement
  }) as typeof document.createElement)
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('resizePhoto', () => {
  it('reads a photo createImageBitmap refuses (Safari and HEIC) through an <img>', async () => {
    const draws: unknown[] = []
    stubCanvas(draws)
    vi.stubGlobal('createImageBitmap', vi.fn(async () => { throw new DOMException('The source image could not be decoded.', 'InvalidStateError') }))
    const revoked: string[] = []
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: () => 'blob:photo', revokeObjectURL: (url: string) => revoked.push(url) }))
    Object.defineProperty(HTMLImageElement.prototype, 'decode', { configurable: true, writable: true, value: vi.fn(async () => undefined) })
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(3024)
    vi.spyOn(HTMLImageElement.prototype, 'naturalHeight', 'get').mockReturnValue(4032)
    const out = await resizePhoto(new Blob(['heic'], { type: 'image/heic' }), 'picture')
    expect(out?.type).toBe('image/jpeg')
    expect(draws).toHaveLength(1)
    expect(draws[0]).toBeInstanceOf(HTMLImageElement)
    expect(revoked).toEqual(['blob:photo'])
  })

  it('uses createImageBitmap when it can', async () => {
    const draws: unknown[] = []
    stubCanvas(draws)
    const bitmap = { width: 800, height: 600, close: vi.fn() }
    vi.stubGlobal('createImageBitmap', vi.fn(async () => bitmap))
    const out = await resizePhoto(new Blob(['jpeg'], { type: 'image/jpeg' }), 'background')
    expect(out?.type).toBe('image/jpeg')
    expect(draws).toEqual([bitmap])
    expect(bitmap.close).toHaveBeenCalled()
  })

  it('gives up quietly on a file nothing can decode', async () => {
    stubCanvas([])
    vi.stubGlobal('createImageBitmap', vi.fn(async () => { throw new Error('nope') }))
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} }))
    Object.defineProperty(HTMLImageElement.prototype, 'decode', { configurable: true, writable: true, value: vi.fn(async () => { throw new Error('EncodingError') }) })
    expect(await resizePhoto(new Blob(['?']), 'picture')).toBeNull()
  })

  it('asks the picker for JPEG, PNG or WebP, so iOS converts HEIC to JPEG', () => {
    expect(PHOTO_ACCEPT).toBe('image/jpeg,image/png,image/webp')
  })
})
