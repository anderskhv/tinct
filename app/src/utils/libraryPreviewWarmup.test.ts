import { afterEach, describe, expect, it, vi } from 'vitest'
import { warmLibraryPreview } from './libraryPreviewWarmup'
vi.mock('../worker/routes/libraryTwoRelease', () => ({ libraryEntryPath: () => '/lab/library_2/' }))
afterEach(() => vi.unstubAllGlobals())
describe('library warmup lifetime', () => {
  it('aborts active downloads and does not start another batch after leaving the page', async () => {
    let release!: () => void
    const body = new Promise<void>(resolve => { release = resolve })
    const fetcher = vi.fn(async () => ({ arrayBuffer: () => body }))
    vi.stubGlobal('fetch', fetcher)
    vi.stubGlobal('requestIdleCallback', (callback: () => void) => { callback(); return 1 })
    warmLibraryPreview()
    window.dispatchEvent(new Event('load'))
    await Promise.resolve()
    expect(fetcher).toHaveBeenCalledTimes(2)
    const signal = (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].signal
    window.dispatchEvent(new Event('pagehide'))
    expect(signal?.aborted).toBe(true)
    release()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})
